require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const USER_ALREADY_EXISTS = (login) => `Пользователь ${login} уже существует`;
const REGISTRATION_ERROR = 'Ошибка регистрации пользователя';
const USERS_NOT_EXISTS = 'Такого пользователя не существует';
const WRONG_LOGIN = 'Логин или пароль неверный';
const ERROR_LOGIN = 'Не удалось авторизоваться';
const ERROR_TEAM = 'Не удалось загрузить команду';
const ERROR_ME = 'Не удалось получить данные аккаунта'

const createToken = ({ _id, login, name, surname, patronymic, lead }) => jwt.sign(
    { id: _id, login, name, surname, patronymic, lead },
    process.env.SECRET_KEY,
    { expiresIn: '12h' }
);

class UserController {
    async me(req, res) {
        try{
            res.json({token: createToken(await User.findById(req.user.id).populate("lead"))});
        }catch (err){
            console.log(err);
            return res.status(500).json({message: ERROR_ME});
        }
    }
    async profiles(req, res) {
        try{
            const profiles = await User.find().select("-password").populate("lead");
            return res.json({ profiles });
        }catch (err) {
            console.log(err);
            return res.status(500).json({ message: ERROR_TEAM });
        }
    }

    async addOrRemoveTeam(req, res) {
        try{
            const { id } = req.params;
            const profile = await User.findById(req.user.id).select("-password");
            if(profile.lead.find( user => user._id.equals(id)))
                profile.lead = profile.lead.filter( user => !user._id.equals(id));
            else
                profile.lead.push(await User.findById(id));
            await(await profile.save()).populate("lead");
            return res.json({ profile });
        }catch (err){
            console.log(err);
            return res.status(500).json({ message: ERROR_LOGIN });
        }
    }

    async login(req, res) {
        try{
            const validBodyFields = validationResult(req);
            if(!validBodyFields.isEmpty()) return res.status(400).json({message: validBodyFields});
            const { login, password } = req.body;
            const user = await User.findOne({ login }).populate("lead");
            if(!user) return res.status(400).json({ message: USERS_NOT_EXISTS });
            if(!bcrypt.compareSync(password, user.password)) return res.status(400).json({ message: WRONG_LOGIN });
            const token = await createToken(user);
            return res.json({ token });
        }catch (err) {
            return res.status(500).json({ message: ERROR_LOGIN })
        }
    }

    async registration(req, res) {
        try{
            const validBodyFields = validationResult(req);
            if(!validBodyFields.isEmpty()) return res.status(400).json({ message: validBodyFields });
            const { login, password, name, surname, patronymic } = req.body;
            const candidate = await User.findOne({ login });
            if (candidate) return  res.status(400).json({ message: USER_ALREADY_EXISTS(login) });
            const hashPassword = await bcrypt.hash(password, 8);
            const user = new User({ login, password: hashPassword, name, surname, patronymic });
            await user.save();
            const token = await createToken(user)
            return res.json({ token });
        }catch (err) {
            console.log(err);
            res.status(500).json({message: REGISTRATION_ERROR})
        }
     }
}
module.exports = new UserController
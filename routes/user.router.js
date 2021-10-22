const Router = require('express');
const router = new Router();
const userController = require('../controllers/user.controller');
const { check } = require('express-validator');
const auth = require('../middlewares/auth.middleware');

const ROUTES = {
    profiles: '/',
    me: '/me',
    login: '/login',
    registration: '/registration',
    team: '/team',
}
const EMPTY = {
    'login': 'Пустой или некоректный логин',
    'password': 'Пустой или короткий пароль (Должен быть длиннее 6 и короче 12 символов)',
    'name': 'Имя должно быть заполнено',
}

router.get(ROUTES.me, auth, userController.me);
router.get(ROUTES.profiles, userController.profiles);
router.get(`${ROUTES.team}/:id`, auth, userController.addOrRemoveTeam);
router.post(ROUTES.login,
    [
        check('login', EMPTY.login ).notEmpty(),
        check('password', EMPTY.password ).notEmpty(),
    ],
    userController.login
);
router.post(ROUTES.registration,
    [
        check('login', EMPTY.login ).notEmpty(),
        check('password', EMPTY.password ).notEmpty().isLength({ min: 6, max: 12}),
        check('name', EMPTY.name ).notEmpty()
            ],
    userController.registration
);


module.exports = router;
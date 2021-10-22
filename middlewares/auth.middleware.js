require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    if( req.method !== 'OPTIONS' ) {

        try {
            const token = req.headers.authorization.split(" ").pop();
            const user = jwt.decode(token, process.env.SECRET_KEY);
            req.user = user;
            req.auth = true;
            req.role = user.role;
            next();
        }catch (e) {
            console.log(e);
            return res.status(401).json({ message: 'Не авторизованы' })
        }
    }
}
const Router = require('express');
const taskController = require('../controllers/task.controller');
const auth = require('../middlewares/auth.middleware');

const router = new Router();

const ROUTES = {
    list: '/',
    create: '/create',
    update: '/update',
    remove: '/remove',
}

router.get(ROUTES.list, auth, taskController.list);
router.post(ROUTES.create, auth, taskController.create);
router.patch(`${ROUTES.update}/:id`, auth, taskController.patch);
router.delete(`${ROUTES.remove}/:id`, auth, taskController.delete);

module.exports = router;
require('dotenv').config();
const Router = require('express');
const useRouter = require('./user.router');
const taskRouter = require('./task.router');

const rootRouter = new Router();
const pathApi = process.env.API_PATH || '/api/v1';
const ROOT_ROUTES = {
    user: pathApi+'/user',
    task: pathApi+'/task',
}

rootRouter.use(ROOT_ROUTES.user, useRouter);
rootRouter.use(ROOT_ROUTES.task, taskRouter);

module.exports = rootRouter;

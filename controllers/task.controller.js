const moment = require('moment');
const Task = require('../models/Task');
const { Types } = require('mongoose');

const MESSAGES = {
    loadError: 'Не удалось загрузить задачи',
    createError: ' Не удалось создать задачу',
    endTimeError: 'Придумайте машину времени, что бы завершать раньше чем начинаете =)',
    updateError: 'Не удалось отредактировать задачу',
    removeTaskOwner: 'Вы не можете удалять чужие задачи',
    removeError: ' Не удалось удалить задачу',
    patch: 'Ошибка редактирования задачи'
}
const STATUSES = {
    implementation: 'implementation',
    progress: 'progress',
    completed: 'completed',
    canceled: 'canceled',
}
const DATA_FILTER = {
    all: "all",
    day: "day",
    week: "week",
    more: "more",
}

// const loadList =(status, perPage) => {
//    Task.find({status}).sort("-create_date").populate("author").populate("responsible").exec(
//         (err, tasks) => {
//             Task.count().exec((err, count) => {
//                 return { tasks, page: 1, count, pages: Math.ceil(count / perPage) };
//             })
//         });
// };

const toTimestamp = (time) => Number(new Date(time).getTime());

class TaskController {

    async list (req, res) {
        try{
            const perPage = 10;
            const filter = req.query.filter || DATA_FILTER.all;
            let team = {};
            if (req.query.team) team = {"responsible": {$in: [Types.ObjectId(req.query.team)]}};
            const filtersArray = {
                all: {},
                day: {end_date: {$gte: moment().startOf('day'), $lte: moment().endOf('day')}},
                week: {end_date: {$gte: moment().startOf('week'), $lte: moment().endOf('week')}},
                more: {end_date: {$gte: moment().startOf('week')}},
            };
            let tasksLoaded = {};
            for(const [ _ , status ] of Object.entries(STATUSES)) {
               tasksLoaded[status] = {};
               tasksLoaded[status].tasks = await Task
                                            .find({status, ...filtersArray[filter], ...team})
                                            .sort("-end_date")
                                            .populate("author")
                                            .populate("responsible");
               tasksLoaded[status].count = await Task.find({status}).count();
               tasksLoaded[status].pages = Math.ceil(tasksLoaded[status].counts / perPage) || 1;
            }
            res.json({tasks: tasksLoaded})
        }catch (err) {
            console.log(err);
            res.status(500).json({ message: MESSAGES.loadError });
        }
    }

    async create (req, res) {
        try{
            const { title, description, priority, status, create_date, end_date } = req.body;
            const task = await new Task({title, description, priority, status, author: req.user.id});
            task.update_date = toTimestamp(create_date);
            task.create_date = toTimestamp(create_date) || new Date().getTime();
            if(!end_date){
                task.end_date = toTimestamp(create_date) + 3600;
            } else{
                if(toTimestamp(create_date) < toTimestamp(end_date)){
                    task.end_date = toTimestamp(end_date);
                }else{
                    return res.status(400).json({ message: MESSAGES.endTimeError });
                }
            }
            await (await task.save()).populate("author");
            return res.json({ task });
        }catch (err) {
            console.log(err);
            return res.status(500).json({ message: MESSAGES.createError });
        }
    }

    async patch(req, res) {
        try{
            const { id } = req.params;
            const { type, value } = req.body;
            const task = await Task.findById(id);
            task.update_date = new Date().getTime();
            if(type === "responsible") {
                if(task?.responsible && task.responsible
                        .find( respUsers =>respUsers !== null && respUsers._id.equals(value)) ){
                    task.responsible = task.responsible
                        .filter(respList => respList !== null && !respList._id.equals(value));
                }else{
                    task.responsible.push(value);
                }
            if(type === 'create_date' || type === 'end_date'){
                task[type] = toTimestamp(value);
            }
            }else{
                task[type] = value;
            }
            await (await (await task.save()).populate("author")).populate("responsible");
            res.json({ task });
        }catch (err){
            console.log(err);
            return res.status(500).json({ message: MESSAGES.patch })
        }
    }

    async delete(req, res) {
        try{
            const { id } = req.params;
            const task = await Task.findById(id).populate('author');
            if(task && !task.author._id.equals(req.user.id)) return res.json({ message: MESSAGES.removeTaskOwner })
            await task.remove();
            res.json({ task });
        }catch (err){
            console.log(err);
            res.status(500).json({ message: MESSAGES.removeError })
        }
    }
}

module.exports = new TaskController();
const {model, Schema, ObjectId } = require('mongoose');

const DATE_NOW = new Date().getTime();

module.exports = model('task', new Schema({
    title: { type: String, required: true },
    description: { type: String, default: 'no description'},
    create_date: { type: Date, default: DATE_NOW},
    end_date: { type: Date, required: true},
    update_date: { type: Date, default: DATE_NOW},
    priority: { type: String, default: "low" },
    status: { type: String, default: 1 },
    author: { type: ObjectId, ref: 'user' },
    responsible: [{ type: ObjectId, ref: 'user' }]
}, {timestamps: true}));
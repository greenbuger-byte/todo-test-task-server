const { model, Schema, ObjectId} = require('mongoose');

module.exports = model('user', new Schema({
    name: { type: String, required: true },
    surname: { type: String },
    patronymic: { type: String },
    login: { type: String, required: true, unique: true},
    password: { type: String, required: true },
    lead: [{type: ObjectId, ref: "user"}],
}));
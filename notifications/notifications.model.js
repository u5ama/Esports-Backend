const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    title: {type: String, required: true},
    for: { type: Schema.Types.ObjectId, ref: 'User', required: true},
    by: { type: Schema.Types.ObjectId, ref: 'User', required: true},
    type: { type: String, required: true},
    isRead: {type: Number, required: true, default: 0},
    createdAt: {type: Date, default: Date.now()}
});

module.exports = mongoose.model('Notification', schema);
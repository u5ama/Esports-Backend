const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const discussionsSchema = new Schema({
    comment: {type: String, required: true},
    user_id: {type: Schema.Types.ObjectId , ref: "User"},
    createdDate: { type: Date, default: Date.now }
});

const schema = new Schema({
    title: {type: String, unique: true, required: true},
    description: {type: String, required: true},
    image: {type: String, required: false},
    discussions: [discussionsSchema],
    groupId: {type: Schema.Types.ObjectId, ref: "Group"},
    userId: {type: Schema.Types.ObjectId , ref: "User"},
    createdDate: { type: Date, default: Date.now }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Comment', schema);

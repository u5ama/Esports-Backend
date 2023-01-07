const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const discussionsSchema = new Schema({
    comment: {type: String, required: true},
    user_id: {type: Schema.Types.ObjectId , ref: "User"},
    createdDate: { type: Date, default: Date.now }
});

const schema = new Schema({
    post_title: { type: String, required: true },
    post_details: { type: String, required: true },
    discussions: [discussionsSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post_media: { type: String, required: false, default: null },
    createdDate: { type: Date, default: Date.now },
});

schema.set('toJSON', { virtuals: true });

schema.virtual('likes', {
    ref: 'Like',
    localField: '_id',
    foreignField: 'post',
    justOne: false // set true for one-to-one relationship
});

schema.virtual('User', {
    ref: 'User',
    localField: 'createdBy',
    foreignField: '_id',
    justOne: true // set true for one-to-one relationship
});
schema.virtual('User', {
    ref: 'User',
    localField: 'createdBy',
    foreignField: '_id',
    justOne: true // set true for one-to-one relationship
});

schema.virtual('likeCount', {
    ref: 'Like',
    localField: '_id',
    foreignField: 'post',
    justOne: false, // set true for one-to-one relationship
    count: true
});

module.exports = mongoose.model('Post', schema);

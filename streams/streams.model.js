const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    stream_title: { type: String, required: true },
    stream_id: { type: String, required: true },
    stream_user: { type: String, required: true },
    stream_password: { type: String, required: true },
    stream_status: { type: String, default: null},
    stream_banner: { type: String, default: null },
    stream_thumbnail: { type: String, default: null },
    count_views: { type: String, default: null },
    widgetizers: [{ type: Schema.Types.ObjectId, ref: 'User'}],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdDate: { type: Date, default: Date.now },
});

schema.set('toJSON', { virtuals: true });

schema.virtual('User', {
    ref: 'User',
    localField: 'createdBy',
    foreignField: '_id',
    justOne: true // set true for one-to-one relationship
});


module.exports = mongoose.model('Streams', schema);

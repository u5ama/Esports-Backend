const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const membersSchema = new Schema({
    user_id: {type: Schema.Types.ObjectId, ref: "User"},
    createDate: {type: Date, default: Date.now()}
});
const schema = new Schema({
    name: {type: String, unique: true, required: true},
    description: {type: String, required: true},
    image: {type: String, required: false},
    //belongToWidget: {type: Boolean, required: false, default: false},
    emoji: [{type: String, required: false}],
    members: [membersSchema],
    widgetizers: [{ type: Schema.Types.ObjectId, ref: 'User'}],
    groupOwner: { type: Schema.Types.ObjectId, ref: 'User'},
    thread: [{ type: Schema.Types.ObjectId, ref: 'Thread'}],
    createdDate: { type: Date, default: Date.now }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Group', schema);

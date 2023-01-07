const ObjectId = require('mongodb').ObjectID;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User',required: true  },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User',required: true  },
    belongToWidget: {type: Boolean, required: false, default: false},
    status: { type: String, enum : ['pending','accepted'], required: false },
    createdDate: { type: Date, default: Date.now },
    updatedDate: { type: Date, default: Date.now },
});

schema.set('toJSON', { virtuals: true });

schema.virtual('userData', {
    ref: 'User',
    localField: 'user',
    foreignField: '_id',
    justOne: true // set true for one-to-one relationship
})

schema.virtual('requesterData', {
    ref: 'User',
    localField: 'createdBy',
    foreignField: '_id',
    justOne: true // set true for one-to-one relationship
})

module.exports = mongoose.model('Friend', schema);

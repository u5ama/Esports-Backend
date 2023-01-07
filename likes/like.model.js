const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    post: { type: Schema.Types.ObjectId, ref: 'Post',required: true  },
    user: { type: Schema.Types.ObjectId, ref: 'User',required: true  },
    //user_id: { type: String, required: true },
    createdBy: { type: String, required: true },
    createdDate: { type: Date, default: Date.now }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Like', schema);

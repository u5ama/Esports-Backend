const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const friendSchema = new Schema({
    friend_id: {type: Schema.Types.ObjectId , ref: "User"},
    createdDate: { type: Date, default: Date.now }
});
const gamesSchema = new Schema({
    game_id: {type: Schema.Types.ObjectId , ref: "Game"},
    level: {type: String, default:null},
    description: {type: String, default:null},
    createdDate: { type: Date, default: Date.now }
});

const schema = new Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    hash: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    coverImage: { type: String, required: false },
    profileImage: { type: String, required: false },
    friends: [friendSchema],
    user_type: { type: String, required: false },
    bio: { type: String, required: false, default:null },
    games: [gamesSchema],
    trophies: {type: Array, required: false },
    createdDate: { type: Date, default: Date.now }
});

schema.virtual('followerCount', {
    ref: 'Follow',
    localField: '_id',
    foreignField: 'user',
    justOne: false, // set true for one-to-one relationship
    count: true
})
schema.virtual('followingCount', {
    ref: 'Follow',
    localField: '_id',
    foreignField: 'createdBy',
    justOne: false, // set true for one-to-one relationship
    count: true
})
schema.virtual('postCount', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'createdBy',
    justOne: false, // set true for one-to-one relationship
    count: true
})

schema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'createdBy',
    justOne: false, // set true for one-to-one relationship
})

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', schema);

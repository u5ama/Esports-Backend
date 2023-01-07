var ObjectId = require('mongodb').ObjectID;
const db = require('_helpers/db');
const Like = db.Like;
module.exports = {
    create,
    getById,
    getpostlikes,
    deletepostlike
    //create,
    //update,
    //delete: _delete
};
async function create(likeParam) {
    // validate
    /*if (await Like.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }*/
    const like = new Like(likeParam);
    // save user
    await like.save();
}
async function getById(id) {
    return await Like.findById(id).populate('user','email user_type firstName lastName').populate('post','post_title').select('');
}

async function getById(id) {
    return await Like.findById(id).populate('user','email user_type firstName lastName').populate('post','post_title').select('');
}
async function getpostlikes(id) {
    return await Like.findById(id).populate('user','email user_type firstName lastName').populate('post','post_title').select('');
}
async function deletepostlike(id,user_id) {
    return await Like.find({post:ObjectId(id),user:ObjectId(user_id)}).remove().exec();
}

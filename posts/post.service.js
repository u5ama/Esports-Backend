// const config = require('config.json');
// const jwt = require('jsonwebtoken');
const ObjectId = require('mongodb').ObjectID;
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const Post = db.Post;
const User = db.User;
const Friend = db.Friend;
const Follow = db.Follow;

module.exports = {
    // authenticate,
    getAll,
    getAllFromFriendFollowers,
    getAllFromFavFriendFollowers,
    getAllFromFriend,
    getAllFromFollowers,
    search,
    getPostByUserId,
    getPostByUserName,
    getById,
    create,
    update,
    delete: _delete
};

async function getAll() {
    return await Post.find().populate('User', 'email firstName lastName user_type username profileImage').populate('discussions.user_id','email firstName lastName username profileImage').populate('likeCount').populate('likes', 'user').select('post_title post_details discussions createdBy post_media createdDate');
}

async function getAllFromFriendFollowers(user) {
    const frndIds = [user];
    let Friends  = await Friend.find({createdBy: ObjectId(user)}, '').select('user');
    if (Friends.length) {

        for (var i = 0; i < Friends.length; i++) {
            frndIds.push(Friends[i].user);
        }
    }
    let Followss  = await Follow.find({createdBy: ObjectId(user)}, '');
    if (Followss.length) {
        for (var i = 0; i < Followss.length; i++) {
            frndIds.push(Followss[i].user);
        }
    }
    return await Post.find({ createdBy: { $in: frndIds } }).populate('User', 'email firstName lastName user_type username profileImage').populate('discussions.user_id','email firstName lastName username profileImage').populate('likeCount').populate('likes', 'user').select('post_title post_details discussions createdBy post_media createdDate');
    return [frndIds]
    /*return await Friend.find({ createdBy: user }).select('user').then(frnd => {
        if (frnd.length) {
        var frndIds = [];
        for (var i = 0; i < frnd.length; i++) {
            frndIds.push(frnd[i].user);
        }
        let Follow  = await Follow.find({createdBy: ObjectId(user)}, '');
        console.log("Follow")
        console.log(Follow)
        return Post.find({ $and: [{ _id: { $ne: id } }, { _id: { $nin: frndIds } }] }).populate('followerCount').populate('followingCount').populate('postCount')
    }else {
        return Post.find({ _id: { $ne: id } }).populate('followerCount').populate('followingCount').populate('postCount')
    }*/
/*});
    return await Post.find().populate('User', 'email firstName lastName user_type username profileImage').populate('discussions.user_id','email firstName lastName username profileImage').populate('likeCount').populate('likes', 'user').select('');*/
}
async function getAllFromFriend(user) {
    const frndIds = [user];
    let Friends  = await Friend.find({createdBy: ObjectId(user)}, '').select('user');
    if (Friends.length) {
        for (var i = 0; i < Friends.length; i++) {
            frndIds.push(Friends[i].user);
        }
    }
    return await Post.find({ createdBy: { $in: frndIds } }).populate('User', 'email firstName lastName user_type username profileImage').populate('discussions.user_id','email firstName lastName username profileImage').populate('likeCount').populate('likes', 'user').select('post_title post_details discussions createdBy post_media createdDate');
    return [frndIds]
}
async function getAllFromFollowers(user) {
    const frndIds = [user];
    let Followers  = await Follow.find({createdBy: ObjectId(user)}, '');
    if (Followers.length) {
        for (var i = 0; i < Followers.length; i++) {
            frndIds.push(Followers[i].user);
        }
    }
    return await Post.find({ createdBy: { $in: frndIds } }).populate('User', 'email firstName lastName user_type username profileImage').populate('discussions.user_id','email firstName lastName username profileImage').populate('likeCount').populate('likes', 'user').select('post_title post_details discussions createdBy post_media createdDate');
    return [frndIds]
}

async function getAllFromFavFriendFollowers(user) {
    const frndIds = [user];
    let Friends  = await Friend.find({createdBy: ObjectId(user),belongToWidget: true}, '').select('user');
    if (Friends.length) {

        for (var i = 0; i < Friends.length; i++) {
            frndIds.push(Friends[i].user);
        }
    }
    return await Post.find({ createdBy: { $in: frndIds } }).populate('User', 'email firstName lastName user_type username profileImage').populate('discussions.user_id','email firstName lastName username profileImage').populate('likeCount').populate('likes', 'user').select('');

    return [frndIds]
}


async function search(q) {
    const q2 = q.charAt(0).toUpperCase() + q.slice(1);
    return await Post.find({
        $or: [
            {post_title: { $regex: '.*' + q + '.*' }},
            {post_title: { $regex: '.*' + q2 + '.*' }},
            {post_details: { $regex: '.*' + q + '.*' }},
            {post_details: { $regex: '.*' + q2 + '.*' }}
        ]
    }).populate('User', 'email firstName lastName user_type username').populate('likeCount').populate('likes', 'user').select('');
}

async function getPostByUserId(id) {
    return await Post.find({ createdBy: id }).populate('User', 'email firstName lastName user_type username ').populate('likeCount').populate('likes', 'user').select('');
}
async function getPostByUserName(id) {
    var userData = await  User.findOne({ username: id });
    return this.getPostByUserId(userData._id);
}

async function getById(id) {
    return await Post.findById(id).populate('likeCount').select('');
}

async function create(postParam) {
    const post = new Post(postParam);
    // save user
    await post.save();
    return post;
}

async function update(id, postParam) {
    const post = await Post.findById(id);

    // validate
    if (!post) throw 'Post not found';
    if (post.post_title !== postParam.post_title && await Post.findOne({ title: postParam.post_title })) {
        throw 'Title "' + postParam.post_title + '" is already taken';
    }
    // copy userParam properties to user
    Object.assign(post, postParam);
    await post.save();
}

async function _delete(id) {
    await Post.findByIdAndRemove(id);
}

// const config = require('config.json');
// const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const User = db.User;
const Friend = db.Friend;
const jwt = require('jsonwebtoken')
const config = require('config.json');
const ObjectId = require('mongodb').ObjectID;

module.exports = {
    authenticate,
    getAll,
    getById,
    getByUsername,
    create,
    search,
    update,
    delete: _delete,
    getToKnowUsers,
    addFriend
};

async function search(q) {
    let q2 = q.charAt(0).toUpperCase() + q.slice(1);
    return await User.find({
        $or: [
            {username: { $regex: '.*' + q + '.*' }},
            {username: { $regex: '.*' + q2 + '.*' }},
            {firstName: { $regex: '.*' + q + '.*' }},
            {firstName: { $regex: '.*' + q2 + '.*' }},
            {lastName: { $regex: '.*' + q + '.*' }},
            {lastName: { $regex: '.*' + q2 + '.*' }},
            {email: { $regex: '.*' + q + '.*' }},
            {email: { $regex: '.*' + q2 + '.*' }}
        ]
    }).populate('followerCount').populate('followingCount').populate('postCount').select("");
}

async function addFriend(id, friendId) {
    let friendsData = {
        friendId: friendId,
        createdDate: new Date()
    };

    return await User.findById(id, function (err, user) {
        user.friends.push(friendsData);
        let new_friend_id = false;
        user.save();
        return new_friend_id;
    })
}

async function getToKnowUsers(id) {
    return await Friend.find({ $or:[{createdBy: id}, {user: id}] }).select('user createdBy').then(frnd => {

       if (frnd.length) {
            var frndIds = [];
           //console.info('friends: ', frnd);
            for (var i = 0; i < frnd.length; i++) {
                if(frnd[i].createdBy == id) {
                    frndIds.push(frnd[i].user);
                } else {
                    frndIds.push(frnd[i].createdBy);
                }
            }
            frndIds.push(id);

           //console.info('friends: ', frndIds);
            return User.find({$and: [{_id: {$ne: id}}, {_id: {$nin: frndIds}}]})
                .populate('followerCount')
                .populate('followingCount')
                .populate('postCount');

        } else {
            return User.find({_id: {$ne: id}}).populate('followerCount').populate('followingCount').populate('postCount')
        }
    });
    //console.info('body:: ', id);

    //return await User.find({_id: {$ne: id}});
}

async function authenticate({email, password}) {
    const user = await User.findOne({$or: [{username: email}, {email: email}]});
    if (user && bcrypt.compareSync(password, user.hash)) {
        const {hash, ...userWithoutHash} = user.toObject();
        const token = jwt.sign({sub: user.id}, config.secret);
        return {
            ...userWithoutHash,
            token
        };
    }
}

async function getAll() {
    return await User.find().select('');
}


async function getById(id) {
    return await User.findById(id).select('');
}

async function getByUsername(username) {
    return await User.findOne({username:username}).select('');
}

async function create(userParam) {
    // validate
    if (await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    const user = new User(userParam);

    // hash password
    if (userParam.password) {
        user.hash = bcrypt.hashSync(userParam.password, 10);
    }
    if (userParam.hash) {
        user.hash = bcrypt.hashSync(userParam.hash, 10);
    }

    if (userParam.games.length) {
        var gamesList = userParam.games;
        user.games = gamesList.map((game) => {
            return {
                game_id: ObjectId(game.game_id),
                level:game.level
            }
        });
        userParam.games = gamesList;
    }


    // save user
    await user.save();
}

async function update(id, userParam) {
    const user = await User.findById(id);

    // validate
    if (!user) throw 'User not found';
    if (user.username !== userParam.username && await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    // hash password if it was entered
    if (userParam.password) {
        userParam.hash = bcrypt.hashSync(userParam.password, 10);
    }
    // hash password if it was entered
    if (userParam.trophies) {
        userParam.trophies = JSON.parse(userParam.trophies);
    }

    if (userParam.profileImage == '') {
        userParam.profileImage = user.profileImage;
    }
    if (userParam.coverImage == '') {
        userParam.coverImage = user.coverImage;
    }

    if (userParam.games.length) {
        var gamesList = JSON.parse(userParam.games);
        gamesList.map((game) => {
            return {
                game_id: ObjectId(game.game_id),
                level:game.level,
                description:game.description?game.description:null,
            }
        });
        userParam.games = gamesList;
    }
    // copy userParam properties to user
    Object.assign(user, userParam);

    await user.save();
    return user;
}

async function _delete(id) {
    await User.findByIdAndRemove(id);
}

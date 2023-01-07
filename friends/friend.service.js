const db = require('_helpers/db');
const Friend = db.Friend;
const notifyService = require('../notifications/notifications.services');

module.exports = {
    getFriendList,
    getPendingFriendList,
    CheckIfExists,
    acceptfriend,
    addfriend,
    removefriend,
    getFriendRequestList,
    delete: _delete,
    addToWidget,
    removeFromWidget,
    getWidgetFriends
};

async function addToWidget(params) {
    return await Friend.findByIdAndUpdate(params.id, {belongToWidget: true}, {new: true});
}

async function removeFromWidget(params) {
    console.info('params: ', params);
    return await Friend.findByIdAndUpdate(params.id, {belongToWidget: false}, {new: true});
}

async function getWidgetFriends(createdBy) {
    //console.log('createdBy: ', createdBy);
    return await Friend.find({
        $or: [{belongToWidget: true, createdBy: createdBy}, {
            belongToWidget: true,
            user: createdBy
        }]
    }, '', {
        sort: {
            createdDate: -1 //Sort by Date Added DESC
        }
    }, (err, frnds) => {
        //console.info('inside group getting widget friends', err);
    }).populate({
        path: 'userData',
        populate: [
            {path: 'followerCount'},
            {path: 'followingCount'},
            {path: 'postCount'},
            {
                path: 'posts',
                populate: {
                    path: 'User',
                }
            },
        ]
    })
        .populate({
                path: 'requesterData',
                populate: [
                    {path: 'followerCount'},
                    {path: 'followingCount'},
                    {path: 'postCount'},
                    {
                        path: 'posts',
                        populate: {
                            path: 'User',
                        }
                    },
                ]
            }
        ).select('');
}

async function getFriendList(createdBy) {
    return await Friend.find({$or: [{createdBy: createdBy, status: 'accepted'}, {user: createdBy, status: 'accepted'}]})
        .populate({
                path: 'requesterData',
                populate: [
                    {path: 'followerCount'},
                    {path: 'followingCount'},
                    {path: 'postCount'}
                ]
            }
        )
        .populate({
                path: 'userData',
                populate: [
                    {path: 'followerCount'},
                    {path: 'followingCount'},
                    {path: 'postCount'}
                ]
            }
        )
        .select('');
}


async function getPendingFriendList(createdBy) {
    return await Friend.find({createdBy: createdBy, status: 'pending'}).populate({
        path: 'userData',
        populate: [
            {path: 'followerCount'},
            {path: 'followingCount'},
            {path: 'postCount'}
        ]
    }).select('');
}

async function getFriendRequestList(createdBy) {
    return await Friend.find({user: createdBy, status: 'pending'}).populate({
        path: 'requesterData',
        populate: [
            {path: 'followerCount'},
            {path: 'followingCount'},
            {path: 'postCount'}
        ]
    }).select('');
}

async function addfriend(createdBy, user) {
    const friend = new Friend({createdBy: createdBy, user: user, status: 'pending'});
    return await friend.save((err, frnd) => {

        //creating notification for user being followed..
        notifyService.create({
            title: 'Someone sent friend request to you',
            by: frnd.createdBy,
            for: frnd.user,
            type: 'follow'
        })
    });
}

async function CheckIfExists(createdBy, user) {
    return await Friend.find({createdBy: createdBy, user: user}).select('');
}

async function acceptfriend(createdBy, user) {
    return await Friend.findOneAndUpdate({createdBy: createdBy, user: user}, {$set: {status: "accepted"}}, {new: true},
        (err, friend) => {

            //creating notification for user being followed..
            notifyService.create({
                title: 'Someone sent friend request to you',
                by: friend.user,
                for: friend.createdBy,
                type: 'friend-req-accepted'
            })
        });
}

async function removefriend(createdBy, user) {
    return await Friend.findOneAndDelete({createdBy: createdBy, user: user});
}

async function _delete(id) {
    return await Friend.findByIdAndRemove(id);
}

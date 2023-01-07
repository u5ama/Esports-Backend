const ObjectId = require('mongodb').ObjectID;
const db = require('_helpers/db');
const Follow = db.Follow;
const notifyService = require('../notifications/notifications.services');

module.exports = {
    getAll,
    getWidgetFollows,
    addFollower,
    _delete,
    addToWidget,
    removeFromWidget
};

async function addToWidget(params) {
    return await Follow.findByIdAndUpdate(params.id, {belongToWidget: true}, {new: true});
}

async function removeFromWidget(params) {
    return await Follow.findByIdAndUpdate(params.id, {belongToWidget: false}, {new: true});
}

async function getWidgetFollows(createdBy) {
    return await Follow.find({createdBy: ObjectId(createdBy), belongToWidget: true}, '', {
        sort: {
            createdDate: -1 //Sort by Date Added DESC
        }
    }).populate({
        path    : 'userData',
        populate: [
            { path: 'followerCount' },
            { path: 'followingCount' },
            { path: 'postCount' },
            { path: 'posts' ,
                populate: {
                    path: 'User',
                }
            },
        ]
    }).select('');
}


async function getAll(createdBy) {
    return await Follow.find({createdBy: ObjectId(createdBy)}, '', {
        sort: {
            createdDate: -1 //Sort by Date Added DESC
        }
    })
        .populate({
            path    : 'userData',
            populate: [
                { path: 'followerCount' },
                { path: 'followingCount' },
                { path: 'postCount' },
                { path: 'posts' ,
                    populate: {
                        path: 'User',
                    }
                },
            ]
        });
}

async function addFollower(followParam) {
    // validate

    if (await Follow.findOne({ createdBy: ObjectId(followParam.createdBy),user:ObjectId(followParam.user_id)})) {
        throw "Already followed by you";
    }
    const params = {
        createdBy: ObjectId(followParam.createdBy),
        user:ObjectId(followParam.user_id),
        type:'user',
        status:'accepted'
    }
    const follo = new Follow(params);
    return await follo.save((err, follo) => {
        //creating notification for user being followed..
        notifyService.create({
            title: 'Someone started following you',
            by: follo.createdBy,
            for: follo.user,
            type: 'follow'
        })
    });
}

async function _delete(param) {
    return await Follow.findOneAndRemove({ createdBy: ObjectId(param.createdBy),user:ObjectId(param.user_id)});
}

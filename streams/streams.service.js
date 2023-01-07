const ObjectId = require('mongodb').ObjectID;
const db = require('_helpers/db');
const Stream = db.Streams;
const Friend = db.Friend;
const Follow = db.Follow;

module.exports = {
    create,
    getById,
    getAll,
    getUserAll,
    update,
    updStatus,
    delete: _delete,
    addToWidget,
    removeFromWidget,
    getWidgetStreams,
    getAllFriends,
    getAllFollowers,
    countViews
};

async function create(postParam) {
    const stream = new Stream(postParam);
    // save stream
    await stream.save();
    return stream;
}

async function getById(id) {
    return await Stream.find({ createdBy: id }).select('');
}

async function countViews(id) {
    const streamViews = await Stream.findOne({stream_id:id}).select('count_views');
    const count = streamViews.count_views++;
    // copy userParam properties to user
    Object.assign(streamViews, count);
    await streamViews.save();
    //return await Stream.find({ createdBy: id }).select('');
}

async function getAll() {
    return await Stream.find().select('');
}

async function getUserAll(id) {
    return await Stream.find({createdBy:id}).select('');
}
async function getAllFriends(user) {
    const userId = [user];
    let Friends  = await Friend.find({createdBy: ObjectId(user)}, '').select('user');
    if (Friends.length) {
        for (var i = 0; i < Friends.length; i++) {
            userId.push(Friends[i].user);
        }
    }
    return await Stream.find({ createdBy: { $in: userId } }).select('');
    return [userId]
}
async function getAllFollowers(user) {
    const userId = [user];
    let Followss  = await Follow.find({createdBy: ObjectId(user)}, '');
    if (Followss.length) {
        for (var i = 0; i < Followss.length; i++) {
            userId.push(Followss[i].user);
        }
    }
    return await Stream.find({ createdBy: { $in: userId } }).select('');
    return [userId]
}

async function update(id, params) {
    const stream = await Stream.findOne({createdBy:id});

    // validate
    if (!stream) throw 'Stream not found';
    if (stream.stream_title !== params.stream_title && await Stream.findOne({stream_title: params.stream_title})) {
        throw 'Title "' + params.stream_title + '" is already taken';
    }
    // copy userParam properties to user
    Object.assign(stream, params);
    await stream.save();
}

async function updStatus(id, params) {
    const streamStatus = await Stream.findOne({createdBy:id}).select('stream_status');
    // validate
    if (!streamStatus) throw 'Stream not found';
    if (streamStatus.stream_status !== params.stream_status && await Stream.findOne({stream_status: params.stream_status})) {
        throw 'Stream "' + params.stream_status + '" is already started';
    }
    // copy userParam properties to user
    Object.assign(streamStatus, params);
    await streamStatus.save();
}

async function addToWidget(params) {
    return await Stream.findOne({stream_id:params.stream_id},  (err, stream) => {
        stream.widgetizers.push(params.userId);
        stream.save();
    });
}

async function getWidgetStreams(params) {
    return await Stream.find({widgetizers: params.user_id}, '', {
        sort: {
            createdDate: -1 //Sort by Date Added DESC
        }
    }, (err, groups) => {
        //console.info('inside group getting widget groups', groups);
    });
}

async function removeFromWidget(params) {
    const stream = await Stream.findOne({stream_id:params.streamId});
    // validate
    if (!stream) throw 'Stream not found';

    return await Stream.findOneAndUpdate(
    {stream_id: params.streamId},
    {$pull: {'widgetizers':  params.userId}},
    {new: true},
    (err, stream) => {
        if (err) {
            return res.status(400).json({
                status: "failed",
                message: err,
                is_success: false
            });
        }
        return stream;
    });
}

async function _delete(id) {
    await Stream.findOneAndRemove({createdBy:id});
}

const db = require('_helpers/db');
const Group = db.Group;
const Thread = db.Thread;

module.exports = {
    create,
    getAll,
    getById,
    update,
    delete: _delete,

    CheckIfMemberExists,
    join,
    leave,
    getByUser,
    getAllByUser,
    searchGroups,

    addToWidget,
    removeFromWidget,
    getWidgetGroups,
    createDefaultThreads
}

async function getWidgetGroups(params) {
    return await Group.find({widgetizers: params.user_id}, '', {
        sort: {
            createdDate: -1 //Sort by Date Added DESC
        }
    }, (err, groups) => {
        //console.info('inside group getting widget groups', groups);
    });
}

async function addToWidget(params) {
    //return true;
    return await Group.findById(params.id,  (err, group) => {
        group.widgetizers.push(params.userId);
        group.save();
    });
}


async function removeFromWidget(params) {
    const group = await Group.findById(params.groupId);

    // validate
    if (!group) throw 'Group not found';

    return await Group.findOneAndUpdate(
        {_id: params.groupId},
        {$pull: {'widgetizers':  params.userId }},
        {new: true},
        (err, group) => {
            if (err) {
                return res.status(400).json({
                    status: "failed",
                    message: err,
                    is_success: false
                });
            }

            return group;
        });
}

async function searchGroups(q) {
    let q2 = q.charAt(0).toUpperCase() + q.slice(1);
    return await Group.find({
        $or: [
            {name: {$regex: '.*' + q + '.*'}},
            {name: {$regex: '.*' + q2 + '.*'}}
        ]
    }).exec();
}

async function CheckIfMemberExists(groupId, userId) {
    return await Group.findOne(
        {
            _id: groupId,
            "members.user_id": userId
        }, 'members',
    );
}

async function getByUser(user_id) {
    return await Group.find({
        $and : [
            {'groupOwner': user_id},
            {'widgetizers': {$ne: user_id}}
        ]
    }, '', {
        sort: {
            createdDate: -1 //Sort by Date Added DESC
        }
    })
        .populate({
                path: 'thread',
                model: 'Thread'
            })
}

async function getAllByUser(user_id) {
    return await Group.find(
            {'groupOwner': user_id}

    , '', {
        sort: {
            createdDate: -1 //Sort by Date Added DESC
        }
    })
        .populate({
                path: 'thread',
                model: 'Thread'
            })
}

async function leave(params) {
    const group = await Group.findById(params.groupId);

    // validate
    if (!group) throw 'Group not found';

    Group.findOneAndUpdate(
        {_id: params.groupId},
        {$pull: {'members': {user_id: params.userId}}},
        {new: true},
        (err, user) => {
            if (err) {
                return res.status(400).json({
                    status: "failed",
                    message: err,
                    is_success: false
                });
            }
        });
}

async function join(params) {
    const group = await Group.findById(params.groupId);

    // validate
    if (!group) throw 'Group not found';

    Group.findByIdAndUpdate(params.groupId,
        {$push: {members: [{user_id: params.userId}]}},
        {new: true},
        (err, user) => {
            if (err) {
                return res.status(400).json({
                    status: "failed",
                    message: err,
                    is_success: false
                });
            }
        });
}

async function create(groupParams) {
    if (await Group.findOne({name: groupParams.name})) {
        throw "Group " + groupParams.name + ' already exists!'
    }
    let group = new Group(groupParams);
    group.members.push({
        user_id: groupParams.user_id
    });
    await group.save();
    return group;
}

//creating default threads for the newly created group
async function createDefaultThreads(groupId, userId) {
    let defaultThreads = [
        {
            title: 'Patches',
            desc: 'This thread contains discussions for Games Patches'
        }, {
            title: 'Announcements',
            desc: 'This thread contains discussions for Announcements'
        }, {
            title: 'Tournaments',
            desc: 'This thread contains discussions for Games Tournaments'
        }, {
            title: 'Events',
            desc: 'This thread contains discussions for Games Events'
        }
    ];

    let threadData = [];
    defaultThreads.forEach((v, i) => {
        let threadData = {
            title: v.title,
            description: v.desc,
            image: '',
            group: groupId,
            user: userId
        };
        let thread = new Thread(threadData);
        thread.save(threadData, function (err, thread) {
            Group.findById(groupId, (err, group) => {
                group.thread.push(thread._id);
                group.save();
            })
        });
    });
}

async function getAll() {
    return await Group.find({}, '', {
        sort: {
            createdDate: -1 //Sort by Date Added DESC
        }
    }).populate({
        path: 'thread',
        model: 'Thread'
    });
}

async function getById(id) {
    return await Group.findById(id).populate({
        path: 'thread',
        model: 'Thread'
    });
}

async function update(id, param) {
    const group = await Group.findById(id);

    // validate
    if (!group) throw 'Group not found';
    if (group.name !== param.name && await Group.findOne({name: param.name})) {
        throw 'Name "' + param.name + '" is already taken';
    }

    if (param.image == '') {
        param.image = group.image;
    }
    // copy userParam properties to user
    Object.assign(group, param);
    await group.save();
}

async function _delete(id) {
    return await Group.findByIdAndRemove(id);
}

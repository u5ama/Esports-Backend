const db = require('_helpers/db');
const Thread = db.Thread;
const Group = db.Group;

module.exports = {
    create,
    getAll,
    getById,
    update,
    delete: _delete,

    CheckIfMemberExists,
    getByGroupId
}

async function CheckIfMemberExists(groupId, userId) {
    return await Thread.findOne(
        {
            _id: groupId,
            "members.user_id": userId
        }, 'members',
    );
}


async function create(params) {
    /*if (await Thread.findOne({title: params.title})) {
        throw "Thread " + params.title + ' already exists!'
    }*/
    //console.info('thrad params: ', params);
    let thread = new Thread(params);
    await thread.save((err, thread) => {
        Group.findById(params.group, (err, group) => {
            group.thread.push(thread._id);
            group.save();
        })
    });
}

async function getAll() {
    return await Thread.find({}, '', {
        sort: {
            createdDate: -1 //Sort by Date Added DESC
        }
    });
}

async function getByGroupId(id) {
    return await Thread.find({groupId: id});
}

async function getById(id) {
    return await Thread.findById(id);
}

async function update(id, param) {
    const thread = await Thread.findById(id);

    // validate
    if (!thread) throw 'Thread not found';
    if (thread.name !== param.name && await Thread.findOne({name: param.name})) {
        throw 'Name "' + param.name + '" is already taken';
    }

    if (param.image == '') {
        param.image = group.image;
    }
    // copy userParam properties to user
    Object.assign(thread, param);
    await thread.save();
}

async function _delete(id) {
    return await Thread.findByIdAndRemove(id);
}
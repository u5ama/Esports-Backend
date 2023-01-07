const db = require('_helpers/db');
const Thread = db.Thread;
const Group = db.Group;
const Post = db.Post;
const threadService = require('../threads/threads.services');
const postService = require('../posts/post.service');
const notificationService  = require('../notifications/notifications.services');

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
    switch (params.type) {
        case 'thread' :

            threadService.getById(params.id)
                .then((thread) => {
                    thread.discussions.push(params);
                    return thread.save((err, thread) => {
                        params.emoji.forEach((v, i) => {
                            Group.find({
                                _id: thread.group,
                                emoji: v
                            }, (err, group) => {
                                if(group.length) {
                                    //console.info('INSIDE IF');
                                } else {
                                    Group.findById(thread.group, (err, group) => {
                                        group.emoji.push(v);
                                        group.save();
                                    });
                                }
                            })
                        });

                        //creating notification..
                        notificationService.create({
                            title: 'Someone posted on your thread',
                            for: thread.user,
                            by: params.user_id,
                            type: 'discussion'
                        });
                    });
                })
                .catch((err) => {
                    console.info('err:: ', err);
                })
            break;

        case 'post' :

            postService.getById(params.id)
                .then((post) => {
                    post.discussions.push(params);
                    return post.save((err, post) => {
                        //creating notification..
                        notificationService.create({
                            title: 'Someone posted a comment on your Post',
                            for: post.createdBy,
                            by: params.user_id,
                            type: 'post'
                        });
                    });
                })
                .catch((err) => {
                    console.info('err:: ', err);
                })
            break;
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function getAll(params) {
    //console.info('params: ', params);
    let filters = {};
    if(params.id) {
        filters = {_id: params.id};
    }

    switch(params.type){
        case 'post':
            return await Post.find(filters, '', {
                sort: {
                    createdDate: -1 //Sort by Date Added DESC
                }
            }).populate('discussions.user_id','email firstName lastName username profileImage');

        case 'thread':
            return await Thread.find(filters, '', {
                sort: {
                    createdDate: -1 //Sort by Date Added DESC
                }
            });
    }
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

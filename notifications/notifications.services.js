const db = require('../_helpers/db');
const Notification = db.Notification;

module.exports = {
    create,
    getAllByUser
}

async function getAllByUser(params) {
    return await Notification.find({
            'for': params.user_id,
            'isRead' : 0
        }
        , '', {
            sort: {
                createdAt: -1 //Sort by Date Added DESC
            }
        })
}

async function create(params) {
    let notification = new Notification();
    notification.title = params.title;
    notification.for = params.for;
    notification.by = params.by;
    notification.type = params.type;

    await notification.save();
}
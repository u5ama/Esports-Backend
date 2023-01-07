const config = require('config.json');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || config.connectionString, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;

module.exports = {
    User: require('../users/user.model'),
    Like: require('../likes/like.model'),
    Post: require('../posts/post.model'),
    Game: require('../games/games.model'),
    Group : require('../groups/groups.model'),
    Friend: require('../friends/friend.model'),
    Thread: require('../threads/threads.model'),
    Comment: require('../comments/comments.model'),
    Follow: require('../follows/follow.model'),
    Streams: require('../streams/streams.model'),
    Notification: require('../notifications/notifications.model')
};

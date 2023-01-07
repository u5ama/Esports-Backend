const express = require('express');
const router = express.Router();
const postService = require('./post.service');
const middleware = require('middleware').checkToken;
const multer = require('multer');
const path = require('path');

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        var fs = require('fs');
        var dir = './uploads/posts';
        if (!fs.existsSync(dir)){fs.mkdirSync(dir);}
        callback(null, './uploads/posts');
    },
    filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now()+ path.extname(file.originalname))
    }
});
var postUpload = multer({storage: storage});

// routes
router.post('/createpost', middleware,postUpload.single("post_media"), createpost);
router.get('/myposts', middleware, myposts);
//router.get('/', middleware, getAll);
router.get('/', middleware, getAllFromFriendFollowers);
router.get('/favFriends', middleware, getAllFromFavFriendFollowers);
router.get('/FriendsPosts', middleware, getAllFromFriend);
router.get('/FollowersPosts', middleware, getAllFromFollowers);
router.get('/current', middleware, getCurrent);
router.post('/search', middleware, searchPosts);
router.get('/:id', middleware, getById);
router.put('/:id', middleware, update);
router.get('/user/:username', mypostsByUsername);
router.delete('/:id', _delete);

module.exports = router;

// function authenticate(req, res, next) {
//     userService.authenticate(req.body)
//         .then(user => user ? res.json(user) : res.status(400).json({ message: 'Username or password is incorrect' })
//         )
//         .catch(err => next(err));
// }

function createpost(req, res, next) {
    let params = {};
    req.body.createdBy = req.user.sub;

    params = Object.assign(params, req.body);
    if(req.file && req.file.filename) {
        params.post_media = req.file.filename;
    }

    postService.create(params).then((post) => res.json({
        status: true,
        message: 'Post created successfully!',
        post: post._id
    })).catch(err => next(err));
}

function getAllFromFriendFollowers(req, res, next) {
    const User = req.user.sub;
    postService.getAllFromFriendFollowers(User)
        .then(posts => res.json(posts))
        .catch(err => next(err));
}
function getAllFromFavFriendFollowers(req, res, next) {
    const User = req.user.sub;
    postService.getAllFromFavFriendFollowers(User)
        .then(posts => res.json(posts))
        .catch(err => next(err));
}
function getAllFromFriend(req, res, next) {
    const User = req.user.sub;
    postService.getAllFromFriend(User)
        .then(posts => res.json(posts))
        .catch(err => next(err));
}
function getAllFromFollowers(req, res, next) {
    const User = req.user.sub;
    postService.getAllFromFollowers(User)
        .then(posts => res.json(posts))
        .catch(err => next(err));
}
function getAll(req, res, next) {

    postService.getAll()
        .then(posts => res.json(posts))
        .catch(err => next(err));
}

function searchPosts(req, res, next) {
    postService.search(req.body.q)
        .then((results) => res.json({status: true, message: 'done', data: results}))
.catch((err) => next(err))
}

function myposts(req, res, next) {
    postService.getPostByUserId(req.user.sub)
        .then(posts => res.json(posts))
        .catch(err => next(err));
}

function mypostsByUsername(req, res, next) {
    if(!req.params.username){
        res.status(422).json(
            {message:'username is required'}
        )
    }
    postService.getPostByUserName(req.params.username)
        .then(posts => res.json(posts))
        .catch(err => next(err));
}

function getCurrent(req, res, next) {
    postService.getById(req.post.sub)
        .then(post => post ? res.json(post) : res.sendStatus(404))
        .catch(err => next(err));
}

function getById(req, res, next) {
    postService.getById(req.params.id)
        .then(post => post ? res.json(post) : res.sendStatus(404))
        .catch(err => next(err));
}

function update(req, res, next) {
    postService.update(req.params.id, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    postService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}

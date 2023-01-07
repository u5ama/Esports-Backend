const express = require('express');
const router = express.Router();
const friendService = require('./friend.service');
const { checkSchema, check, validationResult } = require('express-validator');
const middleware = require('middleware').checkToken;

// routes
/**
 * Friend
 */
router.get('/getfriendlist', middleware, getFriendList);
router.get('/getPendingFriendList', middleware, getPendingFriendList);
router.get('/getFriendRequestList', middleware, getFriendRequestList);
router.post('/addfriend', middleware, validate('addfriend'), addfriend);
router.post('/acceptfriend', middleware, validate('addfriend'), acceptfriend);
router.delete('/removefriend/:id', middleware, removefriend);
//router.get('/:id', middleware, getById);
//router.delete('/addtofriend', middleware, getAll);
router.post('/add-to-widget', middleware, addToWidget);
router.post('/remove-from-widget', middleware, removeFromWidget);
router.get('/widget-friends', middleware, getWidgetFriends);

module.exports = router;


function getWidgetFriends(req, res, next) {
    var createdBy = req.user.sub;
    friendService.getWidgetFriends(createdBy)
        .then((friends) => res.json({status: true, message: 'done', data: friends}))
.catch((err) => next(err))
}

function addToWidget(req, res, next) {
    //var createdBy = req.user.sub;
    friendService.addToWidget({id: req.body.friend_id})
        .then(friend => res.json({status: true, message: 'done', friend})).catch(error => res.json({error: error}))
}

function removeFromWidget(req, res, next) {
    //var createdBy = req.user.sub;
    friendService.removeFromWidget({id: req.body.id})
        .then(() => res.json({status: true, message: 'done'})).catch(error => res.json({error: error}))
}


function getFriendList(req, res, next) {
    var createdBy = req.user.sub;
    friendService.getFriendList(createdBy)
        .then(friendList => friendList ? res.json(friendList) : res.sendStatus(404)).catch(err => next(err));
}

function getFriendRequestList(req, res, next) {
    var createdBy = req.user.sub;
    friendService.getFriendRequestList(createdBy)
        .then(friendList => friendList ? res.json(friendList) : res.sendStatus(404)).catch(err => next(err));
}

function getPendingFriendList(req, res, next) {
    var createdBy = req.user.sub;
    friendService.getPendingFriendList(createdBy)
        .then(friendList => friendList ? res.json(friendList) : res.sendStatus(404)).catch(err => next(err));
}

function removefriend(req, res, next) {
    var createdBy = req.params.id;
    var user = req.user.sub;
    if (createdBy == user) {
        res.json(
            {
                "status": "failed",
                "errors": [{
                    "msg": "user_id must not equal to logged in user body",
                    "param": "user_id",
                    "location": "body"
                }]
            }, 400)
    }
    friendService.removefriend(createdBy, user)
        .then(friendList => friendList ? res.json(friendList) : res.status(400).json({ message: 'Noting to delete.' })).catch(err => next(err));
}

function addfriend(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: "failed",
            errors: errors.array(),
            is_success: false
        });
    }
    var createdBy = req.user.sub;
    var user = req.body.user_id;
    if (createdBy == user) {
        res.json(
            {
                "status": "failed",
                "errors": [{
                    "msg": "user_id must not equal to logged in user body",
                    "param": "user_id",
                    "location": "body"
                }]
            }, 400)
    }
    friendService.CheckIfExists(createdBy, user).then(friendRequest => {
        if (friendRequest.length) {
            res.json({ "status": "failed", "errors": [{ "msg": "You can't send more then one Request." }] }, 400)
        } else {
            friendService.addfriend(createdBy, user).then(() => res.status(200).json({})).catch(err => res.status(400).json(err));
        }
    }).catch(err => next(err));
}

function acceptfriend(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: "failed",
            errors: errors.array(),
            is_success: false
        });
    }
    var user = req.user.sub;
    var createdBy = req.body.user_id;
    //return res.status(200).json({createdBy:createdBy,user:user })
    if (createdBy == user) {
        res.json(
            {
                "status": "failed",
                "errors": [{
                    "msg": "user_id must not equal to logged in user body",
                    "param": "user_id",
                    "location": "body"
                }]
            }, 400)
    }
    friendService.CheckIfExists(createdBy, user).then(friendRequest => {

        if (friendRequest.length) {
            friendService.acceptfriend(createdBy, user).then(() => res.status(200).json({})).catch(err => res.status(400).json(err));
        } else {
            res.json({ "status": "failed", "errors": [{ "msg": "No Friend Request Found." }] }, 400)
        }
    }).catch(err => next(err));
}

function validate(method) {
    switch (method) {
        case 'addfriend': {
            return [
                check('user_id', 'user_id doesn\'t exists in request body').exists().not().isEmpty().withMessage('user_id is empty'),
            ]
        }
    }
}

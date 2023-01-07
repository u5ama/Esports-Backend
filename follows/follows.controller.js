const express = require('express');
const router = express.Router();
const followService = require('./follow.service');
const { checkSchema, check, validationResult } = require('express-validator');
const middleware = require('middleware').checkToken;

// routes
/**
 * Friend
 */
router.get('/get-followers', middleware, getFollowers);
router.get('/get-widget-follows', middleware, getWidgetFollows);
router.post('/addFollower', middleware, validate('addFollower'), addFollower);
router.post('/delete', middleware, validate('addFollower'), deleteFollower);
router.post('/add-to-widget', middleware, addToWidget);
router.post('/remove-from-widget', middleware, removeFromWidget);

module.exports = router;

function addToWidget(req, res, next) {
    //var createdBy = req.user.sub;
    followService.addToWidget({id: req.body.friend_id})
        .then(follows => res.json({status: true, message: 'done', follows: follows})).catch(error => res.json({error: error}))
}
function removeFromWidget(req, res, next) {
    //var createdBy = req.user.sub;
    followService.removeFromWidget({id: req.body.id})
        .then(() => res.json({status: true, message: 'done'})).catch(error => res.json({error: error}))
}


function getWidgetFollows(req, res, next) {
    var createdBy = req.user.sub;

    followService.getWidgetFollows(createdBy)
        .then((data) => res.json({
            status: true,
            message: 'done',
            data
        }))
        .catch(err => next(err));
}

function getFollowers(req, res, next) {
    var createdBy = req.user.sub;

    followService.getAll(createdBy)
        .then((data) => res.json(data))
        .catch(err => next(err));
}

function deleteFollower(req, res, next) {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: "failed",
            errors: errors.array(),
            is_success: false
        });
    }

    var params = {
        createdBy: req.user.sub,
        user_id:req.body.user_id
    }
    followService._delete(params)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function addFollower(req, res, next) {

    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            status: "failed",
            errors: errors.array(),
            is_success: false
        });
    }
    //req.body.user_id
    var params = {
        createdBy: req.user.sub,
        user_id:req.body.user_id,
        type:'user'
    }

    //console.info(params); return false;
    followService.addFollower(params)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function validate(method) {
    switch (method) {
        case 'addFollower': {
            return [
                check('user_id', 'user_id doesn\'t exists in request body').exists().not().isEmpty().withMessage('user_id is empty'),
            ]
        }
    }
}

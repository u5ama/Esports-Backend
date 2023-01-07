const express = require('express');
const router = express.Router();
const likeService = require('./like.service');
const middleware = require('middleware').checkToken;

// routes
router.post('/createpostlike', middleware, createpostlike);
router.get('/:id', middleware, getLikeDetails);
router.get('/getpostlikes/:id', middleware, getLikeByPost);
router.post('/deletepostlike', middleware, deletepostlike);

module.exports = router;

function createpostlike(req, res, next) {
    req.body.user = req.user.sub;
    req.body.createdBy = req.user.sub;
    if(!req.body.post){
        res.status(422).json(
            {message:'post id is required'}
        )
    }
    likeService.create(req.body)
        .then((like) => res.json({message:'success',like:like}))
        .catch(err => next(err));
}

function getLikeDetails(req, res, next) {
    if(!req.body.id){
        res.status(422).json(
            {message:'Id is required'}
        )
    }
    likeService.getById(req.params.id)
        .then(like => like ? res.json(like) : res.sendStatus(404))
        .catch(err => next(err));
}

function getLikeByPost(req, res, next) {
    if(!req.body.id){
        res.status(422).json(
            {message:'Id is required'}
        )
    }
    likeService.getpostlikes(req.params.id)
        .then(likes => likes ? res.json(likes) : res.sendStatus(404))
        .catch(err => next(err));
}
function deletepostlike(req, res, next) {
    if(!req.body.post){
        res.status(422).json(
            {message:'Post id is required'}
        )
    }
    likeService.deletepostlike(req.body.post,req.user.sub)
        .then(likes => likes ? res.json(likes) : res.sendStatus(404))
        .catch(err => next(err));
}

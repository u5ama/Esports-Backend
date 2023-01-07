const express =  require('express');
const router = express.Router();
const commentService = require('./comments.services');
const middleware = require('middleware').checkToken;


router.post('/', middleware, create);
router.get('/all/:type/:id', middleware, getAll);
router.get('/:type/:id/:commentId', middleware, getById);
router.put('/:type/:id/:commentId', middleware, update);
router.delete('/:type/:id/:commentId', middleware, _delete);

module.exports = router;

function create(req, res, next) {
    let params = {
        user_id: req.body.user_id,
        comment: req.body.comment,
        emoji: req.body.emoji,
        type: req.body.related_to,
        id: req.body.id
    }
    commentService.create(params)
        .then(() =>  res.json({status: true, message: 'Comment added successfully!'}))
        .catch((err) => next(err))
}

function getAll(req, res, next) {
    commentService.getAll(req.params)
        .then((post) => { res.json({status: true, data: post[0].discussions}) })
        .catch(err => next(err))
}

function getById(req, res, next) {
    console.info('inside threads getById', req.params);
    commentService.getById(req.params.id)
        .then(thread => res.json({status: true, data: thread}))
        .catch(err => next(err));
}

function update(req, res, next){
    let data = req.body;
    if(req.file && req.file.filename) {
        data.image = req.file.filename;
    }

    commentService.update(req.params.id, data)
        .then(() => res.json({status: true, message: 'Group updated successfully!'}))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    commentService.delete(req.params.id)
        .then(() => res.json({status: true, message: 'Group deleted successfully!'}))
        .catch(error => next(error));
}
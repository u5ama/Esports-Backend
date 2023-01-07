const express =  require('express');
const router = express.Router();
const multer = require('multer');
const threadService = require('./threads.services');
const middleware = require('middleware').checkToken;
const path = require('path');
/**
 * loading GM to create image thubmnails.
 * @type {DiskStorage}
 */
const fs = require('fs');
const gm = require('gm').subClass({imageMagick: true});

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './uploads/threads'),
    filename: (req, file, cb) => cb(null, file.fieldname + '-' + Date.now())
});

const threadUpload = multer({storage});

router.post('/', middleware, threadUpload.single('image'), create);
router.get('/', middleware, getAll);
router.get('/:id', middleware, getById);
router.get('/get-by-group/:id', middleware, getByGroupId);
router.put('/:id', middleware, threadUpload.single('image'), update);
router.delete(':id', middleware, _delete);

module.exports = router;

function create(req, res, next) {
    //console.info('thread data: ', req.body, req.params, req.file);

    setTimeout(function(){
        gm('./uploads/threads/'+req.file.filename)
            .resize(64, 64, '!')
            .write('./uploads/threads/thumb-'+req.file.filename, function (err) {
                if (!err) {
                    let params = {
                        title:  req.body.name,
                        description:  req.body.description,
                        image:  req.file.filename,
                        group:  req.body.group_id,
                        user: req.body.user_id
                    };

                    threadService.create(params)
                        .then(() =>  res.json({status: true, message: 'Thread created successfully!'}))
                        .catch((err) => next(err))
                }
            });
    }, 1000);


    /*if(req.file.filename) {
        params.image = req.file.filename;
    }*/
    /*threadService.create(params)
        .then(() =>  res.json({status: true, message: 'Thread created successfully!'}))
        .catch((err) => next(err))*/
}

function getAll(req, res, next) {
    threadService.getAll(req, res, next)
        .then((groups) => res.json({status: true, data: groups}))
        .catch(err => next(err))
}

function getById(req, res, next) {
    threadService.getById(req.params.id)
        .then(thread => res.json({status: true, data: thread}))
        .catch(err => next(err));
}
function getByGroupId(req, res, next) {
    threadService.getByGroupId(req.params.id)
        .then(thread => res.json({status: true, data: thread}))
        .catch(err => next(err));
}

function update(req, res, next){
    let data = req.body;
    if(req.file && req.file.filename) {
        data.image = req.file.filename;
    }

    threadService.update(req.params.id, data)
        .then(() => res.json({status: true, message: 'Group updated successfully!'}))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    threadService.delete(req.params.id)
        .then(() => res.json({status: true, message: 'Group deleted successfully!'}))
        .catch(error => next(error));
}
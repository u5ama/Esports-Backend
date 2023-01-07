const express =  require('express');
const router = express.Router();
const multer = require('multer');
const groupService = require('./groups.services');
const threadService = require('../threads/threads.services');
const middleware = require('middleware').checkToken;
const path = require('path');
/**
 * loading GM to create image thubmnails.
 * @type {DiskStorage}
 */
const fs = require('fs');
const gm = require('gm').subClass({imageMagick: true});

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        var fs = require('fs');
        var dir = './uploads/groups';
        if (!fs.existsSync(dir)){fs.mkdirSync(dir);}
        callback(null, './uploads/groups');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now()+ path.extname(file.originalname))
    }
    // destination: (req, file, cb) => cb(null, './uploads/groups'),
    // filename: (req, file, cb) => cb(null, file.fieldname + '-' + Date.now())
});

var groupUpload = multer({storage});

router.post('/', middleware, groupUpload.single('image'), create);
router.get('/', middleware, getAll);
router.get('/widget-groups', middleware, getWidgetGroups)
router.get('/:id', middleware, getById);
router.put('/:id', middleware, groupUpload.single('image'), update);
router.delete(':id', middleware, _delete);

router.post('/join', middleware, join)
router.get('/threads/:id', middleware, getThreadsByGroup)
router.get('/by-user/:user_id', middleware, getGroupsByUser)
router.get('/all-by-user/:user_id', middleware, getAllGroupsByUser)
router.post('/search', middleware, searchGroups)
router.post('/add-to-widget', middleware, addToWidget)
router.post('/remove-from-widget', middleware, removeFromWidget)

module.exports = router;

function getWidgetGroups(req, res, next) {
    groupService.getWidgetGroups(req.query)
        .then((groups) => res.json({status: true, message: 'done', data: groups}))
        .catch((err) => next(err))
}

function addToWidget(req, res, next) {
    groupService.addToWidget({id: req.body.group_id, userId: req.body.user_id})
        .then(group => res.json({status: true, message: 'done'}))
        .catch(error => next(error))
}

function removeFromWidget(req, res, next) {
    groupService.removeFromWidget({groupId: req.body.group_id, userId: req.body.user_id})
        .then(group => {
            res.json({status: true, message: 'done', data: group})
        })
        .catch(error => next(error))
}

function join(req, res, next){

    groupService.CheckIfMemberExists(req.body.groupId, req.body.userId)
        .then((group) => {

            if(group != null) {
                groupService.leave(req.body)
                    .then(() => res.json({status: true, message: 'You left group successfully!'}))
                    .catch(err => next(err));

            } else {
                groupService.join(req.body)
                    .then(() => res.json({status: true, message: 'You joined group successfully!'}))
                    .catch(err => next(err));
            }

        })
        .catch(err => next(err));
}

function searchGroups(req, res, next) {
    groupService.searchGroups(req.body.q)
        .then((results) => res.json({status: true, message: 'done', data: results}))
        .catch((err) => next(err))
}

function getThreadsByGroup(req, res, next) {
    threadService.getByGroupId(req.params.id)
        .then(threads => res.json({status: true, data: threads}))
        .catch()
}

function getGroupsByUser(req, res, next) {
    groupService.getByUser(req.params.user_id)
        .then((groups) => res.json({status: true, message: 'done', data: groups}))
        .catch((err) => next(err))
}

function getAllGroupsByUser(req, res, next) {
    groupService.getAllByUser(req.params.user_id)
        .then((groups) => res.json({status: true, message: 'done', data: groups}))
        .catch((err) => next(err))
}


function __createGroup(params, res, next)
{
    groupService.create(params)
        .then((group) =>  {
            groupService.createDefaultThreads(group._id, group.groupOwner)
                .then((response) => {
                    res.json({
                        status: true,
                        message: 'Group created successfully!',
                        group: group._id
                    })
                })
                .catch((err) => next(err))
        })
        .catch((err) => next(err))
}
function create(req, res, next) {
    let params = req.body;
    params.groupOwner = req.body.user_id;

    if(req.file && req.file.filename) {
        params.image = req.file.filename;
        setTimeout(function(){
            gm('./uploads/groups/'+req.file.filename)
                .resize(64, 64, '!')
                .write('./uploads/groups/thumb-'+req.file.filename, function (err) {
                    if (!err) {
                        __createGroup(params, res, next);
                    }
                });
        }, 1000);
    } else {
        __createGroup(params, res, next);
    }
}

function getAll(req, res, next) {
    groupService.getAll(req, res, next)
        .then((groups) => res.json({status: true, data: groups}))
        .catch(err => next(err))
}

function getById(req, res, next) {
    groupService.getById(req.params.id)
        .then(group => {
            res.json({status: true, data: [group]})
        })
        .catch(err => next(err));
}

function update(req, res, next){
    let data = req.body;
    if(req.file && req.file.filename) {
        data.image = req.file.filename;
    }

    groupService.update(req.params.id, data)
        .then(() => res.json({status: true, message: 'Group updated successfully!'}))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    groupService.delete(req.params.id)
        .then(() => res.json({status: true, message: 'Group deleted successfully!'}))
        .catch(error => next(error));
}
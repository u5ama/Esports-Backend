const express  = require('express');
const router = express.Router();
const middleware = require('middleware').checkToken;
const notificationService = require('./notifications.services');

router.post('/', middleware, create);
router.get('/get-all-by-user', middleware, getAllByUser);
module.exports = router;

function __create(params) {
    //console.info('params: ', params);
}

function create(req, res, next) {
    //console.info('req.body: ', req.body);
}

function getAllByUser(req, res, next) {
    let params = req.query;
    //console.info('getting all notifications: ', req.body, req.params, req.query);
    notificationService.getAllByUser(params)
        .then((notifications) => {
            res.json({
                status: true,
                data: notifications
            });
        })
        .catch((err) => next(err));
}
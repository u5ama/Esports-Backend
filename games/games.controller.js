const express = require('express');
const router = express.Router();
const gamesService = require('./games.services');
const {checkSchema, check, validationResult} = require('express-validator');
const multer = require('multer');
const path = require('path');
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads/games');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
var userUpload = multer({storage: storage});

// routes
router.post('/', userUpload.single("image"), validate('createGame'), create);
router.get('/', getAll);
router.get('/current', getCurrent);
router.get('/:id', getById);
router.put('/:id', userUpload.single("image"), validate('updateGame'), update);
router.delete('/:id', _delete);

module.exports = router;

function create(req, res, next) {
    // Finds the validation errors in this request and wraps them in an object with handy functions

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: "failed",
            errors: errors.array(),
            is_success: false
        });
    }

    gamesService.create({
        name: req.body.name,
        description: req.body.description,
        image: req.file.filename
    })
        .then(() => res.json({status: true, message: 'Game created successfully!'}))
        .catch(err => {
            res.status(401).json({status: false, message: err});
            next(err)
        });
}

function getAll(req, res, next) {
    gamesService.getAll()
        .then(users => res.json(users))
        .catch(err => next(err));
}

function getCurrent(req, res, next) {
    gamesService.getById(req.user.sub)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function getById(req, res, next) {
    gamesService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function update(req, res, next) {

    let data = req.body;
    if(req.file.filename) {
        data.image = req.file.filename;
    }

    gamesService.update(req.params.id, data)
        .then(() => res.json({status: true, message: 'Game updated successfully!'}))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    gamesService.delete(req.params.id)
        .then(() => res.json({status: true, message: 'Game deleted successfully!'}))
        .catch(err => next(err));
}


function validate(method) {
    switch (method) {
        case 'createGame': {
            return [
                check('name', 'Name doesn\'t exists in request body').exists().not().isEmpty().withMessage('Name is empty'),
                //check('image', 'image doesn\'t exists in request body').exists().not().isEmpty().withMessage('image is empty'),
                check('description', 'Description doesn\'t exists in request body').exists().not().isEmpty().withMessage('Description is empty'),

            ]
        }

        case 'updateGame': {
            return [
                check('name', 'Name doesn\'t exists in request body').exists().not().isEmpty().withMessage('Name is empty'),
                //check('image', 'image doesn\'t exists in request body').exists().not().isEmpty().withMessage('image is empty'),
                check('description', 'Description doesn\'t exists in request body').exists().not().isEmpty().withMessage('Description is empty'),

            ]
        }
    }
}
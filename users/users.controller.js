const express = require('express');
const router = express.Router();
const userService = require('./user.service');
const {checkSchema, check, validationResult} = require('express-validator');
const multer = require('multer');
const path = require('path');

const middleware = require('middleware').checkToken;

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        var fs = require('fs');
        var dir = './uploads/users';
        if (!fs.existsSync(dir)){fs.mkdirSync(dir);}
        callback(null, './uploads/users');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now()+ path.extname(file.originalname))
    }
});
var userUpload = multer({storage: storage});

// routes
router.post('/authenticate', authenticate);
router.post('/register', validate('register'), register);
router.get('/', middleware, getAll);
router.get('/current', middleware, getCurrent);
router.get('/:id', middleware, getById);
router.post('/search', middleware, searchUsers)
router.get('/username/:username', middleware,validate('findbyusername'), getByUsername);
router.put('/', middleware,userUpload.fields([{ name: 'profileImage', maxCount: 1 },{ name: 'coverImage', maxCount: 1 }]), update);
router.delete('/:id', middleware, _delete);
router.get('/get-to-know-users/:id', getToKnowUsers);
router.post('/add-friend', addFriend);
module.exports = router;


function searchUsers(req, res, next) {
    userService.search(req.body.q)
        .then((results) => res.json({status: true, message: 'done', data: results}))
.catch((err) => next(err))
}

function addFriend(req, res, next) {
    userService.addFriend(req.body.user_id, req.body.friend_id)
        .then(function (isAdded) {
            if(isAdded) {
                //console.info('is isAdded: ', isAdded);
                let userData = userService.getById(isAdded._id).then( (response) => {return resopnse._id} );
                //console.info('is userData: ', userData);
                //res.json({status: true, message: 'Added friend!', id: isAdded.friends[isAdded.friends.length - 1]._id});
            } else {
                res.status(400).json({message: 'Unable to add friend!'});
            }
        })
        .catch(err => next(err))
}
function getToKnowUsers(req, res, next) {

    userService.getToKnowUsers(req.params.id)
        .then(function(user) {
            user ? res.json(user) : res.status(400).json({message: 'Username not exists!'});
        })
        .catch(err => next(err));
}

function authenticate(req, res, next) {

    if(!req.body.password || !req.body.email){
        res.status(422).json(
        {message:'email and password is required is required'}
        )
    }
    userService.authenticate(req.body)
        .then(user => user ? res.json(user) : res.status(400).json({ message: 'Username or password is incorrect' })
        )
        .catch(err => next(err));
}

function register(req, res, next) {

    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: "failed",
            errors: errors.array(),
            is_success: false
        });
    }

    userService.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(err => next(err));
}

function getCurrent(req, res, next) {
    userService.getById(req.user.sub)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}
function getByUsername(req, res, next) {
    userService.getByUsername(req.params.username)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function update(req, res, next) {
    let data = req.body;
    req.files = JSON.parse(JSON.stringify(req.files));
    if(req.files.hasOwnProperty('coverImage')) {
        data.coverImage = req.files.coverImage[0].filename;
    }
    if(req.files.hasOwnProperty('profileImage')) {
        data.profileImage = req.files.profileImage[0].filename;
    }
    /*if(req.hasOwnProperty('file')) {
        data.profileImage = req.file.filename;
    }*/
    userService.update(req.user.sub, data)
        .then((user) => res.json({status: true, message: 'Profile updated successfully!', data: user}))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}
function validate(method) {
    switch (method) {
        case 'register': {
            return [
                check('firstName', 'firstName doesn\'t exists in request body').exists().not().isEmpty().withMessage('first_name is empty'),
                check('games', 'games doesn\'t exists in request body').exists().not().isEmpty().withMessage('games is empty'),
                check('lastName', 'lastName doesn\'t exists in request body').exists().not().isEmpty().withMessage('last_name is empty'),
                check('username', 'username doesn\'t exists in request body').exists().not().isEmpty().withMessage('fullName is empty'),
                check('email', 'Invalid email in request body').exists().isEmail().not().isEmpty().withMessage('email is empty'),
                check('password', 'Password doesn\'t exists in request body').exists().not().isEmpty().withMessage('password is empty'),
            ]
        }

        case 'authenticate': {
            return [
                check('username', 'username doesn\'t exists in request body').exists(),
                check('password', 'Password doesn\'t exists in request body').exists()
            ]
        }

        case 'findbyusername': {
            return [
                check('username', 'username doesn\'t exists in request body').exists()
            ]
        }
    }
}

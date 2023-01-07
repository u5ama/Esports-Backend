require('rootpath')();
require('dotenv').config();

const express = require('express');
const app = express();
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
// const jwt = require('_helpers/jwt');
const errorHandler = require('_helpers/error-handler');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//app.use(cors());

// use JWT auth to secure the api
// app.use(jwt());

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,DELETE,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");
    next();
});

// api routes
app.use('/likes', require('./likes/likes.controller'));
app.use('/users', require('./users/users.controller'));
app.use('/posts', require('./posts/posts.controller'));
app.use('/friends', require('./friends/friends.controller'));
app.use('/games', require('./games/games.controller'));
app.use('/groups', require('./groups/groups.controller'));
app.use('/threads', require('./threads/threads.controller'));
app.use('/comments', require('./comments/comments.controller'));
app.use('/follows', require('./follows/follows.controller'));
app.use('/streams', require('./streams/streams.controller'));
app.use('/notifications', require('./notifications/notifications.controller'));


app.get('/image/:relatedTo/:image', function (req, res) {
	req.rootPath = __dirname;
	let imagePath = req.rootPath + '/uploads/' + req.params.relatedTo +'/' + req.params.image;

	fs.readFile(imagePath, function (err, content) {
		if (err) {
			res.writeHead(400, {'Content-type':'text/html'})
			res.end("No such image");
		} else {
			//specify the content type in the response will be an image
			res.writeHead(200,{'Content-type':'image/jpg'});
			res.end(content);
		}
	});
});

// global error handler
app.use(errorHandler);


// use it before all route definitions
//app.use(cors({origin: 'https://esportsssm-dev.serverdatahost.com'}));
// start server
const port = process.env.PORT || 5011;

var web_server = {};
var web = {};

if (process.env.IS_USE_SSL == 'true') {
	web = require('https');
	console.info('using ssl');
	const httpOptions = {
		key: fs.readFileSync(process.env.SSL_KEY),
		cert: fs.readFileSync(process.env.SSL_CERT),
		requestCert: false,
		rejectUnauthorized: false
	};
	web_server = web.createServer(httpOptions, app);
} else {
	web = require('http');
	web_server = web.createServer(app);
}

web_server.listen(port, () => console.log(`Listing on port ${port}`));

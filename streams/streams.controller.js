const express = require('express');
const router = express.Router();
const middleware = require('middleware').checkToken;
require('dotenv').config();
const request = require('request');
const streamService = require('./streams.service');
const timestamp = Math.round(new Date().getTime()/1000);

//routes
router.post('/add-to-widget', middleware, addToWidget);
router.get('/getAllStreams', middleware, getAll);
router.get('/getUserStreams', middleware, getUserAll);
router.get('/getFriendStream', middleware, getFriendsStreams);
router.get('/getFollowerStream', middleware, getFollowersStreams);
router.post('/createstream', middleware, createStream);
router.put('/updatestream/:streamid', middleware, updateStream);
router.get('/getById/:id', middleware, getStreamById);
router.get('/getStreamById/:id', middleware, getthisStreamById);
router.put('/start/:streamid', middleware, startStream);
router.put('/stop/:streamid', middleware, stopStream);
router.get('/getId', middleware, getById);
router.delete('/deletestream/:streamid', middleware,deleteStream);
router.get('/widget-streams', middleware, getWidgetStreams);
router.post('/remove-from-widget', middleware, removeFromWidget)

router.post('/add-to-widget', middleware, addToWidget)
router.post('/remove-from-widget', middleware, removeFromWidget)
router.get('/widget-streams', middleware, getWidgetStreams);

module.exports = router;

async function createStream(req, res, next) {
    const endpoint = 'live_streams';
    const options = {
        'method': 'POST',
        'url': process.env.WSC_API_URL+endpoint,
        'headers': {
            'Content-Type': 'application/json',
            'wsc-api-key': process.env.WSC_API_KEY,
            'wsc-access-key': process.env.WSC_ACCESS_KEY,
            'wsc-timestamp': timestamp
        },
        body: JSON.stringify({
            "live_stream": {
                "aspect_ratio_height": 1080,
                "aspect_ratio_width": 1920,
                "billing_mode": "pay_as_you_go",
                "broadcast_location": "us_west_california",
                "encoder": "wowza_gocoder",
                "name": req.body.st_title,
                "transcoder_type": "transcoded",
                "closed_caption_type": "none",
                "delivery_method": "push",
                "delivery_protocols": [],
                "delivery_type": "single-bitrate",
                "disable_authentication": false,
                "hosted_page": false,
                "hosted_page_description": "My Hosted Page Description",
                "hosted_page_sharing_icons": true,
                "hosted_page_title": "Sample",
                "low_latency": false,
                "password": req.body.st_password,
                "player_countdown": true,
                "player_countdown_at": "2019-01-30 17:00:00 UTC",
                "player_logo_position": "top-right",
                "player_responsive": false,
                "player_type": "original_html5",
                "player_width": 640,
                "recording": true,
                "remove_hosted_page_logo_image": true,
                "remove_player_logo_image": true,
                "remove_player_video_poster_image": true,
                "source_url": "xyz.streamlock.net/vod/mp4:Movie.mov",
                "target_delivery_protocol": "hls-https",
                "use_stream_source": false,
                "username": req.body.st_user
            }
        })
    };
    let params = {};
    req.body.createdBy = req.user.sub;
    params = Object.assign(params, req.body);
        params.stream_title = req.body.st_title,
        params.stream_user = req.body.st_user,
        params.stream_password = req.body.st_password,

    await request(options, function (error, resp) {
        if (error) next(error);
        const response = JSON.parse(resp.body)
        params.stream_id = response.live_stream.id;
        streamService.create(params);
        res.json(response)
    });
}

async function getAll(req, res, next) {
    streamService.getAll(req.user.sub)
        .then(stream => res.json(stream))
        .catch(err => next(err));
}

async function getUserAll(req, res, next) {
    streamService.getUserAll(req.user.sub)
        .then(stream => res.json(stream))
        .catch(err => next(err));
}

async function getFriendsStreams(req, res, next) {
    const User = req.user.sub;
    streamService.getAllFriends(User)
        .then(stream => res.json(stream))
        .catch(err => next(err));
}
async function getFollowersStreams(req, res, next) {
    const User = req.user.sub;
    streamService.getAllFollowers(User)
        .then(stream => res.json(stream))
        .catch(err => next(err));
}

async function getStreamById(req, res, next) {
    const endpoint = 'live_streams/';
    const options = {
        'method': 'GET',
        'url': process.env.WSC_API_URL + endpoint + req.params.id,
        'headers': {
            'Content-Type': 'application/json',
            'wsc-api-key': process.env.WSC_API_KEY,
            'wsc-access-key': process.env.WSC_ACCESS_KEY,
            'wsc-timestamp': timestamp
        }
    };
    await request(options, function (error, response) {
        if (error) next(error);
        res.send(response.body);
    });
}

async function getthisStreamById(req, res, next) {
    const endpoint = 'live_streams/';
    const options = {
        'method': 'GET',
        'url': process.env.WSC_API_URL + endpoint + req.params.id,
        'headers': {
            'Content-Type': 'application/json',
            'wsc-api-key': process.env.WSC_API_KEY,
            'wsc-access-key': process.env.WSC_ACCESS_KEY,
            'wsc-timestamp': timestamp
        }
    };
    await request(options, function (error, response) {
        if (error) next(error);
        res.send(response.body);
        streamService.countViews(req.params.id)
            .then(stream => res.json(stream))
            .catch(err => next(err));
    });
}

async function updateStream(req, res, next) {
    const endpoint = 'live_streams/';
    const options = {
        'method': 'PATCH',
        'url': process.env.WSC_API_URL+endpoint+req.params.streamid,
        'headers': {
            'Content-Type': 'application/json',
            'wsc-api-key': process.env.WSC_API_KEY,
            'wsc-access-key': process.env.WSC_ACCESS_KEY,
            'wsc-timestamp': timestamp
        },
        body: JSON.stringify({
            "live_stream": {
                "aspect_ratio_height": 1080,
                "aspect_ratio_width": 1920,
                "billing_mode": "pay_as_you_go",
                "broadcast_location": "us_west_california",
                "encoder": "wowza_gocoder",
                "name": req.body.st_title,
                "transcoder_type": "transcoded",
                "closed_caption_type": "none",
                "delivery_method": "push",
                "delivery_protocols": [],
                "delivery_type": "single-bitrate",
                "disable_authentication": false,
                "hosted_page": false,
                "hosted_page_description": "My Hosted Page Description",
                "hosted_page_sharing_icons": true,
                "hosted_page_title": "Sample",
                "low_latency": false,
                "password": req.body.st_password,
                "player_countdown": true,
                "player_countdown_at": "2019-01-30 17:00:00 UTC",
                "player_logo_position": "top-right",
                "player_responsive": false,
                "player_type": "original_html5",
                "player_width": 640,
                "recording": true,
                "remove_hosted_page_logo_image": true,
                "remove_player_logo_image": true,
                "remove_player_video_poster_image": true,
                "source_url": "xyz.streamlock.net/vod/mp4:Movie.mov",
                "target_delivery_protocol": "hls-https",
                "use_stream_source": false,
                "username": req.body.st_user
            }
        })
    };
    let params = {};
    req.body.createdBy = req.user.sub;
    params = Object.assign(params, req.body);
    params.stream_title = req.body.st_title,
        params.stream_user = req.body.st_user,
        params.stream_password = req.body.st_password,

    await request(options, function (error, resp) {
        if (error) next(error);
        const response = JSON.parse(resp.body)
        params.stream_id = response.live_stream.id;
        streamService.update(req.user.sub,params);
        res.json(response)
    });
}

async function deleteStream(req, res, next) {
    const endpoint = 'live_streams/';
    const options = {
        'method': 'DELETE',
        'url': process.env.WSC_API_URL + endpoint + req.params.streamid,
        'headers': {
            'Content-Type': 'application/json',
            'wsc-api-key': process.env.WSC_API_KEY,
            'wsc-access-key': process.env.WSC_ACCESS_KEY,
            'wsc-timestamp': timestamp
        }
    };
    await request(options, function (error, resp) {
        if (error) next(err);
        //const response = JSON.parse(resp.body);
        streamService.delete(req.user.sub);
        res.send(resp.body);
    });
}

async function startStream(req, res, next) {

    const endpoint = 'live_streams/';
    const options = {
        'method': 'PUT',
        'url': process.env.WSC_API_URL + endpoint + req.params.streamid + '/start',
        'headers': {
            'Content-Type': 'application/json',
            'wsc-api-key': process.env.WSC_API_KEY,
            'wsc-access-key': process.env.WSC_ACCESS_KEY,
            'wsc-timestamp': timestamp
        }
    };
    await request(options, function (error, resp) {
        if (error) next(error);
        let params = {};
        const response = JSON.parse(resp.body)
        if(response.live_stream !== ''){
            params.stream_status = response.live_stream.state;
            streamService.updStatus(req.user.sub,params);
        }else{
            res.json(response)
        }
        res.json(response)
    });
}
async function stopStream(req, res, next) {

    const endpoint = 'live_streams/';
    const options = {
        'method': 'PUT',
        'url': process.env.WSC_API_URL + endpoint + req.params.streamid + '/stop',
        'headers': {
            'Content-Type': 'application/json',
            'wsc-api-key': process.env.WSC_API_KEY,
            'wsc-access-key': process.env.WSC_ACCESS_KEY,
            'wsc-timestamp': timestamp
        }
    };
    await request(options, function (error, resp) {
        if (error) next(error);
        let params = {};
        const response = JSON.parse(resp.body)
        if(response.live_stream !== ''){
            params.stream_status = response.live_stream.state;
            streamService.updStatus(req.user.sub,params);
        }else{
            res.json(response)
        }
        res.json(response)
    });
}
/*
async function getThumbnails(req, res, next) {

    const endpoint = 'live_streams/';
    const options = {
        'method': 'GET',
        'url': process.env.WSC_API_URL + endpoint + req.params.streamid + '/thumbnail_url',
        'headers': {
            'Content-Type': 'application/json',
            'wsc-api-key': process.env.WSC_API_KEY,
            'wsc-access-key': process.env.WSC_ACCESS_KEY,
            'wsc-timestamp': timestamp
        }
    };
    await request(options, function (error, resp) {
        if (error) next(error);
        let params = {};
        const response = JSON.parse(resp.body)
        if(response.live_stream !== ''){
            const promiseProducer = function () {
                params.stream_thumbnail = response.live_stream.thumbnail_url;
                streamService.updThumb(req.params.streamid, params);
            };

        }else{
            res.json(response)
        }
        res.json(response)
    });
}*/

/*async function getSaveThumbnails(streamid) {

    const endpoint = 'live_streams/';
    const options = {
        'method': 'GET',
        'url': process.env.WSC_API_URL + endpoint + streamid + '/thumbnail_url',
        'headers': {
            'Content-Type': 'application/json',
            'wsc-api-key': process.env.WSC_API_KEY,
            'wsc-access-key': process.env.WSC_ACCESS_KEY,
            'wsc-timestamp': timestamp
        }
    };
    await request(options, function (error, resp) {
        if (error) next(error);
        let params = {};
        const response = JSON.parse(resp.body)
        if(response.live_stream !== ''){
            params.stream_thumbnail = response.live_stream.thumbnail_url;
            //console.log(response.live_stream.thumbnail_url);
            streamService.updThumb(streamid, params).then(()=>{
                //console.log(resp.body)
            }).catch(()=>{
                console.log("failed");
            })
        }else{

        }
    });
}*/

function getById(req, res, next) {
    streamService.getById(req.user.sub)
        .then(stream => res.json(stream))
        .catch(err => next(err));
}

function addToWidget(req, res, next) {
    streamService.addToWidget({stream_id: req.body.stream_id, userId: req.body.user_id})
        .then(stream => res.json({status: true, message: 'done'}))
        .catch(error => next(error))
}

function getWidgetStreams(req, res, next) {
    streamService.getWidgetStreams(req.query)
        .then((groups) => res.json({status: true, message: 'done', data: groups}))
        .catch((err) => next(err))
}

function removeFromWidget(req, res, next) {
    streamService.removeFromWidget({streamId: req.body.stream_id, userId: req.body.user_id})
        .then(stream => {
            res.json({status: true, message: 'done', data: stream})
        })
        .catch(error => next(error))
}

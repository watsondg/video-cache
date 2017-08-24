'use strict';

var test = require('tape');
var VideoCache = require('../index.js');

/*
    Tests are run using Big Buck Bunny
    trailer converted using Miro &/or Handbrake
    (not on the repo)
 */
var VIDEO_NAME = 'trailer_480p';
var FORMATS = ['webm', 'mp4', 'ogv'];
var BASE = 'test/';

// test video load
test('Video load test', function(assert) {
    var videoCache = new VideoCache({
        formats: FORMATS,
        baseURL: BASE
    });
    videoCache.once('load', function() {
        videoCache.destroy();
        assert.pass('Loaded video');
        assert.end();
    });
    videoCache.load([VIDEO_NAME]);
});

// test video format
test('Formats test', function(assert) {
    var videoCache = new VideoCache({
        formats: FORMATS,
        baseURL: BASE
    });
    videoCache.once('load', function() {
        var video = videoCache.get(VIDEO_NAME);
        assert.ok(video.children.length === 1, 'The video should have only one source.');
        videoCache.destroy();
        assert.end();
    });
    videoCache.load([{
        path: VIDEO_NAME,
        formats: ['mp4']
    }]);
});

// test get + play
test('Playback test', function(assert) {
    var videoCache = new VideoCache({
        formats: FORMATS,
        baseURL: BASE
    });
    videoCache.once('load', function() {
        function onPlay() {
            assert.pass('Video should play fine.');
            video.removeEventListener('playing', onPlay);
            videoCache.destroy();
            assert.end();
        }
        var video = videoCache.get(VIDEO_NAME);
        video.addEventListener('playing', onPlay);
        video.play();
    });
    videoCache.load([VIDEO_NAME]);
});

// test get + clear + get
test('Clear playback test', function(assert) {
    var videoCache = new VideoCache({
        formats: FORMATS,
        baseURL: BASE
    });
    videoCache.once('load', function() {
        function onPlay() {
            assert.pass('Video should play fine.');
            video.removeEventListener('playing', onPlay);
            videoCache.destroy();
            assert.end();
        }
        var video = videoCache.get(VIDEO_NAME);
        videoCache.clear(VIDEO_NAME);
        video = videoCache.get(VIDEO_NAME);
        video.addEventListener('playing', onPlay);
        video.play();
    });
    videoCache.load([VIDEO_NAME]);
});

// test CORS
test('CORS test', function(assert) {
    var anonymous = 'anonymous';
    var videoCache = new VideoCache({
        formats: FORMATS,
        baseURL: BASE,
        crossOrigin: anonymous
    });
    videoCache.once('load', function() {
        var video = videoCache.get(VIDEO_NAME);
        assert.ok(video.crossOrigin == anonymous, 'Video CORS should be anonymous.');
        videoCache.clear(VIDEO_NAME);
        videoCache.destroy();
        assert.end();
    });
    videoCache.load([VIDEO_NAME]);
});


// test destroy
test('Destroy test', function(assert) {
    var videoCache = new VideoCache({
        formats: FORMATS,
        baseURL: BASE
    });
    videoCache.once('load', function() {
        var video = videoCache.get(VIDEO_NAME);
        assert.ok(!!video, 'Video should exist.');
        videoCache.clear(VIDEO_NAME);
        videoCache.destroy();

        try {
            video = videoCache.get(VIDEO_NAME);
        } catch(e) {
            assert.pass('VideoCache should throw an error.');
        }
        assert.end();
    });
    videoCache.load([VIDEO_NAME]);
});

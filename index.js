'use strict';

var EXT_REGEX = /\.(mp4|webm|ogg|ogv)$/i;
var NAME_REGEX = /(.+?)(\.[^.]*$|$)/;
var Emitter = require('tiny-emitter');

module.exports = VideoCache;
function VideoCache(options) {
    options = options || {};
    this.baseURL = options.baseURL || '';
    this.formats = options.formats || ['webm', 'mp4', 'ogv', 'ogg'];
    this.eventName = options.eventName || 'canplaythrough';
    this.assetsLoaded = 0;
    this.totalAssets = 0;
    this.cache = Object.create(null); // Pure hash, no prototype
    this.el = document.createElement('div');
    this.el.style.display = 'none';
    document.body.appendChild(this.el);

    this.onError = this.onError.bind(this);
}

VideoCache.prototype = Object.create(Emitter.prototype);

VideoCache.prototype.load = function(videos) {
    this.totalAssets = videos.length;

    videos.forEach(function(url) {
        var video = document.createElement('video');

        var formats = url.formats || this.formats;
        var videoId = url.path || url;

        // Clean listeners on load
        video.onerror = this.onError;

        var onVideoReady = function(video) {
            video.onerror = null;
            video['on' + this.eventName] = null;
            this.onVideoLoad(videoId, video);
        }.bind(this, video);

        if (video.readyState > 3) onVideoReady();
        else video['on' + this.eventName] = onVideoReady;

        // Add source for every URL (format)
        addSources(video, this.baseURL + videoId, formats);

        video.muted = true;
        video.loop = true;
        video.preload = 'metadata';
        this.el.appendChild(video);
        video.load();
        // video.play();
    }, this);

    return this;
};

VideoCache.prototype.onVideoLoad = function(videoId, video) {
    this.assetsLoaded++;
    video.pause();
    video.currentTime = 0;
    this.cache[videoId] = video;

    this.emit('progress', this.assetsLoaded / this.totalAssets);

    if (this.assetsLoaded >= this.totalAssets) this.onLoad();
};

VideoCache.prototype.onLoad = function() {
    this.emit('load');
    this.off();
};

VideoCache.prototype.onError = function(error) {
    this.emit('error', error);
};

VideoCache.prototype.get = function(id, addToCache) {
    if (!this.cache) throw new Error('VideoCache has been destroyed.');

    var video = this.cache[id] || createVideo(id, this.baseURL, this.formats);
    if (addToCache && !this.cache[id]) this.cache[id] = video;

    video.muted = false;
    if (video.readyState > 3) video.currentTime = 0;
    return video;
};

VideoCache.prototype.clear = function(id) {
    var video = this.cache[id];
    if (!video) return;

    video.pause();
    video.currentTime = 0;
};

VideoCache.prototype.destroy = function() {
    for (var id in this.cache) {
        var video = this.cache[id];
        video.pause();
        video['on' + this.eventName] = null;
        video.onerror = null;
        Array.prototype.slice.call(video.children).forEach(function(source) {
            source.src = '';
        });
        video.load();
        if (video.remove) video.remove();
        else video.parentNode.removeChild(video);
    }
    this.el.parentNode.removeChild(this.el);
    this.cache = null;
};

function addSources(video, url, formats) {
    var source = formats.reduce(function(sources, format) {
        return sources + [
            '<source ',
            'type="video/' + format + '" ',
            'src="' + url + '.' + format + '">'
        ].join('');
    }, '');
    video.innerHTML = source;
}

function createVideo(url, baseURL, formats) {
    var video = document.createElement('video');
    var videoId = url.path || url;
    addSources(video, baseURL + videoId, formats);
    return video;
}

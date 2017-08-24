video-cache
===

Preload a set of videos and keep them in memory to avoid reloading them on page change.

Note that the videos will hang around in memory, so this library is intended to use with a small number of videos.
On mobile and tablets you might need a user interaction to play the videos.

## Install

```
npm install watsondg/video-cache -S
```

## Usage

```
var VideoCache = require('video-cache');

var videoCache = new VideoCache();
videoCache.load([
    formats: ['mp4', 'webm'],
    'intro', // will try intro.mp4 and intro.webm
    {
        path: 'intro',
        formats: ['mp4']
    } // will try intro.mp4 only
]);

videoCache.once('load', function() {
    var video = videoCache.get('intro');
    video.play();
});

```

## Instance Methods

### new VideoCache([options])

Create a new instance of VideoCache.
* `options` - (OPTIONAL) - configuration parameters:
- baseURL: the baseURL to prepend to all video paths.
- formats: limit and order supported formats. Defaults to `webm, mp4, ogv, ogg`.
- eventName: The event used to detect video load. Defaults to `canplaythrough`.
- crossOrigin: CORS attribute. Defaults to `undefined` (no CORS).


### load(videos)

Load an array of videos and append them to the cache.

* `videos` - an array containing:
- paths to a video (without extension)
- objects containing `path` to video and `formats` array (will take priority over the formats option).


### get(id[, addToCache])

Retrieve a video from the cache. If it doesn't exist or isn't loaded, return a new video.
Make the video ready for playback (unmute, reset currentTime).
* `id` - the video path used for loading, minus the baseURL.
* `addToCache` - if true, add the created video to the cache if not already in it.


### clear(id)

Stop a video.
**DO NOT** call video.remove() as this will effectively destroy the video.
* `id` - the video path used for loading, minus the baseURL.


### destroy()

Completely destroy all videos and the videoCache instance.

## Instance Events

### progress
### load
### error

## License
MIT.

const EventEmitter = require('events');
const ytdl = require('ytdl-core');
const fs = require('fs');

const types = {
  "youtube":"youtube",
  "youtubeLive":"youtubeLive",
  "youtubeLiveChannel":"youtubeLiveChannel",
  "file":"file"
}

class AudioTrack extends EventEmitter {
  constructor(type, source, title) {
    super();
    this.type = type;
    this.source = source;
    this.title = title;
    this.stream;
  }

  play() {
    let url;
    switch(this.type) {
      case types.youtube:
        url = 'http://www.youtube.com/watch?v=' + this.source;
        this.stream = ytdl(url, {'filter': 'audioonly'});
        return this.stream;

      case types.youtubeLive:
        url = 'http://www.youtube.com/watch?v=' + this.source;
        this.stream = ytdl(url, {'liveBuffer': 30000,'quality':ytdl.getInfo(url, (err, info) => {
          //find the best quality live stream
          //the built in quality selector does not always work with live streams
          info = info.formats;
          info = info.filter(info => info.live);
          return info[0].itag;
        }) });
        return this.stream;

      case types.youtubeLiveChannel:
        console.log('Playing live youtube channels is not supported');
        break;

      case types.file:
        this.stream = fs.createReadStream(this.source);
        return this.stream;
    }
  }

  pause() {

  }

  stop() {
    this.stream.destroy();
  }
}

module.exports = {
  AudioTrack: AudioTrack,
  audioTypes: types
}

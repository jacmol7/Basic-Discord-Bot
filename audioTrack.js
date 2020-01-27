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
        this.stream = ytdl(url, {'filter': 'audioonly', 'liveBuffer': 0});
        return this.stream

      case types.youtubeLiveChannel:
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

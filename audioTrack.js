const EventEmitter = require('events');
const ytdl = require('ytdl-core');
const fs = require('fs');

const types = {
  "youtube":"youtube",
  "file":"file"
}

class AudioTrack extends EventEmitter {
  constructor(type, source, title) {
    super();
    this.type = type;
    this.source = source;
    this.title = title;
  }

  play() {
    if(this.type === types.youtube) {
      console.log(this.source);
      const url = 'http://www.youtube.com/watch?v=' + this.source;
      return ytdl(url, {'filter': 'audioonly'});
    } else {
      return fs.createReadStream(source);
    }
  }

  pause() {

  }

  stop() {

  }
}

module.exports = {
  AudioTrack: AudioTrack,
  audioTypes: types
}

const EventEmitter = require('events');

const types = {
  "youtube":"youtube",
  "file":"file"
}

class AudioTrack extends EventEmitter {
  constructor(type, source) {
    super();
    this.type = type;
    this.source = source;
  }

  play() {

  }

  pause() {

  }
}

module.exports = {
  AudioTrack: AudioTrack,
  audioTypes: types
}

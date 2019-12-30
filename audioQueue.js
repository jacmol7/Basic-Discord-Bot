const EventEmitter = require('events');

class AudioQueue extends EventEmitter {

  constructor(client) {
    super();
    this.client = client;
    this.queue = new Map();
    this.choices = new Map();
  }

  add(guild, track) {
    // add track to queue for a guild
  }

  skip(guild) {
    // skip to next track in queue for a guild
  }

  clear(guild) {
    // empty queue for guild
  }

  forcePlay(guild, track) {
    // play track immedietly then resume playing queue
  }

  pause(guild) {
    // pause playing for guild
  }

  addOption(guild, user) {
    // used when a different command gives the user a choice of different things to play
  }

  selectOption(guild, user) {
    // used to select one of the given options and add it to the queue
  }

  test() {
    this.emit('test');
  }
}

module.exports = {
  AudioQueue: AudioQueue
}

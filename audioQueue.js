const EventEmitter = require('events');

class AudioQueue extends EventEmitter {

  constructor(client) {
    super();
    this.client = client;
    this.queue = new Map();
    this.choices = new Map();
    this.playing = new Map();
  }

  add(guild, track) {
    // add track to queue for a guild
    if(!this.queue.has(guild)) {
      this.queue.set(guild, new Array());
    }
    this.queue.get(guild).unshift(track);
  }

  skip(guild) {
    // skip to next track in queue for a guild
  }

  clear(guild) {
    // empty queue for guild
    this.queue.set(guild, new Array());
  }

  forcePlay(guild, track) {
    // play track immedietly then resume playing queue
    if(this.playing.has(guild)) {
      let playing = this.playing.get(guild);
      if(playing != null) {
        this.queue.get(guild).push(playing);
        playing.stop();
      }
    }

    play(guild, track);
  }

  pause(guild) {
    // pause playing for guild
    if(this.playing.has(guild)) {
      let track = this.playing.get(guild);
      if(track != null) {
        track.pause();
        return true;
      }
    }
    return false;
  }

  play(guild, track = null) {
    //play next track in queue if nothing is specified
    if(track == null) {
      track = this.getNextInQueue(guild);
      console.log(track);
      if(!track) {
        this.emit('message', 'Reached end of queue', guild);
        return false;
      }
    }

    if(this.client.voiceConnections.has(guild)) {
      let voiceConnection = this.client.voiceConnections.get(guild);
      let audioStream = track.play();

      //play next track after current track ends
      audioStream.on('end', () => {
        this.play(guild);
      });

      voiceConnection.playStream(audioStream);

      this.emit('playing', track.title, guild);
      return track.title;
    }
    else {
      return false;
    }
  }

  getNextInQueue(guild) {
    if(this.queue.has(guild)) {
      let track = this.queue.get(guild).pop();
      if(track != null) {
        return track;
      }
    }
    return false;
  }

  addOption(guild, user, options) {
    // used when a different command gives the user a choice of different things to play
    if(!this.choices.has(guild)) {
      this.choices.set(guild, new Map());
    }
    this.choices.get(guild).set(user, options);
  }

  selectOption(guild, user, choice) {
    // used to select one of the given options and add it to the queue
    if(this.choices.has(guild)) {
      if(this.choices.get(guild).has(user.id)) {
        if(this.choices.get(guild).get(user.id).length >= choice) {
          let track = this.choices.get(guild).get(user.id)[choice - 1];
          this.choices.get(guild).delete(user.id);
          this.add(guild, track);
          return track.title;
        }
      }
    }
    return false;
  }
}

module.exports = {
  AudioQueue: AudioQueue
}

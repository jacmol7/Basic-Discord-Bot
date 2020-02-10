const EventEmitter = require('events');

const audioTrackModule = require('./audioTrack.js');
const audioTypes = audioTrackModule.audioTypes;

class AudioQueue extends EventEmitter {

  constructor(client) {
    super();
    this.client = client;
    this.queue = new Map();
    this.choices = new Map();
    this.playing = new Map();
    this.streamDispatchers = new Map();
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

    this.play(guild, track);
  }

  pause(guild) {
    let dispatcher = this.streamDispatchers.get(guild);
    if(dispatcher) {
      if(!dispatcher.paused) {
        let track = this.playing.get(guild);
        if(track.type != audioTypes.youtube) {
          this.emit('message', 'Only youtube videos can be paused', guild);
          return false;
        }
        dispatcher.pause();
        this.emit('message', 'Paused track', guild);
        return true
      }
    }
    return false;
  }

  stop(guild) {
    // pause playing for guild
    if(this.playing.has(guild)) {
      let track = this.playing.get(guild);
      if(track != null) {
        track.stop();
        this.emit('message', 'Stopped track', guild);
        return true;
      }
    }
    return false;
  }

  play(guild, track = null) {
    console.log('playing');
    //if no track is specified, play the next track or resume a paused track
    if(track === null) {
      let streamDispatcher = this.streamDispatchers.get(guild);
      if(streamDispatcher.paused) {
        let trackTitle = this.playing.get(guild).title;
        streamDispatcher.resume();
        this.emit('playing', trackTitle, guild);
        return trackTitle;
      }
      else {
        track = this.getNextInQueue(guild);
        if(!track) {
          this.emit('message', 'Reached end of queue', guild);
          return false;
        }
      }
    }

    if(this.client.voiceConnections.has(guild)) {
      let voiceConnection = this.client.voiceConnections.get(guild);
      let audioStream = track.play();

      //play next track after current track ends
      audioStream.on('end', () => {
        this.playing.set(guild, null);
        this.play(guild);
      });

      let streamDispatcher = voiceConnection.playStream(audioStream);

      this.streamDispatchers.set(guild, streamDispatcher);

      this.playing.set(guild, track);
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

  getPlaying(guild) {
    if(this.playing.has(guild)) {
      return this.playing.get(guild);
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
        if(this.choices.get(guild).get(user.id).length >= choice && choice > 0) {
          let track = this.choices.get(guild).get(user.id)[choice - 1];
          this.choices.get(guild).delete(user.id);
          if(!this.playing.get(guild)) {
            this.play(guild, track);
          } else {
            this.add(guild, track);
            this.emit('message', 'Added to queue:```' + track.title + '```', guild);
          }
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

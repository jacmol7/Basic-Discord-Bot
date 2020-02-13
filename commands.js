const fs = require('fs');
const https = require('https');
const ytdl = require('ytdl-core');
const commandUtils = require('./commandUtils.js');

const audioQueueModule = require('./audioQueue.js');
const AudioQueue = audioQueueModule.AudioQueue;

const audioTrackModule = require('./audioTrack.js');
const AudioTrack = audioTrackModule.AudioTrack;
const audioTypes = audioTrackModule.audioTypes;

const keys = JSON.parse(fs.readFileSync('keys.json'));
const youtubeKey = keys.youtube;

const config = JSON.parse(fs.readFileSync('config.json'));

var audioQueue;

exports.createAudioQueue = (client) => {
  audioQueue = new AudioQueue(client);

  audioQueue.on('playing', (track, guild) => {
    console.log('Playing track: ' + track + ' in guild: ' + guild);
    commandUtils.sendMessage(client, guild, 'Now playing: ```' + track + '```');
  });

  audioQueue.on('message', (message, guild) => {
    commandUtils.sendMessage(client, guild, message);
  });
}

exports.ping = (msg, client) => {
  msg.reply('pong');
}

exports.pong = (msg, client) => {
  msg.reply('are you also a bot?');
}

exports.goodbye = (msg, client) => {
  msg.reply('bye, have a nice time!');
}

exports.time = (msg, client) => {
  const date = new Date();
  const time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
  msg.reply('The time is ' + time);
}

exports.say = (msg, client) => {
  if(msg.content.length > 4){
    msg.channel.send(msg.content.slice(4));
  }
}

exports.join = (msg, client) => {
  // message must be from server
  if(!msg.guild) return;

  if(msg.member.voiceChannel) {
    msg.member.voiceChannel.join().then(connection => {
      msg.channel.send('I\'ve joined \'' + msg.member.voiceChannel.name + '\'');
    }).catch(console.log);
  } else {
    msg.reply('You need to join a voice channel first');
  }
}

exports.leave = (msg, client) => {
  if(msg.guild) {
    if(client.voiceConnections.has(msg.guild.id)) {
      client.voiceConnections.get(msg.guild.id).disconnect();
      msg.reply('Bye!');
    } else {
      msg.reply('I am not in any voice channels');
    }
  }
}

exports.playFile = (msg, client) => {
  if(!commandUtils.inSameVoiceChannel(client, msg)) {
    msg.reply('You need to be in the same voice channel as me');
    return false;
  }

  const args = commandUtils.getArgs(msg);
  var file = '';
  for(var part of args) {
    file += part;
  }

  const voiceConnection = client.voiceConnections.get(msg.guild.id);
  voiceConnection.playArbitraryInput('media/'+file);
}

exports.play = (msg, client) => {
  audioQueue.play(msg.guild.id);
};

exports.youtube = (msg, client) => {
  const query = commandUtils.getArg(msg);
  const queryEncoded = query.replace(/ /g, '+');
  var options = {
    hostname: 'www.googleapis.com',
    port: 443,
    path: '/youtube/v3/search?part=snippet&maxResults=5&q='+queryEncoded+'&key='+youtubeKey,
    method: 'GET'
  }

  const req = https.request(options, res => {
    var result = ''

    res.on('data', data => {
      result += data.toString();
    });

    res.on('end', () => {
      const resultJson = JSON.parse(result);

      // remove upcoming live videos and live channels from results
      let videoDetails = resultJson.items.filter(video => {
        return video.id.kind !== 'youtube#channel' && video.snippet.liveBroadcastContent !== 'upcoming';
      });

      // display the search results in chat
      var videos = 'Videos for \''+query+'\'```';
      for(var i = 0; i < videoDetails.length; i++) {
        videos += i+1 + ': ' + videoDetails[i].snippet.title + '\n';
      }
      videos += '```';
      msg.channel.send(videos);

      // add the search results as choices to the audioQueue
      let choices = [];
      for(var video of videoDetails) {
        //video
        if(video.id.kind == 'youtube#video' && video.snippet.liveBroadcastContent == 'none') {
          console.log('normal');
          choices.push(new AudioTrack(audioTypes.youtube, video.id.videoId, video.snippet.title));
        }
        //live channel
        else if(video.id.kind == 'youtube#channel' && video.snippet.liveBroadcastContent == 'live') {
          console.log('live channel');
          choices.push(new AudioTrack(audioTypes.youtubeLiveChannel, video.id.channelId, video.snippet.title));
        }
        //live video
        else if(video.id.kind == 'youtube#video' && video.snippet.liveBroadcastContent == 'live') {
          console.log('live video');
          choices.push(new AudioTrack(audioTypes.youtubeLive, video.id.videoId, video.snippet.title));
        }
        else {
          console.log('track is either an upcoming live video or invalid');
          console.log(video);
        }
      }
      audioQueue.addOption(msg.guild.id, msg.member.id, choices);
    });
  });
  req.end();
};

exports.select = (msg, client) => {
  if(!commandUtils.inSameVoiceChannel(client, msg)) {
    msg.reply('You need to be in the same voice channel as me');
    return false;
  }

  let playing = audioQueue.selectOption(msg.guild.id, msg.member, commandUtils.getArg(msg));
  if(!playing) {
    msg.reply('Failed to add to queue');
    return false;
  }
  return true;
}

exports.next = (msg, client) => {
  audioQueue.play(msg.guild.id);
}

exports.pause = (msg, client) => {
  audioQueue.pause(msg.guild.id);
}

exports.stop = (msg, client) => {
  audioQueue.stop(msg.guild.id);
}

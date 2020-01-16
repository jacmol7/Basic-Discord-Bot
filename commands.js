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
    commandUtils.sendMessage(client, guild, 'Now playing \'' + track + '\'')
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

exports.play = (msg, client) => {
  if(!msg.guild) {
    return;
  }

  if(!client.voiceConnections.has(msg.guild.id)) {
    msg.reply('You need to place me in a voice channel using \'join\' first');
    return;
  }

  if(msg.member.voiceChannel != client.voiceConnections.get(msg.guild.id).channel) {
    msg.reply('You need to place me in the same voice channel as you using \'join\' first');
    return;
  }

  const args = commandUtils.getArgs(msg);
  var file = '';
  for(var part of args) {
    file += part;
  }

  const voiceConnection = client.voiceConnections.get(msg.guild.id);
  voiceConnection.playArbitraryInput('media/'+file);
}

exports.youtube = (msg, client) => {
  const query = commandUtils.getArg(msg);
  const queryEncoded = query.replace(/ /g, '+')
  console.log(queryEncoded);
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

      // display the search results in chat
      var videos = 'Videos for \''+query+'\'```';
      for(var i = 0; i < resultJson.items.length; i++) {
        videos += i+1 + ': ' + resultJson.items[i].snippet.title + '\n';
      }
      videos += '```';
      msg.channel.send(videos);

      // add the search results as choices to the audioQueue
      let choices = [];
      for(var video of resultJson.items) {
        choices.push(new AudioTrack(audioTypes.youtube, video.id.videoId, video.snippet.title));
      }
      audioQueue.addOption(msg.guild.id, msg.member.id, choices);
    });
  });
  req.end();
};

exports.select = (msg, client) => {
  if(!msg.guild) {
    return false;
  }

  if(client.voiceConnections.has(msg.guild)) {
    msg.reply('You need to join me into a voice channel first');
    return false;
  }

  if(msg.member.voiceChannel != client.voiceConnections.get(msg.guild.id).channel) {
    msg.reply('You must be in the same voice channel as me to start playing something');
    return false;
  }

  let playing = audioQueue.selectOption(msg.guild.id, msg.member, commandUtils.getArg(msg))
  if(playing) {
    msg.reply('Added \''+ playing + '\' to queue');
  } else {
    msg.reply('Failed to add to queue');
  }
}

exports.next = (msg, client) => {
  audioQueue.play(msg.guild.id);
}

const fs = require('fs');
const https = require('https');
const ytdl = require('ytdl-core');

const audioQueueModule = require('./audioQueue.js');
const AudioQueue = audioQueueModule.AudioQueue;

const audioTrackModule = require('./audioTrack.js');
const AudioTrack = audioTrackModule.AudioTrack;
const audioTypes = audioTrackModule.audioTypes;

const keys = JSON.parse(fs.readFileSync('keys.json'));
const youtubeKey = keys.youtube;
var audioQueue;

exports.createAudioQueue = (client) => {
  audioQueue = new AudioQueue(client);
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

  const args = getArgs(msg);
  var file = '';
  for(var part of args) {
    file += part;
  }

  const voiceConnection = client.voiceConnections.get(msg.guild.id);
  voiceConnection.playArbitraryInput('media/'+file);
}

exports.youtube = (msg, client) => {
  const query = escape(getArg(msg));
  var options = {
    hostname: 'www.googleapis.com',
    port: 443,
    path: '/youtube/v3/search?part=snippet&maxResults=5&q='+query+'&key='+youtubeKey,
    method: 'GET'
  }

  const req = https.request(options, res => {
    var result = ''

    res.on('data', data => {
      result += data.toString();
    });

    res.on('end', () => {
      const resultJson = JSON.parse(result);
      var videos = 'Videos for \''+query+'\'```';
      for(var i = 0; i < resultJson.items.length; i++) {
        videos += i+1 + ': ' + resultJson.items[i].snippet.title + '\n';
      }
      videos += '```';
      msg.channel.send(videos);
    });
  });
  req.end();
};

exports.audioTrackTest = (msg, client) => {
  let track = new AudioTrack(audioTypes.youtube, "yeet");
}

function getArgs(msg) {
  var args = msg.content.split(' ');
  args.splice(0,1);
  return args;
}

function getArg(msg) {
  return msg.content.slice(msg.content.indexOf(' ')+1);
}

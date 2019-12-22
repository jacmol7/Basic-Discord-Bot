const fs = require('fs');

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
      const dispatcher = connection.playFile('Air_Horn.m4a');
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


function getArgs(msg) {
  var args = msg.content.split(' ');
  args.splice(0,1);
  return args;
}

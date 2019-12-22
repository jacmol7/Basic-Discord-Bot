const fs = require('fs');

exports.ping = msg => {
  msg.reply('pong');
}

exports.pong = msg => {
  msg.reply('are you also a bot?');
}

exports.goodbye = msg => {
  msg.reply('bye, have a nice time!');
}

exports.time = msg => {
  const date = new Date();
  const time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
  msg.reply('The time is ' + time);
}

exports.say = msg => {
  if(msg.content.length > 4){
    msg.channel.send(msg.content.slice(4));
  }
}

exports.join = msg => {
  // message must be from server
  if(!msg.guild) return;

  if(msg.member.voiceChannel) {
    msg.member.voiceChannel.join().then(connection => {
      msg.channel.send('I\'ve joined \'' + msg.member.voiceChannel.name + '\'');
      const dispatcher = connection.playFile('Air_Horn.m4a');

      var recordFile = fs.createWriteStream('recording.opus');
      const audioReciever = connection.createReceiver();
      for(var [id, member] of connection.channel.members) {
        if(member.user.username === 'jacmol7') {
          const opusStream = audioReciever.createOpusStream(member.user);
          auidoReciever.on('opus', (user, buffer) => {
            for(var value of buffer.values()) {
              recordFile.write(value);
            }
          });
        }
      }
    }).catch(console.log);
  } else {
    msg.reply('You need to join a voice channel first');
  }
}

exports.leave = msg => {
  //if(msg.guild )
}


function getArgs(msg) {
  var args = msg.content.split(' ');
  args.splice(0,1);
  return args;
}

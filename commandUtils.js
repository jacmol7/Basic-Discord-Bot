const fs = require('fs');

const config = JSON.parse(fs.readFileSync('config.json'));

exports.sendMessage = (client, guildID, message) => {
  if(client.guilds.has(guildID)) {
    let guild = client.guilds.get(guildID);
    let botChannel = null;
    for(let channel of guild.channels.array()) {
      if(channel.name === config.channel && channel.type === 'text') {
        botChannel = channel;
        break;
      }
    }
    if(botChannel != null) {
        botChannel.send(message);
        return true;
    }
  }
  return false;
}

exports.getArgs = (msg) => {
  var args = msg.content.split(' ');
  args.splice(0,1);
  return args;
}

exports.getArg = (msg) => {
  return msg.content.slice(msg.content.indexOf(' ')+1);
}

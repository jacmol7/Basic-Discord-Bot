const discord = require('discord.js');
const fs = require('fs');
const commands = require('./commands.js');
const client = new discord.Client();

const config = JSON.parse(fs.readFileSync(process.argv[2]));

client.on('ready', () => {
  console.log('logged in as '+ client.user.tag);
});

client.on('message', msg => {
  if(msg.author.tag != client.user.tag){
    if(msg.channel.name === config.channel) {
      if(msgIsCommand(msg)) {
        if(hasPermission(msg)){
          runCommand(msg);
        }
      }
    }
  }
});

function msgIsCommand(msg) {
  if(msg.content.length > 1) {
    if(msg.content.charAt(0) === config.trigger) {
      return true;
    }
  }
  return false;
}

function retrieveCommand(msg) {
  return msg.content.split(' ')[0].substring(1);
}

function runCommand(msg) {
  if(msg.content.length < 2) {
    return;
  }

  const command = retrieveCommand(msg);
  if(config.commands.hasOwnProperty(command)) {
    switch(command) {

      case "ping":
        commands.ping(msg, client);
        break;

      case "pong":
        commands.pong(msg, client);
        break;

      case "goodbye":
        commands.goodbye(msg, client);
        break;

      case "time":
        commands.time(msg, client);
        break;

      case "say":
        commands.say(msg, client);
        break;

      case "join":
        commands.join(msg, client);
        break;

      case "leave":
        commands.leave(msg, client);
        break;

      case "play":
        commands.play(msg, client);
        break;

      case "connections":
        console.log(client.voiceConnections);
        break;

    }
  }
}

function hasPermission(msg) {
  const member = msg.member;
  const command = retrieveCommand(msg);
  const requiredLevel = config.commands[command];

  for(var [id, memberRole] of member.roles) {
    for(var level of Object.keys(config.permissions)) {
      if(level >= requiredLevel && config.permissions[level].includes(memberRole.name)){
        return true;
      }
    }
  }
  return false;
}

client.login(config.token);

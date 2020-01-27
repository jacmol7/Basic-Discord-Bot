# Basic-Discord-Bot
A Discord bot made using NodeJS with Discord.js

This bot is currently able to playback the audio from YouTube videos through a Discord voice channel. It is able to keep a seperate queue of videos to play for any number of Discord servers simultaneously.

If you want to run this bot you will need to get a Discord bot key (https://discordapp.com/developers/) and a Google api key configured to have access to the Youtube api (this is necessary for searching for YouTube videos). These keys need to be placed into the keys.json file.

The current structure of the config.json file is as follows:
trigger: the string that must come at the start of a text command to indicate that it is a command

channel: the name of the text channel that the bot will listen for commands in

permissions: a number indicating a rank (higher being higher ranked) followed by an array of Discord role names that you are using in your Discord server (if you want to allow anyone to run any command then give @everyone the highest permission)

commands: the name of every possible command followed by the minimum rank needed to run it, if you want to disable a command then either remove it from here or set it to a rank higher than anyone has.

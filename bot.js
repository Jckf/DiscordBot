#!/usr/bin/env nodejs

// External packages.
const fs = require('fs');
const moment = require('moment');
const Discord = require('discord.js');
const Twitch = require('twitch').default;
const Irc = require('irc');

// Our packages.
const Streamer = require('./lib/streamer.js');

// Bot class prototype.
class Bot {
    constructor(config) {
        // Our configuration.
        this.config = config;

        // API clients.
        this.discord = new Discord.Client();

        this.twitch = Twitch.withClientCredentials(
            this.config.tokens.twitch.clientId,
            this.config.tokens.twitch.clientSecret
        );

        if (this.config.tokens.twitch.chatOauth) {
            // Twitch IRC server will force nickname to the name of the account we're authenticating as. We're just providing a dummy string.
            this.irc = new Irc.Client('irc.chat.twitch.tv', 'a', {
                password: this.config.tokens.twitch.chatOauth,
                channels: Object.keys(this.config.streamers).map(name => '#' + name.toLowerCase())
            });

            this.irc.addListener('error', console.log);

            this.irc.addListener('message', (from, to, message) => this.onIrcMessage(from, to, message));
        }

        // Connected to Discord and ready to start the party!
        this.discord.on('ready', () => this.onReady());

        // Someone said something!
        this.discord.on('message', message => this.onDiscordMessage(message));

        // We're done configuring the bot. Connect and login :)
        this.discord.login(this.config.tokens.discord);

        // Streamer instances.
        this.streamers = {};

        for (const name of Object.keys(this.config.streamers)) {
            this.streamers[name.toLowerCase()] = new Streamer(this.twitch, name, this.config.streamers[name]);
        }
    }

    onReady() {
        // Update our avatar if an image is present.
        fs.exists('avatar.png', exists => {
            if (exists) {
                this.discord.user.setAvatar('data:image/png;base64,' + new Buffer(fs.readFileSync('avatar.png')).toString('base64'));
            }
        });

        // Check Twitch every now and then to see if anyone is streaming.
        setInterval(() => this.pollTwitch(), 1000 * this.config.pollInterval);
    }

    onDiscordMessage(message) {
        if (message.isMentioned(this.discord.user)) {
            // Who is this person anyway? :|
            message.reply('you are making me uncomfortable...');
            return;
        }

        // Is it a command?
        if (message.content.substr(0, 1) !== '!') {
            return;
        }

        // Split it into bits.
        let segments = message.content.substr(1).split(' ');

        this.executeCommand('./commands/discord/' + segments[0] + '.js', [
            message,
            segments
        ]);
    }

    onIrcMessage(from, to, message) {
        let isPm = to == this.irc.nick;

        if (message.includes(this.irc.nick)) {
            // Who is this person anyway? :|
            this.irc.say(from, 'you are making me uncomfortable...');
            return;
        }

        // Is it a command?
        if (message.substr(0, 1) !== '!') {
            return;
        }

        // Split it into bits.
        let segments = message.substr(1).split(' ');

        this.executeCommand('./commands/irc/' + segments[0] + '.js', [
            isPm,
            isPm ? from : to,
            from,
            to,
            message,
            segments
        ]);
    }

    executeCommand(path, parameters) {
        // Yeah, probably not a good way to do this.
        fs.exists(path, exists => {
            if (!exists) {
                return;
            }

            delete require.cache[require.resolve(path)];
            let CommandClass = require(path);
            let command = new CommandClass(this);
            command.execute.apply(command, parameters);
        });
    }

    pollTwitch() {
        let channel = this.discord.channels.find(ch => ch.name === this.config.notificationChannel);

        if (!channel) {
            return;
        }

        for (const name of Object.keys(this.streamers)) {
            this.streamers[name].getStream((streamer, isOnline, stream) => {
                if (!streamer.lastToggle) {
                    // Haven't checked this stream before.
                    streamer.lastToggle = moment().unix();
                }

                if (isOnline == null) {
                    // No response from Twitch.
                } else if (!isOnline) {
                    // Stream is not online.

                    if (streamer.isOnline && moment().unix() - streamer.lastToggle > 600) {
                        // It was online though, and for more than 10 minutes.
                        channel.send(streamer.name + ' has stopped streaming :(');
                        streamer.lastToggle = moment().unix();
                    }

                    streamer.isOnline = false;
                } else if (isOnline) {
                    // Stream is online!

                    if (!streamer.isOnline && moment().unix() - streamer.lastToggle > 600) {
                        // And it has been offline for at least 10 minutes.

                        if (streamer.isOnline != null) {
                            // And this is not the first check (ie. stream was not online when the bot started).
                            channel.send(streamer.announcement);
                        }

                        streamer.lastToggle = moment().unix();
                    }

                    streamer.isOnline = true;
                }
            });
        }
    }

    replyAndAutoremove(message, reply) {
        // Remove the user's message.
        message.delete();

        message.reply(reply)
            .then(sent => {
                sent.delete(1000 * this.config.autoremoveDelay);
            });
    }
}

// It's magic \o/
new Bot(JSON.parse(fs.readFileSync('config.json').toString()));

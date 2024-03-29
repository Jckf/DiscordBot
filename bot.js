#!/usr/bin/env nodejs

// External packages.
const fs = require('fs');
const Discord = require('discord.js');
const Twitch = require('twitch').default;
const Irc = require('irc');

// Bot class prototype.
class Bot {
    constructor(config) {
        // Our configuration.
        this.config = config;

        // API clients.
        this.discord = new Discord.Client({
            fetchAllMembers: true
        });

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
        }

        this.discord.on('ready', () => this.updateAvatar());

        for (const file of fs.readdirSync('./handlers')) {
            if (file.substr(-3) !== '.js') {
                continue;
            }

            let instance = this.createInstance('./handlers/' + file);

            if (!instance) {
                continue;
            }

            instance.init();
        }

        // We're done configuring the bot. Connect and login :)
        this.discord.login(this.config.tokens.discord);
    }

    updateAvatar() {
        try {
            fs.accessSync('avatar.png');
        } catch (err) {
            return;
        }

        this.discord.user.setAvatar('data:image/png;base64,' + new Buffer(fs.readFileSync('avatar.png')).toString('base64'));
    }

    replyAndAutoremove(message, reply) {
        // Remove the user's message.
        message.delete();

        message.reply(reply)
            .then(sent => {
                sent.delete(1000 * this.config.autoremoveDelay);
            });
    }

    createInstance(path) {
        try {
            fs.accessSync(path);
        } catch (err) {
            return;
        }

        delete require.cache[require.resolve(path)];

        let Class = require(path);

        return new Class(this);
    }

    isMod(channel, user) {
        if (typeof channel != 'string' || typeof user != 'string' || channel === '' || user === '') {
            return Promise.resolve(false);
        }

        if (channel.toLowerCase() == user.toLowerCase()) {
            return Promise.resolve(true);
        }

        const deferred = Promise.defer();

        this.twitch.unsupported.getChatters(channel)
            .then(response => {
                deferred.resolve(response._data.chatters.moderators.includes(user.toLowerCase()));
            })
            .catch(deferred.reject);

        return deferred.promise;
    }
}

// It's magic \o/
new Bot(JSON.parse(fs.readFileSync('config.json').toString()));

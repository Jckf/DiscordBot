#!/usr/bin/env nodejs

// External packages.
var fs = require('fs');
var Discord = require('discord.js');
var Twitch = require('node-twitchtv');

// Our packages.
var Streamer = require('./lib/streamer.js');

// Bot class constructor.
function Bot() {
	// Our configuration.
	this.config = require('./config.js');

	// API clients.
	this.discord = new Discord.Client({
		autoReconnect: true
	});
	this.twitch = new Twitch({
		client_id: this.config.tokens.twitch
	});

	// Connected to Discord and ready to start the party!
	this.discord.on('ready', this.onReady.bind(this));

	// Someone said something!
	this.discord.on('message', this.onMessage.bind(this));

	// Streamer instances.
	this.streamers = {};
	for (var name in this.config.streamers) {
		this.streamers[name] = new Streamer(this.twitch, name, this.config.streamers[name]);
	}

	// We're done configuring the bot. Connect and login :)
	this.discord.loginWithToken(this.config.tokens.discord);
}

// Bot class prototype.
Bot.prototype = {
	constructor: Bot,

	onReady: function () {
		// Update our avatar if an image is present.
		fs.exists('avatar.png', function (exists) {
			if (exists)
				this.discord.setAvatar('data:image/png;base64,' + new Buffer(fs.readFileSync('avatar.png')).toString('base64'));
		});

		// Check Twitch every now and then to see if anyone is streaming.
		setInterval(this.pollTwitch.bind(this), 1000 * this.config.pollInterval);
	},

	onMessage: function (message) {
		if (message.isMentioned(this.discord.user)) {
			// Who is this person anyway? :|
			this.discord.reply(message, 'you are making me uncomfortable...');
			return;
		}

		// Is it a command?
		if (message.content.substr(0, 1) != '!')
			return;

		// Split it into bits.
		var segments = message.content.substr(1).split(' ');

		// Yeah, probably not a good way to do this.
		var commandFile = './commands/' + segments[0] + '.js';
		fs.exists(commandFile, function (exists) {
			if (!exists)
				return;

			delete require.cache[require.resolve(commandFile)];
			var CommandClass = require(commandFile);
			var command = new CommandClass(this);
			command.execute(message, segments);
		}.bind(this));
	},

	pollTwitch: function () {
		for (var name in this.streamers) {
			this.streamers[name].getStream(function (streamer, isOnline, stream) {
				if (!streamer.lastToggle) {
					// Haven't checked this stream before.
					streamer.lastToggle = time();
				}

				if (isOnline == null) {
					// No response from Twitch.
				} else if (!isOnline) {
					// Stream is not online.

					if (streamer.isOnline && time() - streamer.lastToggle > 600) {
						// It was online though, and for more than 10 minutes.
						this.discord.sendMessage(this.discord.servers[0].channels[0], streamer.name + ' has stopped streaming :(');
						streamer.lastToggle = time();
					}

					streamer.isOnline = false;
				} else if (isOnline) {
					// Stream is online!

					if (!streamer.isOnline && time() - streamer.lastToggle > 600) {
						// And it has been offline for at least 10 minutes.

						if (streamer.isOnline != null) {
							// And this is not the first check (ie. stream was not online when the bot started).
							this.discord.sendMessage(this.discord.servers[0].channels[0], streamer.announcement);
						}

						streamer.lastToggle = time();
					}

					streamer.isOnline = true;
				}
			}.bind(this));
		}
	},

	replyAndAutoremove: function (message, reply) {
		// Remove the user's message.
		this.discord.deleteMessage(message);

		// Send our reply.
		this.discord.reply(message, reply, {}, function (error, message) {
			// And finally remove our replace after a little while.
			this.discord.deleteMessage(message, {
				wait: 1000 * this.config.autoremoveDelay
			});
		}.bind(this));
	}
};

// It's magic \o/
new Bot();

// UNIX timestamp for lazy bums.
function time() {
	return Math.floor(Date.now() / 1000);
}

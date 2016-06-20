function statusCommand(bot) {
	this.bot = bot;
}

statusCommand.prototype = {
	constructor: statusCommand,

	execute: function (message, segments) {
		if (segments.length < 2 || this.bot.streamers[segments[1]] == null) {
			this.bot.replyAndAutoremove(message, 'you must specify a team member to check their status. For example: !status biinny');
			return;
		}

		this.bot.discord.startTyping(message.channel);
		this.bot.streamers[segments[1]].getStream(function (streamer, isOnline, stream) {
			this.bot.discord.stopTyping(message.channel);

			if (isOnline == null) {
				this.bot.replyAndAutoremove(message, 'I am sorry, but something seems to be wrong with Twitch :(');
			} else if (isOnline == false) {
				this.bot.replyAndAutoremove(message, streamer.name + ' is not currently streaming :(');
			} else if (isOnline == true) {
				this.bot.replyAndAutoremove(message, streamer.name + ' is streaming to ' + stream.viewers + ' viewers: ' + stream.channel.status);
			}
		}.bind(this));
	}
};

module.exports = statusCommand;

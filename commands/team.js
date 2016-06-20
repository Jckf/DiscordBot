function TeamCommand(bot) {
	this.bot = bot;
}

TeamCommand.prototype = {
	constructor: TeamCommand,

	execute: function (message, segments) {
		this.bot.replyAndAutoremove(message, 'the team consists of ' + Object.keys(this.bot.streamers).join(', '));
	}
};

module.exports = TeamCommand;

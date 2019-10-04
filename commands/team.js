module.exports = class {
	constructor(bot) {
		this.bot = bot;
	}

	execute(message, segments) {
		this.bot.replyAndAutoremove(message, 'the team consists of ' + Object.keys(this.bot.streamers).join(', '));
	}
};

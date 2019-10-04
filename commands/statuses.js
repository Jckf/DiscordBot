module.exports = class {
	constructor(bot) {
		this.bot = bot;
	}

	execute(message, segments) {
		let online = [];

		for (const name of Object.keys(this.bot.streamers)) {
			if (this.bot.streamers[name].isOnline) {
				online.push(name);
			}
		}

		if (online.length === 0) {
			this.bot.replyAndAutoremove(message, 'nobody is streaming right now :(');
		} else {
			this.bot.replyAndAutoremove(message, 'these guys are streaming now: ' + online.join(', ') + '. Get in there! :D');
		}
	}
};

function statusesCommand(bot) {
	this.bot = bot;
}

statusesCommand.prototype = {
	constructor: statusesCommand,

	execute: function (message, segments) {
		var online = [];
		for (var name in this.bot.streamers) {
			if (this.bot.streamers[name].isOnline)
				online.push(name);
		}
		if (online.length == 0) {
			this.bot.replyAndAutoremove(message, 'nobody is streaming right now :(');
		} else {
			this.bot.replyAndAutoremove(message, 'these guys are streaming now: ' + online.join(', ') + '. Get in there! :D');
		}
	}
};

module.exports = statusesCommand;

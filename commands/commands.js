var fs = require('fs');

function CommandsCommand(bot) {
	this.bot = bot;
}

CommandsCommand.prototype = {
	constructor: CommandsCommand,

	execute: function (message, segments) {
		fs.readdir('./commands', function (error, files) {
			var commands = [];
			for (var i in files) {
				if (files[i].substr(-3) == '.js')
					commands.push(files[i].substr(0, files[i].length - 3));
			}

			this.bot.replyAndAutoremove(message, 'I will repond to the following commands: ' + commands.join(', '));
		}.bind(this));
	}
};

module.exports = CommandsCommand;

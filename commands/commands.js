const fs = require('fs');

module.exports = class {
	constructor(bot) {
		this.bot = bot;
	}

	execute(message, segments) {
		fs.readdir('./commands', (error, files) => {
			let commands = [];
			for (const file of files) {
				if (file.substr(-3) === '.js') {
					commands.push(file.substr(0, file.length - 3));
				}
			}

			this.bot.replyAndAutoremove(message, 'I will repond to the following commands: ' + commands.join(', '));
		});
	}
};

const fs = require('fs');

module.exports = class {
    constructor(bot) {
        this.bot = bot;
    }

    execute(isPm, replyTo, from, to, message, segments) {
        fs.readdir('./commands/irc', (error, files) => {
            let commands = [];
            for (const file of files) {
                if (file.substr(-3) === '.js') {
                    commands.push(file.substr(0, file.length - 3));
                }
            }

            this.bot.irc.say(replyTo, 'I will respond to the following commands: ' + commands.join(', '));
        });
    }
};

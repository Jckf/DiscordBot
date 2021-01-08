const fs = require('fs');

module.exports = class {
    constructor(bot) {
        this.bot = bot;
    }

    init() {
        this.bot.discord.on('message', message => this.onDiscordMessage(message));

        if (this.bot.irc) {
            this.bot.irc.addListener('message', (from, to, message) => this.onIrcMessage(from, to, message));
        }
    }

    onDiscordMessage(message) {
        // Is it a command?
        if (message.content.substr(0, 1) !== '!') {
            return;
        }

        // Split it into bits.
        let segments = message.content.substr(1).split(' ');

        this.executeCommand('./commands/discord/' + segments[0] + '.js', [
            message,
            segments
        ]);
    }

    onIrcMessage(from, to, message) {
        let isPm = to == this.bot.irc.nick;

        // Is it a command?
        if (message.substr(0, 1) !== '!') {
            return;
        }

        // Split it into bits.
        let segments = message.substr(1).split(' ');

        this.executeCommand('./commands/irc/' + segments[0] + '.js', [
            isPm,
            isPm ? from : to,
            from,
            to,
            message,
            segments
        ]);
    }

    executeCommand(path, parameters) {
        let command = this.bot.createInstance(path);

        if (!command) {
            return
        }

        command.execute.apply(command, parameters);
    }
};

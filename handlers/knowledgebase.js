const fs = require('fs');

module.exports = class {
    constructor(bot) {
        this.bot = bot;
        this.kb = {};
    }

    init() {
        this.bot.discord.on('message', message => this.onDiscordMessage(message));

        if (this.bot.irc) {
            this.bot.irc.addListener('message', (from, to, message) => this.onIrcMessage(from, to, message));
        }

        this.loadKb();
    }

    onDiscordMessage(message) {
        if (message.content.substr(0, 1) !== '?') {
            return;
        }

        let phrase = message.content.substr(1).split(' ').filter(v => v !== '')[0];

        if (!this.kb.hasOwnProperty(phrase)) {
            return;
        }

        this.bot.replyAndAutoremove(message, this.kb[phrase].join("\n"));
    }

    onIrcMessage(from, to, message) {
        if (message.substr(0, 1) !== '?') {
            return;
        }

        let phrase = message.substr(1).split(' ').filter(v => v !== '')[0];

        if (!this.kb.hasOwnProperty(phrase)) {
            return;
        }

        let replyTo = to == this.bot.irc.nick ? from : to;

        for (const line of this.kb[phrase]) {
            this.bot.irc.say(replyTo, line);
        }
    }

    loadKb() {
        try {
            fs.accessSync('kb.json');
        } catch (err) {
            return;
        }

        this.kb = JSON.parse(fs.readFileSync('kb.json').toString());
    }

    saveKb() {
        fs.writeFileSync('kb.json', JSON.stringify(this.kb));
    }
};

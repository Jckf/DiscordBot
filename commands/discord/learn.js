module.exports = class {
    constructor(bot) {
        this.bot = bot;
    }

    execute(message, segments) {
        if (segments.length == 1) {
            this.bot.replyAndAutoremove(message, 'Usage: !learn <phrase> <information here>')
            return;
        }

        if (!this.bot.kb) {
            return;
        }

        this.bot.kb.learn(segments[1], segments.slice(2).join(' '));

        this.bot.replyAndAutoremove(message, 'Thank you for teaching me about ' + segments[1]);
    }
};

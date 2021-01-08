module.exports = class {
    constructor(bot) {
        this.bot = bot;
    }

    execute(isPm, replyTo, from, to, message, segments) {
        if (segments.length == 1) {
            this.bot.irc.say(replyTo, 'Usage: !learn <phrase> <information here>')
            return;
        }

        if (!this.bot.kb) {
            return;
        }

        this.bot.kb.learn(segments[1], segments.slice(2).join(' '));

        this.bot.irc.say(replyTo, 'Thank you for teaching me about ' + segments[1]);
    }
};

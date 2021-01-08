module.exports = class {
    constructor(bot) {
        this.bot = bot;
    }

    execute(isPm, replyTo, from, to, message, segments) {
        if (isPm || from.toLowerCase() !== to.substr(1).toLowerCase()) {
            return;
        }

        if (segments.length == 1) {
            this.bot.irc.say(replyTo, 'Usage: !forget <phrase> [line number...]');
            return;
        }

        if (!this.bot.kb) {
            return;
        }

        this.bot.kb.forget(segments[1], segments.slice(2));

        this.bot.irc.say(replyTo, 'Okay, forgotten.');
    }
};

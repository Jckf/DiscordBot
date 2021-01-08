module.exports = class {
    constructor(bot) {
        this.bot = bot;
    }

    execute(message, segments) {
        if (!message.member.hasPermission('KICK_MEMBERS')) {
            return;
        }

        if (segments.length == 1) {
            this.bot.replyAndAutoremove(message, 'Usage: !forget <phrase> [line number...]');
            return;
        }

        if (!this.bot.kb) {
            return;
        }

        this.bot.kb.forget(segments[1], segments.slice(2));

        this.bot.replyAndAutoremove(message, 'Okay, forgotten.');
    }
};

const moment = require('moment');

module.exports = class {
    constructor(bot) {
        this.bot = bot;
    }

    execute(isPm, replyTo, from, to, message, segments) {
        if (isPm) {
            return;
        }

        let streamerName = to.substr(1).toLowerCase();

        if (!this.bot.streamers.hasOwnProperty(streamerName)) {
            return;
        }

        this.bot.streamers[streamerName].getStream((streamer, isOnline, stream) => {
            if (isOnline === null) {
                this.bot.irc.say(replyTo, 'I am sorry, but something seems to be wrong with Twitch :(');
            } else if (isOnline === false) {
                this.bot.irc.say(replyTo, streamerName + ' is not currently streaming :(');
            } else if (isOnline === true) {
                this.bot.irc.say(replyTo, streamerName + ' has been streaming for ' + moment(stream.startDate).fromNow(true));
            }
        });
    }
};

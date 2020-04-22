module.exports = class {
    constructor(bot) {
        this.bot = bot;
    }

    execute(message, segments) {
        const streamerNames = Object.keys(this.bot.streamers);

        if (!streamerNames.length) {
            this.bot.replyAndAutoremove(message, 'there aren\'t any streamers in my configuration file :(');
            return;
        }

        const singleStreamer = streamerNames.length == 1 ? streamerNames[0] : undefined;
        const statusFor = (segments.length == 1 ? singleStreamer : segments[1]).toLowerCase();

        if (statusFor == undefined || this.bot.streamers[statusFor] == undefined) {
            this.bot.replyAndAutoremove(message, 'you must specify a team member to check their status. For example: !status ' + streamerNames[0]);
            return;
        }

        //this.bot.discord.startTyping(message.channel);

        this.bot.streamers[segments[1]].getStream((streamer, isOnline, stream) => {
            //this.bot.discord.stopTyping(message.channel);

            if (isOnline === null) {
                this.bot.replyAndAutoremove(message, 'I am sorry, but something seems to be wrong with Twitch :(');
            } else if (isOnline === false) {
                this.bot.replyAndAutoremove(message, streamer.name + ' is not currently streaming :(');
            } else if (isOnline === true) {
                this.bot.replyAndAutoremove(message, streamer.name + ' is streaming to ' + stream.viewers + ' viewers: ' + stream.channel.status);
            }
        });
    }
};

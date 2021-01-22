module.exports = class {
    constructor(bot) {
        this.bot = bot;
        this.channel = null;
        this.stream = null;
        this.replyTo = null;
    }

    execute(isPm, replyTo, from, to, message, segments) {
        if (!this.bot.isMod(to.substr(1), from)) {
            return;
        }

        this.replyTo = replyTo;

        let streamer = segments[1];

        this.bot.twitch.kraken.users.getUserByName(streamer)
            .then(user => {
                this.user = user;

                user.getChannel()
                    .then(channel => {
                        this.channel = channel;
                        this.msg();
                    })
                    .catch(err => this.oof(err));

                user.getStream()
                    .then(stream => {
                        this.stream = stream === null ? false : stream;
                        this.msg();
                    })
                    .catch(err => this.oof(err));
            })
            .catch(err => this.oof(err));
    }

    msg(message) {
        if (this.replyTo === null || this.channel === null || this.stream === null) {
            return;
        }

        this.bot.irc.say(this.replyTo, 'Everyone, check out ' + this.user.name + '! They ' + (this.stream === false ? 'were last' : 'are') + ' streaming ' + this.channel.game + ': Twitch.com/' + this.user.name);
    }

    oof(message, err) {
        console.log(err);

        if (this.replyTo === null) {
            return;
        }

        this.bot.irc.say(this.replyTo, 'Sorry, something went wrong :(');
    }
};

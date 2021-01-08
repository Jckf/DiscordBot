const moment = require('moment');

const Streamer = class {
    constructor(twitch, name, announcement) {
        this.twitch = twitch;
        this.name = name;
        this.announcement = announcement;

        this.twitch.kraken.users.getUserByName(this.name)
            .then(user => {
                this.user = user;
            })
            .catch(err => {
                console.log('Could not fetch ' + this.name, err);
            })
    }

    getStream(cb) {
        if (!this.user) {
            return;
        }

        this.user.getStream()
            .then(stream => {
                try {
                    return cb(this, stream !== null, stream || null);
                } catch (exception) {
                    console.log(exception);
                }
            })
            .catch(err => {
                try {
                    return cb(this, null, null);
                } catch (exception) {
                    console.log(exception);
                }
            });
    }
};

module.exports = class {
    constructor(bot) {
        this.bot = bot;
    }

    init() {
        // Connected to Discord and ready to start the party!
        this.bot.discord.on('ready', () => this.onReady());

        // Streamer instances.
        this.streamers = {};

        for (const name of Object.keys(this.bot.config.streamers)) {
            this.streamers[name.toLowerCase()] = new Streamer(this.bot.twitch, name, this.bot.config.streamers[name]);
        }
    }

    onReady() {
        // Check Twitch every now and then to see if anyone is streaming.
        setInterval(() => this.poll(), 1000 * this.bot.config.pollInterval);
    }

    poll() {
        let channel = this.bot.discord.channels.find(ch => ch.name === this.bot.config.notificationChannel);

        if (!channel) {
            return;
        }

        for (const name of Object.keys(this.streamers)) {
            this.streamers[name].getStream((streamer, isOnline, stream) => {
                if (!streamer.lastToggle) {
                    // Haven't checked this stream before.
                    streamer.lastToggle = moment().unix();
                }

                if (isOnline == null) {
                    // No response from Twitch.
                } else if (!isOnline) {
                    // Stream is not online.

                    if (streamer.isOnline && moment().unix() - streamer.lastToggle > 600) {
                        // It was online though, and for more than 10 minutes.
                        channel.send(streamer.name + ' has stopped streaming :(');
                        streamer.lastToggle = moment().unix();
                    }

                    streamer.isOnline = false;
                } else if (isOnline) {
                    // Stream is online!

                    if (!streamer.isOnline && moment().unix() - streamer.lastToggle > 600) {
                        // And it has been offline for at least 10 minutes.

                        if (streamer.isOnline != null) {
                            // And this is not the first check (ie. stream was not online when the bot started).
                            channel.send(streamer.announcement);
                        }

                        streamer.lastToggle = moment().unix();
                    }

                    streamer.isOnline = true;
                }
            });
        }
    }
};

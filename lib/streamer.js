module.exports = class {
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

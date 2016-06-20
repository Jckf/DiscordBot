function Streamer(twitch, name, announcement) {
	this.twitch = twitch;
	this.name = name;
	this.announcement = announcement;
}

Streamer.prototype = {
	constructor: Streamer,

	getStream: function (cb) {
		this.twitch.streams({
			channel: this.name
		}, function (error, response) {
			if (error)
				return cb(this, null, null);

			return cb(this, response.stream != null, response.stream == null ? null : response.stream);
		}.bind(this));
	}
};

module.exports = Streamer;

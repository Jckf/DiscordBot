module.exports = class {
    constructor(bot) {
        this.bot = bot;
    }

    init() {
        this.bot.discord.on('raw', packet => this.handleRaw(packet));
        this.bot.discord.on('messageReactionAdd2', (user, message, emoji) => this.handleAdd(user, message, emoji));
        this.bot.discord.on('messageReactionRemove2', (user, message, emoji) => this.handleRemove(user, message, emoji));
    }

    // This is a modified version of
    // https://github.com/AnIdiotsGuide/discordjs-bot-guide/blob/master/coding-guides/raw-events.md
    handleRaw(packet) {
        let client = this.bot.discord;

        // We don't want this to run on unrelated packets
        if (![ 'MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE' ].includes(packet.t)) {
            return;
        }

        // Grab the channel to check the message from
        const channel = client.channels.get(packet.d.channel_id);

        // Since we have confirmed the message is not cached, let's fetch it
        channel.fetchMessage(packet.d.message_id).then(message => {
            // Emojis can have identifiers of name:id format, so we have to account for that case as well
            const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;

            // Check which type of event it is before emitting
            if (packet.t === 'MESSAGE_REACTION_ADD') {
                client.emit('messageReactionAdd2', client.users.get(packet.d.user_id), message, emoji);
            }

            if (packet.t === 'MESSAGE_REACTION_REMOVE') {
                client.emit('messageReactionRemove2', client.users.get(packet.d.user_id), message, emoji);
            }
        });
    }

    handleAdd(user, message, emoji) {
        console.log(user.username + ' ' + emoji + '\'d ' + message.id);

        let role = this.getRole(message, emoji);

        if (role) {
            let member = message.guild.member(user);
            member.addRole(role);
        }
    }

    handleRemove(user, message, emoji) {
        console.log(user.username + ' doesn\'t ' + emoji + ' ' + message.id);

        let role = this.getRole(message, emoji);

        if (role) {
            let member = message.guild.member(user);
            member.removeRole(role);
        }
    }

    getRole(message, emoji) {
        let roles = this.bot.config.react4role[message.id];

        if (!roles) {
            return;
        }

        let targetRole = roles[emoji];

        if (!targetRole) {
            return;
        }

        return message.guild.roles.find(role => role.id === targetRole);
    }
};

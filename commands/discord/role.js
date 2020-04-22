module.exports = class {
    constructor(bot) {
        this.bot = bot;
    }

    execute(message, segments) {
        const allRoles = this.bot.config.vanityRoles.map(role => role.toLowerCase());

        if (!allRoles.length) {
            this.bot.replyAndAutoremove(message, 'there are no vanity roles available :(');
            return;
        }

        const canLeave = message.member.roles
            .map(role => role.name.toLowerCase())
            .filter(role => allRoles.includes(role));

        const canJoin = allRoles.filter(role => !canLeave.includes(role));

        if (segments.length == 1) {
            let reply = [
                canLeave.length ? 'you are a member of ' + canLeave.join(', ') : '',
                canJoin.length ? 'you can join ' + canJoin.join(', ') : ''
            ].filter(s => s);

            this.bot.replyAndAutoremove(message, reply.join(', and '));
            return;
        }

        const roleName = segments[1].toLowerCase();
        const roleObject = message.guild.roles.find(role => role.name.toLowerCase() === roleName);

        if (!roleObject) {
            this.bot.replyAndAutoremove(message, 'ah, something is wrong here. That role is missing from the server. Please contact an admin.');
            return;
        }

        if (canLeave.includes(roleName)) {
            message.member.removeRole(roleObject).then(() => {
                this.bot.replyAndAutoremove(message, 'you have left ' + roleName);
            });
            return;
        }

        if (canJoin.includes(roleName)) {
            message.member.addRole(roleObject).then(() => {
                this.bot.replyAndAutoremove(message, 'you have joined ' + roleName);
            });
            return;
        }

        this.bot.replyAndAutoremove(message, 'that\'s not a role I know :/')
    }
};

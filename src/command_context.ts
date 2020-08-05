import Discord from 'discord.js'

export class CommandContext {
    readonly command: string;
    readonly args: string[];
    readonly prefix: string;
    
    readonly msg: Discord.Message;
    readonly bot: Discord.Client;

    constructor(bot: Discord.Client, msg: Discord.Message, prefix: string ) {
        this.bot = bot;
        this.msg = msg;
        this.prefix = prefix;
        this.args = msg.toString().slice(prefix.length).trim().split(/ +/g);

        this.command = this.args[0].toLowerCase();
    }
}

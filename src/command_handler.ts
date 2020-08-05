import Discord from 'discord.js'
import { Command } from './command'
import { CommandContext } from './command_context'

import { Link } from './commands/link'

export class CommandHandler {
    private commands: Command[];
    public readonly prefix: string;

    constructor(prefix: string) {
        this.prefix = prefix;

        const commandsClasses = [ Link ];
        this.commands = commandsClasses.map(commandClass => new commandClass());
    }

    public async handleMessage(bot: Discord.Client, msg: Discord.Message) {
        const commandContext = new CommandContext(bot, msg, this.prefix);

        const matchedCommands = await this.commands.find(command => command.commandName.includes(commandContext.command));

        if(!matchedCommands) return;

        else
            await matchedCommands.run(bot, commandContext);
    }
}

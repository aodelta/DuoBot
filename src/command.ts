import { CommandContext } from './command_context'
import Discord from 'discord.js'

export interface Command {
    readonly commandName: string;

    run(bot: Discord.Client, commandContext: CommandContext): Promise<void>;
}

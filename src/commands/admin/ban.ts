import Discord, { GuildMember } from 'discord.js';
import { Command } from '../../command'
import { CommandContext } from '../../command_context'
import { Embed, typeOfEmbed, color} from '../../Utility/embed'
import { SQL_Link, ISqlError, IServerRequestData } from '../../SQL/linking'
import { activeBan, IDlength } from '.././../global';
import { fromMinutesToTimeStates, FromTimeStatesToString } from './../../Utility/time'
import { getUserFromFirstMention } from './../../Utility/functions'

interface typeBanInfo {
    user: string,
    duration: number,
    reason: string
}

export class Ban implements Command{
    public readonly commandName: string = "ban";

    async run(bot: Discord.Client, cmdCtx: CommandContext): Promise<void> {
        cmdCtx.msg.reply("banning starts");

        // Is command correct length (lower than 2, it is only the cmd, and since the reason has no limit in length, there are no "greater" restrictions)
        if(cmdCtx.args.length < 2) {
            Embed.Create(typeOfEmbed.basic, bot, cmdCtx.msg, color.gray, "Erreur de Ban",
                    [{title: "Commande non correcte", content: "Voici les 3 options possibles pour ban : \n" +
                    "`ban @pseudo | id`\n" +
                    "`ban @pseudo | id   durée`\n" +
                    "`ban @pseudo | id   raison`\n" +
                    "`ban @pseudo | id   duree   raison`"}],
                    cmdCtx.msg.channel, { self: {removeItSelf: true, timeout: 5000}});
            return;
        }

        // Declare the variable struc used to regroup each info on the ban
        let banInfo: typeBanInfo = {
            user:"",
            duration: 30,
            reason: ""
        };

        if(cmdCtx.msg.guild) {
            var serverTarget = SQL_Link.getPair(cmdCtx.msg.guild.id);
            if(serverTarget.hasFail) {
                if(serverTarget.sqlError.type == 'NOTFOUND') {
                    Embed.Create(typeOfEmbed.basic, bot, cmdCtx.msg, color.gray, "Erreur de Ban",
                            [{title: "Erreur de Link", content: "Ce serveur n'est Link avec aucun autre serveur"}],
                            cmdCtx.msg.channel, { self: {removeItSelf: true, timeout: 5000}});
                }
                else if(serverTarget.sqlError.type == 'CONNECTION') {
                    Embed.Create(typeOfEmbed.basic, bot, cmdCtx.msg, color.gray, "Erreur de Ban",
                            [{title: "Erreur de Link", content: "Base De Donnée temporairement indisponible (sql request exit code : " + serverTarget.sqlError.exitCode}],
                            cmdCtx.msg.channel, { self: {removeItSelf: true, timeout: 5000}});
                }
                return;
            }
        }
        else return;
        

        // Store the mention fetch in a variable
        if(cmdCtx.msg.mentions.members) {
            var firstMention = getUserFromFirstMention(cmdCtx.args[1], serverTarget.server);
        }

        // Store the (potential) ID detection (nothing sure until members verification is done) in a varible
        let idMention:string = "";
        if(cmdCtx.args[1].length === IDlength && /^\d+$/.test(cmdCtx.args[1])) {
            idMention = cmdCtx.args[1];
        }

        // Test the mention fetch variable
        if(idMention == "") {
            if(!firstMention) {
                Embed.Create(typeOfEmbed.basic, bot, cmdCtx.msg, color.gray, "Erreur de Ban",
                        [{title: "Commande non correcte", content: "Vous devez spécifier un membre du serveur en question"}],
                        cmdCtx.msg.channel, { self: {removeItSelf: true, timeout: 5000}});
                return;
            }
            else { // Id is is a mention
                idMention = firstMention.id;
            }
        }

        banInfo.user = idMention;

        if(cmdCtx.msg.guild) { // NTC
            if(cmdCtx.args.length == 2) { // If the admin only provides the pseudo
                this.processBan(bot, cmdCtx, cmdCtx.msg.guild, banInfo);
            }
        }

        if(/^\d+$/.test(cmdCtx.args[2])) { // If the duration is the second main argument (right after the pseudo)
            let duration = parseInt(cmdCtx.args[2])
            if(isNaN(duration)) { // Always check (who knows what could happend :) )
                Embed.Create(typeOfEmbed.basic, bot, cmdCtx.msg, color.gray, "Erreur de Ban",
                        [{title: "Commande non correcte", content: "La durée spécifié n'est pas conforme"}],
                        cmdCtx.msg.channel, { self: {removeItSelf: true, timeout: 5000}});
                return;
            }
            banInfo.duration = duration; // Store the valdid duration
        }

        if(cmdCtx.args.length > 3) { // If the admin also provides a reason
            let reason = cmdCtx.args.slice(3, cmdCtx.args.length).join(' ');
            if(reason != "") { // Always check (who knows what could happend :) )
                banInfo.reason = reason;
            }
        }
        if(cmdCtx.msg.guild) {  // NTC
            this.processBan(bot, cmdCtx, cmdCtx.msg.guild, banInfo);
        }
    }

    private processBan(bot:Discord.Client, cmdCtx:CommandContext, thisServer:Discord.Guild, banInfo:typeBanInfo): boolean {
        if(banInfo.duration > 311040000) {
            Embed.Create(typeOfEmbed.basic, bot, cmdCtx.msg, color.gray, "Erreur de Ban",
                    [{title: "Commande non correcte", content: "Vous ne pouvez pas ban plus de 10 ans"}],
                    cmdCtx.msg.channel, { self: {removeItSelf: true, timeout: 5000}});
            return false;
        }
        let serverTarget = SQL_Link.getPair(thisServer.id);
        if(serverTarget.hasFail) {
            if(serverTarget.sqlError.type == 'NOTFOUND') {
                Embed.Create(typeOfEmbed.basic, bot, cmdCtx.msg, color.gray, "Erreur de Ban",
                        [{title: "Erreur de Link", content: "Ce serveur n'est Link avec aucun autre serveur"}],
                        cmdCtx.msg.channel, { self: {removeItSelf: true, timeout: 5000}});
            }
            else if(serverTarget.sqlError.type == 'CONNECTION') {
                Embed.Create(typeOfEmbed.basic, bot, cmdCtx.msg, color.gray, "Erreur de Ban",
                        [{title: "Erreur de Link", content: "Base De Donnée temporairement indisponible (sql request exit code : " + serverTarget.sqlError.exitCode}],
                        cmdCtx.msg.channel, { self: {removeItSelf: true, timeout: 5000}});
            }
            return false;
        }
        let userTarget = serverTarget.server.members.cache.get(banInfo.user);
        if(!userTarget) {
            Embed.Create(typeOfEmbed.basic, bot, cmdCtx.msg, color.gray, "Erreur de Ban",
                    [{title: "Erreur de correspondance", content: "Aucune correspondance dans le serveur lié avec : <@" + banInfo.user + ">"}],
                    cmdCtx.msg.channel, { self: {removeItSelf: true, timeout: 5000}});
                    return false;
        }
        
        if(!userTarget.bannable) {
            Embed.Create(typeOfEmbed.basic, bot, cmdCtx.msg, color.gray, "Erreur de Ban",
                    [{title: "Erreur de permissions", content: "Permission insufissante pour ban <@" + userTarget.user.id + ">"}],
                    cmdCtx.msg.channel, { self: {removeItSelf: true, timeout: 5000}});
                    return false;
        }
        
        serverTarget.server.members.cache.get(banInfo.user)?.bannable
        serverTarget.server.members.ban(banInfo.user, { reason: (banInfo.reason == "" ? undefined : banInfo.reason)});
        activeBan.add([banInfo.user, serverTarget.server, banInfo.duration]);

        Embed.Create(typeOfEmbed.basic, bot, cmdCtx.msg, color.red, "Ban réussi",
                [{title: "Ban réussi", content: "`Ban info :`\n<@" + banInfo.user + ">\n" +
                "`Durée  :`" + FromTimeStatesToString(fromMinutesToTimeStates(banInfo.duration)) +
                "`Raison :`*Aucune raison fournie*"}],
                cmdCtx.msg.channel, { latest: { removeLatestMessage: true, timeout: 0}});
        return true;
    }
}

import Discord from 'discord.js';
import { Command } from '../command'
import { CommandContext } from '../command_context'
import { Embed, typeOfEmbed, color} from '../Utility/embed'
import { pendingRequests as pending_requests } from './../global'
import { toMacro } from '../Utility/cast'
import { SQL_Link } from '../SQL/linking'
import { serverRequestData } from '../SQL/linking';

const IDlength = 18;

export class UnLink implements Command {
    public readonly commandName: string = "link";

    async run(bot: Discord.Client, cmdCtx: CommandContext): Promise<void> {
        cmdCtx.msg.reply("unlinking starts");

        // Checks command length
        if(cmdCtx.args.length != 2) {
            new Embed(typeOfEmbed.basic, bot, cmdCtx.msg, color.gray, "Erreur d'unlink",
                    [{title: "Commande non correcte", content: "Vous devez donner l'ID du serveur ainsi que le status que vous voulez lui assigner"}],
                    cmdCtx.msg.channel, {self: {removeItSelf: true, timeout: 5000}});
            return;
        }
        
        // Checks id validity
        if(cmdCtx.args[1].length != 18) {
            new Embed(typeOfEmbed.basic, bot, cmdCtx.msg, color.gray, "Erreur d'unlink",
                    [{title: "Commande non correcte", content: "Assurez vous que l'ID est correct (18 chiffres sans espaces)"}],
                    cmdCtx.msg.channel, {self: {removeItSelf: true, timeout: 5000}});
            return;
        }

        // Checks if the bot is in the server aimed
        let aimedServer = bot.guilds.cache.get(cmdCtx.args[1]);
        if(!aimedServer) {
            new Embed(typeOfEmbed.basic, bot, cmdCtx.msg, color.gray, "Erreur de link",
                    [{title: "Serveur ciblé non trouvé", content: "Aucune correspondance dans les serveurs prit en charge avec : " + cmdCtx.args[1]}],
                    cmdCtx.msg.channel, {self: {removeItSelf: true, timeout: 5000}});
            return;
        }
        
        // Check author permissions
        let author = cmdCtx.msg.guild?.members.cache.get(cmdCtx.msg.author.id)
        if(!author) return;
        if(!author.hasPermission('ADMINISTRATOR')) {
            new Embed(typeOfEmbed.basic, bot, cmdCtx.msg, color.gray, "Erreur de link",
                    [{title: "Manque de permission", content: "Pour pouvoir procéder à une requete de link, vous devez avoir la permission \'administrateur\'"}],
                    cmdCtx.msg.channel, {self: {removeItSelf: true, timeout: 5000}});
            return;
        }
        
        // Check requests dupplication
        let request_as_result = pending_requests.arr.find(request => {
            request.serverID == cmdCtx.args[1] && request.status == status
        });
        if(request_as_result != undefined) {
            new Embed(typeOfEmbed.basic, bot, cmdCtx.msg, color.gray, "Erreur de link",
                    [{title: "Dupplication de requête", content: "Une requête identique est déjà active"}],
                    cmdCtx.msg.channel, {self: {removeItSelf: true, timeout: 5000}});
        }

        let status = toMacro(cmdCtx.args[2]);
        let requestData: serverRequestData;
        if(status == 'NONE') return; // VNFC

        requestData = {serverID: cmdCtx.args[1], status: status};
        pending_requests.add(requestData);
        
        let opposite_status = status == 'MASTER' ? 'TARGET' : 'MASTER';
        request_as_result = pending_requests.arr.find(request => {
            request.serverID == cmdCtx.msg.guild?.id && request.status == opposite_status;
        });
        if(request_as_result != undefined) {
            if(request_as_result.status == 'MASTER') {
                let sql_succes: boolean = SQL_Link.Linking_process(request_as_result, requestData);
                if(sql_succes) {
                    new Embed(typeOfEmbed.basic, bot, cmdCtx.msg, color.green, "Requête de link réussie & Link réussi",
                            [{title: "Requête envoyé",
                            content: "Pour pouvoir compléter la liaison entre les deux serveurs, vous devez, dans la minute qui suite ce message," +
                            " répéter le processus dans l'autre serveur en ciblant celui ci et en donnant le status inverse"}],
                            cmdCtx.msg.channel, {self: {removeItSelf: true, timeout: 10000}});
                    return;
                }
                else {
                    new Embed(typeOfEmbed.basic, bot, cmdCtx.msg, color.gray, "Erreur de link",
                            [{title: "Dupplication de requête", content: "Une requête identique est déjà active"}],
                            cmdCtx.msg.channel, {self: {removeItSelf: true, timeout: 5000}});
                    return;
                }
            }
        }
        else {
            new Embed(typeOfEmbed.basic, bot, cmdCtx.msg, color.gray, "Erreur de link",
                    [{title: "Echec de l'enregistrement de liaison", content: "Re-essayez plus tard, le problème est de type SQL."}],
                    cmdCtx.msg.channel, {self: {removeItSelf: true, timeout: 5000}});
            return;
        }
    }
}

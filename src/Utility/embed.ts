import Discord from 'discord.js'

export enum color {
    red    = "#ff0000",
    green  = "#00ff00",
    blue   = "#0000ff",
    black  = "#000000",
    white  = "#ffffff",
    gray   = "#c7c7c7",
    purple = "#9300fc",
    orange = "#ff9a00"
}

export enum typeOfEmbed {
    basic,
    log
}

export class Embed {
    constructor(type: typeOfEmbed, bot: Discord.Client, msg: Discord.Message, color: color, title: string, content: {title: string, content: string, inline?: boolean}[],
        channel: Discord.PartialTextBasedChannelFields, suppression?: { self?: {removeItSelf: boolean, timeout:number}, latest?: {removeLatestMessage: boolean, timeout: number } } , ) {
        let embeded = new Discord.MessageEmbed;

        embeded.setColor(color);
        embeded.setTitle(title);

        let authorAvatarURL = msg.author.avatarURL();
        if (authorAvatarURL != null)
            embeded.setAuthor(msg.author.tag, authorAvatarURL);
        else
            embeded.setAuthor(msg.author.tag);

        for (const field of content) {
            embeded.addField(field.title, field.content, field.inline);
        }
        
        switch (type) {
            case typeOfEmbed.basic:
                break;
            case typeOfEmbed.log:
                embeded.addField("Date", new Date());
                break;
        }
        embeded.setTimestamp();

        channel.send({embed:embeded}).then((msgback) => {
            if(suppression?.self?.removeItSelf)
                if(suppression.self.timeout)
                    msgback.delete({timeout:suppression.self.timeout});
            
            if(suppression?.latest?.removeLatestMessage)
                if(suppression.latest.timeout)
                    if(bot.user) 
                        if(msg.guild?.members.cache.get(bot.user.id)?.hasPermission('MANAGE_MESSAGES'))
                            msg.channel.messages.cache.first()?.delete({timeout: suppression.latest.timeout});
        })
    }
}

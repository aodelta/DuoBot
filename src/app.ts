import { bot } from "./client"
import config  from '../config.json'

bot.start();

bot.login(config.bot.token);

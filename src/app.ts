import Discord from 'discord.js';
import { Client } from "./client"
import config  from '../config.json'

const bot = new Client();

bot.start();

bot.login(config.bot.token);
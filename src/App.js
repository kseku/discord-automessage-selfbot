import './replit-http-server.js';
import { Client } from 'discord.js-selfbot-v13';
import config from '../config.json' assert { type: 'json' };
import dotenv from 'dotenv';

const client = new Client({ checkUpdate: false, intents: ['GUILDS'] }); // TODO remove checkUpdate

const getNearestHourDate = (hour, minute) => {
  const result = new Date();

  result.setHours(hour);
  result.setMinutes(minute);
  result.setSeconds(0);
  result.setMilliseconds(0);

  if (new Date() > result) result.setDate(result.getDate() + 1);

  return result;
};

const repeatAtHourRecursively = (fn, hour, minute, callback) => {
  setTimeout(async () => {
    await fn();
    if (callback) callback();
    repeatAtHourRecursively(fn, hour, minute);
  }, getNearestHourDate(hour, minute).getTime() - new Date().getTime());
};

const randomArrayElement = array =>
  array[Math.floor(Math.random() * array.length)];

client.on('ready', () => {
  console.log(`ready as ${client.user.tag}!`);

  for (const target of config.targets) {
    const guild = client.guilds.cache.get(target.guildID);

    if (!guild) {
      console.log(`${target.guildID} guild not found!`);
      continue;
    }

    for (const channelId of target.channelIDs) {
      const channel = guild.channels.cache.get(channelId);

      if (!channel) {
        console.log(`${channelId} channel not found in guild ${guild.name}!`);
        continue;
      }

      let texts = [];

      for (const textPackName of target.textPacks) {
        const textPack = config.textPacks.find(tp => tp.name === textPackName);

        if (!textPack) {
          console.log(`${textPackName} textPack not found!`);
          continue;
        }

        texts = texts.concat(textPack.texts);
      }

      const text = randomArrayElement(texts);

      const white = '\x1b[0m';
      const gray = '\x1b[1m';

      if (texts.length > 0)
        repeatAtHourRecursively(
          async () => await channel.send(text),
          target.hour,
          target.minute,
          () =>
            console.log(
              `${white} sent "${gray}${text}${gray}"${white} in guild ${guild.name} in channel ${channel.name}`,
            ),
        );
    }
  }
});

dotenv.config();
client.login(process.env.TOKEN);

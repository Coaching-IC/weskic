import dotenv from "dotenv";

dotenv.config();
import {Api, TelegramClient} from 'telegram';
import {StringSession} from "telegram/sessions/index.js";
import {Logger} from 'telegram/extensions/index.js';
import {getLogger} from "./logger.mjs";

const stringSession = '';
const INFO_CHANNEL_ID = process.env.INFO_CHANNEL_ID;
const PROD = process.env.NODE_ENV.toLowerCase() === 'production';
const logger = getLogger(PROD);
Logger.setLevel(PROD ? 'none' : 'info');

let fullInfoChannel;

const client = new TelegramClient(
    new StringSession(stringSession),
    parseInt(process.env.TELEGRAM_API_ID),
    process.env.TELEGRAM_API_HASH,
    {connectionRetries: 2}
);

client.start({botAuthToken: process.env.TELEGRAM_BOT_TOKEN}).then(() => {
    logger.debug('Telegram client logged in');
    client.connect().then(() => {
        client.invoke(new Api.channels.GetChannels({id: [parseInt(process.env.INFO_CHANNEL_ID)]})).then(chats => {
            client.invoke(new Api.channels.GetFullChannel({channel: chats.chats[0]})).then(fullChannel => {
                fullInfoChannel = fullChannel;
            });
        });
    });

}).catch(err => {
    logger.error('Telegram bot failed to login');
    throw 'Telegram Bot Failed login : ' + err;
});

function listOfParticipantsInInfoChannel() {
    return new Promise((resolve, reject) => {
        client.invoke(new Api.channels.GetParticipants({
            channel: parseInt(process.env.INFO_CHANNEL_ID),
            filter: new Api.ChannelParticipantsRecent(null),
            offset: 0,
            limit: 300,
            hash: 0
        })).then(infoChannelParticipants => {
            resolve(infoChannelParticipants.users.map(user => user.username));
        }).catch(reject);
    });
}

export default {listOfParticipantsInInfoChannel};
import fs from 'fs';
import fsE from 'fs-extra';
import crypto from 'crypto';
import BPromise from 'bluebird';

let key; // aes-256 24B
let logger;
let userDataCache = {}; // key: sciper
let dataToSave = false;

fsE.ensureDirSync('data/user-data');

function loadEncryptedData() {
    const scipers = fs.readdirSync('data/user-data').filter(val => val.endsWith('.aes')).map(s => s.slice(5, 11));
    BPromise.each(scipers, sciper => restoreEncryptedUD(sciper)).then(() => {
        logger.debug(`Loaded ${Object.keys(userDataCache).length} user data objects.`);
    });
}

function storeEncryptedUD(sciper) {
    return new BPromise((resolve, reject) => {
        let iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
        const encrypted = Buffer.concat([cipher.update(JSON.stringify(userDataCache[sciper])), cipher.final()])
        const authTag = cipher.getAuthTag();
        const output = Buffer.concat([iv, authTag, encrypted]);
        fs.writeFile(`data/user-data/user-${sciper}.aes`, output, err => {
            if (err) reject(err);
            else resolve();
        });
    });
}

function restoreEncryptedUD(sciper) {
    logger.debug(`RESTORE UD ${sciper} START`);
    return new BPromise((resolve, reject) => {
        fs.readFile(`data/user-data/user-${sciper}.aes`, (err, all_data) => {
            if (err) reject(err);
            const iv = all_data.slice(0, 16);
            const authTag = all_data.slice(16, 32);
            const encrypted = all_data.slice(32);
            const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
            decipher.setAuthTag(authTag);
            let decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
            const ud = JSON.parse(decrypted.toString());
            userDataCache[sciper] = ud;
            logger.debug(`RESTORE UD ${sciper} END`);
            resolve(ud);
        });
    });
}

function saveUserData(sciper) {
    return new BPromise((resolve, reject) => {
        if (sciper !== undefined) {
            const ud = userDataCache[sciper];
            if (ud === undefined) {
                logger.error(`Save : Can't find user data for ${sciper}`);
                reject();
            } else {
                storeEncryptedUD(sciper).then(resolve).catch(reject);
            }
        } else {
            BPromise.map(Object.keys(userDataCache), sciper => storeEncryptedUD(sciper)).then(resolve).catch(reject);
        }
    });
}

function createUserData(tequilaAttributes) {
    const sciper = tequilaAttributes.uniqueid;
    return new BPromise((resolve, reject) => {
        const now = new Date();
        userDataCache[sciper] = {
            info: {
                sciper,
                units: tequilaAttributes.allunits.split(','),
                tequilaName: tequilaAttributes.displayname,
                registrationDate: now.toISOString(),
            }
        };
        storeEncryptedUD(sciper).then(() => {
            logger.info(`New registration for ${sciper} - ${tequilaAttributes.displayname}`);
            resolve(userDataCache[sciper]);
        }).catch(reject);
    });
}

/* ---------- EXPORTED ---------- */

function init(encryptionKey, udLogger) {
    if (encryptionKey === undefined) {
        logger.error('NO ENCRYPTION KEY');
        throw 'NO_ENCRYPTION_KEY';
    } else if (encryptionKey.length !== 32) {
        logger.error('ENCRYPTION KEY MUST BE 32B LONG');
        throw 'ENCRYPTION_KEY_LENGTH';
    }
    key = encryptionKey;
    logger = udLogger;
    loadEncryptedData();
}

function beforeExit(callback) {
    if (dataToSave) {
        saveUserData().then(() => {
            logger.info('Data saved, exiting ...');
            callback();
        });
    } else {
        logger.debug('Nothing to save, exiting ...');
        callback();
    }
}

function checkTequilaAttributes(tequilaAttributes) {
    return new Promise((resolve, reject) => {
        let ud = userDataCache[tequilaAttributes.uniqueid];
        if (ud) {
            resolve(ud);
        } else {
            createUserData(tequilaAttributes).then(resolve).catch(reject);
        }
    });
}

function mutateUserData(sciper, ud, lazy) {
    console.log(ud);
    return new Promise((resolve, reject) => {
        if (!userDataCache[sciper]) return reject('unknown sciper');
        mergeDeep(userDataCache[sciper], ud);
        if (lazy) {
            dataToSave = true;
            resolve(userDataCache[sciper]);
        } else {
            saveUserData(sciper).then(resolve).catch(reject);
        }
    });
}

function storeUserFile(sciper, fileId, buffer) {
    return new Promise((resolve, reject) => {

    });
}

function updateTelegramStatus(sciper, username, hasJoined) {
    userDataCache[sciper].step1 = userDataCache[sciper].step1 || {};
    userDataCache[sciper].step1.dischargeTelegram = userDataCache[sciper].step1.dischargeTelegram || {};
    userDataCache[sciper].step1.dischargeTelegram.telegram = userDataCache[sciper].step1.dischargeTelegram.telegram || {};
    userDataCache[sciper].step1.dischargeTelegram.telegram.username = username;
    userDataCache[sciper].step1.dischargeTelegram.telegram.hasJoined = hasJoined;
    dataToSave = true;
}

function getUserDataFromCache(sciper) {
    return userDataCache[sciper];
}

export default {
    init, beforeExit, checkTequilaAttributes, mutateUserData, updateTelegramStatus,
    getUserDataFromCache
};

/* ---------- HELPERS ---------- */

function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

function mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, {[key]: {}});
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, {[key]: source[key]});
            }
        }
    }

    return mergeDeep(target, ...sources);
}
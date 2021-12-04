import dotenv from "dotenv";
dotenv.config();
import fs from 'fs';
import fsE from 'fs-extra';
import BPromise from 'bluebird';
import {getLogger} from "./logger.mjs";

const PROD = process.env.NODE_ENV.toLowerCase() === 'production';
const logger = getLogger(PROD);
const MAX_NORMAL_REGISTRATIONS = isNaN(process.env.MAX_NORMAL_REGISTRATIONS)
    ? parseInt(process.env.MAX_NORMAL_REGISTRATIONS) : process.env.MAX_NORMAL_REGISTRATIONS;
const ADMINS = (process.env.ADMINS && process.env.ADMINS.split(',')) || [];
const GUESTS = (process.env.GUESTS && process.env.GUESTS.split(',')) || [];

let userDataCache = {}; // key: sciper
let dataToSave = false;

fsE.ensureDirSync('data/user-data');
fsE.ensureDirSync('data/user-files');

function loadData() {
    const scipers = fs.readdirSync('data/user-data').filter(val => val.endsWith('.json')).map(s => s.slice(5, 11));
    BPromise.each(scipers, sciper => parseUserData(sciper)).then(() => {
        logger.debug(`Loaded ${Object.keys(userDataCache).length} / max ${MAX_NORMAL_REGISTRATIONS} user data objects.`);
    });
}

function saveUserDataToDisk(sciper) {
    return new BPromise((resolve, reject) => {
        fs.writeFile(`data/user-data/user-${sciper}.json`, JSON.stringify(userDataCache[sciper],null,' '), err => {
            if (err) reject(err);
            else resolve();
        });
    });
}

function parseUserData(sciper) {
    return new BPromise((resolve, reject) => {
        fs.readFile(`data/user-data/user-${sciper}.json`, (err, all_data) => {
            if (err) reject(err);
            const ud = JSON.parse(all_data.toString());
            userDataCache[sciper] = ud;
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
                saveUserDataToDisk(sciper).then(resolve).catch(reject);
            }
        } else {
            BPromise.map(Object.keys(userDataCache), sciper => saveUserDataToDisk(sciper)).then(resolve).catch(reject);
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
                isAdmin: ADMINS.includes(sciper)
            },
            step1: {
                validated: false,
                validatedDate: '',
                reviewed: false,
                remarks: '',

                identity_officialName: tequilaAttributes.displayname,
                identity_sex: '',
                identity_firstname: tequilaAttributes.displayname.split(' ')[0],
                identity_emergencyPhone: '',
                identity_emergencyContact: '',
                identity_idCard: {
                    date: '',
                    fileName: '',
                    fileSize: 0,
                },

                constraints_diets: [],
                constraints_foodAllergy: '',
                constraints_drugsAllergy: '',

                activities_options: [],
                activities_skiLevel: '',
                activities_insuranceCard: {
                    date: '',
                    fileName: '',
                    fileSize: 0,
                },

                discharge_date: '',
                telegram: {
                    username: '',
                    hasJoined: false,
                }
            },
            step2: {
                available: false,
                amountToPay: 0,
                hasPaid: false,
                hasPaidDate: '',
                paymentStrategy: '',

                polybanking_date: '',
                polybanking_ref: '',
                polybanking_url: '',
                polybanking_ipn: {},
            },
            step3: {},
            step4: {},
        };
        saveUserDataToDisk(sciper).then(() => {
            logger.info(`New registration for ${sciper} - ${tequilaAttributes.displayname}`);
            resolve(userDataCache[sciper]);
        }).catch(reject);
    });
}

/* ---------- EXPORTED ---------- */

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
    return new Promise((resolve, reject) => {
        if (!userDataCache[sciper]) return reject('unknown sciper');
        mergeDeep(userDataCache[sciper], ud);
        if (lazy) {
            dataToSave = true;
            resolve(userDataCache[sciper]);
        } else {
            saveUserData(sciper).then(resolve(userDataCache[sciper])).catch(reject);
        }
    });
}

function updateTelegramStatus(sciper, username, hasJoined) {
    userDataCache[sciper].step1.telegram.username = username;
    userDataCache[sciper].step1.telegram.hasJoined = hasJoined;
    dataToSave = true;
}

function getUserDataFromCache(sciper) {
    return userDataCache[sciper];
}

function storeUserFile(sciper, type, originalName, buffer) {
    return new BPromise((resolve, reject) => {
        fs.writeFile(`data/user-files/${type}-${sciper}-${originalName}`, buffer, err => {
            if (err) reject(err);
            else {
                const now = new Date;
                const fileMeta = {
                    date: now.toISOString(),
                    fileSize: buffer.length,
                    fileName: originalName
                }
                if (type === 'identity_idCard') {
                    userDataCache[sciper].step1.identity_idCard = fileMeta;
                } else if (type === 'activities_insuranceCard') {
                    userDataCache[sciper].step1.activities_insuranceCard = fileMeta;
                } else {
                    reject('unknown type');
                }
                resolve(fileMeta);
            }
        });
    });
}

function loadUserFile(sciper, type, originalName) {
    return new BPromise((resolve, reject) => {
        fs.readFile(`data/user-files/${type}-${sciper}-${originalName}`, (err, all_data) => {
            if (err) return reject(err);
            if (!all_data) return reject('not found');
            resolve(all_data);
        });
    });
}

function dischargeSigned(sciper, dateObject) {
    userDataCache[sciper].step1.discharge_date = dateObject.toISOString();
    dataToSave = true;
}

function setStep1Validated(sciper, validated) {
    userDataCache[sciper].step1.validated = validated;
    userDataCache[sciper].step2.available = validated;

    if (validated) {
        const date = new Date();
        userDataCache[sciper].step1.validatedDate = date.toISOString();
        userDataCache[sciper].step2.amountToPay = 13500;
        if (userDataCache[sciper].step1.activities_options.includes('friday'))
            userDataCache[sciper].step2.amountToPay += 2600;
    } else {
        userDataCache[sciper].step2.amountToPay = 0;
        userDataCache[sciper].step1.validatedDate = '';
    }
    dataToSave = true;
}

function setStep1Reviewed(sciper, reviewed) {
    userDataCache[sciper].step1.reviewed = reviewed;
    dataToSave = true;
}

function setStep2HasPaid(sciper, hasPaid) {
    const date = new Date();
    userDataCache[sciper].step2.hasPaid = hasPaid;
    userDataCache[sciper].step2.hasPaidDate = date.toISOString();
    saveUserData(sciper);
}

function cancelStep(sciper, step) {
    if (step === 1) {
        userDataCache[sciper].step1.validated = false;
        userDataCache[sciper].step1.validatedDate = '';
        userDataCache[sciper].step2.available = false;
    } else if (step === 2) {
        userDataCache[sciper].step2.hasPaid = false;
        userDataCache[sciper].step2.hasPaidDate = '';
    } else {
        throw 'what is step ' + step;
    }
    dataToSave = true;
}

function setPolybankingRef(sciper, ref, url) {
    const date = new Date();
    userDataCache[sciper].step2.polybanking_date = date.toISOString();
    userDataCache[sciper].step2.polybanking_ref = ref;
    userDataCache[sciper].step2.polybanking_url = url;
    userDataCache[sciper].step2.polybanking_ipn = {};
    dataToSave = true;
}

function setPolybankingIPN(sciper, ipn) {
    userDataCache[sciper].step2.polybanking_ipn = ipn;
    if (parseInt(ipn['postfinance_status']) === 9 && ipn['postfinance_status_good'] === 'True') {
        setStep2HasPaid(sciper, true);
    } else setStep2HasPaid(sciper, false);
    dataToSave = true;
}

function resetPolybanking(sciper) {
    userDataCache[sciper].step2.polybanking_date = '';
    userDataCache[sciper].step2.polybanking_ref = '';
    userDataCache[sciper].step2.polybanking_url = '';
    userDataCache[sciper].step2.polybanking_ipn = {};
    dataToSave = true;
}

function deleteUserData(sciper) {
    delete userDataCache[sciper];
    fs.rm(`data/user-data/user-${sciper}.json`, err => {
        if (err) logger.error(`User data deletion failed, err : ${err}`);
    });
}

function allUserData() {
    return userDataCache;
}

function setUserData(sciper, ud) {
    userDataCache[sciper] = ud;
    return saveUserData(sciper);
}

function soldOut() {
    let normalCounter = 0;
    for (let sciper in userDataCache) {
        const ud = userDataCache[sciper];
        if (!ADMINS.includes(ud.info.sciper) && !GUESTS.includes(ud.info.sciper)) {
            normalCounter++;
        }
    }
    const isSoldOut = normalCounter >= MAX_NORMAL_REGISTRATIONS;
    logger.info(`[REG] SOLD OUT CHECK : ${normalCounter} / ${MAX_NORMAL_REGISTRATIONS} MAX : ${isSoldOut ? 'SOLD OUT !!' : (MAX_NORMAL_REGISTRATIONS-normalCounter)+' remaining'}`);
    return isSoldOut;
}

export default {
    loadData, beforeExit, checkTequilaAttributes, mutateUserData, updateTelegramStatus,
    getUserDataFromCache, storeEncryptedUserFile: storeUserFile, loadUserFile, dischargeSigned,
    setStep1Validated, setStep1Reviewed, setStep2HasPaid, cancelStep,
    setPolybankingRef, resetPolybanking, setPolybankingIPN, deleteUserData, allUserData,
    setUserData, soldOut,
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
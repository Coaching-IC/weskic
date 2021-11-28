import dotenv from "dotenv";

dotenv.config();
import express from "express";
import Validator from 'validator';
import {body, validationResult} from 'express-validator';
import multer from 'multer';

import userData from "./userData.mjs";
import {getLogger} from "./logger.mjs";
import telegramBot from './telegramBot.mjs';

const PROD = process.env.NODE_ENV.toLowerCase() === 'production';
const logger = getLogger(PROD);
const storage = multer.memoryStorage({
    limits: {
        fileSize: 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        logger.debug('MULTER FILE: ', file);
        cb(null, true);
    }
});
const upload = multer({storage});

let registrationRouter = express.Router();
let telegramUsernamesCache = [];

registrationRouter.post('/userData', (req, res) => {
   const ud = userData.getUserDataFromCache(req.jwtData.sciper);
    if (ud) {
        res.send({success: true, userData: ud});
    } else {
        res.send({success: false, error: 'not found'});
    }
});

registrationRouter.post('/checkTelegramUsername', body('telegramUsername').isString(),
    (req, res) => {
        const bodyErrors = validationResult(req);
        if (!bodyErrors.isEmpty()) {
            return res.status(400).json({
                errors: ['Body error, contact administrator'],
                bodyErrors: bodyErrors.array()
            });
        }
        const username = req.body.telegramUsername.replace('@', '');
        if (telegramUsernamesCache.includes(username)) {
            res.send({success: true});
        } else {
            telegramBot.listOfParticipantsInInfoChannel().then(list => {
                telegramUsernamesCache = list;
                const success = telegramUsernamesCache.includes(username);
                userData.updateTelegramStatus(req.jwtData.sciper, username, success);
                res.send({success});
            });
        }
    });

registrationRouter.post('/documentUpload', upload.single('document'), (req, res) => {
    const document = req.file;
    console.log(document);
});

registrationRouter.post('/updateUserData', body('userData').isObject(), body('lazy').isBoolean(),
    (req, res) => {
        const bodyErrors = validationResult(req);
        if (!bodyErrors.isEmpty()) {
            return res.status(400).json({
                errors: ['Body error, contact administrator'],
                bodyErrors: bodyErrors.array()
            });
        }
        const ud = req.body.userData;
        let localizedErrorMessages = [];

        // Validation
        try {
            if (ud.step1) {
                if (ud.step1.identity) {
                    if (Validator.isIn(ud.step1.identity.sex, ['male', 'female']))
                        localizedErrorMessages.push('Sexe invalide');
                    if (ud.step1.identity && Validator.isMobilePhone(ud.step1.identity.emergencyPhone, false, {strictMode: true}))
                        localizedErrorMessages.push(`Numéro d'urgence invalide`);
                    if (ud.step1.identity.emergencyContact.length === 0)
                        localizedErrorMessages.push(`Un contact d'urgence doit être renseigné`);
                }
                if (ud.step1.activities) {
                    if (ud.step1.activities.skiLevel.length === 0)
                        localizedErrorMessages.push(`Vous devez préciser un niveau de ski`);
                }
                if (ud.step1.dischargeTelegram) {
                    if (ud.step1.dischargeTelegram.discharge.fileId.length === 0)
                        localizedErrorMessages.push(`La décharge doit être signée`);
                    if (!ud.step1.dischargeTelegram.telegram.hasJoined)
                        localizedErrorMessages.push(`Vous devez rejoindre le groupe Telegram`);
                }
            }
        } catch (e) {
            logger.error(`Malformed request for user ${req.jwtData.sciper}`, req.body);
            res.sendStatus(400);
        }

        if (localizedErrorMessages.length > 0) {
            logger.info(`[REG] User ${req.jwtData.sciper} sent an incomplete form`, {localizedErrorMessages});
        }

        // Sanitation
        if (ud.info) delete ud.info;
        if (ud.step1 && ud.step1.identiy && ud.step1.identity.officialName)
            ud.step1.identity.officialName = req.jwtData.displayName;

        userData.mutateUserData(req.jwtData.sciper, ud, req.body.lazy).then(newUd => {
            res.send(localizedErrorMessages.length>0 ? {success: true, userData: newUd, errors: localizedErrorMessages} : {success: true, userData: newUd});
            logger.info(`[REG] User ${req.jwtData.sciper} updated his form. Lazy: ${req.body.lazy ? 'yes' : 'no'}`);
        }).catch(err => {
            logger.error(err);
            res.sendStatus(500);
        });
    });

export default {registrationRouter};
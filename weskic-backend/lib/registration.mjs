import dotenv from "dotenv";

dotenv.config();
import express from "express";
import Validator from 'validator';
import {body, validationResult} from 'express-validator';
import multer from 'multer';
import QRCode from 'qrcode';
import {resolve, join} from 'path';

import userData from "./userData.mjs";
import rooms from "./rooms.mjs";
import {getLogger} from "./logger.mjs";
import telegramBot from './telegramBot.mjs';
import dischargeGenerator from "./dischargeGenerator.mjs";
import Polybanking from './polybanking.mjs';
import BPromise from "bluebird";

const PROD = process.env.NODE_ENV.toLowerCase() === 'production';
const logger = getLogger(PROD);
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10485760 // 10MiB
    }
});

let registrationRouter = express.Router();
let telegramUsernamesCache = []
// let polybanking = new Polybanking();

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

        if (userData.getUserDataFromCache(req.jwtData.sciper).step1.validated) {
            return res.sendStatus(403);
        }

        const username = req.body.telegramUsername.replace('@', '');
        if (telegramUsernamesCache.includes(username)) {
            userData.updateTelegramStatus(req.jwtData.sciper, username, true);
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

function step1UpdateParser(step1) {
    let step1copy = {};
    let missingFields = [];

    const isArrayASubsetOf = (array, subset) => array && !isNaN(array.length) && array.length === 0
        || array.reduce((acc, val) => acc && subset.includes(val));

    // Identity
    if (step1.identity_sex && Validator.isIn(step1.identity_sex, ['male', 'female']))
        step1copy.identity_sex = step1.identity_sex;
    else missingFields.push('identity_sex');

    if (step1.identity_firstname)
        step1copy.identity_firstname = step1.identity_firstname;
    else missingFields.push('identity_firstname');

    if (step1.identity_emergencyPhone && step1.identity_emergencyPhone.startsWith('+'))
        step1copy.identity_emergencyPhone = step1.identity_emergencyPhone;
    else missingFields.push('identity_emergencyPhone');

    if (step1.identity_emergencyContact)
        step1copy.identity_emergencyContact = step1.identity_emergencyContact;
    else missingFields.push('identity_emergencyContact');

    // Constraints
    if (isArrayASubsetOf(step1.constraints_diets, ['vegetarian', 'gluten-free', 'pork-free', 'no-cheese', 'no-alcohol'])) {
        step1copy.constraints_diets = [];
        step1copy.constraints_diets.push(...step1.constraints_diets);
    }
    step1copy.constraints_foodAllergy = step1.constraints_foodAllergy;
    step1copy.constraints_drugsAllergy = step1.constraints_drugsAllergy;

    // Activities
    if (isArrayASubsetOf(step1.activities_options, ['course', 'friday', 'saturday-torgon', 'sunday-torgon', 'saturday-liberte', 'sunday-liberte'])) {
        step1copy.activities_options = [];
        step1copy.activities_options.push(...step1.activities_options);
    }
    if (step1.activities_skiLevel && Validator.isIn(step1.activities_skiLevel, ['first-time', 'beginner', 'intermediate', 'excellent']))
        step1copy.activities_skiLevel = step1.activities_skiLevel;
    else missingFields.push('activities_skiLevel');

    // Global
    step1copy.remarks = step1.remarks;

    return {step1: step1copy, step1MissingFields: missingFields};
}

function step2UpdateParser(step2, userData) {
    const step2copy = {};

    // "hasPay" check // Later : for admin-purpose only
    if (userData.step2.hasPaid) {
        return {step2: {}, step2Illegal: true};
    }

    // Payment strategy
    // if (!userData.step2.polybanking_ref && step2.paymentStrategy !== undefined && Validator.isIn(step2.paymentStrategy, ['', 'agepoly', 'polybanking']))
    //     step2copy.paymentStrategy = step2.paymentStrategy;

    return {step2: step2copy, step2Illegal: false};
}

registrationRouter.post('/updateUserData', body('userData').isObject(), body('lazy').isBoolean(),
    (req, res) => {
        const bodyErrors = validationResult(req);
        if (!bodyErrors.isEmpty()) {
            return res.status(400).json({
                errors: ['Body error, contact administrator'],
                bodyErrors: bodyErrors.array()
            });
        }
        const providedUserData = req.body.userData;
        const previousUserData = userData.getUserDataFromCache(req.jwtData.sciper);
        let safeUserData = {};
        let missingFields = [];

        // Sanitation & Validation
        const stepLocked = function () {
            logger.error(`[REG] User ${req.jwtData.tequilaName} #${req.jwtData.sciper} tried to modify locked step`);
            res.send({success: false, error: 'step locked'});
        }

        // STEP 1 - if not validated
        if (!previousUserData.step1.validated && providedUserData.step1) {
            let {step1, step1MissingFields} = step1UpdateParser(providedUserData.step1);
            safeUserData.step1 = step1;
            // Side-upload (files, signatures, telegram)
            if (!previousUserData.step1.identity_idCard.date) step1MissingFields.push('identity_idCard');
            if (!previousUserData.step1.activities_insuranceCard.date) step1MissingFields.push('activities_insuranceCard');
            if (!previousUserData.step1.discharge_date) step1MissingFields.push('discharge');
            if (!previousUserData.step1.telegram.hasJoined) step1MissingFields.push('telegram_hasJoined');
            missingFields.push(...step1MissingFields);
        } else if (previousUserData.step1.validated && providedUserData.step1) {
            return stepLocked();


            // STEP 2 - if not paid
            /*} else if (!previousUserData.step2.hasPaid && providedUserData.step2) {
                let {step2, step2Illegal} = step2UpdateParser(providedUserData.step2, previousUserData);
                safeUserData.step2 = step2;

            } else if (previousUserData.step2.hasPaid && providedUserData.step2) {
                return stepLocked();
            }*/

        }

        userData.mutateUserData(req.jwtData.sciper, safeUserData, req.body.lazy).then(newUserData => {
            userData.setStep1Reviewed(req.jwtData.sciper, false);
            logger.info(`[REG] User ${req.jwtData.sciper} updated his form. Lazy: ${req.body.lazy ? 'yes' : 'no'}`);

            // STEP 1 VALIDATION
            if (!req.body.lazy && missingFields.length === 0) {
                userData.setStep1Validated(req.jwtData.sciper, true);
                logger.info(`[REG] User ${req.jwtData.sciper} validated STEP 1`);
            }


            res.send({success: true, userData: newUserData, missingFields});
        }).catch(err => {
            logger.error(err);
            res.sendStatus(500);
        });
    });

registrationRouter.post('/uploadDocument', (req, res) => {

    if (userData.getUserDataFromCache(req.jwtData.sciper).step1.validated) {
        return res.sendStatus(403);
    }

    upload.single('file')(req, res, err => {
        if (err instanceof multer.MulterError && err.message === 'File too large') {
            return res.status(400).json({error: 'File too large'});
        } else if (err) {
            return res.sendStatus(500);
        } else if (!req.body.type || !Validator.isIn(req.body.type, ['identity_idCard', 'activities_insuranceCard'])) {
            console.log(req.body);
            return res.status(400).json({error: 'unknown type'});
        }
        const file = req.file;
        const typeCheck = ['application/pdf', 'image/jpg', 'image/jpeg', 'image/png'].includes(file.mimetype);
        if (!typeCheck) {
            logger.debug('Bad mimetype for upload : ', file.mimetype);
            return res.status(400).json({error: 'bad mimetype : ' + file.mimetype});
        }
        userData.storeEncryptedUserFile(req.jwtData.sciper, req.body.type, file.originalname, file.buffer).then(fileMeta => {
            logger.info(`[REG] User ${req.jwtData.sciper} uploaded their ${req.body.type} of size ${fileMeta.fileSize}`);
            res.send({success: true, fileMeta});
        });
    });
});

registrationRouter.post('/signing-qrcode', body('url'), (req, res) => {
    const bodyErrors = validationResult(req);
    if (!bodyErrors.isEmpty()) {
        return res.status(400).json({
            errors: ['Body error, contact administrator'],
            bodyErrors: bodyErrors.array()
        });
    }
    QRCode.toDataURL(req.body.url, (err, url) => {
        if (err) throw err;
        res.send({url});
    });
});

registrationRouter.post('/generate-discharge', body('lastname'), body('firstname'), body('place'),
    (req, res) => {
        const bodyErrors = validationResult(req);
        if (!bodyErrors.isEmpty() || Validator.isURL(req.body.signature)) {
            return res.status(400).json({
                errors: ['Body error, contact administrator'],
                bodyErrors: bodyErrors.array()
            });
        }

        if (userData.getUserDataFromCache(req.jwtData.sciper).step1.validated) {
            return res.sendStatus(403);
        }

        const dateObj = new Date();
        dischargeGenerator.generateDischarge(req, res, dateObj);
        userData.dischargeSigned(req.jwtData.sciper, dateObj)
        logger.info(`User ${req.jwtData.sciper} signed the discharge`);
    });

registrationRouter.get('/my-discharge.pdf', (req, res) => {
    const userFilesPath = resolve('data/user-files');
    const fileName = 'discharge-' + req.jwtData.sciper + '.pdf';
    res.sendFile(fileName, {root: userFilesPath});
});

// registrationRouter.post('/polybankingRequest', (req, res) => {
//     const ud = userData.getUserDataFromCache(req.jwtData.sciper);
//     if (!ud.step2.available || ud.step2.hasPaid || ud.step2.paymentStrategy!=='polybanking') {
//         logger.error(`[POLYBANKING] User ${req.jwtData.sciper} tried to make a new request`);
//         return res.sendStatus(400);
//     }
//
//     const ref = `weskic-${req.jwtData.sciper}-${Date.now()}`;
//     polybanking.new_transaction(ref, ud.step2.amountToPay).then(url => {
//         userData.setPolybankingRef(req.jwtData.sciper, ref, url);
//         res.send({success: true, url});
//     });
// });


registrationRouter.post('/getRooms', (req, res) => {
    const ud = userData.getUserDataFromCache(req.jwtData.sciper);
    const userGender = ud.step1.identity_sex;
    res.send({success: true, rooms: rooms.getClientRooms(userGender)});
});

registrationRouter.post('/reserveRoom', body('scipers').if(sciper => sciper.match(/^\d{6}(,\d{6})*$/g)),
// What a hack, fails validation exactly 1/2 times if I use .matches(regex) instead of .if(sciper=>sciper.match(regex))
    body('mixedRoom').isIn(['mixed', 'gendered', '']), body('number').isNumeric(), body('letter'),
    (req, res) => {
        const bodyErrors = validationResult(req);
        if (!bodyErrors.isEmpty()) {
            return res.status(400).json({
                errors: ['Body error, contact administrator'],
                bodyErrors: bodyErrors.array()
            });
        }

        const ud = userData.getUserDataFromCache(req.jwtData.sciper);
        const userGender = ud.step1.identity_sex;
        const number = req.body.number;
        const letter = req.body.letter;

        if (number === -1) {
            // Cancellation
            rooms.cancelReservation(req.jwtData.sciper).then(() => {
                userData.setRoomReservation(req.jwtData.sciper, -1, '').then(() => {
                    logger.info(`[ROOMS] ${req.jwtData.tequilaName} - ${req.jwtData.sciper} - CANCELLED room reservation`);
                    return res.send({success: true, rooms: rooms.getClientRooms(userGender)});
                }).catch(err => {
                    logger.error(`[ROOMS] ${req.jwtData.tequilaName} - ${req.jwtData.sciper} - FAILED to cancel room reservation : ${err}`);
                    return res.send({success: false, error: err});
                });
            }).catch(err => {
                logger.error(`[ROOMS] ${req.jwtData.tequilaName} - ${req.jwtData.sciper} - FAILED to cancel room reservation : ${err}`);
                return res.send({success: false, error: err});
            });
            return;
        }

        if (ud.step4.roomNumber > 0) {
            logger.info(`[ROOMS] ${req.jwtData.tequilaName} - ${req.jwtData.sciper} - FAILED to reserve room ${number}${letter} : already have a room`);
            return res.send({success: false, error: 'already have a room'});
        }

        const roomCompatible = rooms.isRoomCompatible(number, letter, userGender);
        if (!roomCompatible) {
            logger.info(`[ROOMS] ${req.jwtData.tequilaName} - ${req.jwtData.sciper} - FAILED to reserve room ${number}${letter} : unavailable`);
            return res.send({success: false, error: 'unavailable'});
        }

        const scipers = req.body.scipers.split(',');
        const mixedGender = req.body.mixedRoom === 'mixed';
        const roomPreviousGender = rooms.roomGender(number, letter);
        if (scipers.length > 1) {
            if (!scipers.includes(req.jwtData.sciper)) {
                return res.sendStatus(403);
            }

            if (!userData.checkScipers(scipers)) {
                logger.error(`[ROOMS] ${req.jwtData.tequilaName} - ${req.jwtData.sciper} - FAILED to reserve rooms ${number} : unknown scipers`);
                return res.send({success: false, error: 'unknown scipers'});
            }

            if (roomPreviousGender !== '') {
                for (let sciper of scipers) {
                    if (userData.getUserGender(sciper) !== roomPreviousGender) {
                        logger.error(`[ROOMS] ${req.jwtData.tequilaName} - ${req.jwtData.sciper} - FAILED to reserve rooms ${number} : gender mismatch`);
                        return res.send({success: false, error: 'gender mismatch'})
                    }
                }
            }

            let numberOfPeople = scipers.length;
            if (!rooms.checkCapacity(numberOfPeople, number, letter)) {
                logger.error(`[ROOMS] ${req.jwtData.tequilaName} - ${req.jwtData.sciper} - FAILED to reserve rooms ${number} : not enough space`);
                return res.send({success: false, error: 'not enough space'});
            }
            let promises = [];
            let freeSpaceA, freeSpaceB, ifsA, ifsB;
            if (letter !== '') {
                freeSpaceA = rooms.getFreeSpace(number, 'a');
                ifsA = freeSpaceA;
                freeSpaceB = rooms.getFreeSpace(number, 'b');
                ifsB = freeSpaceB;
            }
            for (let i = 0; i < numberOfPeople; i++) {
                const sciper = scipers[i];
                if (letter === '') {
                    promises.push(rooms.updateUserRoomReservation(sciper, number, '', mixedGender ? '' : userGender));
                } else if (i < ifsA) {
                    promises.push(rooms.updateUserRoomReservation(sciper, number, 'a', mixedGender ? '' : userGender));
                    freeSpaceA--;
                    // console.log(i, 'a', freeSpaceA);
                } else if (i < ifsA + ifsB) {
                    promises.push(rooms.updateUserRoomReservation(sciper, number, 'b', mixedGender ? '' : userGender));
                    freeSpaceB--;
                    // console.log(i, 'b', freeSpaceB);
                } else {
                    promises.push(rooms.updateUserRoomReservation(sciper, number, 'c', mixedGender ? '' : userGender));
                    // console.log(i, 'c');
                }
            }
            BPromise.all(promises).then(() => {
                logger.info(`[ROOMS] ${req.jwtData.tequilaName} - ${req.jwtData.sciper} - RESERVED ${scipers.length} beds in room ${number}`);
                return res.send({
                    success: true,
                    rooms: rooms.getClientRooms(ud.identity_sex),
                    reservedRoomNumber: req.body.number,
                    reservedRoomLetter: req.body.letter
                });
            }).catch(err => {
                logger.error(`[ROOMS] ${req.jwtData.tequilaName} - ${req.jwtData.sciper} - FAILED to reserve ${scipers.length} beds in room ${number} : update failed`);
                return res.send({success: false, error: 'update failed', message: err});
            });
        } else {
            if (rooms.getFreeSpace(number, letter) === 0) {
                logger.error(`[ROOMS] ${req.jwtData.tequilaName} - ${req.jwtData.sciper} - FAILED to reserve room ${number}${letter} : room is full`);
                return res.send({success: false, error: 'room is full', message: err});
            }
            rooms.updateUserRoomReservation(req.jwtData.sciper, number, letter, mixedGender ? '' : userGender).then(() => {
                logger.info(`[ROOMS] ${req.jwtData.tequilaName} - ${req.jwtData.sciper} - RESERVED room ${number}${letter}`);
                return res.send({
                    success: true,
                    rooms: rooms.getClientRooms(ud.identity_sex),
                    reservedRoomNumber: req.body.number,
                    reservedRoomLetter: req.body.letter
                });
            }).catch(err => {
                logger.error(`[ROOMS] ${req.jwtData.tequilaName} - ${req.jwtData.sciper} - FAILED to reserve room ${number}${letter} : update failed`);
                return res.send({success: false, error: 'update failed', message: err});
            });
        }


    });

export default {registrationRouter};
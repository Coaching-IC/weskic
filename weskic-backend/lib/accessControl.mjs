import dotenv from "dotenv";
dotenv.config();
import express from "express";
import jwt from "jsonwebtoken";
import tequila from "./tequila.mjs";
import userData from "./userData.mjs";
import {getLogger} from "./logger.mjs";

const JWT_KEY = process.env.JWT_KEY;
const TEQUILA_RETURN_URL = process.env.TEQUILA_RETURN_URL;
const UNITS_RULES = process.env.UNITS_RULES.split(' ');
const ADMINS = (process.env.ADMINS && process.env.ADMINS.split(',')) || [];
const GUESTS = (process.env.GUESTS && process.env.GUESTS.split(',')) || [];
const PROD = process.env.NODE_ENV.toLowerCase() === 'production';

const logger = getLogger(PROD);

let accessControlRouter = express.Router();

let authorizedUnits = []; // holds a cache of all units previously authorized by checkUnit

const checkAuthentication = function (req, res, next) {
    const bearerToken = req.params.jwt || req.headers['authorization'];
    if (typeof bearerToken !== 'undefined') {
        const tokenString = bearerToken.startsWith('Bearer') ? bearerToken.split(' ')[1] : bearerToken;
        jwt.verify(tokenString, JWT_KEY, (err, jwtData) => {
            if (err) {
                logger.error(`JWT Verification failed : ${err}, IP: ${req.ip}`);
                return res.sendStatus(403);
            }
            req.jwtData = jwtData;
            next();
        });
    } else {
        return res.sendStatus(403);
    }
}

const checkUnit = function (req, res, next) {
    if (ADMINS.includes(req.jwtData.sciper)
    || GUESTS.includes(req.jwtData.sciper)
    || userData.getUserDataFromCache(req.jwtData.sciper)) return next();

    if (userData.soldOut()) {
        res.send({error: 'ERR_SOLD_OUT'});
        return;
    }

    let errDate = false;
    let errList = false;
    let firstDate = undefined;
    let wildcardDate = undefined;

    for (let unit of req.jwtData.units) {
        if (authorizedUnits.includes(unit)) {
            next();
        } else {
            for (let rule of UNITS_RULES) {
                const ruleArr = rule.split('=');
                const date = new Date(ruleArr[0]);
                const elapsedMS = Date.now() - date;
                for (let ruleUnit of ruleArr[1].split(',')) {
                    let onTheList = false;
                    const indexOfStar = ruleUnit.indexOf('*');
                    if (indexOfStar !== -1 && ruleUnit.includes(unit.substr(0, indexOfStar))) {
                        onTheList = true;
                    }
                    if (ruleUnit === unit || onTheList)
                        if (elapsedMS > 0) {
                            errDate = false;
                            errList = false;
                            return next();
                        } else {
                            errDate = true;
                            firstDate = firstDate || date;
                        }
                    else {
                        errList = true;
                    }
                }
            }
        }
    }
    if (errDate) {
        logger.info(`User ${req.jwtData.sciper} tried to login too soon`);
        return res.send({error: 'ERR_DATE', date: firstDate});
    }
    if (errList) {
        logger.info(`User ${req.jwtData.sciper} is not on the list`);
        return res.send({error: 'ERR_LIST', date: wildcardDate});
    }
    throw 'This should not happend';
}

const checkRole = function (req, res, next) {
    //TODO checkRole works only for admins
    if (ADMINS.includes(req.jwtData.sciper)) next();
    else res.sendStatus(403);
}

const createJWT = function (tequilaObject) {
    return jwt.sign({
        sciper: tequilaObject.uniqueid,
        tequilaName: tequilaObject.displayname,
        units: tequilaObject.allunits.split(','),
    }, JWT_KEY);
}

const handleTequilaRequest = (req, res) => {
    const returnUrl = req.params.requestedPage ? TEQUILA_RETURN_URL + '/' + req.params.requestedPage : TEQUILA_RETURN_URL;    tequila.generateKey(returnUrl).then(key => {
        if (!key) {
            logger.error('Failed to generate a Tequila key');
            return res.sendStatus(500);
        }
        res.send({
            tequilaUrl: `https://tequila.epfl.ch/cgi-bin/tequila/auth?requestkey=${key}`
        })
    }).catch(err => {
        logger.error('REQUEST FETCH ERROR : ', err);
        res.sendStatus(500);
    });
}
accessControlRouter.get('/api/tequila/request', handleTequilaRequest);
accessControlRouter.get('/api/tequila/request/:requestedPage', handleTequilaRequest);

accessControlRouter.post('/api/tequila/login', (req, res) => {
    if (!req.body.key) {
        return res.sendStatus(400);
    }
    const key = req.body.key;
    tequila.getAttribute(key).then(tequilaAttributes => {
        if (typeof tequilaAttributes.uniqueid === 'undefined') {
            return res.send({error: 'ERR_TEQUILA'});
        }
        checkUnit({
            jwtData: {
                units: tequilaAttributes.allunits.split(','),
                sciper: tequilaAttributes.uniqueid
            }
        }, res, () => {
            userData.checkTequilaAttributes(tequilaAttributes).then(ud => {
                res.send({success: true, userData: ud, tequilaAttributes, jwt: createJWT(tequilaAttributes)});
            });
        });
    }).catch(err => {
        logger.error('LOGIN FETCH ERROR : ', err);
        res.sendStatus(500);
    });
});

export default {accessControlRouter, checkAuthentication, checkRole};
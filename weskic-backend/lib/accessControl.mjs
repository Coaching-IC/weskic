import dotenv from "dotenv";
dotenv.config();
import express from "express";
import jwt from "jsonwebtoken";
import tequila from "./tequila.mjs";
import userData from "./userData.mjs";

const JWT_KEY = process.env.JWT_KEY;
const TEQUILA_RETURN_URL = process.env.TEQUILA_RETURN_URL;
const UNITS_RULES = process.env.UNITS_RULES.split(' ');
const ADMINS = (process.env.ADMINS && process.env.ADMINS.split(',')) || [];

let accessControlRouter = express.Router();

let authorizeEveryone = false;
let authorizedUnits = []; // holds a cache of all units previously authorized by checkUnit

const checkAuthentication = function (req, res, next) {
    const bearerToken = req.headers['authorization'];
    if (typeof bearerToken !== 'undefined') {
        const tokenString = bearerToken.split(' ')[1];
        jwt.verify(tokenString, JWT_KEY, (err, userData) => {
            if (err) {
                logger.error(`JWT Verification failed : ${err}, IP: ${req.ip}`);
                return res.sendStatus(403);
            }
            req.userData = userData;
            checkUnit(req, res, next);
        });
    } else {
        return res.sendStatus(403);
    }
}

const checkUnit = function (req, res, next) {
    if (authorizeEveryone) return next();
    if (ADMINS.includes(req.userData.sciper)) return next();
    let errDate = false;
    let errList = false;
    let firstDate = undefined;
    let wildcardDate = undefined;

    for (let unit of req.userData.units) {
        if (authorizedUnits.includes(unit)) {
            next();
        } else {
            // Rather expensive but rarely used
            for (let rule of UNITS_RULES) {
                const ruleArr = rule.split('=');
                const date = new Date(ruleArr[0]);
                const elapsedMS = Date.now() - date;
                for (let ruleUnit of ruleArr[1].split(',')) {
                    let onTheList = false;
                    if (ruleUnit === '*') {
                        authorizeEveryone = elapsedMS > 0;
                        onTheList = authorizeEveryone;
                        wildcardDate = date;
                    } else {
                        const indexOfStar = ruleUnit.indexOf('*');
                        if (indexOfStar !== -1 && ruleUnit.includes(unit.substr(0, indexOfStar))) {
                            onTheList = true;
                        }
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
        return res.send({error: 'ERR_DATE', date: firstDate});
    }
    if (errList) {
        return res.send({error: 'ERR_LIST', date: wildcardDate});
    }
    throw 'This should not happend';
}

const checkAdmin = function (req, res, next) {
    if (ADMINS.includes(req.userData.sciper)) next();
    else res.sendStatus(403);
}

const createJWT = function (tequilaObject) {
    return jwt.sign({
        sciper: tequilaObject.uniqueid,
        displayName: tequilaObject.displayname,
        units: tequilaObject.allunits.split(','),
    }, JWT_KEY);
}

accessControlRouter.get('/api/tequila/request', (req, res) => {
    tequila.generateKey(TEQUILA_RETURN_URL).then(key => {
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
});

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
            userData: {
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

export default {accessControlRouter};
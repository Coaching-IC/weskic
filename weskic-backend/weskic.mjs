import dotenv from 'dotenv';
dotenv.config();

import jwt from 'jsonwebtoken';
import express from 'express';
import tequila from './tequila.mjs';
import updater from './staticUpdater.mjs';
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import * as fs from "fs";

const PORT = process.env.PORT;
const JWT_KEY = process.env.JWT_KEY;
const TEQUILA_RETURN_URL = process.env.TEQUILA_RETURN_URL;
const UNITS_RULES = process.env.UNITS_RULES.split(' ');
const ADMINS = (process.env.ADMINS && process.env.ADMINS.split(',')) || [];
const MANAGEMENT_KEY = process.env.MANAGEMENT_KEY;

const DIRNAME = dirname(fileURLToPath(import.meta.url));
console.log('UNITS_RULES', UNITS_RULES);
console.log('ADMINS', ADMINS);

if (!PORT) {
    console.error("Please specify a PORT in .env file");
    process.exit(1);
}
const app = express();
app.use(express.json());

let authorizeEveryone = false;
let authorizedUnits = []; // holds a cache of all units previously authorized by checkUnit

/* ---------------- AUTHORIZATION & TEQUILA ------------------- */

const checkAuthentication = function (req, res, next) {
    const bearerToken = req.headers['authorization'];
    if (typeof bearerToken !== 'undefined') {
        const tokenString = bearerToken.split(' ')[1];
        jwt.verify(tokenString, JWT_KEY, (err, userData) => {
            if (err) {
                console.error(`JWT Verification failed : ${err}, IP: ${req.ip}`);
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

app.get('/api/tequila/request', (req, res) => {
    tequila.generateKey(TEQUILA_RETURN_URL).then(key => {
        if (!key) {
            console.log('Failed to generate a Tequila key');
            return res.sendStatus(500);
        }
        res.send({
            tequilaUrl: `https://tequila.epfl.ch/cgi-bin/tequila/auth?requestkey=${key}`
        })
    }).catch(err => {
        console.error('REQUEST FETCH ERROR : ', err);
        res.sendStatus(500);
    });
});

app.post('/api/tequila/login', (req, res) => {
    if (!req.body.key) {
        console.log(req.body);
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
            res.send({success: true, tequilaData: tequilaAttributes, jwt: createJWT(tequilaAttributes)});
        });
    }).catch(err => {
        console.error('LOGIN FETCH ERROR : ', err);
        res.sendStatus(500);
    });
});

/* ------------ MANAGEMENT ---------- */

const checkManagementKey = function (req, res, next) {
    if (req.params['mgtKey'] && req.params['mgtKey'] === MANAGEMENT_KEY) {
        next();
    } else {
        res.sendStatus(403);
    }
}

app.get('/api/mgt/:mgtKey/check', checkManagementKey, (req, res) => {
    updater.checkLatest('data').then(p => {
        res.send(p);
    }).catch(err => {
        res.send({error: err});
    });
});

app.get('/api/mgt/:mgtKey/update', checkManagementKey, (req, res) => {
    updater.updateToLatest('data', 'data/static').then(p => {
        res.send(p);
    }).catch(err => {
        res.send({error: err});
    });
});

/* ------------ EXPRESS ---------- */

if (!fs.existsSync('data')) fs.mkdirSync('data');
if (!fs.existsSync('data/static')) fs.mkdirSync('data/static');

app.use(express.static('data/static'));
app.get('*', (req, res) => {
    res.sendFile(DIRNAME + '/data/static/index.html');
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

if (!fs.existsSync('data/static/index.html')) {
    updater.updateToLatest('data', 'data/static').catch(err => {
        throw err;
    });
}
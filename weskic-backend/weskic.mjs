import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import morgan from 'morgan';
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import * as fs from "fs";
import {body, validationResult} from 'express-validator';
import bodyParser from "body-parser";
import Polybanking from './lib/polybanking.mjs';

const PORT = process.env.PORT;
const UNITS_RULES = process.env.UNITS_RULES.split(' ');
const ADMINS = (process.env.ADMINS && process.env.ADMINS.split(',')) || [];
const MANAGEMENT_KEY = process.env.MANAGEMENT_KEY;
const AGEP_KEY = process.env.AGEP_KEY;

import updater from './lib/staticUpdater.mjs';
import {getLogger, getAccessLogger} from './lib/logger.mjs';
import userData from './lib/userData.mjs';
import accessControl from './lib/accessControl.mjs';
import registration from './lib/registration.mjs';
import mailService from "./lib/mailService.mjs";

const DIRNAME = dirname(fileURLToPath(import.meta.url));
const PROD = process.env.NODE_ENV.toLowerCase() === 'production';
const logger = getLogger(PROD);
const accessLogger = getAccessLogger(PROD);
const accessLoggerStream = {
    write: function (message) {
        accessLogger.info(message);
    }
}
const polybanking = new Polybanking();

const userDataReady = (req, res, next) => {
    if (userData.getUserDataFromCache(req.jwtData.sciper)) next();
    else {
        logger.error(`User data not ready for user ${req.jwtData.sciper} !`);
        res.status(400).json({error: 'no user data'});
    }
}

userData.loadData();

logger.info(`WESKIC Server starting in ${PROD ? 'PRODUCTION' : 'DEV'} mode`);
logger.debug({UNITS_RULES});
logger.debug({ADMINS});

if (!PORT) {
    logger.error("Please specify a PORT in .env file");
    process.exit(1);
}
const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
    stream: accessLoggerStream
}));

app.use(accessControl.accessControlRouter);
app.use('/api/reg/', accessControl.checkAuthentication, userDataReady, registration.registrationRouter);
app.use('/api/reg-jwt/:jwt/', accessControl.checkAuthentication, userDataReady, registration.registrationRouter);

/* ------------ UTILITIES ---------- */
app.post('/api/help-form', accessControl.checkAuthentication, body('type').isIn(['it', 'anim', 'admin', 'report']),
    body('subject'), body('message'), (req, res) => {
        const bodyErrors = validationResult(req);
        if (!bodyErrors.isEmpty()) {
            return res.status(400).json({
                errors: ['Body error, contact administrator'],
                bodyErrors: bodyErrors.array()
            });
        }
        mailService.sendHelpForm(req.jwtData.sciper, req.jwtData.tequilaName, req.jwtData.units, req.body.type, req.body.subject, req.body.message).then(() => {
            res.send({success: true});
        }).catch(() => {
            res.send({success: false});
        });
    });

/* ------------ AGEPOLY ACCESS ---------- */

const checkAgepKey = function (req, res, next) {
    if (req.body.agepKey && req.body.agepKey === AGEP_KEY) {
        next();
    } else {
        logger.error(`[AGEP] AGEP_KEY Check failed !`);
        res.sendStatus(403);
    }
}

const canPay = function (sciper, ud, res) {
    if (!ud) {
        logger.error(`[AGEP] Sciper ${sciper} no found`);
        res.send({success: false, error: 'sciper not found'});
        return false;
    }

    if (!ud.step2.available) {
        logger.error(`[AGEP] User ${ud.info.tequilaName} #${sciper} can not pay yet`);
        res.send({success: false, error: 'not allowed to pay'});
        return false;
    }

    if (ud.step2.paymentStrategy !== 'agepoly') {
        logger.error(`[AGEP] User ${ud.info.tequilaName} #${sciper} did not select agepoly payment`);
        res.send({success: false, error: 'agepoly not selected'});
        return false;
    }

    return true;
}

app.post('/api/agep/checkConnection', checkAgepKey, (req, res) => {
    res.send({success: true});
    logger.info(`[AGEP] Client checked the agepKey`);
});

app.post('/api/agep/readUser', checkAgepKey,
    body('sciper').isNumeric({no_symbols: false}).isLength({min: 6, max: 6}),
    (req, res) => {
        const bodyErrors = validationResult(req);
        if (!bodyErrors.isEmpty()) {
            return res.status(400).json({
                errors: ['Body error, contact administrator'],
                bodyErrors: bodyErrors.array()
            });
        }
        const sciper = req.body.sciper;
        const ud = userData.getUserDataFromCache(sciper);
        if (canPay(sciper, ud, res)) {
            const userPaymentData = {
                sciper,
                tequilaName: ud.info.tequilaName,
                units: ud.info.units,
                amountToPay: ud.step2.amountToPay,
                registrationDate: ud.step1.registrationDate,
                hasPaid: ud.step2.hasPaid,
            }
            logger.info(`[AGEP] Client read user ${ud.info.tequilaName} #${sciper}`);
            return res.send({success: true, userPaymentData});
        }
    });

app.post('/api/agep/updateUser', checkAgepKey,
    body('sciper').isNumeric({no_symbols: false}).isLength({min: 6, max: 6}),
    body('hasPaid').isBoolean(),
    (req, res) => {
        const bodyErrors = validationResult(req);
        if (!bodyErrors.isEmpty()) {
            return res.status(400).json({
                errors: ['Body error, contact administrator'],
                bodyErrors: bodyErrors.array()
            });
        }

        const sciper = req.body.sciper;
        const hasPaid = req.body.hasPaid;
        const ud = userData.getUserDataFromCache(sciper);

        // PREVENTING PAST PAYMENTS REMOVAL // Later : only admins can
        if (!hasPaid) {
            res.status(403).json({error: 'cannot cancel payment'});
            return;
        }

        if (canPay(sciper, ud, res)) {
            userData.setStep2HasPaid(sciper, hasPaid);
            const userPaymentData = {
                sciper,
                tequilaName: ud.info.tequilaName,
                units: ud.info.units,
                amountToPay: ud.step2.amountToPay,
                registrationDate: ud.step1.registrationDate,
                hasPaid: ud.step2.hasPaid,
            }
            logger.info(`[AGEP] Client updated user ${ud.info.tequilaName} #${sciper} : hasPaid=${ud.step2.hasPaid}`);
            return res.send({success: true, userPaymentData});
        }
    });

/* ------------ MANAGEMENT ---------- */

app.post('/api/mgt/polybankingIPN', (req, res) => {
    try {
        const sciper = req.body.reference.split('-')[1];
        const ud = userData.getUserDataFromCache(sciper);
        if (ud.step2.polybanking_ref === req.body.reference) {
            userData.setPolybankingIPN(sciper, req.body);
            logger.info(`[POLYBANKING] IPN Received for ${sciper}. body: ${JSON.stringify(req.body)}`);
            res.sendStatus(200);
        } else {
            console.log(ud.step2.polybanking_ref, req.body.reference,ud.step2.polybanking_ref === req.body.reference)
            logger.error(`[POLYBANKING] IPN Check failed ! body: ${JSON.stringify(req.body)}`);
            res.sendStatus(400);
        }
    } catch (e) {
        logger.error(`[POLYBANKING] IPN Check failed ! error: ${e} body: ${JSON.stringify(req.body)}`)
        res.sendStatus(400);
    }
});

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

app.get('/api/mgt/:mgtKey/userData/:sciper', checkManagementKey, (req, res) => {
    res.send(JSON.stringify(userData.getUserDataFromCache(req.params.sciper), null, ' '));
});

app.get('/api/mgt/:mgtKey/listFiles', checkManagementKey, (req, res) => {
    res.send(JSON.stringify(fs.readdirSync('data/user-files'), null, ' '));
});

app.get('/api/mgt/:mgtKey/userFiles/:sciper/:type/:originalName', checkManagementKey, (req, res) => {
    userData.loadUserFile(req.params.sciper, req.params.type, req.params.originalName)
        .then(file => res.send(file));
});

app.get('/api/mgt/:mgtKey/cancelStep/:step/:sciper', checkManagementKey, (req, res) => {
    logger.info(`[MGT] cancelStep ${req.params.step} for ${req.params.sciper}`);
    userData.cancelStep(req.params.sciper, parseInt(req.params.step));
    res.send(JSON.stringify(userData.getUserDataFromCache(req.params.sciper), null, ' '));
});

app.get('/api/mgt/:mgtKey/resetPolybanking/:sciper', checkManagementKey, (req, res) => {
    logger.info(`[MGT] resetPolybanking for ${req.params.sciper}`);
    userData.resetPolybanking(req.params.sciper);
    res.send(JSON.stringify(userData.getUserDataFromCache(req.params.sciper), null, ' '));
});

app.get('/api/mgt/:mgtKey/deleteUserData/:sciper', checkManagementKey, (req, res) => {
   logger.info(`[MGT] deleteUserData for ${req.params.sciper}`);
   if (req.params.sciper) {
       userData.deleteUserData(req.params.sciper);
   }
   res.sendStatus(200);
});

app.get('/api/mgt/:mgtKey/allUserData', checkManagementKey, (req, res) => {
    logger.info(`[MGT] allUserData`);
    res.send(userData.allUserData());
});

app.post('/api/mgt/:mgtKey/setUserData', checkManagementKey, (req, res) => {
    logger.info(`[MGT] setUserData for ${req.body.sciper}`);
    if (req.body.userData && Object.keys(req.body.userData).length > 0) {
        userData.setUserData(req.body.sciper, req.body.userData).then(() => {
            res.sendStatus(200);
        }).catch(res.status(500).send);
    } else res.status(400).json(req.body);
});

/* ------------ EXPRESS ---------- */

if (!fs.existsSync('data')) fs.mkdirSync('data');
if (!fs.existsSync('data/static')) fs.mkdirSync('data/static');

app.use(express.static('data/static'));
app.get('*', (req, res) => {
    res.sendFile(DIRNAME + '/data/static/index.html');
});

app.listen(PORT, () => {
    logger.debug(`Server listening on port ${PORT}`);
});

if (!fs.existsSync('data/static/index.html')) {
    updater.updateToLatest('data', 'data/static').catch(err => {
        throw err;
    });
}

/* ------ EXITING --------- */
['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
    'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
].forEach(function (sig) {
    process.on(sig, function () {
        terminator(sig);
        logger.info('Exiting because of signal: ' + sig);
    });
});

function terminator(sig) {
    if (typeof sig === "string") {
        userData.beforeExit(function () {
            console.log('Received %s - terminating WESKIC server ...', sig);
            process.exit(1);
        });
    }
}
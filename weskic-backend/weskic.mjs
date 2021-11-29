import dotenv from 'dotenv';

dotenv.config();
import express from 'express';
import morgan from 'morgan';
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import * as fs from "fs";
import {body, validationResult} from 'express-validator';

const PORT = process.env.PORT;
const UNITS_RULES = process.env.UNITS_RULES.split(' ');
const ADMINS = (process.env.ADMINS && process.env.ADMINS.split(',')) || [];
const MANAGEMENT_KEY = process.env.MANAGEMENT_KEY;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

import updater from './lib/staticUpdater.mjs';
import {getLogger, getAccessLogger} from './lib/logger.mjs';
import userData from './lib/userData.mjs';
import accessControl from './lib/accessControl.mjs';
import registration from './lib/registration.mjs';
import mailService from "./lib/mailService.mjs";

const DIRNAME = dirname(fileURLToPath(import.meta.url));
const PROD = process.env.NODE_ENV.toLowerCase() === 'production';
const logger = getLogger(PROD);
userData.init(ENCRYPTION_KEY, logger);
const accessLogger = getAccessLogger(PROD);
const accessLoggerStream = {
    write: function (message) {
        accessLogger.info(message);
    }
}

const userDataReady = (req, res, next) => {
    if (userData.getUserDataFromCache(req.jwtData.sciper)) next();
    else {
        logger.error(`User data not ready for user ${req.jwtData.sciper} !`);
        res.status(400).json({error: 'no user data'});
    }
}

logger.info(`WESKIC Server starting in ${PROD ? 'PRODUCTION' : 'DEV'} mode`);
logger.debug({UNITS_RULES});
logger.debug({ADMINS});

if (!PORT) {
    logger.error("Please specify a PORT in .env file");
    process.exit(1);
}
const app = express();
app.use(express.json());
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

app.get('/api/mgt/:mgtKey/userData/:sciper', checkManagementKey, (req, res) => {
    res.send(JSON.stringify(userData.getUserDataFromCache(req.params.sciper), null, ' '));
});

app.get('/api/mgt/:mgtKey/listFiles', checkManagementKey, (req, res) => {
    res.send(JSON.stringify(fs.readdirSync('data/user-files'), null, ' '));
});

app.get('/api/mgt/:mgtKey/userFiles/:sciper/:type/:originalName', checkManagementKey, (req, res) => {
    userData.loadEncryptedUserFile(req.params.sciper, req.params.type, req.params.originalName)
        .then(file => res.send(file));
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
import dotenv from "dotenv";
dotenv.config();
import {getLogger} from "./logger.mjs";
import SibApiV3Sdk from 'sib-api-v3-sdk';

const PROD = process.env.NODE_ENV.toLowerCase() === 'production';
const logger = getLogger(PROD);

let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SIB_API_KEY;

const typeMapTo = {
    it: [{"email":"sylvain.nerisson@epfl.ch","name":"Sylvain Nérisson"}],
    anim: [{"email":"Comite_Coaching_IC_21-22@groupes.epfl.ch","name":"Comité Coaching IC"}],
    admin: [{"email":"Comite_Coaching_IC_21-22@groupes.epfl.ch","name":"Comité Coaching IC"}],
    report: [{"email":"hugues.devimeux@epfl.ch","name":"Hugues Devimeux"},{"email":"paul.madelenat@epfl.ch","name":"Paul Madelénat"}],
}

const typeMapDescription = {
    it: 'Inscription / Site internet / IT',
    anim: 'Activités / Animation',
    admin: 'Administratif',
    report: 'Plainte / Reporter un abus',
}

function sendHelpForm(sciper, tequilaName, units, type, subject, message) {
    return new Promise((resolve,reject) => {
        let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

        if (!Object.keys(typeMapTo).includes(type)) {
            return reject('unknown type ' + type);
        }

        const typeDescription = typeMapDescription[type];

        sendSmtpEmail.subject = `[WESKIC Help] ` + subject;
        sendSmtpEmail.htmlContent = `<html><body><h3>WESKIC - ${typeDescription}</h3> <p>Envoyé par ${tequilaName} #${sciper}</p> <hr> <br><br> <p>${message}</p> </body></html>`;
        sendSmtpEmail.sender = {"name":"WESKIC Coaching IC","email":"noreply@epfl.ch"};
        sendSmtpEmail.to = typeMapTo[type];
        sendSmtpEmail.replyTo = {"email":"sylvain.nerisson@epfl.ch","name":"Sylvain Nérisson"};

        apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
            logger.info(`[MAIL] User ${sciper} sent a mail to ${type}`);
            logger.debug(`[MAIL] API Response : ` +  JSON.stringify(data));
            resolve();
        }, function(error) {
            logger.error('[MAIL] '+error);
            reject(error);
        });
    });
}

export default {sendHelpForm};
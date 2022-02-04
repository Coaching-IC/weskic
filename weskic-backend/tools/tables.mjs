import fetch from "node-fetch";
import fs from "fs";
import MD5File from "md5-file";
import child_process from "child_process";
const origin = process.argv[2];
const mgtKey = process.argv[3];

const ADMINS = ['324428','325723','327282'];
const GUESTS = ['324420','311258','310041','326295','313789','314474','341149'];

let emailsMap = {};
let output = [];

const peopleArr = JSON.parse(fs.readFileSync('tools/people.json').toString());
for (const p of peopleArr) emailsMap[p.sciper] = p.email;

fetch(origin + '/api/mgt/' + mgtKey + '/allUserData').then(response => {
    response.text().then(text => {
        const allUserData = JSON.parse(text);

        for (const sciper in allUserData) {
            const ud = allUserData[sciper];
            if (ADMINS.includes(sciper)) continue;

            let outputObject = {};
            outputObject.sciper = sciper;
            outputObject.name = ud.step1.identity_officialName;
            outputObject.email = emailsMap[sciper];
            outputObject.friday = ud.step1.activities_options.includes('friday');
            outputObject.telegramUsername = ud.step1.telegram.username;
            outputObject.amountToPay = ud.step2.amountToPay;
            outputObject.hasPaid = ud.step2.hasPaid;
            outputObject.paymentStrategy = ud.step2.paymentStrategy;

            output.push(outputObject);
        }

        console.log(JSON.stringify(output));
    });
}).catch(err => {
    console.error(err);
});
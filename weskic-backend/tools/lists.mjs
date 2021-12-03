import fetch from "node-fetch";
import fs from "fs";
import MD5File from "md5-file";
import child_process from "child_process";
const origin = process.argv[2];
const mgtKey = process.argv[3];
const outputEmails = process.argv[4] === 'emails';
const format = process.argv[5] || 'csv';

const ADMINS = ['324428','325723','327282'];
const GUESTS = [];

let emailsMap = {};
let alreadyNotifiedGood = [];

const peopleArr = JSON.parse(fs.readFileSync('tools/people.json').toString());
for (const p of peopleArr) emailsMap[p.sciper] = p.email;

alreadyNotifiedGood = fs.readFileSync('tools/alreadyNotifiedGood.csv').toString().split(',');

function output(list) {
    if (outputEmails) return '\n\n' + list.map(sciper => emailsMap[sciper]).join(format === 'csv' ? ',' : '\n') + '\n\n';
    else return list;
}

function NotifiedGood(sciper) {
    return alreadyNotifiedGood.includes(emailsMap[sciper]);
}

fetch(origin + '/api/mgt/' + mgtKey + '/allUserData').then(response => {
    response.text().then(text => {
        const allUserData = JSON.parse(text);

        let notPaid = [];
        let notPaidAgepoly = [];
        let notPaidPolybanking = [];
        let notPaidNothing = [];

        let hasPaid = [];

        for (const sciper in allUserData) {
            const ud = allUserData[sciper];
            if (ADMINS.includes(sciper)) continue;
            const notifiedGood = NotifiedGood(sciper);
            if (notifiedGood && !ud.step2.hasPaid) {
                console.error(`\n\n\n------- ERROR ------- >>> ${ud.info.tequilaName} has been notified good and "hasn't paid" ${sciper}\n\n\n`);
            } else if (notifiedGood) {
                continue // COMMENT TO IGNORE ALREADY NOTIFIED GOOD
            }

            if (ud.step2.hasPaid) hasPaid.push(sciper);
            else notPaid.push(sciper);
            if (!ud.step2.hasPaid && ud.step2.paymentStrategy === 'agepoly') notPaidAgepoly.push(sciper);
            if (!ud.step2.hasPaid && ud.step2.paymentStrategy === 'polybanking') notPaidPolybanking.push(sciper);
            if (!ud.step2.hasPaid && ud.step2.paymentStrategy === '') notPaidNothing.push(sciper);
        }

        console.log('\n\n\n')
        console.log(hasPaid.length + ' - Has paid, not notified yet', output(hasPaid));
        console.log('\n---\n');
        console.log(notPaid.length + ' - Not paid : ', output(notPaid));
        console.log('\n---\n');
        console.log(notPaidAgepoly.length + ' - Not paid AGEPOLY : ', output(notPaidAgepoly));
        console.log('\n---\n');
        console.log(notPaidPolybanking.length + ' - Not paid POLYBANKING : ', output(notPaidPolybanking));
        console.log('\n---\n');
        console.log(notPaidNothing.length + ' - Not paid and not selected payment strategy : ', output(notPaidNothing));
    });
}).catch(err => {
    console.error(err);
});
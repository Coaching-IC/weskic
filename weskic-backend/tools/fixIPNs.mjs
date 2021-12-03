import dotenv from "dotenv";
dotenv.config();
import fs from 'fs';
import fetch from "node-fetch";
import child_process from 'child_process';
import MD5File from 'md5-file';

const origin = process.argv[2];
const mgtKey = process.argv[3];

const polybankingArr = JSON.parse(fs.readFileSync('tools/good_polybanking.json').toString());

let counter = 0;
let done = 0;

let interval = setInterval(()=>{
    if (counter === polybankingArr.length) {
        console.log('/n/ndone:'+done);
        return clearInterval(interval);
    }
    const entry = polybankingArr[counter];

    const sciper = entry.reference.split('-')[1];

    fetch(origin + '/api/mgt/' + mgtKey + '/userData/' + sciper).then(response => {
        response.text().then(text => {
            const ud = JSON.parse(text);
            if (ud.step2.hasPaid === false) {
                ud.step1.validated = true;
                ud.step2.available = true;
                ud.step2.amountToPay = entry.amount;
                ud.step2.hasPaid = true;
                ud.step2.hasPaidDate = entry.creation_date;
                ud.step2.paymentStrategy = 'polybanking';
                ud.step2.hasPaidDate = entry.creation_date;
                ud.step2.polybanking_ref = entry.reference;
                console.log('Fix applied for ' + sciper);
                console.log(ud);

                fetch(origin + '/api/mgt/' + mgtKey + '/setUserData', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({sciper, userData: ud}),
                }).then(r => {
                    if (r.ok) {
                        console.log('All good !');
                        done++;
                    } else console.error(r.error());
                }).catch(console.error);

            } else {
                console.log('No fix needed');
            }
        });
    }).catch(err => {
        console.error(err);
    });

    counter++;
}, 200);


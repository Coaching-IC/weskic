import fetch from "node-fetch";
import fs from "fs";
import MD5File from "md5-file";
import child_process from "child_process";
const origin = process.argv[2];
const mgtKey = process.argv[3];

const ADMINS = ['324428','325723','327282'];
const GUESTS = [];

fetch(origin + '/api/mgt/' + mgtKey + '/allUserData').then(response => {
    response.text().then(text => {
        const allUserData = JSON.parse(text);

        let normal = 0;
        let guests = 0;

        let hasPaid = 0;
        let hasPaidAgepoly = 0;
        let hasNotPaidAgepoly = 0;
        let hasPaidPolybanking = 0;
        let hasNotPaidPolybanking = 0;

        let friday = 0;
        let saturdayTorgon = 0;
        let saturdayLiberte = 0;
        let sundayTorgon = 0;
        let sundayLiberte = 0;

        for (const sciper in allUserData) {
            const ud = allUserData[sciper];
            if (GUESTS.includes(sciper)) guests++;
            if (ADMINS.includes(sciper)) continue;
            normal++;

            if (ud.step2.hasPaid) hasPaid++;
            if (ud.step2.paymentStrategy === 'agepoly' && ud.step2.hasPaid) hasPaidAgepoly++;
            if (ud.step2.paymentStrategy === 'agepoly' && !ud.step2.hasPaid) hasNotPaidAgepoly++;
            if (ud.step2.paymentStrategy === 'polybanking' && ud.step2.hasPaid) hasPaidPolybanking++;
            if (ud.step2.paymentStrategy === 'polybanking' && !ud.step2.hasPaid) hasNotPaidPolybanking++;

            if (ud.step1.activities_options.includes('friday')) friday++;
            if (ud.step1.activities_options.includes('saturday-torgon')) saturdayTorgon++;
            if (ud.step1.activities_options.includes('saturday-liberte')) saturdayLiberte++;
            if (ud.step1.activities_options.includes('sunday-torgon')) sundayTorgon++;
            if (ud.step1.activities_options.includes('sunday-liberte')) sundayLiberte++;
        }
        console.log('\n\n\n');

        console.log(`Registrations: ${Object.keys(allUserData).length} ANY - ${normal} NORMAL - ${guests}/${GUESTS.length} GUESTS`);
        console.log();
        console.log(`- Payments -`);
        console.log(`Total: ${hasPaid} have paid, ${normal+guests - hasPaid} remaining (normal+guests)`);
        console.log(`       -> ${hasPaidAgepoly} have paid at Agepoly, ${hasNotPaidAgepoly} want to but haven't paid yet. SUM: ${hasPaidAgepoly+hasNotPaidAgepoly}`);
        console.log(`       -> ${hasPaidPolybanking} have paid on Polybanking, ${hasNotPaidPolybanking} want to but haven't paid yet. SUM: ${hasPaidPolybanking+hasNotPaidPolybanking}`);
        console.log();
        console.log(`- Activites -`);
        console.log(`Friday: ${friday}`);
        console.log(`Saturday: ${saturdayTorgon+saturdayLiberte} with ${saturdayTorgon} @Torgon and ${saturdayLiberte} @Liberté`);
        console.log(`Saturday: ${sundayTorgon+sundayLiberte} with ${sundayTorgon} @Torgon and ${sundayLiberte} @Liberté`);

        console.log('\n\n\n');

    });
}).catch(err => {
    console.error(err);
});
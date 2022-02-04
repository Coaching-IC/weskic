import fetch from "node-fetch";
import fs from "fs";
import MD5File from "md5-file";
import child_process from "child_process";
const origin = process.argv[2];
const mgtKey = process.argv[3];

const ADMINS = ['324428','325723','327282'];
const GUESTS = ['324420','311258','310041','326295','313789','314474','341149'];
const MAX_NORMAL_REGISTRATIONS = 130;

fetch(origin + '/api/mgt/' + mgtKey + '/allUserData').then(response => {
    response.text().then(text => {
        const allUserData = JSON.parse(text);

        let any = 0;
        let normal = 0;
        let guests = 0;
        let ba1 = 0;
        let ba3 = 0;

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

        let course = 0;
        let firstTime = 0
        let firstTimeWithCourse = 0;
        let beginner = 0;
        let beginnerWithCourse = 0;
        let intermediate = 0;
        let intermediateWithCourse = 0;
        let excellent = 0;
        let excellentWithCourse = 0;

        let noCheese = 0;

        for (const sciper in allUserData) {
            any++;
            const ud = allUserData[sciper];
            if (GUESTS.includes(sciper)) guests++;
            else if (ADMINS.includes(sciper)) continue;
            else normal++;
            if (ud.info.units.includes('in-ba1') || ud.info.units.includes('sc-ba1')) ba1++;
            if (ud.info.units.includes('in-ba3') || ud.info.units.includes('sc-ba3')) ba3++;

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

            if (ud.step1.activities_options.includes('course')) course++;
            if (ud.step1.activities_skiLevel === 'first-time') firstTime++;
            if (ud.step1.activities_skiLevel === 'first-time' && ud.step1.activities_options.includes('course')) firstTimeWithCourse++;
            if (ud.step1.activities_skiLevel === 'beginner') beginner++;
            if (ud.step1.activities_skiLevel === 'beginner' && ud.step1.activities_options.includes('course')) beginnerWithCourse++;
            if (ud.step1.activities_skiLevel === 'intermediate') intermediate++;
            if (ud.step1.activities_skiLevel === 'intermediate' && ud.step1.activities_options.includes('course')) intermediateWithCourse++;
            if (ud.step1.activities_skiLevel === 'excellent') excellent++;
            if (ud.step1.activities_skiLevel === 'excellent' && ud.step1.activities_options.includes('course')) excellentWithCourse++;

            if (ud.step1.constraints_diets.includes('no-cheese')) noCheese++;
        }
        console.log('\n\n\n');

        console.log(`Registrations: ${any} ANY - ${normal} NORMAL - ${MAX_NORMAL_REGISTRATIONS-normal} SLOTS REMAINING - ${guests}/${GUESTS.length} GUESTS - ${normal+guests} N+G `);
        console.log(`IC-BA1: ${ba1} - IC-BA3: ${ba3}`);
        console.log();
        console.log(`- Payments -`);
        console.log(`Total: ${hasPaid} have paid, ${normal+guests - hasPaid} remaining (normal+guests)`);
        console.log(`       -> ${hasPaidAgepoly} have paid at Agepoly, ${hasNotPaidAgepoly} want to but haven't paid yet. SUM: ${hasPaidAgepoly+hasNotPaidAgepoly}`);
        console.log(`       -> ${hasPaidPolybanking} have paid on Polybanking, ${hasNotPaidPolybanking} want to but haven't paid yet. SUM: ${hasPaidPolybanking+hasNotPaidPolybanking}`);
        console.log();
        console.log(`- Activites -`);
        console.log(`Friday: ${friday}`);
        console.log(`Saturday: ${saturdayTorgon+saturdayLiberte} with ${saturdayTorgon} @Torgon and ${saturdayLiberte} @Liberté`);
        console.log(`Sunday: ${sundayTorgon+sundayLiberte} with ${sundayTorgon} @Torgon and ${sundayLiberte} @Liberté`);
        console.log(`Ski Level : ${firstTime} first-time, ${beginner} beginners and ${intermediate} intermediate ${excellent} excellent`);
        console.log(`Course : ${course} total , ${firstTimeWithCourse} first-time, ${beginnerWithCourse} beginners and ${intermediateWithCourse} intermediate ${excellentWithCourse} excellent`);
        console.log(`- Diets -`);
        console.log(`No cheese: ${noCheese}`);
        console.log('\n\n\n');

    });
}).catch(err => {
    console.error(err);
});
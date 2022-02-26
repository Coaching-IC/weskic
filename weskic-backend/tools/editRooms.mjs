import dotenv from "dotenv";
dotenv.config();
import fs from 'fs';
import fetch from "node-fetch";
import child_process from 'child_process';
import MD5File from 'md5-file';

const origin = process.argv[2];
const mgtKey = process.argv[3];

const filePath = '/tmp/rooms.json';

fetch(origin + '/api/mgt/' + mgtKey + '/getRooms').then(response => {
    response.text().then(text => {
        const jsonFromText = JSON.parse(text);
        const prettyJson = JSON.stringify(jsonFromText, null, ' ');
        fs.writeFileSync(filePath, prettyJson);
        const hashBefore = MD5File.sync(filePath);
        const editor = process.env.EDITOR || 'vim';
        const child = child_process.spawn(editor, [filePath], {
            stdio: 'inherit'
        });

        child.on('exit', () => {
            const changed = MD5File.sync(filePath) !== hashBefore;
            if (changed) {
                console.log('Uploading modified user data ...');
                const fileData = fs.readFileSync(filePath);
                const rooms = JSON.parse(fileData.toString());
                fetch(origin + '/api/mgt/' + mgtKey + '/setRooms', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({rooms}),
                }).then(r => {
                    if (r.ok) {
                        console.log('All good !');
                    } else console.error(r.error());
                }).catch(console.error);
            } else {
                console.log('File not modified. Abort modification');
            }
        });
    });
}).catch(err => {
    console.error(err);
});
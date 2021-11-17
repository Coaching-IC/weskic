import fetch from 'node-fetch';
import * as fs from "fs";
import * as fsExtra from "fs-extra";
import {pipeline} from 'stream';
import {promisify} from 'util';
import AdmZip from 'adm-zip';

const TAGS_URL = 'https://api.github.com/repos/Coaching-IC/weskic/tags';
const REL_URL = 'https://github.com/Coaching-IC/weskic/releases/download/latest/weskic-fe-release.zip';

function checkLatest(dataFolder) {
    return new Promise((resolve, reject) => {
        fetch(TAGS_URL).then(r => r.json()).then(tags => {
            if (tags.message && tags.message.indexOf('API rate limit exceeded') !== -1) {
                return resolve({rateLimit: true});
            }
            for (let tag of tags) {
                if (tag.name === 'latest') {
                    const latestSha = tag['commit']['sha'];
                    const dataDirEntries = fs.readdirSync(dataFolder);
                    const latestName = 'rel_' + latestSha + '.zip';
                    let localReleaseFound = false;
                    for (let entry of dataDirEntries) {
                        if (entry === latestName) {
                            localReleaseFound = true;
                        }
                    }
                    resolve({isLatest: localReleaseFound, latestSha, latestName});
                }
            }
        }).catch(err => reject(err));
    });
}

function updateToLatest(dataFolder, outputFolder) {
    return new Promise((resolve, reject) => {
        checkLatest(dataFolder).then(({isLatest, latestSha, latestName, rateLimit}) => {
            if (rateLimit) {
                console.log(`Hit Github API rate limit :(`);
                return reject('RATE_LIMIT');
            } else if (isLatest) {
                console.log('No update, already on the latest release');
                return resolve({latestSha, wasLatest: isLatest});
            }
            console.log('Fetching latest static release ...');
            const streamPipeline = promisify(pipeline);
            fetch(REL_URL).then(response => {
                if (!response.ok) reject(new Error(`unexpected response ${response.statusText}`));
                const zipPath = `${dataFolder}/${latestName}`;
                streamPipeline(response.body, fs.createWriteStream(zipPath)).then(() => {
                    const zip = new AdmZip(zipPath, {});
                    zip.extractEntryTo('weskic-frontend/dist/', outputFolder, true, true, false, undefined);
                    fsExtra.copySync(`${outputFolder}/weskic-frontend/dist`, `${outputFolder}`, {overwrite: true});
                    fsExtra.remove(`${outputFolder}/weskic-frontend`);
                    console.log('Updated to latest release, SHA: ', latestSha);
                    resolve({latestSha, wasLatest: false});
                });
            }).catch(err => reject(err));
        }).catch(err => reject(err));
    });
}

export default {checkLatest, updateToLatest};
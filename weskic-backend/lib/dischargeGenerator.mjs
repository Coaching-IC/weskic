import fs from "fs";
import {PDFDocument} from "pdf-lib";

const modelPath = 'data/assets/charte-weskic.pdf';
const fieldsMetadata =
    {
        lastname: {
            page: 0,
            x: 90,
            y: 610,
            size: 12,
        },
        firstname: {
            page: 0,
            x: 290,
            y: 610,
            size: 12,
        },
        sciper: {
            page: 0,
            x: 500,
            y: 610,
            size: 12,
        },
        place: {
            page: 1,
            x: 100,
            y: 375,
            size: 15,
        },
        readAndApproved: {
            page: 1,
            x: 75,
            y: 307,
            size: 15,
        },
        signature: {
            page: 1,
            x: 190,
            y: 260,
            height: 70,
            width: 130
        },
        date: {
            page: 1,
            x: 100,
            y: 263,
            size: 15,
        },
    };

function generateDischarge(req, res, dateObject) {
    const pdfFilename = 'discharge-' + req.jwtData.sciper + '.pdf';
    const pdfPath = 'data/user-files/' + pdfFilename;
    const values = {
        signature: req.body.signature,
        lastname: req.body.lastname,
        firstname: req.body.firstname,
        place: req.body.place,
        date: dateObject.toLocaleDateString(),
        sciper: req.jwtData.sciper,
        readAndApproved: 'Lu et approuvé'
    }

    fs.readFile(modelPath, (err, buffer) => {
        if (err) {
            console.error(`[EzSign] failed to open PDF ${modelPath}`);
            return res.sendStatus(500);
        }

        PDFDocument.load(buffer).then(pdfDoc => {
            const pages = pdfDoc.getPages();

            for (let fieldName of Object.keys(fieldsMetadata)) {
                if (fieldName !== 'signature') {
                    const fieldMeta = fieldsMetadata[fieldName];
                    const fieldValue = values[fieldName];
                    const i = fieldMeta['page'];
                    pages[i].drawText(fieldValue, fieldMeta);
                }
            }

            pdfDoc.embedPng(values['signature']).then(sigImage => {
                const sigMeta = fieldsMetadata['signature'];
                pages[sigMeta['page']].drawImage(sigImage, sigMeta);

                pdfDoc.save().then(newBuffer => {
                    fs.writeFile(pdfPath, newBuffer, {}, err => {
                        if (err) {
                            console.error(`[EzSign] couldn't save PDF ${pdfPath} : `, err);
                            return res.sendStatus(500);
                        }
                        const link = '/api/reg/my-discharge.pdf';
                        return res.send({filename: pdfFilename, link});
                    });
                });
            })
        }).catch(err => {
            console.error(`[EzSign] PDF Document error ${modelPath} : `, err);
            return res.sendStatus(500);
        });
    });
}

export default {generateDischarge};
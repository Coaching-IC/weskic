import fetch from 'node-fetch';

const params = [
    "displayname",
    "uniqueid",
    "allunits",
    "faculty"
];

const dict2txt = (dict, opt_operator = "=") => {
    return Object.keys(dict)
        .map((k) => k + opt_operator + dict[k] + "\n")
        .join("")
        .slice(0, -1);
};

const txt2dict = (txt, opt_operator = "=") => {
    const dict = {};
    txt
        .replace(/\r/, "")
        .split("\n")
        .forEach((line) => {
            const sepIndex = line.indexOf(opt_operator);
            if (sepIndex === -1) return;
            dict[line.slice(0, sepIndex)] = line.slice(
                sepIndex + opt_operator.length
            );
        });
    return dict;
};

function generateKey(trgt_url) {
    const options = {
        client: "express-middleware-tequila",
        urlaccess: trgt_url,
        request: params.join(","),
        service: "Coaching IC - WESKIC <3",
    };

    return fetch("https://tequila.epfl.ch/cgi-bin/tequila/createrequest", {
        method: "POST",
        body: dict2txt(options),
    })
        .then((res) => res.text())
        .then((res) => txt2dict(res))
        .then((res) => res.key);
}

function getAttribute(key) {
    const options = {
        key: key,
    };
    return fetch("https://tequila.epfl.ch/cgi-bin/tequila/fetchattributes", {
        method: "POST",
        body: dict2txt(options),
    })
        .then((res) => res.text())
        .then((res) => txt2dict(res));
}

export default { generateKey, getAttribute };
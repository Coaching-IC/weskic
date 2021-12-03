import dotenv from "dotenv";
dotenv.config();
import fetch from 'node-fetch';
import crypto from 'crypto';

function polybanking(base_url = "https://polybanking.agepoly.ch") {
    this.config_id = process.env.POLYBANKING_CONFIG_ID;
    this.keyREQ = process.env.POLYBANKING_KEY_REQ;
    this.keyIPN = process.env.POLYBANKING_KEY_IPN;
    this.keyAPI = process.env.POLYBANKING_KEY_API;
    this.base_url = base_url;

    this.new_transaction = function (ref, amount, extra_data = "") {
        let url = this.base_url + "/paiements/start/"
        let init_data = {
            config_id: this.config_id,
            reference: ref,
            amount: amount,
            extra_data: extra_data,
        }

        let post_data = sortObject(init_data);
        post_data.sign = hash(post_data, this.keyREQ);

        let queryString = Object.keys(post_data).map(key => key + '=' + post_data[key]).join('&');

        return fetch(url, {
            method: 'POST',
            body: queryString,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
            .then(res => {
                try {
                    return res.json();
                } catch {
                    console.log(res);
                    console.log(res.text());
                    return Promise.reject("Erreur :on pb request to json");
                }
            })
            .then(res => {
                if (res.url !== '') {
                    return res.url;
                } else {
                    return Promise.reject("Erreur : " + res.status);
                }
            });
    }

    this.check_ipn = function (body) {
        let post_data = sortObject(body);
        delete post_data.sign;
        return !(body.sign != hash(post_data, this.keyIPN) || body.config != this.config_id);
    }
}

function escape_chars(s) {
    return s.toString().replace(';', '!!').replace('=', '??');
}

function sortObject(in_data) {
    let out_data = {};
    Object.keys(in_data).sort().forEach(function (key) {
        out_data[key] = in_data[key];
    });
    return out_data;
}

function hash(obj, secret) {
    console.log('function hash(obj, secret)', obj);
    let str = "";
    for (const [key, value] of Object.entries(obj)) {
        str = str + escape_chars(key) + '=' + escape_chars(value) + ';' + secret + ';';
    }

    return crypto.createHash('sha512').update(str).digest('hex');
}

export default polybanking;

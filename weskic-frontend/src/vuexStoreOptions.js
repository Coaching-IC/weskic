import {ToastProgrammatic as Toast} from "buefy";

function post(state, url, data) {
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + state.jwt
            },
            body: JSON.stringify(data),
        }).then(r => {
            if (r.ok) {
                resolve(r.json())
            } else reject('Bad status code');
        }).catch(reject);
    });
}

function uploadDocument(state, url, data) {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        for(const name in data) {
            formData.append(name, data[name]);
        }
        fetch(url, {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + state.jwt
            },
            body: formData,
        }).then(r => {
            if (r.ok) {
                resolve(r.json())
            } else reject('Bad status code');
        }).catch(reject);
    });
}

export default {
    state: {
        jwt: localStorage.getItem('jwt') || '',
        userData: JSON.parse(localStorage.getItem('userData')) || {
            jwtData: {
                sciper: '',
                units: [],
                tequilaName: '',
                registrationDate: ''
            },
            step1: {
                validated: false,
                reviewed: false,
                remarks: '',

                identity_officialName: '',
                identity_sex: '',
                identity_firstname: '',
                identity_emergencyPhone: '',
                identity_emergencyContact: '',
                identity_idCard: {
                    date: '',
                    fileName: '',
                    fileSize: 0,
                },

                constraints_diets: [],
                constraints_foodAllergy: '',
                constraints_drugsAllergy: '',

                activities_options: [],
                activities_skiLevel: '',
                activities_insuranceCard: {
                    date: '',
                    fileName: '',
                    fileSize: 0,
                },

                discharge_date: '',
                telegram: {
                    username: '',
                    hasJoined: false,
                }
            },
            step2: {
                available: false,
            },
            step3: {},
            step4: {},
        },
    },

    mutations: {
        loggedIn(state, {jwt, userData}) {
            state.jwt = jwt;
            state.userData = userData;
            localStorage.setItem('jwt', jwt);
            localStorage.setItem('userData', JSON.stringify(userData));
        },
        partialLogin(state, {jwt}) {
            state.jwt = jwt;
        },
        logout(state) {
            state.jwt = '';
            state.userData = {};
            localStorage.clear();
        },
        setUserData(state, userData) {
            state.userData = userData;
        },
        setTelegramUsernameStatus(state, {username, hasJoined}) {
            state.userData.step1.telegram.username = username;
            state.userData.step1.telegram.hasJoined = hasJoined;
        }
    },

    actions: {
        loginWithTequila() {
            fetch('/api/tequila/request').then(response => response.json()).then(res => {
                if (res.tequilaUrl) {
                    window.location = res.tequilaUrl;
                }
            }).catch(err => {
                console.error('Failed to reach the API', err);
                Toast.open({
                    message: 'Failed to reach the API',
                    type: 'is-danger',
                    position: 'is-top',
                });
            });
        },

        checkTelegramUsername({commit, state}, {telegramUsername}) {
            return post(state, '/api/reg/checkTelegramUsername', {telegramUsername}).then(response => {
                commit('setTelegramUsernameStatus', {username: telegramUsername, hasJoined: response.success});
                if (!response.success) {
                    Toast.open({
                        message: `@${telegramUsername} non trouvé sur WESKIC Information`,
                        type: 'is-danger',
                        position: 'is-top',
                    });
                }
                return {username: telegramUsername.replace('@',''), hasJoined: response.success};
            }).catch(err => console.error('Failed to update telegram username status', err));
        },

        pullUserData({commit, state}) {
            return post(state, '/api/reg/userData', {}).then(response => {
               if (response.success) {
                   commit('setUserData', response.userData);
                   return response.userData;
               } else {
                   console.error('Failed to pull userData', response);
               }
            });
        },

        editUserData({commit,state}, {userData, lazy}) {
            return post(state, '/api/reg/updateUserData', {userData, lazy}).then(response => {
                if (response.success) {
                    console.log(response);
                    commit('setUserData', response.userData);
                    return response;
                } else {
                    console.error('Failed to update user data', response);
                }
            }).catch(err => {
                console.error('Failed to update user data: ', err);
            });
        },

        uploadDocument({state}, {type, file}) {
            return uploadDocument(state, '/api/reg/uploadDocument', {type, file}).then(response => {
                console.log(response);
                return response;
            }).catch(err => console.error('Failed to upload document', err));
        },

        generateSignatureQRCode({state}) {
            return post(state, '/api/reg/signing-qrcode', {url: window.location.origin + '/discharge/' + state.jwt});
        },

        generateDischarge({state/*, commit*/}, {signature, lastname, firstname, place}) {
            return post(state, '/api/reg/generate-discharge', {signature, lastname, firstname, place}).then(response => {
                if (response.success) {
                    console.log(response);
                } else {
                    console.error('Failed to generate dischage', response);
                }
            });
        }
    }
};
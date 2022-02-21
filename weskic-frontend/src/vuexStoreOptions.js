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
        agepKey: localStorage.getItem('agepKey') || '',
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
                validatedDate: '',
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
                amountToPay: 0,
                hasPaid: false,
                hasPaidDate: '',
                paymentStrategy: '',

                polybanking_date: '',
                polybanking_ref: '',
                polybanking_url: '',
                polybanking_ipn: {},
            },
            step3: {},
            step4: {
                roomNumber: 0,  // 0 unknown, -1 not selected
                roomLetter: '',
            },
        },
        rooms: []
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
        setAgepKey(state, agepKey) {
            state.agepKey = agepKey;
        },
        setUserData(state, userData) {
            state.userData = userData;
        },
        setTelegramUsernameStatus(state, {username, hasJoined}) {
            state.userData.step1.telegram.username = username;
            state.userData.step1.telegram.hasJoined = hasJoined;
        },
        setRooms(state, rooms) {
            state.rooms = rooms;
        },
        setCurrentRoom(state, {roomNumber, roomLetter}) {
            state.userData.step4.roomNumber = roomNumber;
            state.userData.step4.roomLetter = roomLetter;
        }

    },

    actions: {
        loginWithTequila(_, {requestedPage}) {
            fetch(requestedPage ? '/api/tequila/request/' + requestedPage : '/api/tequila/request').then(response => response.json()).then(res => {
                if (res.tequilaUrl) {
                    window.location = res.tequilaUrl;
                }
            }).catch(err => {
                console.error('Failed to reach the API', err);
                Toast.open({
                    message: 'Impossible de contacter le serveur',
                    type: 'is-danger',
                    position: 'is-top',
                });
            });
        },

        /* REGISTRATION */

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
                    commit('setUserData', response.userData);
                    return response;
                } else {
                    return Promise.reject(response.error);
                }
            }).catch(err => {
                return Promise.reject(err);
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
        },

        helpForm({state}, {type, subject, message}) {
            return post(state, '/api/help-form', {type,subject,message});
        },

        /* AGEPOLY PAYMENTS */

        checkAgepKey({state,commit}, {agepKey}) {
            return new Promise((resolve,reject) => {
                post(state, '/api/agep/checkConnection', {agepKey}).then(response=> {
                    if (response.success) {
                        commit('setAgepKey', agepKey);
                        localStorage.setItem('agepKey', agepKey);
                        resolve();
                    } else {
                        reject(response.error);
                    }
                }).catch(reject);
            });
        },

        agepReadUser({state}, {sciper}) {
            return post(state, '/api/agep/readUser', {sciper, agepKey: state.agepKey});
        },

        agepUpdateUser({state}, {sciper, hasPaid}) {
            return post(state, '/api/agep/updateUser', {sciper, hasPaid, agepKey: state.agepKey});
        },

        /* POLYBANKING */

        polybankingRequest({state}) {
            return post(state, '/api/reg/polybankingRequest', {});
        },

        /* ROOM RESERVATION */

        getRooms({state, commit}) {
            return post(state, '/api/reg/getRooms', {}).then(response => {
                if (response.success) {
                    commit('setRooms', response.rooms);
                } else {
                    console.error('Failed to pull rooms', response);
                }
            })
        }

    }
};
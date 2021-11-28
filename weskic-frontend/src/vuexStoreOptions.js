import {ToastProgrammatic as Toast, DialogProgrammatic} from "buefy";

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

// function uploadDocument(state, url, data) {
//     return new Promise((resolve, reject) => {
//         const formData = new FormData();
//         for(const name in data) {
//             formData.append(name, data[name]);
//         }
//         fetch(url, {
//             method: 'POST',
//             headers: {
//                 Authorization: 'Bearer ' + state.jwt
//             },
//             body: formData,
//         }).then(r => {
//             if (r.ok) {
//                 resolve(r.json())
//             } else reject('Bad status code');
//         }).catch(reject);
//     });
// }

export default {
    state: {
        jwt: localStorage.getItem('jwt') || '',
        status: {
            uploadingFile: false,
            submittingLazyUpdate: false,
            submittingUpdate: false,
        },
        userData: JSON.parse(localStorage.getItem('userData')) || {
            info: {
                sciper: '',
                units: [],
                tequilaName: '',
                registrationDate: ''
            },
            step1: {
                validated: false,
                reviewed: false,
                remarks: '',
                adminRemarks: '',
                identity: {
                    officialName: '',
                    sex: '',
                    firstname: '',
                    emergencyPhone: '',
                    emergencyContact: '',
                    idCard: {
                        fileId: '',
                        date: '',
                        fileName: '',
                        fileSize: 0,
                    },
                },
                constraints: {
                    diets: [],
                    foodAllergy: '',
                    drugsAllergy: '',
                },
                activities: {
                    options: [],
                    skiLevel: '',
                    insuranceCard: {
                        fileId: '',
                        date: '',
                        fileName: '',
                        fileSize: 0,
                    },
                },
                dischargeTelegram: {
                    discharge: {
                        fileId: '',
                        date: '',
                    },
                    telegram: {
                        username: '',
                        hasJoined: false
                    }
                },
            }
        },
    },

    mutations: {
        loggedIn(state, {jwt, userData}) {
            state.jwt = jwt;
            state.userData = userData;
            localStorage.setItem('jwt', jwt);
            localStorage.setItem('userData', JSON.stringify(userData));
        },
        logout(state) {
            state.jwt = '';
            state.userData = {};
            localStorage.clear();
        },
        setUserData(state, userData) {
            state.userData = userData;
        },
        setStatus(state, {statusKey, newStatus}) {
            state.status[statusKey] = newStatus;
        },
        setTelegramUsernameStatus(state, {username, hasJoined}) {
            state.userData.step1 = state.userData.step1 || {};
            state.userData.step1.dischargeTelegram = state.userData.step1.dischargeTelegram || {};
            state.userData.step1.dischargeTelegram.telegram = state.userData.step1.dischargeTelegram.telegram || {};
            state.userData.step1.dischargeTelegram.telegram.username = username;
            state.userData.step1.dischargeTelegram.telegram.hasJoined = hasJoined;
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
            commit('setStatus', {statusKey: 'submittingLazyUpdate', newStatus: true})
            post(state, '/api/reg/updateUserData', {userData, lazy}).then(response => {
                if (response.success) commit('setUserData', userData);
                else {
                    const message = `Le formulaire a été refusé à cause des erreurs suivantes :<br>${response.errors.join('<br>')}`;
                    if (lazy) {
                        console.error(message);
                    } else {
                        DialogProgrammatic.alert({
                            title: 'Formulaire refusé',
                            message,
                            type: 'is-danger',
                            hasIcon: true,
                            icon: 'times-circle',
                            iconPack: 'fa',
                            ariaRole: 'alertdialog',
                            ariaModal: true
                        });
                    }
                }
            }).catch(err => {
                console.error('Failed to update user data: ', err);
            }).finally(() => {
                commit('setStatus', {statusKey: 'submittingLazyUpdate', newStatus: false})
            });
        }
    }
};
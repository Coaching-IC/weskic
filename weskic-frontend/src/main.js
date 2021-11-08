import Vue from 'vue';
import Vuex from 'vuex';
import Buefy from 'buefy';
import 'buefy/dist/buefy.css';
import VueRouter from "vue-router";

import {ToastProgrammatic as Toast} from 'buefy'

import App from './App.vue';
import LoginView from "@/components/LoginView";
import WhatView from "@/components/WhatView";
import NotFoundView from "@/components/NotFoundView";
import RegistrationView from "@/components/RegistrationView";

Vue.config.productionTip = false;
Vue.use(Buefy);
Vue.use(VueRouter);
Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        jwt: localStorage.getItem('jwt') || '',
        tequilaData: JSON.parse(localStorage.getItem('tequilaData')) || {},
    },
    mutations: {
        loggedIn(state, {jwt, tequilaData}) {
            state.jwt = jwt;
            state.tequilaData = tequilaData;
            localStorage.setItem('jwt', jwt);
            localStorage.setItem('tequilaData', JSON.stringify(tequilaData));
        },
        logout(state) {
            state.jwt = '';
            state.tequilaData = {};
            localStorage.clear();
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
        }
    }
});

function tequilaResponseHandler(to, from, next) {
    if (!to.query.key) {
        next({name: 'welcome'});
    }

    fetch('/api/tequila/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            key: to.query.key,
        })
    }).then(response => response.json()).then(message => {

        if (message['success'] === true) {
            store.commit('loggedIn', message);
            router.push({name: 'registration'});
        } else {
            if (message['error'] === 'ERR_LIST') {
                Toast.open({
                    message: 'Votre section n\'est pas autorisée à s\'inscrire à cet événement. Si vous pensez qu\'il sagit d\'une erreur, conectactez le comité du Coaching IC',
                    type: 'is-danger',
                    position: 'is-top',
                });
            } else {
                if (message['error'] && message['date']) {
                    const d = new Date(message['date']);
                    console.log(message);
                    const dateStr = d.toLocaleString('fr-FR', {weekday: 'long', month: 'long', day: 'numeric'});
                    Toast.open({
                        message: `Tu ne peux pas encore t'inscrire, pour ta section c'est à partir du ${dateStr}`,
                        type: 'is-warning',
                        position: 'is-top',
                        indefinite: true
                    });
                } else if (message['ERR_LIST']) {
                    Toast.open({
                        message: `Ta section n'est pas conviée à cet événement. Désolé :/`,
                        type: 'is-warning',
                        position: 'is-top',
                        indefinite: true
                    });
                } else if (message['error'] === 'ERR_TEQUILA') {
                    Toast.open({
                        message: `L'authentifcation Tequila a échoué`,
                        type: 'is-danger',
                        position: 'is-top',
                    });
                } else {
                    Toast.open({
                        message: 'Une erreur inconnue est survenue',
                        type: 'is-danger',
                        position: 'is-top',
                    });
                }
                router.push({name: 'login'});
            }
        }

        console.log(message);
    }).catch(err => {
        console.error(err);
        Toast.open({
            message: 'Une erreur serveur est survenue',
            type: 'is-danger',
            position: 'is-top',
        });
    });
}

const routes = [
    {path: '/', redirect: {name: 'what'}},
    {path: '/what-is-weskic', component: WhatView, name: 'what'},
    {
        path: '/login', component: LoginView, name: 'login', beforeEnter: (from, to, next) => {
            if (store.state.jwt !== '') next({name: 'registration'}); else next();
        }
    },
    {path: '/not-found', component: NotFoundView, name: 'not-found'},
    {path: '/tequila', beforeEnter: tequilaResponseHandler},
    {
        path: '/registration', component: RegistrationView, name: 'registration', beforeEnter: (from, to, next) => {
            if (store.state.jwt === '') next({name: 'login'}); else next();
        }
    },
    {
        path: '/logout', name: 'logout',
        beforeEnter: (from, to, next) => {
            console.log('logging out ...');
            store.commit('logout');
            next({name: 'login'});
        }
    },
    {path: '/*', redirect: {name: 'not-found'}},
]

const router = new VueRouter({
    routes,
    mode: 'history'
});

new Vue({
    router,
    store,
    render: h => h(App),
}).$mount('#app')

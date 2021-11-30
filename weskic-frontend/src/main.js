import Vue from 'vue';
import Vuex from 'vuex';
import Buefy from 'buefy';
import 'buefy/dist/buefy.css';
import VueRouter from "vue-router";

import {ToastProgrammatic as Toast} from 'buefy'

import App from './App.vue';
import LoginView from "@/components/LoginView";
import InfoView from "@/components/InfoView";
import NotFoundView from "@/components/NotFoundView";
import RegistrationView from "@/components/RegistrationView";
import HelpView from "@/components/HelpView";
import vuexStoreOptions from './vuexStoreOptions';
import DischargeForm from "@/components/registration/DischargeForm";
import AgepView from "@/components/AgepView";
import PolybankingConfirmationView from "@/components/PolybankingConfirmationView";


Vue.config.productionTip = false;
Vue.use(Buefy);
Vue.use(VueRouter);
Vue.use(Vuex);

const store = new Vuex.Store(vuexStoreOptions);

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
            if (!to.params.requestedPage) router.push({name: 'registration'});
            else {
                router.push({name: to.params.requestedPage});
            }
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

function dischargeHandler(to, from, next) {
    store.commit('partialLogin', {jwt: to.params.jwt});
    next();
}

function agepKeyHandler(to) {
    store.dispatch('checkAgepKey', {agepKey: to.params.agepKey}).then(() => {
        Toast.open({
            message: 'Connexion réussie',
            type: 'is-success',
            position: 'is-top',
            duration: 3000
        });
        router.push({name: 'agep'});
    }).catch(err => {
        Toast.open({
            message: 'La clé d\'accès est incorrecte. Contactez le responsable',
            type: 'is-danger',
            position: 'is-top',
            indefinite: true
        });
        console.error(`Failed to check agepKey`, err);
        router.push({name: 'help'});
    });
}

const routes = [
    {path: '/', redirect: {name: 'info'}},
    {path: '/info', component: InfoView, name: 'info'},
    {
        path: '/login', component: LoginView, name: 'login', beforeEnter: (from, to, next) => {
            if (store.state.jwt !== '') next({name: 'registration'}); else next();
        }
    },
    {path: '/not-found', component: NotFoundView, name: 'not-found'},
    {path: '/discharge/:jwt', beforeEnter: dischargeHandler, component: DischargeForm, name: 'discharge'},
    {path: '/tequila', beforeEnter: tequilaResponseHandler},
    {path: '/tequila/:requestedPage', beforeEnter: tequilaResponseHandler},
    {path: '/agep', name: 'agep', component: AgepView},
    {path: '/agep/:agepKey', beforeEnter: agepKeyHandler},
    {path: '/polybanking/:status', component: PolybankingConfirmationView},
    {
        path: '/registration', component: RegistrationView, name: 'registration', beforeEnter: (from, to, next) => {
            if (store.state.jwt === '') next({name: 'login'}); else next();
        }
    },
    {
        path: '/help', component: HelpView, name: 'help', beforeEnter: (from, to, next) => {
            if (store.state.jwt === '') store.dispatch('loginWithTequila', {requestedPage: 'help'}); else next();
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

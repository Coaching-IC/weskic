<template>
  <div style="width: 95vw;">
    <div v-if="!errorState" class="container box">
      <b-loading :active="isLoading" :is-full-page="true"></b-loading>
      <h1 class="title">Interface Boutique AGEPoly</h1>
      <hr>

      <div class="columns">
        <div class="column">
          <b-field label="Numéro SCIPER du participant"
                   message="Merci de le lire sur la carte CAMIPRO pour éviter les erreurs">
            <b-input v-model="currentSciper" expanded @input="updateSciper"></b-input>
            <p class="control">
              <b-button class="button is-info" @click="updateSciper">Rechercher</b-button>
            </p>
          </b-field>

          <hr>

          <b-button v-if="!currentUserPaymentData.hasPaid" type="is-success" expanded :disabled="!canPay || !currentUserPaymentData.sciper" @click="setHasPaid(true)">Confirmer le paiement</b-button>
          <b-button v-else type="is-warning" expanded :disabled="!canPay || !currentUserPaymentData.sciper" @click="setHasPaid(false)">Annuler le paiement</b-button>
        </div>

        <div class="column">
          <div v-if="currentUserPaymentData.sciper">
            <b-notification :closable="false">
              <h1 class="title" style="font-size: 19pt;">{{currentUserPaymentData.tequilaName}}</h1>
              <b-taglist>
                <b-tag v-for="unit in currentUserPaymentData.units" v-bind:key="unit" type="is-info">{{ unit }}</b-tag>
              </b-taglist>
              <hr>
              <b-tag class="is-large" :type="currentUserPaymentData.hasPaid ? 'is-success' : 'is-danger'">
                Montant {{currentUserPaymentData.hasPaid ? 'payé' : 'à payer'}} : {{amount}}</b-tag>
            </b-notification>
          </div>
          <div v-else>
            <b-notification :closable="false">
              <h2 class="subtitle">Aucune donnée à afficher, entrez un numéro SCIPER</h2>
            </b-notification>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {ToastProgrammatic as Toast} from "buefy";
// import {mapState} from "vuex";

export default {
  name: 'AgepView',
  components: {},
  data: () => ({
    currentSciper: '',
    currentUserPaymentData: {},
    errorState: false,
    canPay: false,
    isLoading: false,
  }),
  mounted() {
    if (!this.$store.state.agepKey) {
      Toast.open({
        message: `Connexion impossible, merci d'utiliser le lien qu'on vous a fourni`,
        type: 'is-danger',
        position: 'is-top',
        indefinite: true
      });
      this.errorState = true;
    }
  },
  props: {},
  methods: {
    updateSciper() {
      if (this.currentSciper.length !== 6) {
        this.currentUserPaymentData = {};
        return;
      }
      this.$store.dispatch('agepReadUser', {sciper: this.currentSciper}).then(response => {
        this.currentUserPaymentData = response.userPaymentData || {};
        if (response.success) {
          this.canPay = true;
        } else {
          this.canPay = false;
          switch (response.error) {
            case 'sciper not found':
              Toast.open({
                message: `SCIPER inconnu. La personne n'est probablement pas inscrite`,
                type: 'is-danger',
                position: 'is-top',
                duration: 5000,
              });
              break;

            case 'not allowed to pay':
              Toast.open({
                message: `Impossible de procéder au paiement : la personne n'a pas terminé son inscription`,
                type: 'is-danger',
                position: 'is-top',
                duration: 5000,
              });
              break;

            default:
              Toast.open({
                message: `Erreur inconnue`,
                type: 'is-danger',
                position: 'is-top',
              });
          }
        }
      }).catch(err => {
        this.currentUserPaymentData = {};
        this.canPay = false;
        console.error(err);
        Toast.open({
          message: `Erreur inconnue`,
          type: 'is-danger',
          position: 'is-top',
        });
      });
    },

    setHasPaid(hasPaid) {
      this.$store.dispatch('agepUpdateUser', {sciper: this.currentSciper, hasPaid: hasPaid}).then(response => {
        this.currentUserPaymentData = response.userPaymentData || {};
        if (response.success && this.currentUserPaymentData.hasPaid === true) {
          Toast.open({
            message: `Paiement enregistré`,
            type: 'is-success',
            position: 'is-top',
            duration: 3000,
          });
        } else if (response.success) {
          Toast.open({
            message: `Paiement annulé`,
            type: 'is-warning',
            position: 'is-top',
            duration: 3000,
          });
        } else {
          Toast.open({
            message: `Erreur inconnue`,
            type: 'is-danger',
            position: 'is-top',
          });
        }
      }).catch(err => {
        this.currentUserPaymentData = {};
        this.canPay = false;
        console.error(err);
        Toast.open({
          message: `Erreur inconnue`,
          type: 'is-danger',
          position: 'is-top',
        });
      });
    }
  },
  computed: {
    amount: function() {
      return this.currentUserPaymentData.amountToPay && (this.currentUserPaymentData.amountToPay / 100 + ' CHF');
    }
  }
}
</script>

<style scoped>

.marginBottom10 {
  margin-bottom: 10px;
}

</style>

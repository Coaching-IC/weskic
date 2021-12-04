<template>
  <div class="">

    <hr>

    <div id="amount-notif" v-if="!ud.step2.hasPaid" class="notification">
      <div class="columns">
        <div class="column is-2">
          <b-icon icon="receipt" size="is-large"/>
        </div>
        <div class="column">
          <h2 class="subtitle">Montant à régler maintenant : <strong>{{ price }}</strong><br>
            Si tu as un problème, utilise le <a href="/help" target="_blank">formulaire</a></h2>
        </div>
        <div class="column is-flex is-justify-content-space-around" v-if="ud.step2.paymentStrategy">
          <b-tag class="is-large" type="">
            {{ ud.step2.paymentStrategy === 'polybanking' ? 'Type de paiement : en ligne' : 'Type de paiement : boutique ' }}
          </b-tag>
          <p v-if="ud.step2.polybanking_ref">Contactez-nous pour changer de moyen de paiement</p>
          <b-button class="is-warning" @click="setPaymentStrategy('')" v-else>Changer</b-button>
        </div>
      </div>
    </div>

    <div id="payment-strategy-choice" v-if="!ud.step2.paymentStrategy" class="columns">
      <div class="column">
        <b-button expanded class="is-success" @click="setPaymentStrategy('polybanking')">Paiement en ligne
        </b-button>
        <br>
        <p class="subtitle">Le plus rapide, avec une carte bancaire, PayPal, ou TWINT</p>
      </div>
      <div class="column">
        <b-button expanded class="is-success" @click="setPaymentStrategy('agepoly')">Paiement à la boutique de
          l'AGEPoly
        </b-button>
        <br>
        <p class="subtitle">Si vous voulez payer en cash, avec votre carte Camipro, ... </p>
      </div>
    </div>

    <div id="payment-agepoly" v-if="ud.step2.paymentStrategy === 'agepoly' && !ud.step2.hasPaid" class="columns">
      <h1 class="subtitle">Ta demande de payer à la boutique de l'AGEPoly a été enregistrée. Prenez en compte les heures
        d'ouvertures de la boutique et le délais indiqué sur Telegram. Au-delà nous ne pouvons plus garantir ta place.</h1>
    </div>

    <div id="payment-polybanking" v-if="ud.step2.paymentStrategy === 'polybanking' && !ud.step2.polybanking_ref" class="columns">
      <div class="column is-3">
        <b-button class="is-success" expanded @click="payOnline">Passer au paiement</b-button>
      </div>
      <div class="class column">
        <h1 class="subtitle">Le service qu'on utilise pour vous proposer de payer par internet s'appelle Polybanking.
          Quelques associations l'utilisent aussi (PolyLAN, Polyjapan, ... bref les geek quoi).
          <br> Derrière ça utilise PostFinance E-Payments.</h1>
        <br>
      </div>
    </div>

    <div v-if="ud.step2.paymentStrategy === 'polybanking' && ud.step2.polybanking_ref && !ud.step2.hasPaid">
      <h1 class="subtitle">En attente de la confirmation du paiement, si votre paiement a échoué merci de <a href="/help" target="_blank">nous contacter</a> pour que vous puissiez en refaire un. Cette page ne devrait plus apparaître quelques secondes après un paiement réussi.</h1>
    </div>

    <div id="has-paid" v-if="ud.step2.hasPaid" class="columns">
      <h1 class="subtitle"><strong>PAIEMENT VALIDÉ</strong> C'est terminé ! Vous pouvez vous relaxer, la prochaine étape c'est pas pour tout de suite
        ;)</h1>
    </div>
  </div>
</template>

<script>
import {mapState} from "vuex";
import {ToastProgrammatic as Toast} from 'buefy';

export default {
  name: 'PaymentStep',
  components: {},
  data: () => ({
    isLoading: false,
  }),
  computed: {

    ...mapState({
      price: state => (state.userData.step2.amountToPay / 100.00) + ' CHF',
      ud: state => state.userData,
      payBefore: state => {
        const validatedDate = new Date(state.userData.step1.validatedDate);
        const payBeforeDate = new Date(validatedDate);
        payBeforeDate.setDate(validatedDate.getDate() + 3);
        return payBeforeDate.toLocaleDateString('FR-fr');
      }
    })
  },
  props: {},
  methods: {
    setPaymentStrategy(newPaymentStrategy) {
      const modifiedUserData = {
        step2: {
          paymentStrategy: newPaymentStrategy
        }
      }

      this.$store.dispatch('editUserData', {userData: modifiedUserData, lazy: true});
    },
    payOnline() {
      this.isLoading = true;
      this.$store.dispatch('polybankingRequest').then(response => {
        if (response.success) {
          window.location = response.url;
        } else {
          Toast.open({
            message: 'Une erreur est survenue avec Polybanking :(',
            type: 'is-danger',
            position: 'is-top',
            duration: 3000,
          });
        }
      }).catch(err => {
        Toast.open({
          message: 'Une erreur est survenue avec Polybanking :(',
          type: 'is-danger',
          position: 'is-top',
          duration: 3000,
        });
        console.error(err);
      }).finally(() => this.isLoading = false);
    }
  }
}
</script>

<style scoped>

.leftBorder {
  border-left: 2px dashed lightgray;
}

</style>

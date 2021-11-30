<template>
  <div class="">

    <hr>

    <b-notification :closable="false" has-icon icon="receipt">
      <h2 class="subtitle">Montant à régler maintenant : <strong>{{price}}</strong><br>
      Tu y es presque, c'est bientôt fini !</h2>
    </b-notification>

    <div class="columns">

      <div class="column">
        <h5 class="subtitle"><strong>Paiment en ligne</strong></h5>
      </div>
      <div class="column leftBorder">
        <h5 class="subtitle"><strong>Paiment à la boutique AGEPoly</strong></h5>
      </div>

    </div>
  </div>
</template>

<script>
import {mapState} from "vuex";

export default {
  name: 'PaymentStep',
  components: {},
  data: () => ({

  }),
  computed: {

    ...mapState({
      price: state => (state.userData.step2.amountToPay / 100.00) + ' CHF'
    })
  },
  props: {},
  methods: {

  }
}
</script>

<style scoped>

.leftBorder {
  border-left: 2px dashed lightgray;
}

</style>

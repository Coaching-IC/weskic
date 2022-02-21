<template>
  <div class="">
    <hr>
    <p>Si tu ne possèdes pas de matériel de ski, nous pouvons nous en charger pour toi !
      Nous avons négocié des prix avec notre partenaire Decathlon CH, la location d'un ensemble prêt à skier (chaussures, skis/snow, bâtons) te coûtera 67.- (au lieu de 95.- en temps normal).
      Nous nous chargerons de l'acheminement des skis jusqu'à Torgon et du retour du matériel. En bref : aucune contrainte pour toi, tu viens les mains vides !
      Si tu es intéressé, tu peux remplir ce <a href="https://forms.gle/ESxVpsubozBZT6wt7" target="_blank">formulaire de commande</a> (comme toujours, utilise ton compte Google EPFL pour y accéder). Tu seras recontacté pour payer.</p>
    <br>
    <div class="is-flex is-justify-content-space-evenly is-flex-wrap-wrap">
      <b-button tag="a" href="https://forms.gle/ESxVpsubozBZT6wt7" target="_blank" style="margin-bottom: 10px">Formulaire de commande</b-button>
      <b-button class="is-info" @click="goToStep4">Réservation des chambres</b-button>
    </div>

  </div>
</template>

<script>
import {mapState} from "vuex";
// import {ToastProgrammatic as Toast} from 'buefy';

export default {
  name: 'RentingStep',
  components: {},
  data: () => ({
  }),
  computed: {

    ...mapState({
    })
  },
  props: {},
  methods: {
    goToStep4() {
      this.$emit('next');
    },
  }
}
</script>

<style scoped>


</style>

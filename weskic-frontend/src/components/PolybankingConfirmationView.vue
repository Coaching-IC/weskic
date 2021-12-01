<template>
  <div class="box">
    <div v-if="success" class="">
      <h1 class="title">On dirait que ça s'est bien passé</h1>
      <p>Vous pouvez suivre l'état de votre paiement sur <a href="/registration">cette page</a>
        mais sinon vous n'avez plus à rien à faire. On vous recontactera plus tard pour les étapes suivantes</p>
    </div>
    <div v-else class="">
      <h1 class="title">Il y a eu un problème ...</h1>
      <p>S'il ne s'agit pas d'une simple annulation, ou d'un problème de votre côté : <a href="/help">contactez-nous</a> !</p>
    </div>
  </div>
</template>

<script>
import {mapState} from "vuex";

export default {
  name: 'PolybankingConfirmationView',
  components: {},
  data: () => ({
  }),
  computed: {
    success() {
      return this.$route.params.status === 'success';
    },
    ...mapState({})
  },
  props: [],
  methods: {}
}
</script>

<style scoped>

.leftBorder {
  border-left: 2px dashed lightgray;
}

</style>

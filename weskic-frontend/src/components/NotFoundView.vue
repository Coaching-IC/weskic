<template>
  <div class="box">
    <div id="subbox">
      <h1 class="title">Page introuvable</h1>
      <b-button type="is-primary" tag="router-link" :to="{path: '/'}">Retour à l'accueil</b-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundView',
  props: {}
}
</script>

<style scoped>
#subbox {
  display: flex;
  flex-direction: column;
}
</style>

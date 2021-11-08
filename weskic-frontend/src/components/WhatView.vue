<template>
  <div id="topWhat">
    <b-button id="loginTop" type="is-info is-large" tag="router-link" :to="{name: 'login'}">Connexion</b-button>
    <div id="box" class="box">

      <h1 class="title">C'est quoi WESKIC ??</h1>



    </div>

    <b-button type="is-success" tag="router-link" :to="{name: 'login'}">J'adore, je fonce m'inscrire</b-button>
  </div>
</template>

<script>
export default {
  name: 'WhatView',
  props: {}
}
</script>

<style scoped>

#loginTop {
  position: absolute;
  top: 15px;
  right: 15px;
}

</style>

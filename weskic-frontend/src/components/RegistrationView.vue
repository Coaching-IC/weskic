<template>
  <div id="topWhat">
    <b-button id="loginTop" type="is-warning is-outlined" tag="router-link" :to="{name: 'logout'}">Déconnexion
    </b-button>
    <div id="box" class="box container">

      <b-steps
          v-model="activeStep"
          animated
          rounded
          has-navigation
          :mobile-mode="'minimalist'">
        <b-step-item step="1" label="Informations personelles" clickable>
          <h1 class="title has-text-centered">Account</h1>
          Lorem ipsum dolor sit amet.
        </b-step-item>

        <b-step-item step="2" label="Profile" clickable>
          <h1 class="title has-text-centered">Profile</h1>
          Lorem ipsum dolor sit amet.
        </b-step-item>

        <b-step-item step="3" label="Vérification d'identité" clickable>
          <h1 class="title has-text-centered">Social</h1>
          Lorem ipsum dolor sit amet.
        </b-step-item>

        <b-step-item step="4" label="Paiement" clickable>
          <h1 class="title has-text-centered">Social</h1>
          Lorem ipsum dolor sit amet.
        </b-step-item>
      </b-steps>

    </div>
  </div>
</template>

<script>
export default {
  name: 'WhatView',
  data: () => ({
    activeStep: 0
  }),
  props: {}
}
</script>

<style scoped>

#loginTop {
  position: absolute;
  top: 15px;
  right: 15px;
}

#box {
  width: 95vw;
}


</style>

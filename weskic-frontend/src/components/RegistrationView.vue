<template>
  <div id="topRegistration">
<!--    <b-button id="logoutTop" type="is-warning is-outlined" tag="router-link" :to="{name: 'logout'}">Déconnexion</b-button>-->
    <div id="box" class="box container">

      <h1 class="subtitle has-text-centered">Tu dois valider l'étape 1 avant le <strong>3 décembre</strong></h1>

      <b-steps
          v-model="activeStep"
          animated
          rounded
          :has-navigation="false"
          :mobile-mode="'minimalist'">
        <b-step-item step="1" label="Informations personelles">
          <PersonalInfo></PersonalInfo>
        </b-step-item>

        <b-step-item step="2" label="Paiement">
          Lorem ipsum dolor sit amet.
        </b-step-item>

        <b-step-item step="3" label="Matériel et compléments">
          Lorem ipsum dolor sit amet.
        </b-step-item>

        <b-step-item step="4" label="Placement dans les chambres">
          Lorem ipsum dolor sit amet.
        </b-step-item>
      </b-steps>

    </div>
  </div>
</template>

<script>
import PersonalInfo from "@/components/registration/PersonalInfo";

export default {
  name: 'RegistrationView',
  components: {PersonalInfo},
  data: () => ({
    activeStep: 0
  }),
  props: {}
}
</script>

<style scoped>

#logoutTop {
  position: absolute;
  top: 15px;
  right: 15px;
}

#box {
  width: 95vw;
}


</style>

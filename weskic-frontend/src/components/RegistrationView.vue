<template>
  <div id="topRegistration">
    <div id="box" class="box container">
      <div class="is-flex is-justify-content-center">
        <h1 class="subtitle has-text-centered">Tu dois valider l'étape 1 avant le <strong>3 décembre</strong></h1>
        <div id="topBtns">
          <b-button class="btnTop" type="is-info" tag="router-link" :to="{name: 'info'}" target="_blank">Informations</b-button>
          <b-button class="btnTop" type="" tag="router-link" :to="{name: 'help'}" target="_blank">J'ai besoin d'aide</b-button>
          <b-button class="btnTop" type="" tag="router-link" :to="{name: 'logout'}">Déconnexion</b-button>
        </div>
      </div>
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

.subtitle {
  margin-bottom: 0;
}

#topBtns {
  margin-left: auto;
}

.btnTop {
  margin-left: 10px;
  margin-bottom: 5px;
}

#box {
  width: 95vw;
}


</style>

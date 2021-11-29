<template>
  <div id="topRegistration">
    <b-loading :is-full-page="true" v-model="pageLoading" :can-cancel="false"></b-loading>
    <div id="box" class="box container">
      <div class="is-flex is-flex-direction-column">
        <h1 class="subtitle has-text-centered">Tu dois valider l'étape 1 avant le <strong>3 décembre</strong></h1>
        <div class="is-flex is-flex-direction-row is-justify-content-space-around" style="margin: 5px;">
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
        <b-step-item step="1" label="Informations personelles" :clickable="true"
                     :type="$store.state.userData.step1.reviewed ? 'is-success' : ''">
          <PersonalInfo @next="nextStep"></PersonalInfo>
        </b-step-item>

        <b-step-item step="2" label="Paiement" :clickable="$store.state.userData.step2.available">
          <PaymentStep></PaymentStep>
        </b-step-item>

        <b-step-item step="3" label="Location de matériel">
          Cette étape est indisponible
        </b-step-item>

        <b-step-item step="4" label="Placement dans les chambres">
          Cette étape est indisponible
        </b-step-item>
      </b-steps>
    </div>
  </div>
</template>

<script>
import PersonalInfo from "@/components/registration/PersonalInfo";
import PaymentStep from "@/components/registration/PaymentStep";

export default {
  name: 'RegistrationView',
  components: {PaymentStep, PersonalInfo},
  data: () => ({
    activeStep: 0,
    pageLoading: true,
  }),
  props: {},
  mounted() {
    this.$store.dispatch('pullUserData').then(() => {
      this.pageLoading = false;
    });
  },
  methods: {
    nextStep() {
      this.activeStep = this.activeStep + 1;
    }
  }
}
</script>

<style scoped>

.subtitle {
  margin-bottom: 0;
}

.btnTop {
  margin-left: 10px;
  margin-bottom: 5px;
}

#box {
  width: 95vw;
}


</style>

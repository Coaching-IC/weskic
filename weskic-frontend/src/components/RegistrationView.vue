<template>
  <div id="topRegistration">
    <b-loading :is-full-page="true" v-model="pageLoading" :can-cancel="false"></b-loading>
    <div id="box" class="box container" v-if="!pageLoading">
      <div class="is-flex is-flex-direction-column">
        <!--        <h1 class="subtitle has-text-centered">Tu dois valider l'étape 1 avant le <strong>3 décembre</strong></h1>-->
        <div class="is-flex is-flex-direction-row is-justify-content-space-around" style="margin: 5px;">
          <b-button class="btnTop" type="is-info" tag="router-link" :to="{name: 'info'}" target="_blank">Informations
          </b-button>
          <b-button class="btnTop" type="" tag="router-link" :to="{name: 'help'}" target="_blank">J'ai besoin d'aide
          </b-button>
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
          <PaymentStep @next="nextStep"></PaymentStep>
        </b-step-item>

        <b-step-item step="3" label="Location de matériel" :clickable="$store.state.userData.step2.hasPaid">
          <RentingStep @next="nextStep"></RentingStep>
        </b-step-item>

        <b-step-item step="4" label="Réservation des chambres" :clickable="$store.state.userData.step2.hasPaid">
          <RoomReservationStep @previous="previousStep"></RoomReservationStep>
        </b-step-item>
      </b-steps>
    </div>
  </div>
</template>

<script>
import PersonalInfo from "@/components/registration/PersonalInfo";
import PaymentStep from "@/components/registration/PaymentStep";
import RentingStep from "@/components/registration/RentingStep";
import RoomReservationStep from "@/components/registration/RoomReservationStep";

export default {
  name: 'RegistrationView',
  components: {PaymentStep, PersonalInfo, RentingStep, RoomReservationStep},
  data: () => ({
    activeStep: 0,
    pageLoading: true,
  }),
  props: {},
  mounted() {
    this.$store.dispatch('pullUserData').then(() => {
      this.pageLoading = false;
      if (this.$store.state.userData.step2.hasPaid) {
        this.activeStep = 3;
      } else if (this.$store.state.userData.step1.validated) {
        this.activeStep = 1;
      } else {
        this.activeStep = 0;
      }
    });
  },
  methods: {
    nextStep() {
      this.activeStep = this.activeStep + 1;
    },
    previousStep() {
      this.activeStep = this.activeStep - 1;
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

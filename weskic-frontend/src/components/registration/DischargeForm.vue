<template>
  <div class="modal-card" style="width: auto">
    <header class="modal-card-head">
      <b-loading is-full-page :v-model="true" :can-cancel="true"></b-loading>
      <p class="modal-card-title">Signature de la décharge</p>
    </header>
    <section class="modal-card-body">
      <div class="columns" v-if="!submitted">
        <div class="column">
          <b-field label="Le PDF que vous allez signer">
            <div class="is-flex is-flex-direction-row is-justify-content-center">
              <b-button class="is-info" outlined label="Afficher le PDF" tag="a" href="/charte-weskic.pdf"
                        target="_blank"/>
            </div>
          </b-field>
          <b-field label="Signez dans le champ ci-dessous">
            <SignatureBox v-model="signature"></SignatureBox>
          </b-field>
        </div>

        <div class="column">

          <b-field label="Nom et prénom">
            <b-input v-model="lastname" placeholder="Nom de famille"></b-input>
            <b-input v-model="firstname" placeholder="Prénom"></b-input>
          </b-field>

          <b-field label="Lieu">
            <b-input v-model="place" placeholder="ex. 'à Lausanne'"></b-input>
          </b-field>

        </div>
      </div>
      <div v-else>
        <b-notification :closable="false">
          <h2 class="subtitle">Signature envoyée ! <br> Vous pouvez fermer cette fenêtre</h2>
        </b-notification>
        <b-button class="btnTop" type="is-info" tag="a" :href="pdfUrl" :target="isStandalone ? '' : '_blank'" expanded>
          Voir le PDF généré
        </b-button>
      </div>
    </section>
    <footer class="modal-card-foot" v-if="!submitted">
      <b-button label="Annuler" @click="$emit('close')" v-if="!isStandalone"/>
      <b-button label="Valider" type="is-info" @click="submit"/>
      <b-loading :active="isLoading" :is-full-page="false"></b-loading>
    </footer>
  </div>
</template>

<script>
import SignatureBox from "@/components/registration/SignatureBox";
import {ToastProgrammatic as Toast} from "buefy";

export default {
  name: 'DischargeForm',
  components: {SignatureBox},
  mounted() {
    this.$store.dispatch('pullUserData').then(() => {
      this.pdfUrl = window.location.origin + '/api/reg-jwt/' + this.$store.state.jwt + '/my-discharge.pdf';
      if (this.$store.state.userData.step1.discharge_date) {
        this.submitted = true;
      } else {
        const tequilaName = this.$store.state.userData.info.tequilaName.split(' ');
        this.lastname = tequilaName[tequilaName.length - 1];
        this.firstname = tequilaName[0];
      }
    });
  },
  data: () => ({
    signature: '',
    lastname: '',
    firstname: '',
    place: 'Lausanne',

    isLoading: false,
    submitted: false,
    pdfUrl: '',
  }),
  props: {},
  methods: {
    submit() {
      this.isLoading = true;
      this.submitted = false;
      this.$store.dispatch('generateDischarge', {
        signature: this.signature,
        lastname: this.lastname,
        firstname: this.firstname,
        place: this.place,
      }).then(() => {
        this.submitted = true;
        this.$store.dispatch('pullUserData');
        this.$emit('close');
      }).catch(() => {
        this.submitted = false;
        Toast.open({
          message: 'Une erreur est survenue. Essayez de recharger la page',
          type: 'is-danger',
          position: 'is-top',
        });
      }).finally(() => {
        this.isLoading = false;
      });
    }
  },
  computed: {
    isStandalone: () => window.location.pathname.indexOf('discharge') !== -1
  }
}
</script>

<style scoped>

.marginBottom10 {
  margin-bottom: 10px;
}

.subtitle {
  margin-bottom: 0;
}

</style>

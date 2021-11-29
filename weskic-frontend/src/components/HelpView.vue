<template>
  <div id="">
    <div class="container box">
      <h1 class="title">Formulaire de contact</h1>

      <div v-if="!submitted">
        <b-field label="Question ou problème de type ...">
          <div class="is-flex is-flex-direction-column">
            <b-radio v-model="type" name="registration" native-value="it" class="marginBottom10">
              Inscription / Site internet / IT
            </b-radio>
            <b-radio v-model="type" name="activity" native-value="anim" class="marginBottom10">
              Activités / Animation
            </b-radio>
            <b-radio v-model="type" name="admin" native-value="admin" class="marginBottom10">
              Administratif
            </b-radio>
            <b-radio v-model="type" name="report" native-value="report" class="marginBottom10">
              Plainte / Reporter un abus
            </b-radio>
          </div>
        </b-field>

        <b-field label="Le problème / la demande en une phrase très courte">
          <b-input v-model="subject"></b-input>
        </b-field>

        <b-field label="Le problème / la demande avec autant de mots que tu veux ;)">
          <b-input type="textarea" v-model="message"></b-input>
        </b-field>

        <p>Le responsable approprié recevra ton message par mail. <strong>Seuls les Supercoachs voient les plaintes</strong>.</p>

        <b-button type="is-info" expanded :disabled="!readyToSend" @click="submit">Envoyer !</b-button>
      </div>

      <div v-else class="">
        <b-notification :closable="false">
          <h2 class="subtitle">Message envoyée ! <br> Nous te répondrons dès que possible ;)</h2>
        </b-notification>
      </div>

    </div>
  </div>
</template>

<script>
import {ToastProgrammatic as Toast} from "buefy";

export default {
  name: 'HelpView',
  components: {},
  data: () => ({
    type: '',
    subject: '',
    message: '',

    isLoading: false,
    submitted: false,
  }),
  props: {},
  methods: {
    submit() {
      this.isLoading = true;
      this.$store.dispatch('helpForm', {type: this.type, subject: this.subject, message: this.message.replaceAll('\n','<br>')}).then(response => {
        if (response.success) {
          this.submitted = true;
        } else {
          this.failed();
        }
      }).catch(() => {
        this.failed();
      }).finally(() => {
        this.isLoading = false;
      });
    },
    failed() {
      Toast.open({
        message: `Impossible d'envoyer le message. Si le problème persiste prendre contact sur Telegram`,
        type: 'is-danger',
        position: 'is-top',
      });
    }
  },
  computed: {
    // eslint-disable-next-line vue/return-in-computed-property
    readyToSend: function() {
      return this.type.length>0 && this.subject.length>0 && this.message.length>0;
    }
  }
}
</script>

<style scoped>

.marginBottom10 {
  margin-bottom: 10px;
}

</style>

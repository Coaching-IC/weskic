<template>
  <div id="">
    <div class="container box">
      <h1 class="title">Formulaire de contact</h1>
      <div>
        <b-field label="Question ou problème de type ...">
          <div class="is-flex is-flex-direction-column">
            <b-radio v-model="requestType" name="admin" native-value="admin" class="marginBottom10">
              Administratif
            </b-radio>
            <b-radio v-model="requestType" name="registration" native-value="registration" class="marginBottom10">
              Inscription / Site internet / IT
            </b-radio>
            <b-radio v-model="requestType" name="activity" native-value="activity" class="marginBottom10">
              Activités / Animation
            </b-radio>
            <b-radio v-model="requestType" name="report" native-value="report" class="marginBottom10">
              Plainte
            </b-radio>
          </div>
        </b-field>

        <b-field label="Le problème / la demande en une phrase très courte">
          <b-input v-model="name"></b-input>
        </b-field>

        <b-field label="Le problème / la demande avec autant de mots que tu veux ;)">
          <b-input type="textarea"></b-input>
        </b-field>

        <p>Le responsable approprié recevra ton message par mail. </p>

        <b-button type="is-info" expanded>Envoyer !</b-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelpView',
  components: {},
  data: () => ({
    requestType: ''
  }),
  props: {}
}
</script>

<style scoped>

.marginBottom10 {
  margin-bottom: 10px;
}

</style>

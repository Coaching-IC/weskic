<template>
  <div class="modal-card" style="width: auto">
    <header class="modal-card-head">
      <b-loading is-full-page :v-model="true" :can-cancel="true"></b-loading>
      <p class="modal-card-title">Signature de la décharge</p>
    </header>
    <section class="modal-card-body">

      <div class="columns">
        <div class="column">
          <b-field label="PDF de la décharge">
            <b-button label="Afficher le PDF" />
          </b-field>
        </div>

        <div class="column">
          <b-field label="Signez dans le champ">

          </b-field>
        </div>
      </div>



    </section>
    <footer class="modal-card-foot">
      <b-button label="Annuler" @click="$emit('close')" />
      <b-button label="Valider" type="is-primary" />
    </footer>
  </div>
</template>

<script>
export default {
  name: 'DischargeForm',
  components: {},
  data: () => ({

  }),
  props: {},
  methods: {

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

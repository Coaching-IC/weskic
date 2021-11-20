<template>
  <div id="">
    <div class="box sectionBox columns">
      <b-taglist attached class="sectionTag">
        <b-tag icon="content-paste" class="is-warning is-medium">À compléter</b-tag>
        <b-tag type="is-grey" class="is-medium">Identité</b-tag>
      </b-taglist>

      <div class="column">
        <b-field label="Nom officiel">
          <b-input disabled value="Sylvain Nérisson"></b-input>
        </b-field>
        <b-field label="Prénom d'usage">
          <b-input value="Sylvain"></b-input>
        </b-field>
      </div>
      <div class="column">
        <b-field label="Numéro d'urgence (avec indicatif !)">
          <b-input value="+33 6 40 59 69 25"></b-input>
        </b-field>
        <b-field label="Nom et adresse du contact d'urgence">
          <b-input maxlength="200" type="textarea"></b-input>
        </b-field>
      </div>
      <div class="column">
        <b-field>
          <b-upload v-model="dropFiles"
                    multiple
                    drag-drop>
            <section class="section">
              <div class="content has-text-centered">
                <p>
                  <b-icon
                      icon="upload"
                      size="is-large">
                  </b-icon>
                </p>
                <p>Cliquez ou déposez ici votre <strong>pièce d'identité</strong></p>
              </div>
            </section>
          </b-upload>
        </b-field>
      </div>

    </div>

    <div class="box sectionBox columns">
      <b-taglist attached class="sectionTag">
        <b-tag icon="content-paste" class="is-warning is-medium">À compléter</b-tag>
        <b-tag type="is-grey" class="is-medium">Contraintes alimentaires</b-tag>
      </b-taglist>

      <div class="column">

      </div>
      <div class="column">

      </div>
      <div class="column">

      </div>

    </div>


  </div>
</template>

<script>
export default {
  name: 'PersonalInfo',
  components: {},
  data: () => ({}),
  props: {}
}
</script>

<style scoped>

.sectionBox {
  position: relative;
  margin-top: 25px;
  border: 2px solid whitesmoke;
}

.sectionTag {
  position: absolute;
  top: -15px;
  left: 10px;
}


</style>

<template>
  <div id="">
    <div class="box sectionBox columns">

      <b-taglist attached class="sectionTag">
        <b-tag icon="content-paste" class="is-warning is-medium">À compléter</b-tag>
        <b-tag type="is-grey" class="is-medium">Identité</b-tag>
      </b-taglist>

      <div class="column">
        <b-tag class="marginBottom10">Tous les champs de cette section sont requis</b-tag>
        <b-field label="Nom officiel">
          <b-input disabled value="Sylvain Nérisson"></b-input>
        </b-field>
        <b-field message="Utilisé pour l'assignation des chambres">
          <p style="margin-right:10px;">Je suis</p>
          <b-radio v-model="sex"
                   name="male"
                   native-value="male">
            un homme
          </b-radio>
          <b-radio v-model="sex"
                   name="female"
                   native-value="female">
            une femme
          </b-radio>
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
          <b-input type="textarea" placeholder="Prénom, nom, adresse postale et pays"></b-input>
        </b-field>
      </div>
      <div class="column">
        <b-field label="Pièce d'identité">
          <div v-if="idFile.name" class="is-flex is-flex-direction-column">
            <b-taglist attached class="is-justify-content-center">
              <b-tag type="is-danger">Non envoyé</b-tag>
              <b-tag type="is-info">{{ idFile.name }} ~ {{ Math.round(idFile.size / 1024) }}KB</b-tag>
            </b-taglist>
            <div class="is-flex is-justify-content-space-around">
              <b-button type="is-danger" outlined class="is-small">Changer de fichier</b-button>
              <b-button type="is-info" class="is-small">Envoyer</b-button>
            </div>
          </div>
          <b-upload v-else v-model="idFile" drag-drop>
            <section class="section">
              <div class="content has-text-centered">
                <p>
                  <b-icon icon="upload" size="is-large">
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
        <b-tag type="is-grey" class="is-medium">Contraintes</b-tag>
      </b-taglist>

      <div class="column">
        <b-field label="Contraintes alimentaires">
          <div class="is-flex is-flex-direction-column is-justify-content-space-between">
            <b-checkbox v-model="diets" native-value="vegetarian" class="marginBottom10">
              Végétarien
            </b-checkbox>
            <b-checkbox v-model="diets" native-value="gluten-free" class="marginBottom10">
              Sans-gluten
            </b-checkbox>
            <b-checkbox v-model="diets" native-value="pork-free" class="marginBottom10">
              Sans-porc
            </b-checkbox>
            <b-checkbox v-model="diets" native-value="no-cheese" class="marginBottom10">
              N'aime pas le fromage
            </b-checkbox>
            <b-checkbox v-model="diets" native-value="no-alcohol" class="marginBottom10">
              Pas d'alcools
            </b-checkbox>
          </div>
        </b-field>
      </div>
      <div class="column">
        <b-field label="Allergies alimentaires">
          <b-input type="textarea"></b-input>
        </b-field>
      </div>
      <div class="column">
        <b-field label="Allergies médicamenteuses">
          <b-input type="textarea"></b-input>
        </b-field>
      </div>
    </div>

    <div class="box sectionBox columns">
      <b-taglist attached class="sectionTag">
        <b-tag icon="content-paste" class="is-warning is-medium">À compléter</b-tag>
        <b-tag type="is-grey" class="is-medium">Décharge/TG</b-tag>
      </b-taglist>

      <div class="column">
        <b-field label="Signature décharge">

        </b-field>
      </div>
      <div class="column">
        <b-field label="Rejoindre le groupe Telegram">
          <b-button type="is-info" expanded tag="a" @click="openTelegram">Lien du channel</b-button>
        </b-field>
        <b-field>
          <b-input expanded v-model="telegramUsername" placeholder="@username"></b-input>
          <p class="control">
            <b-button class="button is-info">J'ai rejoint le groupe</b-button>
          </p>
        </b-field>
        <p>Il est obligatoire de rejoindre ce groupe spécifique au WESKIC. Des informations importantes seront
          communiquées sur ce channel.</p>
      </div>
    </div>

    <div class="box sectionBox columns">
      <b-taglist attached class="sectionTag">
        <b-tag icon="content-paste" class="is-warning is-medium">À compléter</b-tag>
        <b-tag type="is-grey" class="is-medium">Activités</b-tag>
      </b-taglist>

      <div class="column">
        <b-field label="Remarque de tout ordre">
          <b-input type="textarea"></b-input>
        </b-field>
      </div>
      <div class="column">
        <b-field label="Niveau de ski">
          <div class="is-flex is-flex-direction-column">
            <b-radio v-model="skiLevel" name="first-time" native-value="first-time" class="marginBottom10">
              Première fois
            </b-radio>
            <b-radio v-model="skiLevel" name="beginner" native-value="beginner" class="marginBottom10">
              Débutant
            </b-radio>
            <b-radio v-model="skiLevel" name="intermediate" native-value="intermediate" class="marginBottom10">
              Intermédiaire
            </b-radio>
            <b-radio v-model="skiLevel" name="competition" native-value="competition" class="marginBottom10">
              Compétition
            </b-radio>
          </div>
        </b-field>
      </div>
      <div class="column">
        <b-field label="Carte d'assurance">
          <div v-if="insuranceFile.name" class="is-flex is-flex-direction-column">
            <b-taglist attached class="is-justify-content-center">
              <b-tag type="is-danger">Non envoyé</b-tag>
              <b-tag type="is-info">{{ insuranceFile.name }} ~ {{ Math.round(insuranceFile.size / 1024) }}KB</b-tag>
            </b-taglist>
            <div class="is-flex is-justify-content-space-around">
              <b-button type="is-danger" outlined class="is-small">Changer de fichier</b-button>
              <b-button type="is-info" class="is-small">Envoyer</b-button>
            </div>
          </div>
          <b-upload v-else v-model="insuranceFile" drag-drop>
            <section class="section">
              <div class="content has-text-centered">
                <p>
                  <b-icon icon="upload" size="is-large">
                  </b-icon>
                </p>
                <p>Cliquez ou déposez ici votre <strong>carte d'assurance</strong></p>
              </div>
            </section>
          </b-upload>
        </b-field>
      </div>
    </div>

    <div class="box sectionBox">
      <h2 class="subtitle">Merci de vérifier toutes les informations avant de valider l'étape</h2>
      <p>Tu pourras toujours modifier les données de cette étape après validation</p>
      <br>
      <div class="is-flex is-justify-content-center">
        <b-button v-if="formReady" type="is-success">Valider l'étape 1</b-button>
        <b-button v-else disabled type="is-danger">Formulaire incomplet</b-button>
      </div>
      <br>
      <h2 class="subtitle">Informations relatives à la protection des données</h2>
      <p>Toutes les informations personnelles saisies ci-dessus sont chiffrées et seront détruites après l'événement.
        Accès complet pour les 2 Supercoachs et Cybercoach, accès spécifique pour les autres responsables.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PersonalInfo',
  components: {},
  data: () => ({
    sex: '',
    skiLevel: '',
    idFile: {},
    insuranceFile: {},
    diets: [],
    formReady: false
  }),
  props: {},
  methods: {
    openTelegram() {
      window.open('https://go.epfl.ch/weskic-telegram','_blank');
    }
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

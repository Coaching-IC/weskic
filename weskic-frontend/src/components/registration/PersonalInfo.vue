<template>
  <div id="">
    <div class="box sectionBox columns">

      <b-taglist attached class="sectionTag">
        <b-tag :icon="identityComplete ? 'clipboard-check' : 'content-paste'"
               :class="identityComplete ? 'is-success is-medium' : 'is-warning is-medium'">
          {{ identityComplete ? identityMessage : 'À compléter' }}
        </b-tag>
        <b-tag type="is-grey" class="is-medium">Identité</b-tag>
      </b-taglist>

      <div class="column">
        <b-tag class="marginBottom10">Tous les champs de cette section sont requis</b-tag>
        <b-field label="Nom officiel">
          <b-input disabled v-model="officialName" @input="triggerSaveTimeoutFor('identity')"></b-input>
        </b-field>
        <b-field message="Utilisé pour l'assignation des chambres">
          <p style="margin-right:10px;">Je suis</p>
          <b-radio v-model="sex" @input="triggerSaveTimeoutFor('identity')"
                   name="male"
                   native-value="male">
            un homme
          </b-radio>
          <b-radio v-model="sex" @input="triggerSaveTimeoutFor('identity')"
                   name="female"
                   native-value="female">
            une femme
          </b-radio>
        </b-field>
        <b-field label="Prénom d'usage">
          <b-input v-model="firstname" @input="triggerSaveTimeoutFor('identity')"></b-input>
        </b-field>
      </div>
      <div class="column">
        <b-field label="Numéro d'urgence (avec indicatif !)">
          <b-input v-model="emergencyPhone" @input="triggerSaveTimeoutFor('identity')"></b-input>
        </b-field>
        <b-field label="Nom et adresse du contact d'urgence">
          <b-input type="textarea" placeholder="Prénom, nom, adresse postale et pays"
                   v-model="emergencyContact" @input="triggerSaveTimeoutFor('identity')"></b-input>
        </b-field>
      </div>
      <div class="column">
        <UploadFileForm field-label="Pièce d'identité" v-model="idCard" @input="triggerSaveTimeoutFor('identity')">
          <p>Cliquez ou déposez ici votre <strong>pièce d'identité</strong></p>
        </UploadFileForm>
      </div>
    </div>

    <div class="box sectionBox columns">
      <b-taglist attached class="sectionTag">
        <b-tag icon="clipboard-check" class="is-success is-medium">{{ constraintsMessage }}</b-tag>
        <b-tag type="is-grey" class="is-medium">Contraintes</b-tag>
      </b-taglist>

      <div class="column">
        <b-field label="Contraintes alimentaires">
          <div class="is-flex is-flex-direction-column is-justify-content-space-between">
            <b-checkbox v-model="diets" native-value="vegetarian" class="marginBottom10"
                        @input="triggerSaveTimeoutFor('constraints')">
              Végétarien
            </b-checkbox>
            <b-checkbox v-model="diets" native-value="gluten-free" class="marginBottom10"
                        @input="triggerSaveTimeoutFor('constraints')">
              Sans-gluten
            </b-checkbox>
            <b-checkbox v-model="diets" native-value="pork-free" class="marginBottom10"
                        @input="triggerSaveTimeoutFor('constraints')">
              Sans-porc
            </b-checkbox>
            <b-checkbox v-model="diets" native-value="no-cheese" class="marginBottom10"
                        @input="triggerSaveTimeoutFor('constraints')">
              N'aime pas le fromage
            </b-checkbox>
            <b-checkbox v-model="diets" native-value="no-alcohol" class="marginBottom10"
                        @input="triggerSaveTimeoutFor('constraints')">
              Pas d'alcools
            </b-checkbox>
          </div>
        </b-field>
      </div>
      <div class="column">
        <b-field label="Allergies alimentaires">
          <b-input type="textarea" v-model="foodAllergy" @input="triggerSaveTimeoutFor('constraints')"></b-input>
        </b-field>
      </div>
      <div class="column">
        <b-field label="Allergies médicamenteuses">
          <b-input type="textarea" v-model="drugsAllergy" @input="triggerSaveTimeoutFor('constraints')"></b-input>
        </b-field>
      </div>
    </div>

    <div class="box sectionBox columns">
      <b-taglist attached class="sectionTag">
        <b-tag :icon="activitiesComplete ? 'clipboard-check' : 'content-paste'"
               :class="activitiesComplete ? 'is-success is-medium' : 'is-warning is-medium'">
          {{ activitiesComplete ? activitiesMessage : 'À compléter' }}
        </b-tag>
        <b-tag type="is-grey" class="is-medium">Activités</b-tag>
      </b-taglist>

      <div class="column">
        <b-field label="Options : forfait et cours">
          <div class="is-flex is-flex-direction-column is-justify-content-space-between">
            <b-checkbox v-model="options" native-value="course" class="marginBottom10"
                        @input="triggerSaveTimeoutFor('activities')">
              Cours de ski (pas de snow) - Gratuit !
            </b-checkbox>
            <b-checkbox v-model="options" native-value="friday" class="marginBottom10"
                        @input="triggerSaveTimeoutFor('activities')">
              Forfait pour Vendredi 11 - 26.00 CHF (1)
            </b-checkbox>
            <b-checkbox v-model="options" native-value="saturday" class="marginBottom10"
                        @input="triggerSaveTimeoutFor('activities')">
              Forfait pour Samedi 12 (2)
            </b-checkbox>
            <b-checkbox v-model="options" native-value="sunday" class="marginBottom10"
                        @input="triggerSaveTimeoutFor('activities')">
              Forfait pour Dimanche 13 (2)
            </b-checkbox>
          </div>
        </b-field>
        <b-field label="Niveau de ski" message="À titre indicatif uniquement. Vous skiez avec qui vous voulez.">
          <div class="is-flex is-flex-direction-column">
            <b-radio v-model="skiLevel" name="first-time" native-value="first-time" class="marginBottom10"
                     @input="triggerSaveTimeoutFor('activities')">
              Première fois
            </b-radio>
            <b-radio v-model="skiLevel" name="beginner" native-value="beginner" class="marginBottom10"
                     @input="triggerSaveTimeoutFor('activities')">
              Débutant
            </b-radio>
            <b-radio v-model="skiLevel" name="intermediate" native-value="intermediate" class="marginBottom10"
                     @input="triggerSaveTimeoutFor('activities')">
              Intermédiaire
            </b-radio>
            <b-radio v-model="skiLevel" name="excellent" native-value="excellent" class="marginBottom10"
                     @input="triggerSaveTimeoutFor('activities')">
              Excellent
            </b-radio>
          </div>
        </b-field>
      </div>

      <div class="column">
        <p>(1) <strong>Espace Torgon</strong>, paiement sur ce site en même temps que le prix de base. Le prix indiqué
          est un prix de groupe.</p><br>
        <p>(2) <strong>Espace Liberté</strong>, simple sondage, paiement sur place. Ce domaine est bien
          plus grand et un peu plus cher. Si assez de personnes veulent skier le forfait de groupe
          sera aussi disponible pour ce jour.</p><br>
        <ul style="list-style-type: circle;">
          <li><a target="_blank" href="https://torgon.esecure.ch/fr/nos-forfaits">Prix individuels des 3 espaces</a>
          </li>
          <li><p><a target="_blank"
                    href="https://www.torgon.ch/medias/images/prestations/espace-torgon-liberte-2021-web-3019.jpg">
            Plan des pistes</a><br>Remarquez les limites des espaces</p></li>
        </ul>
      </div>
      <div class="column">
        <UploadFileForm field-label="Carte d'assurance" v-model="insuranceCard"
                        @input="triggerSaveTimeoutFor('activities')">
          <p>Cliquez ou déposez ici votre <strong>carte d'assurance</strong></p>
        </UploadFileForm>
      </div>
    </div>

    <div class="box sectionBox columns">
      <b-taglist attached class="sectionTag">
        <b-tag :icon="dischargeTelegramComplete ? 'clipboard-check' : 'content-paste'"
               :class="dischargeTelegramComplete ? 'is-success is-medium' : 'is-warning is-medium'">
          {{ dischargeTelegramComplete ? dischargeTelegramMessage : 'À compléter' }}
        </b-tag>
        <b-tag type="is-grey" class="is-medium">Décharge/TG</b-tag>
      </b-taglist>

      <div class="column">
        <b-field label="Signature décharge">
          <div class="">
            <b-button type="is-info" expanded tag="a" @click="openModalSignatureComponent" class="marginBottom10">
              Cet écran est tactile
            </b-button>
            <b-button type="is-info" expanded tag="a" @click="openModalSignatureQRCode">Utiliser un autre appareil
            </b-button>
            <br>
            <p>Choisissez une des deux options ci-dessus en fonction de votre appareil.</p>
          </div>
        </b-field>

        <b-modal v-model="isSignatureComponentModalActive">
          <DischargeForm></DischargeForm>
        </b-modal>

        <b-modal v-model="isSignatureQRCodeModalActive">
          <div class="modal-card" style="width: auto">
            <header class="modal-card-head">
              <b-loading is-full-page :v-model="true" :can-cancel="true"></b-loading>
              <p class="modal-card-title">Signature de la décharge</p>
            </header>
            <section class="modal-card-body">
              <b-loading :is-full-page="false" v-model="isSignatureQRCodeModalActive" :can-cancel="false"></b-loading>
              <p>Scannez ce QRCode avec votre téléphone pour signer la décharge</p>
            </section>
            <footer class="modal-card-foot">
              <b-button label="Annuler" @click="$emit('close')"/>
              <b-button label="C'est fait" type="is-primary"/>
            </footer>
          </div>
        </b-modal>
      </div>
      <div class="column">
        <TelegramChecker v-model="telegram" @input="triggerSaveTimeoutFor('telegramDischarge')"></TelegramChecker>
      </div>
    </div>

    <div class="box sectionBox">
      <h2 class="subtitle">Merci de vérifier toutes les informations avant de valider l'étape</h2>
      <br>
      <div class="columns">
        <div class="column">
          <p>Tu pourras toujours modifier les données de cette étape après validation.</p>
          <div class="is-flex is-justify-content-center">
            <b-button v-if="formReady" type="is-success">Valider l'étape 1</b-button>
            <b-button v-else disabled type="is-danger">Formulaire incomplet</b-button>
          </div>
        </div>
        <div class="column">
          <b-field label="Remarque de tout ordre">
            <b-input type="textarea" v-model="remarks" @input="triggerSaveTimeoutFor('remarks')"></b-input>
          </b-field>
        </div>
      </div>
      <br>
      <br>
      <h2 class="subtitle">Informations relatives à la protection des données</h2>
      <p>Toutes les informations personnelles saisies ci-dessus sont chiffrées et seront détruites après l'événement.
        Accès complet pour les 2 Supercoachs et Cybercoach, accès spécifique pour les autres responsables.</p>
    </div>

  </div>
</template>

<script>
import DischargeForm from '@/components/registration/DischargeForm.vue';
import UploadFileForm from "@/components/registration/UploadFileForm";
import TelegramChecker from "@/components/registration/TelegramChecker";

function computeUserDataModifications(thisVar) {
  let userData = {step1: {}}
  if (thisVar.sectionsToSend.includes('identity')) {
    userData.step1.identity = {
      sex: thisVar.sex,
      firstname: thisVar.firstname,
      emergencyPhone: thisVar.emergencyPhone,
      emergencyContact: thisVar.emergencyContact,
    }
  }
  if (thisVar.sectionsToSend.includes('constraints')) {
    userData.step1.constraints = {
      diets: thisVar.diets,
      foodAllergy: thisVar.foodAllergy,
      drugsAllergy: thisVar.drugsAllergy,
    }
  }
  if (thisVar.sectionsToSend.includes('activities')) {
    userData.step1.activities = {
      options: thisVar.options,
      skiLevel: thisVar.skiLevel,
    }
  }
  if (thisVar.sectionsToSend.includes('remarks')) {
    userData.step1.remarks = thisVar.remarks;
  }
  return userData;
}

export default {
  name: 'PersonalInfo',
  components: {TelegramChecker, UploadFileForm, DischargeForm},
  data: () => ({
    officialName: '',
    sex: '',
    firstname: '',
    emergencyPhone: '',
    emergencyContact: '',
    idCard: {
      fileId: '',
      date: '',
      fileName: '',
      fileSize: 0,
    },

    diets: [],
    foodAllergy: '',
    drugsAllergy: '',

    options: [],
    skiLevel: '',
    insuranceCard: {
      fileId: '',
      date: '',
      fileName: '',
      fileSize: 0,
    },

    discharge: {
      fileId: '',
      date: '',
    },
    telegram: {
      username: '',
      hasJoined: false
    },

    remarks: '',

    isSignatureComponentModalActive: false,
    isSignatureQRCodeModalActive: false,
    identityMessage: '',
    constraintsMessage: 'Complet',
    activitiesMessage: '',
    dischargeTelegramMessage: '',
    sectionsToSend: [],
    saveTimeout: {},
  }),
  mounted() {
    this.$store.dispatch('pullUserData').then(() => {
      this.officialName = this.$store.state.userData.info.tequilaName;
      if (this.$store.state.userData.step1) {
        if (this.$store.state.userData.step1.identity && this.$store.state.userData.step1.identity.firstname)
          this.firstname = this.$store.state.userData.step1.identity.firstname;
        else this.firstname = this.officialName.split(' ')[0];
        if (this.$store.state.userData.step1.dischargeTelegram && this.$store.state.userData.step1.dischargeTelegram.telegram)
          this.telegram = this.$store.state.userData.step1.dischargeTelegram.telegram;
      }
    });
  },
  computed: {
    identityComplete() {
      return this.sex.length > 0 && this.firstname.length > 0 && this.emergencyPhone.length > 0 && this.emergencyContact.length > 0 && this.idCard.fileId.length > 0;
    },
    activitiesComplete() {
      return this.skiLevel.length > 0 && this.insuranceCard.fileId.length > 0;
    },
    dischargeTelegramComplete() {
      return false;
    },
    formReady() {
      return this.identityComplete && this.activitiesComplete && this.dischargeTelegramComplete;
    },
  },
  props: {},
  methods: {
    openModalSignatureComponent() {
      this.isSignatureComponentModalActive = true;
    },
    openModalSignatureQRCode() {
      this.isSignatureQRCodeModalActive = true;
    },
    triggerSaveTimeoutFor(sectionName) {
      if (this.saveTimeout) clearTimeout(this.saveTimeout);
      if (!this.sectionsToSend.includes(sectionName)) this.sectionsToSend.push(sectionName);
      this.saveTimeout = setTimeout(this.lazySave, 2000);
    },
    lazySave() {
      let userData = computeUserDataModifications(this);
      this.sectionsToSend = [];
      console.log(userData);
      this.$store.dispatch('editUserData', {userData, lazy: true});
    },
    syncSave() {
      if (this.saveTimeout) clearTimeout(this.saveTimeout);
      // this.$store.dispatch('editUserData', {userData, lazy: false});
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

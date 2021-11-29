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
          <b-input disabled v-model="ud.step1.identity_officialName" @input="lazySaveTrigger"></b-input>
        </b-field>
        <b-field message="Utilisé pour l'assignation des chambres">
          <p style="margin-right:10px;">Je suis</p>
          <b-radio v-model="ud.step1.identity_sex" @input="lazySaveTrigger"
                   name="male"
                   native-value="male">
            un homme
          </b-radio>
          <b-radio v-model="ud.step1.identity_sex" @input="lazySaveTrigger"
                   name="female"
                   native-value="female">
            une femme
          </b-radio>
        </b-field>
        <b-field label="Prénom d'usage">
          <b-input v-model="ud.step1.identity_firstname" @input="lazySaveTrigger"></b-input>
        </b-field>
      </div>
      <div class="column">
        <b-field label="Numéro d'urgence (avec indicatif !)"
                 :message="ud.step1.identity_emergencyPhone.indexOf(' ')!==-1 ? `Ne pas mettre d'espace` : ''"
                 :type="(ud.step1.identity_emergencyPhone.length>0
                 && (ud.step1.identity_emergencyPhone.indexOf(' ')!==-1
                 || !ud.step1.identity_emergencyPhone.startsWith('+'))) ? `is-danger` : ''">
          <b-input v-model="ud.step1.identity_emergencyPhone" @input="lazySaveTrigger"></b-input>
        </b-field>
        <b-field label="Nom et adresse du contact d'urgence">
          <b-input type="textarea" placeholder="Prénom, nom, adresse postale et pays"
                   v-model="ud.step1.identity_emergencyContact" @input="lazySaveTrigger"></b-input>
        </b-field>
      </div>
      <div class="column">
        <UploadFileForm field-label="Pièce d'identité" v-model="ud.step1.identity_idCard" file-type="identity_idCard">
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
            <b-checkbox v-model="ud.step1.constraints_diets" native-value="vegetarian" class="marginBottom10"
                        @input="lazySaveTrigger">
              Végétarien
            </b-checkbox>
            <b-checkbox v-model="ud.step1.constraints_diets" native-value="gluten-free" class="marginBottom10"
                        @input="lazySaveTrigger">
              Sans-gluten
            </b-checkbox>
            <b-checkbox v-model="ud.step1.constraints_diets" native-value="pork-free" class="marginBottom10"
                        @input="lazySaveTrigger">
              Sans-porc
            </b-checkbox>
            <b-checkbox v-model="ud.step1.constraints_diets" native-value="no-cheese" class="marginBottom10"
                        @input="lazySaveTrigger">
              N'aime pas le fromage
            </b-checkbox>
            <b-checkbox v-model="ud.step1.constraints_diets" native-value="no-alcohol" class="marginBottom10"
                        @input="lazySaveTrigger">
              Pas d'alcools
            </b-checkbox>
          </div>
        </b-field>
      </div>
      <div class="column">
        <b-field label="Allergies alimentaires">
          <b-input type="textarea" v-model="ud.step1.constraints_foodAllergy" @input="lazySaveTrigger"></b-input>
        </b-field>
      </div>
      <div class="column">
        <b-field label="Allergies médicamenteuses">
          <b-input type="textarea" v-model="ud.step1.constraints_drugsAllergy" @input="lazySaveTrigger"></b-input>
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
        <b-field label="Options : forfait et cours" type="is-danger" :message="optionsMessage">
          <div class="is-flex is-flex-direction-column is-justify-content-space-between">
            <b-checkbox v-model="ud.step1.activities_options" native-value="course" class="marginBottom10"
                        @input="lazySaveTrigger">
              Cours de ski (pas de snow) - Gratuit !
            </b-checkbox>
            <b-checkbox v-model="ud.step1.activities_options" native-value="friday" class="marginBottom10"
                        @input="lazySaveTrigger">
              Forfait pour Vendredi 11 - 26.00 CHF (1)
            </b-checkbox>
            <b-checkbox v-model="ud.step1.activities_options" native-value="saturday" class="marginBottom10"
                        @input="lazySaveTrigger">
              Forfait pour Samedi 12 (2)
            </b-checkbox>
            <b-checkbox v-model="ud.step1.activities_options" native-value="sunday" class="marginBottom10"
                        @input="lazySaveTrigger">
              Forfait pour Dimanche 13 (2)
            </b-checkbox>
          </div>
        </b-field>
        <b-field label="Niveau de ski" message="À titre indicatif uniquement. Vous skiez avec qui vous voulez.">
          <div class="is-flex is-flex-direction-column">
            <b-radio v-model="ud.step1.activities_skiLevel" name="first-time" native-value="first-time"
                     class="marginBottom10"
                     @input="lazySaveTrigger">
              Première fois
            </b-radio>
            <b-radio v-model="ud.step1.activities_skiLevel" name="beginner" native-value="beginner"
                     class="marginBottom10"
                     @input="lazySaveTrigger">
              Débutant
            </b-radio>
            <b-radio v-model="ud.step1.activities_skiLevel" name="intermediate" native-value="intermediate"
                     class="marginBottom10"
                     @input="lazySaveTrigger">
              Intermédiaire
            </b-radio>
            <b-radio v-model="ud.step1.activities_skiLevel" name="excellent" native-value="excellent"
                     class="marginBottom10"
                     @input="lazySaveTrigger">
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
        <UploadFileForm field-label="Carte d'assurance" v-model="ud.step1.activities_insuranceCard"
                        file-type="activities_insuranceCard">
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
          <div v-if="!ud.step1.discharge_date">
            <b-button type="is-info" expanded tag="a" @click="openModalSignatureComponent" class="marginBottom10">
              Cet écran est tactile
            </b-button>
            <b-button type="is-info" expanded tag="a" @click="openModalSignatureQRCode">Utiliser un autre appareil
            </b-button>
            <br>
            <p>Choisissez une des deux options ci-dessus en fonction de votre appareil.</p>
          </div>
          <div v-else>
            <p>Décharge signée le {{dischargeDisplayDate}}</p>
          </div>
        </b-field>

        <b-modal v-model="isSignatureComponentModalActive">
          <DischargeForm @close="closeModal"></DischargeForm>
        </b-modal>

        <b-modal v-model="isSignatureQRCodeModalActive">
          <div class="modal-card" style="width: auto">
            <header class="modal-card-head">
              <p class="modal-card-title">Signature de la décharge</p>
            </header>
            <section class="modal-card-body">
              <b-loading :is-full-page="false" :active="qrcodeB64 === ''" :can-cancel="false"></b-loading>
              <div class="columns">
                <div class="column">
                  <b-field label="Le PDF que vous allez signer">
                    <b-button label="Afficher le PDF dans un nouvel onglet" tag="a" href="/charte-weskic.pdf" target="_blank"/>
                  </b-field>
                  <b-field label="QR Code">
                    <p>Scannez ce QRCode avec votre téléphone pour signer la décharge. <br>
                    Vous aurez la possibilité de faire votre signature au doigt. Le reste est rempli par un formulaire.</p>
                  </b-field>
                </div>
                <div class="column">
                  <div class="is-flex is-flex-direction-row is-justify-content-center">
                    <img :src="qrcodeB64">
                  </div>
                </div>
              </div>
            </section>
            <footer class="modal-card-foot">
              <b-button label="Annuler" @click="$emit('close')"/>
              <b-button label="C'est fait" type="is-primary" @click="checkDischarge"/>
            </footer>
          </div>
        </b-modal>
      </div>
      <div class="column">
        <TelegramChecker v-model="ud.step1.telegram"></TelegramChecker>
      </div>
    </div>

    <div class="box sectionBox">
      <h2 class="subtitle">{{ud.step1.validated ? `Cette étape est validée mais les informations peuvent toujours être modifiées` : `Merci de vérifier toutes les informations avant de valider l'étape` }}</h2>
      <br>
      <div class="columns">
        <div class="column">
          <p>Tu pourras toujours modifier les données de cette étape après validation.</p>
          <br>
          <div class="is-flex is-justify-content-center">
            <b-button v-if="ud.step1.validated" type="is-info" @click="goToStep2">Passer à l'étape 2</b-button>
            <b-button v-else-if="formReady" type="is-success" @click="submitStep1">Valider l'étape 1</b-button>
            <b-button v-else disabled type="is-danger">Formulaire incomplet</b-button>
          </div>
        </div>
        <div class="column">
          <b-field label="Remarque de tout ordre">
            <b-input type="textarea" v-model="ud.step1.remarks" @input="lazySaveTrigger"></b-input>
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
import {mapState} from "vuex";
import {DialogProgrammatic as Dialog, ToastProgrammatic as Toast} from 'buefy';

export default {
  name: 'PersonalInfo',
  components: {TelegramChecker, UploadFileForm, DischargeForm},
  data: () => ({
    isSignatureComponentModalActive: false,
    isSignatureQRCodeModalActive: false,

    identityMessage: 'Complet',
    constraintsMessage: 'Complet',
    activitiesMessage: 'Complet',
    dischargeTelegramMessage: 'Complet',

    saveTimeout: {},
    qrcodeB64: ''
  }),
  computed: {
    identityComplete() {
      return this.ud.step1.identity_sex.length > 0 && this.ud.step1.identity_firstname.length > 0
          && this.ud.step1.identity_emergencyPhone.length > 0 && this.ud.step1.identity_emergencyContact.length > 0
          && this.ud.step1.identity_idCard.date.length > 0;
    },
    activitiesComplete() {
      return this.ud.step1.activities_skiLevel.length > 0 && this.ud.step1.activities_insuranceCard.date.length > 0;
    },
    dischargeTelegramComplete() {
      return this.ud.step1.discharge_date.length > 0;
    },
    formReady() {
      return this.identityComplete && this.activitiesComplete && this.dischargeTelegramComplete;
    },
    ...mapState({
      ud: state => state.userData,
      dischargeDisplayDate: state => {
        const date = new Date(state.userData.step1.discharge_date);
        return date.toLocaleString();
      },
      optionsMessage: state => {
        if (state.userData.step1.activities_options.includes('course') && !state.userData.step1.activities_options.includes('friday')
            && !state.userData.step1.activities_options.includes('saturday'))
          return 'Pour prendre des cours il faut prendre un forfait';
        else return '';
      }
    })
  },
  props: {},
  methods: {
    openModalSignatureComponent() {
      this.isSignatureComponentModalActive = true;
    },
    openModalSignatureQRCode() {
      this.isSignatureQRCodeModalActive = true;

      this.$store.dispatch('generateSignatureQRCode').then(res => {
        this.qrcodeB64 = res.url;
      });

    },
    lazySaveTrigger() {
      if (this.saveTimeout) clearTimeout(this.saveTimeout);
      this.saveTimeout = setTimeout(this.lazySave, 2000);
    },
    lazySave() {
      let userData = this.$store.state.userData;
      console.log(userData);
      this.$store.dispatch('editUserData', {userData, lazy: true});
    },
    syncSave() {
      if (this.saveTimeout) clearTimeout(this.saveTimeout);
      this.$store.dispatch('editUserData', {userData: this.$store.state.userData, lazy: false}).then(response => {
        if (response.missingFields.length > 0) {
          const message = 'Le formulaire a été refusé car ils manquent ces champs obligatoires : ' + response.missingFields.join(', ');
          Dialog.alert({
            title: 'Formulaire refusé',
            message,
            type: 'is-danger',
            hasIcon: true,
            icon: 'times-circle',
            iconPack: 'fa',
            ariaRole: 'alertdialog',
            ariaModal: true
          });
        }
      });


    },
    checkDischarge() {
      this.$store.dispatch('pullUserData').then(userData => {
        if (userData.step1.discharge_date)
          this.isSignatureQRCodeModalActive = false;
        else
          Toast.open({
            message: 'Décharge introuvable ... tu l\'as vraiment envoyée ?',
            type: 'is-danger',
            position: 'is-top',
          });
      });
    },
    submitStep1() {
      this.syncSave();
    },
    goToStep2() {
      this.$emit('next');
    },
    closeModal() {
      this.isSignatureComponentModalActive = false;
      this.isSignatureQRCodeModalActive = false;
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

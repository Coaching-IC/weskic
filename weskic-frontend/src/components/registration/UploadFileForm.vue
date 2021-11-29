<template>
  <b-field :label="fieldLabel">
    <b-notification v-if="isLoading" :closable="false" style="width: 100%;">
      Envoi du fichier en cours ...
      <b-loading :is-full-page="false" v-model="isLoading" :can-cancel="true"></b-loading>
    </b-notification>

    <div v-else-if="value && value.date">
      <b-taglist attached class="is-justify-content-center">
        <b-tag type="is-success">Envoyé</b-tag>
        <b-tag type="is-info">{{ value.fileName }} ~ {{ Math.round(value.fileSize / 1024) }}KB</b-tag>
      </b-taglist>
      <div class="is-flex is-justify-content-space-around">
        <b-button type="is-danger" outlined class="is-small" @click="resetFile">Changer de fichier</b-button>
      </div>
    </div>

    <div v-else-if="file.name" class="is-flex is-flex-direction-column">
      <b-taglist attached class="is-justify-content-center">
        <b-tag type="is-danger">Non envoyé</b-tag>
        <b-tag type="is-info">{{ file.name }} ~ {{ Math.round(file.size / 1024) }}KB</b-tag>
      </b-taglist>
      <div class="is-flex is-justify-content-space-around">
        <b-button type="is-danger" outlined class="is-small" @click="resetFile">Changer de fichier</b-button>
        <b-button type="is-info" class="is-small" @click="sendFile">Envoyer</b-button>
      </div>
    </div>

    <b-upload v-else v-model="file" drag-drop>
      <section class="section">
        <div class="content has-text-centered">
          <p>
            <b-icon icon="upload" size="is-large">
            </b-icon>
          </p>
          <slot></slot>
        </div>
      </section>
    </b-upload>
  </b-field>
</template>

<script>
import {ToastProgrammatic as Toast} from "buefy";

export default {
  name: 'UploadFileForm',
  components: {},
  data: () => ({
    file: {},
    isLoading: false,
  }),
  props: {
    value: {
      type: Object,
      default: ()=>({
        date: '',
        fileName: '',
        fileSize: 0,
      }),
    },
    fieldLabel: {
      type: String
    },
    fileType: {
      type: String,
      default: 'unknown'
    }
  },
  methods: {
    resetFile() {
      this.file = {};
      this.$emit('input', {
        date: '',
        fileName: '',
        fileSize: 0,
      })
    },
    sendFile() {
      //const date = new Date().toISOString();
      this.isLoading = true;
      this.$store.dispatch('uploadDocument', {type: this.fileType, file: this.file}).then(response => {
        console.log('Upload document response : ', response);
        if (response) {
          this.$emit('input', response.fileMeta);
        } else {
          Toast.open({
            message: `Le serveur a refusé le fichier`,
            type: 'is-danger',
            position: 'is-top',
          });
        }
      }).catch(err => {
        Toast.open({
          message: `Une erreur est survenue lors de l'envoi : ${err}`,
          type: 'is-danger',
          position: 'is-top',
        });
      }).finally(() => {
        this.isLoading = false;
      });
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

</style>

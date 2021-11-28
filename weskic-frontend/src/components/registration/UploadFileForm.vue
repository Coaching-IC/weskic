<template>
  <b-field :label="fieldLabel">
    <b-notification v-if="isLoading" :closable="false" style="width: 100%;">
      Envoi du fichier en cours ...
      <b-loading :is-full-page="false" v-model="isLoading" :can-cancel="true"></b-loading>
    </b-notification>
    <div v-if="file.name && !isLoading" class="is-flex is-flex-direction-column">
      <b-taglist attached class="is-justify-content-center">
        <b-tag type="is-danger">Non envoyé</b-tag>
        <b-tag type="is-info">{{ file.name }} ~ {{ Math.round(file.size / 1024) }}KB</b-tag>
      </b-taglist>
      <div class="is-flex is-justify-content-space-around">
        <b-button type="is-danger" outlined class="is-small" @click="resetFile">Changer de fichier</b-button>
        <b-button type="is-info" class="is-small" @click="sendFile">Envoyer</b-button>
      </div>
    </div>
    <b-upload v-if="!file.name" v-model="file" drag-drop>
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
export default {
  name: 'UploadFileForm',
  components: {},
  data: () => ({
    file: {},
    isLoading: false,
    output: {
      fileId: '',
      date: '',
      fileName: '',
      fileSize: 0,
    },
  }),
  props: ['value', 'fieldLabel'],
  methods: {
    resetFile() {
      this.file = {};
      this.output = {
        fileId: '',
        date: '',
        fileName: '',
        fileSize: 0,
      };
    },
    sendFile() {
      const date = new Date().toISOString();
      this.isLoading = true;
      this.output = {
        fileId: 'randomFileId',
        date,
        fileName: this.file.name,
        fileSize: this.file.size,
      };
      this.$emit('input', this.output);
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

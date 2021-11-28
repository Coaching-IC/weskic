<template>
  <div>
    <div v-if="!currentValue.hasJoined">
      <b-field label="Rejoindre le groupe Telegram">
        <b-button type="is-info" expanded tag="a" @click="openTelegram">Lien du channel</b-button>
      </b-field>
      <b-field>
        <b-input expanded v-model="telegramUsername" placeholder="@username"></b-input>
        <p class="control">
          <b-button class="button is-info" @click="checkUsername">J'ai rejoint le groupe</b-button>
        </p>
      </b-field>
      <p>Il est obligatoire de rejoindre ce groupe spécifique au WESKIC. Les informations importantes seront
        communiquées sur ce channel.<br>
        Si vous n'avez pas encore défini un nom d'utilisateur pour Telegram : Settings > Edit > Username
      </p>
    </div>
    <div v-else>
      <p>C'est tout bon ! Nom d'utilisateur : {{ currentValue.username }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TelegramChecker',
  components: {},
  data: () => ({
    telegramUsername: '',
    output: {
      username: '',
      hasJoined: false
    }
  }),
  props: ['value'],
  methods: {
    openTelegram() {
      window.open('https://go.epfl.ch/weskic-telegram', '_blank');
    },
    checkUsername() {
      this.$store.dispatch('checkTelegramUsername', {telegramUsername: this.telegramUsername}).then(newOutput => {
        if (newOutput) {
          this.output = newOutput;
          this.$emit('input', this.output);
        }
      });
    }
  },
  computed: {
    currentValue() {
      if (this.value.hasJoined) return this.value;
      else return this.output;
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

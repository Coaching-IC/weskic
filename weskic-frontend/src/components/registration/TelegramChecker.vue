<template>
  <div>
    <div v-if="!value.hasJoined">
      <b-field label="Rejoindre le groupe Telegram">
        <b-button type="is-info" expanded tag="a" @click="openTelegram">Lien du channel</b-button>
      </b-field>
      <b-field>
        <b-input expanded v-model="telegramUsernameInput" placeholder="@username"></b-input>
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
      <b-field label="Rejoindre le groupe Telegram">
        <p>C'est tout bon ! Nom d'utilisateur : @{{ value.username }}</p>
      </b-field>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TelegramChecker',
  components: {},
  data: () => ({
    telegramUsernameInput: '',
  }),
  props: {
    value: {
      type: Object,
      default: () => ({
        username: '',
        hasJoined: false
      })
    }
  },
  methods: {
    openTelegram() {
      window.open('https://go.epfl.ch/weskic-telegram', '_blank');
    },
    checkUsername() {
      this.$store.dispatch('checkTelegramUsername', {telegramUsername: this.telegramUsernameInput}).then(newValue => {
        if (newValue) {
          this.$emit('input', newValue);
        }
      });
    }
  },
}
</script>

<style scoped>
</style>

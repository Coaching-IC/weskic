<template>
  <div id="box" class="box">
    <div id="skis"></div>

    <div id="leftBox" class="">
      <h1 class="title">Réservation WESKIC</h1>
      <h2 class="subtitle">Quasiment toutes les places sont prises</h2>
      <hr>
      <p class="text">En dehors des périodes d'inscriptions, seules les personnes qui ont
        commencé leur inscription peuvent se connecter.</p>
      <br>
      <div class="is-flex actionbar">
        <b-button type="is-outlined" expanded tag="router-link" :to="{name: 'info'}">Informations</b-button>
        <b-button type="is-success" expanded tag="a" @click="loginWithTequila">Connexion</b-button>
      </div>
    </div>

    <div class="is-flex-grow-1">
      <div id="sideImage"></div>
    </div>

    <img id="logoCoaching" src="../assets/logo-full.png">

  </div>
</template>

<script>
import {mapActions} from "vuex";

export default {
  name: 'LoginView',
  props: [],
  methods: {
    ...mapActions(['loginWithTequila'])
  }
}
</script>

<style scoped>


#box {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0;
  width: auto;

  margin: 10px;
}

#leftBox {
  padding: 1.25rem;
}

.actionbar > .button {
  margin-right: 5px;
}

#skis {
  display: none;
}

#sideImage {
  width: 30vw;
  height: 100%;
  background-image: url("../assets/torgon1.jpg");
  background-size: cover;
  background-position-x: right;
  background-position-y: center;
  border-radius: 6px;
}

#logoCoaching {
  position: absolute;
  right: 10px;
  top: 5px;
  height: 100px;
  width: 100px;
}

@media only screen and (min-width: 600px) {
  #box {
    flex-direction: row;
    width: auto;
  }

  #skis {
    display: inherit;
    position: absolute;
    top: -30px;
    left: 285px;
    z-index: 1000;
    background-image: url("../assets/skis.png");
    background-size: contain;
    background-repeat: no-repeat;
    height: 115%;
    width: 397px;
  }

  #leftBox {
    width: 300px;
    flex-shrink: 0;
  }

  #sideImage {
    clip-path: polygon(150px 0, 0 calc(100%), calc(100%) calc(100%), calc(100%) 0);
    -webkit-clip-path: polygon(150px 0, 0 calc(100%), calc(100%) calc(100%), calc(100%) 0);
  }

  /*#logoCoaching {*/
  /*  position: absolute;*/
  /*  right: -30px;*/
  /*  top: -30px;*/
  /*  height: 120px;*/
  /*  width: 120px;*/
  /*}*/
  #logoCoaching {
    position: absolute;
    z-index: 1000;
    top: 140px;
    left: 320px;
    height: 120px;
    width: 120px;
  }
}

</style>

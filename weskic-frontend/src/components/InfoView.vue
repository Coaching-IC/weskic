<template>
  <div id="topInfo" class="container">

    <div class="columns">
      <div class="column is-7-tablet">
        <div id="topBox" class="box">
          <img id="logo-weskic" src="../assets/weskic-logo.png" alt="Logo WESKIC">
          <h1 class="title">Weekend Ski Coaching IC - 11-13 mars 2022</h1>
          <p>
            Le Weekend Ski du Coaching IC revient en force cette année avec un jour de plus, un nouveau chalet et bien plus encore !
          </p>
          <hr>
          <b-button type="is-success" expanded tag="router-link" :to="{name: 'login'}">Inscriptions</b-button>
          <br>
          <h3 class="subtitle">N'hésite pas à nous contacter si les questions ci-dessous ne suffisent pas ;)</h3>
        </div>
      </div>
      <div class="column">

        <div id="video-container">
          <iframe width="560" height="315" src="https://www.youtube.com/embed/K4jMEHE5O4g"
                  title="YouTube video player" allowfullscreen>
          </iframe>
        </div>

        <div id="dates" class="notification is-warning">
          <h3 class="subtitle">Dates d'inscription</h3>
          <ul>
            <li><strong>1</strong> décembre midi - <strong>IN/SC BA1</strong></li>
            <li><strong>3</strong> décembre midi - <strong>IN/SC BA1/3</strong></li>
            <li><strong>6</strong> décembre midi - <strong>IN/SC</strong></li>
            <li><strong>8</strong> décembre midi - <strong>EPFL</strong></li>
          </ul><br>
          Conditions de participation : tu dois <strong>être majeur</strong> et avoir un <strong>certificat COVID</strong> valide pour tout le séjour.
        </div>

      </div>
    </div>

      <QaA></QaA>

    <div id="footer">
      <img id="logo-coaching" src="../assets/logo-full.png" alt="logo coaching">
    </div>
  </div>
</template>

<script>
import QaA from "@/components/QaA";

export default {
  name: 'InfoView',
  components: {QaA},
  props: {}
}
</script>

<style scoped>

#topInfo {
  margin-top: 15px;
  padding-right: 5px;
}

#topBox {
  height: 100%;
}

#video-container {
  overflow: hidden;
  border-radius: 7px;
  padding-top: 56.25%; /* 16:9 */
  position: relative;
}

#video-container iframe {
  border: 0;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
}

#dates {
  margin-top: 15px;
}

#footer {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 20px;
}

#logo-coaching {
  height: 128px;
  width: 128px;
}

@media only screen and (max-width: 1023px) {
  #topInfo {
    max-width: 95vw;
  }
}

</style>

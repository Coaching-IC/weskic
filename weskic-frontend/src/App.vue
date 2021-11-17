<template>
  <div id="toplevel">
    <div id="bg"></div>
    <div id="app">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>

export default {
  name: 'App',
  components: {}
}
</script>

<style>

html, body {
  height: 100%;
}

#toplevel {
  position: absolute;
  height: 100%;
  width: 100%;
}

#bg {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-image: url("./assets/portes_du_soleil_bg.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  filter: blur(8px);
  -webkit-filter: blur(8px);
  transform: scale(1.1);
}

#app {
  position: absolute;
  width: 100%;
  min-height: 100%;
  top: 0;
  left: 0;

  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>

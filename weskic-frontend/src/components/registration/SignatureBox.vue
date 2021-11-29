<template>
  <div id="box">
    <div id="canvasBox">
      <canvas class="js-sig-canvas sig" width="300" height="125"></canvas>
    </div>
    <b-button class="js-sig-reset sig-reset" :disabled="this.base64sig === ''" @click="reset">Reset
      signature
    </b-button>
  </div>
</template>

<script>
import SignaturePad from 'signature_pad';
import {mapState} from 'vuex';

let canvas;

export default {
  name: 'SignatureBox',
  props: ['value'],
  data: () => ({
    base64sig: '',
  }),
  computed: mapState({}),
  mounted: function () {
    canvas = document.querySelector(".js-sig-canvas");
    const signaturePad = new SignaturePad(canvas, {
      minWidth: 1,
      maxWidth: 1,
    });
    signaturePad.addEventListener('endStroke', () => {
      this.base64sig = signaturePad.toDataURL();
      this.$emit('input', this.base64sig);
    });
  },
  methods: {
    reset() {
      this.base64sig = '';
      let canvasContext = document.querySelector('.js-sig-canvas').getContext('2d');
      canvasContext.clearRect(0, 0, canvas.width, canvas.height);
      this.$emit('input', '');
    }
  }
}
</script>

<style scoped>
#box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

#box button {
  margin-top: 5px;
  width: 300px;
}

#canvasBox {
  display: flex;
  justify-content: center;
}

#canvasBox .js-sig-canvas {
  background-color: white;
  border-radius: 4px;
  border: 1px solid #dbdbdb;;
}

</style>

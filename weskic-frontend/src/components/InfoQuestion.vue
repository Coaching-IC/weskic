<template>
  <b-collapse
      class="card"
      animation="slide"
      aria-id="contentIdForA11y3"
      :open="false">
    <template #trigger="props">
      <div
          :class="important ? 'card-header is-important' : 'card-header'"
          role="button"
          aria-controls="contentIdForA11y3">
        <p class="card-header-title">
          {{ question }}
        </p>
        <a class="card-header-icon"><b-icon :icon="props.open ? 'menu-up' : 'menu-down'"></b-icon></a>
      </div>
    </template>

    <div class="card-content">
      <div class="content is-relative">
        <slot></slot>
      </div>
    </div>
  </b-collapse>
</template>

<script>

export default {
  name: 'InfoQuestion',
  props: ['question','answer','important'],
  methods: {}
}
</script>

<style scoped>

.is-important {
  background-color: #f14668;
}

</style>

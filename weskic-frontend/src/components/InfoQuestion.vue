<template>
  <b-collapse
      class="card"
      animation="slide"
      aria-id="contentIdForA11y3"
      :open="false">
    <template #trigger="props">
      <div
          class="card-header"
          role="button"
          aria-controls="contentIdForA11y3">
        <p class="card-header-title">
          {{ question }}
        </p>
        <a class="card-header-icon"><b-icon :icon="props.open ? 'menu-up' : 'menu-down'"></b-icon></a>
      </div>
    </template>

    <div class="card-content">
      <div class="content">
        <slot></slot>
      </div>
    </div>
  </b-collapse>
</template>

<script>

export default {
  name: 'InfoQuestion',
  props: ['question','answer'],
  methods: {}
}
</script>

<style scoped>
</style>

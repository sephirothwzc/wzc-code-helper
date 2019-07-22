<template>
  <div id="app">
    <router-link to="/">数据字典</router-link>
    <router-link to="/interface-to-schemas">interfaceToSchemas</router-link>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'wzc-code-helper'
}
</script>

<style>
/* CSS */
a {
  margin: 20px;
}
</style>

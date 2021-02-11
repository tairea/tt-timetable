<template>
  <div id="app">
    <Timetable/>
  </div>
</template>

<script>
import Timetable from './components/Timetable.vue'

export default {
  name: 'App',
  components: {
    Timetable
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /* margin-top: 60px; */
}

@media (max-width: 599px) {
  #app {
    margin-top: 10px;
  }
}
</style>

<template>
  <div>
    <div>
      <textarea class="intxt" v-model="intxt"></textarea>
    </div>
    <div>
      <input type="button" value="转换" class="btn" @click="txtTo" />
    </div>
    <div>
      <textarea class="intxt" v-model="outtxt"></textarea>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    intxt: undefined,
    outtxt: undefined
  }),
  methods: {
    txtTo () {

    }
  }
}
</script>

<style lang="scss" scoped>
.intxt {
  width: 90%;
  height: 40vh;
  font-size: 20px;
}
.btn {
  width: 80px;
  height: 60px;
  font-size: 30px;
}
</style>
<template>
    <div class="emoji-holder" v-show="value">
        <div class="emoji-holder-wrap">
            <img class="emoji-img" v-for="(item,index) in images" :src="require(`./img/${item}`)" :alt="fullChineseCodes[index]" @click="onChooseEmoji(fullChineseCodes[index])">
        </div>
    </div>
</template>
<style lang="less" scoped>
    @border-color: #e7e7e7;
    .emoji-holder {
        position: absolute;
        z-index: 100;
        background-color: #fff;
        border: 1px solid @border-color;
        bottom: 100%;
        left: -10px;
        right: -10px;
        height: 120px;
        &:after {
            position: absolute;
            display: block;
            content: '';
            left: 11px;
            top: 100%;
            width: 6px;
            height: 6px;
            background-color: #fff;
            border-right: 1px solid @border-color;
            border-bottom: 1px solid @border-color;
            transform: rotate(45deg) translateY(-3px);
        }
        &-wrap {
            width: 100%;
            height: 100%;
            overflow-y: auto;
            padding-bottom: 10px;
        }
        .emoji-img{
            margin-top: 5px;
            margin-left: 5px;
            cursor: pointer;
        }
    }
</style>
<script>
    import emoji from './emoji'
    export default{
        props: {
            value: {
                type: Boolean
            }
        },
        data(){
          return{
              charCodes:emoji.charCodes,
              chineseCodes:emoji.chineseCodes,
              fullChineseCodes:emoji.fullChineseCodes,
              images:emoji.images
          }
        },
        methods: {
            onChooseEmoji(code){
                this.$emit('selected', code.replace(/\\/g,''))
                this.$emit('input', false)
            }
        }
    }
</script>

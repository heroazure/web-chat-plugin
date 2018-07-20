<template>
    <div class="clearfix">
        <div :class="['msgbox',part,contentType]">
            <slot></slot>
            <span v-if="sendStatus==='sending'" class="yk-icon icon-shuaxin"></span>
            <span v-if="sendStatus==='fail'" class="yk-icon icon-fasongshibai" style="cursor:pointer;" @click="onResend"></span>
        </div>
    </div>
</template>
<style lang="less" scoped>
    @border-color:#e7e7e7;
    @border-radius:4px;
    @primary-color:#1f95e7;
    .msgbox{
        display: inline-block;
        position: relative;
        font-size:14px;
        padding:10px;
        border:1px solid @border-color;
        border-radius: @border-radius;
        background-color: #fff;
        color: #000;
        margin-right: 16px;
        margin-bottom: 20px;
        >.icon-fasongshibai{
            color: #f96768;
        }
        >.yk-icon{
            position: absolute;
            right:-22px;
            top:50%;
            margin-top: -10px;
        }
        &:after {
            position: absolute;
            display: block;
            content: '';
            left: -4px;
            top: 12px;
            width: 6px;
            height: 6px;
            background-color: #fff;
            border-top: 1px solid @border-color;
            border-left: 1px solid @border-color;
            transform: rotate(-45deg);
        }
        &.right{
            border-color: @primary-color;
            background-color: @primary-color;
            color: #fff;
            margin-left: 16px;
            margin-right: 0;
            float: right;
            &:after{
                left:auto;
                right:-4px;
                transform: rotate(135deg);
                border-color: @primary-color;
                background-color: @primary-color;
            }
            >.yk-icon{
                left:-22px;
                right:auto;
                top:50%;
                margin-top: -10px;
            }

        }
        &.img{
            padding: 5px;
            >img{
                max-width:100%;
                height:auto;
            }
            &.right{
                background-color: #fff;
                border-width: 5px;
                padding: 0;
                &:after{
                    right:-8px;
                }
            }
        }
    }
    .icon-shuaxin {
        animation: fa-spin 2s infinite linear;
    }
    @keyframes fa-spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(359deg);
        }
    }
</style>
<script>
    export default{
        name:'msg-box',
        props: {
            part: {
                type: String,
                default: 'left'
            },
            contentType: {
                type: String,
                default: 'text'
            },
            sendStatus:{
                type: String,
                default: 'success'
            }
        },
        methods:{
            onResend(){
                this.$emit('on-resend')
            }
        }
    }
</script>
<!--
属性：
part:[left,right],聊天的两个用户角色，left为消息框中的左侧消息，right为消息框中的右侧消息
contentType:[text,img]text为字符串文本消息类型包括表情，img为图片消息类型
-->
<template>
    <div id="app">
        <header class="header">
            <div class="header-left">
                <img class="merchant-head" :src="merchantInfo.logo_path" :alt="merchantInfo.name">
                <div class="merchant-desc">
                    <span class="b1">{{merchantInfo.name}}</span><br>
                    {{merchantInfo.tips}}
                </div>
            </div>
            <div class="header-right">
                <span @click="onClose" class="yk-close"></span>
            </div>
        </header>
        <section class="content" ref="content">
            <div class="loading-more-messages">
                    <span class="m1" @click="onLoadingMoreMessages"
                          v-if="!loadingMessages.noMoreMessages&&!loadingMessages.loadingMoreMessages">加载更多</span>
                <span v-if="loadingMessages.noMoreMessages">没有更多消息了</span>
                <span v-if="loadingMessages.loadingMoreMessages&&!loadingMessages.noMoreMessages">加载中...</span>
            </div>
            <msg-box v-for="(item,index) in messages"
                     :part="item.self?'right':'left'"
                     :content-type="item.contentType"
                     :send-status="item.sendStatus"
                     @on-resend="onResend(item)"
                     :key="index">
                <div v-if="item.contentType==='text'" v-html="convertToExpression(item.content)"></div>
                <img v-if="item.contentType==='img'" style="max-width:100%;height: auto;" :src="item.content" alt="图片">
            </msg-box>
        </section>
        <section class="entry">
            <textarea v-model="inputVal" class="entry-val" name="entry" rows="2" placeholder="请输入" @keyup.enter="onSend" ref="input"></textarea>
            <div class="entry-operator" id="uploadImgP">
                <div class="left">
                    <emoji-selector v-model="showEmoji" @selected="onSelectedEmoji"></emoji-selector>
                    <span class="yk-icon icon-biaoqing" @click.stop="onToggleEmoji"></span>
                    <span class="yk-icon icon-tupian" id="uploadImg"></span>
                    <span class="yk-icon icon-wodeerweima1" @click.stop="onToggleQrcode"></span>
                    <div v-show="showQrcode" class="qr-code">
                        <img src="./img/code.png" alt="二维码">
                        <div class="txt">
                            <span class="t1">扫描关注公众号</span><br>
                            <span>了解更详细资讯</span>
                        </div>
                    </div>
                </div>
                <div class="right">
                    <button type="button" class="btn-send" v-bind="{disabled:!active}" @click="onSend">发送</button>
                </div>
            </div>
        </section>
        <footer class="footer">
            客服软件由heroxiao技术支持
        </footer>
    </div>
</template>
<style lang="less">
</style>
<script>
    import 'assets/css/index.less'
    import './style.less'
    import EmojiSelector from 'components/emoji'
    import MsgBox from 'components/msgBox'
    import emoji from 'components/emoji/emoji.js'
    import upload from './upload'
    import ajax from 'util/ajax'
    export default{
        components: {
            EmojiSelector,
            MsgBox
        },
        data(){
            return {
                websocket:null,
                showEmoji:false,
                showQrcode:false,
                inputVal:'',
                connectTimes:10,//重连最多10次
                merchantInfo:{},
                loadingMessages:{
                    noMoreMessages:false,
                    loadingMoreMessages:false
                },
                messages:[
                    /*{
                        self:true,
                        messageType:'message',
                        contentType:'text',
                        content:'亲，您好亲，您好亲，您好亲，您好亲，您好亲，您好亲，您好亲，您好。。。/::)',
                        sendStatus:'fail'
                    },
                    {
                        self:false,
                        messageType:'message',
                        contentType:'img',
                        content:'https://file.iviewui.com/dist/064e76361054a96322f411a6c8265fa3.png',
                        sendStatus:'fail'
                    },
                    {
                        self:true,
                        messageType:'message',
                        contentType:'img',
                        content:'https://file.iviewui.com/dist/064e76361054a96322f411a6c8265fa3.png',
                        sendStatus:'sending'
                    },
                    {
                        self:false,
                        messageType:'message',
                        contentType:'text',
                        content:'haoa[微笑]',
                        sendStatus:'sending'
                    }*/
                ]
            }
        },
        computed:{
            active(){
                return !!this.inputVal.trim()
            }
        },
        mounted(){
            window.addEventListener('message',(e)=> {
                let key=JSON.parse(e.data).key
                let data=JSON.parse(e.data).data
                if(key==='getCId'){
                    console.log('key:',key,'data:',data)
                    this.doWebsocket(data)
                    this.getMerchantInfo(data)
                    this.scrollToBottom()
                    this.sendImage()
                }
            },false)
            window.parent.postMessage(JSON.stringify({key:'getCId'}),'*')
            if(this.getFansId()){
                this.onLoadingMoreMessages()
            }
        },
        methods:{
            onClose(){
                //发送消息到父窗口
                window.parent.postMessage(JSON.stringify({key:'close'}),'*')
            },
            onLoadingMoreMessages(){
                if (!this.loadingMessages.noMoreMessages) {
                    this.loadingMessages.loadingMoreMessages = true
                    let lastId = this.messages[0] ? this.messages[0].id : null
                    ajax({
                        url: '/saas/index.php/App/AppStaticPage',
                        data: {
                            requestFunction:'get_webFansChatLog',
                            fans_id:this.getFansId(),
                            last_msg_id:lastId,
                            count:10
                        }
                    }).then(({data})=>{
                        (data || []).forEach(item=> {
                            this.messages.unshift(this.formatMessage(item))
                        })
                        this.loadingMessages.loadingMoreMessages = false
                        if (!data||!data.length) {
                            this.loadingMessages.noMoreMessages = true
                        }
                    })
                }
            },
            onSend(){
                let val=this.inputVal.trim()
                if(!val){
                    return
                }
                this.toSendMsg('text', val)
            },
            onResend(message){
                let uuid = message.id
                let valObj = ['new_message', {
                    'messages': [{
                        kind: 'message',
                        message: {
                            MsgType: message.contentType === 'img' ? 'image' : message.contentType,
                            Content: message.content
                        }
                    }],
                    id: uuid
                }]
                this.websocket.send(JSON.stringify(valObj))
                message.sendStatus='sending'
            },
            onSelectedEmoji(val){
                this.inputVal = `${this.inputVal.substring(0, this.$refs.input.selectionStart)}${val}${this.inputVal.substring(this.$refs.input.selectionEnd)}`
            },
            onToggleEmoji(){
                this.showEmoji = ! this.showEmoji
                this.documentTapHide(()=>{
                    this.showEmoji = false
                })
            },
            onToggleQrcode(){
                this.showQrcode = ! this.showQrcode
                this.documentTapHide(()=>{
                    this.showQrcode = false
                })
            },
            toSendMsg(msgType, value){
                let uuid = this.generateUUID()
                let valObj=['new_message',{
                    'messages':[{
                        kind:'message',
                        message:{
                            MsgType: msgType === 'img' ? 'image' : msgType
                        }
                    }],
                    id:uuid
                }]
                if(msgType==='img'){
                    valObj[1].messages[0].message.PicUrl=value
                    valObj[1].messages[0].message.qiNiu_url=value
                }else if(msgType==='text'){
                    valObj[1].messages[0].message.Content=value
                }
                this.websocket.send(JSON.stringify(valObj))
                console.log(valObj)
                this.insertOneMessage(uuid, value, msgType)
                msgType === 'text' && (this.inputVal = '')
                this.scrollToBottom()
            },
            documentTapHide(func){
                let bindHide = function () {
                    func&&func()
                    document.removeEventListener('click', bindHide, false)
                }
                setTimeout(function () {
                    document.addEventListener('click', bindHide, false)
                }, 500)
            },
            convertToExpression(text){
                let url=process.env.NODE_ENV==='development'?'/img/':'/saas/Tpl/EmbeddedChat/chat-inner/dist/img/'
                emoji.charCodes.forEach((item,index)=>{
                    text=text.replace(new RegExp(item,'g'),emoji.chineseCodes[index])
                })
                emoji.fullChineseCodes.forEach((item,index)=>{
                    text=text.replace(new RegExp(item,'g'),`<img class="emoji-img" src="${url}${emoji.images[index]}" alt="${item}">`)
                })
                return text
            },
            scrollToBottom(){
                setTimeout(()=>{
                    this.$refs.content.scrollTop=this.$refs.content.scrollHeight
                },0)
            },
            getMerchantInfo(cId){
                ajax({
                    url: '/saas/index.php/App/AppStaticPage',
                    data: {
                        requestFunction:'get_webfans_chatBoxInformation',
                        id:cId
                    }
                }).then(({data})=>{
                    this.merchantInfo=data||{}
                })
            },
            doWebsocket(cId){
                let url = process.env.NODE_ENV === 'production' ? 'ws://www.yunkexiongdi.com:10012':'ws://erptest.hunliji.com:10011'
                this.websocket=new WebSocket(url)
                let ws=this.websocket
                ws.onopen=()=>{
                    this.connectTimes=10
                    console.log('成功连接websocket')
                    let option=[
                        'fans_data',
                        {
                            HTTP_FANSID:this.getFansId(),
                            HTTP_TIME:new Date().getTime(),
                            MERCHANT_ID:cId
                        }
                    ]
                    ws.send(JSON.stringify(option))
                }
                ws.onclose=()=>{
                    console.log('连接已关闭')
                    //重新发起连接
                    if(this.connectTimes>0){
                        ws=this.websocket=new WebSocket(url)
                    }
                }
                ws.onerror=()=>{
                    console.log('发生异常')
                }
                ws.onmessage=(evt)=>{
                    console.log('接收数据:',evt.data)
                    this.listenMessage(evt)
                }
            },
            getFansId(){
                return localStorage.getItem('ykxd-fansId')||''
            },
            setFansId(id){
                localStorage.setItem('ykxd-fansId',id)
            },
            listenMessage(evt){
                let ws=this.websocket
                let data=JSON.parse(evt.data)
                let msgType=data[0]
                let content=data[1]
                switch(msgType){
                    case 'PING':
                        ws.send(JSON.stringify(['PONG']))
                        break;
                    case 'new_fans_id':
                        console.log('content.id:',content.id)
                        this.setFansId(content.id)
                        break;
                    case 'got_message':
                        if(content.err_code!==0){
                            console.log('消息发送失败')
                            this.updateMessageSendStatus(content.id, 'fail')
                        }else {
                            this.updateMessageSendStatus(content.id, 'success',content.new_msg_id_arr[0])
                        }
                        break;
                    case 'new_message':
                        let ids=[];
                        (content.messages||[]).forEach(item=>{
                            this.messages.push(this.formatMessage(item))
                            item.id&&ids.push(item.id)
                        })
                        this.scrollToBottom()
                        ws.send(JSON.stringify(['got_message',{ids:ids}]))
                        break;
                    default:
                        console.log('msgType',msgType)
                        break;
                }
            },
            formatMessage(item){
                return {
                    id:item.id,
                    self:this.getMsgboxPart(item),
                    messageType:item.kind,
                    contentType:this.getMsgboxContentType(item),
                    content: this.getMsgboxContent(item),
                    sendStatus: 'success'
                }
            },
            //获取聊天气泡对应的Content参数
            getMsgboxContent(msgItem){
                if (msgItem.kind === 'tracker') {
                    return msgItem.message.detail
                }
                if (msgItem.kind === 'message') {
                    if (msgItem.message.MsgType === 'image') {
                        return msgItem.message.qiNiu_url
                    }
                    return msgItem.message.Content
                }
                return ''
            },
            //获取聊天气泡对应的part参数
            getMsgboxPart(msgItem){
                if (msgItem.kind === 'message') {
                    if (msgItem.send_from === '1') {
                        return true
                    }
                    if (msgItem.send_from === '2') {
                        return false
                    }
                    if (msgItem.send_from === '4') {
                        return false
                    }
                }
                return false
            },
            //获取聊天气泡对应的ContentType参数
            getMsgboxContentType(msgItem){
                if (msgItem.kind === 'tracker') {
                    return 'text'
                }
                if (msgItem.kind === 'message') {
                    return msgItem.message.MsgType === 'text' ? 'text' : 'img'
                }
                return 'text'
            },
            sendImage(){
                let that=this
                //初始化七牛上传logo组件
                upload('uploadImg', 'uploadImgP',
                    function () {
                        console.log('callback 1');
                    },
                    //获得上传进度的回调
                    function (persent) {
                        console.log('callback 2');
                        console.log(persent);
                    },
                    //获得上传成功后url的回调
                    function (source) {
                        console.log(source)
                        that.toSendMsg('img', source)
                    })
            },
            generateUUID() {
                let d = new Date().getTime()
                let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    let r = (d + Math.random() * 16) % 16 | 0
                    d = Math.floor(d / 16)
                    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16)
                })
                return uuid;
            },
            insertOneMessage(uuid,value,contentType){
                this.messages.push({
                    id:uuid,
                    self:true,
                    messageType:'message',
                    contentType:contentType,
                    content:value,
                    sendStatus:'sending'
                })
            },
            updateMessageSendStatus(uuid, status,msgId){
                try {
                    this.messages.forEach(im=> {
                        if (im.id === uuid) {
                            im.sendStatus = status
                            msgId&&(im.id=msgId)
                            throw new Error('break')
                        }
                    })
                } catch (e) {
                }
            },
        }
    }
</script>

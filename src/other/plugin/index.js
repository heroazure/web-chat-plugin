/**
 * Created by xuwei on 2017/6/14.
 */
import './ykxd.less'
let toChatBtn=document.createElement('div')
toChatBtn.setAttribute('id','ykxd-pane-btn')
toChatBtn.innerHTML='<span class="yk-icon icon-duihua"></span>有问题随时可以问我'
let toChatPane=document.createElement('div')
toChatPane.setAttribute('id','ykxd-pane-chat')
let clientWidth=document.documentElement.getBoundingClientRect().width
let mobileSrc='http://localhost:9900/pc-chat'
let pcSrc='http://localhost:9900/pc-chat'

if(process.env.NODE_ENV==='production'){
  mobileSrc='http://localhost:9900/pc-chat'
  pcSrc='http://localhost:9900/pc-chat'
}
let innerText=`<iframe id="iframe" src="${mobileSrc}" frameborder="0" allowtransparency="no" scrolling="no"></iframe>`
toChatPane.setAttribute('class','mobile')
toChatBtn.setAttribute('class','mobile')
//假设大于640为pc端
if(clientWidth>640){
  innerText=`<iframe id="iframe" src="${pcSrc}" frameborder="0" allowtransparency="no" scrolling="no"></iframe>`
  toChatPane.setAttribute('class','pc')
  toChatBtn.setAttribute('class','pc')
}
toChatPane.innerHTML=innerText
document.body.appendChild(toChatBtn)
document.body.appendChild(toChatPane)
let iframe=document.getElementById('iframe')

let togglePane=function () {
  toChatPane.style.display=getComputedStyle(toChatPane).display==='block'?'none':'block'
  toChatBtn.style.display=getComputedStyle(toChatBtn).display==='block'?'none':'block'
}
//点击和我聊天
function clickToChatBtn() {
  toChatBtn.addEventListener('click',function () {
    togglePane()
  },false)
}
clickToChatBtn()

//显示聊天窗口
ykxd.showChatPane=function () {
  toChatBtn.style.display='none'
  toChatPane.style.display='block'
}

//来自聊天子窗口的消息监听
window.addEventListener('message',function (e) {
  let key=JSON.parse(e.data).key
  if(key==='close'){
    togglePane()
  }
  if(key==='getCId'){
    iframe.contentWindow.postMessage(JSON.stringify({key:'getCId',data:window.ykxd.obj.cId}),'*')
  }
},false)


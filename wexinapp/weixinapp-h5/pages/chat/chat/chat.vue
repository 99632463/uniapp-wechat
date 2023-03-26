<template>
	<view>
		<freeNavBar :title='detail.name' :noreadnum="totalNoreadnum" showBack>
			<freeIconButton slot='right' :icon="'\ue6fd'" @click="openChatSet">
			</freeIconButton>
		</freeNavBar>
		
		
		<!-- 聊天内容区域 -->
		<scroll-view 
			scroll-y 
			class="bg-light position-fixed left-0 right-0 px-3" 
			style="box-sizing: border-box;"
			:style="chatBodyBottom"
			:show-scrollbar="false"
			@click="clickPage"
			:scroll-into-view="scrollIntoView"
			scroll-with-animation
		>
			<!-- 聊天信息列表组件 -->
			<view v-for="(item, index) in list" :key="index" :id="'chatItem_' + index">
				<freeChatItem 
					ref="chatItem"
					:item="item" 
					:index="index" 
					:pretime='index > 0 ? list[index-1].create_time : 0' 
					@long='long'
					@preview='previewImage'
					:shownickname="currentChatItem.shownickname"
				/>
			</view>
		</scroll-view>
		
		<!-- #ifdef APP-PLUS-NVUE -->
		<view 
			v-if="mode == 'action' || mode == 'emoticon'"
			@click="clickPage" 
			class="position-fixed left-0 right-0 top-0" 
			:style="'bottom:' + maskBottom + 'px'"
		>
		</view>
		<!-- #endif -->
		
		<!-- 底部输入框 -->
		<view 
			class="position-fixed left-0 right-0 border-top flex align-center" 
			style="background-color: #f7f7f6;height: 105rpx;"
			:style="'bottom:' + keyboardHeight + 'px'"
		>
			<freeIconButton v-if="mode == 'audio'" @click="changeVoiceOrText" :icon="'\ue607'">
			</freeIconButton>
			<freeIconButton v-else @click="changeVoiceOrText" :icon="'\ue606'">
			</freeIconButton>
			
			<view class="flex-1">
				<view 
					v-if="mode == 'audio'" 
					style="height: 80rpx;" 
					class="rounded flex align-center justify-center"
					:class="isRecording ? 'bg-light':'bg-white'"
					@touchstart="voiceTouchStart"
					@touchmove="voiceTouchMove"
					@touchend="voiceTouchEnd"
					@touchcancel="voiceTouchCancel"
				>
					<text class="font">{{isRecording ? '松开结束' : '按住 说话'}}</text>
				</view>
				<textarea 
					v-else
					v-model="text" 
					fixed 
					class="bg-white rounded p-2 font-md" 
					style="height: 50rpx;max-width: 450rpx;" 
					:adjust-position="false"
					@click="clickInput"
					@focus="onInputFocus"
				>
				</textarea>
			</view>
			
			<!-- 表情 -->
			<freeIconButton @click="openActionOrEmoticon('emoticon')" :icon="'\ue605'">
			</freeIconButton>
			<!-- 扩展菜单 -->
			<freeIconButton @click="openActionOrEmoticon('action')" v-if="text.length === 0" :icon="'\ue603'">
			</freeIconButton>
			<!-- 发送按钮 -->
			<view v-else class="flex-shrink">
				<freeMainButton name="发送" @click="send('text')"></freeMainButton>
			</view>
		</view>
		
		<!-- 扩展菜单 -->
		<freePopup :mask='false' bottom ref="action" transformOrigin="center bottom" @hide='keyboardHeight = 0'>
			<view style="height: 580rpx;" class="border-top border-light-secondary bg-light">
				<swiper :indicator-dots="emoticonOrActionList.length > 1" style="height: 510rpx;">
					<swiper-item class="row" v-for='(item,index) in emoticonOrActionList' :key="index">
						<view 
							class="col-3 flex align-center justify-center flex-column" 
							style='height:225rpx'
							v-for='(item2,index2) in item' :key="index2"
							@click="actionEvent(item2)"
						>
							<image :src='item2.icon' style="width: 100rpx;height: 100rpx;"></image>
							<text class="font-sm text-muted mt-2">{{item2.name}}</text>
						</view>
					</swiper-item>
				</swiper>
			</view>
		</freePopup>
		
		<!-- 点击消息弹出层 -->
		<freePopup ref="extend" :bodyWidth="240" :bodyHeight="getMenusHeight" :tabbarHeight='105'>
			<view class="flex flex-column" style="width: 240rpx;" :style="getMenusStyle">
				<view 
					v-for="(item,index) in menusList" 
					:key="index" 
					class="flex-1 flex align-center" 
					hover-class="bg-hover-light"
					@click="clickEvent(item.event)"
				>
					<text class="font-md pl-3">{{item.name}}</text>
				</view>
			</view>
		</freePopup>
		
		<!-- 录音提示 -->
		<view v-if="isRecording" class="position-fixed left-0 right-0 top-0 flex align-center justify-center" style="bottom: 105rpx">
			<view style="width:360rpx;height:360rpx;background:rgba(0,0,0,0.5)" class="rounded flex flex-column align-center justify-center">
				<image src='/static/audio/recording.gif' style="width: 150rpx; height: 150rpx;"></image>
				<text class="font text-white mt-3">{{unRecord ? '松开手指，取消发送' : '手指上滑，取消发送'}}</text>
			</view>
		</view>
	</view>
</template>

<script>
	import {mapState,mapMutations} from 'vuex';
	import freeNavBar from '@/components/free-ui/free-nav-bar.vue'
	import freeIconButton from '@/components/free-ui/free-icon-button.vue'
	import freeChatItem from '@/components/free-ui/free-chat-item.vue'
	import freePopup from '@/components/free-ui/free-popup.vue'
	import freeMainButton from '@/components/free-ui/free-main-button.vue'
	import $U from '@/common/free-lib/util.js';
	import $H from '@/common/free-lib/request.js';
	
	// #ifdef APP-PLUS-NVUE
	const dom = weex.requireModule('dom')
	// #endif
	
	export default {
		components: {
			freeNavBar,
			freeIconButton,
			freeChatItem,
			freePopup,
			freeMainButton
		},
		data() {
			return {
				scrollIntoView: '',
				// text, emoticon, action, audio
				mode: 'text',
				actionList: [
					[{
						name:"相册",
						icon:"/static/images/extends/pic.png",
						event:"uploadImage"
					},{
						name:"拍摄",
						icon:"/static/images/extends/video.png",
						event:"uploadVideo"
					},{
						name:"收藏",
						icon:"/static/images/extends/shoucan.png",
						event:"openFava"
					},{
						name:"名片",
						icon:"/static/images/extends/man.png",
						event:"sendCard"
					},{
						name:"语音通话",
						icon:"/static/images/extends/phone.png",
						event:""
					},{
						name:"位置",
						icon:"/static/images/extends/path.png",
						event:""
					}]
				],
				emoticonList: [],
				text: '',
				keyboardHeight: 0,
				navBarHeight: 0,
				list: [
					// {
					// 	avatar: '../../../static/video/demo.jpg',
					// 	user_id:1,
					// 	nickname: '昵称',
					// 	type:'text', // text,audio,video,image,emoticon,share
					// 	data: '自己',
					// 	create_time: 1669813514530,
					// 	isremove:false
					// },
				],
				menusList: [],
				propIndex:-1,
				savekeyboardHeight: 0,
				isRecording: false,
				recordingStartY: 0,
				unRecord: false,
				detail: {
					id:0,
					name:'',
					avatar: '',
					chat_type: 'user'
				}
			}
		},
		onLoad(e) {
			this.detail = JSON.parse(decodeURIComponent(e.params))
			
			this.init()
			
			// 创建聊天对象
			this.chat.createChatObject(this.detail)
			// 获取历史记录
			this.list = this.chat.getChatDetail()
			// 监听接受聊天信息
			uni.$on('onMessage', (message) => {
				if((message.from_id === this.detail.id && message.chat_type === 'user') || (
				message.chat_type === 'group' && message.to_id === this.detail.id)){
					if(message.isremove !== 1){
						this.list.push(message)
						return this.pageToBottom()
					} 
					// 撤回消息
					let index = this.list.findIndex(item => item.id === message.id)
					if(index != -1) {
						this.list[index].isremove = 1
					}
				}
			})
		},
		destroyed() {
			// 销毁聊天对象
			this.chat.destoryChatObject()
			uni.$off('onMessage', () => {})
		},
		mounted() {
			let statusBarHeight = uni.getSystemInfoSync().statusBarHeight
			this.navBarHeight = statusBarHeight + uni.upx2px(90)
			
			this.pageToBottom()
			
			uni.onKeyboardHeightChange(res => {				
				this.savekeyboardHeight = res.height
				if(this.mode !== 'action' && this.mode !== 'emoticon'){
					this.keyboardHeight = res.height
				}
				
				if(this.keyboardHeight > 0){
					this.pageToBottom()
				}
			})
			
			// 注册发送音频的事件
			this.regSendVoiceEvent((url) => {
				if(!this.unRecord){
					this.send('audio', url, {
						time: this.recordTime
					})
				}
			})
		},
		computed:{
			...mapState({
				chatList: state => state.user.chatList,
				RECORD: state => state.audio.RECORD,
				recordTime: state => state.audio.recordTime,
				chat: state => state.user.chat,
				totalNoreadnum: state => state.user.totalNoreadnum,
				user:state => state.user.user
			}),
			// 当前会话配置信息
			currentChatItem(){
				let index = this.chatList.findIndex(item=>item.id === this.detail.id && item.chat_type === this.detail.chat_type)
				if(index !== -1){
					return this.chatList[index]
				}
				return {}
			},
			// 动态获取菜单高度
			getMenusHeight(){
				let h = 100
				return this.menusList.length * h
			},
			getMenusStyle(){
				return `height:${this.getMenusHeight}rpx`
			},
			// 判断是否操作本人信息
			isdoself(){
				let id = 1
				let user_id = this.propIndex > -1 ? this.list[this.propIndex].user_id : 0
				
				return user_id === id
			},
			// 获取操作菜单
			// menusList(){
			// 	return this.menus.filter(v => {
			// 		if(v.name === '撤回' && !this.isdoself){
			// 			return false
			// 		}
			// 		return true
			// 	})
			// },
			// 聊天区域bottom
			chatBodyBottom(){
				return `bottom:${uni.upx2px(105) + this.keyboardHeight}px;top:${this.navBarHeight}px`
			},
			// 获取操作或表情列表
			emoticonOrActionList(){
				return (this.mode === 'emoticon' || this.mode === 'action') ? this[this.mode+'List'] : []
			},
			// 获取蒙版的位置
			maskBottom(){
				return this.keyboardHeight + uni.upx2px(105)
			},
			// 所有信息的图片地址
			imageList(){
				let arr = []
				this.list.forEach(item => {
					if(item.type == 'emoticon' || item.type == 'image'){
						arr.push(item.data)
					}
				})
				return arr
			}
		},
		watch:{ 
			mode(newVal){
				if(newVal !== 'action' && newVal !== 'emoticon'){
					this.$refs.action.hide()
				}
				if(newVal !== 'text') {
					uni.hideKeyboard()
				}
			}
		},
		methods:{
			...mapMutations([
				'regSendVoiceEvent'
			]),
			init(){
				let total = 20
				let page = Math.ceil(total/8)
				var arr = []
				for (var i = 0; i < page; i++) {
					let start = i*8
					arr[i] = []
					for (var j = 1; j <= 8; j++) {
						let no = start + j
						if(no > 20) continue;
						
						arr[i].push({
							name:"表情" + no,
							icon:"/static/images/extends/pic.png",
							event:"sendEmoticon"
						})
					}
				}
				
				this.emoticonList = arr
			},
			openChatSet(){
				uni.navigateTo({
					url: '../../chat-set/chat-set?params='+JSON.stringify({
						id:this.detail.id,
						chat_type:this.detail.chat_type
					}),
				});
			},
			clickPage(){
				this.mode = ''
			},
			clickInput() {
				this.mode = 'text'
			},
			onInputFocus() {
				this.mode = 'text'
				
				setTimeout(() => {
					this.keyboardHeight = this.savekeyboardHeight
				}, 10)
			},
			// 打开扩展菜单或表情包
			openActionOrEmoticon(mode = 'action') {
				this.mode = mode
				this.$refs.action.show()
				
				uni.hideKeyboard()
				this.keyboardHeight = uni.upx2px(580)
				this.pageToBottom()
			},
			// 回到底部
			pageToBottom(){
				// #ifdef APP-PLUS-NVUE
				let chatItem = this.$refs.chatItem
				let lastIndex = chatItem.length > 0 ? chatItem.length - 1 : 0
				
				if(chatItem[lastIndex]){
					dom.scrollToElement(chatItem[lastIndex], {})
				}
				// #endif
				
				// #ifndef APP-PLUS-NVUE
				setTimeout(() => {
					let lastIndex = this.list.length - 1
					this.scrollIntoView = 'chatItem_' + lastIndex
				}, 300)
				// #endif
			},
			// 长按消息气泡
			long({x,y,index}){
				this.propIndex = index
				let menus = [
					{
						name:'复制',
						event: ''
					},
					{
						name:'发送给朋友',
						event: '',
					},
					{
						name:'收藏',
						event: '',
					},
					{
						name:'删除',
						event: '',
					},
					{
						name:'多选',
						event: '',
					}
				]
				let item = this.list[this.propIndex]
				let isself = this.user.id === item.from_id
				if(isself){
					menus.push({
						name:'撤回',
						event: 'removeChatItem',
					})
				}
				this.menusList = menus
				this.$refs.extend.show(x,y)
			},
			clickEvent(event){
				let item = this.list[this.propIndex]
				
				switch (event) {
					case 'removeChatItem':
						if(this.propIndex > -1) {
							this.chat.recall(item).then(() => {
								item.isremove = 1
							})
						}
						break;
				}
				this.$refs.extend.hide()
			},
			send(type, data = '', options){
				// 组织数据格式
				switch(type){
					case 'text':
						data = this.text
						break;
				}
				let message = this.chat.formatSendData({
					type,
					data,
					options
				})
				
				// 渲染到页面
				let index = this.list.length
				this.list.push(message)
				
				// 监听上传进度
				let onProgress = false
				if((message.type !== 'text' && message.type !== 'emoticon' && message.type !== 'card' && !message.data.startsWith('http://tangzhe123-com'))){
					onProgress = (progress) => {
						console.log('上传进度', progress);
					}
				}
				
				// 发送到服务器
				this.chat.send(message, onProgress).then(res => {
					this.list[index].id = res.id
					this.list[index].sendStatus = 'success'
				}).catch(err => {
					this.list[index].sendStatus = 'fail'
					console.log(err);
				})
				
				if(type === 'text'){
					this.text = ''
				}
				
				this.pageToBottom()
			},
			// 扩展菜单事件
			actionEvent(e) {
				switch (e.event) {
					case 'uploadImage': 
						// 发送到服务器
					
						// 渲染到页面
						uni.chooseImage({
							count:9,
							success: (res) => {
								res.tempFilePaths.forEach(item => {
									this.send('image', item)
								})
							}
						})
						break;
					case 'sendEmoticon':
						this.send('emoticon', e.icon)
						break;
					case 'uploadVideo':
						uni.chooseVideo({
							maxDuration: 10,
							success: (res) => {
								// 发送服务器
								console.log(66666666666, res.tempFilePath);
								this.send('video', res.tempFilePath, {
									poster: ''
								})
								// 渲染到页面
							}
						})
						break;
				}
			},
			previewImage(url){
				uni.previewImage({
					current: url,
					urls: this.imageList,
					indicator: 'default'
				})
			},
			changeVoiceOrText(){
				this.mode = this.mode !== 'audio' ? 'audio' : 'text'
			},
			voiceTouchStart(e){
				this.isRecording = true
				this.unRecord = false
				this.recordingStartY = e.changedTouches[0].screenY
				
				// 开始录音
				this.RECORD.start({
					format: 'mp3'
				})
			},
			voiceTouchMove(e){
				let y = Math.abs(e.changedTouches[0].screenY - this.recordingStartY)
				this.unRecord = y > 80
			},
			voiceTouchEnd(){
				this.isRecording = false
				
				// 停止录音
				this.RECORD.stop()
			},
			voiceTouchCancel(){
				this.isRecording = false
				this.unRecord = true
				
				// 停止录音
				this.RECORD.stop()
			}
		}
	}
</script>

<style>

</style>
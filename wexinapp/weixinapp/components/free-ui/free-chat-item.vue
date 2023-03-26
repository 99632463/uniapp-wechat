<template>
	<div @longpress="long">
		<!-- 时间显示 -->
		<view v-if="showTime" class="flex align-center justify-center pb-4 pt-2">
			<text class="font-sm text-light-muted">{{showTime}}</text>
		</view>
		
		<!-- 撤回消息 -->
		<view ref="isremove" v-if="item.isremove" class="flex align-center justify-center pb-4 pt-10 chat-animate">
			<text class="font-sm text-light-muted">你撤回了一条消息</text>
		</view>
		
		<!-- 气泡 -->
		<view
			v-else
			class="flex justify-start align-start position-relative mb-3"
			:class="isself ? 'justify-end' : 'justify-start'"
		>
			<!-- 好友 -->
			<template v-if="!isself">
				<freeAvatar :size="70" :src="item.avatar" clickType='navigate'></freeAvatar>
				<text 
					v-if="hasLabelClass"
					class="iconfont text-white font-md position-absolute chat-left-icon"
				>
					&#xe609;
				</text>
			</template>
			
			<div 
				class="p-2 rounded" 
				:class="labelClass" 
				style="max-width: 500rpx"
				:style='labelStyle'
			>
				<!-- 文字 -->
				<text v-if="item.type == 'text'" class="font-md">{{item.data}}</text>
				
				<!-- 表情 | 图片 -->
				<freeImage 
					v-else-if="item.type == 'emoticon' || item.type == 'image'" 
					:src='item.data' 
					imageClass="rounded"
					:maxHeight="300"
					:maxWidth="500"
					@click="preview(item.data)"
				/>
				
				<!-- 音频 -->
				<view v-else-if="item.type == 'audio'" class="flex align-center" @click="openAudio">
					<image 
						v-if="isself"
						:src="audioPlaying ? '/static/audio/play.gif' : '/static/audio/audio3.png'" 
						class="mx-1"
						style="width: 50rpx;height: 50rpx"
					>
					</image>
					<text class="font">{{item.options.time}}''</text>
					<image
						v-if="!isself"
						:src="audioPlaying ? '/static/audio/play.gif' : '/static/audio/audio3.png'" 
						class="mx-1"
						style="width: 50rpx;height: 50rpx"
					>
					</image>
				</view>
				
				<!-- 视频 -->
				<view v-else-if="item.type == 'video'" @click="openVideo" class="position-relative rounded">
					<freeImage
						:src='item.options.poster' 
						imageClass="rounded"
						:maxHeight="350"
						:maxWidth="300"
						@load='loadPoster'
					/>
					<text 
						class="iconfont text-white position-absolute" 
						style="font-size: 80rpx;"
						:style="posterIconStyle"
					>
						&#xe737;
					</text>
				</view>
			</div>
			
			<!-- 本人 -->
			<template v-if="isself">
				<text
					v-if="hasLabelClass"
					class="iconfont text-chat-item font-md position-absolute chat-right-icon"
				>
					&#xe640;
				</text>
				<freeAvatar :size="70" :src="item.avatar" clickType='navigate'></freeAvatar>
			</template>
		</view>
	</div>
</template>

<script>
	import freeAvatar from '@/components/free-ui/free-avatar.vue'
	import $T from '@/common/free-lib/time.js'
	import freeImage from '@/components/free-ui/free-image.vue'
	import { mapActions } from 'vuex'
	
	export default {
		components: {
			freeAvatar,
			freeImage
		},
		props: {
			item: Object,
			index: Number,
			// 上一条消息的时间戳
			pretime: [String,Number] 
		},
		data(){
			return {
				innerAudioContext:null,
				audioPlaying: false,
				poster: {
					w: 100,
					h: 100
				}
			}
		},
		computed: {
			isself(){
				let id = 1 // 假设这是本人id
				return this.item.user_id === id
			},
			showTime(){
				return $T.getChatTime(this.item.create_time, this.pretime)
			},
			hasLabelClass() {
				return this.item.type == 'text' || this.item.type == 'audio'
			},
			labelClass(){
				let label = this.hasLabelClass ? 'bg-chat-item mr-3' : 'mr-3'
				return this.isself ? label : 'bg-white ml-3'
			},
			labelStyle() {
				if(this.item.type === 'audio'){
					let time = this.item.options.time || 0
					let width = parseInt(time) / (60 / 500)
					width = width < 150 ? 150 : width
					return `width:${width}rpx`
				}
			},
			posterIconStyle(){
				return `left: ${this.poster.w / 2}px;top: ${this.poster.h / 2}px; transform: translate(-50%, -50%)`
			}
		},
		mounted() {
			// 注册全局事件
			if(this.item.type === 'audio'){
				this.audioOn(this.onPlayAudio)
			}
			
			// #ifdef APP-PLUS-NVUE
			this.$watch('item.isremove', (newVal, oldVal) => {
				if(newVal){
					const animation = weex.requireModule('animation')
					this.$nextTick(() => {
						animation.transition(this.$refs.isremove, {
							 styles: {
								opacity: 1
							 },
							 duration: 100, //ms
							 timingFunction: 'ease',
						 }, function () {
							 console.log('动画执行结束');
						})
					})
				}
			})
			// #endif
		},
		destroyed() {
			if(this.item.type === 'audio'){
				this.audioOff(this.onPlayAudio)
			}
			
			if(this.innerAudioContext){
				this.innerAudioContext.destroy()
				this.innerAudioContext = null
			}
		},
		methods: {
			...mapActions([
				'audioOn',
				'audioEmit',
				'audioOff'
			]),
			// 监听播放音频全局事件
			onPlayAudio(index){
				if(this.innerAudioContext){
					if(this.index !== index){
						this.innerAudioContext.stop()
					}
				}
			},
			long(e){
				let x = 0,y = 0
				
				// #ifdef APP-PLUS-NVUE
				if(Array.isArray(e.changedTouches) && e.changedTouches.length){
					x = e.changedTouches[0].screenX
					y = e.changedTouches[0].screenY
				}
				// #endif
				
				// #ifdef MP-WEIXIN
				x = e.detail.x
				y = e.detail.y
				// #endif
				
				this.$emit('long',{
					x,
					y,
					index: this.index
				})
			},
			preview(url){
				this.$emit('preview',url)
			},
			openAudio(){
				// 通知停止其它音频
				this.audioEmit(this.index)
				
				if(!this.innerAudioContext) {
					this.innerAudioContext = uni.createInnerAudioContext()
					this.innerAudioContext.src = this.item.data
					this.innerAudioContext.play()
					
					// 监听播放
					this.innerAudioContext.onPlay(() => {
						this.audioPlaying = true
					})
					// 监听暂停
					this.innerAudioContext.onPause(() => {
						this.audioPlaying = false
					})
					// 监听停止
					this.innerAudioContext.onStop(() => {
						this.audioPlaying = false
					})
					// 监听失败
					this.innerAudioContext.onError(() => {
						this.audioPlaying = false
					})
				} else {
					this.innerAudioContext.stop()
					this.innerAudioContext.play()
				}
			},
			loadPoster({w, h}) {
				this.poster.w = w
				this.poster.h = h
			},
			openVideo(){
				uni.navigateTo({
					url: '/pages/chat/video/video?url='+this.item.data,
				});
			}
		}
	}
</script>
ss
<style>
	.chat-left-icon{
		left: 80rpx;
		top: 20rpx;
	}
	.chat-right-icon{
		right: 80rpx;
		top: 20rpx;
	}
	.chat-animate{
		/* #ifdef APP-PLUS-NVUE */
		opacity: 0;
		/* #endif */
	}
</style>
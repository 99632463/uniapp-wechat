<template>
	<!-- 弹出层 -->
	<view style="z-index: 9999;overflow: hidden;" v-if="status">
		<!-- 蒙版 -->
		<div v-if="mask" @click='hide' class="position-fixed top-0 left-0 right-0 bottom-0" :style="getMaskColor"></div>
		<!-- 弹出框内容 -->
		<div ref="popup" class="position-fixed free-animated" :class='getBodyClass' :style='getBodyStyle'>
			<slot></slot>
		</div>
	</view>
</template>

<script>
	// #ifdef APP-PLUS-NVUE
	const animation = weex.requireModule('animation')
	// #endif
	
	export default {
		props: {
			maskColor:Boolean,
			mask:{type:Boolean,default:true},
			bottom:{type:Boolean,default:false},
			// 弹出层内容宽度
			bodyWidth:{
				type:Number,
				default:0
			},
			// 弹出层内容高度
			bodyHeight:{
				type:Number,
				default:0
			},
			bodyBgColor: {
				type: String,
				default: 'bg-white'
			},
			transformOrigin: {
				type: String,
				default: 'left top'
			},
			// 底部非原生tabbar的高度
			tabbarHeight: {
				type: Number,
				default: 0
			},
			center: Boolean
		},
		data(){
			return {
				status: false,
				x:-1,
				y:-1,
				maxX:0,
				maxY:0,
			}
		},
		mounted() {
			const {windowWidth, windowHeight} = uni.getSystemInfoSync()
			this.maxX = windowWidth - uni.upx2px(this.bodyWidth)
			this.maxY = windowHeight - uni.upx2px(this.bodyHeight) - uni.upx2px(this.tabbarHeight)
		},
		computed: {
			getMaskColor(){
				let i = this.maskColor ? 0.5 : 0
				return `background-color:rgba(0,0,0,${i})`
			},
			getBodyClass(){
				if(this.center){
					return `left-0 right-0 bottom-0 top-0 flex align-center justify-center`
				}
				let bottom = this.bottom ? 'left-0 right-0 bottom-0' : 'rounded border'
				return `${this.bodyBgColor} ${bottom}`
			},
			getBodyStyle(){
				let left = this.x > -1 ? `left:${this.x}px;` : ``
				let top = this.y > -1 ? `top:${this.y}px;` : ``
				
				this.bodyWidth ? `width:${this.bodyWidth}rpx;` : ''
				this.bodyHeight ? `height:${this.bodyHeight}rpx;` : ''
 				
				return left + top + `${this.bodyWidth}${this.bodyHeight}`
			}
		},
		methods: {
			show(x = -1, y = -1){
				if(this.status) return
				
				this.x = x > this.maxX ? this.maxX - 21 : x
				this.y = y > this.maxY ? this.maxY - 21 : y
				this.status = true
				
				// #ifdef APP-PLUS-NVUE
				this.$nextTick(() => {
					animation.transition(this.$refs.popup, {
						 styles: {
							transform: 'scale(1,1)',
							transformOrigin: this.transformOrigin,
							opacity: 1
						 },
						 duration: 100, //ms
						 timingFunction: 'ease',
					 }, function () {
						 console.log('动画执行结束');
					})
				})
				// #endif
			},
			hide(){
				this.$emit('hide')
				
				// #ifdef APP-PLUS-NVUE
				animation.transition(this.$refs.popup, {
					 styles: {
						transform: 'scale(0,0)',
						transformOrigin: this.transformOrigin,
						opacity: 0
					 },
					 duration: 100, //ms
					 timingFunction: 'ease',
				 }, () => {
					 this.status = false
				})
				// #endif
				
				// #ifndef APP-PLUS-NVUE
				this.status = false
				// #endif
			}
		}
	}
</script>

<style scoped>
	.free-animated{
		/* #ifdef APP-PLUS-NVUE */
		transform: scale(0,0);
		opacity: 0;
		/* #endif */
	}
</style>
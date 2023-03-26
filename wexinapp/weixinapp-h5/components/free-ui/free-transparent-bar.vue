<template>
	<view>
		<view class="fixed-top" :style="navBarStyle">
			<view :style="{height: `${statusBarHeight}px`}"></view>
			<view class="w-100 flex align-center justify-between" style="height: 90rpx;">
				<view class="flex align-center">
					<view
						class="flex align-center justify-center" 
						hover-class="bg-hover-light" 
						style="width: 90rpx; height: 90rpx;"
						@click='back'
					>
						<text :style="buttonStyle" class="iconfont font-md">{{'\ue60d'}}</text>
					</view>
					<text class="font-md ml-3" v-if="title">
						{{title}}
					</text>
				</view>
				<view class="flex align-center" >
					<view
						class="flex align-center justify-center" 
						hover-class="bg-hover-light" 
						style="width: 90rpx; height: 90rpx;"
						@click="$emit('clickRight')"
					>
						<text :style="buttonStyle" class="iconfont font-md">{{'\ue682'}}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import freeIconButton from './free-icon-button.vue'

	export default {
		components: {
			freeIconButton,
		},
		props: {
			title: {
				type: [String,Boolean],
				default: false,
			},
			scrollTop:{
				type:[Number,String],
				default:0
			}
		},
		data() {
			return {
				statusBarHeight: 0,
				navBarHeight: 0,
			}
		},
		mounted() {
			this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight
			this.navBarHeight = this.statusBarHeight + uni.upx2px(90)
		},
		computed: {
			// 变化 0 - 1
			changeNumber(){
				let start = uni.upx2px(500)
				let end = uni.upx2px(620)
				let H = end - start
				let num = 0
				if(this.scrollTop > start){
					num = (this.scrollTop - start) / H
				}
				return num > 1 ? 1 : num
			},
			navBarStyle(){
				return `background-color: rgba(255,255,255,${this.changeNumber})`
			},
			buttonStyle(){
				if(this.changeNumber > 0){
					return `color:rgba(0,0,0,${this.changeNumber});`
				}
				return 'color:#FFFFFF;'
			}
		},
		methods:{
			back(){
				uni.navigateBack({
					delta: 1
				});
			}
		}
	}
</script>

<style>
</style>

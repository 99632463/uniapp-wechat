<template>
	<view>
		<video 
			:src="url" 
			controls 
			autoplay 
			class="position-relative" 
			style="width: 750rpx;" 
			:style="'height:'+windowHeight+'px'"
			@ended="back"
		>
		</video>
		<view 
			class="position-absolute rounded flex align-center justify-center test" 
			style="width: 80rpx;height: 80rpx; left: 20px; top: 50px; background: rgba(255,255,255,0.3);"
			@click="back"
		>
			<text class="iconfont text-white font-lg">&#xe620;</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				url: '',
				windowHeight: 500
			}
		},
		onLoad(e) {
			if(e.url === ''){
				this.back()
				return uni.showToast({
					title: '非法视频',
					icon: 'none'
				})
			}
			this.url = e.url
			this.windowHeight = uni.getSystemInfoSync().windowHeight
		},
		methods: {
			back(){
				uni.navigateBack({
					delta: 1
				});
				this.url = ''
			}
		}
	}
</script>

<style>

</style>

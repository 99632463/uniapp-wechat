<template>
	<view class="flex flex-wrap">
		<view 
			v-for="(item,index) in imageList" 
			:key="index" 
			style="width: 230rpx;" 
			class="flex align-center justify-center mb-2 position-relative"
		>
			<image 
				class="rounded bg-light" 
				style="width: 210rpx;height: 210rpx;" 
				:src='item'
				@click="preview(item)"
			>
			</image>
			<view 
				class="flex align-center justify-center rounded-circle" 
				style="width: 60rpx;height: 60rpx;position: absolute;top: 10rpx;right: 0;background-color: rgba(0,0,0,0.5);" 
				@click="deleteImage(item)"
			>
				<text class="iconfont text-white font-small">&#xe620;</text>
			</view>
		</view>
		<view @click="chooseImage" v-if="imageList.length < 9" style="width: 230rpx;" class="flex align-center justify-center">
			<view class="flex align-center justify-center rounded bg-light" style="width: 210rpx;height: 210rpx;">
				<text class="text-light-muted" style="font-size: 100rpx;">+</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			data:{
				type:Array,
				default: () => []
			}
		},
		data(){
			return {
				imageList: []
			}
		},
		mounted() {
			this.imageList = this.data
		},
		methods:{
			chooseImage(){
				uni.chooseImage({
					count:9 - this.imageList.length,
					sizeType:['compressed'],
					success: res => {
						this.imageList = [...this.imageList, ...res.tempFilePaths]
						this.$emit('update', this.imageList)
					}
				})
			},
			preview(item){
				uni.previewImage({
					current:item,
					urls:this.imageList
				})
			},
			deleteImage(item){
				uni.showModal({
					content: '是否要删除该图片？',
					success:(res)=>{
						if (res.confirm) {
							let index =	this.imageList.findIndex(url=>url === item)
							if(index !== -1){
								this.imageList.splice(index,1)
								this.$emit('update',this.imageList)
							}
						}
					}
				});
			}
		}
	}
</script>

<style>
</style>
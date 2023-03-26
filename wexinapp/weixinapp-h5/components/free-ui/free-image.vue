<template>
	<image
		:src='src' 
		lazy-load 
		:style="imageStyle"
		:class="imageClass"
		@click="$emit('click')"
		@load="loadImage"
		class="bg-hover-light"
	></image>
</template>

<script>
	export default {
		props: {
			src: {
				type: String,
				default: ''
			},
			imageClass: {
				type: String,
				default: ''
			},
			maxWidth: {
				type: Number,
				default: 500  // rpx
			},
			maxHeight: {
				type: Number,
				default: 350  // rpx
			}
		},
		data(){
			return {
				w:100,
				h:100
			}
		},
		computed:{
			imageStyle(){
				return `width:${this.w}px;height:${this.h}px;`
			}
		},
		methods:{
			loadImage(e){
				let w = e.detail.width
				let h = e.detail.height
				// 最大宽度
				let maxW = uni.upx2px(this.maxWidth)
				let maxH = uni.upx2px(this.maxHeight)
				
				if (h <= maxH) {
					this.w = w <= maxW ? w : maxW
					this.h = h
					return
				}
				let w2 = maxH * (w / h)
				this.w = w2 <= maxW ? w2 : maxW
				this.h = maxH
				this.$emit('load', {
					w: this.w,
					h: this.h
				})
			}
		}
	}
</script>

<style>
</style>
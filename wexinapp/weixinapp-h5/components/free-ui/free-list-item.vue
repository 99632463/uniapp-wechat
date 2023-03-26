<template>
	<view class="bg-white flex align-stretch" hover-class="bg-hover-light" @click="$emit('click')">
		<view v-if="showLeftIcon" class="flex align-center justify-center py-2 pl-3">
			<slot name="icon"></slot>
			<image v-if='cover' :src='cover' :style="coverStyle"></image>
		</view>
		<view :class="border ? 'border-bottom' : ''" class="flex-1 flex align-center justify-between pr-3 py-3 pl-3">
			<slot>
				<text class="font-md text-dark">{{title}}</text>
			</slot>
			<view class="flex align-center" v-if="showRight">
				<slot name="right"></slot>
				<text v-if="showRightIcon" class="iconfont text-light-muted font-md">&#xe60c;</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			cover: {
				type:String,
				default: ''
			},
			coverSize: {
				type:[Number,String],
				default: 75
			},
			title:String,
			showRight: Boolean,
			showLeftIcon: {
				type: Boolean,
				default: true
			},
			showRightIcon: {
				type: Boolean,
				default: true
			},
			border: {
				type: Boolean,
				default: true
			}
		},
		computed:{
			coverStyle(){
				return `width: ${this.coverSize}rpx;height: ${this.coverSize}rpx;`
			}
		}
	}
</script>

<style>
</style>
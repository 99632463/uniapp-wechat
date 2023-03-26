<template>
	<view :class="item.istop ? 'bg-light' : 'bg-white'" hover-class="bg-hover-light">
		<div class="flex align-stretch" @click="onClick" @longpress="long">
			<view class="flex align-center justify-center position-relative" style="width: 145rpx;">
				<freeAvatar :src='item.avatar' size="92"/>
				<freeBadge :value="item.noreadnum" badgeClass="position-absolute" badgeStyle="right:15rpx;top:15rpx"></freeBadge>
			</view>
			<view class="flex flex-column border-bottom flex-1 py-3 pr-3 border-light-secondary">
				<view class="flex align-center justify-between mb-1">
					<text class="font-md">{{item.nickname}}</text>
					<text class="font-sm text-light-muted">{{item.update_time | formatTime}}</text>
				</view>
				<text class="font text-ellipsis text-light-muted">{{item.data}}</text>
			</view>
		</div>
	</view>
</template>

<script>
	import freeBase from '@/common/mixin/free-base.js';
	import freeAvatar from '@/components/free-ui/free-avatar.vue'
	import freeBadge from '@/components/free-ui/free-badge.vue'
	
	export default {
		components: {
			freeAvatar,
			freeBadge
		},
		mixins: [freeBase],
		props: {
			item:Object,
			index: Number
		},
		methods: {
			onClick(){
				uni.navigateTo({
					url: '/pages/chat/chat/chat',
				});
			},
			long(e){
				let x = 0,y = 0;
				
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
			}
		}
	}
</script>

<style>
</style>
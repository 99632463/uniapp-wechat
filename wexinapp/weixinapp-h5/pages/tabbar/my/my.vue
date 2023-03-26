<template>
	<view class="page">
		<freeNavBar bgColor="bg-white">
			<freeIconButton slot='right' :icon="'\ue6ed'"></freeIconButton>
		</freeNavBar>
	
		<freeListItem 
			@click="open('my/userinfo/userinfo')" 
			:cover="user.avatar || '/static/video/demo.jpg'" 
			:title="nickname" 
			showRight 
			coverSize="120"
		>
			<view class="flex flex-column">
				<text class="text-dark font-lg font-weight-bold">{{nickname}}</text>
				<text class="text-light-muted font-md mt-2">仿微信号：{{user.username}}</text>
			</view>
			<view slot='right'>
				<text class="iconfont font-md text-light-muted">&#xe614;</text>
			</view>
		</freeListItem>
		
		<freeDivider />
		
		<freeListItem title="支付" showRight>
			<text slot='icon' class="iconfont font-lg py-1">&#xe66c;</text>
		</freeListItem>
		
		<freeDivider />
		
		<freeListItem title="收藏" showRight @click="open('my/fava/fava')">
			<text slot='icon' class="iconfont font-lg py-1">&#xea2d;</text>
		</freeListItem>
		<freeListItem title="相册" showRight @click="open('find/moments/moments')">
			<text slot='icon' class="iconfont font-lg py-1">&#xe608;</text>
		</freeListItem>
		<freeListItem title="表情" showRight>
			<text slot='icon' class="iconfont font-lg py-1">&#xe605;</text>
		</freeListItem>
		
		<freeDivider />
		
		<freeListItem title="设置" showRight @click="open('my/setting/setting')">
			<text slot='icon' class="iconfont font-lg py-1">&#xe612;</text>
		</freeListItem>
	</view>
</template>

<script>
	import freeNavBar from '@/components/free-ui/free-nav-bar.vue'
	import freeIconButton from '@/components/free-ui/free-icon-button.vue'
	import freeListItem from '@/components/free-ui/free-list-item.vue'
	import freeDivider from '@/components/free-ui/free-divider.vue'
	import auth from '@/common/mixin/auth.js'
	import { mapState } from 'vuex'
	
	export default {
		mixins: [auth],
		components: {
			freeNavBar,
			freeListItem,
			freeDivider,
			freeIconButton
		},
		data() {
			return {
			}
		},
		computed:{
			...mapState({
				user: state => state.user.user
			}),
			nickname(){
				return this.user.nickname || this.user.username
			}
		},
		methods: {
			open(path){
				uni.navigateTo({
					url: '/pages/'+path
				});
			},
		}
	}
</script>

<style>
	
</style>

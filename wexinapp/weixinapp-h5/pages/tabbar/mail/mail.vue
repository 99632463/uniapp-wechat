<template>
	<view>
		<freeNavBar title='通讯录'></freeNavBar>
		
		<!-- 通讯录列表 -->
		<scroll-view 
			:style="'height:'+scrollHeight+'px'"
			scroll-y
			:scroll-into-view="scrollInto"
		>
			<freeListItem
				:showRight='item.title == "新的朋友" && applyCount > 0'
				id="freeListItem"
				v-for="(item,index) in topList" 
				:key="index + Math.random()" 
				:cover="item.cover" 
				:title="item.title" 
				@click='navigate(item.path)'
			>
				<freeBadge v-if="applyCount > 0" slot='right' :value="applyCount"></freeBadge>
			</freeListItem>
			<view v-for="(item,index) in list" :key="index" :id="'item-'+item.title">
				<view v-if="item.list.length" class="py-2 px-3 border-bottom bg-light">
					<text class="font-md text-dark">{{item.title}}</text>
				</view>
				<freeListItem
					v-for="(item2,index2) in item.list" 
					:key="index2" 
					:cover="item2.avatar || '/static/images/userpic.png'" 
					:title="item2.name" 
					@click='navigate("mail/user-base/user-base?user_id="+item2.user_id)'
				/>
			</view>
		</scroll-view>
		
		<!-- 侧边导航栏 -->
		<view 
			class="position-fixed right-0 bottom-0 right-0 bg-light flex flex-column" 
			style="width: 50rpx;" 
			:style="'top:'+top+'px'"
			@touchstart="touchstart"
			@touchmove="touchmove"
			@touchend="touchend"
		>
			<view v-for="(item,index) in list" :key="index" class="flex-1 flex align-center justify-center">
				<text class="font-sm text-muted">{{item.title}}</text>
			</view>
		</view>
		
		<view v-if="this.current" class="position-fixed rounded-circle bg-light border flex align-center justify-center" :style="'top:'+modalTop+'px'" style="width: 150rpx; height: 150rpx;left: 300rpx;">
			<text class="font-lg">{{current}}</text>
		</view>
	</view>
</template>

<script>
	import freeNavBar from '@/components/free-ui/free-nav-bar.vue'
	import freeListItem from '@/components/free-ui/free-list-item.vue'
	import freeBadge from '@/components/free-ui/free-badge.vue'
	import auth from '@/common/mixin/auth.js'
	import { mapState } from 'vuex'
	
	export default {
		mixins: [auth],
		components: {
			freeNavBar,
			freeListItem,
			freeBadge
		},
		data() {
			return {
				current: '',
				top: 0,
				scrollHeight: 0,
				scrollInto: '',
				topList: [
					{
						title:'新的朋友',
						cover:'/static/images/mail/friend.png',
						path: 'mail/apply-list/apply-list'
					},
					{
						title:'群聊',
						cover:'/static/images/mail/group.png',
						path: 'mail/group-list/group-list'
					},
					{
						title:'标签',
						cover:'/static/images/mail/tag.png',
						path: ''
					}
				],
			}
		},
		onLoad() {
			let res = uni.getSystemInfoSync()
			this.top = res.statusBarHeight + uni.upx2px(90)
			this.scrollHeight = res.windowHeight - this.top
			
			this.$store.dispatch('getMailList')
		},
		computed:{
			...mapState({
				applyCount: state => state.user.apply.count,
				list: state => state.user.mailList
			}),
			modalTop(){
				return (this.scrollHeight - uni.upx2px(150)) / 2
			},
			// 每个索引的高度
			itemHeight(){
				let count = this.list.length
				if(count < 1){
					count = 0
				}
				return this.scrollHeight / count
			}
		},
		methods: {
			touchstart(e){
				this.changeScrollInto(e)
			},
			touchmove(e){
				this.changeScrollInto(e)
			},
			touchend(){
				this.current = ''
			},
			changeScrollInto(e){
				let y = e.changedTouches[0].pageY
				// #ifdef MP
				y = y - this.top
				// #endif
				let index = Math.floor(y / this.itemHeight)
				const item = this.list[index]
				if(item){
					this.scrollInto = 'item-' + item.letter
					this.current = item.letter;
				}
			}
		}
	}
</script>

<style>
	
</style>

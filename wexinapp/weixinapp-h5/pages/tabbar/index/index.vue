<template>
	<view>
		<freeNavBar title='仿微信' :noreadnum="totalNoreadnum">
		</freeNavBar>
		
		<!-- 置顶列表 -->
		<block v-for="(item,index) in list" :key="index">
			<freeMediaList v-if="item.istop" :item="item" :index="index" @long='long'/>
		</block>
		
		<!-- 非置顶列表 -->
		<block v-for="(item,index) in list" :key="index">
			<freeMediaList v-if="!item.istop" :item="item" :index="index" @long='long'/>
		</block>
		
		<!-- 弹出层 -->
		<freePopup ref="extend" :bodyWidth="240" :bodyHeight="getMenusHeight">
			<view class="flex flex-column" style="width: 240rpx;" :style="getMenusStyle">
				<view v-for="(item,index) in menus" :key="index" @click="clickEvent(item.event)" class="flex-1 flex align-center" hover-class="bg-hover-light">
					<text class="font-md pl-3">{{item.name}}</text>
				</view>
			</view>
		</freePopup>
	</view>
</template>

<script>
	import freeNavBar from '@/components/free-ui/free-nav-bar.vue'
	import freeMediaList from '@/components/free-ui/free-media-list.vue'
	import freePopup from '@/components/free-ui/free-popup.vue'
	import $U from '@/common/free-lib/util.js';
	import auth from '@/common/mixin/auth.js'
	import { mapState } from 'vuex'
	
	export default {
		mixins: [auth],
		components: {
			freeNavBar,
			freeMediaList,
			freePopup
		},
		data() {
			return {
				menus: [
					{
						name:'取消置顶',
						event: 'setTop'
					},
					{
						name:'删除该聊天',
						event: 'delChat'
					}
				],
				propIndex: -1
			}
		},
		onLoad() {
			
		},
		computed:{
			...mapState({
				list: state => state.user.chatList,
				totalNoreadnum: state => state.user.totalNoreadnum,
			}),
			// 动态获取菜单高度
			getMenusHeight(){
				let h = 100
				return this.menus.length * h
			},
			getMenusStyle(){
				return `height:${this.getMenusHeight}rpx`
			}
		},
		methods: {
			long({x, y, index}){
				this.propIndex = index
				// 拿到当前会话对象
				let item = this.list[index]
				this.menus[0].name = item.istop ? '取消置顶' : '设为置顶'
				
				this.$refs.extend.show(x,y)
			},
			clickEvent(event){
				switch (event){
					case 'setTop':
						this.setTop()
						break;
					case 'delChat':
						this.delChat()
						break;
				}
				
				this.$refs.extend.hide()
			},
			setTop(){
				let item = this.list[this.propIndex]
				item.istop = !item.istop
			},
			delChat(){
				this.list.splice(this.propIndex, 1)
			}
		}
	}
</script>

<style>
	
</style>

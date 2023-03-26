<template>
	<view>
		<free-nav-bar title="选择" showBack :showRight="true">
			<free-main-button :name="buttonText" slot="right" @click='submit'></free-main-button>
		</free-nav-bar>
		
		<!-- 通讯录列表 -->
		<scroll-view 
			:style="'height:'+scrollHeight+'px'"
			scroll-y
			:scroll-into-view="scrollInto"
		>
			<view v-for="(item,index) in list" :key="index" :id="'item-'+item.title">
				<view v-if="item.list.length" class="py-2 px-3 border-bottom bg-light">
					<text class="font-md text-dark">{{item.title}}</text>
				</view>
				<freeListItem
					showRight
					:showRightIcon="false"
					v-for="(item2,index2) in item.list" 
					:key="index2" 
					:cover="item2.avatar || '/static/images/userpic.png'" 
					:title="item2.name" 
					@click="selectItem(item2)"
				>
					<view slot="right" style="width: 40rpx;height: 40rpx;"
						class="border rounded-circle flex align-center justify-center mr-4">
						<view v-if="item2.checked" style="width: 30rpx;height: 30rpx;" class="main-bg-color rounded-circle"></view>
					</view>
				</freeListItem>
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
	import freeMainButton from '@/components/free-ui/free-main-button.vue';
	import { mapState } from 'vuex'
	import $H from '@/common/free-lib/request.js';
	
	export default {
		components: {
			freeNavBar,
			freeListItem,
			freeMainButton
		},
		data() {
			return {
				selectList: [],
				current: '',
				top: 0,
				scrollHeight: 0,
				scrollInto: '',
				type: ''
			}
		},
		onLoad(e) {
			let res = uni.getSystemInfoSync()
			this.top = res.statusBarHeight + uni.upx2px(90)
			this.scrollHeight = res.windowHeight - this.top
			
			if(e.type){
				this.type = e.type
			}
			
			this.$store.dispatch('getMailList')
		},
		computed:{
			...mapState({
				list:state=>state.user.mailList
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
			},
			selectCount(){
				return this.selectList.length
			},
			buttonText(){
				let text = '发送'
				if(this.type === 'createGroup'){
					text = '创建群组'
				}
				return text + ' ('+this.selectCount+')'
			}
		},
		methods: {
			submit(){
				if(this.type !== 'see' && this.selectCount === 0){
					return uni.showToast({
						title: '请先选择',
						icon: 'none'
					});
				}
				
				switch(this.type){
					case 'createGroup': // 创建群组
						$H.post('/group/create',{
							ids:this.selectList.map(item=>item.user_id)
						}).then(res=>{
							uni.showToast({
								title: '创建群聊成功',
								icon: 'none'
							});
							uni.navigateBack({
								delta: 1
							});
						})
						break;
				}
			},
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
					this.scrollInto = 'item-' + item.title
					this.current = item.title;
				}
			},
			selectItem(item){
				if(!item.checked && this.selectCount === 9){ 
					// 选中|限制选中数量
					return uni.showToast({
						title: '最多选中 9 个',
						icon: 'none'
					});
				}
				item.checked = !item.checked
				
				if(item.checked){
					this.selectList.push(item)
				} else{
					let index = this.selectList.findIndex(v => v === item)
					if(index > -1){
						this.selectList.splice(index, 1)
					}
					this.selectList.splice(index, 1)
				}
			}
		}
	}
</script>

<style>
	
</style>

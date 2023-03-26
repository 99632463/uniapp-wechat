<template>
	<view>
		<view class="fixed-top" :class="bgColor">
			<view :style="{height: `${statusBarHeight}px`}"></view>
			<view class="w-100 flex align-center justify-between" style="height: 90rpx;">
				<view class="flex align-center">
					<!-- 返回按钮 -->
					<!-- #ifndef MP -->
					<free-icon-button v-if="showBack" @click="back"
					:icon="'\ue60d'"></free-icon-button>
					<!-- #endif -->
					<slot>
						<text class="font-md ml-3" v-if="title">
							{{getTitle}}
						</text>
					</slot>
				</view>
				<view class="flex align-center" v-if="showRight">
					<slot name="right">
						<freeIconButton @click='search' :icon="'\ue6e3'">
						</freeIconButton>
						<freeIconButton @click='openExtend' :icon="'\ue682'">
						</freeIconButton>
					</slot>
				</view>
			</view>
		</view>
		<!-- 占位 -->
		<view v-if="fixed" :style="fixedStyle"></view>
		
		<!-- 扩展菜单 -->
		<freePopup v-if="showRight" ref="extend" :bodyWidth="320" :bodyHeight="525" bodyBgColor='bg-dark' transformOrigin='right top'>
			<view class="flex flex-column" style="width: 320rpx;height: 525rpx;">
				<view 
					v-for="(item,index) in menus" 
					:key="index"
					 @click="clickEvent(item.event)" 
					 class="flex-1 flex align-center" 
					 hover-class="bg-hover-dark"
					>
					<text class="iconfont pl-3 pr-2 font-md text-white">{{item.icon}}</text>
					<text class="font-md text-white">{{item.name}}</text>
				</view>
			</view>
		</freePopup>
	</view>
</template>

<script>
	import freeIconButton from './free-icon-button.vue'
	import freePopup from '@/components/free-ui/free-popup.vue'

	export default {
		components: {
			freeIconButton,
			freePopup
		},
		props: {
			showBack:Boolean,
			backEvent:{
				type:Boolean,
				default:true
			},
			title: {
				type: [String,Boolean],
				default: false,
			},
			fixed: {
				type: Boolean,
				default: true
			},
			noreadnum: {
				type:Number ,
				default: 0
			},
			showRight:{
				type: Boolean,
				default: true
			},
			bgColor: {
				type: String,
				default: 'bg-light'
			}
		},
		data() {
			return {
				statusBarHeight: 0,
				navBarHeight: 0,
				menus: [
					{
						name:'发起群聊',
						event: '',
						icon: '\ue633'
					},
					{
						name:'添加好友',
						event: '',
						icon: '\ue65d'
					},
					{
						name:'扫一扫',
						event: '',
						icon: '\ue614'
					},
					{
						name:'收付款',
						event: '',
						icon: '\ue66c'
					},
					{
						name:'帮助与反馈',
						event: '',
						icon: '\ue61c'
					}
				],
			}
		},
		mounted() {
			this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight
			this.navBarHeight = this.statusBarHeight + uni.upx2px(90)
		},
		computed: {
			fixedStyle() {
				return `height:${this.navBarHeight}px`
			},
			getTitle(){
				let noreadnum = this.noreadnum > 0 ? '('+this.noreadnum+')' : ''
				return this.title + noreadnum
			},
		},
		methods:{
			search(){
				uni.navigateTo({
					url: '/pages/common/search/search',
				})
			},
			openExtend(){
				this.$refs.extend.show(uni.upx2px(415),uni.upx2px(150))
			},
			back(){
				if(this.backEvent){
					return uni.navigateBack({
						delta: 1
					});
				}
				this.$emit('back')
			}
		}
	}
</script>

<style>
</style>

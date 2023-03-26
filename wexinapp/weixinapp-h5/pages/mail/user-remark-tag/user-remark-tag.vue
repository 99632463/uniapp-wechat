<template>
	<view class="page">
		<freeNavBar title='设置备注和标签' showBack bgColor='bg-white'>
			<freeMainButton slot='right' name="完成" @click="submit"></freeMainButton>
		</freeNavBar>
		
		<view class="flex flex-column">
			<text class="font-sm text-secondary px-3 py-2">备注名</text>
			<input v-model="nickname" type="text" class="font-md border bg-white px-3" style="height: 100rpx;" placeholder="备注名" />
		</view>
		
		<view class="flex flex-column">
			<text class="font-sm text-secondary px-3 py-2">标签</text>
			<view 
				style="height: 100rpx;" 
				class="border bg-white px-3 flex align-center flex-wrap pt-3 pb-2"
				@click="openTagSet"
			>
				<view 
					v-for="(item,index) in tagList"
					:key="index"
					class="border border-main rounded-circle px-2 py-1 mr-1 mb-1"
				>
					<text class="main-text-color font">{{item}}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import freeNavBar from '@/components/free-ui/free-nav-bar.vue'
	import freeMainButton from '@/components/free-ui/free-main-button.vue'
	import auth from '@/common/mixin/auth.js'
	import $H from '@/common/free-lib/request.js';
	
	export default {
		mixins: [auth],
		components: {
			freeNavBar,
			freeMainButton
		},
		data() {
			return {
				tagList:[],
				nickname: '',
				id:0
			}
		},
		onLoad(e) {
			let params = JSON.parse(e.params)
			this.id = params.user_id
			this.nickname = params.nickname
			this.tagList = params.tags == '' ? [] : params.tags.split(',')
			
			uni.$on('updateTag', e => {
				this.tagList = e
			})
		},
		beforeDestroy() {
			uni.$off('updateTag')
		},
		methods: {
			openTagSet(){
				uni.navigateTo({
					url: '/pages/mail/user-tag-set/user-tag-set?detail='+JSON.stringify(this.tagList),
				});
			},
			submit() {
				$H.post('/friend/setremarktag/'+this.id,{
					nickname:this.nickname,
					tags:this.tagList.join(',')
				}).then(res=>{
					uni.showToast({
						title: '修改成功',
						icon: 'none'
					});
					uni.navigateBack({
						delta: 1
					});
				})
			}
		}
	}
</script>

<style>

</style>

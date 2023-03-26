<template>
	<view style="background-color: #ededed;">
		<freeNavBar title='聊天信息' showBack :showRight='false' />
		<view class="flex flex-wrap py-3 bg-white">
			<view v-if="detail.chat_type === 'user'" class="flex flex-column align-center justify-center mb-2" style="width: 150rpx;">
				<freeAvatar :src="detail.avatar || '/static/images/userpic.png'" size="110"></freeAvatar>
				<text class="font text-muted mt-1">{{detail.name}}</text>
			</view>
			<view v-else class="flex flex-column align-center justify-center mb-2" style="width: 150rpx;" v-for="(item,index) in list" :key="index">
				<free-avatar :src="item.avatar || '/static/images/userpic.png'" size="110"></free-avatar>
				<text class="font text-muted mt-1">{{item.name}}</text>
			</view>
			<view @click="openMail" class="flex flex-column align-center justify-center mb-2" style="width: 150rpx;">
				<view class="flex align-center justify-center border" hover-class="bg-light" style="width: 120rpx; height: 120rpx;">
					<text class="text-light-muted" style="font-size: 100rpx;">+</text>
				</view>
			</view>
		</view>
		
		<view v-if="detail.chat_type === 'group'">
			<freeDivider></freeDivider>
			<freeListItem
				title="群聊名称" 
				showRight
				:showLeftIcon='false'
				@click='updateName'
			>
				<text slot='right' class="font text-muted">{{detail.name}}</text>
			</freeListItem>
			<freeListItem
				title="群二维码" 
				showRight
				:showLeftIcon='false'
				@click='openCode'
			>
				<text slot='right' class="iconfont font-md text-light-muted">&#xe647;</text>
			</freeListItem>
			<freeListItem
				title="群公告" 
				showRight
				:showLeftIcon='false'
				@click='openGroupRemark'
			>
			</freeListItem>
		</view>
		
		<freeDivider></freeDivider>
		
		<freeListItem
			title="查找聊天记录" 
			showRight
			:showLeftIcon='false'
		>
		</freeListItem>
		
		<freeDivider></freeDivider>
		
		<freeListItem
			title="消息免打扰" 
			showRight
			:showLeftIcon='false'
			:showRightIcon='false'
		>
			<switch @change="updateChatItem($event,'nowarn')" :checked="detail.nowarn" slot='right' color="#08c060" />
		</freeListItem>
		<freeListItem
			title="置顶聊天" 
			showRight
			:showLeftIcon='false'
			:showRightIcon='false'
		>
			<switch :checked="detail.istop" @change="updateChatItem($event,'istop')" slot='right' color="#08c060" />
		</freeListItem>
		<freeListItem
			title="强提醒" 
			showRight
			:showLeftIcon='false'
			:showRightIcon='false'
		>
			<switch :checked="detail.strongwarn" @change="updateChatItem($event,'istop')" slot='right' color="#08c060" />
		</freeListItem>
		
		<view v-if="detail.chat_type === 'group'">
			<freeDivider></freeDivider>
			<freeListItem
				title="我在本群里的昵称" 
				showRight
				:showLeftIcon='false'
				@click='updateNickname'
			>
				<text slot='right' class="font text-muted">{{nickname}}</text>
			</freeListItem>
			<freeListItem
				title="显示群成员名称" 
				showRight
				:showLeftIcon='false'
				:showRightIcon='false'
			>
				<switch :checked="detail.shownickname" @change="updateChatItem($event,'shownickname')" slot='right' color="#08c060" />
			</freeListItem>
		</view>
		
		<freeDivider></freeDivider>
		
		<freeListItem
			title="清空聊天记录" 
			showRight
			:showLeftIcon='false'
		>
		</freeListItem>
		
		<freeDivider></freeDivider>
		
		<freeListItem
			title="投诉" 
			showRight
			:showLeftIcon='false'
		>
		</freeListItem>
		
		<freeDivider></freeDivider>
		
		<view @click="quit" class="py-3 flex align-center justify-center bg-white" hover-class="bg-light">
			<text class="font-md text-danger">删除并退出</text>
		</view>
		
		<free-confirm ref="confirm" :title="'修改'+confirmTitle">
			<input type="text" v-model="confirmText" class="border-bottom font-md" :placeholder="confirmTitle"/>
		</free-confirm>
		
		<view style="height: 200rpx;">
		</view>
	</view>
</template>

<script>
	import freeNavBar from '@/components/free-ui/free-nav-bar.vue'
	import freeAvatar from '@/components/free-ui/free-avatar.vue'
	import freeDivider from '@/components/free-ui/free-divider.vue'
	import freeListItem from '@/components/free-ui/free-list-item.vue'
	import {mapState} from 'vuex';
	import $H from '@/common/free-lib/request.js';
	import freeConfirm from '@/components/free-ui/free-confirm.vue';
	
	export default {
		components:{
			freeNavBar,
			freeAvatar,
			freeDivider,
			freeListItem,
			freeConfirm
		},
		data() {
			return {
				confirmType: 'name',
				confirmText: '',
				list: [],
				nickname: '',
				detail:{
					id:0, // 接收人/群 id
					chat_type:'user', // 接收类型 user单聊 group群聊
					avatar:'', // 接收人/群 头像
					name:'', // 接收人/群 昵称
				
					istop:false, // 是否置顶
					shownickname:false, // 是否显示昵称
					nowarn:false, // 消息免打扰
					strongwarn:false, // 是否开启强提醒
					
					user_id:0, // 群管理员id
					remark:"", // 群公告
					invite_confirm:0, // 邀请确认
				}
			}
		},
		onLoad(e) {
			if(!e.params){
				return this.backToast()
			}
			let detail = JSON.parse(e.params)
			// 获取当前会话详细资料
			detail = this.chat.getChatListItem(detail.id,detail.chat_type)
			if(!detail){
				return this.backToast()
			}
			this.detail = detail
		},
		onShow() {
			if(this.detail.chat_type === 'group'){
				$H.get('/group_info/'+this.detail.id).then(res=>{
					this.list = res.group_users.map(item=>{
						if(item.user_id === this.user.id){
							this.nickname = item.nickname
						}
						return {
							id:item.user_id,
							name:item.nickname || item.user.nickname || item.user.username,
							avatar:item.user.avatar
						}
					})
					this.detail.remark = res.remark
				})
			}
		},
		computed: {
			...mapState({
				chat: state => state.user.chat,
				user:state=>state.user.user
			}),
			confirmTitle(){
				return this.confirmType === 'name' ? '群名称' : '昵称'
			}
		},
		methods: {
			openCode(){
				console.log(333);
				uni.navigateTo({
					url: '/pages/my/code/code?params='+encodeURIComponent(JSON.stringify({
						id:this.detail.id,
						name:this.detail.name,
						avatar:this.detail.avatar
					}))+'&type=group',
				});
			},
			updateChatItem(e,k){
				this.detail[k] = e.detail.value
				this.chat.updateChatItem({
					id:this.detail.id,
					chat_type:this.detail.chat_type
				},this.detail)
			},
			quit(){
				uni.showModal({
					content: '是否要删除或退出该群聊？',
					success:(res)=>{
						if (res.cancel) return
						$H.post('/group/quit',{
							id:this.detail.id
						}).then(res=>{
							uni.showToast({
								title: '操作成功',
								icon: 'none'
							});
							uni.navigateBack({
								delta: 1
							});
						})
					}
				});
			},
			updateNickname(){
				this.confirmType = 'nickname'
				this.confirmText = this.nickname
				this.$refs.confirm.show((close)=>{
					$H.post('/group/nickname',{
						id:this.detail.id,
						nickname:this.confirmText
					}).then(res=>{
						this.nickname = this.confirmText
						uni.showToast({
							title: '修改成功',
							icon: 'none'
						});
						close()
					})
				})
			},
			openMail(){
				uni.navigateTo({
					url: '/pages/mail/mail/mail?type=createGroup'
				})
			},
			openGroupRemark(){
				uni.navigateTo({
					url: '/pages/chat/group-remark/group-remark?params='+encodeURIComponent(JSON.stringify({
						id:this.detail.id,
						remark:this.detail.remark
					})),
				});
			},
			updateName(){
				this.confirmType = 'name'
				this.confirmText = this.detail.name
				this.$refs.confirm.show((close)=>{
					if(this.confirmText == ''){
						return uni.showToast({
							title: '群名称不能为空',
							icon: 'none'
						});
					}
					$H.post('/group/rename',{
						id:this.detail.id,
						name:this.confirmText
					}).then(res=>{
						uni.showToast({
							title: '修改成功',
							icon: 'none'
						});
						this.detail.name = this.confirmText
						close()
					})
				})
			}
		}
	}
</script>

<style>

</style>

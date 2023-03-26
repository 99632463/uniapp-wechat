import $U from './util.js';
import $H from './request.js';
import $store from '@/store/index.js';

class chat {
	constructor(arg) {
		this.url = arg.url
		this.isOnline = false
		this.socket = null
		
		let user = $U.getStorage('user')
		this.user = user ? JSON.parse(user) : {},
		
		// 初始化聊天对象
		this.TO = false
		
		if(this.user.token){
			this.connectSocket()
		}
	}
	// 连接socket
	connectSocket(){
		this.socket = uni.connectSocket({
			url:this.url+"?token="+this.user.token,
			complete: ()=> {}
		})
		this.socket.onOpen(() => {
			this.onOpen()
		})
		this.socket.onMessage((e) => {
			this.onMessage(e)
		})
		this.socket.onClose(() => {
			this.onClose()
		})
		this.socket.onError(() => {
			this.onError()
		})
	}
	// 监听打开
	onOpen(){
		// 用户上线
		this.isOnline = true
		console.log('socket连接成功');
		// 获取用户离线消息
		this.getMessage()
	}
	// 获取离线消息
	getMessage(){
		$H.post('/chat/getmessage')
	}
	// 监听接受消息
	onMessage(data){
		let res = JSON.parse(data.data)
		switch (res.msg){
			case 'fail':
			return uni.showToast({
				title: res.data,
				icon: 'none'
			});
				break;
			case 'recall': // 撤回消息
			this.handleOnRecall(res.data)
				break;
			case 'updateApplyList': // 新的好友申请
			// $store.dispatch('getApply');
				break;
			case 'moment': // 朋友圈更新
			// this.handleMoment(res.data)
				break;
			default:
			// 处理消息
			this.handleOnMessage(res.data)
				break;
		}
	}
	// 监听撤回消息处理
	async handleOnRecall(message){
		// 通知聊天页撤回消息
		uni.$emit('onMessage',{
			...message,
			isremove:1
		})
		// 修改聊天记录
		let id = message.chat_type === 'group' ? message.to_id : message.from_id
		// key值：chatDetail_当前用户id_会话类型_接收人/群id
		let key = `chatDetail_${this.user.id}_${message.chat_type}_${id}`
		// 获取原来的聊天记录
		let list = this.getChatDetail(key)
		// 根据k查找对应聊天记录
		let index = list.findIndex(item=>item.id === message.id)
		if(index === -1) return;
		list[index].isremove = 1
		// 存储
		this.setStorage(key,list)
		// 当前会话最后一条消息的显示
		this.updateChatItem({
			id,
			chat_type:message.chat_type
		},(item)=>{
			item.data = '对方撤回了一条消息'
			item.update_time = (new Date()).getTime()
			return item
		})
	}
	// 处理消息
	async handleOnMessage(message){
		// 添加消息记录到本地存储中
		let {data} = this.addChatDetail(message, false)
		// 更新会话列表
		this.updateChatList(data, false)
		// 全局通知
		uni.$emit('onMessage', data)
	}
	// 监听断开
	onClose(){
		// 用户下线
		this.isOnline = false
		this.socket = null
		console.log('socket连接关闭');
	}
	// 监听错误
	onError(){
		// 用户下线
		this.isOnline = false
		this.socket = null
		console.log('socket连接错误');
	}
	close(){
		this.socket.close()
		this.socket = null
	}
	// 创建聊天对象
	createChatObject(detail){
		this.TO = detail
		console.log('创建聊天对象：', this.TO);
	}
	// 销毁聊天对象
	destoryChatObject(){
		this.TO = false
	}
	// 验证是否上线
	checkOnline(){
		if(!this.isOnline){
			// 断线重连提示
			this.reconnectConfirm()
			return false
		}
		return true
	}
	// 断线重连提示
	reconnectConfirm(){
		// this.reconnectTime = 0
		uni.showModal({
			content: '你已经断线，是否重新连接？',
			confirmText:"重新连接",
			success:(res)=> {
				if (res.confirm) {
					this.connectSocket()
				}
			}
		});
	}
	// 组织发送信息格式
	formatSendData(params){
		return {
			id:0, // 唯一id，后端生成，用于撤回指定消息
			from_avatar:this.user.avatar,// 发送者头像
			from_name:this.user.nickname || this.user.username, // 发送者昵称
			from_id:this.user.id, // 发送者id
			to_id:params.to_id || this.TO.id, // 接收人/群 id
			to_name:params.to_name || this.TO.name, // 接收人/群 名称
			to_avatar:params.to_avatar || this.TO.avatar, // 接收人/群 头像
			chat_type:params.chat_type || this.TO.chat_type, // 接收类型
			type:params.type,// 消息类型
			data:params.data, // 消息内容
			options:params.options ? params.options : {}, // 其他参数
			create_time:(new Date()).getTime(), // 创建时间
			isremove:0, // 是否撤回
			sendStatus:params.sendStatus ? params.sendStatus : "pending" // 发送状态，success发送成功,fail发送失败,pending发送中
		}
	}
	// 撤回消息
	recall(message){
		return new Promise((result,reject)=>{
			$H.post('/chat/recall',{
				to_id:message.to_id,
				chat_type:message.chat_type,
				id:message.id,
			}).then(res=>{
				// key值：chatDetail_当前用户id_会话类型_接收人/群id
				let key = `chatDetail_${this.user.id}_${message.chat_type}_${message.to_id}`
				// 获取原来的聊天记录
				let list = this.getChatDetail(key)
				// 根据k查找对应聊天记录
				let index = list.findIndex(item=>item.id === message.id)
				if(index === -1) return;
				list[index].isremove = 1
				// 存储
				this.setStorage(key,list)
				result(res)
				// 更新会话最后一条消息显示
				this.updateChatItem({
					id:message.to_id,
					chat_type:message.chat_type
				},(item)=>{
					item.data = '你撤回了一条消息'
					item.update_time = (new Date()).getTime()
					return item
				})
			}).catch(err=>{
				reject(err)
			})
		})
	}
	// 发送消息
	send(message, onProgress = false){
		return new Promise(async (result, reject) => {
			// 添加消息历史记录
			const {k} = this.addChatDetail(message)
			// 更新会话列表
			this.updateChatList(message)
			// 验证是否上线
			if(!this.checkOnline()) return reject('未上线')
			// 上传文件
			let isUpload = (message.type !== 'text' && message.type !== 'emoticon' && message.type !== 'card' && !message.data.startsWith('http://tangzhe123-com'))
			
			let uploadResult = ''
			if(isUpload){
				uploadResult = await $H.upload('/upload',{
					filePath:message.data
				},onProgress)
				
				if(!uploadResult){
					// 发送失败
					message.sendStatus = 'fail'
					// 更新指定历史记录
					this.updateChatDetail(message,k)
					// 断线重连提示
					return reject(err)
				}
			}
			
			// 提交到后端
			let data = isUpload ? uploadResult : message.data
			
			$H.post('/chat/send', {
				to_id: this.TO.id,
				chat_type: this.TO.chat_type,
				type: message.type,
				data,
			}).then(res => {
				message.id = res.id
				message.sendStatus = 'success'

				if(message.type === 'video'){
					message.options = res.options
				}
				
				// 更新指定历史记录
				this.updateChatDetail(message, k)
				
				result(res)
			}).catch(err => {
				message.sendStatus = 'fail'
				// 更新指定历史记录
				this.updateChatDetail(message, k)
				
				reject(err)
			})
		})
	}
	// 添加聊天记录
	addChatDetail(message,isSend = true){
		// 获取对方id
		let id = message.chat_type === 'user' ? (isSend ? message.to_id : message.from_id) : message.to_id
		// key值：chatDetail_当前用户id_会话类型_接收人/群id
		let key = `chatDetail_${this.user.id}_${message.chat_type}_${id}`
		// 获取原来的聊天记录
		let list = this.getChatDetail(key)
		// 标识
		message.k = 'k'+list.length
		list.push(message)
		// 加入缓存
		this.setStorage(key,list)
		// 返回
		return {
			data:message,
			k:message.k
		}
	}
	// 更新指定历史记录
	async updateChatDetail(message,k,isSend = true){
		// 获取对方id
		let id = message.chat_type === 'user' ? (isSend ? message.to_id : message.from_id) : message.to_id
		// key值：chatDetail_当前用户id_会话类型_接收人/群id
		let key = `chatDetail_${this.user.id}_${message.chat_type}_${id}`
		// console.log('key值',key)
		// 获取原来的聊天记录
		let list = this.getChatDetail(key)
		// console.log('获取原来的聊天记录',list)
		// 根据k查找对应聊天记录
		let index = list.findIndex(item=>item.k === k)
		// console.log('根据k查找对应聊天记录',index)
		if(index === -1) return;
		list[index] = message
		// 存储
		this.setStorage(key,list)
	}
	// 获取聊天记录
	getChatDetail(key = false){
		key = key ? key : `chatDetail_${this.user.id}_${this.TO.chat_type}_${this.TO.id}`
		return this.getStorage(key)
	}
	// 格式化会话最后一条消息显示
	formatChatItemData(message,isSend){
		let data = message.data
		switch (message.type){
			case 'emoticon':
			data = '[表情]'
				break;
			case 'image':
			data = '[图片]'
				break;
			case 'audio':
			data = '[语音]'
				break;
			case 'video':
			data = '[视频]'
				break;
			case 'card':
			data = '[名片]'
				break;
		}
		data = isSend ? data : `${message.from_name}: ${data}`
		return data
	}
	updateChatList(message, isSend = true){
		// 获取本地存储会话列表
		let list = this.getChatList()
		// 是否处于当前聊天中
		let isCurrentChat = false
		// 接收人/群 id/头像/昵称
		let id = 0
		let avatar = ''
		let name = ''
		
		// 判断私聊还是群聊
		if(message.chat_type === 'user'){ // 私聊
			// 聊天对象是否存在
			isCurrentChat = this.TO ? (isSend ? this.TO.id === message.to_id : this.TO.id === message.from_id) : false
			id = isSend ? message.to_id : message.from_id
			avatar = isSend ? message.to_avatar : message.from_avatar
			name = isSend ? message.to_name : message.from_name
		} else { // 群聊
			isCurrentChat = this.TO && (this.TO.id === message.to_id)
			id = message.to_id
			avatar = message.to_avatar
			name = message.to_name
		}
		// 最后一条消息展现形式
		// let data = isSend ? message.data : `${message.from_name}: ${message.data}`
		// let data = message.data.length > 18 ? message.data.slice(0,17) + '...' : message.data;
		// data = isSend ? data : `${message.from_name}: ${data}`、
		let data = this.formatChatItemData(message, isSend)
		
		// 会话是否存在
		let index = list.findIndex(item=>{
			return item.chat_type === message.chat_type && item.id === id
		})
		
		// 会话不存在，创建会话
		// 未读数是否 + 1
		let noreadnum = (isSend || isCurrentChat) ? 0 : 1
		if(index === -1){
			let chatItem = {
				id, // 接收人/群 id
				chat_type:message.chat_type, // 接收类型 user单聊 group群聊
				avatar, // 接收人/群 头像
				name, // 接收人/群 昵称
				update_time:(new Date()).getTime(), // 最后一条消息的时间戳
				data, // 最后一条消息内容
				type:message.type, 		   // 最后一条消息类型
				noreadnum, // 未读数
				istop:false, // 是否置顶
				shownickname:false, // 是否显示昵称
				nowarn:false, // 消息免打扰
				strongwarn:false, // 是否开启强提醒
			}
			// 群聊
			if(message.chat_type === 'group' && message.group){
				chatItem.shownickname = true
				chatItem.name = message.to_name
				chatItem = {
					...chatItem,
					user_id:message.group.user_id, // 群管理员id
					remark:"", // 群公告
					invite_confirm:1, // 邀请确认
				}
			}
			list.unshift(chatItem)
		} else {
			// 拿到当前会话
			let item = list[index]
			// 更新该会话最后一条消息时间，内容，类型
			item.update_time = (new Date()).getTime()
			item.name = message.to_name
			item.name = name
			item.data = data
			item.type = message.type
			// 未读数更新
			item.noreadnum += noreadnum
			// 置顶会话
			list = this.listToFirst(list,index)
		}
		// 存储
		let key = `chatlist_${this.user.id}`
		this.setStorage(key,list)
		// 更新未读数
		this.updateBadge(list)
		// 通知更新vuex中的聊天会话列表
		uni.$emit('onUpdateChatList',list)
		return list
	}
	// 更新未读数
	async updateBadge(list = false){
		// 获取所有会话列表
		list = list ? list : this.getChatList()
		// 统计所有未读数
		let total = 0
		list.forEach(item=>{
			total += item.noreadnum
		})
		// 设置底部导航栏角标
		if(total > 0){
			uni.setTabBarBadge({
				index:0,
				text:total <= 99 ? total.toString() : '99+'
			})
		} else {
			uni.removeTabBarBadge({
				index:0
			})
		}
		uni.$emit('totalNoreadnum',total)
	}
	// 更新指定会话
	async updateChatItem(where,data){
		// 获取所有会话列表
		let list = this.getChatList()
		// 找到当前会话
		let index = list.findIndex(item=>item.id === where.id && item.chat_type === where.chat_type)
		if(index === -1) return;
		// 更新数据
		if(typeof data === 'function'){
			list[index] = data(list[index])
		} else {
			list[index] = data
		}
		
		let key = `chatlist_${this.user.id}`
		this.setStorage(key,list)
	
		// 更新会话列表状态
		uni.$emit('onUpdateChatList',list)
	}
	// 读取会话
	async readChatItem(id,chat_type){
		// 获取所有会话列表
		let list = this.getChatList()
		// 找到当前会话
		let index = list.findIndex(item=>item.id === id && item.chat_type === chat_type)
		if(index !== -1){
			list[index].noreadnum = 0
			let key = `chatlist_${this.user.id}`
			this.setStorage(key,list)
			// 重新获取总未读数
			this.updateBadge()
			// 更新会话列表状态
			uni.$emit('onUpdateChatList',list)
		}
	}
	// 获取本地存储会话列表
	getChatList(){
		let key = `chatlist_${this.user.id}`
		return this.getStorage(key)
	}
	// 获取指定会话
	getChatListItem(id,chat_type){
		// 获取所有会话列表
		let list = this.getChatList()
		// 找到当前会话
		let index = list.findIndex(item=>item.id === id && item.chat_type === chat_type)
		if(index !== -1){
			return list[index]
		}
		return false
	}
	// 获取存储
	getStorage(key){
		let list = $U.getStorage(key)
		return list ? JSON.parse(list) : []
	}
	// 设置存储
	setStorage(key,value){
		return $U.setStorage(key,JSON.stringify(value))
	}
	// 数组置顶
	listToFirst(arr,index){
		if (index != 0) {
			arr.unshift(arr.splice(index,1)[0]);
		}
		return arr;
	}
}

export default chat
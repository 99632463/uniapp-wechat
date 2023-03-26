export default {
	state: {
		// 存放全局事件
		events:　[],
		RECORD: null,
		recordTime: 0,
		recordTimer: null,
		sendVoice: null
	},
	mutations: {
		// 初始化录音管理器
		initRECORD(state){
			state.RECORD = uni.getRecorderManager()
			
			// 监听录音开始
			state.RECORD.onStart((e) => {
				state.recordTime = 0
				state.recordTimer = setInterval(() => {
					state.recordTime++
				}, 1000)
			})
			// 监听录音结束
			state.RECORD.onStop((e) => {
				if(state.recordTimer){
					clearInterval(state.recordTimer)
					state.recordTimer = null
				}
				
				state.sendVoice(e.tempFilePath)
			})
		},
		// 注册发送音频的事件
		regSendVoiceEvent(state, event){
			state.sendVoice = event
		},
		// 注册全局事件
		regEvent(state,event){
			state.events.push(event)
		},
		// 执行全局事件
		doEvent(state, params){
			state.events.forEach(fn => {
				fn(params)
			})
		},
		// 注销事件
		removeEvent(state, event){
			let index = state.events.findIndex(item => item === event)
			if(index > 0){
				state.events.splice(index, 1)
			}
		}
	},
	actions:{
		// 分发注册全局事件
		audioOn({commit}, event){
			commit('regEvent', event)
		},
		// 分发执行全局事件
		audioEmit({commit}, params){
			commit('doEvent', params)
		},
		// 分发注销全局事件
		audioOff({commit}, event){
			commit('removeEvent', event)
		}
	}
}

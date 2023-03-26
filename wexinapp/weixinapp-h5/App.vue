<script>
	import store from './store/index.js';
	
	export default {
		onLaunch: function() {
			// #ifdef APP-PLUS-NVUE
			// 加载公共图标库
			const domModule = weex.requireModule('dom')
			domModule.addRule('fontFace', {
			    'fontFamily': "iconfont",
			    'src': "url('https://at.alicdn.com/t/font_1365296_2ijcbdrmsg.ttf')"
			});
			// #endif
			
			// 初始化录音管理器
			store.commit('initRECORD')
			// 初始化登录状态
			store.dispatch('initLogin')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
	@import "./common/free.css";
	@import "./common/common.css";
	/* #ifndef APP-PLUS-NVUE */
	@import "./common/free-icon.css";
	/* #endif */
</style>

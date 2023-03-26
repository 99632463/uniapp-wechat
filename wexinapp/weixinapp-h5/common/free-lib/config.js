export default {
    // #ifndef H5
    baseUrl:"http://127.0.0.1:7001",
    // #endif
	
    // #ifdef H5
    baseUrl:"/api",
    // #endif
    socketUrl:"ws://127.0.0.1:7001/ws",
	
    env:"dev",
	
	codeUrl:"http://127.0.0.1:7001",
	
	// 表情包线上路径
	emoticonUrl:"http://127.0.0.1:7001/static/images/emoticon/5497/"
}
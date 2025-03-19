import axios from "axios";
import {TOKEN_CONFIG} from "../config/index.js";
import { ElMessage ,ElLoading} from 'element-plus'
import router from '../routers/index.js'
import {ref} from "vue";

let load=ref()

const request=(url="",method="get",data={},timeout=5000)=>{
    return new Promise((resolve, reject) =>{
        const methodLower=method.toLowerCase()
        if(methodLower==="get"){
            axios({
                url: url,
                method:method,
                params: data,
                timeout: timeout,
            }).then((response)=>{
                resolve(response)
            }).catch((error)=>{
                reject(error)
            })
        }else if(methodLower==="post"){
            axios({
                url: url,
                method:method,
                data: data,
                timeout: timeout,
            }).then((response)=>{
                resolve(response)
            }).catch((error)=>{
                reject(error)
            })
        }
    } )

}
export default request
axios.interceptors.request.use(function (config) {
    //在发送前做些什么

    // config.headers.Authorization = "yyyyyyyyy"
    //添加时间戳在请求中,解决缓存
    load.value=ElLoading.service({
        text:"玩命加载中",
        background:'rgb(0,0,0,0.5)'
    })
    if (config.method == "get") {
        let timeStamp = (new Date()).getTime()
        if (config.params) {
            config.params.timestamp = timeStamp
        } else {
            config.params = {
                params: {
                    timestamp: timeStamp
                }
            }
        }
    }
    let TokenValue=""
    try {
        TokenValue=window.localStorage.getItem(TOKEN_CONFIG.TOKEN_NAME)
    }catch (error){
        TokenValue=""
    }
    if(TokenValue == ""||TokenValue==null){
        config.headers[TOKEN_CONFIG.TOKEN_NAME]=""
    }else{
        config.headers[TOKEN_CONFIG.TOKEN_NAME]=TokenValue
    }
    return config

},function (error){
    //请求失败做什么
    return Promise.reject(error)
})
axios.interceptors.response.use(function (response) {
    if(response.data.status==200){
        load.value.close()
        return Promise.resolve(response)
    }else if(response.data.status==401){
        ElMessage({
            message: '登录信息不正确',
            type: 'warning',
        })
        window.localStorage.removeItem(TOKEN_CONFIG.TOKEN_NAME)
        if(router.currentRoute.value.path!='/login'){
            router.replace("/login")
        }

    }
    load.value.close()
    return response

},function (error){
    //请求失败做什么
    ElMessage({
        message: error.message,
        type: 'error',
    })
    load.value.close()
    return Promise.reject(error)
})

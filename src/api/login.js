import {API_CONFIG} from '../config/index.js'

import request from './index.js'

export const login=(username,password)=>{
    return request(API_CONFIG.loginApi,'post',
        {
            userName:username,
            password:password
        },
        2000
    )
}
export const logout=()=>{
    return request(API_CONFIG.loginOutApi,'post',
        {},
        2000
    )
}
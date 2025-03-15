import {API_CONFIG} from '../../config/index.js'

import request from '../index.js'

export const getUserList=()=>{
    return request(API_CONFIG.userListApi,'get',{},
        2000
    )
}
export const deleteUser=(id)=>{
    return request(API_CONFIG.userDeleteApi,'post',{id},
        2000
    )
}
export const updateUser=(userForm)=>{
    return request(API_CONFIG.userUpdateApi,'post',userForm,
        2000
    )
}
export const addUser=(userForm)=>{
    return request(API_CONFIG.userCreateAPi,'post',userForm,
        2000
    )
}
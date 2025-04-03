import request from '../index.js'
import {API_CONFIG} from "../../config/index.js";
export const deleteHandler=(resourceType,clusterId,nameSpace,name)=>{
    const BASE_URL=import.meta.env.VITE_BASE_URL
    const url=resourceType.toLowerCase()
    const api=`${BASE_URL}/${url}/delete`
    return request(api,'post',{clusterId,nameSpace,name},
        5000
    )
}
export const listHandler=(resourceType,clusterId,nameSpace)=>{
    const BASE_URL=import.meta.env.VITE_BASE_URL
    const url=resourceType.toLowerCase()
    const api=`${BASE_URL}/${url}/list`
    return request(api,'get',{clusterId,nameSpace},
        5000
    )
}
export const restartHandler=(resourceType,name,clusterId,nameSpace)=>{
    const BASE_URL=import.meta.env.VITE_BASE_URL
    const url=resourceType.toLowerCase()
    const api=`${BASE_URL}/${url}/restart`
    return request(api,'get',{name,clusterId,nameSpace},
        5000
    )
}
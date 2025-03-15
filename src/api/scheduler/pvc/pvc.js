import {API_CONFIG} from "../../../config/index.js";
import request from "../../index.js";
export const getPvcList=(clusterId,nameSpace)=>{
    return request(API_CONFIG.pvcListApi,'get',{clusterId,nameSpace},
        2000
    )
}
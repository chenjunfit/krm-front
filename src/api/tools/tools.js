import {API_CONFIG} from '../../config/index.js'

import request from '../index.js'

export const createOrUpdateByYaml=(data)=>{
    return request(API_CONFIG.yamlCreateOrUpdate,'post',data,
        2000
    )
}

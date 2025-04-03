import {API_CONFIG} from '../../config/index.js'

import request from '../index.js'

export const getClusterList=()=>{
    return request(API_CONFIG.clusterListApi,'get',{},
        5000
    )
}
export const getCluster=(clusterId)=>{
    return request(API_CONFIG.clusterGetApi,'get',{clusterId},
        5000
    )
}
export const deleteCluster=(clusterId)=>{
    return request(API_CONFIG.clusterDeleteApi,'get',{clusterId},
        5000
    )
}
export const updateCluster=(data)=>{
    return request(API_CONFIG.clusterUpdateApi,'post',data,
        5000
    )
}
export const addCluster=(data)=>{
    return request(API_CONFIG.clusterCreateAPi,'post',data,
        5000
    )
}
export const getNodeList=(clusterId)=>{
    return request(API_CONFIG.nodeListApi,'get',{clusterId},
        5000
    )
}
export const getNode=(id)=>{
    return request(API_CONFIG.nodeGetApi,'get',{id},
        5000
    )
}
export const updateNode=(clusterId,name,item)=>{
    return request(API_CONFIG.nodeUpdateApi,'post',{clusterId,name,item},
        5000
    )
}
export const getNamespaceList=(data)=>{
    return request(API_CONFIG.namespaceListApi,'get',data,
        5000
    )
}
export const addNamespace=(clusterId,name)=>{
    return request(API_CONFIG.namespaceCreateApi,'post',{clusterId,name},
        5000
    )
}
export const updateNamespace=(clusterId,name,item)=>{
    return request(API_CONFIG.namespaceUpdateApi,'post',{clusterId,name,item},
        5000
    )
}
export const deleteNamespace=(clusterId,name)=>{
    return request(API_CONFIG.namespaceDeleteApi,'get',{clusterId,name},
        5000
    )
}
export const copyNamespaceHandler=(data)=>{
    return request(API_CONFIG.namespaceCopyApi,'post',data,
        10000
    )
}

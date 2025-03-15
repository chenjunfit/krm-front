import {defineStore} from "pinia";
//创建一个全局的状态，容器
//容器接受俩个参数,第一个是容器的id,第二个是容器的内容
//defineStore返回的函数，这个函数按照useXXX去命名
//counter-->useCounter storeDemo-->useStoreDemo
export const useIsCollapse=defineStore('isCollapse',{
    //state: 用来存储全局状态或数据，可以理解为数据存储的位置
    state: ()=> {
        return {
            isCollapse:false
        }
    },
    //相当于计算属性
    getters:{},
    //定义修改数据的方法
    //相当于methods
    actions: {
        changeIsCollapse(){
            this.isCollapse=!this.isCollapse
        }
    },
})

export const useItem=defineStore('item',{
    //state: 用来存储全局状态或数据，可以理解为数据存储的位置
    state: ()=> {
        return {
            item:{
                clusterId:"",
                nameSpace:"",
                metadata:{
                    name:"",
                    annotations:{},
                    labels:{},
                },
                spec:{

                    selector:{
                        matchLabels:{},
                    },
                    replicas:1,
                    template:{
                        metadata:{
                            labels:{},
                            annotations:{},
                        },
                        spec:{
                            imagePullSecrets:[],
                            dnsPolicy:"ClusterFirst",
                            hostNetwork:false,
                            restartPolicy:'Always',
                            volumes:[],
                            containers:[],
                            initContainers:[],
                        },
                    }
                },

            }
        }
    },
    //相当于计算属性
    getters:{},
    //定义修改数据的方法
    //相当于methods
    actions: {

    },
})
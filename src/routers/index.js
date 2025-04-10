
import {createRouter, createWebHashHistory} from "vue-router";
import {TOKEN_CONFIG} from "../config/index.js";

const Login =()=> import ('../view/login.vue')
const Layout =()=> import ('../view/layout/layout.vue')
import namespaceRouters from "./cluster/namespace.js";
import nodeRouters from "./cluster/node.js";
import clusterRouters from "./cluster/cluster.js";
import {
    podRouters,
    deploymentRouters,
    statefulSetRouters,
    daemonSetRouters,
    cronJobRouters
} from "./scheduler/scheduler.js";
import {ingressRouters, serviceRouters} from "./service/service.js";
import {configmapRouters, secretRouters} from "./config/config.js";
import {pvcRouters, pvRouters} from "./storage/storage.js";
import {toolsRouters} from "./tools/tools.js";
//定义路由映射
const routers=[
    clusterRouters,
    namespaceRouters,
    nodeRouters,
    podRouters,
    deploymentRouters,
    statefulSetRouters,
    daemonSetRouters,
    cronJobRouters,
    serviceRouters,
    ingressRouters,
    configmapRouters,
    secretRouters,
    pvRouters,
    pvcRouters,
    toolsRouters,
    {
        path: '/login',
        component: Login,
        name: "login"
    },
    {
        path: '/',
        component: Layout,
        children: [
            {
                path:'/',
                component: ()=>import('../view/home.vue')
            }
        ]
    },

]
//创建路由实例
const router=createRouter({
    history: createWebHashHistory(),
    routes: routers,
})
router.beforeEach(
    (to,from,next)=>{
        //1、如果访问是login,但是没有token,next()
        //2、如果访问的是login,但是有token,next('/index')
        //3、如果访问的不是login,但是没有token,next('/login')
        //4、如果访问的不是login,但是有token,next()
        const path=to.path
        const tokenValue=window.localStorage.getItem(TOKEN_CONFIG.TOKEN_NAME)
        if(path.indexOf("/login")==0&&!tokenValue){
            next()
        }else if(path.indexOf("/login")==0&&tokenValue){
            next('/index')
        }else if(path.indexOf("/login")!=0&&!tokenValue){
            next('/login')
        }else{
            next()
        }


    }
)

export default router


export const MEMU_CONFIG=[
    // {
    //     "title":"用户管理",
    //     "index":"/user",
    //     "icon":"iconfont icon-yonghu",
    //     items:
    //         [
    //             {"title":"查看用户", "index":"/user/list"},
    //         ]
    //
    //
    // },
    {
        "title":"集群资源",
        "index":"/cluster",
        "icon":"iconfont icon-jiqunguanli",
        items:
            [
                {"title":"查看集群", "index":"/cluster/list"},
                {"title":"查看节点", "index":"/node/list"},
                {"title":"查看命名空间", "index":"/namespace/list"}
            ],


    },
    {
        "title":"调度资源",
        "index":"/product",
        "icon":"iconfont icon-tiaoduguanli",
        subMenu:[
            {
                "title":"Pod",
                "index":"/pod",
                "icon":"iconfont icon-rongqi",
                items:[

                    {
                        "title":"查看",
                        "index":"/pod/list"
                    },
                ]
            },
            {
                "title":"Deployment",
                "index":"/deployment",
                "icon":"iconfont icon-chanpinguanli",
                items:[
                    {
                        "title":"创建",
                        "index":"/deployment/add"
                    },
                    {
                        "title":"查看",
                        "index":"/deployment/list"
                    },
                ]
            },
            {
                "title":"StatefulSet",
                "index":"/statefulSet",
                "icon":"iconfont icon-bushu",
                items:[
                    {
                        "title":"添加",
                        "index":"/statefulSet/add"
                    },
                    {
                        "title":"查看",
                        "index":"/statefulSet/list"
                    },
                ]
            },
            {
                "title":"CronJob",
                "index":"/cronJob",
                "icon":"iconfont icon-renwu",
                items:[
                    {
                        "title":"添加",
                        "index":"/cronJob/add"
                    },
                    {
                        "title":"查看",
                        "index":"/cronJob/list"
                    },
                ]
            },
            {
                "title":"DaemonSet",
                "index":"/daemonSet",
                "icon":"iconfont icon-deploymentunit",
                items:[
                    {
                        "title":"添加",
                        "index":"/daemonSet/add"
                    },
                    {
                        "title":"查看",
                        "index":"/daemonSet/list"
                    },
                ]
            }
        ]
    },
    {
        "title":"服务发布",
        "index":"/publish",
        "icon":"iconfont icon-gongnengfuwufabu",
        subMenu:[
            {
                "title":"Service",
                "index":"/service",
                "icon":"iconfont icon-fuwufabuguanli",
                items:[

                    {
                        "title":"查看",
                        "index":"/service/list"
                    },
                    {
                        "title":"创建",
                        "index":"/service/add"
                    },
                ]
            },
            {
                "title":"Ingress",
                "index":"/ingress",
                "icon":"iconfont icon-k8s_ingress",
                items:[
                    {
                        "title":"创建",
                        "index":"/ingress/add"
                    },
                    {
                        "title":"查看",
                        "index":"/ingress/list"
                    },
                ]
            }
        ]
    },
    {
        "title":"配置管理",
        "index":"/config",
        "icon":"iconfont icon-peizhiguanli",
        subMenu:[
            {
                "title":"ConfigMap",
                "index":"/configmap",
                "icon":"iconfont icon-config-map",
                items:[

                    {
                        "title":"查看",
                        "index":"/configmap/list"
                    },
                    {
                        "title":"创建",
                        "index":"/configmap/add"
                    },
                ]
            },
            {
                "title":"Secret",
                "index":"/secret",
                "icon":"iconfont icon-secret",
                items:[
                    {
                        "title":"创建",
                        "index":"/secret/add"
                    },
                    {
                        "title":"查看",
                        "index":"/secret/list"
                    },
                ]
            }
        ]
    },
    {
        "title":"存储管理",
        "index":"/storage",
        "icon":"iconfont icon-32cunchuguanli",
        subMenu:[
            {
                "title":"PV",
                "index":"/pv",
                "icon":"iconfont icon-a-cunchujuanpv",
                items:[

                    {
                        "title":"查看",
                        "index":"/pv/list"
                    },
                    {
                        "title":"创建",
                        "index":"/pv/add"
                    },
                ]
            },
            {
                "title":"PVC",
                "index":"/pvc",
                "icon":"iconfont icon-a-cunchujuanshengmingpvc",
                items:[
                    {
                        "title":"创建",
                        "index":"/pvc/add"
                    },
                    {
                        "title":"查看",
                        "index":"/pvc/list"
                    },
                ]
            }
        ]
    },
    {
        "title":"实用工具",
        "index":"/tools",
        "icon":"iconfont icon-shiyonggongju",
        items:
            [
                {"title":"通过yaml创建或更新", "index":"/tools/add"},
            ],


    },
]
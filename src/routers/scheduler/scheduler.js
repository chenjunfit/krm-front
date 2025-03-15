import Layout from "../../view/layout/layout.vue";
export const podRouters={
    path: '/pod',
    component: Layout,
    name: "pod",
    redirect: "/pod/list",
    children: [
        {
            path: 'list',
            component: ()=> import('../../view/pod/list.vue'),
        },
    ]
}

export const deploymentRouters={

    path: '/deployment',
    component: Layout,
    name: "deployment",
    redirect: "/deployment/list",
    children: [
        {
            path: 'list',
            component: ()=> import('../../view/deployment/list.vue'),
        },
        {
            path: 'add',
            component: ()=> import('../../view/deployment/create.vue'),
        },
        {
            path: 'edit',
            component: ()=> import('../../view/deployment/edit.vue'),
        },
    ]
}
export const statefulSetRouters={

    path: '/statefulSet',
    component: Layout,
    name: "statefulSet",
    redirect: "/statefulSet/list",
    children: [
        {
            path: 'list',
            component: ()=> import('../../view/statefulset/list.vue'),
        },
        {
            path: 'add',
            component: ()=> import('../../view/statefulset/create.vue'),
        },
        {
            path: 'edit',
            component: ()=> import('../../view/statefulset/edit.vue'),
        },
    ]
}
export const daemonSetRouters={

    path: '/daemonSet',
    component: Layout,
    name: "daemonSet",
    redirect: "/daemonSet/list",
    children: [
        {
            path: 'list',
            component: ()=> import('../../view/daemonset/list.vue'),
        },
        {
            path: 'add',
            component: ()=> import('../../view/daemonset/create.vue'),
        },
        {
            path: 'edit',
            component: ()=> import('../../view/daemonset/edit.vue'),
        },
    ]
}
export const cronJobRouters={

    path: '/cronJob',
    component: Layout,
    name: "cronJob",
    redirect: "/cronJob/list",
    children: [
        {
            path: 'list',
            component: ()=> import('../../view/cronjob/list.vue'),
        },
        {
            path: 'add',
            component: ()=> import('../../view/cronjob/create.vue'),
        },
        {
            path: 'edit',
            component: ()=> import('../../view/cronjob/edit.vue'),
        },
    ]
}

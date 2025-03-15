import Layout from "../../view/layout/layout.vue";
export const configmapRouters={
    path: '/configmap',
    component: Layout,
    name: "configmap",
    redirect: "/configmap/list",
    children: [
        {
            path: 'list',
            component: ()=> import('../../view/configmap/list.vue'),
        },
        {
            path: 'add',
            component: ()=> import('../../view/configmap/create.vue'),
        },
        {
            path: 'edit',
            component: ()=> import('../../view/configmap/edit.vue'),
        },
    ]
}

export const secretRouters={

    path: '/secret',
    component: Layout,
    name: "secret",
    redirect: "/secret/list",
    children: [
        {
            path: 'list',
            component: ()=> import('../../view/secret/list.vue'),
        },
        {
            path: 'add',
            component: ()=> import('../../view/secret/create.vue'),
        },
        {
            path: 'edit',
            component: ()=> import('../../view/secret/edit.vue'),
        },
    ]
}

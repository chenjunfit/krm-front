import Layout from "../../view/layout/layout.vue";

export const pvRouters={

    path: '/pv',
    component: Layout,
    name: "pv",
    redirect: "/pv/list",
    children: [
        {
            path: 'list',
            component: ()=> import('../../view/pv/list.vue'),
        },
        {
            path: 'add',
            component: ()=> import('../../view/pv/create.vue'),
        },
        {
            path: 'edit',
            component: ()=> import('../../view/pv/edit.vue'),
        },
    ]
}
export const pvcRouters={

    path: '/pvc',
    component: Layout,
    name: "pvc",
    redirect: "/pvc/list",
    children: [
        {
            path: 'list',
            component: ()=> import('../../view/pvc/list.vue'),
        },
        {
            path: 'add',
            component: ()=> import('../../view/pvc/create.vue'),
        },
        {
            path: 'edit',
            component: ()=> import('../../view/pvc/edit.vue'),
        },
    ]
}
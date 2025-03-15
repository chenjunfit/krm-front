import Layout from "../../view/layout/layout.vue";
export const serviceRouters={
    path: '/service',
    component: Layout,
    name: "service",
    redirect: "/service/list",
    children: [
        {
            path: 'list',
            component: ()=> import('../../view/service/list.vue'),
        },
        {
            path: 'add',
            component: ()=> import('../../view/service/create.vue'),
        },
        {
            path: 'edit',
            component: ()=> import('../../view/service/edit.vue'),
        },
    ]
}

export const ingressRouters={

    path: '/ingress',
    component: Layout,
    name: "ingress",
    redirect: "/ingress/list",
    children: [
        {
            path: 'list',
            component: ()=> import('../../view/ingress/list.vue'),
        },
        {
            path: 'add',
            component: ()=> import('../../view/ingress/create.vue'),
        },
        {
            path: 'edit',
            component: ()=> import('../../view/ingress/edit.vue'),
        },
    ]
}

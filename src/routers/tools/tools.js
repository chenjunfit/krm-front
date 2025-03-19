import Layout from "../../view/layout/layout.vue";

export const toolsRouters={

    path: '/tools',
    component: Layout,
    name: "tools",
    redirect: "/tools/add",
    children: [
        {
            path: 'add',
            component: ()=> import('../../view/tools/create.vue'),
        },
    ]
}
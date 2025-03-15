import Layout from "../../view/layout/layout.vue";
export const namespaceRouters={

    path: '/namespace',
    component: Layout,
    name: "namespace",
    redirect: "/namespace/list",
    children: [
        {
            path: 'list',
            component: ()=> import('../../view/namespace/list.vue'),
        },
    ]
}
export default namespaceRouters
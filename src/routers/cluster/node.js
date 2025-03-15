import Layout from "../../view/layout/layout.vue";
export const nodeRouters={

    path: '/node',
    component: Layout,
    name: "node",
    redirect: "/node/list",
    children: [
        {
            path: 'list',
            component: ()=> import('../../view/node/list.vue'),
        },
    ]
}
export default nodeRouters
import Layout from "../../view/layout/layout.vue";
export const clusterRouters={

    path: '/cluster',
    component: Layout,
    name: "cluster",
    redirect: "/cluster/list",
    children: [
        {
            path: 'list',
            component: ()=> import('../../view/cluster/list.vue'),
        },
    ]
}
export default clusterRouters
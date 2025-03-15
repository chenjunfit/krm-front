import Layout from "../../view/layout/layout.vue";
export const userRouters={

    path: '/user',
    component: Layout,
    name: "user",
    redirect: "/user/list",
    children: [
        {
            path: 'add',
            component: ()=> import('../../view/user/add.vue'),
        },
        {
            path: 'list',
            component: ()=> import('../../view/user/list.vue'),
            name: "List",
        },
    ]
}
export default userRouters
export const allRouters = [];

export const publicRouters = [
  {
    path: '/',
    name: 'base',
    redirect: '/home',
    component: () => import('@/views/BaseView/Index.vue'),
    children: [
      { path: '/home', name: 'home', component: () => import('@/views/HomePage/Index.vue') }
    ]
  }
];

export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: '登录',
        path: '/user/login',
        component: './user/login',
      },
    ],
  },
  {
    path: '/welcome',
    name: '欢迎',
    icon: 'smile',
    component: './Welcome',
  },
  {
    path: '/SystemSettings',
    name: '系统设置',
    icon: 'setting',
    component: './SystemSettings',
  },
  {
    path: '/MonitoringSettings',
    name: '监控端设置',
    icon: 'desktop',
    component: './MonitoringSettings',
  },
  {
    path: '/OrderList',
    name: '订单管理',
    icon: 'OrderedList',
    component: './OrderList',
  },
  {
    path: '/AlipayQRConfig',
    name: '支付宝指定金额收款码',
    icon: 'alipay',
    access: 'canAdmin',
    routes: [
      {
        path: '/AlipayQRConfig',
        redirect: '/AlipayQRConfig/manage',
      },
      {
        path: '/AlipayQRConfig/add',
        name: '添加',
        icon: 'alipay',
        component: './AlipayQRConfig/Add',
      },
      {
        path: '/AlipayQRConfig/list',
        name: '管理',
        icon: 'alipay',
        component: './AlipayQRConfig/List',
      },
    ],
  },
  {
    path: '/WeChatQRConfig',
    name: '微信指定金额收款码',
    icon: 'wechat',
    access: 'canAdmin',
    routes: [
      {
        path: '/WeChatQRConfig',
        redirect: '/WeChatQRConfig/manage',
      },
      {
        path: '/WeChatQRConfig/add',
        name: '添加',
        icon: 'wechat',
        component: './WeChatQRConfig/Add',
      },
      {
        path: '/WeChatQRConfig/list',
        name: '管理',
        icon: 'wechat',
        component: './WeChatQRConfig/List',
      },
    ],
  },
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    component: './exception/404',
    layout: false,
    path: './*',
  },
];

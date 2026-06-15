import { LinkOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type {
  RequestConfig,
  RequestOptions,
  RunTimeLayoutConfig,
} from '@umijs/max';
import { history, Link, request as umiRequest } from '@umijs/max';
import { message, notification } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React from 'react';

// 引入全局组件与接口
import {
  AvatarDropdown,
  ErrorBoundary,
  Footer,
  OfflineBanner,
} from '@/components';
import {
  login,
  currentUser as queryCurrentUser,
  refreshToken,
} from '@/services/ant-design-pro/api';
import defaultSettings from '../config/defaultSettings';

// 初始化 dayjs 插件
dayjs.extend(relativeTime);

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

// ================= 全局状态与变量 =================
let isRefreshing = false;
let requestsQueue: {
  resolve: (token: string) => void;
  reject: (err: any) => void;
}[] = [];

/**
 * 获取全局初始化状态
 */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
  settingDrawerOpen?: boolean;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser({
        skipErrorHandler: true,
      });
      return msg.data;
    } catch (_error) {
      console.warn('🚨 [排查雷达]: fetchUserInfo 失败，触发重定向登录');
      const { pathname, search, hash } = history.location;
      history.replace(
        `${loginPath}?redirect=${encodeURIComponent(pathname + search + hash)}`,
      );
    }
    return undefined;
  };

  const { location } = history;
  if (
    ![loginPath, '/user/register', '/user/register-result'].includes(
      location.pathname,
    )
  ) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings as Partial<LayoutSettings>,
      settingDrawerOpen: false,
    };
  }

  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
    settingDrawerOpen: false,
  };
}

// ================= 布局配置 =================
export const layout: RunTimeLayoutConfig = ({
  initialState,
  setInitialState,
}) => {
  return {
    menuItemRender: (item, dom) => {
      if (item.path) {
        return (
          <Link to={item.path} prefetch>
            {dom}
          </Link>
        );
      }
      return dom;
    },
    actionsRender: () => [],
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: initialState?.currentUser?.username,
      render: (_, avatarChildren) => (
        <AvatarDropdown>{avatarChildren}</AvatarDropdown>
      ),
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        console.warn('🚨 [排查雷达]: 路由变化且无用户信息，触发重定向登录');
        history.replace(
          `${loginPath}?redirect=${encodeURIComponent(location.pathname + location.search + location.hash)}`,
        );
      }
    },
    // ... 保留背景图等其他默认配置
    bgLayoutImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    links: isDev
      ? [
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
        ]
      : [],
    ErrorBoundary,
    menuHeaderRender: undefined,
    childrenRender: (children) => {
      return (
        <>
          {children}
          <SettingDrawer
            disableUrlParams
            enableDarkTheme
            collapse={initialState?.settingDrawerOpen}
            onCollapseChange={(open) =>
              setInitialState((s) => ({ ...s, settingDrawerOpen: open }))
            }
            settings={initialState?.settings}
            onSettingChange={(settings) =>
              setInitialState((s) => ({ ...s, settings }))
            }
          />
        </>
      );
    },
    ...initialState?.settings,
  };
};

// ================= 核心：无感刷新 Token 逻辑 =================
const handleTokenRefresh = async (config: RequestOptions) => {
  if (!isRefreshing) {
    isRefreshing = true;
    const rToken = localStorage.getItem('refreshToken');

    if (!rToken) {
      console.warn('🚨 [排查雷达]: 本地无 refreshToken，触发跳转登录');
      history.push(loginPath);
      return Promise.reject(new Error('无 refreshToken，请重新登录'));
    }

    let isRefreshSuccess = false;
    let newAccessToken = '';

    // --- 第一部分：刷新 Token ---
    try {
      const res = await refreshToken({ refresh_token: rToken });

      // ⭐ 修复点1：兼容 Umi Request 是否自动脱壳的情况
      const access_token = res?.data?.access_token;
      const refresh_token = res?.data?.refresh_token;

      if (access_token) {
        localStorage.setItem('accessToken', access_token);
        if (refresh_token) {
          localStorage.setItem('refreshToken', refresh_token);
        }
        newAccessToken = access_token;
        isRefreshSuccess = true;
      } else {
        throw new Error('返回数据中未找到 access_token');
      }
    } catch (refreshError) {
      console.warn(
        '🚨 [排查雷达]: refreshToken 接口报错，触发跳转登录',
        refreshError,
      );
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // requestsQueue.forEach((queueItem) => queueItem.reject(refreshError));
      requestsQueue.forEach((queueItem) => {
        queueItem.reject(refreshError);
      });
      requestsQueue = [];

      history.push(loginPath);
      isRefreshing = false;
      return Promise.reject(refreshError);
    }

    isRefreshing = false;

    // --- 第二部分：重试原本的请求 ---
    if (isRefreshSuccess) {
      // ⭐ 修复点2：深拷贝 config，防止污染 Umi 内部对象
      const retryConfig = { ...config, headers: { ...config.headers } };
      (retryConfig.headers as Record<string, string>).Authorization =
        `Bearer ${newAccessToken}`;

      // 放行队列中的其他请求
      // requestsQueue.forEach((queueItem) => queueItem.resolve(newAccessToken));
      requestsQueue.forEach((queueItem) => {
        queueItem.resolve(newAccessToken);
      });
      requestsQueue = [];

      // ⭐ 修复点3：为重试请求套上独立的安全罩
      try {
        const retryResult = await umiRequest(retryConfig.url || '', {
          ...retryConfig,
          skipErrorHandler: true,
        });
        return { data: retryResult };
      } catch (retryError) {
        // 直接拒绝，绝不在这里执行 push 操作
        return Promise.reject(retryError);
      }
    }

    return Promise.reject(new Error('Token 刷新流程异常结束'));
  } else {
    // 队列逻辑同样加入严格的异常捕获
    return new Promise((resolve, reject) => {
      requestsQueue.push({
        resolve: async (newToken: string) => {
          const retryConfig = { ...config, headers: { ...config.headers } };
          (retryConfig.headers as Record<string, string>).Authorization =
            `Bearer ${newToken}`;
          try {
            const retryResult = await umiRequest(retryConfig.url || '', {
              ...retryConfig,
              skipErrorHandler: true,
            });
            resolve({ data: retryResult });
          } catch (e) {
            reject(e);
          }
        },
        reject: (err: any) => reject(err),
      });
    });
  }
};

// ================= Umi Request 网络配置 =================
export const request: RequestConfig = {
  baseURL: process.env.NODE_ENV === 'development' ? '' : process.env.API_URL,
  timeout: 10000,

  requestInterceptors: [
    (config: RequestOptions) => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken && config.headers) {
        (config.headers as Record<string, string>).Authorization =
          `Bearer ${accessToken}`;
      }
      return config;
    },
  ],

  responseInterceptors: [
    [
      // 1. 成功拦截器
      async (response: any) => {
        if (response?.data?.code === 40006) {
          return await handleTokenRefresh(response.config);
        }
        return response;
      },

      // 2. 失败拦截器
      async (error: any): Promise<any> => {
        const { response, config, name } = error;

        // ⭐ 核心修复 1：如果是我们手动抛出的业务报错 (BizError)，直接丢给 errorHandler，不要拦截！
        if (name === 'BizError') {
          return Promise.reject(error);
        }

        // 处理真实的 HTTP 401（虽然你的后端不用，但保留作为兜底）
        if (response?.status === 401) {
          return await handleTokenRefresh(config);
        }

        // ⭐ 核心修复 2：排除了 BizError 后，剩下的没有 response 的才是真正的网络断开或跨域问题
        if (!response) {
          notification.error({
            description: '您的网络发生异常，无法连接服务器',
            message: '网络异常',
          });
        }

        return Promise.reject(error);
      },
    ],
  ],

  errorConfig: {
    errorThrower: (res: any) => {
      const { success, data, code, msg } = res;
      if (!success) {
        const error: any = new Error(msg);
        error.name = 'BizError';
        error.info = { code, msg, data };
        throw error;
      }
    },
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;

      if (error.name === 'BizError') {
        const errorInfo = error.info;
        if (errorInfo) {
          const { msg, code } = errorInfo;
          if (code !== 40006) {
            message.error(msg); // 正常弹出业务错误，如 Qrcode already exists
          }
        }
      } else if (error.response) {
        message.error(`请求失败，状态码: ${error.response.status}`);
      } else if (error.request) {
        message.error('未收到服务器响应，请重试');
      } else {
        message.error('请求配置错误，请重试');
      }
    },
  },
};

// ================= 根容器渲染 =================
export function rootContainer(container: React.ReactNode) {
  return (
    <>
      <OfflineBanner />
      <ErrorBoundary>{container}</ErrorBoundary>
    </>
  );
}

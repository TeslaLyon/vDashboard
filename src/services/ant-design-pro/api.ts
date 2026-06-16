// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  return request<{
    data: API.CurrentUser;
  }>('/api/currentUser', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function sysConfig(options?: { [key: string]: any }) {
  return request<{
    data: API.SysConfig;
  }>('/api/sysConfig', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/login/outLogin', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 登录接口 POST /api/login/account */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>('/api/login/account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 刷新 Token 接口 */
export async function refreshToken(params: { refresh_token: string }) {
  return request<API.LoginResult>('/api/auth/refresh', {
    method: 'POST',
    data: params,
    // 注意：刷新接口不能再触发全局拦截器的刷新逻辑，否则会死循环
    skipErrorHandler: true,
  });
}

/**
 * 文件上传接口
 * 这里的 request 已经全局配置了拦截器，会自动带上 Bearer Token
 */
// export async function uploadFile(formData: FormData, options?: { [key: string]: any }) {
//   return request<{
//     status: string; // 比如 'done'
//     url: string;    // 后端返回的图片地址
//   }>('/api/upload', {
//     method: 'POST',
//     data: formData, // 直接将 FormData 传给 data
//     // 注意：不要手动设置 'Content-Type': 'multipart/form-data'
//     // 浏览器会自动识别 FormData 并设置带有边界(boundary)的正确 Content-Type
//     ...(options || {}),
//   });
// }

/** 更新规则 PUT /api/rule */
export async function updateSysConfig(options?: { [key: string]: any }) {
  return request<API.SysConfig>('/api/updateSysConfig', {
    method: 'POST',
    data: {
      method: 'update',
      ...(options || {}),
    },
  });
}

export async function getMonitorSettings(options?: { [key: string]: any }) {
  return request<{
    data: API.MonitorSettings;
  }>('/api/monitorSettings', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function addQRCode(options?: { [key: string]: any }) {
  return request<API.QRCodeListItem>('/api/qrcodes', {
    method: 'POST',
    data: {
      method: 'post',
      ...(options || {}),
    },
  });
}

/**
 * 获取二维码列表
 * GET /api/qrcodes
 */
export async function getQRcodes(
  // 推荐将参数显式定义出来，方便调用时有代码提示
  params: {
    page?: number;
    limit?: number;
    [key: string]: any; // 兼容其他搜索条件（如按照 state 筛选）
  },
  options?: { [key: string]: any }
) {
  // 泛型定义要和后端的 { success, code, msg, data } 完整结构对齐
  return request<{
    success: boolean;
    code: number;
    msg: string;
    data: API.QRCodeListResult;
  }>('/api/qrcodes', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/**
 * 删除二维码
 * DELETE /api/qrcodes/:id
 */
export async function deleteQRCode(
  params: { id: number | string },
  options?: { [key: string]: any }
) {
  // 💡 重点：使用 ES6 模板字符串将 id 动态拼接到 URL 中
  return request<Record<string, any>>(`/api/qrcodes/${params.id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

/**
 * 更新二维码状态
 * PUT /api/qrcodes/:id/status
 */
export async function updateQRCodeStatus(
  // 这里将 id 和 state 放在同一个参数对象里，方便外部调用
  data: { id: number | string; state: boolean | number | string },
  options?: { [key: string]: any }
) {
  // 将 id 结构出来用于 URL，剩下的状态字段作为请求体发送
  const { id, ...restData } = data;

  return request<Record<string, any>>(`/api/qrcodes/${id}/status`, {
    method: 'PUT',
    data: restData, // Umi request 中，PUT/POST 的 body 数据用 data 字段传递
    ...(options || {}),
  });
}


/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.NoticeIconList>('/api/notices', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取规则列表 GET /api/rule */
export async function rule(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.RuleList>('/api/rule', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 更新规则 PUT /api/rule */
export async function updateRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    data: {
      method: 'update',
      ...(options || {}),
    },
  });
}

/** 新建规则 POST /api/rule */
export async function addRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    data: {
      method: 'post',
      ...(options || {}),
    },
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/rule', {
    method: 'POST',
    data: {
      method: 'delete',
      ...(options || {}),
    },
  });
}

/**
 * 获取订单列表
 * GET /api/orders
 */
export async function getOrders(
  params: {
    page?: number;
    limit?: number;
    state?: number | string;
    type?: number | string;
    order_id?: string;
    user_id?: number | string;
    start_at?: string;
    end_at?: string;
    [key: string]: any;
  },
  options?: { [key: string]: any }
) {
  // 👇 重点修改这里的泛型返回结构，严格对齐你的后端 JSON
  return request<{
    code: number;
    msg: string;
    data: any[];
    meta: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  }>('/api/orders', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

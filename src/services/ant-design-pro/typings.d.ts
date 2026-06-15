// @ts-ignore
/* eslint-disable */

declare namespace API {
  type CurrentUser = {
    username?: string;
    avatar?: string;
    userid?: string;
    email?: string;
    signature?: string;
    title?: string;
    group?: string;
    tags?: { key?: string; label?: string }[];
    notifyCount?: number;
    unreadCount?: number;
    country?: string;
    access?: string;
    geographic?: {
      province?: { label?: string; key?: string };
      city?: { label?: string; key?: string };
    };
    address?: string;
    phone?: string;
  };

  type SysConfig = {
    userid?: uint;
    username?: string;
    access?: string;
    pay_page_salt?: string;
    monitor_app_salt?: string;
    appId?: string;
    notifyUrl?: string;
    returnUrl?: string;
    close?: int;
    payQf?: int8;
    wxpay?: string;
    zfbpay?: string;
  }

  type MonitorSettings = {
    monitor_app_salt?: string;
    appid?: string;
    lastheart?: int;
    lastpay?: int;
    jkstate?: int;
  }

  // type LoginResult = {
  //   status?: string;
  //   type?: string;
  //   currentAuthority?: string;
  //   access_token?: string;   // 加上后端返回的字段
  //   refresh_token?: string;  // 加上后端返回的字段
  //   success?: boolean;       // 手动加上这个属性，解决报错
  // };

  // 1. 定义内部 data 的具体结构
  type LoginData = {
    status?: string;
    type?: string;
    currentAuthority?: string;
    access_token?: string;
    refresh_token?: string;
  };

  // 2. 定义完整的请求返回结构
  type LoginResult = {
    success?: boolean;
    code?: number;
    msg?: string;
    data?: LoginData; // 👈 将 Token 移动到 data 属性中
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type RuleListItem = {
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
  };

  type QRCodeListItem = {
    id: number;
    user_id: number;
    pay_url: string; // 💡 重点：必须和后端的下划线保持一致
    price: number;
    type: number;
    state: number;
  };

  // 列表接口的 data 层数据结构
  type QRCodeListResult = {
    limit: number;
    page: number;
    total: number;
    list: QRCodeListItem[];
  };

  type RuleList = {
    data?: RuleListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    username?: string;
    password?: string;
    autoLogin?: boolean;
    type?: string;
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };

  // 如果你使用了统一响应格式，Umi 会自动处理外层的 success 和 data
  // 但为了类型安全，确保你的请求返回类型是这样的：
  type Response<T> = {
    success: boolean;
    code: number;
    msg: string;
    data: T;
  };
}

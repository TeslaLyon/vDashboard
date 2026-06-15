import { request } from '@umijs/max';

export async function getSystemConfig() {
  // 模拟请求延迟，便于你观察骨架屏效果
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        username: 'admin',
        country: 'amount_increase',
        // 注意：这里的 key 必须与表单的 name 一致才能自动回填
      });
    }, 1000);
  });
}

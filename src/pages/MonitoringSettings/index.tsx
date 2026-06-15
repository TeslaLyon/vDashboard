import {
  CopyOutlined,
  DownloadOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { ProCard, ProDescriptions } from '@ant-design/pro-components';
import { Button, Input, message, QRCode, Skeleton, Space, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/constants';
// 引入你定义好的 API 接口
import { getMonitorSettings } from '@/services/ant-design-pro/api';

export default () => {
  // 定义加载状态，初始为 true 以展示骨架屏
  const [loading, setLoading] = useState<boolean>(true);
  // 定义后端返回的数据状态
  const [monitorData, setMonitorData] = useState<API.MonitorSettings | null>(
    null,
  );

  // 页面挂载时请求数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getMonitorSettings();
        if (res && res.data) {
          setMonitorData(res.data);
        }
      } catch (error) {
        message.error('获取监控端数据失败');
      } finally {
        // 数据请求完成，关闭骨架屏
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 动态组装配置数据 (假设域名使用当前网页域名，或者你也可以写死)
  const currentHost = API_BASE_URL;
  const host = currentHost.replace(/^https?:\/\//, '');
  const configData = monitorData
    ? `${host}/${monitorData.monitor_app_salt}/${monitorData.appid}`
    : '';

  // 复制配置数据功能
  const handleCopy = async () => {
    if (!configData) {
      message.warning('配置数据为空');
      return;
    }
    await navigator.clipboard.writeText(configData);
    message.success('配置数据已复制到剪贴板');
  };

  return (
    <ProCard title="监控端状态" headerBordered style={{ margin: 16 }}>
      {/* 骨架屏组件包裹内容，loading 为 true 时展示灰色占位条 */}
      <Skeleton active loading={loading} paragraph={{ rows: 8 }}>
        <ProDescriptions
          bordered
          column={1} // 强制单列显示
          styles={{
            label: {
              width: '200px',
              backgroundColor: '#f8f9fa',
            },
            content: {
              color: '#333',
            },
          }}
        >
          <ProDescriptions.Item label="监控端状态">
            {/* 根据 jkstate 动态渲染 Tag */}
            {monitorData?.jkstate === 1 ? (
              <Tag
                color="success"
                style={{ padding: '2px 10px', borderRadius: '4px' }}
              >
                运行正常
              </Tag>
            ) : (
              <Tag
                style={{
                  color: '#faad14',
                  backgroundColor: '#fffbe6',
                  borderColor: '#ffe58f',
                  padding: '2px 10px',
                  borderRadius: '4px',
                }}
              >
                监控端未绑定，请您扫码绑定
              </Tag>
            )}
          </ProDescriptions.Item>

          <ProDescriptions.Item label="最后心跳">
            {/* 如果为 null 或 undefined，则显示 "无" */}
            {monitorData?.lastheart
              ? new Date(monitorData.lastheart * 1000).toLocaleString()
              : '无'}
          </ProDescriptions.Item>

          <ProDescriptions.Item label="最后收款">
            {monitorData?.lastpay
              ? new Date(monitorData.lastpay * 1000).toLocaleString()
              : '无'}
          </ProDescriptions.Item>

          <ProDescriptions.Item label="配置数据">
            <Space.Compact style={{ width: '100%', maxWidth: '800px' }}>
              <Input readOnly placeholder="加载中..." value={configData} />
              <Button
                icon={<CopyOutlined />}
                onClick={handleCopy}
                disabled={!configData}
              />
            </Space.Compact>
          </ProDescriptions.Item>

          <ProDescriptions.Item label="配置二维码">
            {configData ? (
              <QRCode
                value={configData}
                size={160} // 二维码大小
                errorLevel="H" // 容错率
              />
            ) : (
              <div
                style={{
                  width: 160,
                  height: 160,
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                }}
              >
                暂无数据
              </div>
            )}
          </ProDescriptions.Item>
        </ProDescriptions>

        {/* 底部按钮区域 */}
        <div
          style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}
        >
          <Space size="middle">{/* 保留你注释掉的按钮占位 */}</Space>
        </div>
      </Skeleton>
    </ProCard>
  );
};

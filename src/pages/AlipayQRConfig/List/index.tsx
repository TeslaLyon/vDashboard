import {
  type ActionType,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm, QRCode, Switch } from 'antd';
import React, { useRef } from 'react';

// 引入 api
import {
  deleteQRCode,
  getQRcodes,
  updateQRCodeStatus,
} from '@/services/ant-design-pro/api';

// ⭐ 优化 1：严格对齐后端的字段结构
type QRRecord = {
  id: number;
  user_id: number;
  pay_url: string; // 后端的二维码/支付链接
  price: number; // 后端的金额
  type: number;
  state: number; // 后端的状态 (通常 1 开启, 0/2 关闭)
};

const AlipayQRManager: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);

  // 定义表格列
  const columns: ProColumns<QRRecord>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '二维码',
      dataIndex: 'pay_url', // 对应后端的 pay_url
      width: 150,
      render: (url) => (
        <div
          style={{
            padding: 8,
            background: '#fff',
            display: 'inline-block',
            borderRadius: 8,
          }}
        >
          <QRCode value={url as string} size={100} bordered={false} />
        </div>
      ),
    },
    {
      title: '金额',
      dataIndex: 'price', // 对应后端的 price
      width: 100,
      render: (val) => `￥${val}`,
    },
    {
      title: '支付链接',
      dataIndex: 'pay_url', // 链接也是 pay_url
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'state', // 对应后端的 state
      width: 100,
      render: (_, record) => (
        <Switch
          // ⭐ 优化 2：将后端的数字状态转换为 Switch 组件需要的 true/false
          checked={record.state === 1}
          onChange={async (checked) => {
            try {
              // 将前端的布尔值转回后端需要的数字状态 (1: 开启, 0: 关闭)
              const targetState = checked ? 1 : 0;
              // 注意：请确保 updateQRCodeStatus 接口接收的字段是 state (或者根据你后端的实际参数名调整)
              await updateQRCodeStatus({ id: record.id, state: targetState });
              message.success(`状态已${checked ? '开启' : '关闭'}`);
              actionRef.current?.reload();
            } catch (error) {
              message.error('状态更新失败，请重试');
            }
          }}
        />
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 100,
      render: (_, record) => [
        <Popconfirm
          key="delete"
          title="确定要删除此二维码吗？"
          onConfirm={async () => {
            try {
              await deleteQRCode({ id: record.id });
              message.success('删除成功');
              actionRef.current?.reload();
            } catch (error) {
              message.error('删除失败，请重试');
            }
          }}
          okText="确定"
          cancelText="取消"
        >
          <Button type="primary" danger size="small">
            删除
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <div style={{ background: '#f0f2f5', padding: '24px', minHeight: '100vh' }}>
      <ProTable<QRRecord>
        headerTitle="支付宝二维码管理"
        actionRef={actionRef}
        columns={columns}
        rowKey="id"
        search={false}
        options={{
          density: false,
          fullScreen: false,
          reload: true,
          setting: true,
        }}
        // ⭐ 优化 3：桥接 ProTable 参数和后端实际参数
        request={async (params) => {
          try {
            const res = await getQRcodes({
              // ProTable 默认传 current 和 pageSize，我们需要将其转换为后端要的 page 和 limit
              page: params.current,
              limit: params.pageSize,
              type: 1,
            });

            return {
              // 剥去外层的 data，直接拿到内部的 list 数组
              data: res.data?.list || [],
              success: res.success, // 直接使用后端的 success 字段
              total: res.data?.total || 0, // 拿到总条数供分页器使用
            };
          } catch (error) {
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        pagination={{
          showTotal: (total) => `共 ${total} 条`,
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
      />
    </div>
  );
};

export default AlipayQRManager;

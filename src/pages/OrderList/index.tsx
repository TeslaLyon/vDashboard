import {
  type ActionType,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm, Space, Tag } from 'antd';
import React, { useRef } from 'react';

// 定义表格数据的类型
type OrderItem = {
  orderId: string;
  merchantOrderId: string;
  userId: string;
  paymentMethod: string;
  amount: number;
  actualAmount: number;
  status: string;
  createdAt: string;
};

export default () => {
  // 用于手动触发刷新等表格操作
  const actionRef = useRef<ActionType>(undefined);

  // 定义表格列及顶部的搜索表单
  const columns: ProColumns<OrderItem>[] = [
    {
      title: '订单号',
      dataIndex: 'orderId',
      width: 180,
      search: false, // 不在顶部搜索表单中显示
      render: (dom) => <div style={{ wordBreak: 'break-all' }}>{dom}</div>, // 允许长文本换行
    },
    {
      title: '商户订单号',
      dataIndex: 'merchantOrderId',
      width: 180,
      search: false,
      render: (dom) => <div style={{ wordBreak: 'break-all' }}>{dom}</div>,
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      width: 80,
      // 默认会生成 Input 搜索框，这里的配置是为了让 placeholder 符合截图
      fieldProps: { placeholder: '输入用户ID' },
    },
    {
      title: '支付方式',
      dataIndex: 'paymentMethod',
      search: false,
      width: 80,
    },
    {
      title: '订单金额',
      dataIndex: 'amount',
      search: false,
      width: 80,
    },
    {
      title: '实付金额',
      dataIndex: 'actualAmount',
      search: false,
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      // valueEnum 会自动把这个字段在搜索区变成下拉选择框，在表格区变成 Tag 标签
      valueEnum: {
        closed: { text: '已关闭', status: 'Error' }, // Error 对应红色柔和背景标签
        success: { text: '已支付', status: 'Success' },
        pending: { text: '待支付', status: 'Processing' },
      },
      fieldProps: { placeholder: '选择订单状态' },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      search: false,
      width: 120,
    },
    {
      title: '操作',
      valueType: 'option', // 定义为操作列
      width: 80,
      render: (text, record, _, action) => [
        <Popconfirm
          key="delete"
          title="确定要删除这条订单吗？"
          onConfirm={() => {
            message.success(`删除了订单 ${record.orderId}`);
            action?.reload(); // 重新加载表格数据
          }}
        >
          {/* 截图中的红色删除按钮 */}
          <Button type="primary" danger size="small">
            删除
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <ProTable<OrderItem>
      headerTitle="订单列表"
      actionRef={actionRef}
      rowKey="orderId"
      // 调整搜索表单的样式布局
      search={{
        labelWidth: 'auto',
        // 隐藏重置按钮和展开按钮，只保留查询按钮
        optionRender: (searchConfig, formProps, dom) => [
          <Button
            type="primary"
            key="search"
            onClick={() => formProps?.form?.submit()}
          >
            查询
          </Button>,
        ],
      }}
      // 配置右上角的自定义操作按钮
      toolBarRender={() => [
        <Button
          key="closeTimeout"
          style={{
            backgroundColor: '#fadb14',
            borderColor: '#fadb14',
            color: '#fff',
          }} // 橙黄色按钮
          onClick={() => message.info('执行关闭超时订单')}
        >
          关闭超时订单
        </Button>,
        <Button
          key="delExpired"
          type="primary"
          danger
          onClick={() => message.warning('执行删除过期订单')}
        >
          删除过期订单
        </Button>,
        <Button
          key="delHistory"
          type="primary"
          danger
          onClick={() => message.error('执行删除历史订单')}
        >
          删除历史订单
        </Button>,
      ]}
      columns={columns}
      // 模拟请求接口获取数据 (代替真实的 request={(params) => fetch(...)})
      request={async (params) => {
        console.log('搜索参数:', params);
        // 模拟延迟
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          data: [
            {
              orderId: 'VMQ20260518174024000106add3',
              merchantOrderId: 'PAY202605181740240001b8689944',
              userId: '1',
              paymentMethod: '支付宝',
              amount: 0.01,
              actualAmount: 0.01,
              status: 'closed',
              createdAt: '2026/05/18 17:40:24',
            },
            {
              orderId: 'VMQ202605181712150001128eea',
              merchantOrderId: 'PAY2026051817121500018775c1c6',
              userId: '1',
              paymentMethod: '支付宝',
              amount: 0.01,
              actualAmount: 0.01,
              status: 'closed',
              createdAt: '2026/05/18 17:12:15',
            },
            {
              orderId: 'VMQ2026051815383100011d9f44',
              merchantOrderId: 'PAY2026051815383100012a5ad0d0',
              userId: '1',
              paymentMethod: '支付宝',
              amount: 0.01,
              actualAmount: 0.01,
              status: 'closed',
              createdAt: '2026/05/18 15:38:31',
            },
          ],
          success: true,
          total: 3,
        };
      }}
      pagination={{
        pageSize: 10,
        showSizeChanger: false, // 截图中没有页码切换器
      }}
    />
  );
};

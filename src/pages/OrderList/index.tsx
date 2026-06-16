import {
  type ActionType,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm, Tag } from 'antd';
import React, { useRef } from 'react';
import { getOrders } from '@/services/ant-design-pro/api';

// 1. 严格按照后端 JSON 更新数据类型
type OrderItem = {
  id: number;
  user_id: number;
  order_id: string;
  pay_id: string; // 后端商户流水号字段
  type: number;
  price: number; // 后端订单金额字段
  really_price: number; // 后端实付金额字段
  state: number;
  create_date: number; // 10位时间戳
  pay_date: number;
  close_date: number;
};

export default () => {
  const actionRef = useRef<ActionType>(undefined);

  // 2. 更新表格列映射
  const columns: ProColumns<OrderItem>[] = [
    {
      title: '订单号',
      dataIndex: 'order_id',
      width: 180,
      fieldProps: { placeholder: '请输入订单号' },
      render: (dom) => <div style={{ wordBreak: 'break-all' }}>{dom}</div>,
    },
    {
      title: '商户订单号',
      dataIndex: 'pay_id', // 👈 修改为 pay_id
      width: 180,
      search: false,
      render: (dom) => <div style={{ wordBreak: 'break-all' }}>{dom}</div>,
    },
    {
      title: '用户ID',
      dataIndex: 'user_id',
      width: 80,
      fieldProps: { placeholder: '输入用户ID' },
    },
    {
      title: '支付方式',
      dataIndex: 'type',
      width: 80,
      valueEnum: {
        1: { text: '微信' },
        2: { text: '支付宝' },
      },
      fieldProps: { placeholder: '选择支付方式' },
    },
    {
      title: '订单金额',
      dataIndex: 'price', // 👈 修改为 price
      search: false,
      width: 80,
      // 假设如果后端传 100 代表 1.00 元，你可以用 render 转换：
      // render: (_, record) => `￥ ${(record.price / 100).toFixed(2)}`
    },
    {
      title: '实付金额',
      dataIndex: 'really_price', // 👈 修改为 really_price
      search: false,
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'state',
      width: 80,
      // 👈 同步了之前的 -1 状态
      valueEnum: {
        0: { text: '待支付', status: 'Processing' },
        1: { text: '已支付', status: 'Success' },
        '-1': { text: '已关闭', status: 'Error' },
      },
      fieldProps: { placeholder: '选择订单状态' },
    },
    // --- 日期区间搜索 ---
    {
      title: '创建时间',
      dataIndex: 'createdAtRange',
      valueType: 'dateRange',
      hideInTable: true,
      fieldProps: { placeholder: ['开始时间', '结束时间'] },
      search: {
        transform: (value) => {
          return {
            start_at: value[0],
            end_at: value[1],
          };
        },
      },
    },
    // --- 日期表格展示 ---
    {
      title: '创建时间',
      dataIndex: 'create_date', // 👈 修改为 create_date
      search: false,
      width: 160,
      valueType: 'dateTime', // Ant Design Pro 内置特性，自动将时间戳/日期对象格式化显示
      // 👈 因为后端是10位秒级时间戳，我们需要将其转为毫秒，组件才能正确渲染
      renderText: (text) => (text ? text * 1000 : '-'),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 80,
      render: (text, record, _, action) => [
        <Popconfirm
          key="delete"
          title="确定要删除这条订单吗？"
          onConfirm={() => {
            message.success(`删除了订单 ${record.order_id}`);
            action?.reload();
          }}
        >
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
      rowKey="id" // 👈 推荐使用后端返回的唯一自增主键 id 作为 rowKey
      search={{
        labelWidth: 'auto',
      }}
      columns={columns}
      request={async (params) => {
        // 组装查询参数，剔除空值
        const cleanPayload: Record<string, any> = {
          page: params.current || 1,
          limit: params.pageSize || 10,
        };

        if (params.state !== undefined && params.state !== '')
          cleanPayload.state = Number(params.state);
        if (params.type !== undefined && params.type !== '')
          cleanPayload.type = Number(params.type);
        if (params.order_id) cleanPayload.order_id = params.order_id;
        if (params.user_id) cleanPayload.user_id = Number(params.user_id);
        if (params.start_at) cleanPayload.start_at = params.start_at;
        if (params.end_at) cleanPayload.end_at = params.end_at;

        try {
          const result = await getOrders(cleanPayload);

          // 👈 重点：从正确的层级取数据和分页总数
          return {
            data: result.data || [],
            success: result.code === 200,
            total: result.meta?.total || 0, // 👈 从 meta 结构中读取 total
          };
        } catch (error) {
          console.error('获取订单列表失败', error);
          return {
            data: [],
            success: false,
            total: 0,
          };
        }
      }}
      pagination={{
        defaultPageSize: 10,
        showSizeChanger: true,
      }}
    />
  );
};

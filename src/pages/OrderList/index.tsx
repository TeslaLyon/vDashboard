import {
  type ActionType,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm } from 'antd';
import React, { useRef } from 'react';
import { getOrders } from '@/services/ant-design-pro/api';

// 1. 类型定义补齐新增的时间字段
type OrderItem = {
  id: number;
  user_id: number;
  order_id: string;
  pay_id: string;
  type: number;
  price: number;
  really_price: number;
  state: number;
  create_date: number;
  pay_date: number; // 👈 支付时间
  close_date: number; // 👈 关闭时间
  expire_at?: number; // 👈 过期时间（可能为可选）
};

/**
 * 严谨地将金额（分）转换为（元），并格式化输出
 * @param cents 后端返回的分级金额，支持 number、string 或空值
 * @returns 格式化后的字符串，如 "￥1.00" 或 "-"
 */
const formatCentToYuan = (
  cents: number | string | null | undefined,
): string => {
  // 1. 严格校验边界条件：如果是 null、undefined 或空字符串，直接返回 '-'
  if (cents === null || cents === undefined || cents === '') {
    return '-';
  }

  // 2. 转换为标准的数字类型
  const centsNum = Number(cents);

  // 3. 防御性编程：如果转换后不是一个合法数字（NaN），为了安全返回 '-'
  if (isNaN(centsNum)) {
    return '-';
  }

  // 4. 执行除法转换
  const yuan = centsNum / 100;

  // 5. 使用 toFixed(2) 强制保留两位小数，并拼接人民币符号
  // JavaScript 的整除 100 辅以 toFixed(2) 可以非常安全地处理分转元的显示精度
  return `${yuan.toFixed(2)}`;
};

export default () => {
  const actionRef = useRef<ActionType>(undefined);

  // 2. 表格列配置（加入了 fixed 和 width）
  const columns: ProColumns<OrderItem>[] = [
    {
      title: '订单号',
      dataIndex: 'order_id',
      width: 200,
      fixed: 'left', // 💡 固定在最左侧，不随滚动条挪动
      fieldProps: { placeholder: '请输入订单号' },
      render: (dom) => <div style={{ wordBreak: 'break-all' }}>{dom}</div>,
    },
    {
      title: '商户订单号',
      dataIndex: 'pay_id',
      width: 200,
      search: false,
      render: (dom) => <div style={{ wordBreak: 'break-all' }}>{dom}</div>,
    },
    {
      title: '用户ID',
      dataIndex: 'user_id',
      width: 60,
      fieldProps: { placeholder: '输入用户ID' },
    },
    {
      title: '支付方式',
      dataIndex: 'type',
      width: 100,
      valueEnum: {
        1: { text: '微信' },
        2: { text: '支付宝' },
      },
      fieldProps: { placeholder: '选择支付方式' },
    },
    {
      title: '订单金额',
      dataIndex: 'price',
      search: false,
      width: 100,
      // 💡 严谨渲染：使用自定义的转换工具
      render: (_, record) => formatCentToYuan(record.price),
    },
    {
      title: '实付金额',
      dataIndex: 'really_price',
      search: false,
      width: 100,
      // 💡 严谨渲染：使用自定义的转换工具
      render: (_, record) => formatCentToYuan(record.really_price),
    },
    {
      title: '状态',
      dataIndex: 'state',
      width: 100,
      valueEnum: {
        0: { text: '待支付', status: 'Processing' },
        1: { text: '已支付', status: 'Success' },
        '-1': { text: '已关闭', status: 'Error' },
      },
      fieldProps: { placeholder: '选择订单状态' },
    },
    // --- 日期区间搜索（保持隐藏不在表格展示） ---
    {
      title: '创建时间',
      dataIndex: 'createdAtRange',
      valueType: 'dateRange',
      hideInTable: true,
      fieldProps: { placeholder: ['开始时间', '结束时间'] },
      search: {
        transform: (value) => ({
          start_at: value[0],
          end_at: value[1],
        }),
      },
    },
    // --- 大量的时间展示列，它们会在中间舒适地横向滚动 ---
    {
      title: '创建时间',
      dataIndex: 'create_date',
      search: false,
      width: 160,
      valueType: 'dateTime', // 👈 只需要这一个属性
    },
    {
      title: '支付时间',
      dataIndex: 'pay_date',
      search: false,
      width: 160,
      valueType: 'dateTime',
    },
    {
      title: '关闭时间',
      dataIndex: 'close_date',
      search: false,
      width: 160,
      valueType: 'dateTime',
    },
    {
      title: '过期时间',
      dataIndex: 'expire_at',
      search: false,
      width: 160,
      valueType: 'dateTime',
    },
    // -------------------------------------------------
    {
      title: '操作',
      valueType: 'option',
      width: 100,
      fixed: 'right', // 💡 固定在最右侧，方便随时点击操作
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
      rowKey="id"
      search={{
        labelWidth: 'auto',
      }}
      columns={columns}
      // 3. ⭐ 开启横向滚动的关键属性
      // 这里的 x 可以设置为一个具体数值（通常是所有列的 width 累加值，这里大约是 1700px）
      // 这样多出来的列就会被收纳进滚动条中，页面不再拥挤
      scroll={{ x: 1730 }}
      request={async (params) => {
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

          // ⭐ 核心修改点：在这里集中处理 10 位时间戳和 0 值问题
          const formattedData = (result.data || []).map((item) => ({
            ...item,
            // 如果大于 0，转为毫秒；否则直接给 null，表格会自动显示为 '-'
            create_date:
              item.create_date && item.create_date > 0
                ? item.create_date * 1000
                : null,
            pay_date:
              item.pay_date && item.pay_date > 0 ? item.pay_date * 1000 : null,
            close_date:
              item.close_date && item.close_date > 0
                ? item.close_date * 1000
                : null,
            expire_at:
              item.expire_at && item.expire_at > 0
                ? item.expire_at * 1000
                : null,
          }));

          return {
            data: formattedData, // 👈 传入清洗后的数据
            success: result.code === 200,
            total: result.meta?.total || 0,
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

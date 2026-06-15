import { PlusOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import {
  Button,
  InputNumber,
  message,
  Popconfirm,
  Space,
  Table,
  Upload,
} from 'antd';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import React, { useState } from 'react';
import { addQRCode } from '@/services/ant-design-pro/api';
// 1. 引入你定义的工具方法
import { scanQRCode } from '@/utils/qrCode';

// 定义数据项结构
interface QRCodeRecord {
  uid: string;
  previewUrl: string; // 用于图片预览
  content: string; // 二维码解析出的内容
  amount: number; // 对应的金额
}

export default () => {
  // 核心状态：存储识别成功的二维码数据列表
  const [qrList, setQrList] = useState<QRCodeRecord[]>([]);
  // 控制提交按钮的 Loading 状态
  const [submitting, setSubmitting] = useState(false);
  // ================= 处理上传逻辑 =================
  const beforeUpload = async (file: RcFile) => {
    // 基础校验：格式与大小
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('请上传图片文件！');
      return Upload.LIST_IGNORE;
    }

    // 2. 调用你定义的工具函数进行解析
    const content = await scanQRCode(file);

    if (!content) {
      message.error('无法识别图片中的二维码，请更换清晰的图片！');
      return Upload.LIST_IGNORE;
    }

    // 3. 解析成功，生成预览图并加入列表
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const newRecord: QRCodeRecord = {
        uid: file.uid,
        previewUrl: reader.result as string,
        content: content,
        amount: 0.01, // 默认金额
      };
      setQrList((prev) => [...prev, newRecord]);
      message.success('识别成功！');
    };

    // 返回 false 阻止 antd 自动上传到服务器，由我们手动控制最后保存
    return false;
  };

  // ================= 操作处理 =================

  // 删除单条记录
  const handleDelete = (uid: string) => {
    setQrList((prev) => prev.filter((item) => item.uid !== uid));
  };

  // 修改金额
  const handleAmountChange = (uid: string, value: number | null) => {
    setQrList((prev) =>
      prev.map((item) =>
        item.uid === uid ? { ...item, amount: value || 0 } : item,
      ),
    );
  };

  // 保存所有数据
  // const handleSaveAll = () => {
  //   if (qrList.length === 0) {
  //     message.warning('请先添加至少一个二维码');
  //     return;
  //   }
  //   // 这里打印最终要提交给后端的数据结构
  //   console.log('提交数据:', qrList.map(item => ({ content: item.content, amount: item.amount })));
  //   message.success('数据已准备好提交后端');
  // };

  const handleSaveAll = async () => {
    if (qrList.length === 0) {
      message.warning('请先添加至少一个二维码');
      return;
    }

    setSubmitting(true);
    // 开启全局加载提示 (0 表示不会自动消失，直到手动 hide)
    const hide = message.loading('正在保存二维码，请稍候...', 0);

    try {
      // 1. 将 qrList 映射为 API 请求的 Promise 数组
      const requestPromises = qrList.map((item) => {
        return addQRCode({
          pay_url: item.content,
          price: item.amount,
          type: 2,
        });
      });

      // 2. 并发执行所有 API 请求
      await Promise.all(requestPromises);

      // 3. 全部成功后的收尾工作
      hide();
      message.success('所有二维码保存成功！');
      setQrList([]); // 清空列表，方便用户下一波操作
    } catch (error) {
      // 如果有任何一个请求失败，会进入这里
      hide();
      // message.error('保存过程中出现错误，请检查网络或重试');
      // console.error('批量保存失败:', error);
    } finally {
      // 无论成功失败，解除按钮禁用
      setSubmitting(false);
    }
  };

  // ================= UI 配置 =================

  // 同步 Upload 组件的展示列表（网格部分）
  const fileList: UploadFile[] = qrList.map((item) => ({
    uid: item.uid,
    name: 'qrcode.png',
    status: 'done',
    url: item.previewUrl,
  }));

  // 表格列定义
  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 70,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: '二维码',
      dataIndex: 'previewUrl',
      width: 120,
      render: (url: string) => (
        <img
          src={url}
          alt="qr"
          style={{
            width: 64,
            height: 64,
            borderRadius: 4,
            border: '1px solid #f0f0f0',
          }}
        />
      ),
    },
    {
      title: '内容',
      dataIndex: 'content',
      ellipsis: true,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 150,
      render: (amount: number, record: QRCodeRecord) => (
        <InputNumber
          min={0.01}
          step={0.01}
          precision={2}
          value={amount}
          onChange={(val) => handleAmountChange(record.uid, val)}
          style={{ width: '100px' }}
        />
      ),
    },
    {
      title: '操作',
      width: 80,
      render: (_: any, record: QRCodeRecord) => (
        <Popconfirm
          title="确定要删除这个二维码吗？"
          onConfirm={() => handleDelete(record.uid)}
          okText="确定"
          cancelText="取消"
        >
          <Button danger size="small">
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <ProCard title="添加微信二维码" headerBordered style={{ margin: 16 }}>
      {/* 顶部图片上传网格 */}
      <Upload
        listType="picture-card"
        fileList={fileList}
        beforeUpload={beforeUpload}
        onRemove={(file) => handleDelete(file.uid)} // 点击网格上的叉号也能同步删除
      >
        <div>
          <PlusOutlined style={{ fontSize: '24px', color: '#999' }} />
          <div style={{ marginTop: 8, color: '#666' }}>选择微信二维码</div>
        </div>
      </Upload>

      {/* 识别后的明细表格 */}
      {qrList.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <Table
            dataSource={qrList}
            columns={columns}
            rowKey="uid"
            pagination={false}
            bordered
          />
        </div>
      )}

      {/* 底部保存操作 */}
      <div
        style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}
      >
        <Button
          type="primary"
          size="large"
          onClick={handleSaveAll}
          disabled={qrList.length === 0}
          loading={submitting} // ⭐ 绑定 loading 状态
        >
          保存二维码
        </Button>
      </div>
    </ProCard>
  );
};

import {
  PageContainer,
  ProForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormUploadButton,
} from '@ant-design/pro-components';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, message, Skeleton } from 'antd';
import type { FC } from 'react';
import { useEffect } from 'react';

// 导入 API 和工具函数
import { sysConfig, updateSysConfig } from '@/services/ant-design-pro/api';
import { scanQRCode } from '@/utils/qrCode';
import useStyles from './style.style';

const BasicForm: FC<Record<string, any>> = () => {
  const { styles } = useStyles();
  const queryClient = useQueryClient();
  const [form] = ProForm.useForm();

  // 1. 声明 message API 用于处理 AntD 5.x 的上下文问题
  const [messageApi, contextHolder] = message.useMessage();

  // 获取初始数据
  const { data: response, isLoading } = useQuery({
    queryKey: ['system-config'],
    queryFn: () => sysConfig(),
  });

  // 回填数据
  useEffect(() => {
    if (response?.data) {
      form.setFieldsValue(response.data);
    }
  }, [response, form]);

  // 配置提交数据的 Mutation
  const { mutate: run, isPending } = useMutation({
    mutationFn: updateSysConfig,
    onSuccess: () => {
      messageApi.success('系统配置更新成功！');
      queryClient.invalidateQueries({ queryKey: ['system-config'] });
    },
    onError: (error) => {
      console.error('Submit Error:', error);
      messageApi.error('提交失败，请检查网络或重试');
    },
  });

  // 表单提交逻辑
  const onFinish = async (values: Record<string, any>) => {
    // 过滤掉仅用于预览的 file 对象，只提交识别后的字符串
    const { wxpay_file, zfbpay_file, ...submitData } = values;
    run(submitData);
  };

  return (
    <PageContainer content="">
      {/* 2. 注入 contextHolder，确保提示信息正常显示 */}
      {contextHolder}

      <Card variant="borderless">
        <Skeleton loading={isLoading} active paragraph={{ rows: 12 }}>
          <ProForm
            form={form}
            requiredMark={false}
            style={{ margin: 'auto', marginTop: 8, maxWidth: 600 }}
            name="basic"
            layout="vertical"
            onFinish={onFinish}
            submitter={{
              resetButtonProps: false,
              submitButtonProps: {
                loading: isPending,
              },
              searchConfig: {
                submitText: '保存系统配置',
              },
            }}
          >
            {/* --- 基础配置部分 --- */}
            <ProFormText
              width="lg"
              label="用户支付端通讯密钥"
              name="pay_page_salt"
              rules={[{ required: true }]}
            />
            <ProFormText
              width="md"
              label="用户名"
              name="username"
              rules={[{ required: true }]}
            />
            <ProFormText width="md" label="密码" name="password" />
            <ProFormDigit
              width="md"
              label="订单有效期（分钟）"
              name="close"
              rules={[{ required: true }]}
            />
            <ProFormText width="lg" label="异步回调地址" name="notifyUrl" />
            <ProFormText width="lg" label="同步回调地址" name="returnUrl" />
            <ProFormText
              width="lg"
              label="监控端通讯密钥"
              name="monitor_app_salt"
              rules={[{ required: true }]}
            />
            <ProFormText
              width="md"
              label="商户ID"
              name="appid"
              rules={[{ required: true }]}
            />

            <ProFormSelect
              width="sm"
              name="pay_qufen"
              label="区分方式"
              // ⭐ 关键：提交时自动将 value 转为 Number
              transform={(value) => ({ pay_qufen: Number(value) })}
              options={[
                { label: '金额递增', value: 1 },
                { label: '金额递减', value: 0 },
              ]}
            />

            <hr style={{ border: '0.5px solid #eee', margin: '24px 0' }} />

            {/* --- 微信收款配置 --- */}
            <ProFormUploadButton
              name="wxpay_file" // ⭐ 修改名字，避免与 wxpay 字符串冲突
              label="识别微信二维码"
              max={1}
              fieldProps={{
                accept: 'image/*',
                listType: 'picture-card',
                customRequest: async (options) => {
                  const { file, onSuccess } = options;
                  const qrContent = await scanQRCode(file as File);

                  if (qrContent) {
                    messageApi.success(`微信二维码识别成功`);
                    // ⭐ 将识别结果填入名为 wxpay 的文本框
                    form.setFieldsValue({ wxpay: qrContent });
                  } else {
                    messageApi.warning('未能识别二维码，请手动输入链接');
                  }
                  // 模拟上传成功，使预览图正常显示
                  onSuccess?.('ok');
                },
              }}
            />
            {/* 用于存储和显示识别后的字符串 */}
            <ProFormText
              name="wxpay"
              label="微信收款链接内容"
              placeholder="上传图片后自动识别，或在此手动输入"
            />

            {/* --- 支付宝收款配置 --- */}
            <ProFormUploadButton
              name="zfbpay_file" // ⭐ 修改名字
              label="识别支付宝二维码"
              max={1}
              fieldProps={{
                accept: 'image/*',
                listType: 'picture-card',
                customRequest: async (options) => {
                  const { file, onSuccess } = options;
                  const qrContent = await scanQRCode(file as File);

                  if (qrContent) {
                    messageApi.success(`支付宝二维码识别成功`);
                    // ⭐ 填入名为 zfbpay 的文本框
                    form.setFieldsValue({ zfbpay: qrContent });
                  } else {
                    messageApi.warning('未能识别二维码，请手动输入链接');
                  }
                  onSuccess?.('ok');
                },
              }}
            />
            <ProFormText
              name="zfbpay"
              label="支付宝收款链接内容"
              placeholder="上传图片后自动识别，或在此手动输入"
            />
          </ProForm>
        </Skeleton>
      </Card>
    </PageContainer>
  );
};

export default BasicForm;

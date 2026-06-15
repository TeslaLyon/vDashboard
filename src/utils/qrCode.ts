import jsQR from 'jsqr';

/**
 * 识别图片文件中的二维码
 * @param file 上传的图片文件
 * @returns 识别出的字符串内容，识别失败则返回 null
 */
export const scanQRCode = (file: File): Promise<string | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const image = new Image();
      image.src = e.target?.result as string;
      image.onload = () => {
        // 1. 创建隐藏的 Canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return resolve(null);

        canvas.width = image.width;
        canvas.height = image.height;

        // 2. 将图片绘制到 Canvas
        context.drawImage(image, 0, 0, image.width, image.height);

        // 3. 获取像素数据
        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        );

        // 4. 调用 jsQR 进行识别
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          resolve(code.data); // 识别成功
        } else {
          resolve(null); // 识别失败
        }
      };
    };
    reader.readAsDataURL(file);
  });
};

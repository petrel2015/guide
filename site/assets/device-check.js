// 设备检测开关 - 手动修改此值以启用/禁用检查

const ENABLE_DEVICE_CHECK = false;

const ALLOWED_USER_AGENT = "Mozilla/5.0 (iPhone; CPU iPhone OS 26_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1";

function isIPhone15ProMax() {
  // iPhone 15 Pro Max 屏幕尺寸检测
  // 逻辑分辨率: 430 x 932
  const width = window.screen.width;
  const height = window.screen.height;

  // 允许一定误差范围
  const targetWidth = 430;
  const targetHeight = 932;
  const tolerance = 5;

  const widthMatch = Math.abs(width - targetWidth) <= tolerance || Math.abs(width - targetHeight) <= tolerance;
  const heightMatch = Math.abs(height - targetHeight) <= tolerance || Math.abs(height - targetWidth) <= tolerance;

  return widthMatch && heightMatch;
}

export function checkDevice() {
  if (!ENABLE_DEVICE_CHECK) return;

  const ua = navigator.userAgent;

  // 必须同时满足 User-Agent 和屏幕尺寸
  if (ua !== ALLOWED_USER_AGENT || !isIPhone15ProMax()) {
    document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        text-align: center;
        padding: 20px;
      ">
        <h1 style="font-size: 72px; margin: 0; color: #333;">404</h1>
        <p style="font-size: 18px; color: #666; margin-top: 16px;">页面未找到</p>
      </div>
    `;
    throw new Error('Device not supported');
  }
}

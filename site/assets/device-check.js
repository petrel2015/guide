// 设备检测 - 只允许特定 User-Agent 访问

const ALLOWED_USER_AGENT = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1";

export function checkDevice() {
  const ua = navigator.userAgent;

  if (ua !== ALLOWED_USER_AGENT) {
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

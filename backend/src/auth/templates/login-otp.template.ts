interface LoginOtpTemplatePayload {
  appName: string;
  code: string;
  expiresInMinutes: number;
  logoUrl?: string;
  footerNote?: string;
}

const TEMPLATE_STYLES = `
  body {
    margin: 0;
    padding: 0;
    background-color: #f9f4ec;
    color: #3f3a34;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  }
  .wrapper {
    width: 100%;
    padding: 24px 0;
    background-color: #f9f4ec;
  }
  .container {
    max-width: 640px;
    margin: 0 auto;
    background-color: #fffaf2;
    border-radius: 12px;
    box-shadow: 0 18px 36px rgba(63, 58, 52, 0.08);
    overflow: hidden;
  }
  .header {
    background: linear-gradient(135deg, #f1dfc9 0%, #f7e9d4 100%);
    padding: 28px 24px;
    text-align: center;
  }
  .logo {
    display: inline-block;
  }
  .logo img {
    height: 48px;
    width: auto;
  }
  .body {
    padding: 36px 32px;
    line-height: 1.7;
  }
  .body p {
    margin: 0 0 16px;
    color: #514a43;
  }
  .code-box {
    background: #f7f0e6;
    border: 1px solid #e1d8cb;
    border-radius: 10px;
    padding: 16px 20px;
    font-size: 28px;
    letter-spacing: 6px;
    text-align: center;
    font-weight: 700;
    color: #3f3a34;
  }
  .footer {
    padding: 24px 32px 32px;
    background-color: #f4ede2;
    text-align: center;
    font-size: 13px;
    color: #6b645c;
    line-height: 1.6;
  }
  .footer a {
    color: #c08a3e;
    text-decoration: none;
    font-weight: 600;
  }
  @media (max-width: 600px) {
    .container {
      margin: 0 16px;
    }
    .body, .footer {
      padding: 28px 24px;
    }
  }
`;

const DEFAULT_LOGO =
  "https://yotelecom.co.uk/wp-content/uploads/2025/05/yo-telecom-logo-x143.webp";
const DEFAULT_FOOTER = `
  <p style="margin: 0 0 8px;">Copyright © 2025 YO TELECOM, All rights reserved.</p>
  <p style="margin: 0;">Where to find us:<br/>
  <a href="https://www.yotelecom.co.uk" target="_blank" rel="noopener noreferrer">WWW.YOTELECOM.CO.UK</a></p>
`;

export function buildLoginOtpEmail({
  appName,
  code,
  expiresInMinutes,
  logoUrl,
  footerNote,
}: LoginOtpTemplatePayload) {
  const subject = `${appName} login verification code`;
  const text = `Your ${appName} login verification code is ${code}. It expires in ${expiresInMinutes} minutes.`;
  const resolvedLogo = logoUrl || DEFAULT_LOGO;
  const resolvedFooter = footerNote || DEFAULT_FOOTER;

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${subject}</title>
    <style>${TEMPLATE_STYLES}</style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="header">
          <span class="logo">
            <img src="${resolvedLogo}" alt="${appName} Logo" />
          </span>
        </div>
        <div class="body">
          <p>Here is your one-time verification code to finish signing in to ${appName}:</p>
          <div class="code-box">${code}</div>
          <p style="margin-top: 20px;">This code expires in ${expiresInMinutes} minutes. If you did not request this code, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          ${resolvedFooter}
        </div>
      </div>
    </div>
  </body>
</html>`;

  return { subject, text, html };
}

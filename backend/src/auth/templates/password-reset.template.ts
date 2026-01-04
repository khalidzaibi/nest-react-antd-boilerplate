type PasswordResetTemplateParams = {
  appName: string;
  resetLink: string;
  supportEmail?: string;
};

const TEMPLATE_STYLES = `
  body {
    margin: 0;
    padding: 0;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    background-color: #f9f4ec;
    color: #3f3a34;
  }
  .wrapper {
    width: 100%;
    background-color: #f9f4ec;
    padding: 24px 0;
  }
  .container {
    max-width: 560px;
    margin: 0 auto;
    background-color: #fffaf2;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 18px 36px rgba(63, 58, 52, 0.08);
  }
  .header {
    padding: 32px 40px 24px;
    background: linear-gradient(135deg, #f1dfc9 0%, #f7e9d4 100%);
    color: #3f3a34;
  }
  .logo {
    display: inline-block;
    margin-bottom: 12px;
  }
  .logo img {
    height: 36px;
    width: auto;
    display: block;
  }
  .hero-title {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    letter-spacing: 0.3px;
    color: #3f3a34;
  }
  .body {
    padding: 32px 40px;
    line-height: 1.6;
    color: #514a43;
  }
  .callout {
    padding: 16px 20px;
    border-left: 4px solid #c08a3e;
    background-color: #f7f0e6;
    border-radius: 8px;
    margin: 24px 0;
  }
  .reset-button {
    display: inline-block;
    padding: 12px 24px;
    margin: 24px 0;
    border-radius: 8px;
    background: #c08a3e;
    color: #ffffff !important;
    text-decoration: none;
    font-weight: 600;
    letter-spacing: 0.2px;
  }
  .footer {
    padding: 24px 40px 32px;
    background-color: #f4ede2;
    font-size: 13px;
    color: #6b645c;
    line-height: 1.5;
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
    .header,
    .body,
    .footer {
      padding: 24px;
    }
    .hero-title {
      font-size: 22px;
    }
  }
`;

export const buildPasswordResetEmail = ({
  appName,
  resetLink,
  supportEmail,
}: PasswordResetTemplateParams) => {
  const subject = `Reset your ${appName} password`;

  const text = [
    `You requested to reset your password for ${appName}.`,
    "If you made this request, use the link below to set a new password.",
    resetLink,
    "If you did not request a password reset, you can safely ignore this email.",
    supportEmail
      ? `Need help? Contact us at ${supportEmail}.`
      : "Need help? Reply to this email.",
  ].join("\n\n");

  const logoImg =
    "https://yotelecom.co.uk/wp-content/uploads/2025/05/yo-telecom-logo-x143.webp";
  const footerSupport = supportEmail
    ? `If you have any questions, reach us at <a href="mailto:${supportEmail}">${supportEmail}</a>.`
    : "If you have any questions, simply reply to this email.";

  const html = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>${subject}</title>
    <style>${TEMPLATE_STYLES}</style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="header">
          <span class="logo">
            <img src="${logoImg}" alt="${appName} logo" />
          </span>
          <h1 class="hero-title">Password reset request</h1>
        </div>
        <div class="body">
          <p>Hi there,</p>
          <div class="callout">
            <strong>Someone requested a password reset for your ${appName} account.</strong><br/>
            If this was you, choose a new password using the button below.
          </div>
          <p style="margin: 0 0 18px;">For your security this link expires in 60 minutes.</p>
          <a href="${resetLink}" class="reset-button" target="_blank" rel="noopener noreferrer">
            Reset password
          </a>
          <p style="margin-top: 24px;">
            If the button doesn’t work, copy and paste this link into your browser:
          </p>
          <p style="word-break: break-all; background: #f7f0e6; padding: 12px 16px; border-radius: 6px;">
            <a href="${resetLink}" target="_blank" rel="noopener noreferrer">${resetLink}</a>
          </p>
          <p>If you didn’t request a password reset, please ignore this message—your password will stay the same.</p>
        </div>
        <div class="footer">
          <p>${footerSupport}</p>
          <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
        </div>
      </div>
    </div>
  </body>
</html>`;

  return { subject, text, html };
};

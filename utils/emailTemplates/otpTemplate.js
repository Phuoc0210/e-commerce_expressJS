function generateOtpEmail(otp) {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background-color: #007bff;
            color: #ffffff;
            text-align: center;
            padding: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 30px;
            text-align: center;
          }
          .otp {
            font-size: 32px;
            font-weight: bold;
            color: #007bff;
            margin: 20px 0;
            letter-spacing: 5px;
          }
          .content p {
            color: #333333;
            line-height: 1.6;
            margin: 10px 0;
          }
          .footer {
            background-color: #f8f9fa;
            text-align: center;
            padding: 15px;
            font-size: 14px;
            color: #777777;
          }
          @media only screen and (max-width: 600px) {
            .container {
              margin: 10px;
            }
            .content {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>OTP Verification</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>We have received a request to reset your password. Please use the OTP code below to verify:</p>
            <div class="otp">${otp}</div>
            <p>This OTP is valid for <strong>1 minute</strong>. If you did not request a password reset, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>If you need assistance, contact us at <a href="mailto:support@example.com">support@example.com</a>.</p>
            <p>© 2025 Your Company. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
}

module.exports = generateOtpEmail;

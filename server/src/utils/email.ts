import nodemailer from 'nodemailer';

// ── Transporter (Gmail SMTP) ──────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ── Send OTP Email ────────────────────────────────────────────────────────────
export const sendOtpEmail = async (to: string, otp: string, name: string) => {
    const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>رمز استعادة كلمة المرور</title>
    </head>
    <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;direction:rtl;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:32px;overflow:hidden;box-shadow:0 25px 60px rgba(0,0,0,0.5);">
              
              <!-- Header Bar -->
              <tr>
                <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6,#f43f5e);height:6px;"></td>
              </tr>
              
              <!-- Logo & Brand -->
              <tr>
                <td align="center" style="padding:40px 40px 20px;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:20px;padding:16px;width:56px;height:56px;text-align:center;vertical-align:middle;">
                        <span style="font-size:28px;">🚀</span>
                      </td>
                      <td style="padding-right:16px;vertical-align:middle;">
                        <div style="font-size:24px;font-weight:900;background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Sadeem Learn</div>
                        <div style="font-size:12px;color:#64748b;font-weight:700;letter-spacing:3px;text-transform:uppercase;">منصة المبدعين العرب</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding:20px 40px 40px;">
                  
                  <!-- Icon -->
                  <div style="text-align:center;margin-bottom:28px;">
                    <div style="display:inline-block;background:rgba(99,102,241,0.15);border:2px solid rgba(99,102,241,0.3);border-radius:24px;padding:24px;font-size:48px;">🔑</div>
                  </div>

                  <!-- Title -->
                  <h1 style="color:#f8fafc;font-size:28px;font-weight:900;text-align:center;margin:0 0 12px;">استعادة كلمة المرور</h1>
                  <p style="color:#94a3b8;font-size:16px;text-align:center;margin:0 0 32px;font-weight:600;">مرحباً <strong style="color:#6366f1;">${name}</strong>، تلقينا طلباً لإعادة تعيين كلمة مرورك.</p>

                  <!-- OTP Box -->
                  <div style="background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.15));border:2px solid rgba(99,102,241,0.4);border-radius:24px;padding:32px;text-align:center;margin-bottom:28px;">
                    <p style="color:#64748b;font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 16px;">رمز التحقق الخاص بك</p>
                    <div style="letter-spacing:16px;font-size:52px;font-weight:900;color:#6366f1;font-family:monospace;margin:0;">${otp}</div>
                    <p style="color:#ef4444;font-size:13px;font-weight:700;margin:16px 0 0;">⏱️ صالح لمدة 15 دقيقة فقط</p>
                  </div>

                  <!-- Warning -->
                  <div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:16px;padding:16px;margin-bottom:28px;">
                    <p style="color:#f59e0b;font-size:13px;font-weight:700;margin:0;text-align:center;">⚠️ إذا لم تطلب هذا، تجاهل هذا البريد بأمان. حسابك بخير.</p>
                  </div>

                  <!-- Steps -->
                  <div style="background:#0f172a;border-radius:20px;padding:24px;">
                    <p style="color:#475569;font-size:13px;font-weight:700;margin:0 0 16px;text-transform:uppercase;letter-spacing:2px;">خطوات الاسترداد:</p>
                    ${['أدخل الرمز في نافذة التحقق', 'اختر كلمة مرور جديدة وقوية', 'سجل دخولك بكلمة المرور الجديدة'].map((step, i) => `
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                      <div style="width:28px;height:28px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:white;flex-shrink:0;text-align:center;line-height:28px;">${i + 1}</div>
                      <span style="color:#94a3b8;font-size:14px;font-weight:600;">${step}</span>
                    </div>`).join('')}
                  </div>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#0f172a;padding:24px 40px;text-align:center;border-top:1px solid #1e293b;">
                  <p style="color:#334155;font-size:12px;font-weight:600;margin:0;">© ${new Date().getFullYear()} Sadeem Learn — جميع الحقوق محفوظة</p>
                  <p style="color:#1e293b;font-size:11px;margin:8px 0 0;">هذا البريد أُرسل تلقائياً، يرجى عدم الرد عليه.</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    await transporter.sendMail({
        from: `"Sadeem Learn 🚀" <${process.env.EMAIL_USER}>`,
        to,
        subject: `🔑 رمز استعادة كلمة المرور - ${otp}`,
        html,
    });
};

// ── Send Welcome Email ────────────────────────────────────────────────────────
export const sendWelcomeEmail = async (to: string, name: string) => {
    const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head><meta charset="UTF-8"></head>
    <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;direction:rtl;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:32px;overflow:hidden;">
              <tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6,#f43f5e);height:6px;"></td></tr>
              <tr>
                <td style="padding:60px 40px;text-align:center;">
                  <div style="font-size:64px;margin-bottom:24px;">🎉</div>
                  <h1 style="color:#f8fafc;font-size:32px;font-weight:900;margin:0 0 16px;">أهلاً وسهلاً ${name}!</h1>
                  <p style="color:#94a3b8;font-size:18px;font-weight:600;margin:0 0 32px;">نسعد بانضمامك إلى مجتمع مبدعي المستقبل في Sadeem Learn 🚀</p>
                  <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:20px;padding:20px 40px;display:inline-block;">
                    <a href="${process.env.CLIENT_URL}/student-dashboard" style="color:white;font-size:18px;font-weight:900;text-decoration:none;">ابدأ رحلتك الآن ←</a>
                  </div>
                </td>
              </tr>
              <tr><td style="background:#0f172a;padding:20px;text-align:center;">
                <p style="color:#334155;font-size:12px;margin:0;">© ${new Date().getFullYear()} Sadeem Learn</p>
              </td></tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>`;

    await transporter.sendMail({
        from: `"Sadeem Learn 🚀" <${process.env.EMAIL_USER}>`,
        to,
        subject: '🎉 مرحباً بك في Sadeem Learn!',
        html,
    });
};

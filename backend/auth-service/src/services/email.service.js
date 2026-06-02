// filepath: src/services/email.service.js
const nodemailer = require('nodemailer');

function crearTransporter() {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

async function enviarEmailRecuperacion(correo, token, nombre) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[EMAIL] Sin configuración SMTP. Token dev para ${correo}: ${token}`);
    return false;
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
  const nombreMostrar = nombre || 'Usuario';

  const transporter = crearTransporter();

  await transporter.sendMail({
    from: `"PetMatch" <${process.env.EMAIL_USER}>`,
    to: correo,
    subject: 'Recuperar contraseña — PetMatch',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;background:#faf8f5;">
        <div style="background:white;border-radius:16px;padding:40px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <div style="text-align:center;margin-bottom:28px;">
            <span style="font-size:44px;">🐾</span>
            <h1 style="font-family:Georgia,serif;color:#1a1a1a;margin:8px 0 0;font-size:26px;">PetMatch</h1>
          </div>
          <h2 style="color:#1a1a1a;margin:0 0 10px;">Recuperar contraseña</h2>
          <p style="color:#6b7280;margin-bottom:28px;line-height:1.6;">
            Hola <strong>${nombreMostrar}</strong>, recibimos una solicitud para restablecer la contraseña de tu cuenta.
          </p>
          <div style="text-align:center;margin-bottom:32px;">
            <a href="${resetUrl}"
               style="display:inline-block;background:#1a1a1a;color:white;padding:14px 36px;
                      border-radius:10px;text-decoration:none;font-weight:700;font-size:16px;">
              Cambiar contraseña
            </a>
          </div>
          <p style="color:#9ca3af;font-size:13px;text-align:center;margin-bottom:20px;">
            Este enlace expira en <strong>1 hora</strong>. Si no solicitaste esto, puedes ignorar este correo.
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
          <p style="color:#9ca3af;font-size:12px;text-align:center;">
            Si el botón no funciona, copia este enlace en tu navegador:<br>
            <a href="${resetUrl}" style="color:#4f46e5;word-break:break-all;font-size:11px;">${resetUrl}</a>
          </p>
        </div>
      </div>
    `,
  });

  return true;
}

module.exports = { enviarEmailRecuperacion };
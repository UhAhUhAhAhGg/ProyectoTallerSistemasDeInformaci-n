// filepath: src/services/email.service.js

let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch {
  console.warn('[EMAIL] nodemailer no instalado. Ejecuta: npm install nodemailer');
}

function crearTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,          // true para port 465, false para 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

async function enviarEmailRecuperacion(correo, token, nombre) {
  if (!nodemailer || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`\n[EMAIL - DEV] Token de recuperación para ${correo}:\n  ${token}\n`);
    return false;
  }

  const frontendUrl   = process.env.FRONTEND_URL || 'http://localhost:5174';
  const resetUrl      = `${frontendUrl}/reset-password?token=${token}`;
  const nombreMostrar = nombre || 'Usuario';

  try {
    const transporter = crearTransporter();

    // Verifica conexión antes de enviar
    await transporter.verify();

    await transporter.sendMail({
      from:    `"PetMatch" <${process.env.EMAIL_USER}>`,
      to:      correo,
      subject: 'Recuperar contraseña — PetMatch',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;
                    padding:40px 20px;background:#faf8f5;">
          <div style="background:white;border-radius:16px;padding:40px;
                      box-shadow:0 4px 24px rgba(0,0,0,0.08);">

            <div style="text-align:center;margin-bottom:28px;">
              <div style="font-size:44px;">🐾</div>
              <h1 style="font-family:Georgia,serif;color:#1a1a1a;
                         margin:8px 0 0;font-size:26px;">PetMatch</h1>
            </div>

            <h2 style="color:#1a1a1a;margin:0 0 10px;">
              Recuperar contraseña
            </h2>
            <p style="color:#6b7280;margin-bottom:28px;line-height:1.6;">
              Hola <strong>${nombreMostrar}</strong>, recibimos una solicitud
              para restablecer la contraseña de tu cuenta en PetMatch.
            </p>

            <div style="text-align:center;margin-bottom:32px;">
              <a href="${resetUrl}"
                 style="display:inline-block;background:#1a1a1a;color:white;
                        padding:14px 36px;border-radius:10px;text-decoration:none;
                        font-weight:700;font-size:16px;">
                Cambiar contraseña
              </a>
            </div>

            <div style="background:#fef9c3;border-radius:8px;padding:12px 16px;
                        margin-bottom:20px;border:1px solid #fde68a;">
              <p style="color:#713f12;font-size:13px;margin:0;">
                ⏱ Este enlace expira en <strong>1 hora</strong>.
                Si no solicitaste esto, ignora este correo — tu contraseña
                no cambiará.
              </p>
            </div>

            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
            <p style="color:#9ca3af;font-size:12px;text-align:center;">
              Si el botón no funciona, copia este enlace en tu navegador:<br>
              <a href="${resetUrl}"
                 style="color:#4f46e5;word-break:break-all;font-size:11px;">
                ${resetUrl}
              </a>
            </p>

          </div>
        </div>
      `,
    });

    console.log(`[EMAIL] Email enviado a ${correo}`);
    return true;
  } catch (err) {
    console.error('[EMAIL] Error al enviar:', err.message);
    return false;
  }
}

module.exports = { enviarEmailRecuperacion };
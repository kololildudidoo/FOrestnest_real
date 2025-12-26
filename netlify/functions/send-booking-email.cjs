const nodemailer = require('nodemailer');

const formatDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('fi-FI', { year: 'numeric', month: 'numeric', day: 'numeric' });
};

const formatBool = (value) => (value ? 'Kyllä' : 'Ei');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { startDate, endDate, userDetails } = payload || {};
  const email = userDetails?.email;
  if (!email) {
    return { statusCode: 400, body: 'Missing user email' };
  }

  const host = process.env.TITAN_SMTP_HOST;
  const port = Number(process.env.TITAN_SMTP_PORT || 465);
  const user = process.env.TITAN_SMTP_USER;
  const pass = process.env.TITAN_SMTP_PASS;
  const from = process.env.TITAN_FROM_EMAIL || user;
  const adminEmail = process.env.BOOKING_NOTIFY_EMAIL || 'keanne_mei@yahoo.com';

  if (!host || !user || !pass || !from) {
    return { statusCode: 500, body: 'SMTP configuration missing' };
  }

  const start = formatDate(startDate);
  const end = formatDate(endDate);
  const adults = Number(userDetails?.adults || 0);
  const children = Number(userDetails?.children || 0);
  const hasPets = Boolean(userDetails?.hasPets);
  const extras = userDetails?.extras || {};
  const totalPrice = userDetails?.totalPrice ?? '-';

  const confirmationText = [
    `Kiitos varauksesta, ${userDetails?.name || ''}!`,
    '',
    'Varaustiedot:',
    `Ajankohta: ${start} - ${end}`,
    `Henkilot: ${adults} aikuista, ${children} lasta`,
    `Lemmikki mukana: ${formatBool(hasPets)}`,
    `Polttopuut: ${formatBool(extras.firewood)}`,
    `Joustava aika: ${formatBool(extras.lateCheckout)}`,
    `Hinta yhteensa: ${totalPrice} EUR`,
    '',
    'Vastaamme pian vahvistuksella.',
  ].join('\n');

  const adminText = [
    'Uusi varauspyynto:',
    `Nimi: ${userDetails?.name || '-'}`,
    `Sahkoposti: ${email}`,
    `Ajankohta: ${start} - ${end}`,
    `Henkilot: ${adults} aikuista, ${children} lasta`,
    `Lemmikki mukana: ${formatBool(hasPets)}`,
    `Polttopuut: ${formatBool(extras.firewood)}`,
    `Joustava aika: ${formatBool(extras.lateCheckout)}`,
    `Hinta yhteensa: ${totalPrice} EUR`,
    userDetails?.notes ? `Lisatiedot: ${userDetails.notes}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  try {
    await Promise.all([
      transporter.sendMail({
        from,
        to: email,
        subject: 'Forest Nest - Varausvahvistus',
        text: confirmationText,
      }),
      transporter.sendMail({
        from,
        to: adminEmail,
        subject: 'Forest Nest - Uusi varaus',
        text: adminText,
      }),
    ]);
  } catch (error) {
    console.error('Email send failed', error);
    return { statusCode: 500, body: 'Email send failed' };
  }

  return { statusCode: 200, body: 'OK' };
};

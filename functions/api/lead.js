/* functions/api/lead.js
   Принимает заявку (POST /api/lead, JSON), валидирует и пересылает в Telegram.
   Токен и chat_id — в переменных окружения проекта, не в коде. */

export async function onRequestPost({ request, env }) {
  let d;
  try {
    d = await request.json();
  } catch (e) {
    return json({ ok: false, error: 'bad_request' }, 400);
  }

  if (d.company) return json({ ok: true }, 200);

  var name = String(d.name || '').trim().slice(0, 100);
  var phone = String(d.phone || '').replace(/\D/g, '');
  if (!name || phone.length !== 11) {
    return json({ ok: false, error: 'validation' }, 400);
  }

  var delivered = false;
  try {
    var r = await fetch('https://api.telegram.org/bot' + env.TG_TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TG_CHAT_ID,
        text: buildText(d, name, phone),
        parse_mode: 'HTML'
      })
    });
    delivered = r.ok;
    if (!r.ok) console.error('telegram', r.status);
  } catch (e) {
    console.error('telegram unreachable', e);
  }

  if (!delivered) return json({ ok: false, error: 'delivery' }, 502);
  return json({ ok: true }, 200);
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildText(d, name, phone) {
  var parts = ['<b>🎂 Новая заявка</b>', '<b>Форма:</b> ' + esc(d.form || 'День рождения — заявка')];
  if (d.tariff) {
    var t = '<b>Тариф:</b> ' + esc(d.tariff);
    if (d.total) t += ' — расчёт ' + Number(d.total).toLocaleString('ru-RU') + ' ₽';
    parts.push(t);
  }
  if (d.guests) parts.push('<b>Детей:</b> ' + esc(d.guests));
  if (d.when) parts.push('<b>Когда:</b> ' + esc(d.when));
  if (d.extras) parts.push('<b>Допы:</b> ' + esc(d.extras));
  if (Number(d.discount) > 0) parts.push('<b>Скидка за будни:</b> −' + Number(d.discount).toLocaleString('ru-RU') + ' ₽');
  if (d.summary) parts.push('<b>Расчёт с сайта:</b>\n<pre>' + esc(d.summary) + '</pre>');
  parts.push('<b>Имя:</b> ' + esc(name));
  parts.push('<b>Телефон:</b> ' + esc(d.phone));
  parts.push('<b>Связь:</b> ' + esc(d.contact || 'Звонок'));
  if (d.comment) parts.push('<b>Комментарий:</b> ' + esc(d.comment));
  if (d.page) parts.push('<b>Страница:</b> ' + esc(d.page));
  return parts.join('\n');
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * The Million Attempt landing page — the instant preview.
 * Zero-dep Node (+pg). The front end IS the Claude Design file in design/ —
 * served verbatim with one injected flag, so design and production never drift.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { init, q } from './src/db.js';
import { runPipeline } from './src/agents.js';
import { sendReportEmail, notifyMP } from './src/email.js';
import { samples } from './src/samples.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4400;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

const landingHtml = fs.readFileSync(path.join(ROOT, 'design', 'landing.html'), 'utf8')
  .replace('</body>', '<script>window.MA_LIVE=true</script>\n</body>');
const reportTemplate = fs.readFileSync(path.join(ROOT, 'design', 'report.html'), 'utf8');

function reportPage(payload) {
  return reportTemplate.replace(
    /<script id="payload" type="application\/json">[\s\S]*?<\/script>/,
    `<script id="payload" type="application/json">${JSON.stringify(payload).replace(/</g, '\\u003c')}</script>`,
  );
}

function livePayload(run) {
  const r = run.report;
  return {
    kicker: 'Prepared for you · code63labs',
    title: r.title,
    meta: `Mini-report · written by Meschelle's team · ${new Date(run.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
    trouble: run.trouble,
    diagnosis: r.diagnosis,
    bigNumber: r.bigNumber,
    bigNumberLabel: r.bigNumberLabel,
    diagnosis2: r.diagnosis2,
    theses: r.theses,
    limits: r.limits,
    offer: r.offer,
    source: r.bigNumber ? 'Report numbers carry their sources inline · nothing invented' : 'This report uses no statistics — reasoning only, honestly labeled',
  };
}

// light per-IP throttle on run starts — protects the API spend, not a fortress
const starts = new Map();
function throttled(ip) {
  const now = Date.now();
  const recent = (starts.get(ip) || []).filter((t) => now - t < 3600_000);
  starts.set(ip, recent);
  if (recent.length >= 6) return true;
  recent.push(now);
  return false;
}

const json = (res, code, obj) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)); };
const html = (res, code, body) => { res.writeHead(code, { 'content-type': 'text/html; charset=utf-8' }); res.end(body); };
const readBody = (req) => new Promise((resolve, reject) => {
  let data = '';
  req.on('data', (c) => { data += c; if (data.length > 20_000) { reject(new Error('too large')); req.destroy(); } });
  req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch { resolve({}); } });
});

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, BASE_URL);
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
  try {
    if (req.method === 'GET' && url.pathname === '/') return html(res, 200, landingHtml);
    if (req.method === 'GET' && url.pathname === '/healthz') return json(res, 200, { ok: true });

    if (req.method === 'GET' && url.pathname.startsWith('/sample/')) {
      const s = samples[url.pathname.slice(8)];
      return s ? html(res, 200, reportPage(s)) : html(res, 404, 'Not found');
    }

    if (req.method === 'POST' && url.pathname === '/api/trouble') {
      const { trouble } = await readBody(req);
      const text = String(trouble || '').trim();
      if (text.length < 12 || text.length > 1200) return json(res, 400, { error: 'tell us a bit more' });
      if (throttled(ip)) return json(res, 429, { error: 'slow down a little' });
      const id = crypto.randomUUID();
      const token = crypto.randomBytes(16).toString('hex');
      await q('INSERT INTO ma_runs (id, token, trouble, ip) VALUES ($1, $2, $3, $4)', [id, token, text, ip]);
      runPipeline(id); // async — the visitor polls
      return json(res, 200, { id });
    }

    const runMatch = url.pathname.match(/^\/api\/run\/([0-9a-f-]{36})$/);
    if (req.method === 'GET' && runMatch) {
      const { rows: [run] } = await q('SELECT stage, status, excerpt FROM ma_runs WHERE id = $1', [runMatch[1]]);
      return run ? json(res, 200, run) : json(res, 404, { error: 'unknown run' });
    }

    const emailMatch = url.pathname.match(/^\/api\/run\/([0-9a-f-]{36})\/email$/);
    if (req.method === 'POST' && emailMatch) {
      const { email } = await readBody(req);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ''))) return json(res, 400, { error: 'that email looks off' });
      const { rows: [run] } = await q('SELECT * FROM ma_runs WHERE id = $1', [emailMatch[1]]);
      if (!run || run.status !== 'ready') return json(res, 409, { error: 'report not ready' });
      const reportUrl = `${BASE_URL}/r/${run.token}`;
      await q('UPDATE ma_runs SET email = $2, emailed_at = now() WHERE id = $1', [run.id, email]);
      try {
        await sendReportEmail({ to: email, report: run.report, reportUrl });
        notifyMP({ trouble: run.trouble, email, reportUrl }).catch((e) => console.error('[notify]', e.message));
      } catch (e) {
        console.error('[email]', e.message);
        // the report link still works even if email delivery hiccups
      }
      return json(res, 200, { reportUrl });
    }

    const tokenMatch = url.pathname.match(/^\/r\/([0-9a-f]{32})$/);
    if (req.method === 'GET' && tokenMatch) {
      const { rows: [run] } = await q('SELECT * FROM ma_runs WHERE token = $1', [tokenMatch[1]]);
      if (!run || run.status !== 'ready') return html(res, 404, 'Not found');
      return html(res, 200, reportPage(livePayload(run)));
    }

    html(res, 404, 'Not found');
  } catch (err) {
    console.error('[server]', err.message);
    json(res, 500, { error: 'server error' });
  }
});

await init();
server.listen(PORT, () => console.log(`million-attempt-landing on :${PORT}`));

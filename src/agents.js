/**
 * The team. Two real Claude passes per trouble:
 *   A (read+size)  — restate the trouble, classify the business, frame the diagnosis
 *   B (draft)      — write the full mini-report as structured JSON
 *
 * Honesty rules are enforced in the prompts and mirrored in the report template:
 * no invented statistics — a number appears only when its source is named inline
 * or when it's arithmetic on the visitor's own words; the "what this report
 * can't know" box ships in every report.
 */
import { q } from './db.js';

const API = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-opus-4-8';

async function claude(body) {
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  if (data.stop_reason === 'refusal') throw new Error('model declined');
  return data.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
}

const REPORT_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    title: { type: 'string', description: 'Cormorant headline, under 9 words, states the reframe — e.g. "The empty chairs are a system, not bad luck."' },
    diagnosis: { type: 'string', description: '2-4 sentences: what is actually going on, warm and plain. If it ends leading into the big number, end with a colon.' },
    bigNumber: { type: ['string', 'null'], description: 'ONE display figure, only if honest — either arithmetic from the visitor\'s own words or a well-established published figure. Short, e.g. "≈7" or "23%". null if no honest number exists.' },
    bigNumberLabel: { type: ['string', 'null'], description: 'What the figure is AND where it comes from, source named inline. null when bigNumber is null.' },
    diagnosis2: { type: 'string', description: '1-3 sentences after the number: the turn — why this stays unfixed. Knowing was never the bottleneck; name the real one.' },
    theses: {
      type: 'array', description: 'EXACTLY three theses — the specific suspicions about THIS business that would decide the fix, most decisive first.',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          thesis: { type: 'string', description: 'One sentence: a specific, falsifiable suspicion about this business — an unknown that decides what the fix should be. Never generic advice.' },
          check: { type: 'string', description: '1-2 sentences: exactly what we would look at to confirm or kill it — which records, over what window, split how. Name data the owner actually has.' },
          fix: { type: 'string', description: '1-2 sentences: the fix IF the thesis holds — and, where natural, what a different finding would mean instead.' },
        },
        required: ['thesis', 'check', 'fix'],
      },
    },
    limits: { type: 'string', description: '2-3 sentences: what this report cannot know from one paragraph. Specific, not boilerplate.' },
    offer: { type: 'string', description: '1-2 sentences: under the $500 plan the team runs exactly these checks on the owner\'s real records, then builds the fix the evidence picks — the owner approves everything before it goes live. Tie it to THESE theses, not generic help.' },
  },
  required: ['title', 'diagnosis', 'bigNumber', 'bigNumberLabel', 'diagnosis2', 'theses', 'limits', 'offer'],
};

const VOICE = `You write as Meschelle Peterson's team at code63labs — a small-business fixer who writes plainly and warmly, like a knowledgeable friend who ran the numbers. Short sentences. No hype, no consultant-speak, no "leverage/optimize/streamline", no emoji.

IRONCLAD HONESTY RULES:
- Never invent a statistic. A number may appear ONLY if (a) it is arithmetic on what the visitor themselves wrote, or (b) it is a well-established published figure and you name the source inline right where the number appears. When unsure, write without numbers — plain reasoning is better than a shaky figure.
- Never pretend to know their business. The report is written from one paragraph and says so.
- Never promise outcomes. Describe mechanisms, not guarantees.

THE DUH TEST (most important quality bar):
The reader has lived with this trouble for years and has already heard every listicle. If a sentence could appear in a generic article ("send reminder texts", "follow up more", "post consistently", "improve your customer service"), CUT IT. The report's job is not advice — it is naming the specific unknowns in THIS business that decide what the fix should be, and exactly how to check each one. A thesis must be falsifiable and its check must point at records the owner actually has (their calendar, their quotes, their POS, their reviews, their books). Write like an investigator opening a case, not a coach giving tips. Assume the owner is smart and has already tried the obvious.`;

export async function runPipeline(runId) {
  const { rows: [run] } = await q('SELECT * FROM ma_runs WHERE id = $1', [runId]);
  try {
    // ── pass A: read + size ──
    const a = JSON.parse(await claude({
      model: MODEL, max_tokens: 2000,
      thinking: { type: 'adaptive' },
      output_config: {
        effort: 'low',
        format: {
          type: 'json_schema',
          schema: {
            type: 'object', additionalProperties: false,
            properties: {
              business: { type: 'string', description: 'what kind of business this sounds like, plainly' },
              category: { type: 'string', description: 'the trouble in 2-5 words' },
              angle: { type: 'string', description: 'one sentence: the most useful reframe of this trouble' },
            },
            required: ['business', 'category', 'angle'],
          },
        },
      },
      system: VOICE,
      messages: [{ role: 'user', content: `A business owner typed this into the box:\n\n"${run.trouble}"\n\nRead it and size it up.` }],
    }));
    await q('UPDATE ma_runs SET stage = $2 WHERE id = $1', [runId, 'size']);

    // ── pass B: draft the report ──
    await q('UPDATE ma_runs SET stage = $2 WHERE id = $1', [runId, 'draft']);
    const report = JSON.parse(await claude({
      model: MODEL, max_tokens: 4000,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'medium', format: { type: 'json_schema', schema: REPORT_SCHEMA } },
      system: VOICE,
      messages: [{
        role: 'user',
        content: `A business owner typed this into the box:\n\n"${run.trouble}"\n\nYour read so far — business: ${a.business}; trouble: ${a.category}; angle: ${a.angle}\n\nWrite their mini-report.`,
      }],
    }));

    const excerpt = report.diagnosis.length > 260 ? report.diagnosis.slice(0, 257).replace(/\s+\S*$/, '') + '…' : report.diagnosis;
    await q('UPDATE ma_runs SET status = $2, excerpt = $3, report = $4 WHERE id = $1',
      [runId, 'ready', excerpt, JSON.stringify({ ...report, business: a.business, category: a.category })]);
  } catch (err) {
    console.error(`[pipeline] run ${runId} failed:`, err.message);
    await q('UPDATE ma_runs SET status = $2 WHERE id = $1', [runId, 'error']);
  }
}

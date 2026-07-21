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
    diagnosis2: { type: 'string', description: '1-3 sentences after the number: the turn — what kind of fix actually works.' },
    moves: {
      type: 'array', description: 'EXACTLY three moves, in the order the owner should take them.',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          title: { type: 'string', description: '3-6 words, imperative' },
          body: { type: 'string', description: '1-2 sentences, concrete enough to act on this week' },
        },
        required: ['title', 'body'],
      },
    },
    limits: { type: 'string', description: '2-3 sentences: what this report cannot know from one paragraph. Specific, not boilerplate.' },
    offer: { type: 'string', description: '1-2 sentences: what the team would set up for this exact trouble under the $500 fix plan. Mention the visitor approves everything before it goes live.' },
  },
  required: ['title', 'diagnosis', 'bigNumber', 'bigNumberLabel', 'diagnosis2', 'moves', 'limits', 'offer'],
};

const VOICE = `You write as Meschelle Peterson's team at code63labs — a small-business fixer who writes plainly and warmly, like a knowledgeable friend who ran the numbers. Short sentences. No hype, no consultant-speak, no "leverage/optimize/streamline", no emoji.

IRONCLAD HONESTY RULES:
- Never invent a statistic. A number may appear ONLY if (a) it is arithmetic on what the visitor themselves wrote, or (b) it is a well-established published figure and you name the source inline right where the number appears. When unsure, write without numbers — plain reasoning is better than a shaky figure.
- Never pretend to know their business. The report is written from one paragraph and says so.
- Never promise outcomes. Describe mechanisms, not guarantees.`;

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

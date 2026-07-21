/**
 * The two published sample reports. Same template, same honesty rules as live
 * reports. The frame is investigative: theses about the specific business,
 * the check that would confirm or kill each one, and the fix if it holds.
 * Nothing here should survive the "duh test" — if a sentence could appear in
 * a generic listicle, it doesn't belong in a report.
 */
export const samples = {
  'no-shows': {
    kicker: 'Sample report · code63labs',
    title: 'The empty chairs are a system, not bad luck.',
    meta: 'Mini-report · written by Meschelle’s team · published sample',
    trouble: 'People book with me and then just… don’t show. I run a small med spa and some weeks it feels like half my Tuesday is holes.',
    diagnosis: 'No-shows feel personal, but they behave like a rate — steady, predictable, and mostly produced by how the booking works rather than by who the client is. Across published studies of appointment businesses, the average no-show rate runs near one in four. If your book looks like most, the holes in your Tuesday are arithmetic:',
    bigNumber: '≈7',
    bigNumberLabel: 'slots held for people who never arrive, on a 30-booking week at the published average rate (23%, Health Policy 2018 systematic review)',
    diagnosis2: 'You’ve already heard the standard advice — reminders, deposits, policies — so knowing isn’t the bottleneck. The bottleneck is that the right fix depends on facts about your specific book that nobody has pulled: a blanket policy treats your best regular exactly like the stranger who has ghosted you twice, and that’s how fixes quietly get abandoned.',
    theses: [
      {
        thesis: 'Your no-shows cluster — most likely in first-visit clients arriving through one booking channel, not spread evenly across your book.',
        check: 'Ninety days of your calendar, each missed appointment tagged two ways: first-timer or regular, and how it was booked — the Instagram link, the phone, or rebooked in the chair. One afternoon with your booking system’s export.',
        fix: 'Card-on-file applies only where the cluster lives — say, first-visit online bookings — and your regulars never feel a thing. And if the cluster isn’t there, a blanket deposit policy would have cost you loyalty and fixed nothing.',
      },
      {
        thesis: 'Lead time is doing the damage: appointments booked two-plus weeks out are failing at a different rate than same-week ones.',
        check: 'The same ninety days, each booking plotted by days-between-booking-and-visit against whether it held. This split is invisible in day-to-day scheduling and obvious the moment you graph it.',
        fix: 'Long-lead bookings get one midpoint confirmation with an effortless reschedule path; short-lead bookings stay frictionless. If lead time shows nothing, the leak is at the point of booking — a different build entirely.',
      },
      {
        thesis: 'A share of the lost Tuesdays is recoverable, because cancellations and turned-away clients exist in the same weeks — they just never meet.',
        check: 'Two counts from last month: same-week cancellations, and people you waitlisted informally or turned away. If both numbers are real, there’s revenue sitting between them.',
        fix: 'Every cancellation automatically offers the slot down a standby list. The no-show still happens — the empty chair doesn’t.',
      },
    ],
    limits: 'This was written from one paragraph, so these are theses — where we’d look first, not conclusions. Your book may kill all three and point somewhere better; that is exactly what the checking is for, and why the report stops short of telling you to change policy today.',
    offer: 'Under the $500 plan, my team runs all three checks on your actual calendar export, shows you what held and what didn’t, and builds the fix the evidence picks — you approve every piece before it touches your booking flow.',
    source: 'Report numbers carry their sources inline · nothing invented',
  },

  quotes: {
    kicker: 'Sample report · code63labs',
    title: 'Your quotes don’t get rejected. They get buried.',
    meta: 'Mini-report · written by Meschelle’s team · published sample',
    trouble: 'I send quotes and never hear back. I do fencing and decks — I’ll spend an evening pricing a job, send it, and then nothing. Not even a no.',
    diagnosis: 'Silence after a quote is rarely a verdict on your price — it’s what happens when a decision has no deadline and the homeowner has three tabs open. Your quote lands, life crowds in, and “this weekend” quietly becomes never. The contractor who wins is usually just the one still in the conversation when the homeowner finally decides.',
    bigNumber: null,
    bigNumberLabel: null,
    diagnosis2: 'The usual advice is “follow up more,” and you already knew it. The real question is which of three different silences you’re actually in — because each has a different fix, and only your own quote log can tell them apart.',
    theses: [
      {
        thesis: 'Speed is the leak: quotes that go out days after the walkthrough are dying at a different rate than ones sent the same evening.',
        check: 'Your last thirty quotes — walkthrough date, date the quote went out, answered or not. All of it is already sitting in your sent folder; pulling the pattern takes an evening.',
        fix: 'If it holds, the fix is a same-evening quote, even as a firm range with the exact number to follow. If it doesn’t hold, speed was never your problem — and no quoting app would have saved you.',
      },
      {
        thesis: 'Your quotes carry no reason to answer this week, so deciding never becomes urgent enough to happen.',
        check: 'Read your own last five quotes as if you were the homeowner. Is there a date on anything? A reason the price holds until the 15th and not forever?',
        fix: 'Every quote gets a real expiry — materials pricing honestly justifies one — and a written three-touch follow-up that fires every time, so staying in the conversation stops depending on you remembering or feeling pushy.',
      },
      {
        thesis: 'Some of the silence is price — but on one specific job type, not across the board.',
        check: 'Close rate split by job type and size over the last quarter. Twenty minutes with the quote log; if one category is dragging the average, it’s usually visible immediately.',
        fix: 'Reprice or repackage the one job type that’s bleeding — not everything. And if close rates are level across types, price isn’t the story, and you can stop discounting out of doubt.',
      },
    ],
    limits: 'This was written from one paragraph, so these are theses, not findings. Your quote log may kill any of them — which is the point: thirty quotes of evidence beats every rule of thumb in this trade, including ours.',
    offer: 'Under the $500 plan, my team pulls the pattern from your actual quote log, tells you which silence you’re in, and builds the fix that matches — the follow-up machine, the dated quotes, or the repricing case — with every word approved by you first.',
    source: 'This report uses no statistics — reasoning only, honestly labeled',
  },
};

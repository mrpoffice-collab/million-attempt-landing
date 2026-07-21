/**
 * The two published sample reports. Same template, same honesty rules as live
 * reports — the no-shows numbers carry their sources; the quotes report is
 * deliberately number-free reasoning (no honest published figure fit it).
 */
export const samples = {
  'no-shows': {
    kicker: 'Sample report · code63labs',
    title: 'The empty chairs are a system, not bad luck.',
    meta: 'Mini-report · written by Meschelle’s team · published sample',
    trouble: 'People book with me and then just… don’t show. I run a small med spa and some weeks it feels like half my Tuesday is holes.',
    diagnosis: 'No-shows feel personal, but they behave like a rate — steady, predictable, and mostly caused by how the booking works rather than who the client is. Across published studies of appointment businesses, the average no-show rate runs near one in four. If your book looks like most, the holes in your Tuesday are arithmetic:',
    bigNumber: '≈7',
    bigNumberLabel: 'slots held for people who never arrive, on a 30-booking week at the published average rate (23%, Health Policy 2018 systematic review)',
    diagnosis2: 'The fix is rarely ‘charge deposits for everyone’ — that punishes the loyal to discipline the flaky. The working pattern is to make confirming effortless, make forgetting hard, and make the repeat offenders carry the policy.',
    moves: [
      { title: 'Confirm twice, tiny and human', body: 'A short text the evening before and another 2 hours out, written like you — not like a robot. Forgetfulness is the #1 published reason for no-shows; two well-timed nudges attack exactly that.' },
      { title: 'Open a same-day standby list', body: 'Every cancellation offers the slot to the next person on a standby list automatically. The hole still happens; the revenue doesn’t.' },
      { title: 'Deposits for repeat offenders only', body: 'Two no-shows in 90 days flips that client — and only that client — to card-on-file booking. Loyal clients never feel it; the pattern pays for itself.' },
    ],
    limits: 'This was written from one paragraph. It can’t see your actual calendar, your ticket size, or your client mix — so the seven-slot figure is the published average applied to a typical week, not a measurement of your book. The moves are the ones that survive contact with real appointment businesses; the tuning is where your specifics matter.',
    offer: 'My team sets all three moves up on your systems — the confirmations, the standby list, the deposit flip — wired in and working, with you approving each piece before it goes live.',
    source: 'Report numbers carry their sources inline · nothing invented',
  },

  quotes: {
    kicker: 'Sample report · code63labs',
    title: 'Your quotes don’t get rejected. They get buried.',
    meta: 'Mini-report · written by Meschelle’s team · published sample',
    trouble: 'I send quotes and never hear back. I do fencing and decks — I’ll spend an evening pricing a job, send it, and then nothing. Not even a no.',
    diagnosis: 'Silence after a quote is almost never a verdict on your price — it’s what happens when the decision has no deadline and the homeowner has three tabs open. Your quote lands, life happens, and ‘I’ll deal with it this weekend’ quietly becomes never. The contractor who wins is usually just the one still in the conversation when the homeowner finally decides.',
    bigNumber: null,
    bigNumberLabel: null,
    diagnosis2: 'Which means the fix isn’t a better quote — it’s a follow-up that happens every time, without you having to remember it or feel pushy about it.',
    moves: [
      { title: 'Quote, then call the next evening', body: 'One short call: “Wanted to make sure it landed and see what questions you’ve got.” Questions surface objections while the job is still warm — silence never does.' },
      { title: 'Put a real date on every quote', body: '“This price holds until the 15th; after that I have to re-price materials.” That’s honest — materials do move — and it gives an undecided homeowner a reason to decide.' },
      { title: 'Follow up three times, then close the file', body: 'Day 1 call, day 4 text, day 10 last note — written once, sent every time. If the third touch goes unanswered, mark it closed and stop carrying it in your head.' },
    ],
    limits: 'This was written from one paragraph. It can’t see your close rate, your average job size, or what your quotes actually look like — and ‘never hear back’ might partly be a pricing story, which only your numbers can tell. The moves work regardless; whether price is also in the mix is the first thing worth checking.',
    offer: 'My team builds the follow-up machine for you — the reminder sequence in your own words, the quote-expiry dates, the closed-file tracker — wired to fire on every quote you send, with you approving the wording first.',
    source: 'This report uses no statistics — reasoning only, honestly labeled',
  },
};

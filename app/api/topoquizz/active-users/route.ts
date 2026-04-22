import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import '@/lib/firebase-admin';

const ALLOWED_FIELDS = ['stats.lastQuizCompletedAt', 'createdAt'] as const;
type AllowedField = (typeof ALLOWED_FIELDS)[number];

function tzOffsetMs(dateStr: string, tz: string): number {
  const ref = new Date(`${dateStr}T12:00:00Z`);
  const utc = new Date(ref.toLocaleString('en-US', { timeZone: 'UTC' }));
  const local = new Date(ref.toLocaleString('en-US', { timeZone: tz }));
  return utc.getTime() - local.getTime();
}

function makeKeyFn(tz: string, groupBy: 'day' | 'hour') {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric', month: '2-digit', day: '2-digit',
    ...(groupBy === 'hour' && { hour: '2-digit' }),
    hour12: false,
  });
  return (date: Date): string => {
    const p = fmt.formatToParts(date);
    const get = (t: string) => p.find((x) => x.type === t)?.value ?? '00';
    return groupBy === 'hour'
      ? `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:00`
      : `${get('year')}-${get('month')}-${get('day')}`;
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const groupBy = searchParams.get('groupBy') === 'hour' ? 'hour' : 'day';
  const tz = searchParams.get('tz') ?? 'UTC';
  const rawField = searchParams.get('field') ?? 'stats.lastQuizCompletedAt';
  const field: AllowedField = ALLOWED_FIELDS.includes(rawField as AllowedField)
    ? (rawField as AllowedField)
    : 'stats.lastQuizCompletedAt';

  if (!from || !to) {
    return NextResponse.json({ error: 'Missing from/to params' }, { status: 400 });
  }

  const fromUTC = new Date(new Date(`${from}T00:00:00Z`).getTime() + tzOffsetMs(from, tz));
  const toUTC = new Date(new Date(`${to}T23:59:59.999Z`).getTime() + tzOffsetMs(to, tz));
  const toKey = makeKeyFn(tz, groupBy);

  const snap = await admin
    .firestore()
    .collection('users')
    .where(field, '>=', admin.firestore.Timestamp.fromDate(fromUTC))
    .where(field, '<=', admin.firestore.Timestamp.fromDate(toUTC))
    .select(field)
    .get();

  const buckets: Record<string, number> = {};
  snap.docs.forEach((doc) => {
    const ts: admin.firestore.Timestamp | undefined = doc.get(field);
    if (!ts) return;
    const key = toKey(ts.toDate());
    buckets[key] = (buckets[key] ?? 0) + 1;
  });

  const data: { label: string; usuarios: number }[] = [];
  const cursor = new Date(fromUTC);
  while (cursor <= toUTC) {
    const key = toKey(cursor);
    data.push({ label: key, usuarios: buckets[key] ?? 0 });
    if (groupBy === 'hour') cursor.setUTCHours(cursor.getUTCHours() + 1);
    else cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return NextResponse.json({ total: snap.size, data });
}

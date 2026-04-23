'use client';

import { useRef, useState } from 'react';
import { DateRangePicker } from '@heroui/react';
import { I18nProvider } from '@react-aria/i18n';
import { today, getLocalTimeZone, type DateValue } from '@internationalized/date';
import type { RangeValue } from '@react-types/shared';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

type DayData = { label: string; usuarios: number };

const CLIENT_TZ = 'America/La_Paz';

function formatLabel(label: string): string {
  const [, m, d] = label.split('-');
  return `${d}/${m}`;
}

export default function RegisteredUsersCard() {
  const tz = getLocalTimeZone();
  const [range, setRange] = useState<RangeValue<DateValue>>({
    start: today(tz).subtract({ days: 13 }),
    end: today(tz),
  });
  const [total, setTotal] = useState<number | null>(null);
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function fetchData(r: RangeValue<DateValue>) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const params = new URLSearchParams({
      from: r.start.toString(),
      to: r.end.toString(),
      groupBy: 'day',
      field: 'createdAt',
      tz: CLIENT_TZ,
    });

    setLoading(true);
    try {
      const res = await fetch(`/api/topoquizz/active-users?${params}`, { signal: controller.signal });
      const json = await res.json();
      setTotal(json.total ?? null);
      setData(json.data ?? []);
    } catch (e) {
      if ((e as Error).name !== 'AbortError') throw e;
    } finally {
      setLoading(false);
    }
  }

  function handleRangeChange(r: RangeValue<DateValue> | null) {
    if (!r) return;
    setRange(r);
    if (r.start && r.end) fetchData(r);
  }

  return (
    <div className="flex flex-col gap-3 h-full p-4">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <p className="text-sm text-gray-500">Usuarios registrados</p>
          <p className="text-4xl font-bold text-green-600">
            {loading ? '...' : total ?? '-'}
          </p>
          <p className="text-xs text-gray-400">nuevos registros en el periodo</p>
        </div>
        <I18nProvider locale="es-ES">
          <DateRangePicker
            label="Rango"
            value={range}
            onChange={handleRangeChange}
            maxValue={today(tz)}
            granularity="day"
            className="max-w-xs"
          />
        </I18nProvider>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10 }}
              tickFormatter={formatLabel}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip
              formatter={(v) => [v ?? 0, 'usuarios']}
              labelFormatter={(l) => formatLabel(String(l ?? ''))}
            />
            <Bar dataKey="usuarios" fill="#22c55e" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

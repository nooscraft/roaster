'use client';

import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
  Bar,
} from 'recharts';

interface BubbleTrendPoint {
  label: string;
  avgScore: number;
  roastCount: number;
}

interface BubbleTrendChartProps {
  data: BubbleTrendPoint[];
}

export function BubbleTrendChart({ data }: BubbleTrendChartProps) {
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 8 }}>
          <CartesianGrid stroke="#ddd7c7" strokeDasharray="2 2" />
          <XAxis
            dataKey="label"
            minTickGap={18}
            tick={{ fill: '#666', fontFamily: 'VT323, monospace', fontSize: 14 }}
            axisLine={{ stroke: '#1a1a1a' }}
            tickLine={{ stroke: '#1a1a1a' }}
          />
          <YAxis
            yAxisId="score"
            domain={[0, 10]}
            tick={{ fill: '#666', fontFamily: 'VT323, monospace', fontSize: 14 }}
            axisLine={{ stroke: '#1a1a1a' }}
            tickLine={{ stroke: '#1a1a1a' }}
          />
          <YAxis
            yAxisId="count"
            orientation="right"
            allowDecimals={false}
            tick={{ fill: '#666', fontFamily: 'VT323, monospace', fontSize: 14 }}
            axisLine={{ stroke: '#1a1a1a' }}
            tickLine={{ stroke: '#1a1a1a' }}
          />
          <Tooltip
            contentStyle={{
              background: '#F2ECD8',
              border: '2px solid #1a1a1a',
              boxShadow: '3px 3px 0 #1a1a1a',
              fontFamily: 'VT323, monospace',
              fontSize: 18,
            }}
            formatter={(value: number, name: string) =>
              name === 'avgScore' ? [value.toFixed(2), 'Avg bubble score'] : [value, 'Roasts']
            }
          />
          <Bar yAxisId="count" dataKey="roastCount" name="roastCount" fill="#9b8f76" radius={[2, 2, 0, 0]} />
          <Line
            yAxisId="score"
            type="monotone"
            dataKey="avgScore"
            name="avgScore"
            stroke="#c0392b"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 4, fill: '#c0392b' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

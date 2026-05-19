import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function ConfidenceChart({ confidenceScores }) {
  // Parse the JSON string if it's a string
  let scoresObj = confidenceScores;
  if (typeof confidenceScores === 'string') {
    try {
      scoresObj = JSON.parse(confidenceScores);
    } catch (error) {
      console.error('Failed to parse confidence scores:', error);
      return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
          <p className="text-slate-500 text-sm">Unable to display confidence scores.</p>
        </div>
      );
    }
  }

  // Convert to array and sort by confidence descending
  const chartData = Object.entries(scoresObj || {})
    .map(([name, score]) => ({
      name,
      confidence: typeof score === 'number' ? (score * 100).toFixed(1) : 0,
      fullConfidence: typeof score === 'number' ? score * 100 : 0,
    }))
    .sort((a, b) => b.fullConfidence - a.fullConfidence);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
        <p className="text-slate-500 text-sm">No confidence data available.</p>
      </div>
    );
  }

  // Find the highest confidence for highlighting
  const maxConfidence = Math.max(...chartData.map((d) => d.fullConfidence));

  const CustomBar = (props) => {
    const { fill, x, y, width, height, payload } = props;
    const isMaxBar = payload.fullConfidence === maxConfidence;
    const barFill = isMaxBar ? '#0ea5e9' : '#cbd5e1'; // sky-500 or slate-300

    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={barFill}
        radius={[4, 4, 0, 0]}
      />
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Confidence Scores
        </p>
      </div>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 120, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="confidence"
              type="number"
              domain={[0, 100]}
              label={{ value: 'Confidence (%)', position: 'insideBottomRight', offset: -10 }}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={110}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.substring(0, 12)}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, 'Confidence']}
              contentStyle={{
                backgroundColor: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
              cursor={{ fill: 'rgba(15, 23, 42, 0.1)' }}
            />
            <Bar
              dataKey="fullConfidence"
              layout="vertical"
              radius={[0, 4, 4, 0]}
              shape={<CustomBar />}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
        <p>
          <span className="font-semibold text-sky-600">Blue bar</span> represents
          the AI model's highest confidence prediction.
        </p>
      </div>
    </div>
  );
}

interface BarsProps {
  values: { label: string; value: number }[];
  format?: (v: number) => string;
}

export default function Bars({ values, format }: BarsProps) {
  const max = Math.max(...values.map((v) => v.value), 1);
  return (
    <div className="bars">
      {values.map((v) => (
        <div key={v.label} className="bar-col">
          <span className="bar-val">{format ? format(v.value) : v.value || ""}</span>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ height: `${(v.value / max) * 100}%` }}
            />
          </div>
          <span className="bar-label">{v.label}</span>
        </div>
      ))}
    </div>
  );
}

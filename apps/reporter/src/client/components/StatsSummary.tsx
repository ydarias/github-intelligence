interface Stat {
  label: string;
  value: number;
}

interface Props {
  items: Stat[];
}

export function StatsSummary({ items }: Props) {
  return (
    <dl style={{ display: "flex", gap: "48px", margin: "0 0 32px", padding: 0 }}>
      {items.map(({ label, value }) => (
        <div key={label}>
          <dt style={{ fontSize: "0.6875rem", fontWeight: 500, letterSpacing: "0.08em", color: "#666", textTransform: "uppercase", marginBottom: "4px" }}>
            {label}
          </dt>
          <dd style={{ fontSize: "2rem", fontWeight: 600, color: "#000", margin: 0, lineHeight: 1 }}>
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

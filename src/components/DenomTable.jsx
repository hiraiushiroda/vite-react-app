import { useState } from "react";

export default function DenomTable({ rows, expectedTotal }) {
  const parseDenom = (value) => {
    const cleaned = String(value).replace(/[,¥]/g, "");
    const parsed = Number(cleaned);
    return Number.isNaN(parsed) ? 0 : parsed;
  };
  const [counts, setCounts] = useState(
    rows.reduce((acc, row) => {
      acc[row.denom] = Number(row.count) || 0;
      return acc;
    }, {}),
  );
  const total = rows.reduce((sum, row) => {
    const denom = parseDenom(row.denom);
    const count = Number(counts[row.denom]) || 0;
    return sum + denom * count;
  }, 0);
  const theoreticalTotal = 260000;
  const diff = total - theoreticalTotal;
  const isMatch = diff === 0;
  const statusLabel = isMatch ? "一致" : diff > 0 ? "余剰" : "不足";
  const formatYen = (value) => `¥${value.toLocaleString()}`;
  const diffAmount = `${diff > 0 ? "+" : diff < 0 ? "-" : "±"}¥${Math.abs(
    diff,
  ).toLocaleString()}`;
  return (
    <div className="card denom-card">
      <h2 className="denom-title">金種内訳</h2>
      <table className="denom-table">
        <thead>
          <tr>
            <th>金種</th>
            <th>枚数</th>
            <th>小計</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.denom}>
              <td>{row.denom.toLocaleString()}</td>
              <td>
                <input
                  type="number"
                  min="0"
                  value={counts[row.denom] ?? 0}
                  onChange={(event) => {
                    const next = Number(event.target.value) || 0;
                    setCounts((prev) => ({
                      ...prev,
                      [row.denom]: next,
                    }));
                  }}
                />
              </td>
              <td>
                {formatYen(
                  parseDenom(row.denom) * (Number(counts[row.denom]) || 0),
                )}
              </td>
            </tr>
          ))}
          <tr className="denom-total-row">
            <td>合計</td>
            <td className={isMatch ? "denom-status" : "denom-status denom-status--mismatch"}>
              {statusLabel}
            </td>
            <td>{formatYen(total)}</td>
          </tr>
          <tr>
            <td>理論残高</td>
            <td></td>
            <td>{formatYen(theoreticalTotal)}</td>
          </tr>
          <tr>
            <td>差異</td>
            <td className={isMatch ? "denom-status" : "denom-status denom-status--mismatch"}>
              {statusLabel}
            </td>
            <td>{diffAmount}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

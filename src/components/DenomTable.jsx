import { useState } from "react";

export default function DenomTable({ rows, expectedActualTotal }) {
  const parseDenom = (value) => {
    const cleaned = String(value).replace(/[,¥]/g, "");
    const parsed = Number(cleaned);
    return Number.isNaN(parsed) ? 0 : parsed;
  };
  const clampCount = (value) => {
    if (value === "") return 0;
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return 0;
    const integer = Math.floor(parsed);
    return Math.min(9999, Math.max(0, integer));
  };
  const [counts, setCounts] = useState(
    rows.reduce((acc, row) => {
      acc[row.denom] = Number(row.count) || 0;
      return acc;
    }, {}),
  );
  const [backupCounts, setBackupCounts] = useState(null);
  const total = rows.reduce((sum, row) => {
    const denom = parseDenom(row.denom);
    const count = Number(counts[row.denom]) || 0;
    return sum + denom * count;
  }, 0);
  const billDenoms = new Set([10000, 5000, 2000, 1000]);
  const coinDenoms = new Set([500, 100, 50, 10, 5, 1]);
  const billTotal = rows.reduce((sum, row) => {
    const denom = parseDenom(row.denom);
    if (!billDenoms.has(denom)) return sum;
    return sum + denom * (Number(counts[row.denom]) || 0);
  }, 0);
  const coinTotal = rows.reduce((sum, row) => {
    const denom = parseDenom(row.denom);
    if (!coinDenoms.has(denom)) return sum;
    return sum + denom * (Number(counts[row.denom]) || 0);
  }, 0);
  const theoreticalTotal = 260000;
  const diff = total - theoreticalTotal;
  const isMatch = diff === 0;
  const diffStatusLabel = isMatch ? "一致" : diff > 0 ? "過剰" : "不足";
  const formatYen = (value) => `¥${value.toLocaleString()}`;
  const diffAmount = isMatch
    ? "¥0"
    : `${diff > 0 ? "+" : "-"}¥${Math.abs(diff).toLocaleString()}`;
  const diffClass = isMatch
    ? "denom-status denom-status--match"
    : diff < 0
      ? "denom-status denom-status--negative"
      : "denom-status denom-status--mismatch";
  const hasExpectedActualTotal = typeof expectedActualTotal === "number";
  const actualMatch = hasExpectedActualTotal && total === expectedActualTotal;
  const totalStatusClass = hasExpectedActualTotal
    ? actualMatch
      ? "denom-status denom-status--match"
      : diff < 0
        ? "denom-status denom-status--negative"
        : "denom-status denom-status--mismatch"
    : "denom-status";
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
              <td>{parseDenom(row.denom).toLocaleString()}</td>
              <td>
                <input
                  type="number"
                  min="0"
                  max="9999"
                  step="1"
                  value={counts[row.denom] ?? 0}
                  onChange={(event) => {
                    const next = clampCount(event.target.value);
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
            <td className={totalStatusClass}>
              {hasExpectedActualTotal ? (actualMatch ? "一致" : "不一致") : diffStatusLabel}
            </td>
            <td>{formatYen(total)}</td>
          </tr>
          <tr>
            <td>札合計</td>
            <td></td>
            <td>{formatYen(billTotal)}</td>
          </tr>
          <tr>
            <td>硬貨合計</td>
            <td></td>
            <td>{formatYen(coinTotal)}</td>
          </tr>
          <tr>
            <td>理論残高</td>
            <td></td>
            <td>{formatYen(theoreticalTotal)}</td>
          </tr>
          <tr>
            <td>差異</td>
            <td className={diffClass}>
              {diffStatusLabel}
            </td>
            <td className={diffClass}>{diffAmount}</td>
          </tr>
        </tbody>
      </table>
      <button
        type="button"
        className="denom-reset"
        onClick={() => {
          setBackupCounts(counts);
          setCounts((prev) =>
            Object.keys(prev).reduce((acc, key) => {
              acc[key] = 0;
              return acc;
            }, {}),
          );
        }}
      >
        入力をリセット
      </button>
      <button
        type="button"
        className="denom-reset denom-reset--undo"
        disabled={!backupCounts}
        onClick={() => {
          if (backupCounts) {
            setCounts(backupCounts);
            setBackupCounts(null);
          }
        }}
      >
        元に戻す
      </button>
    </div>
  );
}

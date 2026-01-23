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
  const parseCount = (value) => {
    const digits = String(value).replace(/\D/g, "").replace(/^0+(?=\d)/, "");
    const parsed = parseInt(digits, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  };
  const sanitizeCountInput = (rawValue) => clampCount(parseCount(rawValue));
  const [counts, setCounts] = useState(
    rows.reduce((acc, row) => {
      acc[row.denom] = clampCount(parseCount(row.count));
      return acc;
    }, {}),
  );
  const [backupCounts, setBackupCounts] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
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
    ? "±¥0"
    : `${diff > 0 ? "+" : "-"}¥${Math.abs(diff).toLocaleString()}`;
  const diffDisplay = diffAmount;
  const diffClass = isMatch
    ? "denom-status denom-status--match"
    : diff < 0
      ? "denom-status denom-status--negative"
      : "denom-status denom-status--warning";
  const diffAlert =
    Math.abs(diff) >= 20000 ? "重大" : Math.abs(diff) >= 5000 ? "警告" : "";
  const diffBadgeLabel = isMatch ? "一致" : diffAlert || "警告";
  const diffBadgeClass = isMatch
    ? "denom-badge--match"
    : Math.abs(diff) >= 20000
      ? "denom-badge--critical"
      : "denom-badge--warning";
  const hasExpectedActualTotal = typeof expectedActualTotal === "number";
  const actualMatch = hasExpectedActualTotal && total === expectedActualTotal;
  const totalStatusClass = hasExpectedActualTotal
    ? actualMatch
      ? "denom-status denom-status--match"
      : diff < 0
        ? "denom-status denom-status--negative"
        : "denom-status denom-status--warning"
    : "denom-status";
  const billRows = rows.filter((row) => billDenoms.has(parseDenom(row.denom)));
  const coinRows = rows.filter((row) => coinDenoms.has(parseDenom(row.denom)));
  const formatTimestamp = (date) => {
    if (!date) return "";
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}年 ${pad(date.getMonth() + 1)}月 ${pad(
      date.getDate(),
    )}日 ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };
  const renderRow = (row, keyPrefix) => (
    <tr key={`${keyPrefix}-${row.denom}`}>
      <td>{parseDenom(row.denom).toLocaleString()}</td>
      <td>
        <input
          className="denom-input"
          inputMode="numeric"
          pattern="[0-9]*"
          value={counts[row.denom] ?? ""}
          onChange={(event) => {
            const next = sanitizeCountInput(event.target.value);
            setCounts((prev) => ({
              ...prev,
              [row.denom]: next,
            }));
            setLastUpdated(new Date());
          }}
        />
      </td>
      <td>
        {formatYen(parseDenom(row.denom) * (Number(counts[row.denom]) || 0))}
      </td>
    </tr>
  );

  const renderMobileRow = (row, keyPrefix) => {
    const subtotal = formatYen(parseDenom(row.denom) * (Number(counts[row.denom]) || 0));
    return (
      <div className="denom-row" key={`${keyPrefix}-${row.denom}`}>
        <span className="denom-row-denom">{parseDenom(row.denom).toLocaleString()}</span>
        <input
          className="denom-input"
          inputMode="numeric"
          pattern="[0-9]*"
          value={counts[row.denom] ?? ""}
          onChange={(event) => {
            const next = sanitizeCountInput(event.target.value);
            setCounts((prev) => ({
              ...prev,
              [row.denom]: next,
            }));
            setLastUpdated(new Date());
          }}
        />
        <span className="denom-row-subtotal">{subtotal}</span>
      </div>
    );
  };

  return (
    <div className="card denom-card denom-card--wide">
      <h2 className="denom-title">金種内訳</h2>

      <section className="denom-group">
        <h3 className="denom-group-title">監査サマリー</h3>
        <div className="denom-summary-card">
          <div className="denom-summary-row summary-row">
            <span>実地在高（合計）</span>
            <span className="right">
              <span className={totalStatusClass}>
                {hasExpectedActualTotal ? (actualMatch ? "一致" : "不一致") : diffStatusLabel}
              </span>
              <span className="denom-summary-amount">{formatYen(total)}</span>
            </span>
          </div>
          <div className="denom-summary-row summary-row">
            <span>理論残高（システム）</span>
            <span className="right">
              <span className="denom-summary-amount">{formatYen(theoreticalTotal)}</span>
            </span>
          </div>
          <div className="denom-summary-row summary-row">
            <span>差異</span>
            <span className="right">
              <span className={`denom-badge ${diffBadgeClass}`}>{diffBadgeLabel}</span>
              <span className={`denom-summary-amount denom-summary-amount--strong ${diffClass}`}>
                {diffDisplay}
              </span>
            </span>
          </div>
        </div>
      </section>

      <div className="denom-divider" />

      <section className="denom-group">
        <h3 className="denom-group-title">内訳</h3>
        <div className="denom-mobile denom-layout-mobile">
            <div className="denom-row denom-row--header">
              <span className="denom-row-denom">金種</span>
              <span className="denom-row-count">枚数</span>
              <span className="denom-row-subtotal">小計</span>
            </div>
            {billRows.length > 0 && <div className="denom-section">札</div>}
            {billRows.map((row) => renderMobileRow(row, "bill"))}
            {coinRows.length > 0 && <div className="denom-section">硬貨</div>}
            {coinRows.map((row) => renderMobileRow(row, "coin"))}
            <div className="denom-summary-row summary-row denom-subtle">
              <span>札合計</span>
              <span className="right">
                <span className="denom-summary-amount">{formatYen(billTotal)}</span>
              </span>
            </div>
            <div className="denom-summary-row summary-row denom-subtle">
              <span>硬貨合計</span>
              <span className="right">
                <span className="denom-summary-amount">{formatYen(coinTotal)}</span>
              </span>
            </div>
        </div>
        <div className="denom-table-wrap denom-layout-desktop">
          <div className="denom-table-grid">
            <div className="denom-table-column">
              <table className="denom-table denom-table--desktop">
              <colgroup>
                <col className="denom-col-denom" />
                <col className="denom-col-count" />
                <col className="denom-col-subtotal" />
              </colgroup>
              <thead>
                <tr>
                  <th colSpan="3">札</th>
                </tr>
                <tr>
                  <th>金種</th>
                  <th>枚数</th>
                  <th>小計</th>
                </tr>
              </thead>
              <tbody>
                {billRows.map((row) => renderRow(row, "bill"))}
              </tbody>
            </table>
              <div className="denom-table-total denom-group-total">
                <span>札合計</span>
                <span></span>
                <span>{formatYen(billTotal)}</span>
              </div>
            </div>
            <div className="denom-table-column">
              <table className="denom-table denom-table--desktop">
              <colgroup>
                <col className="denom-col-denom" />
                <col className="denom-col-count" />
                <col className="denom-col-subtotal" />
              </colgroup>
              <thead>
                <tr>
                  <th colSpan="3">硬貨</th>
                </tr>
                <tr>
                  <th>金種</th>
                  <th>枚数</th>
                  <th>小計</th>
                </tr>
              </thead>
              <tbody>
                {coinRows.map((row) => renderRow(row, "coin"))}
              </tbody>
            </table>
              <div className="denom-table-total denom-group-total">
                <span>硬貨合計</span>
                <span></span>
                <span>{formatYen(coinTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="denom-divider" />

      <section className="denom-group">
        <h3 className="denom-group-title">証跡</h3>
        <div className="denom-accordion-body">
          <div className="denom-summary-row summary-row">
            <span>点検ステータス</span>
            <span className="right">
              <span className="denom-status">入力中</span>
            </span>
          </div>
          <div className="denom-memo">
            <label htmlFor="diff-note">差異理由メモ</label>
            <textarea id="diff-note" rows="3" placeholder="差異の理由を記録" />
          </div>
          <div className="denom-summary-row summary-row">
            <span>入力者</span>
            <span className="right">
              <span>山田 太郎</span>
            </span>
          </div>
          <div className="denom-updated">
            最終更新: {lastUpdated ? formatTimestamp(lastUpdated) : "-"}
          </div>
          <button type="button" className="denom-complete" disabled>
            点検を完了する
          </button>
        </div>
      </section>

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

import { useEffect, useMemo, useRef, useState } from "react";
import DenomTable from "./DenomTable";

export default function TimelineView() {
  const [isMobile, setIsMobile] = useState(false);
  const [denomOpen, setDenomOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const summaryRef = useRef(null);
  const role = "admin";
  const isAdmin = role === "admin";
  const isStoreManager = role === "manager";
  const isAuditorReadOnly = role === "auditor";
  const canSeeRawLink = isAdmin || isAuditorReadOnly;
  const canSeeOperatorName = isAdmin || isStoreManager || isAuditorReadOnly;
  const warnThreshold = 5000;
  const criticalThreshold = 20000;
  const [auditStatus, setAuditStatus] = useState("入力中");
  const [auditMemo, setAuditMemo] = useState("");
  const [auditUpdatedAt, setAuditUpdatedAt] = useState("2026-01-22 22:10");
  const [conditionCopied, setConditionCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(query.matches);
    update();
    if (query.addEventListener) {
      query.addEventListener("change", update);
    } else {
      query.addListener(update);
    }
    return () => {
      if (query.removeEventListener) {
        query.removeEventListener("change", update);
      } else {
        query.removeListener(update);
      }
    };
  }, []);

  const params = useMemo(() => {
    if (typeof window === "undefined") return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  }, []);

  const snapshotSummary = {
    snapshotId: params.get("snapshotId") || "SS-2041",
    snapshotAt: params.get("snapshotAt") || "2026-01-22 21:55",
    businessDate: params.get("businessDate") || "2026-01-22",
    storeName: params.get("store") || "渋谷店",
    terminalId: params.get("terminalId") || "POS-01",
    posType: "NEC",
    snapshotType: "DAY_CLOSE",
    cashOnHandSource: "changer_auto",
    cashOnHandTotal: 275700,
    theoreticalBalance: 260000,
    diffAmount: 15700,
    operatorName: "佐藤",
    hasDenom: true,
  };

  const snapshotTypeLabelMap = {
    DAY_CLOSE: "日次締め",
    SHIFT_CLOSE: "中締め",
    OPEN: "開局",
    CHECK: "点検",
  };
  const sourceLabelMap = {
    changer_auto: "自動釣銭機",
    pos_auto: "POS自動",
    manual_input: "手入力",
  };

  const formatYen = (value) => `¥${value.toLocaleString()}`;
  const formatOperator = (name) => {
    if (!name) return "操作者不明";
    if (!canSeeOperatorName) return "—";
    return name;
  };
  const formatDiff = (diff) => {
    if (typeof diff !== "number") return { text: "—", className: "" };
    if (diff === 0) return { text: `✓ ${formatYen(0)}（一致）`, className: "diff-match" };
    if (diff > 0) {
      return { text: `↑ ${formatYen(diff)}（過剰）`, className: "amount-negative" };
    }
    return { text: `↓ ${formatYen(diff)}（不足）`, className: "amount-negative" };
  };
  const diffLevel = (diff) => {
    if (typeof diff !== "number") return "ok";
    const abs = Math.abs(diff);
    if (abs >= criticalThreshold) return "critical";
    if (abs >= warnThreshold) return "warn";
    return "ok";
  };
  const diffLevelLabel = (diff) => {
    const level = diffLevel(diff);
    if (level === "critical") return "重大";
    if (level === "warn") return "警告";
    return "一致";
  };
  const snapshotTypeLabel = snapshotTypeLabelMap[snapshotSummary.snapshotType]
    ? `${snapshotSummary.snapshotType}（${snapshotTypeLabelMap[snapshotSummary.snapshotType]}）`
    : `${snapshotSummary.snapshotType}（不明）`;
  const sourceLabel = sourceLabelMap[snapshotSummary.cashOnHandSource] || "不明";

  const timelineItems = [
    {
      type: "snapshot",
      id: "SS-2039",
      at: "2026-01-22 09:00",
      eventType: "OPEN",
      operatorName: "佐藤",
      source: "pos_auto",
      storeName: "渋谷店",
      terminalId: "POS-01",
      posType: "NEC",
      cashOnHandTotal: 180000,
      theoreticalBalance: 180000,
      diffAmount: 0,
    },
    {
      type: "event",
      id: "EVT-3101",
      at: "2026-01-22 10:03",
      eventType: "入金",
      amount: 12000,
      reason: "釣銭補充",
      operatorName: "佐藤",
      source: "pos",
      rawId: "RAW-8801",
      storeName: "渋谷店",
      terminalId: "POS-01",
      posType: "NEC",
    },
    {
      type: "event",
      id: "EVT-3102",
      at: "2026-01-22 18:45",
      eventType: "出金",
      amount: 5000,
      reason: "小口現金",
      operatorName: "",
      source: "pos",
      rawId: "",
      storeName: "渋谷店",
      terminalId: "POS-01",
      posType: "NEC",
    },
    {
      type: "snapshot",
      id: "SS-2041",
      at: "2026-01-22 21:55",
      eventType: "DAY_CLOSE",
      operatorName: "佐藤",
      source: "changer_auto",
      storeName: "渋谷店",
      terminalId: "POS-01",
      posType: "NEC",
      cashOnHandTotal: 275700,
      theoreticalBalance: 260000,
      diffAmount: 15700,
    },
  ];

  const denomRows = [
    { denom: "10,000", count: "12" },
    { denom: "5,000", count: "8" },
    { denom: "2,000", count: "4" },
    { denom: "1,000", count: "52" },
    { denom: "500", count: "48" },
    { denom: "100", count: "260" },
    { denom: "50", count: "80" },
    { denom: "10", count: "120" },
    { denom: "5", count: "60" },
    { denom: "1", count: "200" },
  ];
  const expectedActualTotal = snapshotSummary.cashOnHandTotal;
  const diffSummary = formatDiff(snapshotSummary.diffAmount);
  const denomTotal = useMemo(() => {
    const parseNumber = (value) => Number(String(value).replace(/,/g, ""));
    return denomRows.reduce((sum, row) => {
      const denom = parseNumber(row.denom);
      const count = parseNumber(row.count);
      return sum + denom * count;
    }, 0);
  }, [denomRows]);
  const denomDiff = denomTotal - expectedActualTotal;
  const denomMatch = denomDiff === 0;
  const timelineItemsWithRunning = useMemo(() => {
    const normalizeAmount = (value) => {
      if (typeof value === "number") return value;
      if (!value) return 0;
      const cleaned = String(value).replace(/[^0-9.-]/g, "");
      const parsed = Number(cleaned);
      return Number.isNaN(parsed) ? 0 : parsed;
    };
    const isOut = (type) =>
      ["出金", "OUT", "OUTFLOW", "WITHDRAW"].includes(String(type || "").toUpperCase());
    const isIn = (type) =>
      ["入金", "IN", "INFLOW", "DEPOSIT"].includes(String(type || "").toUpperCase());
    const isNightTime = (timeStr) => {
      const match = String(timeStr || "").match(/(\d{2}):(\d{2})/);
      if (!match) return false;
      const hour = Number(match[1]);
      return hour >= 23 || hour < 5;
    };
    const sorted = [...timelineItems].sort((a, b) => a.at.localeCompare(b.at));
    const baselineSnapshot = sorted.find((item) => item.type === "snapshot");
    let running =
      (baselineSnapshot && baselineSnapshot.theoreticalBalance) ||
      (baselineSnapshot && baselineSnapshot.cashOnHandTotal) ||
      snapshotSummary.theoreticalBalance ||
      snapshotSummary.cashOnHandTotal ||
      0;
    const runningByKey = new Map();
    sorted.forEach((item) => {
      if (item.type === "event") {
        const amount = normalizeAmount(item.amount);
        const before = running;
        if (isOut(item.eventType)) {
          running -= amount;
        } else if (isIn(item.eventType)) {
          running += amount;
        }
        const delta = running - before;
        const isBigMove = Math.abs(delta) >= warnThreshold;
        const isOperatorUnknown = !item.operatorName;
        const isNight = isOut(item.eventType) && isNightTime(item.at);
        const level =
          Math.abs(delta) >= criticalThreshold
            ? "critical"
            : Math.abs(delta) >= warnThreshold
              ? "warn"
              : "ok";
        runningByKey.set(`${item.type}-${item.id}`, {
          running,
          delta,
          isBigMove,
          isOperatorUnknown,
          isNight,
          level,
        });
      }
    });
    return timelineItems.map((item) => ({
      ...item,
      runningBalance: runningByKey.get(`${item.type}-${item.id}`)?.running ?? null,
      flags: runningByKey.get(`${item.type}-${item.id}`) || {
        delta: 0,
        isBigMove: false,
        isOperatorUnknown: !item.operatorName,
        isNight: false,
        level: "ok",
      },
    }));
  }, [timelineItems, snapshotSummary, warnThreshold, criticalThreshold]);

  const baselineSnapshot = timelineItemsWithRunning.find((item) => item.type === "snapshot");
  const baselineAt = baselineSnapshot?.at || "—";
  const baselineId = baselineSnapshot?.id || "—";
  const baselineTheoretical =
    baselineSnapshot?.theoreticalBalance ??
    baselineSnapshot?.cashOnHandTotal ??
    snapshotSummary.theoreticalBalance ??
    snapshotSummary.cashOnHandTotal ??
    0;
  const targetSnapshotId = snapshotSummary.snapshotId;
  const timelineDisplayItems = isMobile && !timelineOpen
    ? timelineItemsWithRunning.slice(0, 3)
    : timelineItemsWithRunning;
  const filteredConditions = [
    ["抽出日時", snapshotSummary.snapshotAt],
    ["期間", `${snapshotSummary.businessDate}〜${snapshotSummary.businessDate}`],
    ["店舗", snapshotSummary.storeName],
    ["POS", snapshotSummary.posType],
    ["端末", snapshotSummary.terminalId],
    ["自動釣銭機", sourceLabel],
    ["操作者", formatOperator(snapshotSummary.operatorName)],
    ["種別", snapshotTypeLabel],
    ["差異閾値", `${warnThreshold} / ${criticalThreshold}`],
    [],
  ];
  const buildCsv = () => {
    const header = [
      "日時",
      "種別",
      "金額",
      "操作者",
      "理由",
      "入力元",
      "走行理論残高",
      "id",
      "raw_id",
    ];
    const escapeCsvValue = (value) => {
      const raw = value ?? "";
      const text = String(raw);
      if (/[",\n]/.test(text)) {
        return `"${text.replace(/"/g, "\"\"")}"`;
      }
      return text;
    };
    const rows = timelineItemsWithRunning.map((item) => [
      item.at,
      item.type === "snapshot" ? `SNAPSHOT:${item.eventType}` : item.eventType,
      item.type === "event" && typeof item.amount === "number" ? String(item.amount) : "",
      formatOperator(item.operatorName),
      item.type === "event" ? item.reason || "" : "",
      sourceLabelMap[item.source] || item.source || "不明",
      typeof item.runningBalance === "number" ? String(item.runningBalance) : "",
      item.id,
      canSeeRawLink ? item.rawId || "" : "",
    ]);
    const body = [...filteredConditions, header, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");
    return `\ufeff${body}`;
  };
  const handleExportCsv = () => {
    const csv = buildCsv();
    const now = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    const filename = `timeline_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
      now.getDate(),
    )}_${pad(now.getHours())}${pad(now.getMinutes())}.csv`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleBack = () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };
  const handleSnapshotFocus = () => {
    if (summaryRef.current && summaryRef.current.scrollIntoView) {
      summaryRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  const handleCopyConditions = async () => {
    const lines = filteredConditions
      .filter((row) => row.length > 0)
      .map((row) => `${row[0]}: ${row[1]}`);
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setConditionCopied(true);
      setTimeout(() => setConditionCopied(false), 1800);
    } catch (error) {
      setConditionCopied(false);
    }
  };

  return (
    <div className="card denom-card timeline-card">
      <div className="timeline-header">
        <h2>現金監査 詳細</h2>
        <div className="timeline-header-actions">
          <button type="button" className="ghost-button" onClick={handleExportCsv}>
            CSV出力
          </button>
          <button type="button" className="ghost-button" onClick={handleBack}>
            戻る
          </button>
        </div>
      </div>

      <div className="timeline-section-title">スナップショット概要</div>
      <div className="timeline-summary" ref={summaryRef}>
        <div className="timeline-summary-header">
          <div>
            <div className="timeline-summary-title">
              {snapshotSummary.storeName} / {snapshotSummary.terminalId} /{" "}
              {snapshotSummary.posType}
            </div>
            <div className="timeline-summary-sub">
              {snapshotTypeLabel} ・ {snapshotSummary.snapshotAt} ・ 営業日{" "}
              {snapshotSummary.businessDate}
            </div>
          </div>
          <div className={`timeline-summary-diff ${diffSummary.className}`}>
            {diffSummary.text}
            <span className={`diff-level-badge level-${diffLevel(snapshotSummary.diffAmount)}`}>
              {diffLevelLabel(snapshotSummary.diffAmount)}
            </span>
          </div>
        </div>
        <div className="timeline-summary-grid">
          <div>入力元</div>
          <div>{sourceLabel}</div>
          <div>実地在高</div>
          <div>{formatYen(snapshotSummary.cashOnHandTotal)}</div>
          <div>理論残高</div>
          <div>{formatYen(snapshotSummary.theoreticalBalance)}</div>
          <div>入力者</div>
          <div>{formatOperator(snapshotSummary.operatorName)}</div>
          <div>Snapshot ID</div>
          <div>{snapshotSummary.snapshotId || "—"}</div>
          <div>起点</div>
          <div>{baselineAt}</div>
          <div>起点ID</div>
          <div>{baselineId}</div>
          <div>起点理論残高</div>
          <div>{formatYen(baselineTheoretical)}</div>
        </div>
      </div>
      <div className="timeline-conditions">
        <div className="timeline-conditions-title">対象条件</div>
        <div className="timeline-conditions-items">
          <span>
            対象: {snapshotSummary.storeName} / {snapshotSummary.terminalId} /{" "}
            {snapshotSummary.posType}
          </span>
          <span>
            期間: {baselineAt}〜{snapshotSummary.snapshotAt}
          </span>
          <span>
            営業日: {snapshotSummary.businessDate}
          </span>
          <span>
            閾値: {warnThreshold} / {criticalThreshold}
          </span>
          {auditUpdatedAt && <span>最終更新: {auditUpdatedAt}</span>}
        </div>
        <button type="button" className="ghost-button" onClick={handleCopyConditions}>
          条件をコピー
        </button>
        {conditionCopied && <span className="copy-status">コピーしました</span>}
      </div>

      <div className="timeline-section">
        <div className="timeline-section-title">監査タイムライン（証跡）</div>
        {isMobile ? (
          <div className="timeline-list">
            {timelineDisplayItems.map((item) => {
              const isSnapshot = item.type === "snapshot";
              const amountText =
                item.type === "event" && typeof item.amount === "number"
                  ? formatYen(item.amount)
                  : "—";
              const amountClass =
                item.type === "event" && item.eventType === "出金" ? "amount-negative" : "";
              const snapshotDiff = isSnapshot ? formatDiff(item.diffAmount) : null;
              const operatorLabel = formatOperator(item.operatorName);
              const sourceLabelItem = sourceLabelMap[item.source] || item.source || "不明";
              const runningText =
                typeof item.runningBalance === "number" ? formatYen(item.runningBalance) : "—";
              const badges = [];
              if (isSnapshot && baselineSnapshot && item.id === baselineSnapshot.id) {
                badges.push({ label: "起点", tone: "base" });
              }
              if (isSnapshot && targetSnapshotId && item.id === targetSnapshotId) {
                badges.push({ label: "対象", tone: "target" });
              }
              if (!isSnapshot) {
                if (item.flags.level === "critical") badges.push({ label: "重大", tone: "critical" });
                if (item.flags.level === "warn") badges.push({ label: "警告", tone: "warn" });
                if (item.flags.isNight) badges.push({ label: "深夜", tone: "night" });
                if (item.flags.isOperatorUnknown)
                  badges.push({ label: "操作者不明", tone: "unknown" });
              }
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className={`timeline-card-item ${
                    item.flags.level !== "ok" ? `is-${item.flags.level}` : ""
                  }`}
                  onClick={() =>
                    item.type === "event" ? setSelectedEvent(item) : handleSnapshotFocus()
                  }
                >
                  <div className="timeline-card-top">
                    <span className="timeline-card-time">{item.at}</span>
                    <span className={`timeline-card-badge ${isSnapshot ? "is-snapshot" : ""}`}>
                      {isSnapshot ? "SNAPSHOT" : item.eventType}
                    </span>
                    <span className={`timeline-card-amount ${amountClass}`}>
                      {isSnapshot ? snapshotDiff.text : amountText}
                    </span>
                  </div>
                  {badges.length > 0 && (
                    <div className="timeline-card-badges">
                      {badges.slice(0, 2).map((badge) => (
                        <span key={badge.label} className={`timeline-flag ${badge.tone}`}>
                          {badge.label}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="timeline-card-sub">
                    {item.storeName} / {item.terminalId}
                  </div>
                  <div className="timeline-card-sub">操作者: {operatorLabel}</div>
                  {item.type === "event" ? (
                    <div className="timeline-card-sub">理由: {item.reason || "—"}</div>
                  ) : (
                    <div className="timeline-card-sub">
                      実地: {formatYen(item.cashOnHandTotal)} / 理論:{" "}
                      {formatYen(item.theoreticalBalance)}
                    </div>
                  )}
                  <div className="timeline-card-sub">入力元: {sourceLabelItem}</div>
                  {item.type === "event" && canSeeRawLink && item.rawId && (
                    <div className="timeline-card-sub">raw参照: {item.rawId}</div>
                  )}
                  {item.type === "event" && canSeeRawLink && !item.rawId && (
                    <div className="timeline-card-sub">RAWなし</div>
                  )}
                  {item.type === "event" && canSeeRawLink && item.rawId && (
                    <a
                      className="timeline-raw-link"
                      href={`/audit/cash/raw?ref=${encodeURIComponent(item.rawId)}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => event.stopPropagation()}
                    >
                      RAW参照
                    </a>
                  )}
                  <div
                    className={`timeline-card-sub timeline-running ${
                      typeof item.runningBalance === "number" && item.runningBalance < 0
                        ? "amount-negative"
                        : ""
                    }`}
                  >
                    走行理論残高: {runningText}
                  </div>
                </div>
              );
            })}
            <button
              type="button"
              className="snapshot-card-toggle"
              onClick={() => setTimelineOpen((prev) => !prev)}
            >
              {timelineOpen ? "タイムラインを閉じる ▲" : "タイムライン詳細を見る ▼"}
            </button>
          </div>
        ) : (
          <div className="denom-table-wrap timeline-table-wrap">
            <table className="denom-table timeline-table">
              <colgroup>
                <col className="col-timeline-at" />
                <col className="col-timeline-type" />
                <col className="col-timeline-amount" />
                <col className="col-timeline-operator" />
                <col className="col-timeline-reason" />
                <col className="col-timeline-source" />
                <col className="col-timeline-running" />
              </colgroup>
              <thead>
                <tr>
                  <th>日時</th>
                  <th>種別</th>
                  <th>金額</th>
                  <th>操作者</th>
                  <th>理由</th>
                  <th>入力元</th>
                  <th>走行理論残高</th>
                </tr>
              </thead>
              <tbody>
                {timelineItemsWithRunning.map((item) => {
                  const isSnapshot = item.type === "snapshot";
                  const operatorLabel = formatOperator(item.operatorName);
                  const sourceLabelItem = sourceLabelMap[item.source] || item.source || "不明";
              const badges = [];
              if (isSnapshot && baselineSnapshot && item.id === baselineSnapshot.id) {
                badges.push({ label: "起点", tone: "base" });
              }
              if (isSnapshot && targetSnapshotId && item.id === targetSnapshotId) {
                badges.push({ label: "対象", tone: "target" });
              }
              if (!isSnapshot) {
                if (item.flags.level === "critical") badges.push({ label: "重大", tone: "critical" });
                if (item.flags.level === "warn") badges.push({ label: "警告", tone: "warn" });
                if (item.flags.isNight) badges.push({ label: "深夜", tone: "night" });
                if (item.flags.isOperatorUnknown)
                  badges.push({ label: "操作者不明", tone: "unknown" });
              }
                  return (
                    <tr
                      key={`${item.type}-${item.id}`}
                      className={`${isSnapshot ? "is-snapshot" : ""} ${
                        item.flags.level !== "ok" ? `is-${item.flags.level}` : ""
                      }`}
                      onClick={() =>
                        item.type === "event" ? setSelectedEvent(item) : handleSnapshotFocus()
                      }
                    >
                      <td>{item.at}</td>
                      <td>
                        <div className="timeline-type-cell">
                          {isSnapshot ? (
                            <span className="snapshot-chip">SNAPSHOT</span>
                          ) : (
                            item.eventType
                          )}
                          {badges.length > 0 && (
                            <div className="timeline-badges">
                              {badges.slice(0, 2).map((badge) => (
                                <span key={badge.label} className={`timeline-flag ${badge.tone}`}>
                                  {badge.label}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td
                        className={`timeline-amount ${
                          item.type === "event" && item.eventType === "出金"
                            ? "amount-negative"
                            : ""
                        }`}
                      >
                        {isSnapshot ? "—" : formatYen(item.amount)}
                      </td>
                      <td>{operatorLabel}</td>
                      <td>
                        <div className="timeline-cell">
                          <div className="cell-top">{item.type === "event" ? item.reason || "—" : "—"}</div>
                          <div className="cell-sub">
                            {item.type === "event" && canSeeRawLink && item.rawId ? (
                              <span className="timeline-raw">{item.rawId}</span>
                            ) : (
                              canSeeRawLink && item.type === "event" ? "RAWなし" : ""
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{sourceLabelItem}</td>
                      <td
                        className={`timeline-running-cell ${
                          typeof item.runningBalance === "number" && item.runningBalance < 0
                            ? "amount-negative"
                            : ""
                        }`}
                      >
                        {typeof item.runningBalance === "number"
                          ? formatYen(item.runningBalance)
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="timeline-section">
        <div className="timeline-section-title">
          金種内訳（実地構成）{" "}
          {snapshotSummary.hasDenom ? (
            <span className={`denom-status ${denomMatch ? "" : "is-missing"}`}>
              {denomMatch ? "✓ 一致" : `⚠ 不一致（差額 ${formatYen(Math.abs(denomDiff))}）`}
            </span>
          ) : (
            <span className="denom-status is-missing">— 内訳なし</span>
          )}
        </div>
        <div className="denom-summary">
          <div>
            内訳合計: {formatYen(denomTotal)} / 実地在高: {formatYen(expectedActualTotal)}
          </div>
        </div>
        {isMobile ? (
          <>
            <button
              type="button"
              className="snapshot-card-toggle"
              onClick={() => setDenomOpen((prev) => !prev)}
            >
              {denomOpen ? "金種内訳を閉じる ▲" : "金種内訳を見る ▼"}
            </button>
            {denomOpen && (
              <div className="timeline-denom-mobile">
                <DenomTable rows={denomRows} expectedActualTotal={expectedActualTotal} />
              </div>
            )}
          </>
        ) : (
          <DenomTable rows={denomRows} expectedActualTotal={expectedActualTotal} />
        )}
      </div>

      <div className="timeline-section">
        <div className="timeline-section-title">監査記録</div>
        <div className="audit-record">
          <div className="audit-field">
            <label>
              状態
              <select
                value={auditStatus}
                onChange={(event) => {
                  setAuditStatus(event.target.value);
                  setAuditUpdatedAt(new Date().toISOString().slice(0, 16).replace("T", " "));
                }}
              >
                <option value="入力中">入力中</option>
                <option value="点検完了">点検完了</option>
                <option value="差戻し">差戻し</option>
              </select>
            </label>
          </div>
          <div className="audit-field">
            <label>
              差異理由メモ
              <textarea
                rows={3}
                value={auditMemo}
                onChange={(event) => {
                  setAuditMemo(event.target.value);
                  setAuditUpdatedAt(new Date().toISOString().slice(0, 16).replace("T", " "));
                }}
                placeholder="差異理由や確認内容を記録"
              />
            </label>
          </div>
          <div className="audit-field">
            <span>入力者</span>
            <span>{formatOperator(snapshotSummary.operatorName)}</span>
          </div>
          <div className="audit-field">
            <span>最終更新</span>
            <span>{auditUpdatedAt}</span>
          </div>
          <div className="audit-actions">
            <button type="button" className="primary-button">
              点検完了
            </button>
            <button type="button" className="ghost-button">
              リセット
            </button>
            <button type="button" className="ghost-button">
              元に戻す
            </button>
          </div>
        </div>
      </div>

      {selectedEvent && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedEvent(null)}
        >
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>イベント詳細</h3>
              <button
                type="button"
                className="modal-close"
                aria-label="閉じる"
                onClick={() => setSelectedEvent(null)}
              >
                ×
              </button>
            </div>
            <dl className="modal-details">
              <div>
                <dt>日時</dt>
                <dd>{selectedEvent.at}</dd>
              </div>
              <div>
                <dt>種別</dt>
                <dd>{selectedEvent.eventType}</dd>
              </div>
              <div>
                <dt>金額</dt>
                <dd
                  className={
                    selectedEvent.eventType === "出金" ? "amount-negative" : ""
                  }
                >
                  {typeof selectedEvent.amount === "number"
                    ? formatYen(selectedEvent.amount)
                    : "—"}
                </dd>
              </div>
              <div>
                <dt>操作者</dt>
                <dd>{formatOperator(selectedEvent.operatorName)}</dd>
              </div>
              <div>
                <dt>理由</dt>
                <dd>{selectedEvent.reason || "—"}</dd>
              </div>
              <div>
                <dt>入力元</dt>
                <dd>{sourceLabelMap[selectedEvent.source] || selectedEvent.source || "不明"}</dd>
              </div>
              <div>
                <dt>raw参照</dt>
                <dd>{canSeeRawLink ? selectedEvent.rawId || "—" : "—"}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}

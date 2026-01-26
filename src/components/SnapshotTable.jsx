import { useEffect, useState } from "react";

export default function SnapshotTable() {
  const [isMobile, setIsMobile] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateField, setDateField] = useState("business_date");
  const [storeFilter, setStoreFilter] = useState([]);
  const [posFilter, setPosFilter] = useState([]);
  const [terminalFilter, setTerminalFilter] = useState([]);
  const [cashMachineFilter, setCashMachineFilter] = useState("all");
  const [operatorFilter, setOperatorFilter] = useState([]);
  const [snapshotTypeFilter, setSnapshotTypeFilter] = useState([]);
  const [diffThreshold, setDiffThreshold] = useState("");
  const [sortKey, setSortKey] = useState("snapshot_at");
  const [sortDir, setSortDir] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(100);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openId, setOpenId] = useState(null);

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

  useEffect(() => {
    if (dateFrom || dateTo) return;
    const today = new Date();
    const to = today.toISOString().slice(0, 10);
    const fromDate = new Date(today);
    fromDate.setDate(today.getDate() - 6);
    const from = fromDate.toISOString().slice(0, 10);
    setDateFrom(from);
    setDateTo(to);
  }, [dateFrom, dateTo]);

  const snapshots = [
    {
      snapshot_id: "SS-2041",
      store_id: "S-001",
      snapshot_at: "2026-01-22 21:55",
      business_date: "2026-01-22",
      store: "渋谷店",
      pos_type: "NEC",
      terminal_id: "POS-01",
      snapshot_type: "DAY_CLOSE",
      cash_on_hand_total: 275700,
      cash_on_hand_source: "changer_auto",
      theoretical_balance: 260000,
      diff_amount: 15700,
      operator: "佐藤",
      cash_machine: "available",
      has_denomination: true,
    },
    {
      snapshot_id: "SS-2040",
      store_id: "S-001",
      snapshot_at: "2026-01-22 09:05",
      business_date: "2026-01-22",
      store: "渋谷店",
      pos_type: "SMAREGI",
      terminal_id: "POS-02",
      snapshot_type: "OPEN",
      cash_on_hand_total: 180000,
      cash_on_hand_source: "pos_auto",
      theoretical_balance: 180000,
      diff_amount: 0,
      operator: "",
      cash_machine: "unknown",
      has_denomination: false,
    },
    {
      snapshot_id: "SS-2038",
      store_id: "S-002",
      snapshot_at: "2026-01-21 19:10",
      business_date: "2026-01-21",
      store: "新宿店",
      pos_type: "TEC",
      terminal_id: "SELF-03",
      snapshot_type: "CHECK",
      cash_on_hand_total: 95000,
      cash_on_hand_source: "manual_input",
      theoretical_balance: 100000,
      diff_amount: -5000,
      operator: "田中",
      cash_machine: "available",
      has_denomination: true,
    },
  ];

  const formatYen = (value) => `¥${value.toLocaleString()}`;
  const storeOptions = Array.from(new Set(snapshots.map((snap) => snap.store))).filter(Boolean);
  const posOptions = Array.from(new Set(snapshots.map((snap) => snap.pos_type))).filter(Boolean);
  const terminalOptions = Array.from(
    new Set(snapshots.map((snap) => snap.terminal_id)),
  ).filter(Boolean);
  const operatorOptions = Array.from(
    new Set(snapshots.map((snap) => snap.operator || "操作者不明")),
  ).filter(Boolean);
  const snapshotTypeOptions = Array.from(
    new Set(snapshots.map((snap) => snap.snapshot_type)),
  ).filter(Boolean);

  const getSnapshotAt = (snap) => snap.snapshot_at || "";
  const getBusinessDate = (snap) => snap.business_date || "";
  const getStoreName = (snap) => snap.store || "";
  const getPosType = (snap) => snap.pos_type || "";
  const getTerminalId = (snap) => snap.terminal_id || "";
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
  const getSnapshotType = (snap) => snap.snapshot_type || "";
  const getSnapshotTypeLabel = (snap) => {
    const code = getSnapshotType(snap);
    if (!code) return "—";
    const label = snapshotTypeLabelMap[code];
    return label ? `${code}（${label}）` : `${code}（不明）`;
  };
  const getCashTotal = (snap) => snap.cash_on_hand_total ?? "";
  const getCashSource = (snap) => snap.cash_on_hand_source || "";
  const getCashSourceLabel = (snap) => {
    const raw = getCashSource(snap);
    return sourceLabelMap[raw] || "不明";
  };
  const getTheoretical = (snap) => snap.theoretical_balance ?? "";
  const getDiff = (snap) => snap.diff_amount ?? "";
  const getOperator = (snap) => (snap.operator ? snap.operator : "操作者不明");
  const hasDenomination = (snap) => Boolean(snap.has_denomination);
  const formatDiff = (diff) => {
    if (typeof diff !== "number") {
      return { text: "—", className: "" };
    }
    if (diff === 0) {
      return { text: `✓ ${formatYen(0)}（一致）`, className: "diff-match" };
    }
    if (diff > 0) {
      return {
        text: `↑ ${formatYen(diff)}（過剰）`,
        className: "diff-over amount-negative",
      };
    }
    return {
      text: `↓ ${formatYen(diff)}（不足）`,
      className: "diff-under amount-negative",
    };
  };

  const normalizedDiffThreshold = diffThreshold ? Number(diffThreshold) : null;
  const filteredSnapshots = snapshots.filter((snap) => {
    const dateSource =
      dateField === "snapshot_at"
        ? snap.snapshot_at || snap.business_date || ""
        : snap.business_date || snap.snapshot_at || "";
    const dateOnly = dateSource.slice(0, 10);
    if (dateFrom && dateOnly < dateFrom) return false;
    if (dateTo && dateOnly > dateTo) return false;
    if (storeFilter.length > 0 && !storeFilter.includes(snap.store)) return false;
    if (posFilter.length > 0 && !posFilter.includes(snap.pos_type)) return false;
    if (terminalFilter.length > 0 && !terminalFilter.includes(snap.terminal_id)) return false;
    if (operatorFilter.length > 0) {
      const operatorValue = snap.operator ? snap.operator : "操作者不明";
      if (!operatorFilter.includes(operatorValue)) return false;
    }
    if (snapshotTypeFilter.length > 0 && !snapshotTypeFilter.includes(snap.snapshot_type)) {
      return false;
    }
    if (cashMachineFilter !== "all") {
      const cashMachine = snap.cash_machine || "unknown";
      if (cashMachineFilter !== cashMachine) return false;
    }
    if (normalizedDiffThreshold !== null && typeof snap.diff_amount === "number") {
      if (Math.abs(snap.diff_amount) < normalizedDiffThreshold) return false;
    }
    return true;
  });

  const sortedSnapshots = [...filteredSnapshots].sort((a, b) => {
    if (sortKey !== "snapshot_at") return 0;
    const aVal = getSnapshotAt(a);
    const bVal = getSnapshotAt(b);
    if (aVal === bVal) return 0;
    if (sortDir === "asc") return aVal > bVal ? 1 : -1;
    return aVal > bVal ? -1 : 1;
  });

  const totalCount = sortedSnapshots.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, totalCount);
  const pagedSnapshots = sortedSnapshots.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
    setOpenId(null);
  }, [
    dateFrom,
    dateTo,
    dateField,
    storeFilter,
    posFilter,
    terminalFilter,
    cashMachineFilter,
    operatorFilter,
    snapshotTypeFilter,
    diffThreshold,
    sortKey,
    sortDir,
    perPage,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const toggleFilterValue = (currentValues, value) =>
    currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];

  const handleMultiToggle = (setter, value) => {
    setter((prev) => toggleFilterValue(prev, value));
  };

  const handleSort = (key) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("desc");
      return;
    }
    setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const buildTimelineUrl = (snap) => {
    const params = new URLSearchParams();
    if (snap.snapshot_id) params.set("snapshotId", snap.snapshot_id);
    if (snap.store_id) params.set("storeId", snap.store_id);
    if (snap.terminal_id) params.set("terminalId", snap.terminal_id);
    if (snap.business_date) params.set("businessDate", snap.business_date);
    if (snap.snapshot_at) params.set("snapshotAt", snap.snapshot_at);
    return `/audit/cash/timeline?${params.toString()}`;
  };

  const handleRowClick = (snap) => {
    window.location.href = buildTimelineUrl(snap);
  };
  const toggleOpen = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const escapeCsvValue = (value) => {
    const raw = value ?? "";
    const text = String(raw);
    if (/[",\n]/.test(text)) {
      return `"${text.replace(/"/g, "\"\"")}"`;
    }
    return text;
  };

  const formatDateForCsv = (value) => {
    if (!value) return "";
    return String(value);
  };

  const buildCsv = () => {
    const header = [
      "記録日時",
      "営業日",
      "店舗",
      "POS種別",
      "端末ID",
      "snapshot_type",
      "実地在高",
      "在高ソース",
      "理論残高",
      "差異",
      "入力者",
      "金種内訳",
      "snapshot_id",
      "store_id",
      "terminal_id",
    ];
    const rows = filteredSnapshots.map((snap) => [
      formatDateForCsv(getSnapshotAt(snap)),
      formatDateForCsv(getBusinessDate(snap)),
      getStoreName(snap),
      getPosType(snap),
      getTerminalId(snap),
      getSnapshotType(snap),
      typeof getCashTotal(snap) === "number" ? String(getCashTotal(snap)) : "",
      getCashSource(snap),
      typeof getTheoretical(snap) === "number" ? String(getTheoretical(snap)) : "",
      typeof getDiff(snap) === "number" ? String(getDiff(snap)) : "",
      getOperator(snap),
      hasDenomination(snap) ? "あり" : "なし",
      snap.snapshot_id || "",
      snap.store_id || "",
      snap.terminal_id || "",
    ]);
    const filterLines = [
      ["抽出期間", `${dateFrom || "—"}〜${dateTo || "—"}`],
      ["期間基準", dateField === "snapshot_at" ? "日時" : "営業日"],
      ["店舗", storeFilter.length > 0 ? storeFilter.join("|") : "全店"],
      ["POS種別", posFilter.length > 0 ? posFilter.join("|") : "全て"],
      ["端末", terminalFilter.length > 0 ? terminalFilter.join("|") : "全て"],
      ["操作者", operatorFilter.length > 0 ? operatorFilter.join("|") : "全員"],
      ["snapshot_type", snapshotTypeFilter.length > 0 ? snapshotTypeFilter.join("|") : "全て"],
      ["自動釣銭機", cashMachineFilter !== "all" ? cashMachineFilter : "全て"],
      ["差異閾値", diffThreshold ? `${diffThreshold}円` : "全て"],
      [],
    ];
    const body = [...filterLines, header, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");
    return `\ufeff${body}`;
  };

  const handleExportCsv = () => {
    if (filteredSnapshots.length === 0) return;
    const csv = buildCsv();
    const now = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    const filename = `snapshots_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
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

  const activeFilterCount =
    storeFilter.length +
    posFilter.length +
    terminalFilter.length +
    operatorFilter.length +
    snapshotTypeFilter.length +
    (cashMachineFilter !== "all" ? 1 : 0) +
    (diffThreshold ? 1 : 0);

  return (
    <div className="card denom-card snapshot-card">
      <h2 className="denom-title">在高スナップショット一覧</h2>
      <div className={`event-filters ${isMobile ? "is-mobile" : ""}`}>
        {isMobile ? (
          <>
            <div className="event-filter-row">
              <div className="event-filter-group">
                <label>
                  <span>期間</span>
                  <select
                    className="event-filter-select"
                    value={dateField}
                    onChange={(event) => setDateField(event.target.value)}
                  >
                    <option value="business_date">営業日</option>
                    <option value="snapshot_at">日時</option>
                  </select>
                </label>
              </div>
              <div className="event-filter-range">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                />
                <span>〜</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                />
              </div>
              <div className="event-filter-group">
                <label>
                  <span>店舗</span>
                  <div className="event-filter-toggle">
                    {storeOptions.map((store) => (
                      <button
                        key={store}
                        type="button"
                        className={`filter-chip-button${
                          storeFilter.includes(store) ? " is-active" : ""
                        }`}
                        onClick={() =>
                          setStoreFilter((prev) => toggleFilterValue(prev, store))
                        }
                      >
                        {store}
                      </button>
                    ))}
                  </div>
                </label>
              </div>
              <button
                type="button"
                className="ghost-button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
              >
                フィルタを開く {isFilterOpen ? "▲" : "▼"}
                {activeFilterCount > 0 && (
                  <span className="filter-count-badge">{activeFilterCount}</span>
                )}
              </button>
              <button
                type="button"
                className="ghost-button"
                onClick={handleExportCsv}
                disabled={totalCount === 0}
              >
                CSV出力
              </button>
            </div>
            {isFilterOpen && (
              <div className="event-filter-panel">
                <div className="event-filter-group">
                  <label>
                    <span>POS種別</span>
                    <select
                      className="event-filter-select"
                      multiple
                      value={posFilter}
                      onChange={(event) =>
                        setPosFilter(
                          Array.from(event.target.selectedOptions, (opt) => opt.value),
                        )
                      }
                    >
                      {posOptions.map((pos) => (
                        <option
                          key={pos}
                          value={pos}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            handleMultiToggle(setPosFilter, pos);
                          }}
                        >
                          {pos}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="event-filter-group">
                  <label>
                    <span>端末</span>
                    <select
                      className="event-filter-select"
                      multiple
                      value={terminalFilter}
                      onChange={(event) =>
                        setTerminalFilter(
                          Array.from(event.target.selectedOptions, (opt) => opt.value),
                        )
                      }
                    >
                      {terminalOptions.map((terminal) => (
                        <option
                          key={terminal}
                          value={terminal}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            handleMultiToggle(setTerminalFilter, terminal);
                          }}
                        >
                          {terminal}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="event-filter-group">
                  <label>
                    <span>操作者</span>
                    <select
                      className="event-filter-select"
                      multiple
                      value={operatorFilter}
                      onChange={(event) =>
                        setOperatorFilter(
                          Array.from(event.target.selectedOptions, (opt) => opt.value),
                        )
                      }
                    >
                      {operatorOptions.map((operator) => (
                        <option
                          key={operator}
                          value={operator}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            handleMultiToggle(setOperatorFilter, operator);
                          }}
                        >
                          {operator}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="event-filter-group">
                  <label>
                    <span>種別</span>
                    <select
                      className="event-filter-select"
                      multiple
                      value={snapshotTypeFilter}
                      onChange={(event) =>
                        setSnapshotTypeFilter(
                          Array.from(event.target.selectedOptions, (opt) => opt.value),
                        )
                      }
                    >
                      {snapshotTypeOptions.map((type) => (
                        <option
                          key={type}
                          value={type}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            handleMultiToggle(setSnapshotTypeFilter, type);
                          }}
                        >
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="event-filter-row">
                  <div className="event-filter-group">
                    <label>
                      <span>自動釣銭機</span>
                      <select
                        className="event-filter-select"
                        value={cashMachineFilter}
                        onChange={(event) => setCashMachineFilter(event.target.value)}
                      >
                        <option value="all">全て</option>
                        <option value="available">あり</option>
                        <option value="none">なし</option>
                        <option value="unknown">不明</option>
                      </select>
                    </label>
                  </div>
                  <div className="event-filter-group">
                    <label>
                      <span>差異閾値</span>
                      <select
                        className="event-filter-select"
                        value={diffThreshold}
                        onChange={(event) => setDiffThreshold(event.target.value)}
                      >
                        <option value="">全て</option>
                        <option value="5000">|diff| ≥ 5000</option>
                        <option value="10000">|diff| ≥ 10000</option>
                      </select>
                    </label>
                  </div>
                </div>
                <div className="event-filter-actions">
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => {
                      setStoreFilter([]);
                      setPosFilter([]);
                      setTerminalFilter([]);
                      setOperatorFilter([]);
                      setSnapshotTypeFilter([]);
                      setCashMachineFilter("all");
                      setDiffThreshold("");
                    }}
                  >
                    クリア
                  </button>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    適用
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="event-filter-row">
              <div className="event-filter-group">
                <label>
                  <span>期間</span>
                  <select
                    className="event-filter-select"
                    value={dateField}
                    onChange={(event) => setDateField(event.target.value)}
                  >
                    <option value="business_date">営業日</option>
                    <option value="snapshot_at">日時</option>
                  </select>
                </label>
              </div>
              <div className="event-filter-range">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                />
                <span>〜</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                />
              </div>
              <div className="event-filter-group">
                <label>
                  <span>店舗</span>
                  <div className="event-filter-toggle">
                    {storeOptions.map((store) => (
                      <button
                        key={store}
                        type="button"
                        className={`filter-chip-button${
                          storeFilter.includes(store) ? " is-active" : ""
                        }`}
                        onClick={() =>
                          setStoreFilter((prev) => toggleFilterValue(prev, store))
                        }
                      >
                        {store}
                      </button>
                    ))}
                  </div>
                </label>
              </div>
              <button
                type="button"
                className="ghost-button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
              >
                詳細フィルタ {isFilterOpen ? "▲" : "▼"}
                {activeFilterCount > 0 && (
                  <span className="filter-count-badge">{activeFilterCount}</span>
                )}
              </button>
              <button
                type="button"
                className="ghost-button"
                onClick={handleExportCsv}
                disabled={totalCount === 0}
              >
                CSV出力
              </button>
            </div>
            {isFilterOpen && (
              <div className="event-filter-panel">
                <div className="event-filter-group">
                  <label>
                    <span>POS種別</span>
                    <select
                      className="event-filter-select"
                      multiple
                      value={posFilter}
                      onChange={(event) =>
                        setPosFilter(
                          Array.from(event.target.selectedOptions, (opt) => opt.value),
                        )
                      }
                    >
                      {posOptions.map((pos) => (
                        <option
                          key={pos}
                          value={pos}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            handleMultiToggle(setPosFilter, pos);
                          }}
                        >
                          {pos}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="event-filter-group">
                  <label>
                    <span>端末</span>
                    <select
                      className="event-filter-select"
                      multiple
                      value={terminalFilter}
                      onChange={(event) =>
                        setTerminalFilter(
                          Array.from(event.target.selectedOptions, (opt) => opt.value),
                        )
                      }
                    >
                      {terminalOptions.map((terminal) => (
                        <option
                          key={terminal}
                          value={terminal}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            handleMultiToggle(setTerminalFilter, terminal);
                          }}
                        >
                          {terminal}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="event-filter-group">
                  <label>
                    <span>操作者</span>
                    <select
                      className="event-filter-select"
                      multiple
                      value={operatorFilter}
                      onChange={(event) =>
                        setOperatorFilter(
                          Array.from(event.target.selectedOptions, (opt) => opt.value),
                        )
                      }
                    >
                      {operatorOptions.map((operator) => (
                        <option
                          key={operator}
                          value={operator}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            handleMultiToggle(setOperatorFilter, operator);
                          }}
                        >
                          {operator}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="event-filter-group">
                  <label>
                    <span>snapshot_type</span>
                    <select
                      className="event-filter-select"
                      multiple
                      value={snapshotTypeFilter}
                      onChange={(event) =>
                        setSnapshotTypeFilter(
                          Array.from(event.target.selectedOptions, (opt) => opt.value),
                        )
                      }
                    >
                      {snapshotTypeOptions.map((type) => (
                        <option
                          key={type}
                          value={type}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            handleMultiToggle(setSnapshotTypeFilter, type);
                          }}
                        >
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="event-filter-row">
                  <div className="event-filter-group">
                    <label>
                      <span>自動釣銭機</span>
                      <select
                        className="event-filter-select"
                        value={cashMachineFilter}
                        onChange={(event) => setCashMachineFilter(event.target.value)}
                      >
                        <option value="all">全て</option>
                        <option value="available">あり</option>
                        <option value="none">なし</option>
                        <option value="unknown">不明</option>
                      </select>
                    </label>
                  </div>
                  <div className="event-filter-group">
                    <label>
                      <span>差異閾値</span>
                      <select
                        className="event-filter-select"
                        value={diffThreshold}
                        onChange={(event) => setDiffThreshold(event.target.value)}
                      >
                        <option value="">全て</option>
                        <option value="5000">|diff| ≥ 5000</option>
                        <option value="10000">|diff| ≥ 10000</option>
                      </select>
                    </label>
                  </div>
                </div>
                <div className="event-filter-actions">
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => {
                      setStoreFilter([]);
                      setPosFilter([]);
                      setTerminalFilter([]);
                      setOperatorFilter([]);
                      setSnapshotTypeFilter([]);
                      setCashMachineFilter("all");
                      setDiffThreshold("");
                    }}
                  >
                    クリア
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {isMobile && totalCount > 0 && (
        <>
          <div className="event-filter-divider" />
          <div className="event-result-header">検索結果（{totalCount}件）</div>
        </>
      )}

      {totalCount === 0 ? (
        <div className="event-empty">該当するスナップショットはありません</div>
      ) : isMobile ? (
        <div className="snapshot-list">
          {pagedSnapshots.map((snap) => (
            <div
              key={snap.snapshot_id}
              className="snapshot-card-mobile"
              role="button"
              tabIndex={0}
              onClick={() => toggleOpen(snap.snapshot_id)}
            >
              <div className="snapshot-card-header">
                <span className="snapshot-card-type">{getSnapshotTypeLabel(snap)}</span>
                <span className={`snapshot-card-diff ${formatDiff(getDiff(snap)).className}`}>
                  {formatDiff(getDiff(snap)).text}
                </span>
              </div>
              <div className="snapshot-card-time">{getSnapshotAt(snap) || "—"}</div>
              <div className="snapshot-card-primary">
                <div className="snapshot-card-line">
                  {getStoreName(snap) || "—"} / {getTerminalId(snap) || "—"}
                </div>
                <div className="snapshot-card-line">
                  入力元: {getCashSourceLabel(snap)} / 内訳:{" "}
                  {hasDenomination(snap) ? "あり" : "なし"}
                </div>
              </div>
              <div
                className={`snapshot-card-details ${
                  openId === snap.snapshot_id ? "is-open" : ""
                }`}
              >
                <div className="snapshot-card-detail-grid">
                  <div>営業日</div>
                  <div>{getBusinessDate(snap) || "—"}</div>
                  <div>POS</div>
                  <div>{getPosType(snap) || "—"}</div>
                  <div>実地在高</div>
                  <div>
                    {typeof getCashTotal(snap) === "number"
                      ? formatYen(getCashTotal(snap))
                      : "—"}
                  </div>
                  <div>理論残高</div>
                  <div>
                    {typeof getTheoretical(snap) === "number"
                      ? formatYen(getTheoretical(snap))
                      : "—"}
                  </div>
                  <div>入力者</div>
                  <div>{getOperator(snap)}</div>
                  <div>内訳</div>
                  <div>{hasDenomination(snap) ? "✅ あり" : "— なし"}</div>
                  <div>Snapshot ID</div>
                  <div>{snap.snapshot_id || "—"}</div>
                </div>
                <button
                  type="button"
                  className="ghost-button snapshot-card-link"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRowClick(snap);
                  }}
                >
                  タイムラインを見る
                </button>
              </div>
              <button
                type="button"
                className="snapshot-card-toggle"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleOpen(snap.snapshot_id);
                }}
              >
                {openId === snap.snapshot_id ? "閉じる ▲" : "詳細を見る ▼"}
              </button>
            </div>
          ))}
          {endIndex < totalCount && (
            <button
              type="button"
              className="primary-button event-load-more"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            >
              さらに表示する
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="event-result-header">検索結果（{totalCount}件）</div>
          <div className="denom-table-wrap snapshot-table-wrap">
            <table className="denom-table snapshot-table snapshot-table-compact">
              <colgroup>
                <col className="col-snap-datetime" />
                <col className="col-snap-store" />
                <col className="col-snap-terminal" />
                <col className="col-snap-type" />
                <col className="col-snap-balance" />
                <col className="col-snap-diff" />
              </colgroup>
              <thead>
                <tr>
                  <th className="col-snap-datetime">
                    <div className="cell-top">
                      <button
                        type="button"
                        className="event-sort-button"
                        onClick={() => handleSort("snapshot_at")}
                      >
                        記録日時
                        <span className="event-sort-indicator">
                          {sortKey === "snapshot_at" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                        </span>
                      </button>
                    </div>
                    <div className="cell-sub">営業日</div>
                  </th>
                  <th className="col-snap-store">
                    <div className="cell-top">店舗</div>
                    <div className="cell-sub">POS</div>
                  </th>
                  <th className="col-snap-terminal">
                    <div className="cell-top">端末ID</div>
                    <div className="cell-sub">入力元</div>
                  </th>
                  <th className="col-snap-type">
                    <div className="cell-top">種別</div>
                    <div className="cell-sub">内訳</div>
                  </th>
                  <th className="col-snap-balance">
                    <div className="cell-top">実地在高</div>
                    <div className="cell-sub">理論残高</div>
                  </th>
                  <th className="col-snap-diff">
                    <div className="cell-top">差異</div>
                    <div className="cell-sub">入力者</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagedSnapshots.map((snap) => (
                  <tr
                    key={snap.snapshot_id}
                    className="event-row-clickable"
                    onClick={() => handleRowClick(snap)}
                  >
                    <td className="col-snap-datetime">
                      <div className="cell-top" title={getSnapshotAt(snap) || "—"}>
                        {getSnapshotAt(snap) || "—"}
                      </div>
                      <div className="cell-sub" title={getBusinessDate(snap) || "—"}>
                        {getBusinessDate(snap) || "—"}
                      </div>
                    </td>
                    <td className="col-snap-store">
                      <div className="cell-top" title={getStoreName(snap) || "—"}>
                        {getStoreName(snap) || "—"}
                      </div>
                      <div className="cell-sub" title={getPosType(snap) || "—"}>
                        {getPosType(snap) || "—"}
                      </div>
                    </td>
                    <td className="col-snap-terminal">
                      <div className="cell-top" title={getTerminalId(snap) || "—"}>
                        {getTerminalId(snap) || "—"}
                      </div>
                      <div className="cell-sub" title={getCashSourceLabel(snap)}>
                        {getCashSourceLabel(snap)}
                      </div>
                    </td>
                    <td className="col-snap-type">
                      <div className="cell-top" title={getSnapshotTypeLabel(snap)}>
                        {getSnapshotTypeLabel(snap)}
                      </div>
                      <div
                        className="cell-sub"
                        title={hasDenomination(snap) ? "金種内訳あり" : "金種内訳なし"}
                      >
                        {hasDenomination(snap) ? "✅ あり" : "— なし"}
                      </div>
                    </td>
                    <td className="col-snap-balance">
                      <div className="cell-top">
                        {typeof getCashTotal(snap) === "number"
                          ? formatYen(getCashTotal(snap))
                          : "—"}
                      </div>
                      <div className="cell-sub">
                        {typeof getTheoretical(snap) === "number"
                          ? formatYen(getTheoretical(snap))
                          : "—"}
                      </div>
                    </td>
                    <td className="col-snap-diff">
                      <div className={`cell-top diff-top ${formatDiff(getDiff(snap)).className}`}>
                        {formatDiff(getDiff(snap)).text}
                      </div>
                      <div className="cell-sub" title={getOperator(snap)}>
                        {getOperator(snap)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="event-filter-pagination">
            <label>
              件数
              <select value={perPage} onChange={(event) => setPerPage(Number(event.target.value))}>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </label>
            <span className="event-page-info">
              表示: {startIndex + 1}-{endIndex} / {totalCount}件
            </span>
            <button
              type="button"
              className="ghost-button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={safePage <= 1}
            >
              前へ
            </button>
            <span className="event-page-info">
              {safePage} / {totalPages}
            </span>
            <button
              type="button"
              className="ghost-button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={safePage >= totalPages}
            >
              次へ
            </button>
          </div>
        </>
      )}
    </div>
  );
}

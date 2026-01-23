import { useEffect, useRef, useState } from "react";

// イベント一覧のテーブル表示用コンポーネント
export default function EventTable() {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [copyStatus, setCopyStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateField, setDateField] = useState("business_date");
  const [storeFilter, setStoreFilter] = useState([]);
  const [posFilter, setPosFilter] = useState([]);
  const [terminalFilter, setTerminalFilter] = useState([]);
  const [cashMachineFilter, setCashMachineFilter] = useState("all");
  const [operatorFilter, setOperatorFilter] = useState([]);
  const [typeFilter, setTypeFilter] = useState([]);
  const [diffThreshold, setDiffThreshold] = useState("");
  const [sortKey, setSortKey] = useState("event_at");
  const [sortDir, setSortDir] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(100);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const closeButtonRef = useRef(null);
  const role = "admin";
  const canSeeRawLink = role === "admin" || role === "auditor";
  const canSeeOperatorName = role === "admin" || role === "manager";
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
  // モックデータ（本番APIに置き換え予定）
  const events = [
    {
      event_id: "EVT-0001",
      store_id: "S-001",
      event_at: "2026-01-22 09:12",
      business_date: "2026-01-22",
      store: "渋谷店",
      pos_type: "NEC",
      terminal_id: "POS-01",
      operator: "佐藤",
      kind: "入金",
      amount: 12000,
      reason: "釣銭補充",
      source: "pos",
      snapshot_id: "SS-1042",
      raw_ref: "RAW-0001",
    },
    {
      event_id: "EVT-0002",
      store_id: "S-001",
      event_at: "2026-01-22 10:03",
      business_date: "2026-01-22",
      store: "渋谷店",
      pos_type: "SMAREGI",
      terminal_id: "POS-02",
      operator: "",
      kind: "出金",
      amount: 5000,
      reason: "小口現金",
      source: "pos",
      snapshot_id: "",
      raw_ref: "RAW-0002",
    },
    {
      event_id: "EVT-0003",
      store_id: "S-002",
      event_at: "2026-01-21 18:45",
      business_date: "2026-01-21",
      store: "新宿店",
      pos_type: "TEC",
      terminal_id: "SELF-03",
      operator: "田中",
      kind: "出金",
      amount: 15000,
      reason: "両替",
      source: "changer",
      snapshot_id: "SS-1038",
      raw_ref: "",
    },
  ];

  const formatYen = (value) => `¥${value.toLocaleString()}`;
  const typeOptions = Array.from(new Set(events.map((event) => event.kind))).filter(Boolean);
  const storeOptions = Array.from(new Set(events.map((event) => event.store))).filter(Boolean);
  const posOptions = Array.from(new Set(events.map((event) => event.pos_type))).filter(Boolean);
  const terminalOptions = Array.from(new Set(events.map((event) => event.terminal_id))).filter(
    Boolean,
  );
  const operatorOptions = Array.from(
    new Set(events.map((event) => event.operator || "操作者不明")),
  ).filter(Boolean);
  const getEventKey = (event) =>
    [
      event.event_id || event.id,
      event.event_at,
      event.business_date,
      event.store,
      event.terminal_id,
      event.amount,
      event.kind,
      event.reason,
      event.source,
    ]
      .filter(Boolean)
      .join("|");
  const getEventAt = (event) => event.event_at || "";
  const getBusinessDate = (event) => event.business_date || "";
  const getStoreName = (event) => event.store || "";
  const getPosType = (event) => event.pos_type || "";
  const getTerminalId = (event) => event.terminal_id || "";
  const getOperatorId = (event) => event.operator_id || "";
  const getOperatorName = (event) => event.operator || "";
  const getOperatorDisplay = (event) => {
    const name = getOperatorName(event);
    if (!name) return "操作者不明";
    if (!canSeeOperatorName) return "—";
    const id = getOperatorId(event);
    return id ? `${id} / ${name}` : name;
  };
  const getEventType = (event) => event.kind || "";
  const getAmount = (event) => event.amount ?? "";
  const getReason = (event) => event.reason || event.description || "";
  const getSource = (event) => event.source || "pos";
  const getSourceShort = (event) => {
    const source = getSource(event);
    if (!source) return "—";
    if (source === "backoffice") return "back";
    return source;
  };
  const getSnapshotId = (event) => event.snapshot_id || "";
  const getSnapshotShort = (event) => {
    const snapshot = getSnapshotId(event);
    if (!snapshot) return "—";
    if (snapshot.length <= 8) return snapshot;
    return snapshot.slice(-8);
  };
  const getRawUrl = (event) => event.raw_url || event.raw_ref || "";
  const getEventId = (event) => event.event_id || event.id || "";
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredEvents = events.filter((event) => {
    const dateSource =
      dateField === "event_at"
        ? event.event_at || event.business_date || ""
        : event.business_date || event.event_at || "";
    const dateOnly = dateSource.slice(0, 10);
    if (dateFrom && dateOnly < dateFrom) return false;
    if (dateTo && dateOnly > dateTo) return false;
    if (storeFilter.length > 0 && !storeFilter.includes(event.store)) return false;
    if (posFilter.length > 0 && !posFilter.includes(event.pos_type)) return false;
    if (terminalFilter.length > 0 && !terminalFilter.includes(event.terminal_id)) return false;
    if (operatorFilter.length > 0) {
      const operatorValue = event.operator ? event.operator : "操作者不明";
      if (!operatorFilter.includes(operatorValue)) return false;
    }
    if (typeFilter.length > 0 && !typeFilter.includes(event.kind)) return false;
    if (cashMachineFilter !== "all") {
      const cashMachine = event.cash_machine || "unknown";
      if (cashMachineFilter !== cashMachine) return false;
    }
    if (diffThreshold && typeof event.diff === "number") {
      const threshold = Number(diffThreshold);
      if (Math.abs(event.diff) < threshold) return false;
    }
    if (!normalizedSearch) return true;
    const haystack = [
      event.id,
      event.event_id,
      event.reason,
      event.description,
      event.operator,
      event.terminal_id,
      event.store,
      event.pos_type,
      event.source,
      event.snapshot_id,
      event.raw_ref,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalizedSearch);
  });
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortKey === "amount") {
      const diff = (a.amount || 0) - (b.amount || 0);
      return sortDir === "asc" ? diff : -diff;
    }
    const aVal = getEventAt(a);
    const bVal = getEventAt(b);
    if (aVal === bVal) return 0;
    if (sortDir === "asc") return aVal > bVal ? 1 : -1;
    return aVal > bVal ? -1 : 1;
  });
  const totalCount = sortedEvents.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, totalCount);
  const pagedEvents = sortedEvents.slice(startIndex, endIndex);
  const selectedEvent =
    selectedIndex !== null && sortedEvents[selectedIndex]
      ? sortedEvents[selectedIndex]
      : null;
  const isModalOpen = selectedIndex !== null;
  const currentEventId =
    selectedEvent && selectedIndex !== null
      ? getEventId(selectedEvent) || `EVT-${selectedIndex + 1}`
      : "";

  useEffect(() => {
    if (!copyStatus) return;
    const timer = setTimeout(() => setCopyStatus(""), 1800);
    return () => clearTimeout(timer);
  }, [copyStatus]);

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedIndex(null);
        return;
      }
      if (event.key === "ArrowLeft") {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      }
      if (event.key === "ArrowRight") {
        setSelectedIndex((prev) => (prev < sortedEvents.length - 1 ? prev + 1 : prev));
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, sortedEvents.length]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (isModalOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
    return undefined;
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return;
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isModalOpen, selectedIndex]);

  useEffect(() => {
    if (selectedIndex === null) return;
    if (!selectedEvent) {
      setSelectedIndex(null);
      return;
    }
    const key = getEventKey(selectedEvent);
    const nextIndex = sortedEvents.findIndex((event) => getEventKey(event) === key);
    if (nextIndex === -1) {
      setSelectedIndex(null);
    } else if (nextIndex !== selectedIndex) {
      setSelectedIndex(nextIndex);
    }
  }, [sortedEvents, selectedIndex, selectedEvent]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    dateFrom,
    dateTo,
    dateField,
    storeFilter,
    posFilter,
    terminalFilter,
    cashMachineFilter,
    operatorFilter,
    typeFilter,
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

  const writeToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("コピーしました");
    } catch (error) {
      alert("コピーに失敗しました。");
    }
  };

  const handleCopyId = () => {
    if (!currentEventId) return;
    writeToClipboard(currentEventId);
  };

  const handleCopyDetails = () => {
    if (!selectedEvent) return;
    const amountValue =
      typeof getAmount(selectedEvent) === "number" ? formatYen(getAmount(selectedEvent)) : "—";
    const detailText = [
      `発生日時: ${getEventAt(selectedEvent) || "—"}`,
      `営業日: ${getBusinessDate(selectedEvent) || "—"}`,
      `店舗: ${getStoreName(selectedEvent) || "—"}`,
      `POS種別: ${getPosType(selectedEvent) || "—"}`,
      `端末ID: ${getTerminalId(selectedEvent) || "—"}`,
      `操作者: ${getOperatorDisplay(selectedEvent)}`,
      `種別: ${getEventType(selectedEvent) || "—"}`,
      `金額: ${amountValue}`,
      `内容: ${getReason(selectedEvent) || "—"}`,
      `入力元: ${getSource(selectedEvent) || "—"}`,
      `スナップショット: ${getSnapshotId(selectedEvent) || "—"}`,
      `raw参照: ${canSeeRawLink ? getRawUrl(selectedEvent) || "—" : "—"}`,
      `ID: ${currentEventId}`,
    ].join("\n");
    writeToClipboard(detailText);
  };

  const buildTimelineUrl = (event) => {
    if (!event) return "#";
    const params = new URLSearchParams();
    if (getSnapshotId(event)) params.set("snapshotId", getSnapshotId(event));
    if (getEventId(event)) params.set("eventId", getEventId(event));
    if (event.store_id) params.set("storeId", event.store_id);
    if (getTerminalId(event)) params.set("terminalId", getTerminalId(event));
    if (getBusinessDate(event)) params.set("businessDate", getBusinessDate(event));
    if (getEventAt(event)) params.set("eventAt", getEventAt(event));
    return `/audit/cash/timeline?${params.toString()}`;
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
    setDateField("business_date");
    setStoreFilter([]);
    setPosFilter([]);
    setTerminalFilter([]);
    setCashMachineFilter("all");
    setOperatorFilter([]);
    setTypeFilter([]);
    setDiffThreshold("");
  };

  const toggleFilterValue = (currentValues, value) =>
    currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];

  const handleMultiToggle = (setter, value) => {
    setter((prev) => toggleFilterValue(prev, value));
  };

  const filterSummary = [
    `期間(${dateField === "event_at" ? "日時" : "営業日"}): ${dateFrom || "—"}〜${
      dateTo || "—"
    }`,
    storeFilter.length > 0 ? `店舗: ${storeFilter.join("|")}` : "店舗: 全て",
    posFilter.length > 0 ? `POS種別: ${posFilter.join("|")}` : "POS種別: 全て",
    terminalFilter.length > 0 ? `端末: ${terminalFilter.join("|")}` : "端末: 全て",
    operatorFilter.length > 0 ? `操作者: ${operatorFilter.join("|")}` : "操作者: 全て",
    typeFilter.length > 0 ? `種別: ${typeFilter.join("|")}` : "種別: 全て",
    cashMachineFilter !== "all" ? `自動釣銭機: ${cashMachineFilter}` : "自動釣銭機: 全て",
    diffThreshold ? `差異閾値: ${diffThreshold}円` : "差異閾値: 全て",
  ];
  const activeFilterCount = [
    storeFilter.length,
    posFilter.length,
    terminalFilter.length,
    operatorFilter.length,
    typeFilter.length,
    cashMachineFilter !== "all" ? 1 : 0,
    diffThreshold ? 1 : 0,
    searchTerm.trim() ? 1 : 0,
    dateFrom || dateTo ? 1 : 0,
  ].reduce((sum, value) => sum + (value > 0 ? 1 : 0), 0);
  const mobileFilterSummary = [
    storeFilter.length > 0 ? `店舗=${storeFilter.join("|")}` : "",
    posFilter.length > 0 ? `POS=${posFilter.join("|")}` : "",
    terminalFilter.length > 0 ? `端末=${terminalFilter.join("|")}` : "",
    operatorFilter.length > 0 ? `操作者=${operatorFilter.join("|")}` : "",
    typeFilter.length > 0 ? `種別=${typeFilter.join("|")}` : "",
    cashMachineFilter !== "all" ? `釣銭機=${cashMachineFilter}` : "",
    diffThreshold ? `差異≥${diffThreshold}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("desc");
  };

  const formatDateForCsv = (value) => {
    if (!value) return "";
    return String(value);
  };

  const escapeCsvValue = (value) => {
    const raw = value ?? "";
    const text = String(raw);
    if (/[",\n]/.test(text)) {
      return `"${text.replace(/"/g, "\"\"")}"`;
    }
    return text;
  };

  const buildCsv = () => {
    const header = [
      "発生日時",
      "営業日",
      "店舗",
      "POS種別",
      "端末ID",
      "操作者",
      "種別",
      "金額",
      "内容",
      "入力元",
      "スナップショット",
      "raw参照",
      "event_id",
      "store_id",
      "terminal_id",
      "snapshot_id",
      "raw_url",
    ];
    const rows = filteredEvents.map((event) => [
      formatDateForCsv(getEventAt(event)),
      formatDateForCsv(getBusinessDate(event)),
      getStoreName(event),
      getPosType(event),
      getTerminalId(event),
      getOperatorDisplay(event),
      getEventType(event),
      typeof getAmount(event) === "number" ? String(getAmount(event)) : "",
      getReason(event),
      getSource(event),
      getSnapshotId(event),
      canSeeRawLink ? getRawUrl(event) : "—",
      getEventId(event),
      event.store_id || "",
      getTerminalId(event),
      getSnapshotId(event),
      getRawUrl(event),
    ]);
    const filterLines = [
      ["抽出期間", `${dateFrom || "—"}〜${dateTo || "—"}`],
      ["期間基準", dateField === "event_at" ? "日時" : "営業日"],
      ["店舗", storeFilter.length > 0 ? storeFilter.join("|") : "全店"],
      ["POS種別", posFilter.length > 0 ? posFilter.join("|") : "全て"],
      ["端末", terminalFilter.length > 0 ? terminalFilter.join("|") : "全て"],
      ["操作者", operatorFilter.length > 0 ? operatorFilter.join("|") : "全員"],
      ["種別", typeFilter.length > 0 ? typeFilter.join("|") : "全て"],
      ["自動釣銭機", cashMachineFilter !== "all" ? cashMachineFilter : "全て"],
      ["差異閾値", diffThreshold ? `${diffThreshold}円` : "全て"],
      ["検索", searchTerm.trim() || "—"],
      [],
    ];
    const body = [...filterLines, header, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");
    return `\ufeff${body}`;
  };

  const handleExportCsv = () => {
    if (filteredEvents.length === 0) return;
    const csv = buildCsv();
    const now = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    const filename = `events_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
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

  return (
    <div className="card denom-card event-card">
      <h2 className="denom-title">イベント一覧</h2>
      <div className={`event-filters ${isMobile ? "is-mobile" : ""}`}>
        {isMobile ? (
          <>
            <div className="event-filter-row">
              <input
                type="text"
                className="event-filter-input"
                placeholder="ID/内容/担当/端末/店舗で検索"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              <div className="event-filter-group">
                <label>
                  <span>期間</span>
                  <select
                    className="event-filter-select"
                    value={dateField}
                    onChange={(event) => setDateField(event.target.value)}
                  >
                    <option value="business_date">営業日</option>
                    <option value="event_at">日時</option>
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
              {!isFilterOpen && mobileFilterSummary && (
                <div className="event-filter-summary">{mobileFilterSummary}</div>
              )}
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
                      value={typeFilter}
                      onChange={(event) =>
                        setTypeFilter(
                          Array.from(event.target.selectedOptions, (opt) => opt.value),
                        )
                      }
                    >
                      {typeOptions.map((type) => (
                        <option
                          key={type}
                          value={type}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            handleMultiToggle(setTypeFilter, type);
                          }}
                        >
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="event-filter-group">
                  <label>
                    <span>自動釣銭機</span>
                    <select
                      className="event-filter-select"
                      value={cashMachineFilter}
                      onChange={(event) => setCashMachineFilter(event.target.value)}
                    >
                      <option value="all">全て</option>
                      <option value="present">あり</option>
                      <option value="absent">なし</option>
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
                      <option value="5000">|diff| ≥ 5,000</option>
                      <option value="20000">|diff| ≥ 20,000</option>
                    </select>
                  </label>
                </div>
                <div className="event-filter-actions">
                  <button type="button" className="ghost-button" onClick={handleClearFilters}>
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
            <div className="event-filter-divider" />
            <div className="event-result-header">
              検索結果（{totalCount}件）
            </div>
            {totalCount === 0 && (
              <div className="event-empty">
                該当するイベントはありません
                <button type="button" className="ghost-button" onClick={handleClearFilters}>
                  フィルタをクリア
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="event-filter-row">
              <input
                type="text"
                className="event-filter-input"
                placeholder="ID/内容/担当/端末/店舗 で検索"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              <div className="event-filter-group">
                <label>
                  <span>期間</span>
                  <select
                    className="event-filter-select"
                    value={dateField}
                    onChange={(event) => setDateField(event.target.value)}
                  >
                    <option value="business_date">営業日</option>
                    <option value="event_at">日時</option>
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
                    value={typeFilter}
                    onChange={(event) =>
                      setTypeFilter(
                        Array.from(event.target.selectedOptions, (opt) => opt.value),
                      )
                    }
                  >
                    {typeOptions.map((type) => (
                      <option
                        key={type}
                        value={type}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          handleMultiToggle(setTypeFilter, type);
                        }}
                      >
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="event-filter-group">
                <label>
                  <span>自動釣銭機</span>
                  <select
                    className="event-filter-select"
                    value={cashMachineFilter}
                    onChange={(event) => setCashMachineFilter(event.target.value)}
                  >
                    <option value="all">全て</option>
                    <option value="present">あり</option>
                    <option value="absent">なし</option>
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
                    <option value="5000">|diff| ≥ 5,000</option>
                    <option value="20000">|diff| ≥ 20,000</option>
                  </select>
                </label>
              </div>
              <button type="button" className="ghost-button" onClick={handleClearFilters}>
                クリア
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
            <div className="event-filter-row">
              <div className="event-filter-count">
                表示: {totalCount === 0 ? 0 : startIndex + 1}-{endIndex} / {totalCount}件
              </div>
              <div className="event-filter-pagination">
                <label>
                  <span>件数</span>
                  <select
                    value={perPage}
                    onChange={(event) => setPerPage(Number(event.target.value))}
                  >
                    {[50, 100, 200].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>
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
            </div>
            <div className="event-filter-summary">{filterSummary.join(" / ")}</div>
          </>
        )}
      </div>
      {!isMobile && totalCount === 0 ? (
        <div className="event-empty">該当するイベントはありません</div>
      ) : isMobile ? (
        <div className="event-list">
          {pagedEvents.map((event, index) => (
            <div
              key={`${event.event_at}-${index}`}
              className="event-card-mobile"
              role="button"
              tabIndex={0}
              onClick={() => setSelectedIndex(startIndex + index)}
            >
              <div className="event-card-header">
                <span
                  className={`event-kind-badge ${
                    getEventType(event) === "出金" ? "is-negative" : ""
                  }`}
                >
                  {getEventType(event) || "—"}
                </span>
                <span className="event-card-reason" title={getReason(event) || "—"}>
                  {getReason(event) || "—"}
                </span>
                <span
                  className={`event-amount ${
                    getEventType(event) === "出金" ? "amount-negative" : ""
                  }`}
                >
                  {typeof getAmount(event) === "number" ? formatYen(getAmount(event)) : "—"}
                </span>
                <span className="event-card-arrow">›</span>
              </div>
              <div className="event-card-time">{getEventAt(event) || "—"}</div>
              <div className="event-card-meta">
                <div className="event-card-meta-line">
                  {getStoreName(event) || "—"} / {getTerminalId(event) || "—"} /{" "}
                  {getPosType(event) || "—"}
                </div>
                <div className="event-card-meta-line">
                  {getOperatorDisplay(event)} / {getSource(event) || "—"}
                </div>
              </div>
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
        <div className="denom-table-wrap event-table-wrap">
          <table className="denom-table event-table event-table-compact">
            <thead>
              <tr>
                <th className="col-datetime">
                  <div className="cell-top">
                    <button
                      type="button"
                      className="event-sort-button"
                      onClick={() => handleSort("event_at")}
                    >
                      日時
                      <span className="event-sort-indicator">
                        {sortKey === "event_at" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                      </span>
                    </button>
                  </div>
                  <div className="cell-sub">営業日</div>
                </th>
                <th className="col-storepos">
                  <div className="cell-top">店舗</div>
                  <div className="cell-sub">POS</div>
                </th>
                <th className="col-terminal-source">
                  <div className="cell-top">端末ID</div>
                  <div className="cell-sub">source</div>
                </th>
                <th className="col-operator-snapshot">
                  <div className="cell-top">操作者</div>
                  <div className="cell-sub">snapshot</div>
                </th>
                <th className="col-type-reason">
                  <div className="cell-top">種別</div>
                  <div className="cell-sub">理由</div>
                </th>
                <th className="col-amount-raw">
                  <div className="cell-top">
                    <button
                      type="button"
                      className="event-sort-button"
                      onClick={() => handleSort("amount")}
                    >
                      金額
                      <span className="event-sort-indicator">
                        {sortKey === "amount" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                      </span>
                    </button>
                  </div>
                  <div className="cell-sub">raw</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {pagedEvents.map((event, index) => (
                <tr
                  key={`${event.event_at}-${index}`}
                  className="event-row-clickable"
                  onClick={() => setSelectedIndex(startIndex + index)}
                >
                  <td className="col-datetime">
                    <div className="cell-top" title={getEventAt(event) || "—"}>
                      {getEventAt(event) || "—"}
                    </div>
                    <div className="cell-sub" title={getBusinessDate(event) || "—"}>
                      {getBusinessDate(event) || "—"}
                    </div>
                  </td>
                  <td className="col-storepos">
                    <div className="cell-top" title={getStoreName(event) || "—"}>
                      {getStoreName(event) || "—"}
                    </div>
                    <div className="cell-sub" title={getPosType(event) || "—"}>
                      {getPosType(event) || "—"}
                    </div>
                  </td>
                  <td className="col-terminal-source">
                    <div className="cell-top" title={getTerminalId(event) || "—"}>
                      {getTerminalId(event) || "—"}
                    </div>
                    <div className="cell-sub" title={getSource(event) || "—"}>
                      {getSourceShort(event)}
                    </div>
                  </td>
                  <td className="col-operator-snapshot">
                    <div className="cell-top" title={getOperatorDisplay(event)}>
                      {getOperatorDisplay(event)}
                    </div>
                    <div className="cell-sub" title={getSnapshotId(event) || "—"}>
                      {getSnapshotShort(event)}
                    </div>
                  </td>
                  <td className="col-type-reason">
                    <div className="cell-top" title={getEventType(event) || "—"}>
                      {getEventType(event) || "—"}
                    </div>
                    <div className="cell-sub" title={getReason(event) || "—"}>
                      {getReason(event) || "—"}
                    </div>
                  </td>
                  <td className="col-amount-raw">
                    <div
                      className={`cell-top ${
                        getEventType(event) === "出金" ? "amount-negative" : ""
                      }`}
                    >
                      {typeof getAmount(event) === "number" ? formatYen(getAmount(event)) : "—"}
                    </div>
                    <div
                      className="cell-sub"
                      title={canSeeRawLink ? getRawUrl(event) || "—" : "—"}
                    >
                      {canSeeRawLink ? (
                        getRawUrl(event) ? (
                          <a
                            href={`/audit/cash/raw?ref=${encodeURIComponent(getRawUrl(event))}`}
                            onClick={(event) => event.stopPropagation()}
                          >
                            {getRawUrl(event)}
                          </a>
                        ) : (
                          "—"
                        )
                      ) : (
                        "—"
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {isModalOpen && selectedEvent && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedIndex(null)}
        >
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>イベント詳細</h3>
              <div className="modal-actions">
                <a
                  className="ghost-button"
                  href={buildTimelineUrl(selectedEvent)}
                  onClick={(event) => event.stopPropagation()}
                >
                  タイムラインへ
                </a>
                <button type="button" className="ghost-button" onClick={handleCopyId}>
                  IDをコピー
                </button>
                <button type="button" className="ghost-button" onClick={handleCopyDetails}>
                  詳細をコピー
                </button>
                {copyStatus && <span className="copy-status">{copyStatus}</span>}
              </div>
              <div className="modal-nav">
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))}
                  disabled={selectedIndex <= 0}
                >
                  前へ
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() =>
                    setSelectedIndex((prev) =>
                      prev < sortedEvents.length - 1 ? prev + 1 : prev,
                    )
                  }
                  disabled={selectedIndex >= sortedEvents.length - 1}
                >
                  次へ
                </button>
              </div>
              <button
                type="button"
                className="modal-close"
                aria-label="閉じる"
                onClick={() => setSelectedIndex(null)}
                ref={closeButtonRef}
              >
                ×
              </button>
            </div>
            <dl className="modal-details">
              <div>
                <dt>発生日時</dt>
                <dd>{getEventAt(selectedEvent) || "—"}</dd>
              </div>
              <div>
                <dt>営業日</dt>
                <dd>{getBusinessDate(selectedEvent) || "—"}</dd>
              </div>
              <div>
                <dt>店舗</dt>
                <dd>{getStoreName(selectedEvent) || "—"}</dd>
              </div>
              <div>
                <dt>POS種別</dt>
                <dd>{getPosType(selectedEvent) || "—"}</dd>
              </div>
              <div>
                <dt>端末ID</dt>
                <dd>{getTerminalId(selectedEvent) || "—"}</dd>
              </div>
              <div>
                <dt>操作者</dt>
                <dd>{getOperatorDisplay(selectedEvent)}</dd>
              </div>
              <div>
                <dt>種別</dt>
                <dd>{getEventType(selectedEvent) || "—"}</dd>
              </div>
              <div>
                <dt>金額</dt>
                <dd
                  className={`modal-amount ${
                    getEventType(selectedEvent) === "出金" ? "amount-negative" : ""
                  }`}
                >
                  {typeof getAmount(selectedEvent) === "number"
                    ? formatYen(getAmount(selectedEvent))
                    : "—"}
                </dd>
              </div>
              <div>
                <dt>内容</dt>
                <dd>{getReason(selectedEvent) || "—"}</dd>
              </div>
              <div>
                <dt>入力元</dt>
                <dd>{getSource(selectedEvent) || "—"}</dd>
              </div>
              <div>
                <dt>スナップショット</dt>
                <dd>{getSnapshotId(selectedEvent) || "—"}</dd>
              </div>
              <div>
                <dt>raw参照</dt>
                <dd>{canSeeRawLink ? getRawUrl(selectedEvent) || "—" : "—"}</dd>
              </div>
              <div>
                <dt>ID</dt>
                <dd>{currentEventId}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}

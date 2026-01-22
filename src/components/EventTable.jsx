import { useEffect, useState } from "react";

// イベント一覧のテーブル表示用コンポーネント
export default function EventTable() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = window.matchMedia("(max-width: 480px)");
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
  // モックデータ（本番APIに置き換え予定）
  const events = [
    {
      event_at: "2026-01-22 09:12",
      business_date: "2026-01-22",
      store: "渋谷店",
      pos_type: "通常POS",
      terminal_id: "POS-01",
      operator: "佐藤",
      kind: "入金",
      amount: 12000,
      reason: "釣銭補充",
      source: "端末入力",
    },
    {
      event_at: "2026-01-22 10:03",
      business_date: "2026-01-22",
      store: "渋谷店",
      pos_type: "通常POS",
      terminal_id: "POS-02",
      operator: "",
      kind: "出金",
      amount: 5000,
      reason: "小口現金",
      source: "端末入力",
    },
    {
      event_at: "2026-01-21 18:45",
      business_date: "2026-01-21",
      store: "新宿店",
      pos_type: "セルフPOS",
      terminal_id: "SELF-03",
      operator: "田中",
      kind: "出金",
      amount: 15000,
      reason: "両替",
      source: "釣銭機",
    },
  ];

  const formatYen = (value) => `¥${value.toLocaleString()}`;

  return (
    <div className="card denom-card event-card">
      <h2 className="denom-title">イベント一覧</h2>
      {isMobile ? (
        <div className="event-list">
          {events.map((event, index) => (
            <div className="event-card" key={`${event.event_at}-${index}`}>
              <div className="event-row">
                <span className="event-label">日時</span>
                <span className="event-value">{event.event_at}</span>
              </div>
              <div className="event-row">
                <span className="event-label">営業日</span>
                <span className="event-value">{event.business_date}</span>
              </div>
              <div className="event-row">
                <span className="event-label">店舗</span>
                <span className="event-value">{event.store}</span>
              </div>
              <div className="event-row">
                <span className="event-label">POS種別</span>
                <span className="event-value">{event.pos_type}</span>
              </div>
              <div className="event-row">
                <span className="event-label">端末ID</span>
                <span className="event-value">{event.terminal_id}</span>
              </div>
              <div className="event-row">
                <span className="event-label">操作者</span>
                <span className="event-value">
                  {event.operator ? event.operator : "操作者不明"}
                </span>
              </div>
              <div className="event-row">
                <span className="event-label">種別</span>
                <span className="event-value">{event.kind}</span>
              </div>
              <div className="event-row">
                <span className="event-label">金額</span>
                <span className={`event-value ${event.kind === "出金" ? "amount-negative" : ""}`}>
                  {formatYen(event.amount)}
                </span>
              </div>
              <div className="event-row">
                <span className="event-label">理由</span>
                <span className="event-value">{event.reason}</span>
              </div>
              <div className="event-row">
                <span className="event-label">source</span>
                <span className="event-value">{event.source}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="denom-table-wrap">
          <table className="denom-table event-table">
            <thead>
              <tr>
                <th>event_at</th>
                <th>business_date</th>
                <th>店舗</th>
                <th>POS種別</th>
                <th>端末ID</th>
                <th>操作者</th>
                <th>種別</th>
                <th>金額</th>
                <th>理由</th>
                <th>source</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr key={`${event.event_at}-${index}`}>
                  <td>{event.event_at}</td>
                  <td>{event.business_date}</td>
                  <td>{event.store}</td>
                  <td>{event.pos_type}</td>
                  <td>{event.terminal_id}</td>
                  <td>{event.operator ? event.operator : "操作者不明"}</td>
                  <td>{event.kind}</td>
                  <td className={event.kind === "出金" ? "amount-negative" : ""}>
                    {formatYen(event.amount)}
                  </td>
                  <td>{event.reason}</td>
                  <td>{event.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

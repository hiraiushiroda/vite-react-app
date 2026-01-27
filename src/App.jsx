import { useState } from "react";
import "./App.css";
import EventTable from "./components/EventTable";
import SnapshotTable from "./components/SnapshotTable";
import TimelineView from "./components/TimelineView";
function App() {
  const isAdmin = true;
  const tabs = [
    "ダッシュボード",
    "イベント一覧",
    "スナップショット",
    "差異分析",
    "タイムライン",
    ...(isAdmin ? ["設定"] : []),
  ];
  const [activeTab, setActiveTab] = useState(tabs[0]);
  return (
    <div className="app app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">TEAL BI</div>
        <div className="sidebar-section">
          <div className="sidebar-section-title">監査</div>
          <button type="button" className="sidebar-link is-active">
            現金監査
          </button>
          <button type="button" className="sidebar-link">
            監査レポート
          </button>
        </div>
        <div className="sidebar-section">
          <div className="sidebar-section-title">管理</div>
          <button type="button" className="sidebar-link">
            店舗設定
          </button>
          <button type="button" className="sidebar-link">
            アラート設定
          </button>
        </div>
        <div className="sidebar-updated">
          最終更新: 2026年 01月 22日 09:30
        </div>
      </aside>
      <main className="main">
        <header className="header">
          <div>
            <div className="breadcrumb">監査 / 現金監査</div>
            <div className="header-title">現金監査</div>
          </div>
          <div className="header-actions">
            <button type="button" className="ghost-button">
              CSV出力
            </button>
            <button type="button" className="primary-button">
              アラート設定
            </button>
          </div>
        </header>
        <div className="filters">
          <div className="filter-chip">期間: 2026/01/01 - 2026/01/22</div>
          <div className="filter-chip">店舗: 全店</div>
          <div className="filter-chip">POS: 全て</div>
          <div className="filter-chip">端末: 全て</div>
          <div className="filter-chip">自動釣銭機: 全て</div>
          <div className="filter-chip">操作者: 全員</div>
          <div className="filter-chip">種別: 全て</div>
          <div className="filter-chip">差異閾値: 5,000 / 20,000</div>
        </div>
        <div className="page-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`page-tab${activeTab === tab ? " is-active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <section className="page-content">
          <div className="page-container">
            {activeTab === "イベント一覧" ? (
              <EventTable />
            ) : activeTab === "スナップショット" ? (
              <SnapshotTable />
            ) : activeTab === "タイムライン" ? (
              <TimelineView />
            ) : (
              <div className="placeholder">
                <h2>{activeTab}</h2>
                <p>このタブの内容はプレースホルダです。</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;

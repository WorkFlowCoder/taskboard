import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import "./BoardStatsLayout.css";
import type { BoardStats } from "../../types/boardStats";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const BoardStatsLayout: React.FC<BoardStats> = (board) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="board-stats-container">
      {/* HEADER */}
      <div
        className="board-stats-header"
        onClick={() => setOpen(!open)}
      >
        <span className="board-title">{board.board_title}</span>
        <div className="chevron_stats">
          {open ? <ChevronUp /> : <ChevronDown />}
        </div>
      </div>

      {/* CONTENT */}
      {open && (
        <div className="board-stats-content">

          {/* KPI */}
          <div className="kpi-container">
            <div className="kpi-card">
              <span>Total Cards</span>
              <strong>{board.total_cards}</strong>
            </div>

            <div className="kpi-card">
              <span>Total Comments</span>
              <strong>{board.total_comments}</strong>
            </div>

            <div className="kpi-card">
              <span>Avg / Card</span>
              <strong>{board.avg_comments_per_card}</strong>
            </div>

            <div className="kpi-card">
              <span>Last Activity</span>
              <strong>
                {board.last_activity
                  ? new Date(board.last_activity).toLocaleDateString()
                  : "N/A"}
              </strong>
            </div>
          </div>

          {/* CHARTS */}
          <div className="charts-container">

            {/* Activity chart */}
            <div className="chart-box">
              <h3>Activity</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={board.cards_over_time}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" fill="var(--primary-color)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Cards per list */}
            <div className="chart-box">
              <h3>Cards per List</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={board.cards_per_list}>
                  <XAxis dataKey="list_title" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="card_count" fill="var(--primary-color)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default BoardStatsLayout;
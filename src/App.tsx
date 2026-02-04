import "./index.css";
import { useState, useEffect } from "react";
import { auth, googleProvider } from "./firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";

/* =========================
   PROFILE
========================= */

export default function Profile() {
  const [activeView, setActiveView] = useState<"calendar" | "nous" | null>(
    "calendar"
  );

  const [errands, setErrands] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem("errands");
    return saved ? JSON.parse(saved) : {};
  });

  const [user, setUser] = useState<null | {
    uid: string;
    email: string | null;
  }>(null);

  /* auth listener */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (!u) setUser(null);
      else setUser({ uid: u.uid, email: u.email });
    });
    return () => unsub();
  }, []);

  /* persist errands */
  useEffect(() => {
    localStorage.setItem("errands", JSON.stringify(errands));
  }, [errands]);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="nav-item">Index</div>

        <div className="nav-item indent">
          <span className="label">i.</span>
          <span className="underline">idée</span>
        </div>

        <div className="nav-item indent">
          <span className="label">ii.</span>
          <span
            className="underline"
            style={{ cursor: "pointer" }}
            onClick={() => setActiveView("calendar")}
          >
            calendar
          </span>
        </div>

        <div className="nav-item indent">
          <span className="label">iii.</span>
          <span className="underline">notes</span>
        </div>

        <div
          className="nav-item"
          style={{ cursor: "pointer" }}
          onClick={() => setActiveView("nous")}
        >
          nous
        </div>

        {/* AUTH */}
        <div className="nav-item" style={{ marginTop: "40px" }}>
          {user ? (
            <>
              <div style={{ fontSize: "12px" }}>{user.email}</div>
              <button onClick={() => signOut(auth)}>sign out</button>
            </>
          ) : (
            <button
              onClick={() => signInWithPopup(auth, googleProvider)}
            >
              sign in
            </button>
          )}
        </div>
      </aside>

      <div className="content">
        {activeView === "calendar" && (
          <MinimalCalendar
            errands={errands}
            setErrands={setErrands}
            canEdit={!!user}
          />
        )}

        {activeView === "nous" && (
          <div className="nous-block">
            <img src="/mypillow.jpg" alt="nous" />
            <p className="nous-text">my handsome husband xoxo</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================
   CALENDAR
========================= */

function MinimalCalendar({
  errands,
  setErrands,
  canEdit,
}: {
  errands: Record<string, string[]>;
  setErrands: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  canEdit: boolean;
}) {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function saveDraft(key: string) {
    setErrands(prev => {
      const next = { ...prev };
      if (draft.trim()) next[key] = [draft.trim()];
      else delete next[key];
      return next;
    });
    setEditingKey(null);
    setDraft("");
  }

  return (
    <div className="calendar-wrapper">
      <div className="calendar-left">
      <div className="calendar-header">
        <span
          className="month-arrow"
          onClick={() => {
            setCurrentMonth(new Date(year, month - 1, 1));
            setSelectedDay(null);
            setEditingKey(null);
          }}
        >
          ‹
        </span>

        <div className="month-title">
          {currentMonth.toLocaleString("en-US", { month: "long" })} {year}
        </div>

        <span
          className="month-arrow"
          onClick={() => {
            setCurrentMonth(new Date(year, month + 1, 1));
            setSelectedDay(null);
            setEditingKey(null);
          }}
        >
          ›
        </span>
      </div>


        <div className="calendar-grid">
          {["S", "M", "T", "W", "T", "F", "S"].map(d => (
            <div key={d} className="calendar-day-label">
              {d}
            </div>
          ))}

          {cells.map((day, i) => {
            if (!day) return <div key={i} />;

            const key = `${year}-${month + 1}-${day}`;
            const isToday =
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();

            return (
              <div
                key={key}
                className={`calendar-cell ${
                  isToday ? "today" : "dim"
                } ${selectedDay === day ? "selected" : ""}`}
                onClick={() => {
                  setSelectedDay(day);
                  if (!canEdit) return;
                  setEditingKey(key);
                  setDraft(errands[key]?.[0] || "");
                }}
              >
                <span className="day-num">{day}</span>

                {editingKey === key && canEdit ? (
                  <textarea
                    className="cell-editor"
                    value={draft}
                    autoFocus
                    onChange={e => setDraft(e.target.value)}
                    onBlur={() => saveDraft(key)}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        (e.target as HTMLTextAreaElement).blur();
                      }
                    }}
                  />
                ) : (
                  errands[key]?.[0] && (
                    <div className="cell-errand">
                      {errands[key][0]}
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

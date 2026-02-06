import "./index.css";
import { useState, useEffect } from "react";
import { auth, googleProvider } from "./firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";

/* =========================
   TYPES
========================= */

type RepeatType = "none" | "weekly" | "monthly";
type ColorType = "black" | "red" | "blue";
type Category = "reading" | "movie" | "museum";

type EventItem = {
  id: string;
  repeatId?: string; // 有就是 repeat rule
  text: string;
  note?: string;
  time?: number;
  startDate: string;
  repeat: "none" | "weekly" | "monthly";
  repeatDays?: number[];
  until?: string;
  color: ColorType;
};

type EventInstance = EventItem & {
  instanceDate: string;   // YYYY-MM-DD
  isInstance: true;
};


type ErrandsMap = { events: EventItem[] };

type EditTarget =
  | { mode: "single"; instance: EventInstance }
  | { mode: "series"; rule: EventItem }
  | null;

type ContentItem = {
  id: string;

  cover?: string;      // 可选
  title: string;

  author?: string;
  date?: string;       // MM/YY
  address?: string;
  reader?: string;

  notes: ReadingNote[];
};

type ContentNote = {
  id: string;
  date: string;        // YYYY-MM-DD
  content: string;
};



/* =========================
   UTILS
========================= */

function formatTime(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

function toDate(s: string) {
  return new Date(s + "T00:00:00");
}

function occursOnDate(ev: EventItem, date: string) {
  const d = toDate(date);
  if (d < toDate(ev.startDate)) return false;
  if (ev.until && d > toDate(ev.until)) return false;

  if (ev.repeat === "none") return ev.startDate === date;

  if (ev.repeat === "weekly") {
  if (!ev.repeatDays?.includes(d.getDay())) return false;

  const start = toDate(ev.startDate);
  const diffDays = Math.floor(
    (d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  return diffDays >= 0;
}


  if (ev.repeat === "monthly") {
  const start = toDate(ev.startDate);

  const afterStartMonth =
    d.getFullYear() > start.getFullYear() ||
    (d.getFullYear() === start.getFullYear() && d.getMonth() >= start.getMonth());

  return afterStartMonth && d.getDate() === start.getDate();
}


  return false;
}
/* =========================
   PROFILE
========================= */

export default function App() {
    
    type ActiveView = "calendar" | "notes" | "nous";

    const [activeView, setActiveView] = useState<ActiveView>("calendar");

    type NotesView = "index" | "reading" | "movie" | "museum";

    const [notesView, setNotesView] = useState<NotesView>("index");


    
    const [errands, setErrands] = useState<ErrandsMap>(() => {
        try {
          const raw = localStorage.getItem("errands");
          if (!raw) return { events: [] };
          return JSON.parse(raw);
        } catch {
          return { events: [] };
        }
      });

    const [user, setUser] = useState<null | {
        uid: string;
        email: string | null;
      }>(null);

    const ALLOWED_EMAILS = ["chiuliaa@gmail.com", "ethanfortier6409@gmail.com",
    ];

    const canEdit =
      user !== null &&
      user.email !== null &&
      ALLOWED_EMAILS.includes(user.email);

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

      const [selectedId, setSelectedId] = useState<string | null>(null);

    type RepeatType = "none" | "weekly" | "monthly";

    type EventItem = {
      id: string;
      repeatId?: string;
      text: string;
      time: number;            // minutes since midnight
      startDate: string;       // YYYY-MM-DD
      repeat: RepeatType;
      repeatDays?: number[];   // 0..6
      until?: string;          // YYYY-MM-DD
      color: "black" | "red" | "blue";
    };

    type ErrandsMap = {events: EventItem[]};

  return (
    <div className="app">
      <aside className="sidebar">
        <div
          className={`nav-item ${activeView === "index" ? "active" : ""}`}
          onClick={() => setActiveView("index")}
        >
          Index
        </div>
        <div
          className={`nav-item indent ${activeView === "nous" ? "active" : ""}`}
          style={{ cursor: "pointer" }}
          onClick={() => setActiveView("nous")}
        >
          <span className="label">i.</span>
          <span className="underline">nous</span>
        </div>

        <div
          className={`nav-item indent ${activeView === "idée" ? "active" : ""}`}
          onClick={() => setActiveView("idée")}
        >
          <span className="label">ii.</span>
          <span className="underline">idée</span>
        </div>

        <div
          className={`nav-item indent ${activeView === "calendar" ? "active" : ""}`}
          onClick={() => setActiveView("calendar")}
        >
          <span className="label">iii.</span>
          <span className="underline">calendar</span>
        </div>


        <div
          className={`nav-item indent ${activeView === "notes" ? "active" : ""}`}
          onClick={() => {
            setActiveView("notes");
            setNotesView("index");
          }}
        >
          <span className="label">iv.</span>
          <span className="underline">notes</span>
        </div>



        <div
          className={`nav-item indent ${activeView === "confession" ? "active" : ""}`}
          onClick={() => setActiveView("confession")}
          style={{ cursor: "pointer" }}
        >
          <span className="label">v.</span>
          <span className="underline">confession</span>
        </div>

        {/* AUTH */}
      <div className="nav-item" style={{ marginTop: "40px" }}>
        {user ? (
          <>
            <div style={{ fontSize: "12px" }}>{user.email}</div>
            {!canEdit && (
              <div style={{ fontSize: "11px", opacity: 0.6 }}>
                view only
              </div>
            )}
            <button onClick={() => signOut(auth)}>sign out</button>
          </>
        ) : (
          <button onClick={() => signInWithPopup(auth, googleProvider)}>
            sign in
          </button>
        )}
      </div>

      </aside>

      <div className="content">
        {activeView === "calendar" && (
          <Calendar
            errands={errands}
            setErrands={setErrands}
            canEdit={canEdit}
          />
        )}

        {activeView === "notes" && (
          <Notes notesView={notesView} setNotesView={setNotesView} />
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
/*------------------------------------------------------------------------------------------ */
function Notes({
  notesView,
  setNotesView,
}: {
  notesView: "index" | "reading" | "movie" | "museum";
  setNotesView: (v: "index" | "reading" | "movie" | "museum") => void;
}) {
  if (notesView === "index") {
    return <NotesIndex onSelect={setNotesView} />;
  }

  // 三个 category 共用一套逻辑
  if (
    notesView === "reading" ||
    notesView === "movie" ||
    notesView === "museum"
  ) {
    return <ContentShelf />;
  }

  return null;
}


function ReadingShelf() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [creating, setCreating] = useState(false);
  const [openBookId, setOpenBookId] = useState<string | null>(null);

  if (openBookId) {
    const book = items.find(b => b.id === openBookId)!;
    return (
      <ReadingNotebook
        item={book}
        onBack={() => setOpenBookId(null)}
        onUpdate={updated =>
          setItems(items =>
            items.map(i => i.id === updated.id ? updated : i)
          )
        }
      />
    );
  }

  return (
  <>
    {creating && (
      <CreateContentModal
        onCancel={() => setCreating(false)}
        onCreate={item => {
          setItems(items => [...items, item]);
          setCreating(false);
        }}
      />
    )}

    <button onClick={() => setCreating(true)}>add</button>

    {items.length === 0 ? (
      <div className="empty-state">
      </div>
    ) : (
      <ShelfGrid
        items={items}
        onSelect={setOpenBookId}
      />
    )}
  </>
);
}

function MovieShelf() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [creating, setCreating] = useState(false);
  const [openMovieId, setOpenMovieId] = useState<string | null>(null);

  if (openMovieId) {
    const movie = items.find(b => b.id === openMovieId)!;
    return (
      <ReadingNotebook
        item={movie}
        onBack={() => setOpenMovieId(null)}
        onUpdate={updated =>
          setItems(items =>
            items.map(i => i.id === updated.id ? updated : i)
          )
        }
      />
    );
  }

 return (
  <>
    {creating && (
      <CreateContentModal
        onCancel={() => setCreating(false)}
        onCreate={item => {
          setItems(items => [...items, item]);
          setCreating(false);
        }}
      />
    )}

    <button onClick={() => setCreating(true)}>add</button>

    {items.length === 0 ? (
      <div className="empty-state">
      </div>
    ) : (
      <ShelfGrid
        items={items}
        onSelect={setOpenMoiveId}
      />
    )}
  </>
);
}

function MuseumShelf() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [creating, setCreating] = useState(false);
  const [openMuseumId, setOpenMuseumId] = useState<string | null>(null);

  if (openMuseumId) {
    const movie = items.find(b => b.id === openMuseumId)!;
    return (
      <ReadingNotebook
        item={movie}
        onBack={() => setOpenMuseumId(null)}
        onUpdate={updated =>
          setItems(items =>
            items.map(i => i.id === updated.id ? updated : i)
          )
        }
      />
    );
  }

  return (
  <>
    {creating && (
      <CreateContentModal
        onCancel={() => setCreating(false)}
        onCreate={item => {
          setItems(items => [...items, item]);
          setCreating(false);
        }}
      />
    )}

    <button onClick={() => setCreating(true)}>add</button>

    {items.length === 0 ? (
      <div className="empty-state">
      </div>
    ) : (
      <ShelfGrid
        items={items}
        onSelect={setOpenMuseumId}
      />
    )}
  </>
);
}

function ContentShelf() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [creating, setCreating] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  // === DETAIL / NOTEBOOK ===
  if (openId) {
    const item = items.find(i => i.id === openId)!;
    return (
      <ReadingNotebook
        item={item}
        onBack={() => setOpenId(null)}
        onUpdate={updated =>
          setItems(items =>
            items.map(i => i.id === updated.id ? updated : i)
          )
        }
      />
    );
  }

  // === SHELF ===
  return (
    <>
      {creating && (
        <CreateContentModal
          onCancel={() => setCreating(false)}
          onCreate={item => {
            setItems(items => [...items, item]);
            setCreating(false);
          }}
        />
      )}

      <button onClick={() => setCreating(true)}>add</button>

      {items.length === 0 ? (
        <div className="empty-state">
          nothing here yet
        </div>
      ) : (
        <ShelfGrid
          items={items}
          onSelect={setOpenId}
        />
      )}
    </>
  );
}

function ReadingNotebook({
  item,
  onBack,
  onUpdate,
}: {
  item: ContentItem;
  onBack: () => void;
  onUpdate: (item: ContentItem) => void;
}) {
  return (
    <div className="reading-notebook">
      <button onClick={onBack}>← back</button>

      <ContentMeta item={item} onUpdate={onUpdate}/>

      <NotesPanel
        notes={item.notes}
        onAdd={content => {
          const today = new Date().toISOString().slice(0, 10);
          onUpdate({
            ...item,
            notes: [
              ...item.notes,
              {
                id: crypto.randomUUID(),
                date: today,
                content,
              },
            ],
          });
        }}
        onEdit={(id, content) =>
          onUpdate({
            ...item,
            notes: item.notes.map(n =>
              n.id === id ? { ...n, content } : n
            ),
          })
        }
        onDelete={id =>
          onUpdate({
            ...item,
            notes: item.notes.filter(n => n.id !== id),
          })
        }
      />
    </div>
  );
}

function NotesIndex({
  onSelect,
}: {
  onSelect: (v: "reading" | "movie" | "museum") => void;
}) {
  const blocks = [
    { id: "reading", title: "reading" },
    { id: "movie", title: "movie"},
    { id: "museum", title: "museum"},
  ];
  
  return (
    <div className="notes-index">
      {blocks.map(b => (
        <div
          key={b.id}
          className="notes-item"
          onClick={() => onSelect(b.id)}
        >
          {b.title}
        </div>
      ))}
    </div>

  );
}

function NotesList({
  notes,
  onEdit,
  onDelete,
}: {
  notes: ReadingNote[];
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div>
      {notes.map(n => (
        <div key={n.id}>
          <div>{n.date}</div>
          <div>{n.content}</div>
          <button onClick={() => onEdit(n.id, n.content)}>edit</button>
          <button onClick={() => onDelete(n.id)}>delete</button>
        </div>
      ))}
    </div>
  );
}

/*------------------------------------------------------------------------------------------ */
function ShelfGrid({
  items,
  onSelect,
}: {
  items: ContentItem[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="content-grid">
      {items.map(item => (
        <div
          key={item.id}
          className="content-cell"
          onClick={() => onSelect(item.id)}
        >
          {item.cover && <img src={item.cover} />}
          <div>{item.title}</div>
          <div>{item.author}</div>
        </div>
      ))}
    </div>
  );
}


function ContentMeta({
  item,
  onUpdate,
}: {
  item: ContentItem;
  onUpdate: (item: ContentItem) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item);

  useEffect(() => {
    setDraft(item);
  }, [item]);

  function save() {
    onUpdate(draft);
    setEditing(false);

    
  }

  if (!editing) {
    return (
      <div className="content-meta" onClick={() => setEditing(true)}>
        {item.cover && <img src={item.cover} />}
        <div className="title">{item.title}</div>

        {item.author && <div>{item.author}</div>}
        {item.date && <div>{item.date}</div>}
        {item.address && <div>{item.address}</div>}
        {item.reader && <div>{item.reader}</div>}
      </div>
    );
  }

  return (
    <div className="content-meta editing">
    <input
      id="edit-cover-input"
      type="file"
      accept="image/*"
      hidden
      onChange={e => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setDraft(d => ({ ...d, cover: url }));
      }}
    />

      <input
        placeholder="title"
        value={draft.title}
        onChange={e => setDraft({ ...draft, title: e.target.value })}
      />

      <input
        placeholder="author"
        value={draft.author ?? ""}
        onChange={e => setDraft({ ...draft, author: e.target.value || undefined })}
      />

      <input
        placeholder="MM/YY"
        value={draft.date ?? ""}
        onChange={e => setDraft({ ...draft, date: e.target.value || undefined })}
      />

      <input
        placeholder="address"
        value={draft.address ?? ""}
        onChange={e => setDraft({ ...draft, address: e.target.value || undefined })}
      />

      <input
        placeholder="reader"
        value={draft.reader ?? ""}
        onChange={e => setDraft({ ...draft, reader: e.target.value || undefined })}
      />

      <button onClick={save}>save</button>
    </div>
  );
}

function CreateContentModal({
  onCreate,
  onCancel,
}: {
  onCreate: (item: ContentItem) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<ContentItem>({
    id: crypto.randomUUID(),
    title: "",
    author: "",
    date: "",
    address: "",
    reader: "",
    cover: "",
    notes: [],
  });

  function submit() {
    if (!draft.title.trim()) return;

    onCreate({
      ...draft,
      author: draft.author || undefined,
      date: draft.date || undefined,
      address: draft.address || undefined,
      cover: draft.cover || undefined,
      reader: draft.reader || undefined,
    });
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>


      {/* COVER UPLOAD */}
         <div
            className="cover-upload"
            onClick={() => document.getElementById("cover-input")?.click()}
          >
            {draft.cover ? (
              <img src={draft.cover} alt="cover" />
            ) : (
              <div className="cover-placeholder">upload cover</div>
            )}
          </div>

          <input
            id="cover-input"
            type="file"
            accept="image/*"
            hidden
            onChange={e => {
              const file = e.target.files?.[0];
              if (!file) return;

              const url = URL.createObjectURL(file);
              setDraft(d => ({ ...d, cover: url }));
            }}
          />

        <input
          placeholder="title"
          value={draft.title}
          onChange={e => setDraft({ ...draft, title: e.target.value })}
        />

        <input
          placeholder="author"
          value={draft.author ?? ""}
          onChange={e => setDraft({ ...draft, author: e.target.value })}
        />

        <input
          placeholder="MM/YY"
          value={draft.date ?? ""}
          onChange={e => setDraft({ ...draft, date: e.target.value })}
        />

        <input
          placeholder="address"
          value={draft.address ?? ""}
          onChange={e => setDraft({ ...draft, address: e.target.value })}
        />

        <input
          placeholder="reader"
          value={draft.reader ?? ""}
          onChange={e => setDraft({ ...draft, reader: e.target.value })}
        />

        <div className="modal-actions">
          <button onClick={onCancel}>cancel</button>
          <button onClick={submit}>create</button>
        </div>
      </div>
    </div>
  );
}

function NotesPanel({
  notes,
  onAdd,
  onEdit,
  onDelete,
}: {
  notes: ContentNote[];
  onAdd: (content: string) => void;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}) {
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  function submit() {
    if (!input.trim()) return;
    onAdd(input.trim());
    setInput("");
  }

  return (
    <div className="notes-panel">
      {/* INPUT */}
        <div className="notes-input-wrapper">
          <textarea
            className="notes-input"
            placeholder="write a note..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                submit();
              }
            }}
          />

          <button
            className="note-add-btn"
            onClick={submit}
            aria-label="add note"
          >
            +
          </button>
        </div>


      {/* STACKED NOTES */}
      <div className="notes-stack">
        {[...notes].reverse().map(n => (
          <div key={n.id} className="note-card">
            <div className="note-date">{n.date}</div>

            {editingId === n.id ? (
              <>
                <textarea
                  value={editingText}
                  onChange={e => setEditingText(e.target.value)}
                />
                <button
                  onClick={() => {
                    onEdit(n.id, editingText);
                    setEditingId(null);
                  }}
                >
                  save
                </button>
              </>
            ) : (
              <div
                className="note-content"
                onClick={() => {
                  setEditingId(n.id);
                  setEditingText(n.content);
                }}
              >
                {n.content}
              </div>
            )}

            <button
              className="note-delete"
              onClick={() => onDelete(n.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
/*------------------------------------------------------------------------------------------ */

function Calendar({
  errands,
  setErrands,
  canEdit,
}: {
  errands: ErrandsMap;
  setErrands: React.Dispatch<React.SetStateAction<ErrandsMap>>;
  canEdit: boolean;
}) {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(
  today.getMonth() + 1
).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [editing, setEditing] = useState<EventItem | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const [editTarget, setEditTarget] = useState<EditTarget>(null);

  function handleSave(ev: EventItem) {
  saveEvent(ev);
  setEditing(null);
  setEditTarget(null);
}

  function handleDelete(ev: EventItem, all: boolean) {
    deleteEvent(ev, all);
    setEditing(null);
    setEditTarget(null);
  }

  function openNew(dateKey: string) {
    if (!canEdit) return;
    setEditing({
      id: crypto.randomUUID(),
      text: "",
      note: "",
      time: undefined,
      startDate: dateKey,
      repeat: "none",
      color: "black",
    });
  }

function saveEvent(ev: EventItem) {
  setErrands(prev => {
    // 1. repeatId 只在“第一次创建 repeat”时生成
    const repeatId =
      ev.repeat === "none"
        ? undefined
        : ev.repeatId ?? crypto.randomUUID();

    // 2. 强制 weekly 至少有一天
    let repeatDays = ev.repeatDays;
    if (ev.repeat === "weekly") {
      repeatDays =
        repeatDays && repeatDays.length
          ? repeatDays
          : [toDate(ev.startDate).getDay()];
    }

    // 3. 强制 repeat 必须有 until
    let until = ev.until;
    if (ev.repeat !== "none" && !until) {
      // 默认给一个合理的结束，比如 3 个月
      const d = toDate(ev.startDate);
      d.setMonth(d.getMonth() + 3);
      until = d.toISOString().slice(0, 10);
    }

    const normalized: EventItem = {
      ...ev,
      repeatId,
      repeatDays,
      until,
    };

    return {
      events: [
        ...prev.events.filter(e =>
          repeatId ? e.repeatId !== repeatId : e.id !== ev.id
        ),
        normalized,
      ],
    };
  });

  setEditing(null);
}


  function deleteEvent(ev: EventItem, all: boolean) {
    setErrands(prev => ({
      events: prev.events.filter(e =>
        all && ev.repeatId ? e.repeatId !== ev.repeatId : e.id !== ev.id
      ),
    }));
    setEditing(null);
  }

  return (
          <div className="calendar-wrapper">
            <div className="calendar-left">
              {/* HEADER */}
              <div className="calendar-header">
                <span onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}>
                  ‹
                </span>
                <div className="month-title">
                  {currentMonth.toLocaleString("en-US", { month: "long" })} {year}
                </div>
                <span onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}>
                  ›
                </span>
              </div>

      {/* GRID */}
      <div className="calendar-grid"> {
      ["S","M","T","W","T","F","S"].map(d => ( 
              <div key={d} className="calendar-day-label">{d}</div> )
            )} {cells.map((day, i) => { if (!day) return <div key={i} />;

          const dateKey =`${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

          function expandEventsForDate(
                    events: EventItem[],
                    dateKey: string
                  ): EventInstance[] {
                    return events
                      .filter(e => occursOnDate(e, dateKey))
                      .map(e => ({
                        ...e,
                        instanceDate: dateKey,
                        isInstance: e.repeat !== "none",
                      }));
                  }


          const dayEvents = expandEventsForDate(errands.events, dateKey)
                            .sort((a, b) => {
                              if (a.time === undefined && b.time === undefined) return 0;
                              if (a.time === undefined) return 1;
                              if (b.time === undefined) return -1;
                              return a.time - b.time;
                            });


          return (
            <div
              key={dateKey}
                className={`calendar-cell ${
                              dateKey === todayKey ? "today" : "dim"
                          }`}
              onClick={() => openNew(dateKey)}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                const id = e.dataTransfer.getData("eventId");
                const ev = errands.events.find(x => x.id === id);
                if (!ev) return;

                saveEvent({
                  ...ev,
                  startDate: dateKey,
                });
              }}
            >
              <span className="day-num">{day}</span>

              {dayEvents.map(ev => (
                <div
                  key={ev.id}
                  className={`cell-errand ${ev.color}`}
                  draggable
                  onDragStart={e =>
                    e.dataTransfer.setData("eventId", ev.id)
              }
              onClick={e => {
                e.stopPropagation();

              const rule = errands.events.find(e => e.id === ev.id);
              if (!rule) return;

              setEditTarget({
                mode: "series",
                rule,
              });
              }}


                >
                  {ev.time !== undefined && `${formatTime(ev.time)} `}
                  {ev.text}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>

    {/* MODAL */}
    {editing && (
      <EventModal
        event={editing}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={() => setEditing(null)}
      />
    )}

    {editTarget?.mode === "series" && (
      <EventModal
        event={editTarget.rule}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={() => setEditTarget(null)}
      />
    )}
  </div>
);
}

/* =========================
   MODAL
========================= */
function EventModal({
  event,
  onSave,
  onDelete,
  onClose,
}: {
  event: EventItem;
  onSave: (e: EventItem) => void;
  onDelete: (e: EventItem, all: boolean) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(event);

  useEffect(() => {
    setDraft(event);
  }, [event]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <textarea
          placeholder="event"
          value={draft.text}
          onChange={e => setDraft({ ...draft, text: e.target.value })}
        />

        <textarea
          placeholder="note"
          value={draft.note}
          onChange={e => setDraft({ ...draft, note: e.target.value })}
        />

              {/* TIME */}
          <div style={{ marginTop: "0px" }}>
            <label style={{ fontSize: "12px" }}>
              <input
                type="checkbox"
                checked={draft.time !== undefined}
                onChange={e => {
                  setDraft(d =>
                    e.target.checked
                      ? { ...d, time: d.time ?? 0 * 0 } 
                      : { ...d, time: undefined }
                  );
                }}
              />
              {" "} time
            </label>

            {draft.time !== undefined && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ fontSize: "12px", minWidth: "42px", textAlign: "right" }}>
                  {formatTime(draft.time)}
                </div>

                <input
                  type="range"
                  min={0}
                  max={23 * 60 + 45}
                  step={5}
                  value={draft.time}
                  onChange={e =>
                    setDraft({ ...draft, time: Number(e.target.value) })
                  }
                />
              </div>

              </>
            )}
          </div>

        <select
          value={draft.repeat}
          onChange={e => {
            const r = e.target.value as RepeatType;
            setDraft(d => ({
              ...d,
              repeat: r,
              repeatDays:
                r === "weekly"
                  ? d.repeatDays && d.repeatDays.length
                    ? d.repeatDays
                    : [toDate(d.startDate).getDay()]
                  : undefined,
            }));
          }}
        >

          <option value="none">no repeat</option>
          <option value="weekly">weekly</option>
          <option value="monthly">monthly</option>
        </select>

      {draft.repeat === "weekly" && (
        <div className="repeat-days">
          {"SMTWTFS".split("").map((l, i) => (
            <span
              key={i}
              className={draft.repeatDays?.includes(i) ? "active" : ""}
              onClick={() => {
                const set = new Set(draft.repeatDays ?? []);
                set.has(i) ? set.delete(i) : set.add(i);
                setDraft({ ...draft, repeatDays: Array.from(set) });
              }}
            >
              {l}
            </span>
          ))}
        </div>
      )}

        <input
          type="date"
          value={draft.until || ""}
          onChange={e => setDraft({ ...draft, until: e.target.value })}
        />

        <div className="modal-actions">
          <button onClick={() => onDelete(draft, false)}>delete</button>
          <button onClick={() => onSave(draft)}>save</button>
        </div>

      </div>
    </div>
  );
}

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { createRoot } from "react-dom/client";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Receipt,
  BarChart3,
  Settings,
  Search,
  Plus,
  ArrowUpRight,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  CalendarDays,
  Clock,
  MoreHorizontal,
  X,
  Download,
  Check,
  Menu,
  Command,
  Sun,
  Moon,
  ArrowLeft,
  Briefcase,
  Wallet,
  CheckCircle2,
  Target,
  Layers,
  Activity as ActivityIcon,
  ExternalLink,
  Trash2,
  Upload,
  RotateCcw,
  FileText,
  Printer,
  GripVertical,
} from "lucide-react";
import {
  seed,
  reducer,
  validateState,
  statuses,
  taskStatuses,
  people,
  colors,
  money,
  progress,
  totals,
  revenue,
  isOverdue,
  today,
  uid,
} from "./store";
import type {
  State,
  Action,
  Project,
  Task,
  Client,
  Invoice,
  TaskStatus,
} from "./store";
type Page =
  | "Overview"
  | "Projects"
  | "Tasks"
  | "Clients"
  | "Invoices"
  | "Analytics"
  | "Settings";
type Modal = {
  type:
    | "project"
    | "task"
    | "client"
    | "invoice"
    | "project-detail"
    | "invoice-detail"
    | "client-detail"
    | "search"
    | "reset"
    | "delete-task";
  id?: string;
  projectId?: string;
};
type Ctx = {
  state: State;
  dispatch: React.Dispatch<Action>;
  go: (p: Page) => void;
  open: (m: Modal | null) => void;
  toast: (s: string) => void;
};
const Context = createContext<Ctx>(null!);
const useApp = () => useContext(Context);
const icons = {
  Overview: LayoutDashboard,
  Projects: FolderKanban,
  Tasks: CheckSquare,
  Clients: Users,
  Invoices: Receipt,
  Analytics: BarChart3,
  Settings,
};
const storageKey = "atlas-studio-v1";
let initialWarning = "";
function load() {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? validateState(JSON.parse(raw)) : seed();
  } catch {
    initialWarning =
      "Saved data could not be loaded. A fresh demo is shown; export a backup before leaving.";
    return seed();
  }
}
function Badge({ value }: { value: string }) {
  return (
    <span className={"badge " + value.toLowerCase().replaceAll(" ", "-")}>
      {value}
    </span>
  );
}
function Avatar({
  name,
  color,
  small = false,
}: {
  name: string;
  color?: string;
  small?: boolean;
}) {
  return (
    <span
      className={"avatar " + (small ? "small" : "")}
      style={{ background: color ? color + "22" : undefined, color }}
    >
      {name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
}
function Empty({
  title,
  detail,
  action,
}: {
  title: string;
  detail: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty">
      <Layers size={32} />
      <h3>{title}</h3>
      <p>{detail}</p>
      {action}
    </div>
  );
}
function Head({
  title,
  sub,
  action,
}: {
  title: string;
  sub: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      {action}
    </div>
  );
}
function Button({
  children,
  onClick,
  secondary = false,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { secondary?: boolean }) {
  return (
    <button
      {...rest}
      className={"button " + (secondary ? "secondary" : "")}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
function Panel({
  title,
  children,
  action,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={"panel " + className}>
      <div className="panel-title">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
function Dialog({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    const el = ref.current;
    return () => el?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={wide ? "wide" : ""}
      aria-label={title}
    >
      <div className="dialog-head">
        <h2>{title}</h2>
        <button
          className="icon-btn"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
function download(name: string, content: string, type = "application/json") {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function Chart({ full = false }: { full?: boolean }) {
  const { state } = useApp();
  const [period, setPeriod] = useState(6);
  const data = revenue(state).slice(-period);
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <Panel
      title="Revenue overview"
      action={
        <select
          aria-label="Revenue period"
          value={period}
          onChange={(e) => setPeriod(+e.target.value)}
        >
          <option value={6}>Last 6 paid months</option>
          <option value={3}>Last 3 paid months</option>
        </select>
      }
    >
      <div className="chart-total">
        {money(data.reduce((a, d) => a + d.value, 0))}
        <span>
          <i className="dot" /> Paid invoices · by issue month
        </span>
      </div>
      <div
        className={"chart " + (full ? "large" : "")}
        role="img"
        aria-label={data.map((d) => d.month + ": " + money(d.value)).join(", ")}
      >
        <div className="chart-axis">
          <span>{money(max)}</span>
          <span>{money(max / 2)}</span>
          <span>$0</span>
        </div>
        <div className="bars">
          {data.map((d, i) => (
            <div key={d.month} className="bar-col">
              <div
                className={"bar " + (i === data.length - 1 ? "last" : "")}
                style={{ height: Math.max(3, (d.value / max) * 100) + "%" }}
                tabIndex={0}
                aria-label={d.label + " " + money(d.value)}
              >
                <span className="bar-tip">{money(d.value)}</span>
              </div>
              <small>{d.label}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="chart-note">
        Based on {state.invoices.filter((i) => i.status === "Paid").length} paid
        demo invoices. Values update as invoices change.
      </div>
    </Panel>
  );
}
function ProjectCard({ project: p }: { project: Project }) {
  const { state, open } = useApp();
  const client = state.clients.find((c) => c.id === p.clientId)!;
  const pct = progress(state, p.id);
  return (
    <article className="project-card">
      <div className="project-top">
        <span
          className="project-symbol"
          style={{ background: p.color + "18", color: p.color }}
        >
          <Layers size={22} />
        </span>
        <Badge value={p.status} />
      </div>
      <button
        className="project-name"
        onClick={() => open({ type: "project-detail", id: p.id })}
      >
        {p.name}
        <ArrowUpRight size={16} />
      </button>
      <p>{client.name}</p>
      <div className="project-progress">
        <span>Task progress</span>
        <strong>{pct}%</strong>
      </div>
      <progress
        max="100"
        value={pct}
        style={{ accentColor: p.color }}
        aria-label={p.name + " progress"}
      />
      <div className="project-foot">
        <span>
          <CalendarDays size={13} />
          {new Date(p.due + "T12:00:00").toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
        <Avatar name={p.lead} small color={p.color} />
      </div>
    </article>
  );
}
function Overview() {
  const { state, go, open } = useApp();
  const t = totals(state);
  return (
    <>
      <Head
        title={`Good morning, ${state.settings.name.split(" ")[0]}.`}
        sub="Here’s what’s happening across your studio today."
        action={
          <Button onClick={() => open({ type: "project" })}>
            <Plus size={17} />
            New project
          </Button>
        }
      />
      <div className="welcome-strip">
        <span className="welcome-icon">✦</span>
        <div>
          <strong>A little clarity. A lot of possibility.</strong>
          <p>Your projects, people, and progress. All in one place.</p>
        </div>
        <span className="workspace-tag">
          Studio workspace <ArrowUpRight size={14} />
        </span>
      </div>
      <div className="metrics">
        {[
          {
            label: "Total revenue",
            value: money(t.paid),
            note: "From paid invoices",
            icon: Wallet,
            tone: "green",
          },
          {
            label: "Active projects",
            value: String(t.active).padStart(2, "0"),
            note: `${state.projects.length} projects in your workspace`,
            icon: Briefcase,
            tone: "violet",
          },
          {
            label: "Outstanding",
            value: money(t.outstanding),
            note: `${state.invoices.filter((i) => isOverdue(i)).length} overdue invoice(s)`,
            icon: Receipt,
            tone: "orange",
          },
          {
            label: "Tasks completed",
            value: `${t.done}`,
            note: `of ${state.tasks.length} tasks across projects`,
            icon: CheckCircle2,
            tone: "blue",
          },
        ].map((m) => (
          <article className="metric" key={m.label}>
            <div>
              <span>{m.label}</span>
              <m.icon size={17} />
            </div>
            <strong>{m.value}</strong>
            <small>
              <i className={"dot " + m.tone} />
              {m.note}
            </small>
          </article>
        ))}
      </div>
      <div className="overview-middle">
        <Chart />
        <Panel
          title="Coming up"
          action={
            <button className="text-button" onClick={() => go("Tasks")}>
              View all <ArrowRight size={14} />
            </button>
          }
        >
          <div className="upcoming">
            {state.tasks
              .filter((t) => t.status !== "Done")
              .sort((a, b) => a.due.localeCompare(b.due))
              .slice(0, 4)
              .map((task) => (
                <button
                  className="upcoming-row"
                  key={task.id}
                  onClick={() => open({ type: "task", id: task.id })}
                >
                  <span className="date-box">
                    <strong>{task.due.slice(8)}</strong>
                    {new Date(task.due + "T12:00:00").toLocaleDateString(
                      "en-US",
                      { month: "short" },
                    )}
                  </span>
                  <span>
                    <strong>{task.title}</strong>
                    <small>
                      {
                        state.projects.find((p) => p.id === task.projectId)
                          ?.name
                      }
                    </small>
                  </span>
                  <i className={"priority-dot " + task.priority} />
                </button>
              ))}
            {state.tasks.every((t) => t.status === "Done") && (
              <Empty title="All caught up" detail="Your task list is clear." />
            )}
          </div>
        </Panel>
      </div>
      <div className="section-title">
        <h2>
          Projects in motion <span>{t.active}</span>
        </h2>
        <button className="text-button" onClick={() => go("Projects")}>
          All projects <ArrowRight size={15} />
        </button>
      </div>
      <div className="project-grid">
        {state.projects
          .filter((p) => p.status !== "Completed")
          .slice(0, 3)
          .map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
      </div>
      <div className="overview-bottom">
        <Panel title="Recent activity">
          <ActivityList />
        </Panel>
        <div className="studio-note">
          <div className="note-mark">✳</div>
          <span className="eyebrow">Built for the work you love</span>
          <h2>
            Less busywork.
            <br />
            More good work.
          </h2>
          <p>A thoughtful workspace for small teams with big ideas.</p>
          <button className="text-button" onClick={() => go("Analytics")}>
            Explore your studio <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
function ActivityList() {
  const { state } = useApp();
  return (
    <div className="activity-list">
      {state.activity.slice(0, 5).map((a, i) => (
        <div key={a.id}>
          <span className="activity-icon">
            <ActivityIcon size={14} />
          </span>
          <span>
            <strong>{a.text}</strong>
            <small>
              {new Date(a.at).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </small>
          </span>
          {i === 0 && <span className="new-label">Latest</span>}
        </div>
      ))}
    </div>
  );
}
function Projects() {
  const { state, open } = useApp();
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("due");
  const list = state.projects
    .filter(
      (p) =>
        (filter === "All" || p.status === filter) &&
        (p.name + " " + state.clients.find((c) => c.id === p.clientId)?.name)
          .toLowerCase()
          .includes(q.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "budget"
        ? b.budget - a.budget
        : sort === "name"
          ? a.name.localeCompare(b.name)
          : a.due.localeCompare(b.due),
    );
  return (
    <>
      <Head
        title="Projects"
        sub="From first idea to final delivery. Keep every project moving."
        action={
          <Button onClick={() => open({ type: "project" })}>
            <Plus size={16} />
            New project
          </Button>
        }
      />
      <div className="toolbar">
        <div className="tabs">
          {["All", ...statuses].map((s) => (
            <button
              key={s}
              className={filter === s ? "selected" : ""}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="search-field">
          <Search size={16} />
          <input
            placeholder="Search projects…"
            aria-label="Search projects"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select
          aria-label="Sort projects"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="due">Due date</option>
          <option value="budget">Highest budget</option>
          <option value="name">Name</option>
        </select>
      </div>
      <div className="project-grid">
        {list.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
      {!list.length && (
        <Empty
          title="No projects found"
          detail="Try a different search or create your first project."
        />
      )}
    </>
  );
}
function Tasks() {
  const { state, dispatch, open, toast } = useApp();
  const [project, setProject] = useState("All");
  const [q, setQ] = useState("");
  const list = state.tasks.filter(
    (t) =>
      (project === "All" || t.projectId === project) &&
      t.title.toLowerCase().includes(q.toLowerCase()),
  );
  function move(id: string, status: TaskStatus) {
    const t = state.tasks.find((t) => t.id === id);
    if (t) {
      dispatch({ type: "task", value: { ...t, status } });
      toast("Task moved to " + status);
    }
  }
  return (
    <>
      <Head
        title="Task board"
        sub="A clear path from to-do to done. Drag cards or use their status menu."
        action={
          <Button onClick={() => open({ type: "task" })}>
            <Plus size={16} />
            New task
          </Button>
        }
      />
      <div className="toolbar">
        <select
          aria-label="Filter tasks by project"
          value={project}
          onChange={(e) => setProject(e.target.value)}
        >
          <option value="All">All projects</option>
          {state.projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <div className="search-field">
          <Search size={16} />
          <input
            placeholder="Search tasks…"
            aria-label="Search tasks"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <span className="muted">{list.length} tasks</span>
      </div>
      <div className="kanban">
        {taskStatuses.map((status) => (
          <section
            className="kanban-col"
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              move(e.dataTransfer.getData("text/plain"), status);
            }}
          >
            <h2>
              <i
                className={
                  "dot " +
                  (status === "Done"
                    ? "green"
                    : status === "Review"
                      ? "orange"
                      : "violet")
                }
              />
              {status}
              <span>{list.filter((t) => t.status === status).length}</span>
            </h2>
            {list
              .filter((t) => t.status === status)
              .map((t) => (
                <article
                  className="task-card"
                  key={t.id}
                  draggable
                  onDragStart={(e) =>
                    e.dataTransfer.setData("text/plain", t.id)
                  }
                >
                  <div className="task-card-top">
                    <Badge value={t.priority} />
                    <GripVertical size={15} />
                  </div>
                  <button
                    className="task-title"
                    onClick={() => open({ type: "task", id: t.id })}
                  >
                    {t.title}
                  </button>
                  <small>
                    {state.projects.find((p) => p.id === t.projectId)?.name}
                  </small>
                  <div className="task-card-bottom">
                    <span>
                      <CalendarDays size={12} />
                      {t.due.slice(5)}
                    </span>
                    <Avatar name={t.assignee} small />
                  </div>
                  <select
                    aria-label={"Status for " + t.title}
                    value={t.status}
                    onChange={(e) => move(t.id, e.target.value as TaskStatus)}
                  >
                    {taskStatuses.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </article>
              ))}
            {!list.some((t) => t.status === status) && (
              <div className="dropzone">No tasks here yet</div>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
function Clients() {
  const { state, open } = useApp();
  const [q, setQ] = useState("");
  const clients = state.clients.filter((c) =>
    (c.name + c.contact + c.industry).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <Head
        title="Client relationships"
        sub="Good work starts with good people. Keep the important details close."
        action={
          <Button onClick={() => open({ type: "client" })}>
            <Plus size={16} />
            Add client
          </Button>
        }
      />
      <div className="toolbar">
        <div className="search-field">
          <Search size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search clients…"
            aria-label="Search clients"
          />
        </div>
        <span className="muted">{clients.length} relationships</span>
      </div>
      <div className="client-grid">
        {clients.map((c) => (
          <article className="client-card" key={c.id}>
            <div className="client-top">
              <Avatar name={c.name} color={c.color} />
              <button
                className="icon-btn"
                aria-label={"Edit " + c.name}
                onClick={() => open({ type: "client", id: c.id })}
              >
                <MoreHorizontal size={18} />
              </button>
            </div>
            <button
              className="client-name"
              onClick={() => open({ type: "client-detail", id: c.id })}
            >
              {c.name}
              <ArrowUpRight size={15} />
            </button>
            <p>{c.industry}</p>
            <div className="contact-line">
              <span>{c.contact}</span>
              <small>{c.email}</small>
            </div>
            <div className="client-stats">
              <span>
                <strong>
                  {state.projects.filter((p) => p.clientId === c.id).length}
                </strong>{" "}
                projects
              </span>
              <span>
                <strong>
                  {money(
                    state.invoices
                      .filter((i) => i.clientId === c.id && i.status === "Paid")
                      .reduce((a, i) => a + i.amount, 0),
                  )}
                </strong>{" "}
                paid
              </span>
            </div>
          </article>
        ))}
      </div>
      {!clients.length && (
        <Empty
          title="No clients found"
          detail="Try another name or add a new relationship."
        />
      )}
    </>
  );
}
function InvoiceTable({ items }: { items: Invoice[] }) {
  const { state, open } = useApp();
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Client / project</th>
            <th>Amount</th>
            <th>Due date</th>
            <th>Status</th>
            <th>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <td>
                <button
                  className="text-button"
                  onClick={() => open({ type: "invoice-detail", id: i.id })}
                >
                  <FileText size={15} />
                  {i.id}
                </button>
              </td>
              <td>
                <strong>
                  {state.clients.find((c) => c.id === i.clientId)?.name}
                </strong>
                <small>
                  {state.projects.find((p) => p.id === i.projectId)?.name}
                </small>
              </td>
              <td className="number">{money(i.amount)}</td>
              <td>{i.due}</td>
              <td>
                <Badge value={isOverdue(i) ? "Overdue" : i.status} />
              </td>
              <td>
                <button
                  className="icon-btn"
                  aria-label={"Open " + i.id}
                  onClick={() => open({ type: "invoice-detail", id: i.id })}
                >
                  <ArrowUpRight size={17} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!items.length && (
        <Empty
          title="No invoices found"
          detail="Create an invoice or change the filter."
        />
      )}
    </div>
  );
}
function Invoices() {
  const { state, open, toast } = useApp();
  const [filter, setFilter] = useState("All");
  const t = totals(state);
  const list = state.invoices.filter(
    (i) =>
      filter === "All" ||
      (filter === "Overdue" && isOverdue(i)) ||
      (filter !== "Overdue" && i.status === filter),
  );
  function csv() {
    const cell = (v: string | number) =>
      '"' +
      String(v)
        .replace(/^[=+@-]/, "'")
        .replaceAll('"', '""') +
      '"';
    download(
      "atlas-invoices.csv",
      [
        ["Invoice", "Client", "Amount USD", "Status", "Issued", "Due"],
        ...list.map((i) => [
          i.id,
          state.clients.find((c) => c.id === i.clientId)?.name || "",
          i.amount,
          i.status,
          i.issued,
          i.due,
        ]),
      ]
        .map((r) => r.map(cell).join(","))
        .join("\r\n"),
      "text/csv",
    );
    toast("Invoice CSV exported");
  }
  return (
    <>
      <Head
        title="Invoices"
        sub="Keep your cash flow clear. Demo records only—no payments are processed."
        action={
          <>
            <Button secondary onClick={csv}>
              <Download size={16} />
              Export CSV
            </Button>
            <Button onClick={() => open({ type: "invoice" })}>
              <Plus size={16} />
              New invoice
            </Button>
          </>
        }
      />
      <div className="metrics three">
        {[
          ["Collected", money(t.paid)],
          ["Awaiting payment", money(t.outstanding)],
          [
            "Draft value",
            money(
              state.invoices
                .filter((i) => i.status === "Draft")
                .reduce((a, i) => a + i.amount, 0),
            ),
          ],
        ].map(([l, v]) => (
          <div className="metric" key={l}>
            <div>
              {l}
              <Receipt size={16} />
            </div>
            <strong>{v}</strong>
            <small>USD · fictional workspace</small>
          </div>
        ))}
      </div>
      <div className="toolbar">
        <div className="tabs">
          {["All", "Draft", "Sent", "Paid", "Overdue"].map((s) => (
            <button
              className={s === filter ? "selected" : ""}
              key={s}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="muted">{list.length} invoices</span>
      </div>
      <InvoiceTable items={list} />
    </>
  );
}
function Analytics() {
  const { state } = useApp();
  const t = totals(state);
  return (
    <>
      <Head
        title="Studio insights"
        sub="A real-time view of your fictional workspace, calculated from your records."
      />
      <Chart full />
      <div className="analytics-grid">
        <Panel title="Project distribution">
          <div className="distribution">
            {statuses.map((s) => {
              const count = state.projects.filter((p) => p.status === s).length;
              return (
                <div key={s}>
                  <div>
                    <Badge value={s} />
                    <strong>{count}</strong>
                  </div>
                  <progress
                    value={count}
                    max={Math.max(state.projects.length, 1)}
                    aria-label={s + " projects"}
                  />
                </div>
              );
            })}
          </div>
        </Panel>
        <Panel title="Team workload">
          <div className="team-list">
            {people.map((name) => (
              <div key={name}>
                <Avatar name={name} small />
                <span>{name}</span>
                <strong>
                  {
                    state.tasks.filter(
                      (t) => t.assignee === name && t.status !== "Done",
                    ).length
                  }
                </strong>
                <small>open tasks</small>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <div className="analytics-grid">
        <Panel title="Revenue by client">
          <div className="distribution">
            {state.clients.map((c) => {
              const n = state.invoices
                .filter((i) => i.clientId === c.id && i.status === "Paid")
                .reduce((a, i) => a + i.amount, 0);
              return (
                <div key={c.id}>
                  <div>
                    <span>{c.name}</span>
                    <strong>{money(n)}</strong>
                  </div>
                  <progress
                    aria-label={c.name + " paid revenue share"}
                    max={Math.max(t.paid, 1)}
                    value={n}
                  />
                </div>
              );
            })}
          </div>
        </Panel>
        <Panel title="Workspace health">
          <div className="health-number">
            {state.tasks.length
              ? Math.round((t.done / state.tasks.length) * 100)
              : 0}
            <span>%</span>
          </div>
          <p className="muted">Task completion across all projects</p>
          <div className="health-row">
            <span>Total project budgets</span>
            <strong>{money(t.budget)}</strong>
          </div>
          <div className="health-row">
            <span>Overdue sent invoices</span>
            <strong>{state.invoices.filter((i) => isOverdue(i)).length}</strong>
          </div>
          <div className="health-row">
            <span>Client relationships</span>
            <strong>{state.clients.length}</strong>
          </div>
          <p className="footnote">
            Revenue is grouped by invoice issue month, not bank settlement date.
            This demo does not track expenses or profitability.
          </p>
        </Panel>
      </div>
    </>
  );
}
function SettingsPage() {
  const { state, dispatch, toast, open } = useApp();
  const [name, setName] = useState(state.settings.name);
  const [studio, setStudio] = useState(state.settings.studio);
  const [error, setError] = useState("");
  useEffect(() => {
    setName(state.settings.name);
    setStudio(state.settings.studio);
  }, [state.settings.name, state.settings.studio]);
  async function restore(file?: File) {
    if (!file) return;
    try {
      if (file.size > 2000000)
        throw Error("Choose an Atlas JSON backup under 2 MB.");
      const data = validateState(JSON.parse(await file.text()));
      dispatch({ type: "restore", value: data });
      setName(data.settings.name);
      setStudio(data.settings.studio);
      toast("Backup restored");
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not restore backup.");
    }
  }
  return (
    <>
      <Head
        title="Workspace settings"
        sub="Make this space yours. All changes are stored on this device."
      />
      <div className="settings-grid">
        <Panel title="Studio profile">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim() || !studio.trim()) return;
              dispatch({
                type: "settings",
                value: {
                  ...state.settings,
                  name: name.trim(),
                  studio: studio.trim(),
                },
              });
              toast("Studio profile saved");
            }}
          >
            <Field label="Studio name">
              <input
                required
                maxLength={100}
                value={studio}
                onChange={(e) => setStudio(e.target.value)}
              />
            </Field>
            <Field label="Your name">
              <input
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Button type="submit">Save changes</Button>
          </form>
        </Panel>
        <Panel title="Appearance">
          <p className="muted">Choose your preferred workspace theme.</p>
          <div className="theme-choices">
            {(["light", "dark"] as const).map((theme) => (
              <button
                key={theme}
                onClick={() =>
                  dispatch({
                    type: "settings",
                    value: { ...state.settings, theme },
                  })
                }
                className={state.settings.theme === theme ? "chosen" : ""}
              >
                {theme === "light" ? <Sun /> : <Moon />}
                <span>{theme} mode</span>
                {state.settings.theme === theme && <Check size={16} />}
              </button>
            ))}
          </div>
          <p className="footnote">
            Respects reduced-motion preferences. Navigate dialogs with Tab and
            close them with Escape.
          </p>
        </Panel>
        <Panel title="Your demo data">
          <p className="muted">
            Export a backup before resetting or changing devices. Restoring
            replaces this browser’s workspace.
          </p>
          <div className="button-row">
            <Button
              secondary
              onClick={() =>
                download("atlas-backup.json", JSON.stringify(state, null, 2))
              }
            >
              <Download size={16} />
              Export backup
            </Button>
            <label className="button secondary upload-label">
              <Upload size={16} />
              Restore backup
              <input
                aria-label="Restore backup"
                type="file"
                accept="application/json,.json"
                onChange={(e) => {
                  restore(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <button
            className="danger-link"
            onClick={() => open({ type: "reset" })}
          >
            <RotateCcw size={15} />
            Reset to sample workspace
          </button>
        </Panel>
        <Panel title="About this project">
          <span className="badge in-progress">React + TypeScript</span>
          <h3>Atlas Studio OS</h3>
          <p className="muted">
            An independent portfolio project by Ahmed Hesham. Projects, tasks,
            client records, invoices, and reports share a typed state model.
          </p>
          <p className="footnote">
            Front-end demonstration. No authentication, cloud sync, email
            delivery, payment processing, or production accounting. Data is
            fictional and stays in your browser.
          </p>
          <a className="text-button" href="/projects/atlas-studio-os/">
            View project case study <ExternalLink size={14} />
          </a>
          <a
            className="button secondary"
            style={{ marginTop: 18 }}
            href="/assets/demos/atlas-source.zip"
            download
          >
            <Download size={15} />
            Download React source
          </a>
        </Panel>
      </div>
    </>
  );
}
function ProjectForm({ id }: { id?: string }) {
  const { state, dispatch, open, toast } = useApp();
  const existing = state.projects.find((p) => p.id === id);
  const [v, set] = useState<Project>(
    existing || {
      id: uid(),
      name: "",
      clientId: state.clients[0]?.id || "",
      status: "Planned",
      budget: 5000,
      due: "2026-11-15",
      lead: people[0],
      description: "",
      color: colors[state.projects.length % colors.length],
    },
  );
  const [error, setError] = useState("");
  const patch = (p: Partial<Project>) => set({ ...v, ...p });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        try {
          dispatch({ type: "project", value: { ...v, name: v.name.trim() } });
          open(null);
          toast(existing ? "Project updated" : "Project created");
        } catch (e) {
          setError(String(e));
        }
      }}
    >
      <Field label="Project name">
        <input
          autoFocus
          required
          maxLength={150}
          value={v.name}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="e.g. A new brand experience"
        />
      </Field>
      <div className="form-grid">
        <Field label="Client">
          <select
            disabled={
              !!existing &&
              state.invoices.some((i) => i.projectId === existing.id)
            }
            title="Client is locked once a project has invoices"
            value={v.clientId}
            onChange={(e) => patch({ clientId: e.target.value })}
          >
            {state.clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Project status">
          <select
            value={v.status}
            onChange={(e) =>
              patch({ status: e.target.value as Project["status"] })
            }
          >
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Budget (USD)">
          <input
            type="number"
            min="0"
            max="1000000000"
            step=".01"
            required
            value={v.budget}
            onChange={(e) => patch({ budget: +e.target.value })}
          />
        </Field>
        <Field label="Due date">
          <input
            type="date"
            required
            value={v.due}
            onChange={(e) => patch({ due: e.target.value })}
          />
        </Field>
        <Field label="Project lead">
          <select
            value={v.lead}
            onChange={(e) => patch({ lead: e.target.value })}
          >
            {people.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </Field>
        <Field label="Project color">
          <input
            type="color"
            value={v.color}
            onChange={(e) => patch({ color: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Project brief">
        <textarea
          maxLength={4000}
          value={v.description}
          onChange={(e) => patch({ description: e.target.value })}
          placeholder="Goals, deliverables, and what success looks like…"
        />
      </Field>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="form-footer">
        <Button secondary type="button" onClick={() => open(null)}>
          Cancel
        </Button>
        <Button type="submit">
          {existing ? "Save project" : "Create project"}
        </Button>
      </div>
    </form>
  );
}
function TaskForm({ id, projectId }: { id?: string; projectId?: string }) {
  const { state, dispatch, open, toast } = useApp();
  const existing = state.tasks.find((t) => t.id === id);
  const [v, set] = useState<Task>(
    existing || {
      id: uid(),
      title: "",
      projectId: projectId || state.projects[0]?.id || "",
      status: "Backlog",
      priority: "Medium",
      due: "2026-10-15",
      assignee: people[0],
      description: "",
    },
  );
  const patch = (p: Partial<Task>) => set({ ...v, ...p });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!v.title.trim()) return;
        dispatch({ type: "task", value: { ...v, title: v.title.trim() } });
        open(null);
        toast(existing ? "Task updated" : "Task created");
      }}
    >
      <Field label="Task title">
        <input
          autoFocus
          required
          maxLength={150}
          value={v.title}
          onChange={(e) => patch({ title: e.target.value })}
        />
      </Field>
      <Field label="Project">
        <select
          value={v.projectId}
          onChange={(e) => patch({ projectId: e.target.value })}
        >
          {state.projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>
      <div className="form-grid">
        <Field label="Status">
          <select
            value={v.status}
            onChange={(e) => patch({ status: e.target.value as TaskStatus })}
          >
            {taskStatuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Priority">
          <select
            value={v.priority}
            onChange={(e) =>
              patch({ priority: e.target.value as Task["priority"] })
            }
          >
            {["Low", "Medium", "High"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Assignee">
          <select
            value={v.assignee}
            onChange={(e) => patch({ assignee: e.target.value })}
          >
            {people.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </Field>
        <Field label="Task due date">
          <input
            type="date"
            required
            value={v.due}
            onChange={(e) => patch({ due: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Task details">
        <textarea
          maxLength={4000}
          value={v.description}
          onChange={(e) => patch({ description: e.target.value })}
        />
      </Field>
      <div className="form-footer">
        {existing && (
          <button
            type="button"
            className="danger-link"
            onClick={() => open({ type: "delete-task", id })}
          >
            <Trash2 size={15} />
            Delete
          </button>
        )}
        <Button secondary type="button" onClick={() => open(null)}>
          Cancel
        </Button>
        <Button type="submit">{existing ? "Save task" : "Create task"}</Button>
      </div>
    </form>
  );
}
function ClientForm({ id }: { id?: string }) {
  const { state, dispatch, open, toast } = useApp();
  const existing = state.clients.find((c) => c.id === id);
  const [v, set] = useState<Client>(
    existing || {
      id: uid(),
      name: "",
      contact: "",
      email: "",
      industry: "Technology",
      color: colors[state.clients.length % colors.length],
      notes: "",
    },
  );
  const patch = (p: Partial<Client>) => set({ ...v, ...p });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!v.name.trim()) return;
        dispatch({ type: "client", value: { ...v, name: v.name.trim() } });
        open(null);
        toast("Client saved");
      }}
    >
      <Field label="Company name">
        <input
          autoFocus
          required
          maxLength={100}
          value={v.name}
          onChange={(e) => patch({ name: e.target.value })}
        />
      </Field>
      <div className="form-grid">
        <Field label="Contact person">
          <input
            required
            maxLength={100}
            value={v.contact}
            onChange={(e) => patch({ contact: e.target.value })}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            required
            maxLength={200}
            value={v.email}
            onChange={(e) => patch({ email: e.target.value })}
          />
        </Field>
        <Field label="Industry">
          <input
            required
            maxLength={100}
            value={v.industry}
            onChange={(e) => patch({ industry: e.target.value })}
          />
        </Field>
        <Field label="Brand color">
          <input
            type="color"
            value={v.color}
            onChange={(e) => patch({ color: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Relationship notes">
        <textarea
          maxLength={4000}
          value={v.notes}
          onChange={(e) => patch({ notes: e.target.value })}
        />
      </Field>
      <p className="footnote">
        Use sample details. This public demo stores records locally and does not
        contact anyone.
      </p>
      <div className="form-footer">
        <Button secondary type="button" onClick={() => open(null)}>
          Cancel
        </Button>
        <Button type="submit">Save client</Button>
      </div>
    </form>
  );
}
function InvoiceForm({ id }: { id?: string }) {
  const { state, dispatch, open, toast } = useApp();
  const existing = state.invoices.find((i) => i.id === id);
  const next =
    Math.max(
      1040,
      ...state.invoices.map((i) => Number(i.id.replace("INV-", "")) || 0),
    ) + 1;
  const [v, set] = useState<Invoice>(
    existing || {
      id: "INV-" + next,
      clientId: state.projects[0]?.clientId || "",
      projectId: state.projects[0]?.id || "",
      description: "Design services",
      amount: 1000,
      status: "Draft",
      issued: today(),
      due: "2026-12-15",
    },
  );
  const patch = (p: Partial<Invoice>) => set({ ...v, ...p });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        dispatch({ type: "invoice", value: v });
        open(null);
        toast("Demo invoice saved");
      }}
    >
      <p className="footnote">
        {v.id} · USD · No taxes or payments are processed in this demo.
      </p>
      <Field label="Invoice project">
        <select
          value={v.projectId}
          onChange={(e) =>
            patch({
              projectId: e.target.value,
              clientId: state.projects.find((p) => p.id === e.target.value)!
                .clientId,
            })
          }
        >
          {state.projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {state.clients.find((c) => c.id === p.clientId)?.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Description">
        <input
          required
          maxLength={200}
          value={v.description}
          onChange={(e) => patch({ description: e.target.value })}
        />
      </Field>
      <div className="form-grid">
        <Field label="Amount (USD)">
          <input
            required
            type="number"
            min=".01"
            max="1000000000"
            step=".01"
            value={v.amount}
            onChange={(e) => patch({ amount: +e.target.value })}
          />
        </Field>
        <Field label="Invoice status">
          <select
            value={v.status}
            onChange={(e) =>
              patch({ status: e.target.value as Invoice["status"] })
            }
          >
            {["Draft", "Sent", "Paid"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Issue date">
          <input
            required
            type="date"
            value={v.issued}
            onChange={(e) => patch({ issued: e.target.value })}
          />
        </Field>
        <Field label="Payment due">
          <input
            required
            type="date"
            min={v.issued}
            value={v.due}
            onChange={(e) => patch({ due: e.target.value })}
          />
        </Field>
      </div>
      <div className="form-footer">
        <Button secondary type="button" onClick={() => open(null)}>
          Cancel
        </Button>
        <Button type="submit">Save invoice</Button>
      </div>
    </form>
  );
}
function ProjectDetail({ id }: { id: string }) {
  const { state, open } = useApp();
  const p = state.projects.find((p) => p.id === id)!;
  const tasks = state.tasks.filter((t) => t.projectId === id);
  return (
    <>
      <div className="detail-summary">
        <Badge value={p.status} />
        <span>{state.clients.find((c) => c.id === p.clientId)?.name}</span>
        <Button secondary onClick={() => open({ type: "project", id })}>
          Edit project
        </Button>
      </div>
      <p className="detail-description">
        {p.description || "No brief added yet."}
      </p>
      <div className="detail-metrics">
        <div>
          <small>Budget</small>
          <strong>{money(p.budget)}</strong>
        </div>
        <div>
          <small>Due date</small>
          <strong>{p.due}</strong>
        </div>
        <div>
          <small>Project lead</small>
          <strong>{p.lead}</strong>
        </div>
        <div>
          <small>Task completion</small>
          <strong>{progress(state, id)}%</strong>
        </div>
      </div>
      <div className="section-title">
        <h3>Project tasks</h3>
        <button
          className="text-button"
          onClick={() => open({ type: "task", projectId: id })}
        >
          <Plus size={15} />
          Add task
        </button>
      </div>
      {tasks.map((t) => (
        <button
          className="detail-task"
          key={t.id}
          onClick={() => open({ type: "task", id: t.id })}
        >
          <CheckSquare size={17} />
          <strong>{t.title}</strong>
          <Badge value={t.status} />
          <ChevronRight size={15} />
        </button>
      ))}
      {!tasks.length && (
        <Empty
          title="A fresh start"
          detail="Add a task to start tracking project progress."
        />
      )}
      <h3 style={{ marginTop: 25 }}>Related invoices</h3>
      <InvoiceTable items={state.invoices.filter((i) => i.projectId === id)} />
    </>
  );
}
function ClientDetail({ id }: { id: string }) {
  const { state, open } = useApp();
  const c = state.clients.find((c) => c.id === id)!;
  return (
    <>
      <div className="detail-summary">
        <Avatar name={c.name} color={c.color} />
        <span>{c.industry}</span>
        <Button secondary onClick={() => open({ type: "client", id })}>
          Edit client
        </Button>
      </div>
      <div className="detail-metrics">
        <div>
          <small>Contact</small>
          <strong>{c.contact}</strong>
        </div>
        <div>
          <small>Email</small>
          <strong>{c.email}</strong>
        </div>
      </div>
      <p className="detail-description">{c.notes}</p>
      <h3>Projects</h3>
      {state.projects
        .filter((p) => p.clientId === id)
        .map((p) => (
          <button
            className="detail-task"
            key={p.id}
            onClick={() => open({ type: "project-detail", id: p.id })}
          >
            <FolderKanban size={17} />
            <strong>{p.name}</strong>
            <Badge value={p.status} />
            <ArrowUpRight size={15} />
          </button>
        ))}
      {!state.projects.some((p) => p.clientId === id) && (
        <p className="muted">No projects for this client yet.</p>
      )}
      <h3 style={{ marginTop: 24 }}>Invoice history</h3>
      <InvoiceTable items={state.invoices.filter((i) => i.clientId === id)} />
    </>
  );
}
function InvoiceDetail({ id }: { id: string }) {
  const { state, dispatch, open, toast } = useApp();
  const i = state.invoices.find((i) => i.id === id)!;
  const client = state.clients.find((c) => c.id === i.clientId)!;
  return (
    <>
      <div className="invoice-sheet">
        <div className="invoice-brand">
          <span className="logo-symbol">a</span>
          <strong>{state.settings.studio}</strong>
          <Badge value={isOverdue(i) ? "Overdue" : i.status} />
        </div>
        <p className="eyebrow">Demonstration invoice</p>
        <h2>{i.id}</h2>
        <div className="invoice-address">
          <div>
            <small>Bill to</small>
            <h3>{client.name}</h3>
            <p>
              {client.contact}
              <br />
              {client.email}
            </p>
          </div>
          <div>
            <small>Issued</small>
            <p>{i.issued}</p>
            <small>Due</small>
            <p>{i.due}</p>
          </div>
        </div>
        <div className="invoice-line">
          <div>
            <strong>{i.description}</strong>
            <small>
              {state.projects.find((p) => p.id === i.projectId)?.name}
            </small>
          </div>
          <strong>{money(i.amount)}</strong>
        </div>
        <div className="invoice-total">
          Total (USD)<strong>{money(i.amount)}</strong>
        </div>
        <p className="footnote">
          Fictional sample record. Not a tax invoice or payment request.
        </p>
      </div>
      <div className="form-footer no-print">
        <Button secondary onClick={() => window.print()}>
          <Printer size={16} />
          Print / PDF
        </Button>
        <Button secondary onClick={() => open({ type: "invoice", id })}>
          Edit
        </Button>
        {i.status !== "Paid" && (
          <Button
            onClick={() => {
              dispatch({ type: "invoice", value: { ...i, status: "Paid" } });
              toast("Demo invoice marked paid");
            }}
          >
            <Check size={16} />
            Mark paid
          </Button>
        )}
      </div>
    </>
  );
}
function SearchDialog() {
  const { state, go, open } = useApp();
  const [q, setQ] = useState("");
  const term = q.toLowerCase().trim();
  const results = [
    ...Object.keys(icons)
      .filter((p) => p.toLowerCase().includes(term))
      .map((p) => ({
        label: p,
        kind: "Navigate",
        action: () => {
          go(p as Page);
          open(null);
        },
      })),
    ...state.projects
      .filter((p) => p.name.toLowerCase().includes(term))
      .map((p) => ({
        label: p.name,
        kind: "Project",
        action: () => open({ type: "project-detail", id: p.id }),
      })),
    ...state.tasks
      .filter((t) => t.title.toLowerCase().includes(term))
      .map((t) => ({
        label: t.title,
        kind: "Task",
        action: () => open({ type: "task", id: t.id }),
      })),
    ...state.clients
      .filter((c) => c.name.toLowerCase().includes(term))
      .map((c) => ({
        label: c.name,
        kind: "Client",
        action: () => open({ type: "client-detail", id: c.id }),
      })),
  ].slice(0, 15);
  return (
    <>
      <div className="search-field command-input">
        <Search size={18} />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search projects, tasks, clients, or pages…"
          aria-label="Search workspace"
        />
      </div>
      <div className="command-results">
        {results.map((r, i) => (
          <button key={i} onClick={r.action}>
            <span>
              {r.label}
              <small>{r.kind}</small>
            </span>
            <ArrowUpRight size={16} />
          </button>
        ))}
        {!results.length && (
          <Empty title="No matching results" detail="Try a shorter search." />
        )}
      </div>
    </>
  );
}
function ModalContent({ modal: m }: { modal: Modal }) {
  const { state, open, dispatch, toast } = useApp();
  const title =
    m.type === "project-detail"
      ? state.projects.find((p) => p.id === m.id)?.name
      : m.type === "client-detail"
        ? state.clients.find((c) => c.id === m.id)?.name
        : m.type === "invoice-detail"
          ? m.id
          : m.type === "search"
            ? "Search workspace"
            : m.type === "reset"
              ? "Reset your demo workspace?"
              : m.type === "delete-task"
                ? "Delete this task?"
                : (m.id ? "Edit " : "New ") + m.type;
  return (
    <Dialog
      title={title || "Details"}
      onClose={() => open(null)}
      wide={m.type.endsWith("detail")}
    >
      <React.Fragment key={m.type + (m.id || "")}>
        {m.type === "project" ? (
          <ProjectForm id={m.id} />
        ) : m.type === "task" ? (
          <TaskForm id={m.id} projectId={m.projectId} />
        ) : m.type === "client" ? (
          <ClientForm id={m.id} />
        ) : m.type === "invoice" ? (
          <InvoiceForm id={m.id} />
        ) : m.type === "project-detail" ? (
          <ProjectDetail id={m.id!} />
        ) : m.type === "client-detail" ? (
          <ClientDetail id={m.id!} />
        ) : m.type === "invoice-detail" ? (
          <InvoiceDetail id={m.id!} />
        ) : m.type === "search" ? (
          <SearchDialog />
        ) : (
          <>
            <p className="muted">
              {m.type === "reset"
                ? "This replaces your local changes with the original fictional data. Export a backup in Settings first if you want to keep your work."
                : "This removes the task from your local workspace. Project progress will be recalculated."}
            </p>
            <div className="form-footer">
              <Button secondary onClick={() => open(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  dispatch(
                    m.type === "reset"
                      ? { type: "reset" }
                      : { type: "delete-task", id: m.id! },
                  );
                  open(null);
                  toast(m.type === "reset" ? "Demo reset" : "Task deleted");
                }}
              >
                {m.type === "reset" ? "Reset demo" : "Delete task"}
              </Button>
            </div>
          </>
        )}
      </React.Fragment>
    </Dialog>
  );
}
function App() {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const parsePage = () => {
    let p = "";
    try {
      p = decodeURIComponent(location.hash.slice(1));
    } catch {}
    return Object.hasOwn(icons, p) ? (p as Page) : "Overview";
  };
  const [page, setPage] = useState<Page>(parsePage);
  const [modal, open] = useState<Modal | null>(null);
  const [toastText, toast] = useState("");
  const [menu, setMenu] = useState(false);
  const [storageError, setStorageError] = useState(initialWarning);
  const [savedAt, setSavedAt] = useState("Saved locally");
  function go(p: Page) {
    setPage(p);
    location.hash = p;
    setMenu(false);
    window.scrollTo(0, 0);
  }
  useEffect(() => {
    document.documentElement.dataset.theme = state.settings.theme;
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      setSavedAt("Saved locally");
    } catch {
      setStorageError(
        "Browser storage is unavailable or full. Changes work for this visit only. Export a backup from Settings.",
      );
      setSavedAt("Not saved");
    }
  }, [state]);
  useEffect(() => {
    if (!toastText) return;
    const timer = setTimeout(() => toast(""), 3500);
    return () => clearTimeout(timer);
  }, [toastText]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        open({ type: "search" });
      }
    };
    const hash = () => setPage(parsePage());
    window.addEventListener("keydown", handler);
    window.addEventListener("hashchange", hash);
    return () => {
      window.removeEventListener("keydown", handler);
      window.removeEventListener("hashchange", hash);
    };
  }, []);
  const pages = {
    Overview: <Overview />,
    Projects: <Projects />,
    Tasks: <Tasks />,
    Clients: <Clients />,
    Invoices: <Invoices />,
    Analytics: <Analytics />,
    Settings: <SettingsPage />,
  };
  return (
    <Context.Provider value={{ state, dispatch, go, open, toast }}>
      <div className="demo-banner">
        <span>
          <i className="dot" />
          Portfolio concept · React + TypeScript · Local demo data
        </span>
        <a href="/#projects">
          Ahmed Hesham’s portfolio <ArrowUpRight size={12} />
        </a>
      </div>
      <div className="app-shell">
        {menu && (
          <button
            className="sidebar-overlay"
            aria-label="Close navigation"
            onClick={() => setMenu(false)}
          />
        )}
        <aside className={"sidebar " + (menu ? "is-open" : "")}>
          <a className="logo" href="#Overview" onClick={() => go("Overview")}>
            <span className="logo-symbol">a</span>atlas
            <span className="os">studio os</span>
          </a>
          <div className="studio-switch">
            <span className="studio-avatar">
              {state.settings.studio.charAt(0)}
            </span>
            <div>
              <strong>{state.settings.studio}</strong>
              <small>Creative workspace</small>
            </div>
            <ChevronDown size={14} />
          </div>
          <span className="nav-label">WORKSPACE</span>
          <nav aria-label="Main navigation">
            {(Object.keys(icons) as Page[])
              .filter((p) => p !== "Settings")
              .map((p) => {
                const Icon = icons[p];
                return (
                  <button
                    key={p}
                    aria-label={p}
                    className={page === p ? "active" : ""}
                    aria-current={page === p ? "page" : undefined}
                    onClick={() => go(p)}
                  >
                    <Icon size={18} />
                    {p}
                    {p === "Projects" && (
                      <span className="nav-count">
                        {
                          state.projects.filter((p) => p.status !== "Completed")
                            .length
                        }
                      </span>
                    )}
                  </button>
                );
              })}
          </nav>
          <div className="sidebar-bottom">
            <div className="sidebar-help">
              <span>✦</span>
              <strong>Room for your next big idea.</strong>
              <p>One workspace. A little more headspace.</p>
              <button
                onClick={() => {
                  go("Projects");
                  open({ type: "project" });
                }}
              >
                Create something <ArrowRight size={13} />
              </button>
            </div>
            <button
              className={
                "settings-link " + (page === "Settings" ? "active" : "")
              }
              onClick={() => go("Settings")}
            >
              <Settings size={18} />
              Settings
            </button>
            <div className="sidebar-profile">
              <Avatar name={state.settings.name} />
              <div>
                <strong>{state.settings.name}</strong>
                <small>Workspace owner · demo</small>
              </div>
            </div>
          </div>
        </aside>
        <div className="main-shell">
          <header className="topbar">
            <div className="breadcrumb">
              <button
                className="icon-btn mobile-menu"
                aria-label="Open navigation"
                onClick={() => setMenu(true)}
              >
                <Menu size={20} />
              </button>
              <span>Workspace</span>
              <ChevronRight size={13} />
              <strong>{page}</strong>
            </div>
            <div className="topbar-actions">
              <button
                className="global-search"
                onClick={() => open({ type: "search" })}
              >
                <Search size={16} />
                <span>Search anything…</span>
                <kbd>⌘ K</kbd>
              </button>
              <button
                className="icon-btn"
                aria-label="Toggle theme"
                onClick={() =>
                  dispatch({
                    type: "settings",
                    value: {
                      ...state.settings,
                      theme:
                        state.settings.theme === "light" ? "dark" : "light",
                    },
                  })
                }
              >
                {state.settings.theme === "light" ? (
                  <Moon size={18} />
                ) : (
                  <Sun size={18} />
                )}
              </button>
              <Avatar name={state.settings.name} small />
            </div>
          </header>
          <main id="main" className="content">
            {storageError && (
              <div className="storage-warning" role="alert">
                {storageError}
              </div>
            )}
            {pages[page]}
            <footer className="app-footer">
              <span>
                <i className="dot green" />
                {savedAt}
              </span>
              <span>Crafted with care · Atlas Studio OS</span>
            </footer>
          </main>
        </div>
      </div>
      {modal && <ModalContent modal={modal} />}
      <div className={"toast " + (toastText ? "visible" : "")} role="status">
        {toastText && (
          <>
            <CheckCircle2 size={17} />
            {toastText}
          </>
        )}
      </div>
    </Context.Provider>
  );
}
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="empty">
        <h1>Let’s get your workspace back.</h1>
        <p>
          The app encountered an unexpected error. Your saved data has not been
          deleted.
        </p>
        <Button onClick={() => location.reload()}>Reload workspace</Button>
      </div>
    ) : (
      this.props.children
    );
  }
}
createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);

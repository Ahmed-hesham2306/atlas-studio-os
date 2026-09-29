export type Status = "Planned" | "In progress" | "In review" | "Completed";
export type TaskStatus = "Backlog" | "In progress" | "Review" | "Done";
export type Client = {
  id: string;
  name: string;
  contact: string;
  email: string;
  industry: string;
  color: string;
  notes: string;
};
export type Project = {
  id: string;
  name: string;
  clientId: string;
  description: string;
  status: Status;
  budget: number;
  due: string;
  color: string;
  lead: string;
};
export type Task = {
  id: string;
  title: string;
  projectId: string;
  status: TaskStatus;
  priority: "Low" | "Medium" | "High";
  due: string;
  assignee: string;
  description: string;
};
export type Invoice = {
  id: string;
  clientId: string;
  projectId: string;
  description: string;
  amount: number;
  status: "Draft" | "Sent" | "Paid";
  issued: string;
  due: string;
};
export type Activity = { id: string; text: string; at: string };
export type State = {
  version: 1;
  clients: Client[];
  projects: Project[];
  tasks: Task[];
  invoices: Invoice[];
  activity: Activity[];
  settings: { studio: string; name: string; theme: "light" | "dark" };
};
export const statuses: Status[] = [
  "Planned",
  "In progress",
  "In review",
  "Completed",
];
export const taskStatuses: TaskStatus[] = [
  "Backlog",
  "In progress",
  "Review",
  "Done",
];
export const people = ["Alex Morgan", "Maya Chen", "Omar Ali", "Nora James"];
export const colors = [
  "#7d6bce",
  "#3a9b87",
  "#d98d56",
  "#648ed6",
  "#cf7091",
  "#929858",
];
export const uid = () => crypto.randomUUID();
export const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
export function progress(state: State, id: string) {
  const tasks = state.tasks.filter((t) => t.projectId === id);
  return tasks.length
    ? Math.round(
        (tasks.filter((t) => t.status === "Done").length / tasks.length) * 100,
      )
    : 0;
}
export const today = () => new Date().toLocaleDateString("en-CA");
export const validDate = (v: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  !Number.isNaN(Date.parse(v)) &&
  new Date(v).toISOString().slice(0, 10) === v;
export const isOverdue = (invoice: Invoice, date = today()) =>
  invoice.status === "Sent" && invoice.due < date;
export function totals(s: State) {
  return {
    paid: s.invoices
      .filter((i) => i.status === "Paid")
      .reduce((a, i) => a + i.amount, 0),
    outstanding: s.invoices
      .filter((i) => i.status === "Sent")
      .reduce((a, i) => a + i.amount, 0),
    budget: s.projects.reduce((a, p) => a + p.budget, 0),
    active: s.projects.filter((p) => p.status !== "Completed").length,
    done: s.tasks.filter((t) => t.status === "Done").length,
  };
}
export function revenue(s: State) {
  const grouped = new Map<string, number>();
  for (const i of s.invoices.filter((i) => i.status === "Paid")) {
    const month = i.issued.slice(0, 7);
    grouped.set(month, (grouped.get(month) || 0) + i.amount);
  }
  return [...grouped]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, value]) => ({
      month,
      value,
      label: new Date(month + "-02").toLocaleDateString("en-US", {
        month: "short",
      }),
    }));
}
export function seed(): State {
  const clients: Client[] = [
    ["c1", "Linear Labs", "Sam Rivera", "sam@example.com", "Technology"],
    ["c2", "Bloom & Co.", "Avery Stone", "avery@example.com", "Retail"],
    ["c3", "Northstar", "Jordan Lee", "jordan@example.com", "Finance"],
    ["c4", "Arch Studio", "Taylor Reed", "taylor@example.com", "Architecture"],
    [
      "c5",
      "Olive Market",
      "Jamie Park",
      "jamie@example.com",
      "Food & beverage",
    ],
    ["c6", "Everwell", "Casey Blake", "casey@example.com", "Wellness"],
  ].map(([id, name, contact, email, industry], i) => ({
    id,
    name,
    contact,
    email,
    industry,
    color: colors[i],
    notes:
      "Fictional client for the Atlas portfolio demo. Discovery and project updates are tracked in this workspace.",
  }));
  const projects: Project[] = [
    [
      "p1",
      "Brand identity refresh",
      "c1",
      "In progress",
      12500,
      "2026-10-16",
      "Alex Morgan",
      "A complete identity system, from strategy and logo exploration to a flexible brand toolkit.",
    ],
    [
      "p2",
      "E-commerce experience",
      "c2",
      "In review",
      18400,
      "2026-10-08",
      "Maya Chen",
      "A considered shopping experience with product discovery, collection pages, and a streamlined checkout concept.",
    ],
    [
      "p3",
      "Investor platform",
      "c3",
      "In progress",
      24000,
      "2026-11-02",
      "Omar Ali",
      "A financial product interface that makes complex information readable and useful.",
    ],
    [
      "p4",
      "Studio website",
      "c4",
      "Planned",
      8600,
      "2026-11-12",
      "Nora James",
      "An editorial portfolio with project storytelling and an accessible enquiry experience.",
    ],
    [
      "p5",
      "Seasonal campaign",
      "c5",
      "Completed",
      6200,
      "2026-09-18",
      "Alex Morgan",
      "A seasonal campaign system with art direction and adaptable promotional layouts.",
    ],
    [
      "p6",
      "Member onboarding",
      "c6",
      "In progress",
      9800,
      "2026-10-23",
      "Maya Chen",
      "A welcoming, focused onboarding journey for a fictional wellness membership.",
    ],
  ].map((r, i) => ({
    id: r[0] as string,
    name: r[1] as string,
    clientId: r[2] as string,
    status: r[3] as Status,
    budget: r[4] as number,
    due: r[5] as string,
    lead: r[6] as string,
    description: r[7] as string,
    color: colors[i],
  }));
  const titles = [
    "Define creative direction",
    "Build the component library",
    "Review final deliverables",
  ];
  const tasks: Task[] = projects.flatMap((p, i) =>
    titles.map((title, j) => ({
      id: `t${i * 3 + j}`,
      title:
        i === 0
          ? [
              "Explore visual directions",
              "Develop logo system",
              "Prepare brand guidelines",
            ][j]
          : title,
      projectId: p.id,
      status:
        p.status === "Completed"
          ? "Done"
          : (["Done", "In progress", "Review"] as TaskStatus[])[j],
      priority: (["Medium", "High", "Low"] as const)[j],
      due: p.due,
      assignee: people[(i + j) % 4],
      description:
        "Review the project brief, prepare the deliverable, and document decisions for the team. This is a fictional task.",
    })),
  );
  const invoices: Invoice[] = Array.from({ length: 9 }, (_, i) => ({
    id: `INV-${1041 + i}`,
    clientId: clients[i % 6].id,
    projectId: projects[i % 6].id,
    description: ["Discovery & strategy", "Design milestone", "Final delivery"][
      i % 3
    ],
    amount: [4200, 6800, 3500, 9200, 5400, 7600, 6250, 9200, 4300][i],
    status: i < 6 ? "Paid" : i === 8 ? "Draft" : "Sent",
    issued: `2026-${String(4 + Math.min(i, 5)).padStart(2, "0")}-12`,
    due:
      i < 6
        ? `2026-${String(4 + i).padStart(2, "0")}-28`
        : i === 6
          ? "2026-09-20"
          : "2026-10-12",
  }));
  return {
    version: 1,
    clients,
    projects,
    tasks,
    invoices,
    activity: [
      {
        id: "a1",
        text: "Bloom & Co. moved to design review",
        at: "2026-09-29T09:30:00Z",
      },
      {
        id: "a2",
        text: "Olive Market campaign marked complete",
        at: "2026-09-28T15:20:00Z",
      },
      {
        id: "a3",
        text: "Everwell joined the studio workspace",
        at: "2026-09-28T10:00:00Z",
      },
    ],
    settings: { studio: "Forma Studio", name: "Alex Morgan", theme: "light" },
  };
}
export type Action =
  | { type: "project"; value: Project }
  | { type: "task"; value: Task }
  | { type: "client"; value: Client }
  | { type: "invoice"; value: Invoice }
  | { type: "delete-task"; id: string }
  | { type: "settings"; value: State["settings"] }
  | { type: "restore"; value: State }
  | { type: "reset" };
export function reducer(state: State, action: Action): State {
  if (action.type === "reset") return seed();
  if (action.type === "restore") return validateState(action.value);
  if (action.type === "settings") return { ...state, settings: action.value };
  if (action.type === "delete-task")
    return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };
  const key = (
    {
      project: "projects",
      task: "tasks",
      client: "clients",
      invoice: "invoices",
    } as const
  )[action.type];
  const arr = state[key] as Array<{ id: string }>;
  const exists = arr.some((x) => x.id === action.value.id);
  const next = {
    ...state,
    [key]: exists
      ? arr.map((x) => (x.id === action.value.id ? action.value : x))
      : [...arr, action.value],
  };
  validateState(next);
  const label =
    "name" in action.value
      ? action.value.name
      : "title" in action.value
        ? action.value.title
        : action.value.id;
  return {
    ...next,
    activity: [
      {
        id: uid(),
        text: `${exists ? "Updated" : "Created"} ${label}`,
        at: new Date().toISOString(),
      },
      ...state.activity,
    ].slice(0, 40),
  };
}
export function validateState(input: unknown): State {
  const s = input as State;
  const fail = () => {
    throw Error("This file is not a valid Atlas backup. No data was changed.");
  };
  const text = (v: unknown, max = 4000) =>
    typeof v === "string" && v.length <= max;
  if (
    !s ||
    s.version !== 1 ||
    !s.settings ||
    !text(s.settings.name, 100) ||
    !text(s.settings.studio, 100) ||
    !["light", "dark"].includes(s.settings.theme)
  )
    fail();
  for (const key of [
    "clients",
    "projects",
    "tasks",
    "invoices",
    "activity",
  ] as const) {
    if (!Array.isArray(s[key]) || s[key].length > 1000) fail();
    const ids = new Set();
    for (const x of s[key]) {
      if (!x || !text(x.id, 100) || ids.has(x.id)) fail();
      ids.add(x.id);
    }
  }
  for (const c of s.clients)
    if (
      !text(c.name, 100) ||
      !c.name.trim() ||
      !text(c.contact, 100) ||
      !text(c.email, 200) ||
      !text(c.industry, 100) ||
      !text(c.notes) ||
      !/^#[0-9a-f]{6}$/i.test(c.color)
    )
      fail();
  for (const p of s.projects)
    if (
      !text(p.name, 150) ||
      !p.name.trim() ||
      !text(p.description) ||
      !text(p.lead, 100) ||
      !s.clients.some((c) => c.id === p.clientId) ||
      !statuses.includes(p.status) ||
      !Number.isFinite(p.budget) ||
      p.budget < 0 ||
      p.budget > 1e9 ||
      !validDate(p.due) ||
      !/^#[0-9a-f]{6}$/i.test(p.color)
    )
      fail();
  for (const t of s.tasks)
    if (
      !text(t.title, 150) ||
      !t.title.trim() ||
      !text(t.description) ||
      !text(t.assignee, 100) ||
      !s.projects.some((p) => p.id === t.projectId) ||
      !taskStatuses.includes(t.status) ||
      !["Low", "Medium", "High"].includes(t.priority) ||
      !validDate(t.due)
    )
      fail();
  for (const i of s.invoices)
    if (
      !s.clients.some((c) => c.id === i.clientId) ||
      !s.projects.some(
        (p) => p.id === i.projectId && p.clientId === i.clientId,
      ) ||
      !text(i.description, 200) ||
      !Number.isFinite(i.amount) ||
      i.amount <= 0 ||
      i.amount > 1e9 ||
      !["Draft", "Sent", "Paid"].includes(i.status) ||
      !validDate(i.issued) ||
      !validDate(i.due) ||
      i.due < i.issued
    )
      fail();
  for (const a of s.activity)
    if (!text(a.text, 300) || !text(a.at, 50) || Number.isNaN(Date.parse(a.at)))
      fail();
  return s;
}

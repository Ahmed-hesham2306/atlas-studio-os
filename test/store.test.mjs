import test from "node:test";
import assert from "node:assert/strict";
import {
  seed,
  validateState,
  reducer,
  totals,
  progress,
  isOverdue,
  revenue,
} from "../src/store.ts";

test("sample workspace is internally valid and totals match invoice records", () => {
  const s = validateState(seed());
  assert.equal(s.projects.length, 6);
  assert.equal(s.tasks.length, 18);
  assert.equal(totals(s).paid, 36700);
  assert.equal(totals(s).outstanding, 15450);
  assert.equal(
    revenue(s).reduce((sum, m) => sum + m.value, 0),
    36700,
  );
});
test("task transitions recalculate project progress without mutating prior state", () => {
  const s = seed();
  const t = s.tasks.find((t) => t.projectId === "p1" && t.status !== "Done");
  const next = reducer(s, { type: "task", value: { ...t, status: "Done" } });
  assert.equal(progress(s, "p1"), 33);
  assert.equal(progress(next, "p1"), 67);
  const deleted = reducer(next, { type: "delete-task", id: t.id });
  assert.equal(progress(deleted, "p1"), 50);
});
test("marking invoice paid updates balances and only sent invoices become overdue", () => {
  const s = seed();
  const invoice = s.invoices.find((i) => i.status === "Sent");
  assert.equal(isOverdue(invoice, "2026-09-29"), true);
  const next = reducer(s, {
    type: "invoice",
    value: { ...invoice, status: "Paid" },
  });
  assert.equal(totals(next).paid, totals(s).paid + invoice.amount);
  assert.equal(
    totals(next).outstanding,
    totals(s).outstanding - invoice.amount,
  );
  assert.equal(isOverdue({ ...invoice, status: "Draft" }, "2026-12-01"), false);
  assert.equal(isOverdue({ ...invoice, status: "Paid" }, "2026-12-01"), false);
});
test("backup validation rejects malformed data, broken relationships, duplicate ids and invalid money", () => {
  for (const mutate of [
    (s) => (s.tasks[0].projectId = "missing"),
    (s) => (s.invoices[0].clientId = "c6"),
    (s) => (s.invoices[0].amount = -1),
    (s) => (s.projects[0].budget = NaN),
    (s) => s.clients.push(s.clients[0]),
    (s) => (s.tasks[0].due = "2026-02-30"),
    (s) => (s.invoices[0].due = "2020-01-01"),
    (s) => (s.settings.theme = "other"),
  ]) {
    const s = seed();
    mutate(s);
    assert.throws(() => validateState(s));
  }
  assert.throws(() => validateState({ version: 1 }));
  assert.throws(() => validateState(null));
});
test("creation links records and export/import preserves a changed workspace", () => {
  let s = seed();
  s = reducer(s, {
    type: "project",
    value: { ...s.projects[0], id: "new", name: "New project" },
  });
  s = reducer(s, {
    type: "task",
    value: {
      ...s.tasks[0],
      id: "new-task",
      projectId: "new",
      title: "New deliverable",
    },
  });
  const restored = reducer(seed(), {
    type: "restore",
    value: JSON.parse(JSON.stringify(s)),
  });
  assert.deepEqual(restored, s);
  assert.equal(reducer(s, { type: "reset" }).projects.length, 6);
});

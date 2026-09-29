import { chromium } from "file:///C:/Users/Ahmed%20hesham/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const browser = await chromium.launch({
  headless: true,
  executablePath:
    "C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe",
});
const origin =
  process.env.ATLAS_URL || "http://127.0.0.1:3017/assets/demos/atlas.html";
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await mkdir("work", { recursive: true });
try {
  assert.equal((await page.goto(origin)).status(), 200);
  await page.getByRole("heading", { name: "Good morning, Alex." }).waitFor();
  await page.screenshot({ path: "work/atlas-desktop.png", fullPage: true });
  async function nav(name) {
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("button", { name, exact: true })
      .click();
  }
  await page.getByRole("button", { name: "New project", exact: true }).click();
  await page
    .getByLabel("Project name", { exact: true })
    .fill("Portfolio test project");
  await page.getByLabel("Project brief").fill("A connected workflow test.");
  await page
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await nav("Projects");
  await page.getByRole("button", { name: "Portfolio test project" }).click();
  await page.getByRole("button", { name: "Add task", exact: true }).click();
  await page.getByLabel("Task title").fill("Test deliverable");
  await page.getByRole("button", { name: "Create task", exact: true }).click();
  await nav("Tasks");
  await page
    .getByRole("combobox", { name: "Status for Test deliverable", exact: true })
    .selectOption("Done");
  await nav("Projects");
  await page.getByRole("button", { name: "Portfolio test project" }).click();
  assert.match(await page.getByRole("dialog").innerText(), /100%/);
  await page.keyboard.press("Escape");
  await nav("Clients");
  await page.getByRole("button", { name: "Add client", exact: true }).click();
  await page.getByLabel("Company name").fill("Demo Test Co");
  await page.getByLabel("Contact person").fill("Test Person");
  await page.getByLabel("Email", { exact: true }).fill("test@example.com");
  await page.getByRole("button", { name: "Save client", exact: true }).click();
  assert.equal(
    await page
      .getByRole("button", { name: "Demo Test Co", exact: true })
      .count(),
    1,
  );
  await nav("Invoices");
  await page.getByRole("button", { name: "New invoice", exact: true }).click();
  await page
    .getByLabel("Description", { exact: true })
    .fill("QA design milestone");
  await page.getByLabel("Amount (USD)", { exact: true }).fill("1234");
  await page.getByRole("button", { name: "Save invoice", exact: true }).click();
  await page
    .getByRole("button", { name: "Open INV-1050", exact: true })
    .click();
  assert.match(await page.getByRole("dialog").innerText(), /1,234/);
  await page.getByRole("button", { name: "Mark paid", exact: true }).click();
  assert.match(await page.getByRole("dialog").innerText(), /Paid/);
  await page.keyboard.press("Escape");
  await page.reload();
  await nav("Overview");
  assert.match(await page.locator(".metrics").innerText(), /37,934/);
  await page.keyboard.press("Control+k");
  await page
    .getByRole("textbox", { name: "Search workspace" })
    .fill("Portfolio test");
  await page.getByRole("button", { name: "Portfolio test project" }).click();
  assert.match(
    await page.getByRole("dialog").innerText(),
    /connected workflow/,
  );
  await page.keyboard.press("Escape");
  for (const name of [
    "Projects",
    "Tasks",
    "Clients",
    "Invoices",
    "Analytics",
  ]) {
    await nav(name);
    await page.screenshot({
      path: "work/atlas-" + name.toLowerCase() + ".png",
      fullPage: true,
    });
  }
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByLabel("Studio name").fill("Test Studio");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.getByRole("button", { name: "dark mode" }).click();
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  await page.screenshot({ path: "work/atlas-dark.png", fullPage: true });
  await page.getByRole("button", { name: "light mode" }).click();
  await page
    .getByLabel("Restore backup", { exact: true })
    .setInputFiles({
      name: "invalid.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"version":1}'),
    });
  await page.getByRole("alert").waitFor();
  assert.equal(await page.getByRole("alert").count(), 1);
  const dlPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export backup" }).click();
  const download = await dlPromise;
  await download.saveAs("work/backup.json");
  await page.getByRole("button", { name: "Reset to sample workspace" }).click();
  await page.getByRole("button", { name: "Reset demo", exact: true }).click();
  await page
    .getByLabel("Restore backup", { exact: true })
    .setInputFiles("work/backup.json");
  await page.getByText("Backup restored", { exact: true }).waitFor();
  await nav("Projects");
  assert.equal(
    await page.getByRole("button", { name: "Portfolio test project" }).count(),
    1,
  );
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Reset to sample workspace" }).click();
  await page.getByRole("button", { name: "Reset demo", exact: true }).click();
  await nav("Overview");
  await page.locator(".toast.visible").waitFor({ state: "hidden" });
  await page.screenshot({ path: "../site/dist/assets/demos/atlas.png" });
  for (const width of [390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await page.screenshot({
      path: "work/atlas-mobile-" + width + ".png",
      fullPage: true,
    });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      "overview overflow " + width,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const name of [
    "Projects",
    "Tasks",
    "Clients",
    "Invoices",
    "Analytics",
    "Settings",
  ]) {
    await page.getByRole("button", { name: "Open navigation" }).click();
    if (name === "Settings")
      await page.getByRole("button", { name: "Settings", exact: true }).click();
    else await nav(name);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      name + " mobile overflow",
    );
  }
  assert.deepEqual(errors, []);
  console.log(
    "PASS: project/task/client/invoice creation; linked progress; marking paid; reload persistence; global search; 7 screens; dark mode; backup validation, export and restore; reset; mobile layouts; no JS errors.",
  );
} finally {
  await browser.close();
}

// Reads all ManyChat contacts (read only) and builds a CSV for AgentChat's import_contacts.
// ManyChat has no CSV export for contacts, so this script reads what the ManyChat web app itself loads.
//
// How to run (browser agent, user logged in to ManyChat, user said OK to the download):
// 1. Open https://app.manychat.com/ and wait until the Home page is loaded (URL /fb<page id>/dashboard).
// 2. Run step A. It hooks ManyChat's own requests, opens Contacts and loads every page with "Load More".
// 3. Run step B (runs in the background, about 1 second per 3 contacts) and poll window.__ac.progress().
// 4. When done, run step C. It downloads agentchat-contacts.csv. Pass the file text to import_contacts (dry run first).
// Nothing in ManyChat changes: only list and detail requests that the app makes anyway.

// ---- Step A: load the contact list ----
(async () => {
  const ac = (window.__ac = { list: {}, details: {}, headers: {}, errors: 0, done: false });
  const open = XMLHttpRequest.prototype.open, send = XMLHttpRequest.prototype.send, setH = XMLHttpRequest.prototype.setRequestHeader;
  XMLHttpRequest.prototype.open = function (m, u) { this.__acUrl = String(u); return open.apply(this, arguments); };
  XMLHttpRequest.prototype.setRequestHeader = function (k, v) {
    if (/^(Accept|Use-New-Error-Format|X-Requested-With|X-Csrf-Token|X-Frontend-Bundle)$/.test(k)) ac.headers[k] = v;
    return setH.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function () {
    if (this.__acUrl.includes("/subscribers/search")) {
      this.addEventListener("load", () => {
        const text = this.responseText, json = JSON.parse(text);
        // Instagram IDs have up to 17 digits, more than a JS number holds exactly: read them from the raw text.
        const ids = [...text.matchAll(/"ig_id":\s*(\d+|null)/g)].map((m) => m[1]);
        json.users.forEach((u, i) => { ac.list[u.user_id] = { ...u, ig_id: ids[i] && ids[i] !== "null" ? ids[i] : null }; });
      });
    }
    return send.apply(this, arguments);
  };
  const contactsLink = [...document.querySelectorAll("a")].find((a) => /\/subscribers$/.test(a.getAttribute("href") || ""));
  contactsLink.click();
  await new Promise((r) => setTimeout(r, 4000));
  for (let k = 0; k < 500; k++) {
    const more = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Load More");
    if (!more) break;
    more.click();
    await new Promise((r) => setTimeout(r, 1500));
  }
  ac.listDone = true;
})();
// Check: Object.keys(window.__ac.list).length should equal the total shown on the Contacts page.

// ---- Step B: read tags and source (widget) of each contact ----
// Open any contact once by clicking a row first, so window.__ac.headers is filled, then run:
(async () => {
  const ac = window.__ac, page = location.pathname.split("/")[1];
  const ids = Object.keys(ac.list);
  let i = 0;
  const worker = async () => {
    while (i < ids.length) {
      const id = ids[i++];
      try {
        const r = await fetch(`/${page}/subscribers/details?user_id=${id}`, { credentials: "include", headers: ac.headers });
        const u = (await r.json()).user;
        ac.details[id] = { tags: (u.tags || []).map((t) => t.tag_name), widgets: (u.widgets || []).map((t) => t.tag_name) };
      } catch { ac.errors++; }
      await new Promise((r) => setTimeout(r, 250));
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  ac.done = true;
})();
window.__ac.progress = () => ({ list: Object.keys(window.__ac.list).length, details: Object.keys(window.__ac.details).length, errors: window.__ac.errors, done: window.__ac.done });

// ---- Step C: build and download the CSV ----
(() => {
  const ac = window.__ac;
  const esc = (v) => { v = v == null ? "" : String(v); return /[",\n;]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v; };
  const iso = (t) => (t ? new Date(t * 1000).toISOString() : "");
  const rows = [["Instagram Username", "Instagram ID", "First Name", "Last Name", "Full Name", "Status", "Subscribed", "Last Interaction", "Tags", "Source"].join(",")];
  for (const [id, c] of Object.entries(ac.list)) {
    const d = ac.details[id] || { tags: [], widgets: [] };
    rows.push([c.ig_username, c.ig_id, c.first_name, c.last_name, c.name, c.status === "active" ? "Subscribed" : "Visitor",
      iso(c.ts_subscribed || c.ts_added), iso(c.ts_last_ig_user_interaction), d.tags.join("|"), d.widgets.join("|")].map(esc).join(","));
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["﻿" + rows.join("\r\n")], { type: "text/csv" }));
  a.download = "agentchat-contacts.csv";
  document.body.appendChild(a); a.click(); a.remove();
  return rows.length - 1;
})();

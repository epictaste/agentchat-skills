// Reads all ManyChat comment automations (read only) and turns them into the input for AgentChat's import_automations.
// Tested on 18.10.2026 with 24 live Instagram "Quick Automations": every entry passed the import dry run.
//
// How to run (browser agent, user logged in to ManyChat):
// 1. Open https://app.manychat.com/ and wait for the Home page (URL /fb<page id>/dashboard).
// 2. Run step A. It hooks ManyChat's own requests and opens "Automation" (My Automations), which loads the list.
// 3. Open any automation once by clicking it (fills the request headers), then go back and run step B.
// 4. Step B returns the import list. Pass it to import_automations (dry_run first). Step C optionally downloads it as a file.
// Nothing in ManyChat changes: only the list and detail requests the app makes anyway.

// ---- Step A ----
(async () => {
  const ac = (window.__acAut = { flows: null, headers: {} });
  const open = XMLHttpRequest.prototype.open, send = XMLHttpRequest.prototype.send, setH = XMLHttpRequest.prototype.setRequestHeader;
  XMLHttpRequest.prototype.open = function (m, u) { this.__acUrl = String(u); return open.apply(this, arguments); };
  XMLHttpRequest.prototype.setRequestHeader = function (k, v) {
    if (/^(Accept|Use-New-Error-Format|X-Requested-With|X-Csrf-Token|X-Frontend-Bundle)$/.test(k)) ac.headers[k] = v;
    return setH.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function () {
    if (this.__acUrl.includes("/cms/getFlows")) this.addEventListener("load", () => { ac.flows = JSON.parse(this.responseText).list; });
    return send.apply(this, arguments);
  };
  const page = location.pathname.split("/")[1];
  [...document.querySelectorAll("a")].find((a) => a.getAttribute("href") === `/${page}/cms`).click();
})();

// ---- Step B ----
(async () => {
  const ac = window.__acAut, page = location.pathname.split("/")[1];
  const result = [];
  for (const f of ac.flows.filter((x) => x.is_live)) {
    const triggers = (f.triggers.widgets || []).filter((w) => w.widget_type === "feed_comment_trigger" && w.status === "active");
    if (!triggers.length) continue;
    const eb = await (await fetch(`/${page}/easyBuilder/get?flow_ns=${f.ns}`, { credentials: "include", headers: ac.headers })).json();
    const steps = [];
    for (const group of Object.values(eb.structure?.contents || {})) for (const c of Object.values(group)) {
      const blocks = Object.values(c.blocks || {});
      steps.push({
        texts: blocks.filter((b) => b.type === "text" && b.text).map((b) => b.text),
        buttons: blocks.filter((b) => /button/.test(b.type) && (b.caption || b.url)).map((b) => ({ type: b.type, caption: b.caption, url: b.url || null })),
        isCondition: blocks.some((b) => b.type === "condition_item"),
      });
    }
    const isGate = (s) => s.texts.some((t) => /folg|follow/i.test(t));
    const link = steps.find((s) => s.buttons.some((b) => b.url));
    const gate = steps.find(isGate);
    const opening = steps.find((s) => s !== link && !isGate(s) && !s.isCondition && s.texts.length && s.buttons.some((b) => b.type === "content_button"));
    const links = link ? link.buttons.filter((b) => b.url) : [];
    for (const w of triggers) {
      const s = w.data.feed_comment_settings || {};
      const e = {
        name: f.name,
        trigger: "comment",
        media_id: s.post_id || s.post_data?.id,
        match_mode: s.comment_contains === "any_words" && !(s.include_keywords_array || []).length ? "any" : "word",
        public_replies: w.data.feed_comment_welcome?.public_reply_messages || [],
        follow_gate: Boolean(gate),
      };
      if ((s.include_keywords_array || []).length) e.keywords = s.include_keywords_array;
      if ((s.exclude_keywords_array || []).length) e.exclude_keywords = s.exclude_keywords_array;
      if (opening) { e.opening_text = opening.texts[0]; e.opening_button = opening.buttons.find((b) => b.type === "content_button").caption; }
      if (gate) { e.gate_text = gate.texts[0]; const gb = gate.buttons.find((b) => b.caption); if (gb) e.gate_button = gb.caption; }
      if (link) { e.link_text = link.texts[0]; e.link_url = links[0].url; e.link_button = links[0].caption; }
      if (links.length > 1) e.extra_links = links.slice(1, 3).map((b) => ({ title: b.caption, url: b.url }));
      result.push(e);
    }
  }
  window.__acAut.result = result;
  return result.length;
})();
// Then: JSON.stringify(window.__acAut.result) is the "automations" array for import_automations.

// ---- Step C (optional, only with the user's OK): download as file ----
(() => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(window.__acAut.result, null, 1)], { type: "application/json" }));
  a.download = "agentchat-automations.json";
  document.body.appendChild(a); a.click(); a.remove();
})();

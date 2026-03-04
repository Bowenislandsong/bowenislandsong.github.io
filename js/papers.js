// js/papers.js
// Dynamically loads and displays paper summaries from /papers/
// Views: Cards (default), Graph (force-directed canvas), By Topic, Timeline

(function () {
  'use strict';

  // ── Topic classifier ────────────────────────────────────────────────────────
  const TOPICS = [
    { key: 'federated',    label: 'Federated Learning',      color: '#8b5cf6', bg: '#ede9fe', border: '#c4b5fd', icon: '🔐', keywords: ['federat'] },
    { key: 'transformer',  label: 'Transformer / Attention', color: '#3b82f6', bg: '#dbeafe', border: '#93c5fd', icon: '🤖', keywords: ['transformer', 'attention mechanism', 'multi-head'] },
    { key: 'domain',       label: 'Domain Adaptation',       color: '#10b981', bg: '#d1fae5', border: '#6ee7b7', icon: '🌐', keywords: ['domain adapt', 'domain generaliz', 'domain-adversar', 'domain invariant'] },
    { key: 'fewshot',      label: 'Few-Shot / Meta-Learning', color: '#f59e0b', bg: '#fef3c7', border: '#fcd34d', icon: '⚡', keywords: ['few-shot', 'few shot', 'meta-learn', 'meta learn'] },
    { key: 'transfer',     label: 'Transfer Learning',       color: '#6366f1', bg: '#e0e7ff', border: '#a5b4fc', icon: '↗️', keywords: ['transfer learn'] },
    { key: 'fusion',       label: 'Sensor Fusion',           color: '#ec4899', bg: '#fce7f3', border: '#f9a8d4', icon: '📡', keywords: ['fusion', 'multi-sensor', 'multi sensor', 'sensor fusion', 'emg', 'pressure'] },
    { key: 'personalize',  label: 'Personalization',         color: '#06b6d4', bg: '#cffafe', border: '#67e8f9', icon: '👤', keywords: ['personali', 'subject-specific', 'subject specific', 'adaptive', 'individual'] },
    { key: 'physics',      label: 'Physics / Biomechanics',  color: '#f97316', bg: '#ffedd5', border: '#fdba74', icon: '🔬', keywords: ['physics-inform', 'biomechan', 'musculoskeletal', 'inverse dynamics'] },
    { key: 'cnn',          label: 'CNN / Convolutional',     color: '#14b8a6', bg: '#ccfbf1', border: '#5eead4', icon: '🧠', keywords: ['cnn', 'convolut', 'tcn', 'temporal convolut'] },
    { key: 'contrastive',  label: 'Contrastive / Self-Supervised', color: '#a855f7', bg: '#f3e8ff', border: '#d8b4fe', icon: '🔀', keywords: ['contrastive', 'self-supervis', 'unsupervis'] },
  ];
  const TOPIC_DEFAULT = { key: 'lstm', label: 'Deep Learning (LSTM/RNN)', color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1', icon: '📊' };

  function classifyPaper(meta, content) {
    const text = ((meta.title || '') + ' ' + (meta.keywords || '') + ' ' + (meta.abstract || '') + ' ' + (content || '')).toLowerCase();
    for (const t of TOPICS) {
      if (t.keywords.some(k => text.includes(k))) return t;
    }
    return TOPIC_DEFAULT;
  }

  // ── Frontmatter parser ──────────────────────────────────────────────────────
  function parsePaper(md) {
    const fmMatch = md.match(/^---([\s\S]+?)---/);
    let meta = {};
    if (fmMatch) {
      const fm = fmMatch[1];
      fm.split('\n').forEach(line => {
        const m = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
        if (m) {
          let key = m[1].trim(), val = m[2].trim();
          if (val.startsWith('[') && val.endsWith(']')) { try { val = JSON.parse(val); } catch (e) {} }
          meta[key] = val;
        }
      });
    }
    const content = md.replace(/^---([\s\S]+?)---/, '').trim();
    return { meta, content };
  }

  // Extract the first bullet point under a section heading (case-insensitive)
  function extractFirstBullet(content, headingPattern) {
    const m = content.match(new RegExp(headingPattern + '[\\s\\S]*?\\*\\s+(.+?)(?:\\n|$)', 'i'));
    return m ? m[1].replace(/\*\*/g, '').trim() : '';
  }

  // Extract date from filename like gemini_2025-10-01_...
  function dateFromPath(path) {
    const m = path.match(/(\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : '2025-01-01';
  }

  // ── State ───────────────────────────────────────────────────────────────────
  let allPapers = [];       // { meta, content, topic, path, date }
  let activeTopics = new Set(['all']);
  let currentView = 'cards';
  let expandedCard = null;

  // ── View switcher ───────────────────────────────────────────────────────────
  const VIEW_IDS = {
    cards: 'papers-browser',
    graph: 'papers-graph-view',
    topic: 'papers-topic-view',
    timeline: 'papers-timeline-view',
  };

  window.papersSetView = function (view) {
    currentView = view;
    Object.entries(VIEW_IDS).forEach(([v, id]) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('hidden', v !== view);
    });
    // Update button styles
    ['cards', 'graph', 'topic', 'timeline'].forEach(v => {
      const btn = document.getElementById('view-' + v);
      if (!btn) return;
      if (v === view) {
        btn.classList.add('bg-emerald-600', 'text-white');
        btn.classList.remove('text-slate-600', 'hover:bg-slate-50');
      } else {
        btn.classList.remove('bg-emerald-600', 'text-white');
        btn.classList.add('text-slate-600', 'hover:bg-slate-50');
      }
    });

    if (view === 'graph') renderGraph();
    if (view === 'topic') renderTopicView();
    if (view === 'timeline') renderTimeline();
  };

  // ── Topic filter ─────────────────────────────────────────────────────────────
  function buildTopicFilter(papers) {
    const bar = document.getElementById('topic-filter-bar');
    if (!bar) return;

    // Count per topic
    const counts = {};
    papers.forEach(p => { counts[p.topic.key] = (counts[p.topic.key] || 0) + 1; });

    bar.innerHTML = '';

    // "All" pill
    const allPill = makePill('all', 'All Papers', '#64748b', '#f1f5f9', papers.length);
    allPill.classList.add('ring-2', 'ring-offset-1', 'ring-slate-400');
    bar.appendChild(allPill);

    // One pill per topic that has papers
    const seen = new Set();
    papers.forEach(p => {
      if (seen.has(p.topic.key)) return;
      seen.add(p.topic.key);
      const pill = makePill(p.topic.key, p.topic.icon + ' ' + p.topic.label, p.topic.color, p.topic.bg, counts[p.topic.key] || 0);
      bar.appendChild(pill);
    });
  }

  function makePill(key, label, color, bg, count) {
    const btn = document.createElement('button');
    btn.dataset.topicKey = key;
    btn.className = 'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all hover:shadow-sm';
    btn.style.cssText = `background:${bg};color:${color};border-color:${color}40;`;
    btn.innerHTML = `${label} <span class="opacity-70">(${count})</span>`;
    btn.onclick = () => toggleTopic(key, btn);
    return btn;
  }

  function toggleTopic(key, btn) {
    if (key === 'all') {
      activeTopics = new Set(['all']);
    } else {
      activeTopics.delete('all');
      if (activeTopics.has(key)) activeTopics.delete(key);
      else activeTopics.add(key);
      if (activeTopics.size === 0) activeTopics.add('all');
    }
    // Update pill ring styles
    document.querySelectorAll('#topic-filter-bar button').forEach(b => {
      const k = b.dataset.topicKey;
      b.classList.toggle('ring-2', activeTopics.has(k));
      b.classList.toggle('ring-offset-1', activeTopics.has(k));
    });
    renderCards(filteredPapers());
    if (currentView === 'graph') renderGraph();
    if (currentView === 'topic') renderTopicView();
    if (currentView === 'timeline') renderTimeline();
  }

  function filteredPapers() {
    if (activeTopics.has('all')) return allPapers;
    return allPapers.filter(p => activeTopics.has(p.topic.key));
  }

  // ── Cards View ───────────────────────────────────────────────────────────────
  function renderCards(papers) {
    const browser = document.getElementById('papers-browser');
    if (!browser) return;
    browser.innerHTML = '';
    expandedCard = null;

    if (!papers.length) {
      browser.innerHTML = '<div class="col-span-full text-center py-10 text-slate-400">No papers match the selected filter.</div>';
      return;
    }

    papers.forEach((paper) => {
      const { meta, content, topic } = paper;
      const card = document.createElement('div');
      card.className = 'group rounded-2xl border bg-gradient-to-br p-5 cursor-pointer transition-all hover:shadow-lg';
      card.style.cssText = `background:linear-gradient(135deg,${topic.bg},#ffffff);border-color:${topic.border};`;

      const yearBadge = meta.year
        ? `<span class="text-xs font-semibold px-2 py-0.5 rounded-full" style="background:${topic.bg};color:${topic.color}">${meta.year}</span>`
        : '';
      const topicBadge = `<span class="text-xs font-semibold px-2 py-0.5 rounded-full" style="background:${topic.bg};color:${topic.color}">${topic.icon} ${topic.label}</span>`;

      // Extract first bullet under "Key Contributions"
      const firstContrib = extractFirstBullet(content, 'key contributions');

      card.innerHTML = `
        <div class="card-header">
          <div class="flex items-start justify-between gap-2 mb-2">
            <div class="flex flex-wrap gap-1">${yearBadge}${topicBadge}</div>
            <svg class="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors flex-shrink-0 mt-0.5 expand-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
          <h2 class="text-sm font-bold text-slate-900 leading-snug mb-1 line-clamp-3">${meta.title || 'Untitled'}</h2>
          <p class="text-xs text-slate-500 line-clamp-1">${meta.authors || ''}</p>
          ${firstContrib ? `<p class="mt-2 text-xs text-slate-600 line-clamp-2">💡 ${firstContrib}</p>` : ''}
        </div>
        <div class="details hidden mt-4 pt-4 border-t border-slate-200">
          ${meta.url ? `<a href="${meta.url}" target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-xs font-medium mb-3" style="color:${topic.color}">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            ${meta.source || 'View Paper'}
          </a>` : ''}
          <div class="prose prose-sm max-w-none text-slate-700 prose-headings:text-slate-900 prose-a:text-emerald-600">${window.marked ? window.marked.parse(content) : content.replace(/\n/g, '<br>')}</div>
        </div>
      `;

      const header = card.querySelector('.card-header');
      const details = card.querySelector('.details');
      const expandIcon = card.querySelector('.expand-icon');

      header.onclick = function (e) {
        e.stopPropagation();
        if (expandedCard && expandedCard !== card) {
          expandedCard.querySelector('.details').classList.add('hidden');
          expandedCard.querySelector('.expand-icon').style.transform = '';
        }
        const isHidden = details.classList.contains('hidden');
        if (isHidden) {
          details.classList.remove('hidden');
          expandIcon.style.transform = 'rotate(180deg)';
          expandedCard = card;
        } else {
          details.classList.add('hidden');
          expandIcon.style.transform = '';
          expandedCard = null;
        }
      };

      browser.appendChild(card);
    });
  }

  // ── By-Topic View ─────────────────────────────────────────────────────────────
  function renderTopicView() {
    const container = document.getElementById('papers-topic-view');
    if (!container) return;
    container.innerHTML = '';

    const papers = filteredPapers();
    const groups = {};
    papers.forEach(p => {
      const k = p.topic.key;
      if (!groups[k]) groups[k] = { topic: p.topic, papers: [] };
      groups[k].papers.push(p);
    });

    Object.values(groups).forEach(({ topic, papers: gPapers }) => {
      const section = document.createElement('div');
      section.className = 'rounded-2xl border overflow-hidden shadow-sm';
      section.style.borderColor = topic.border;

      // Section header
      const hdr = document.createElement('div');
      hdr.className = 'px-5 py-3 flex items-center gap-3';
      hdr.style.background = topic.bg;
      hdr.innerHTML = `
        <span class="text-xl">${topic.icon}</span>
        <div class="flex-1">
          <h2 class="font-bold text-base" style="color:${topic.color}">${topic.label}</h2>
          <p class="text-xs text-slate-500">${gPapers.length} paper${gPapers.length > 1 ? 's' : ''}</p>
        </div>
      `;
      section.appendChild(hdr);

      // Paper rows
      const list = document.createElement('div');
      list.className = 'divide-y divide-slate-100 bg-white';

      gPapers.forEach(paper => {
        const { meta, content } = paper;
        const row = document.createElement('div');
        row.className = 'px-5 py-4 hover:bg-slate-50 cursor-pointer transition-colors';

        const firstContrib = extractFirstBullet(content, 'key contributions');
        const whyText = extractFirstBullet(content, 'why this is state');

        row.innerHTML = `
          <div class="flex items-start gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-0.5">
                ${meta.year ? `<span class="text-xs font-semibold rounded-full px-2 py-0.5" style="background:${topic.bg};color:${topic.color}">${meta.year}</span>` : ''}
                ${meta.source ? `<span class="text-xs text-slate-400">${meta.source}</span>` : ''}
              </div>
              <h3 class="text-sm font-semibold text-slate-900 line-clamp-2">${meta.title || 'Untitled'}</h3>
              <p class="text-xs text-slate-500 mt-0.5 line-clamp-1">${meta.authors || ''}</p>
              ${firstContrib ? `<p class="mt-1.5 text-xs text-slate-600">💡 <strong>Key idea:</strong> ${firstContrib}</p>` : ''}
              ${whyText ? `<p class="mt-0.5 text-xs text-slate-500">⭐ ${whyText}</p>` : ''}
            </div>
            ${meta.url ? `<a href="${meta.url}" target="_blank" rel="noopener" class="shrink-0 text-xs underline mt-0.5" style="color:${topic.color}">View →</a>` : ''}
          </div>
          <div class="details hidden mt-3 pt-3 border-t border-slate-100">
            <div class="prose prose-sm max-w-none text-slate-700">${window.marked ? window.marked.parse(content) : content.replace(/\n/g, '<br>')}</div>
          </div>
        `;

        row.onclick = function () {
          const det = row.querySelector('.details');
          det.classList.toggle('hidden');
        };

        list.appendChild(row);
      });

      section.appendChild(list);
      container.appendChild(section);
    });
  }

  // ── Timeline View ─────────────────────────────────────────────────────────────
  function renderTimeline() {
    const container = document.getElementById('papers-timeline-view');
    if (!container) return;
    container.innerHTML = '';

    const papers = filteredPapers().slice().sort((a, b) => a.date.localeCompare(b.date));

    const wrap = document.createElement('div');
    wrap.className = 'relative';

    // Central line
    const line = document.createElement('div');
    line.className = 'absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200';
    wrap.appendChild(line);

    papers.forEach((paper, i) => {
      const { meta, topic, date } = paper;
      const item = document.createElement('div');
      item.className = 'relative pl-10 pb-6';

      item.innerHTML = `
        <div class="absolute left-1.5 top-1 w-5 h-5 rounded-full border-2 border-white shadow flex items-center justify-center text-xs" style="background:${topic.color}">${topic.icon}</div>
        <div class="rounded-xl border p-3 bg-white hover:shadow-md cursor-pointer transition-shadow" style="border-color:${topic.border}">
          <div class="flex items-start justify-between gap-2 mb-1">
            <span class="text-xs text-slate-400 font-mono">${date}</span>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full" style="background:${topic.bg};color:${topic.color}">${topic.label}</span>
          </div>
          <h3 class="text-sm font-semibold text-slate-900 line-clamp-2">${meta.title || 'Untitled'}</h3>
          <p class="text-xs text-slate-500 mt-0.5 line-clamp-1">${meta.authors || ''}</p>
        </div>
      `;

      wrap.appendChild(item);
    });

    container.appendChild(wrap);
  }

  // ── Graph View (Canvas-based force simulation) ────────────────────────────────
  function renderGraph() {
    const origCanvas = document.getElementById('papers-graph-canvas');
    const legend = document.getElementById('graph-legend');
    const tooltip = document.getElementById('graph-tooltip');
    const detail = document.getElementById('graph-detail');
    if (!origCanvas) return;

    const papers = filteredPapers();

    // Clone canvas to cancel old event listeners and animation
    if (origCanvas._graphAnimId) cancelAnimationFrame(origCanvas._graphAnimId);
    const c = origCanvas.cloneNode(false);
    origCanvas.parentNode.replaceChild(c, origCanvas);
    const ctx = c.getContext('2d');

    // DPI-aware sizing
    const rect = c.parentElement.getBoundingClientRect();
    c.width = rect.width * window.devicePixelRatio;
    c.height = rect.height * window.devicePixelRatio;
    c.style.width = rect.width + 'px';
    c.style.height = rect.height + 'px';
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const W = rect.width;
    const H = rect.height;

    // Build nodes
    const nodes = papers.map((p) => ({
      paper: p,
      x: W / 2 + (Math.random() - 0.5) * W * 0.6,
      y: H / 2 + (Math.random() - 0.5) * H * 0.6,
      vx: 0, vy: 0,
      r: p.meta.authors && p.meta.authors.includes('Song') ? 14 : 9,
    }));

    // Build edges: connect papers sharing the same topic (star topology per group)
    const edges = [];
    const topicGroups = {};
    nodes.forEach(n => {
      const k = n.paper.topic.key;
      if (!topicGroups[k]) topicGroups[k] = [];
      topicGroups[k].push(n);
    });
    Object.values(topicGroups).forEach(group => {
      if (group.length < 2) return;
      const hub = group[0];
      for (let i = 1; i < group.length; i++) edges.push({ a: hub, b: group[i] });
    });

    // Legend
    if (legend) {
      const seenTopics = new Set(papers.map(p => p.topic.key));
      legend.innerHTML = [...seenTopics].map(k => {
        const t = papers.find(p => p.topic.key === k).topic;
        return `<span class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold" style="background:${t.bg};color:${t.color};border:1px solid ${t.border}">${t.icon} ${t.label}</span>`;
      }).join('');
    }

    let dragging = null;
    let hovering = null;
    let animId = null;
    let dragMoved = false;

    function force() {
      const repulsion = 1800, linkDist = 100, gravity = 0.03, alpha = 0.3;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x, dy = nodes[j].y - nodes[i].y;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const f = repulsion / (dist * dist);
          nodes[i].vx -= f * dx / dist; nodes[i].vy -= f * dy / dist;
          nodes[j].vx += f * dx / dist; nodes[j].vy += f * dy / dist;
        }
      }
      edges.forEach(e => {
        const dx = e.b.x - e.a.x, dy = e.b.y - e.a.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const f = (dist - linkDist) * 0.05;
        e.a.vx += f * dx / dist; e.a.vy += f * dy / dist;
        e.b.vx -= f * dx / dist; e.b.vy -= f * dy / dist;
      });
      nodes.forEach(n => {
        n.vx += (W / 2 - n.x) * gravity;
        n.vy += (H / 2 - n.y) * gravity;
      });
      nodes.forEach(n => {
        if (n === dragging) return;
        n.vx *= 0.85; n.vy *= 0.85;
        n.x = Math.max(n.r + 2, Math.min(W - n.r - 2, n.x + n.vx * alpha));
        n.y = Math.max(n.r + 2, Math.min(H - n.r - 2, n.y + n.vy * alpha));
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      edges.forEach(e => {
        ctx.beginPath(); ctx.moveTo(e.a.x, e.a.y); ctx.lineTo(e.b.x, e.b.y);
        ctx.strokeStyle = 'rgba(148,163,184,0.35)'; ctx.lineWidth = 1; ctx.stroke();
      });
      nodes.forEach(n => {
        const isHovered = n === hovering;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + (isHovered ? 3 : 0), 0, 2 * Math.PI);
        ctx.fillStyle = n.paper.topic.color + (isHovered ? 'ff' : 'cc');
        ctx.fill();
        if (isHovered) { ctx.strokeStyle = n.paper.topic.color; ctx.lineWidth = 2; ctx.stroke(); }
        if (n.r > 10) {
          ctx.fillStyle = '#fff'; ctx.font = 'bold 8px sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(n.paper.meta.year || '', n.x, n.y);
        }
      });
    }

    function tick() {
      if (!c.isConnected) { cancelAnimationFrame(animId); return; }
      force(); draw();
      animId = requestAnimationFrame(tick);
    }
    c._graphAnimId = animId;
    tick();

    function getNode(mx, my) {
      return nodes.find(n => Math.hypot(n.x - mx, n.y - my) <= n.r + 4) || null;
    }
    function canvasPos(e) {
      const r = c.getBoundingClientRect();
      const src = e.touches ? e.touches[0] : e;
      return { x: src.clientX - r.left, y: src.clientY - r.top };
    }

    c.addEventListener('mousemove', e => {
      const { x, y } = canvasPos(e);
      if (dragging) { dragMoved = true; dragging.x = x; dragging.y = y; dragging.vx = 0; dragging.vy = 0; return; }
      const n = getNode(x, y);
      hovering = n;
      c.style.cursor = n ? 'pointer' : 'grab';
      if (n && tooltip) {
        tooltip.classList.remove('hidden');
        tooltip.style.left = (x + 12) + 'px';
        tooltip.style.top = (y - 10) + 'px';
        tooltip.innerHTML = `
          <div class="font-semibold text-slate-900 mb-0.5 line-clamp-2">${n.paper.meta.title || 'Untitled'}</div>
          <div class="text-slate-500 line-clamp-1">${n.paper.meta.authors || ''}</div>
          <span class="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold" style="background:${n.paper.topic.bg};color:${n.paper.topic.color}">${n.paper.topic.icon} ${n.paper.topic.label}</span>
        `;
      } else if (tooltip) { tooltip.classList.add('hidden'); }
    });

    c.addEventListener('mouseleave', () => {
      hovering = null;
      if (tooltip) tooltip.classList.add('hidden');
    });

    c.addEventListener('mousedown', e => {
      const { x, y } = canvasPos(e);
      dragging = getNode(x, y);
      dragMoved = false;
      if (dragging) c.style.cursor = 'grabbing';
    });

    c.addEventListener('mouseup', e => {
      const { x, y } = canvasPos(e);
      const n = getNode(x, y);
      if (!dragMoved && n && detail) showGraphDetail(n.paper);
      dragging = null; dragMoved = false;
      c.style.cursor = 'grab';
    });
  }

  function showGraphDetail(paper) {
    const detail = document.getElementById('graph-detail');
    if (!detail) return;
    detail.classList.remove('hidden');
    const { meta, content, topic } = paper;
    detail.style.borderColor = topic.border;
    detail.innerHTML = `
      <div class="flex items-start justify-between gap-3 mb-3">
        <div>
          <span class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold mb-2" style="background:${topic.bg};color:${topic.color};border:1px solid ${topic.border}">${topic.icon} ${topic.label}</span>
          <h2 class="text-base font-bold text-slate-900">${meta.title || 'Untitled'}</h2>
          <p class="text-sm text-slate-500 mt-0.5">${meta.authors || ''} ${meta.year ? '· ' + meta.year : ''}</p>
        </div>
        <button onclick="document.getElementById('graph-detail').classList.add('hidden')" class="text-slate-400 hover:text-slate-600 text-xl leading-none shrink-0">✕</button>
      </div>
      ${meta.url ? `<a href="${meta.url}" target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-xs font-medium mb-3 underline" style="color:${topic.color}">View Paper →</a>` : ''}
      <div class="prose prose-sm max-w-none text-slate-700">${window.marked ? window.marked.parse(content) : content.replace(/\n/g, '<br>')}</div>
    `;
    detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ── Main loader ───────────────────────────────────────────────────────────────
  async function loadPapers() {
    const browser = document.getElementById('papers-browser');
    if (!browser) return;

    try {
      const res = await fetch('papers/index.json');
      if (!res.ok) throw new Error('index.json not found');
      const files = await res.json();

      // Load all papers in parallel; browsers cap concurrent connections (~6) naturally
      const paths = files.map(f => f.path);
      const results = await Promise.allSettled(paths.map(async path => {
        const r = await fetch(path);
        if (!r.ok) throw new Error(`Could not load ${path}`);
        const md = await r.text();
        const { meta, content } = parsePaper(md);
        const topic = classifyPaper(meta, content);
        const date = dateFromPath(path);
        return { meta, content, topic, path, date };
      }));

      allPapers = results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value)
        .sort((a, b) => b.date.localeCompare(a.date)); // newest first

      const count = document.getElementById('papers-count');
      if (count) count.textContent = `${allPapers.length} papers`;

      buildTopicFilter(allPapers);
      renderCards(allPapers);

    } catch (e) {
      if (browser) {
        browser.innerHTML = `<div class='col-span-full text-red-600 p-4'>Could not load papers.<br><span class='text-xs'>${e.message}</span></div>`;
      }
    }
  }

  window.setupPapersDiscovery = loadPapers;

  // Auto-run when the element is present
  if (document.getElementById('papers-browser')) {
    loadPapers();
  }
})();

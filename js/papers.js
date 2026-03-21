// js/papers.js
// Dynamically loads and displays paper summaries from /papers/
// Views: Cards (default), Graph (force-directed canvas), By Topic, Timeline

(function () {
  'use strict';

  // ── Topic classifier ────────────────────────────────────────────────────────
  const TOPICS = [
    { key: 'health-biomechanics', label: 'Health AI / Biomechanics', color: '#0f766e', bg: '#ccfbf1', border: '#5eead4', icon: '🩺', keywords: ['gait', 'biomechan', 'rehabilitation', 'walking', 'running', 'wearable', 'clinical'] },
    { key: 'generalization-robustness', label: 'Generalization / Robustness', color: '#16a34a', bg: '#dcfce7', border: '#86efac', icon: '🌐', keywords: ['domain adapt', 'domain generaliz', 'generalization', 'cross-subject', 'subject-independent', 'robust', 'domain invariant'] },
    { key: 'personalized-adaptive-ml', label: 'Personalized / Adaptive ML', color: '#0284c7', bg: '#e0f2fe', border: '#7dd3fc', icon: '👤', keywords: ['personali', 'subject-specific', 'subject adaptive', 'adaptive', 'few-shot', 'meta-learning', 'transfer learn'] },
    { key: 'federated-privacy', label: 'Federated / Privacy', color: '#7c3aed', bg: '#ede9fe', border: '#c4b5fd', icon: '🔐', keywords: ['federat', 'privacy', 'on-device', 'distributed learning', 'client', 'secure aggregation'] },
    { key: 'multimodal-embodied-ai', label: 'Multi-Sensor / Embodied AI', color: '#db2777', bg: '#fce7f3', border: '#f9a8d4', icon: '📡', keywords: ['sensor fusion', 'multi-sensor', 'multimodal', 'pressure', 'emg', 'vision', 'kinematic', 'robotics'] },
    { key: 'efficient-interpretable-ml', label: 'Efficient / Interpretable ML', color: '#ea580c', bg: '#ffedd5', border: '#fdba74', icon: '⚙️', keywords: ['efficient', 'real-time', 'lightweight', 'interpretable', 'physics-informed', 'physical prior', 'edge'] },
    { key: 'graph-structured-learning', label: 'Graph / Structured Learning', color: '#4338ca', bg: '#e0e7ff', border: '#a5b4fc', icon: '🕸️', keywords: ['graph neural', 'graph attention', 'graph', 'structured'] },
    { key: 'transformer-attention', label: 'Transformer / Attention', color: '#2563eb', bg: '#dbeafe', border: '#93c5fd', icon: '🤖', keywords: ['transformer', 'attention mechanism', 'multi-head', 'self-attention'] },
    { key: 'platform-ranking-ml', label: 'Platform / Ranking ML', color: '#b45309', bg: '#fef3c7', border: '#fcd34d', icon: '📈', keywords: ['ranking', 'recommend', 'marketplace', 'retrieval', 'online learning', 'ctr'] },
    { key: 'cloud-systems-ai', label: 'Distributed / Cloud Systems', color: '#475569', bg: '#e2e8f0', border: '#cbd5e1', icon: '☁️', keywords: ['kubernetes', 'openshift', 'cloud', 'resource federation', 'distributed systems', 'mlops', 'platform reliability'] },
  ];
  const TOPIC_DEFAULT = { key: 'applied-ml', label: 'Applied ML / Sensing', color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1', icon: '📊' };

  function classifyPaper(meta, content) {
    const text = ((meta.title || '') + ' ' + (meta.keywords || '') + ' ' + (meta.abstract || '') + ' ' + (content || '')).toLowerCase();
    const trackHint = ((meta.curation_track || '') + ' ' + (meta.portfolio_track || '')).toLowerCase();
    let bestTopic = TOPIC_DEFAULT;
    let bestScore = 0;

    TOPICS.forEach((topic) => {
      let score = 0;
      if (trackHint && trackHint.includes(topic.label.toLowerCase())) score += 8;
      if (trackHint && trackHint.includes(topic.key)) score += 8;
      topic.keywords.forEach((keyword) => {
        if (text.includes(keyword)) score += 2;
      });
      if (score > bestScore) {
        bestScore = score;
        bestTopic = topic;
      }
    });

    return bestScore ? bestTopic : TOPIC_DEFAULT;
  }

  // ── Frontmatter parser ──────────────────────────────────────────────────────
  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function normalizeDocumentSource(md) {
    let source = (md || '').replace(/\r\n/g, '\n').trim().replace(/^\uFEFF/, '');
    source = source.replace(/^(?:```+\s*(?:yaml|yml|markdown|md)?|(?:yaml|yml|markdown|md)\s*```+)\s*\n?/i, '');
    source = source.replace(/\n?```+\s*$/i, '');
    return source.trim();
  }

  function normalizeScalar(value) {
    let next = (value || '').trim();
    if (!next) return '';

    const unwrapQuotes = (input) => {
      if ((input.startsWith('"') && input.endsWith('"')) || (input.startsWith('\'') && input.endsWith('\''))) {
        try { return JSON.parse(input); } catch { return input.slice(1, -1); }
      }
      return input;
    };

    next = unwrapQuotes(next);

    if (Array.isArray(next)) return next.join(', ');
    if (typeof next !== 'string') return String(next);

    if (next.startsWith('[') && next.endsWith(']')) {
      try {
        const parsed = JSON.parse(next);
        if (Array.isArray(parsed)) return parsed.join(', ');
      } catch (e) { /* ignore */ }
    }

    return next.replace(/\\"/g, '"').trim();
  }

  function collapseMultilineValue(lines) {
    if (!lines.length) return '';

    const first = (lines[0] || '').trim();
    const marker = first.replace(/^['"]|['"]$/g, '');
    if (marker === '|' || marker === '>') {
      return lines.slice(1).map(line => line.replace(/^\s+/, '')).join('\n').trim();
    }

    if (lines.length === 1) return first;

    const tail = lines
      .slice(1)
      .map(line => line.trim())
      .filter(Boolean);

    if (tail.length && tail.every(line => line.startsWith('- '))) {
      const items = [];
      if (first) items.push(first);
      tail.forEach(line => items.push(line.replace(/^-+\s*/, '')));
      return items.join(', ');
    }

    return [first].concat(tail.map(line => line.replace(/^-+\s*/, ''))).join(' ').trim();
  }

  function parseFrontmatterLines(lines) {
    const meta = {};
    let currentKey = '';
    let buffer = [];

    const flush = () => {
      if (!currentKey) return;
      meta[currentKey] = normalizeScalar(collapseMultilineValue(buffer));
      currentKey = '';
      buffer = [];
    };

    lines.forEach(line => {
      const match = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
      if (match) {
        flush();
        currentKey = match[1].trim();
        buffer = [match[2] || ''];
        return;
      }

      if (currentKey) buffer.push(line);
    });

    flush();
    return meta;
  }

  function parseLeadingMetadata(source) {
    const lines = (source || '').split('\n');
    if (!lines.length) return null;

    let index = 0;
    let fenceStyle = false;
    if (lines[0].trim() === '---') {
      fenceStyle = true;
      index = 1;
    } else if (!/^[a-zA-Z0-9_-]+:\s*(.*)$/.test(lines[0])) {
      return null;
    }

    const metaLines = [];
    let currentKey = '';
    let blockScalarMode = false;
    let sawKey = false;
    let bodyStart = index;

    for (; index < lines.length; index += 1) {
      const line = lines[index];
      const trimmed = line.trim();
      const keyMatch = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
      const continuation = currentKey && (
        trimmed === '' ||
        line.startsWith(' ') ||
        line.startsWith('\t') ||
        trimmed.startsWith('- ') ||
        blockScalarMode
      );

      if (trimmed === '---') {
        bodyStart = index + 1;
        break;
      }
      if (keyMatch) {
        sawKey = true;
        currentKey = keyMatch[1].trim();
        blockScalarMode = /^["']?[|>]["']?$/.test((keyMatch[2] || '').trim());
        metaLines.push(line);
        bodyStart = index + 1;
        continue;
      }
      if (continuation) {
        metaLines.push(line);
        bodyStart = index + 1;
        continue;
      }
      if (!fenceStyle && sawKey) {
        bodyStart = index;
      }
      break;
    }

    if (!sawKey) return null;
    const meta = parseFrontmatterLines(metaLines);
    const content = normalizeMarkdownBody(lines.slice(bodyStart).join('\n'), meta);
    return { meta, content };
  }

  function normalizeMarkdownBody(content, meta) {
    let body = (content || '')
      .replace(/^\s*---\s*/, '')
      .replace(/\s*---\s*$/, '')
      .replace(/^\s*```(?:markdown|md)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();

    const headingLabels = [
      'Summary',
      'Main Problem',
      'Key Idea',
      'Results',
      'Related Work',
      'Key Contributions and Insights',
      'Why This Fits Bowen\'s Research and Engineering Lens',
      'Why this is State-of-the-Art',
      'Weaknesses or Limitations and How to Improve',
    ];

    headingLabels.forEach(label => {
      const pattern = new RegExp(`^\\s*\\*\\*${escapeRegExp(label)}\\*\\*:?\\s*(.*)$`, 'gmi');
      body = body.replace(pattern, (_, rest) => {
        const suffix = (rest || '').trim();
        return suffix ? `## ${label}\n${suffix}` : `## ${label}`;
      });
    });

    if (meta.title) {
      const titlePattern = new RegExp(`^#\\s+${escapeRegExp(meta.title)}\\s*$`, 'i');
      const lines = body.split('\n');
      if (lines.length && titlePattern.test(lines[0].trim())) {
        lines.shift();
        while (lines.length && !lines[0].trim()) lines.shift();
        body = lines.join('\n').trim();
      }
    }

    if (!body && meta.abstract) {
      body = `## Summary\n${meta.abstract}`;
    }

    return body;
  }

  function extractLooseField(source, key) {
    const snippet = (source || '').split('\n').slice(0, 40).join('\n');
    const match = snippet.match(new RegExp(`^\\s*${escapeRegExp(key)}\\s*:\\s*(.+?)\\s*$`, 'im'));
    return match ? normalizeScalar(match[1]) : '';
  }

  function humanizePath(path) {
    return (path.split('/').pop() || '')
      .replace(/\.md$/i, '')
      .replace(/^gemini_\d{4}-\d{2}-\d{2}_/i, '')
      .replace(/^gemini_\d{4}-\d{2}-\d{2}/i, '')
      .replace(/^no-doi-/i, '')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function sanitizeTitle(value) {
    let next = normalizeScalar(value)
      .replace(/^title\s*:\s*/i, '')
      .replace(/^(?:```+\s*(?:yaml|yml|markdown|md)?|(?:yaml|yml|markdown|md)\s*```+)\s*/i, '')
      .replace(/^---\s*/, '')
      .replace(/\s*```+\s*$/i, '')
      .trim();

    if (/^(untitled|null|undefined|n\/a)$/i.test(next)) return '';
    return next;
  }

  function deriveMeta(meta, content, path, rawSource = '') {
    const next = Object.assign({}, meta);
    if (!next.title && rawSource) next.title = extractLooseField(rawSource, 'title');
    if (!next.authors && rawSource) next.authors = extractLooseField(rawSource, 'authors');
    if (!next.journal && rawSource) next.journal = extractLooseField(rawSource, 'journal');
    if (!next.abstract && rawSource) next.abstract = extractLooseField(rawSource, 'abstract');
    if (!next.keywords && rawSource) next.keywords = extractLooseField(rawSource, 'keywords');
    next.title = sanitizeTitle(next.title);
    const headingMatch = content.match(/^\s*#\s+(.+)$/m);
    if (!next.title && headingMatch) next.title = headingMatch[1].trim();
    if (!next.title) {
      next.title = humanizePath(path) || 'Paper summary';
    }
    if (next.authors) next.authors = String(next.authors).replace(/;\s*/g, ', ');
    if (!next.source) next.source = next.journal || '';
    if (!next.url && next.doi) {
      next.url = /^https?:\/\//i.test(next.doi) ? next.doi : `https://doi.org/${next.doi}`;
    }
    return next;
  }

  function getPaperTitle(paper) {
    return paper.meta.title || humanizePath(paper.path) || 'Paper summary';
  }

  function parsePaper(md) {
    const source = normalizeDocumentSource(md);
    const parsed = parseLeadingMetadata(source);
    if (parsed) return parsed;
    const content = normalizeMarkdownBody(source, {});
    return { meta: {}, content };
  }

  function stripMarkdown(text) {
    return (text || '')
      .replace(/[`*_>#-]/g, ' ')
      .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function extractSection(content, labels) {
    for (const label of labels) {
      const escaped = escapeRegExp(label);
      const patterns = [
        new RegExp(`(?:^|\\n)#{1,6}\\s*${escaped}\\s*:?\\s*\\n?([\\s\\S]*?)(?=\\n#{1,6}\\s|\\n\\*\\*[^\\n]+\\*\\*:|$)`, 'i'),
        new RegExp(`(?:^|\\n)\\*\\*${escaped}\\*\\*:?\\s*\\n?([\\s\\S]*?)(?=\\n#{1,6}\\s|\\n\\*\\*[^\\n]+\\*\\*:|$)`, 'i'),
      ];
      for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match) return match[1].trim();
      }
    }
    return '';
  }

  function extractSectionPreview(content, labels) {
    const section = extractSection(content, labels);
    if (!section) return '';
    const bulletMatch = section.match(/^\s*[*-]\s+(.+?)(?:\n|$)/m);
    if (bulletMatch) return stripMarkdown(bulletMatch[1]);

    const paragraph = section.split(/\n\s*\n/).find(Boolean) || section.split('\n').find(Boolean) || '';
    return stripMarkdown(paragraph);
  }

  function extractBowenLensPreview(content) {
    return extractSectionPreview(content, [
      'Why This Fits Bowen\'s Research and Engineering Lens',
      'Why This Fits Bowen\'s Work',
      'Bowen Lens',
    ]);
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
  let graphResizeFrame = null;

  // ── View switcher ───────────────────────────────────────────────────────────
  const VIEW_IDS = {
    cards: 'papers-browser',
    graph: 'papers-graph-view',
    topic: 'papers-topic-view',
    timeline: 'papers-timeline-view',
  };

  function updateViewButtonState(view) {
    Object.keys(VIEW_IDS).forEach((name) => {
      const button = document.getElementById(`view-${name}`);
      if (!button) return;
      const active = name === view;
      button.classList.toggle('bg-emerald-600', active);
      button.classList.toggle('text-white', active);
      button.classList.toggle('text-slate-600', !active);
      button.classList.toggle('hover:bg-slate-50', !active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function bindViewButtons() {
    document.querySelectorAll('[data-papers-view]').forEach((button) => {
      if (button.dataset.bound === 'true') return;
      button.dataset.bound = 'true';
      button.addEventListener('click', () => {
        window.papersSetView(button.getAttribute('data-papers-view'));
      });
    });
  }

  function bindGraphDetailClose() {
    const detail = document.getElementById('graph-detail');
    if (!detail || detail.dataset.bound === 'true') return;
    detail.dataset.bound = 'true';
    detail.addEventListener('click', (event) => {
      if (!event.target.closest('[data-graph-close]')) return;
      detail.classList.add('hidden');
    });
  }

  function scheduleGraphRender() {
    if (graphResizeFrame) cancelAnimationFrame(graphResizeFrame);
    graphResizeFrame = requestAnimationFrame(() => {
      const graphView = document.getElementById('papers-graph-view');
      if (!graphView || graphView.classList.contains('hidden') || currentView !== 'graph') return;
      renderGraph();
    });
  }

  window.papersSetView = function (view) {
    const nextView = VIEW_IDS[view] ? view : 'cards';
    currentView = nextView;
    Object.entries(VIEW_IDS).forEach(([v, id]) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('hidden', v !== nextView);
    });
    updateViewButtonState(nextView);

    if (nextView === 'graph') renderGraph();
    if (nextView === 'topic') renderTopicView();
    if (nextView === 'timeline') renderTimeline();
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
    btn.type = 'button';
    btn.dataset.topicKey = key;
    btn.className = 'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all hover:shadow-sm';
    btn.style.cssText = `background:${bg};color:${color};border-color:${color}40;`;
    btn.innerHTML = `${label} <span class="opacity-70">(${count})</span>`;
    btn.setAttribute('aria-pressed', key === 'all' ? 'true' : 'false');
    btn.addEventListener('click', () => toggleTopic(key, btn));
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
      const active = activeTopics.has(k);
      b.classList.toggle('ring-2', active);
      b.classList.toggle('ring-offset-1', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
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
      const displayTitle = getPaperTitle(paper);
      const card = document.createElement('div');
      card.className = 'group rounded-2xl border bg-gradient-to-br p-5 cursor-pointer transition-all hover:shadow-lg';
      card.style.cssText = `background:linear-gradient(135deg,${topic.bg},#ffffff);border-color:${topic.border};`;

      const yearBadge = meta.year
        ? `<span class="text-xs font-semibold px-2 py-0.5 rounded-full" style="background:${topic.bg};color:${topic.color}">${meta.year}</span>`
        : '';
      const topicBadge = `<span class="text-xs font-semibold px-2 py-0.5 rounded-full" style="background:${topic.bg};color:${topic.color}">${topic.icon} ${topic.label}</span>`;

      const bowenLens = extractBowenLensPreview(content);
      const firstContrib = bowenLens || extractSectionPreview(content, ['Key Contributions and Insights', 'Key Contributions', 'Key Ideas']);
      const previewIcon = bowenLens ? '🎯' : '💡';

      card.innerHTML = `
        <button type="button" class="card-toggle w-full text-left" aria-expanded="false">
          <div class="flex items-start justify-between gap-2 mb-2">
            <div class="flex flex-wrap gap-1">${yearBadge}${topicBadge}</div>
            <svg class="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors flex-shrink-0 mt-0.5 expand-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
          <h2 class="text-sm font-bold text-slate-900 leading-snug mb-1 line-clamp-3">${displayTitle}</h2>
          <p class="text-xs text-slate-500 line-clamp-1">${meta.authors || ''}</p>
          ${firstContrib ? `<p class="mt-2 text-xs text-slate-600 line-clamp-2">${previewIcon} ${firstContrib}</p>` : ''}
        </button>
        <div class="details hidden mt-4 pt-4 border-t border-slate-200">
          ${meta.url ? `<a href="${meta.url}" target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-xs font-medium mb-3" style="color:${topic.color}">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            ${meta.source || 'View Paper'}
          </a>` : ''}
          <div class="prose prose-sm max-w-none text-slate-700 prose-headings:text-slate-900 prose-a:text-emerald-600">${window.marked ? window.marked.parse(content) : content.replace(/\n/g, '<br>')}</div>
        </div>
      `;

      const header = card.querySelector('.card-toggle');
      const details = card.querySelector('.details');
      const expandIcon = card.querySelector('.expand-icon');

      header.addEventListener('click', (e) => {
        e.stopPropagation();
        if (expandedCard && expandedCard !== card) {
          expandedCard.querySelector('.details').classList.add('hidden');
          expandedCard.querySelector('.expand-icon').style.transform = '';
          const openToggle = expandedCard.querySelector('.card-toggle');
          if (openToggle) openToggle.setAttribute('aria-expanded', 'false');
        }
        const isHidden = details.classList.contains('hidden');
        if (isHidden) {
          details.classList.remove('hidden');
          expandIcon.style.transform = 'rotate(180deg)';
          header.setAttribute('aria-expanded', 'true');
          expandedCard = card;
        } else {
          details.classList.add('hidden');
          expandIcon.style.transform = '';
          header.setAttribute('aria-expanded', 'false');
          expandedCard = null;
        }
      });

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
        const displayTitle = getPaperTitle(paper);
        const row = document.createElement('div');
        row.className = 'px-5 py-4 transition-colors';

        const bowenLens = extractBowenLensPreview(content);
        const firstContrib = bowenLens || extractSectionPreview(content, ['Key Contributions and Insights', 'Key Contributions', 'Key Ideas']);
        const whyText = extractSectionPreview(content, ['Why this is State-of-the-Art', 'Why this is State of the Art']);

        row.innerHTML = `
          <div class="flex items-start gap-3">
            <button type="button" class="topic-toggle min-w-0 flex-1 text-left hover:bg-slate-50 rounded-xl p-2 -m-2 transition-colors" aria-expanded="false">
              <div class="flex items-start gap-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    ${meta.year ? `<span class="text-xs font-semibold rounded-full px-2 py-0.5" style="background:${topic.bg};color:${topic.color}">${meta.year}</span>` : ''}
                    ${meta.source ? `<span class="text-xs text-slate-400">${meta.source}</span>` : ''}
                  </div>
                  <h3 class="text-sm font-semibold text-slate-900 line-clamp-2">${displayTitle}</h3>
                  <p class="text-xs text-slate-500 mt-0.5 line-clamp-1">${meta.authors || ''}</p>
                  ${firstContrib ? `<p class="mt-1.5 text-xs text-slate-600">${bowenLens ? '🎯' : '💡'} <strong>${bowenLens ? 'Bowen lens' : 'Key idea'}:</strong> ${firstContrib}</p>` : ''}
                  ${whyText ? `<p class="mt-0.5 text-xs text-slate-500">⭐ ${whyText}</p>` : ''}
                </div>
              </div>
            </button>
            ${meta.url ? `<a href="${meta.url}" target="_blank" rel="noopener" class="shrink-0 text-xs underline mt-0.5" style="color:${topic.color}">View →</a>` : ''}
          </div>
          <div class="details hidden mt-3 pt-3 border-t border-slate-100">
            <div class="prose prose-sm max-w-none text-slate-700">${window.marked ? window.marked.parse(content) : content.replace(/\n/g, '<br>')}</div>
          </div>
        `;

        const toggle = row.querySelector('.topic-toggle');
        toggle.addEventListener('click', () => {
          const det = row.querySelector('.details');
          det.classList.toggle('hidden');
          toggle.setAttribute('aria-expanded', det.classList.contains('hidden') ? 'false' : 'true');
        });

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
      const displayTitle = getPaperTitle(paper);
      const item = document.createElement('div');
      item.className = 'relative pl-10 pb-6';

      item.innerHTML = `
        <div class="absolute left-1.5 top-1 w-5 h-5 rounded-full border-2 border-white shadow flex items-center justify-center text-xs" style="background:${topic.color}">${topic.icon}</div>
        <div class="rounded-xl border p-3 bg-white hover:shadow-md cursor-pointer transition-shadow" style="border-color:${topic.border}">
          <div class="flex items-start justify-between gap-2 mb-1">
            <span class="text-xs text-slate-400 font-mono">${date}</span>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full" style="background:${topic.bg};color:${topic.color}">${topic.label}</span>
          </div>
          <h3 class="text-sm font-semibold text-slate-900 line-clamp-2">${displayTitle}</h3>
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
    if (!origCanvas || !origCanvas.parentElement || !origCanvas.parentNode) return;

    const papers = filteredPapers();

    // Clone canvas to cancel old event listeners and animation
    if (origCanvas._graphAnimId) cancelAnimationFrame(origCanvas._graphAnimId);
    const c = origCanvas.cloneNode(false);
    origCanvas.parentNode.replaceChild(c, origCanvas);
    const ctx = c.getContext('2d');
    if (!ctx) {
      if (legend) {
        legend.innerHTML = '<span class="text-slate-500">Canvas rendering is unavailable in this browser.</span>';
      }
      return;
    }

    // DPI-aware sizing
    const rect = c.parentElement.getBoundingClientRect();
    const W = Math.max(Math.round(rect.width || c.parentElement.clientWidth || 640), 320);
    const H = Math.max(Math.round(rect.height || c.parentElement.clientHeight || 520), 320);
    const dpr = Math.max(window.devicePixelRatio || 1, 1);
    c.width = W * dpr;
    c.height = H * dpr;
    c.style.width = W + 'px';
    c.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    if (tooltip) tooltip.classList.add('hidden');
    if (detail) detail.classList.add('hidden');

    if (!papers.length) {
      if (legend) {
        legend.innerHTML = '<span class="text-slate-500">No papers match the current topic filter.</span>';
      }
      return;
    }

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
        const displayTitle = getPaperTitle(n.paper);
        tooltip.classList.remove('hidden');
        tooltip.style.left = (x + 12) + 'px';
        tooltip.style.top = (y - 10) + 'px';
        tooltip.innerHTML = `
          <div class="font-semibold text-slate-900 mb-0.5 line-clamp-2">${displayTitle}</div>
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
    const displayTitle = getPaperTitle(paper);
    detail.style.borderColor = topic.border;
    detail.innerHTML = `
      <div class="flex items-start justify-between gap-3 mb-3">
        <div>
          <span class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold mb-2" style="background:${topic.bg};color:${topic.color};border:1px solid ${topic.border}">${topic.icon} ${topic.label}</span>
          <h2 class="text-base font-bold text-slate-900">${displayTitle}</h2>
          <p class="text-sm text-slate-500 mt-0.5">${meta.authors || ''} ${meta.year ? '· ' + meta.year : ''}</p>
        </div>
        <button type="button" data-graph-close class="text-slate-400 hover:text-slate-600 text-xl leading-none shrink-0" aria-label="Close paper details">✕</button>
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
    bindViewButtons();
    bindGraphDetailClose();
    allPapers = [];
    activeTopics = new Set(['all']);
    currentView = 'cards';
    expandedCard = null;

    const count = document.getElementById('papers-count');
    if (count) count.textContent = 'Loading papers...';
    browser.innerHTML = `
      <div class="col-span-full text-center py-12">
        <div class="inline-flex items-center gap-2 text-slate-500">
          <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading papers...
        </div>
      </div>
    `;
    window.papersSetView('cards');

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
        const parsed = parsePaper(md);
        const meta = deriveMeta(parsed.meta, parsed.content, path, md);
        const content = parsed.content;
        const topic = classifyPaper(meta, content);
        const date = dateFromPath(path);
        return { meta, content, topic, path, date };
      }));

      allPapers = results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value)
        .sort((a, b) => b.date.localeCompare(a.date)); // newest first

      if (count) count.textContent = `${allPapers.length} papers`;

      buildTopicFilter(allPapers);
      renderCards(allPapers);

    } catch (e) {
      if (browser) {
        browser.innerHTML = `<div class='col-span-full text-red-600 p-4'>Could not load papers.<br><span class='text-xs'>${e.message}</span></div>`;
      }
    }
  }

  window.addEventListener('resize', scheduleGraphRender);
  window.setupPapersDiscovery = loadPapers;
})();

// js/papers.js
// Dynamically loads and displays paper summaries from /papers/

window.setupPapersDiscovery = async function setupPapersDiscovery() {
  const browser = document.getElementById('papers-browser');
  if (!browser) return;
  browser.innerHTML = '<div class="text-sm text-slate-600">Loading papers…</div>';

  // Helper: fetch all .md files from papers/index.json
  async function listPaperFiles() {
    // Fetch static index.json listing all PDFs
    try {
      const res = await fetch('papers/index.json');
      if (!res.ok) return [];
      const files = await res.json();
      // files should be [{ name, path }]
      return files;
    } catch (e) { return []; }
  }

  // Helper: parse frontmatter and content from markdown
  function parsePaper(md) {
    const fmMatch = md.match(/^---([\s\S]+?)---/);
    let meta = {};
    if (fmMatch) {
      const fm = fmMatch[1];
      fm.split('\n').forEach(line => {
        const m = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
        if (m) {
          let key = m[1].trim();
          let val = m[2].trim();
          if (val.startsWith('[') && val.endsWith(']')) {
            try { val = JSON.parse(val); } catch(e){}
          }
          meta[key] = val;
        }
      });
    }
    const content = md.replace(/^---([\s\S]+?)---/, '').trim();
    return { meta, content };
  }

  // Load and render all papers
  const files = await listPaperFiles();
  if (!files.length) {
    // browser.innerHTML already set by fallback above
    return;
  }
  browser.innerHTML = '';
  let expandedCard = null;
  for (const file of files.reverse()) { // newest first
    try {
      const res = await fetch(file);
      if (!res.ok) throw new Error(`Could not load ${file}`);
      const md = await res.text();
      const { meta, content } = parsePaper(md);
      // Render collapsible card
      const card = document.createElement('div');
      card.className = 'bg-white rounded-xl shadow border border-slate-200 mb-3 cursor-pointer transition-all';
      card.style.overflow = 'visible';
      card.style.maxHeight = '';
      card.style.padding = '1rem';
      card.innerHTML = `
        <div class="card-header" style="display:flex; flex-direction:column; cursor:pointer;">
          <h2 class="text-xl font-bold m-0">${meta.title || 'Untitled'}</h2>
          <div class="text-sm text-slate-500">${meta.authors || ''} ${meta.year ? '('+meta.year+')' : ''}</div>
        </div>
        <div class="details" style="display:none;">
          <div class="text-xs text-slate-400 mb-2">${meta.source ? `<a href="${meta.url}" target="_blank" class="underline">${meta.source}</a>` : ''}</div>
          <div class="flex flex-wrap gap-2 mb-2">${Array.isArray(meta.tags) ? meta.tags.map(t => `<span class="px-2 py-1 bg-slate-100 rounded text-xs">${t}</span>`).join('') : ''}</div>
          <div class="prose prose-sm max-w-none mb-2">${window.marked ? window.marked.parse(content) : content.replace(/\n/g,'<br>')}</div>
        </div>
      `;
      card.querySelector('h2').onclick = function(e) {
        e.stopPropagation();
        // Collapse others
        if (expandedCard && expandedCard !== card) {
          expandedCard.querySelector('.details').style.display = 'none';
        }
        // Toggle this card
        const details = card.querySelector('.details');
        if (details.style.display === 'none') {
          details.style.display = 'block';
          expandedCard = card;
        } else {
          details.style.display = 'none';
          expandedCard = null;
        }
      };
      // Make header clickable
      card.querySelector('.card-header').onclick = card.querySelector('h2').onclick;
      browser.appendChild(card);
    } catch (e) {
      // Show error for individual paper
      const errDiv = document.createElement('div');
      errDiv.className = 'bg-red-50 border border-red-200 rounded p-3 mb-2 text-red-700';
      errDiv.innerHTML = `<b>Error loading paper:</b> ${file}<br><span class='text-xs'>${e.message || e}</span>`;
      browser.appendChild(errDiv);
    }
  }
}

// Auto-run on page load
if (document.getElementById('papers-browser')) {
  window.setupPapersDiscovery();
}

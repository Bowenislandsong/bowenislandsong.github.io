// js/papers.js
// Dynamically loads and displays paper summaries from /papers/

window.setupPapersDiscovery = async function setupPapersDiscovery() {
  const browser = document.getElementById('papers-browser');
  if (!browser) return;
  browser.innerHTML = '<div class="text-sm text-slate-600">Loading papers…</div>';

  // Helper: fetch all .md files from papers/index.json
  async function listPaperFiles() {
    try {
      const res = await fetch('papers/index.json');
      if (!res.ok) throw new Error('index.json not found');
      const files = await res.json();
      // files should be [{ name, path }]
      return files.map(f => f.path);
    } catch (e) {
      browser.innerHTML = `<div class='text-red-600'>Could not load papers.<br><span class='text-xs'>Reason: ${e.message || e}</span><br><span class='text-xs'>If you are seeing this on GitHub Pages, make sure papers/index.json and all markdown files are published and accessible.</span></div>`;
      return [];
    }
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
  
  // Color palette for cards
  const colors = [
    { bg: 'from-blue-50/50 to-white', border: 'hover:border-blue-300', tag: 'bg-blue-100 text-blue-700' },
    { bg: 'from-purple-50/50 to-white', border: 'hover:border-purple-300', tag: 'bg-purple-100 text-purple-700' },
    { bg: 'from-emerald-50/50 to-white', border: 'hover:border-emerald-300', tag: 'bg-emerald-100 text-emerald-700' },
    { bg: 'from-amber-50/50 to-white', border: 'hover:border-amber-300', tag: 'bg-amber-100 text-amber-700' },
    { bg: 'from-rose-50/50 to-white', border: 'hover:border-rose-300', tag: 'bg-rose-100 text-rose-700' },
    { bg: 'from-cyan-50/50 to-white', border: 'hover:border-cyan-300', tag: 'bg-cyan-100 text-cyan-700' },
  ];
  
  for (const [idx, file] of files.reverse().entries()) { // newest first
    try {
      const res = await fetch(file);
      if (!res.ok) throw new Error(`Could not load ${file}`);
      const md = await res.text();
      const { meta, content } = parsePaper(md);
      const color = colors[idx % colors.length];
      
      // Render modern card
      const card = document.createElement('div');
      card.className = `group rounded-2xl border border-slate-200 bg-gradient-to-br ${color.bg} p-5 cursor-pointer transition-all hover:shadow-lg ${color.border}`;
      
      // Extract year badge color
      const yearBadge = meta.year ? `<span class="text-xs font-semibold ${color.tag} px-2 py-0.5 rounded-full">${meta.year}</span>` : '';
      
      card.innerHTML = `
        <div class="card-header">
          <div class="flex items-start justify-between gap-2 mb-2">
            ${yearBadge}
            <svg class="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors flex-shrink-0 mt-0.5 expand-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
          <h2 class="text-base font-bold text-slate-900 leading-snug mb-2 line-clamp-3">${meta.title || 'Untitled'}</h2>
          <p class="text-xs text-slate-500 line-clamp-1">${meta.authors || ''}</p>
        </div>
        <div class="details hidden mt-4 pt-4 border-t border-slate-200">
          ${meta.source ? `<a href="${meta.url}" target="_blank" class="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 mb-3">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            ${meta.source}
          </a>` : ''}
          ${Array.isArray(meta.tags) && meta.tags.length ? `<div class="flex flex-wrap gap-1.5 mb-3">${meta.tags.map(t => `<span class="px-2 py-0.5 ${color.tag} rounded-full text-xs font-medium">${t}</span>`).join('')}</div>` : ''}
          <div class="prose prose-sm max-w-none text-slate-700 prose-headings:text-slate-900 prose-a:text-emerald-600">${window.marked ? window.marked.parse(content) : content.replace(/\n/g,'<br>')}</div>
        </div>
      `;
      
      // Toggle expand/collapse
      const header = card.querySelector('.card-header');
      const details = card.querySelector('.details');
      const expandIcon = card.querySelector('.expand-icon');
      
      header.onclick = function(e) {
        e.stopPropagation();
        
        // Collapse others
        if (expandedCard && expandedCard !== card) {
          expandedCard.querySelector('.details').classList.add('hidden');
          expandedCard.querySelector('.expand-icon').style.transform = '';
        }
        
        // Toggle this card
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
    } catch (e) {
      // Show error for individual paper
      const errDiv = document.createElement('div');
      errDiv.className = 'rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700';
      errDiv.innerHTML = `<p class="font-semibold text-sm">Error loading paper</p><p class="text-xs mt-1">${file}: ${e.message || e}</p>`;
      browser.appendChild(errDiv);
    }
  }
}

// Auto-run on page load
if (document.getElementById('papers-browser')) {
  window.setupPapersDiscovery();
}

// js/classes.js
// PDF.js viewer with file browser and drawing overlay

// Load PDF.js from CDN
window.setupClassesViewer = async function setupClassesViewer() {
  console.log('[Classes] setupClassesViewer called');

  // Query DOM elements up-front so we don't reference undefined variables.
  const browser = document.getElementById('pdf-browser');
  const viewerContainer = document.getElementById('pdf-viewer-container');
  const viewer = document.getElementById('pdf-viewer');
  const drawCanvas = document.getElementById('draw-canvas');
  const toolbar = document.getElementById('pdf-toolbar');

  if (!browser) {
    console.warn('[Classes] pdf-browser element not found');
    return;
  }
  // Always show browser on load and hide viewer until opened
  browser.style.display = '';
  if (viewerContainer) viewerContainer.style.display = 'none';

  // If PDF.js is not loaded yet, load it and retry after load
  if (!window.pdfjsLib) {
    browser.innerHTML += '<div class="text-yellow-600 mt-4">Loading PDF.js…</div>';
    if (!window._pdfjsLoading) {
      window._pdfjsLoading = true;

      // Try a list of known CDNs (jsdelivr, unpkg, cdnjs). We'll attempt each in order.
      // Prefer jsdelivr unversioned/latest (works in many setups) and a stable cdnjs 2.x build.
      const cdns = [
        { base: 'https://cdn.jsdelivr.net/npm/pdfjs-dist/build/', script: 'pdf.min.js', worker: 'pdf.worker.min.js' },
        { base: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@latest/build/', script: 'pdf.min.js', worker: 'pdf.worker.min.js' },
        { base: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/', script: 'pdf.min.js', worker: 'pdf.worker.min.js' }
      ];

      const loadFromCdn = (idx=0) => new Promise((resolve, reject) => {
        if (idx >= cdns.length) return reject(new Error('No CDN succeeded'));
        const cdn = cdns[idx];
        const src = cdn.base + cdn.script;
        const worker = cdn.base + cdn.worker;
        const s = document.createElement('script');
        s.src = src;
        s.onload = function() {
          try {
            if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
              window.pdfjsLib.GlobalWorkerOptions.workerSrc = worker;
            }
          } catch (err) { console.warn('[Classes] setting pdf worker failed', err); }
          console.log('[Classes] loaded pdf.js from', src);
          return resolve({ src, worker });
        };
        s.onerror = function() {
          console.warn('[Classes] failed to load pdf.js from', src);
          // try next CDN
          setTimeout(() => {
            loadFromCdn(idx+1).then(resolve).catch(reject);
          }, 100);
        };
        document.head.appendChild(s);
      });

      try {
        await loadFromCdn(0);
        // Re-run setup now that pdf.js should be available
        window.setupClassesViewer();
      } catch (e) {
        console.error('[Classes] All CDNs failed to load pdf.js', e);
        // Provide a graceful fallback: show direct links to PDFs so user can open them in a new tab
        const files = await (async () => [ { name: 'CS356_Discussion_03.pdf', path: 'classes/cs356/CS356_Discussion_03.pdf' } ])();
        const list = files.map(f => `<div><a class="underline text-blue-700" href="${f.path}" target="_blank" rel="noopener">Open ${f.name} (new tab)</a></div>`).join('');
        // Build a richer fallback: links + an inline browser iframe viewer with simple prev/next.
        browser.innerHTML = `
          <div class="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
            <p class="font-medium">PDF viewer could not load from CDN.</p>
            <p class="mt-1">You can still open the PDFs directly in a new tab, or view them inline using your browser's PDF plugin:</p>
            <div class="mt-2">${list}</div>
            <div class="mt-4"><button id="fallback-view-inline" class="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 border">View inline (browser PDF)</button></div>
            <div id="fallback-inline-area" class="mt-4"></div>
          </div>`;

        // Wire up inline viewer behavior
        (function(){
          const filesArr = files;
          const inlineArea = browser.querySelector('#fallback-inline-area');
          const btn = browser.querySelector('#fallback-view-inline');
          let fbPage = 1;
          let fbIframe = null;
          btn.addEventListener('click', () => {
            if (!filesArr || filesArr.length === 0) return;
            const first = filesArr[0];
            // Create controls + iframe
            inlineArea.innerHTML = '';
            const ctrl = document.createElement('div');
            ctrl.className = 'flex gap-2 items-center';
            ctrl.innerHTML = `
              <button id="fb-prev" class="px-3 py-1 rounded bg-slate-100 border">Prev</button>
              <span id="fb-page" class="text-sm font-mono">Page: 1</span>
              <button id="fb-next" class="px-3 py-1 rounded bg-slate-100 border">Next</button>
              <button id="fb-open-new" class="px-3 py-1 rounded bg-blue-600 text-white">Open in new tab</button>
            `;
            inlineArea.appendChild(ctrl);
            fbIframe = document.createElement('iframe');
            fbIframe.id = 'pdf-embed';
            fbIframe.src = first.path + '#page=1';
            fbIframe.style.width = '100%';
            fbIframe.style.height = '70vh';
            fbIframe.style.border = '0';
            inlineArea.appendChild(fbIframe);

            const prev = inlineArea.querySelector('#fb-prev');
            const next = inlineArea.querySelector('#fb-next');
            const pageLabel = inlineArea.querySelector('#fb-page');
            const openNew = inlineArea.querySelector('#fb-open-new');

            prev.addEventListener('click', () => { fbPage = Math.max(1, fbPage - 1); fbIframe.src = first.path + '#page=' + fbPage; pageLabel.textContent = 'Page: ' + fbPage; });
            next.addEventListener('click', () => { fbPage = fbPage + 1; fbIframe.src = first.path + '#page=' + fbPage; pageLabel.textContent = 'Page: ' + fbPage; });
            openNew.addEventListener('click', () => { window.open(first.path + '#page=' + fbPage, '_blank', 'noopener'); });
          });
        })();
      }
    }
    return;
  }
  // Ensure worker is configured if pdfjs already present
  try {
    if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.js';
    }
  } catch (err) { console.warn('[Classes] pdf worker config error', err); }
  // Fetch file list from /classes/ (assume static for now)
  // (DOM elements were queried earlier)
  let pdfDoc = null, pageNum = 1, scale = 1.2, drawing = false, pointerMode = false, numPages = 1;
  let currentPdfUrl = null;
  // viewerMode: 'nativeIframe' uses the browser's native PDF viewer via direct URL
  // 'pdfjs' uses in-page PDF.js rendering. Default to nativeIframe for reliability.
  let viewerMode = 'nativeIframe';

  // Helper: List PDFs dynamically by fetching /classes/ directory and subfolders
  async function listPDFs() {
    // Fetch static index.json listing all PDFs
    try {
      const res = await fetch('classes/index.json');
      if (!res.ok) return [];
      const files = await res.json();
      // files should be [{ name, path }]
      return files;
    } catch (e) { return []; }
  }

  // Render file browser with PDF previews and pretty layout
  async function renderBrowser() {
    const files = await listPDFs();
    browser.innerHTML = `<h2 class="text-lg font-semibold mb-4">Available PDFs</h2>`;
    if (!files.length) {
      browser.innerHTML += '<div class="text-red-600">No files found in classes/.</div>';
      return;
    }
    // Modern grid layout
    const grid = document.createElement('div');
    grid.className = 'grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
    for (const f of files) {
      const card = document.createElement('div');
      card.className = 'group bg-white rounded-xl shadow border border-slate-200 p-4 flex flex-col items-center hover:shadow-lg transition-shadow';
      // Preview area
      const preview = document.createElement('div');
      preview.className = 'w-full h-40 flex items-center justify-center bg-slate-50 rounded mb-3 overflow-hidden';
      preview.style.position = 'relative';
      // Show spinner while loading
      preview.innerHTML = `<div class="text-slate-400 animate-pulse">Loading…</div>`;
      card.appendChild(preview);
      
      // File type specific preview and handling
      if (f.type === 'pdf') {
        // PDF.js thumbnail rendering (if available)
        if (window.pdfjsLib) {
          window.pdfjsLib.getDocument(f.path).promise.then(pdfDoc => {
            pdfDoc.getPage(1).then(page => {
              const viewport = page.getViewport({ scale: 0.3 });
              const canvas = document.createElement('canvas');
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              canvas.style.width = '100%';
              canvas.style.height = '100%';
              preview.innerHTML = '';
              preview.appendChild(canvas);
              page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise.catch(()=>{});
            }).catch(() => { preview.innerHTML = '<div class="text-slate-400">No preview</div>'; });
          }).catch(() => { preview.innerHTML = '<div class="text-slate-400">No preview</div>'; });
        } else {
          preview.innerHTML = '<div class="text-slate-400">PDF Preview</div>';
        }
      } else if (f.type === 'markdown') {
        preview.innerHTML = '<div class="text-blue-600 text-4xl">📄</div><div class="text-xs text-slate-500 mt-1">Markdown</div>';
      } else if (f.type === 'asm') {
        preview.innerHTML = '<div class="text-green-600 text-4xl">⚙️</div><div class="text-xs text-slate-500 mt-1">Assembly</div>';
      } else {
        preview.innerHTML = '<div class="text-slate-400">No preview</div>';
      }
      
      // Filename
      const fname = document.createElement('div');
      fname.className = 'font-mono text-sm text-slate-700 mb-2 truncate w-full text-center';
      fname.textContent = f.name;
      card.appendChild(fname);
      
      // Open button
      const openBtn = document.createElement('button');
      openBtn.className = 'px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors w-full font-semibold';
      if (f.type === 'pdf') {
        openBtn.textContent = 'Open as slides';
        openBtn.onclick = () => openPDF(f.path);
      } else if (f.type === 'markdown') {
        openBtn.textContent = 'Read guide';
        openBtn.onclick = () => openMarkdown(f.path);
      } else if (f.type === 'asm') {
        openBtn.textContent = 'View assembly';
        openBtn.onclick = () => openAssembly(f.path);
      } else {
        openBtn.textContent = 'Open file';
        openBtn.onclick = () => window.open(f.path, '_blank');
      }
      card.appendChild(openBtn);
      grid.appendChild(card);
    }
    browser.appendChild(grid);
  }

  // Open and render PDF
  async function openPDF(url) {
    viewerContainer.style.display = '';
    browser.style.display = 'none';
    // Prefer in-page PDF.js rendering when available so we can control single-page
    // navigation and keyboard handling. Fallback to iframe/embed only if pdfjsLib
    // is not present.
    pageNum = 1;
    // Build an absolute URL so iframe requests are same-origin when served locally
    let abs = url;
    if (!/^(https?:)?\/\//i.test(url) && !url.startsWith('/')) {
      abs = window.location.origin + '/' + url.replace(/^\/+/, '');
    } else if (url.startsWith('/')) {
      abs = window.location.origin + url;
    }

    // If pdfjs is not available, use the browser's native iframe/embed path.
    if (typeof window.pdfjsLib === 'undefined' || !window.pdfjsLib) {
      // create or reuse a direct iframe that lets the browser render the PDF
      let iframe = viewer.querySelector('#pdf-embed');
      if (!iframe) {
        viewer.innerHTML = '';
        iframe = document.createElement('iframe');
        iframe.id = 'pdf-embed';
        iframe.style.width = '100%';
        iframe.style.height = '80vh';
        iframe.style.border = '0';
        // Prevent iframe from capturing focus initially; parent controls keyboard
        iframe.tabIndex = -1;
        iframe.addEventListener('load', () => {
          try { iframe.blur(); document.body.focus && document.body.focus(); } catch (e) {}
        });
        viewer.appendChild(iframe);
      }

      currentPdfUrl = abs;
      viewerMode = 'nativeIframe';
      iframe.src = abs + '#page=' + pageNum;
      // update page info (numPages unknown when using native viewer)
      const pageInfoEl = document.getElementById('page-info'); if (pageInfoEl) pageInfoEl.textContent = `Page ${pageNum}`;

      // Build a transparent control overlay on top of the iframe so we can
      // intercept wheel/keyboard events and implement single-frame navigation.
      try {
        viewer.style.position = viewer.style.position || 'relative';
        let overlay = viewer.querySelector('#pdf-control-overlay');
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.id = 'pdf-control-overlay';
          overlay.style.position = 'absolute';
          overlay.style.left = '0';
          overlay.style.top = '0';
          overlay.style.width = '100%';
          overlay.style.height = '100%';
          overlay.style.zIndex = '30';
          overlay.style.background = 'transparent';
          overlay.tabIndex = 0; // make focusable to receive key events
          overlay.title = 'PDF controls active — click to interact with viewer, Esc to return to controls';

          // wheel: map to prev/next page
          let wheelCooldown = 0;
          overlay.addEventListener('wheel', (ev) => {
            ev.preventDefault();
            const now = Date.now();
            if (now - wheelCooldown < 200) return; // throttle
            wheelCooldown = now;
            if (ev.deltaY > 0) {
              // next
              pageNum = pageNum + 1;
              const iframe2 = document.getElementById('pdf-embed'); if (iframe2) iframe2.src = currentPdfUrl + '#page=' + pageNum;
              const p = document.getElementById('page-info'); if (p) p.textContent = `Page ${pageNum}`;
            } else if (ev.deltaY < 0) {
              // prev
              pageNum = Math.max(1, pageNum - 1);
              const iframe2 = document.getElementById('pdf-embed'); if (iframe2) iframe2.src = currentPdfUrl + '#page=' + pageNum;
              const p = document.getElementById('page-info'); if (p) p.textContent = `Page ${pageNum}`;
            }
          }, { passive: false });

          // keyboard: left/right/up/down/space
          overlay.addEventListener('keydown', (ev) => {
            try {
              const prevKeys = ['ArrowLeft','ArrowUp','PageUp'];
              const nextKeys = ['ArrowRight','ArrowDown','PageDown',' '];
              if (prevKeys.includes(ev.key)) {
                ev.preventDefault();
                pageNum = Math.max(1, pageNum - 1);
                const iframe2 = document.getElementById('pdf-embed'); if (iframe2) iframe2.src = currentPdfUrl + '#page=' + pageNum;
                const p = document.getElementById('page-info'); if (p) p.textContent = `Page ${pageNum}`;
              } else if (nextKeys.includes(ev.key)) {
                ev.preventDefault();
                pageNum = pageNum + 1;
                const iframe2 = document.getElementById('pdf-embed'); if (iframe2) iframe2.src = currentPdfUrl + '#page=' + pageNum;
                const p = document.getElementById('page-info'); if (p) p.textContent = `Page ${pageNum}`;
              } else if (ev.key === 'Enter' || ev.key === ' ') {
                overlay.style.pointerEvents = 'none';
                try { iframe && iframe.focus && iframe.focus(); } catch(e){}
              } else if (ev.key === 'Escape') {
                overlay.style.pointerEvents = 'auto';
                overlay.focus && overlay.focus();
              }
            } catch(err) { console.warn('[Classes] overlay key error', err); }
          });

          overlay.addEventListener('click', () => {
            overlay.style.pointerEvents = 'none';
            try { const ifr = document.getElementById('pdf-embed'); if (ifr) ifr.focus && ifr.focus(); } catch(e){}
          });

          viewer.appendChild(overlay);
          setTimeout(() => { try { overlay.focus(); } catch(e){} }, 30);
        }
      } catch (e) { /* overlay best-effort, ignore errors */ }

      // Detect iframe load and fallback to <embed> if embed fails
      let loaded = false;
      try { iframe.onload = () => { loaded = true; }; } catch(e){}
      setTimeout(() => {
        if (loaded) return;
        try {
          const wrap = document.createElement('div');
          wrap.style.width = '100%';
          wrap.style.height = '80vh';
          wrap.style.position = 'relative';
          const embedEl = document.createElement('embed');
          embedEl.src = abs + '#page=' + pageNum;
          embedEl.type = 'application/pdf';
          embedEl.style.width = '100%';
          embedEl.style.height = '100%';
          embedEl.style.border = '0';
          wrap.appendChild(embedEl);
          const linkBar = document.createElement('div');
          linkBar.style.marginTop = '6px';
          linkBar.innerHTML = `<a class="underline text-blue-700" href="${abs}#page=${pageNum}" target="_blank" rel="noopener">Open PDF in a new tab</a>`;
          iframe.replaceWith(wrap);
          viewer.appendChild(linkBar);
        } catch (err) {
          viewer.innerHTML = `<div class='p-4'>Cannot display PDF inline. <a class="underline text-blue-700" href="${abs}" target="_blank" rel="noopener">Open PDF in a new tab</a></div>`;
        }
      }, 1000);
      return;
    }

    // Fallback: PDF.js rendering path
    try {
      pdfDoc = await window.pdfjsLib.getDocument(url).promise;
    } catch (e) {
      viewer.innerHTML = `<div class='text-red-600 p-4'>Failed to load PDF: ${e.message}</div>`;
      return;
    }
    pageNum = 1;
    numPages = pdfDoc.numPages;
    renderPage();
  }

  // Render a page
  async function renderPage() {
    try {
  const page = await pdfDoc.getPage(pageNum);

  // Compute scale to fit the viewer container (handles fullscreen sizing)
  const unscaled = page.getViewport({ scale: 1 });
      // Determine the element whose bounding rect should be used for sizing.
      // If fullscreen, the fullscreen element (usually viewerContainer) provides the available area.
      // Otherwise use the scroll container that directly wraps #pdf-viewer to get a correct inner size.
      const toolbarHeight = toolbar ? toolbar.offsetHeight + 8 : 0;
      const scrollContainer = (viewer && viewer.parentElement) || viewerContainer || document.body;
      const isFullscreen = !!document.fullscreenElement;

      // If fullscreen, prefer the full window size which is the most reliable
      // for maximizing content. Otherwise use the scroll container bounding rect.
      let availWidth, availHeight;
      if (isFullscreen) {
        availWidth = Math.max(200, window.innerWidth - 24);
        availHeight = Math.max(200, window.innerHeight - toolbarHeight - 24);
      } else {
        const baseRect = scrollContainer.getBoundingClientRect();
        availWidth = Math.max(200, baseRect.width - 24);
        availHeight = Math.max(200, baseRect.height - toolbarHeight - 24);
      }

      // If sizes look incorrect (0), attempt a brief retry to allow layout to settle
      if (availWidth <= 0 || availHeight <= 0) {
        await new Promise(r => setTimeout(r, 90));
        if (isFullscreen) {
          availWidth = Math.max(200, window.innerWidth - 24);
          availHeight = Math.max(200, window.innerHeight - toolbarHeight - 24);
        } else {
          const baseRect2 = scrollContainer.getBoundingClientRect();
          availWidth = Math.max(200, baseRect2.width - 24);
          availHeight = Math.max(200, baseRect2.height - toolbarHeight - 24);
        }
      }

      // When entering fullscreen, allow the inner viewer to expand (override CSS max-height)
      try {
        if (isFullscreen && viewer) viewer.style.maxHeight = 'none';
        if (!isFullscreen && viewer) viewer.style.maxHeight = '';
      } catch(e) { /* ignore */ }

  // Fit scale so the page fits both width and height
  const fitScale = Math.min(availWidth / unscaled.width, availHeight / unscaled.height);
  // Respect sensible bounds
  const newScale = Math.max(0.3, Math.min(3, fitScale));
  scale = newScale;

  // Compute final viewport such that rendered page will match target CSS size.
  // Start with the scale chosen earlier (fitScale). Then compute the viewport
  // width/height. If we need to force exact fit to avail area, recompute scale
  // from the target CSS width so canvas pixel buffer matches exactly.
  let viewport = page.getViewport({ scale });
  // Target CSS size (fit inside avail area preserving aspect)
  const aspect = viewport.width / viewport.height || 1;
  let targetCssW = Math.floor(Math.min(availWidth, availHeight * aspect));
  let targetCssH = Math.floor(Math.min(availHeight, availWidth / aspect));
  if (targetCssW / aspect > availHeight) {
    targetCssW = Math.floor(availHeight * aspect);
    targetCssH = Math.floor(availHeight);
  } else {
    targetCssH = Math.floor(targetCssW / aspect);
  }

  // Recompute scale so viewport width matches targetCssW (this ensures the
  // pixel buffer size and the PDF.js viewport align with CSS dimensions).
  const scaleFromTarget = targetCssW / unscaled.width;
  scale = scaleFromTarget;
  viewport = page.getViewport({ scale });
  // Debug info to help diagnose fullscreen cropping and sizing
  try {
    const rectInfo = (isFullscreen && document.fullscreenElement) ? document.fullscreenElement.getBoundingClientRect() : scrollContainer.getBoundingClientRect();
    console.debug('[Classes] renderPage sizes', {
      pageNum, numPages,
      pageOriginal: { width: unscaled.width, height: unscaled.height },
      chosenScale: scale,
      viewport: { width: viewport.width, height: viewport.height },
      baseRect: { width: rectInfo.width, height: rectInfo.height },
      avail: { width: availWidth, height: availHeight },
      dpr: window.devicePixelRatio || 1
    });
  } catch (e) { /* ignore */ }
  viewer.innerHTML = '';
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Use devicePixelRatio for crisp rendering
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(viewport.width * dpr);
  canvas.height = Math.floor(viewport.height * dpr);
  // CSS size (logical pixels) so it fits the container
  const cssW = Math.floor(viewport.width);
  const cssH = Math.floor(viewport.height);
  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';
  // Apply transform for high-DPI
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  viewer.appendChild(canvas);
  await page.render({ canvasContext: ctx, viewport }).promise;
    } catch (e) {
      console.error('[Classes] renderPage error', e);
      viewer.innerHTML = `<div class='text-red-600 p-4'>Could not render page: ${e.message}</div>`;
      return;
    }
    // Setup drawing canvas (hidden by default)
    if (drawCanvas) {
      const dpr = window.devicePixelRatio || 1;
      drawCanvas.width = canvas.width; // pixel buffer
      drawCanvas.height = canvas.height;
      drawCanvas.style.width = canvas.style.width;
      drawCanvas.style.height = canvas.style.height;
      drawCanvas.style.pointerEvents = 'none';
      drawCanvas.style.zIndex = 10;
      const dctx = drawCanvas.getContext('2d');
      dctx.setTransform(1,0,0,1,0,0);
      dctx.clearRect(0,0,drawCanvas.width,drawCanvas.height);
    }
    // Update page info
    document.getElementById('page-info').textContent = `Page ${pageNum} / ${numPages}`;
  }

  // Toolbar actions (guarded in case toolbar is missing)
  if (toolbar) {
    const fsBtn = toolbar.querySelector('#fullscreen-btn');
    const drawBtn = toolbar.querySelector('#draw-btn');
    const pointerBtn = toolbar.querySelector('#pointer-btn');
    const closeBtn = toolbar.querySelector('#close-pdf');

  if (fsBtn) fsBtn.onclick = () => { if (viewerContainer && viewerContainer.requestFullscreen) viewerContainer.requestFullscreen(); };
    if (closeBtn) closeBtn.onclick = async () => {
      try {
        // If we're fullscreen, exit fullscreen first. Call all vendor-prefixed
        // fallbacks to maximize compatibility.
        if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
          try {
            if (document.exitFullscreen) await document.exitFullscreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
            else if (document.msExitFullscreen) document.msExitFullscreen();
          } catch (e) { console.warn('[Classes] exit fullscreen failed', e); }
        }
        // Blur any active element (iframe may have focus) and focus window so
        // keyboard and pointer events return to the page.
        try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch (e) {}
        try { window.focus && window.focus(); } catch (e) {}
        // Small forced reflow / repaint hack to help the browser recover.
        try { document.body.style.display='none'; void document.body.offsetHeight; document.body.style.display=''; } catch (e) {}
      } catch (e) { console.warn('[Classes] close handler fullscreen check failed', e); }

      try {
        // Clear any embedded viewer to free resources and avoid frozen UI
        const iframe = document.getElementById('pdf-embed');
        if (iframe) {
          try { iframe.src = 'about:blank'; } catch (e) { /* ignore */ }
          // remove iframe element
          iframe.remove();
        }
        const wrap = document.getElementById('pdf-frame-wrap');
        if (wrap) wrap.remove();
        // Reset any forced sizing on viewerContainer
        if (viewerContainer) {
          viewerContainer.style.display = 'none';
          viewerContainer.style.height = '';
        }
        // Show the file browser again
        if (browser) browser.style.display = '';
        // Reset state
        pdfDoc = null;
        currentPdfUrl = null;
        viewerMode = 'nativeIframe';
        // restore focus so keyboard works again
        try { document.body.focus(); } catch (e) { /* ignore */ }
      } catch (err) {
        console.warn('[Classes] error during close cleanup', err);
      }
    };
  }

  // Add a clear drawing button and fullscreenchange handler
  try {
    // add clear button dynamically so it integrates with toolbar existence
  // drawing controls removed — keep toolbar minimal

    // When entering/exiting fullscreen, re-render after a short delay. renderPage
    // computes a fit that respects both width and height and applies DPR.
    document.addEventListener('fullscreenchange', () => {
      setTimeout(() => {
        try {
          if (!pdfDoc) return;
          const isFS = !!document.fullscreenElement;
          // Expand the viewer container to fill viewport when in fullscreen so
          // bounding rect measurements match the screen area.
          try {
            if (viewerContainer) {
              if (isFS) {
                viewerContainer.style.height = '100vh';
                viewerContainer.style.boxSizing = 'border-box';
              } else {
                viewerContainer.style.height = '';
              }
            }
          } catch (e) { /* ignore */ }
          renderPage();
        } catch (e) { console.warn('[Classes] fullscreen resize render failed', e); }
      }, 120);
    });
  } catch (err) { console.warn('[Classes] fullscreen handler setup failed', err); }

  // Page navigation (guarded in case toolbar or buttons are missing)
  if (toolbar) {
    const prevBtn = toolbar.querySelector('#prev-page');
    const nextBtn = toolbar.querySelector('#next-page');
    if (prevBtn) prevBtn.onclick = () => {
      if (viewerMode === 'nativeIframe' && currentPdfUrl) {
        pageNum = Math.max(1, pageNum - 1);
        const iframe = document.getElementById('pdf-embed');
        if (iframe) iframe.src = currentPdfUrl + '#page=' + pageNum;
        document.getElementById('page-info').textContent = `Page ${pageNum}`;
      } else if (pageNum > 1) { pageNum--; renderPage(); }
    };
    if (nextBtn) nextBtn.onclick = () => {
      if (viewerMode === 'nativeIframe' && currentPdfUrl) {
        pageNum = pageNum + 1;
        const iframe = document.getElementById('pdf-embed');
        if (iframe) iframe.src = currentPdfUrl + '#page=' + pageNum;
        document.getElementById('page-info').textContent = `Page ${pageNum}`;
      } else if (pageNum < numPages) { pageNum++; renderPage(); }
    };
  }
  // Drawing removed: hide draw canvas by default
  if (drawCanvas) drawCanvas.style.display = 'none';

  // Open and render Markdown
  async function openMarkdown(url) {
    const markdownContainer = document.getElementById('markdown-viewer-container');
    const markdownContent = document.getElementById('markdown-content');
    const markdownTitle = document.getElementById('markdown-title');
    const closeBtn = document.getElementById('close-markdown');
    
    if (!markdownContainer || !markdownContent) {
      console.error('Markdown viewer elements not found');
      return;
    }
    
    // Show markdown container, hide browser
    markdownContainer.style.display = '';
    browser.style.display = 'none';
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to load: ${response.status}`);
      const content = await response.text();
      
      // Set title
      const filename = url.split('/').pop();
      markdownTitle.textContent = filename;
      
      // Render markdown content
      if (window.marked) {
        markdownContent.innerHTML = window.marked.parse(content);
      } else {
        // Fallback: simple text formatting
        markdownContent.innerHTML = `<pre class="whitespace-pre-wrap font-mono text-sm">${content}</pre>`;
      }
      
      // Add syntax highlighting for code blocks if available
      if (window.hljs) {
        markdownContent.querySelectorAll('pre code').forEach(block => {
          window.hljs.highlightElement(block);
        });
      }
      
      // Setup close button
      if (closeBtn) {
        closeBtn.onclick = () => {
          markdownContainer.style.display = 'none';
          browser.style.display = '';
        };
      }
      
    } catch (err) {
      markdownContent.innerHTML = `<div class='text-red-600 p-4'>Failed to load markdown: ${err.message}</div>`;
    }
  }

  // Open and render Assembly
  async function openAssembly(url) {
    const assemblyContainer = document.getElementById('assembly-viewer-container');
    const assemblyContent = document.getElementById('assembly-content');
    const assemblyTitle = document.getElementById('assembly-title');
    const copyBtn = document.getElementById('copy-assembly');
    const closeBtn = document.getElementById('close-assembly');
    
    if (!assemblyContainer || !assemblyContent) {
      console.error('Assembly viewer elements not found');
      return;
    }
    
    // Show assembly container, hide browser
    assemblyContainer.style.display = '';
    browser.style.display = 'none';
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to load: ${response.status}`);
      const content = await response.text();
      
      // Set title
      const filename = url.split('/').pop();
      assemblyTitle.textContent = filename;
      
      // Display assembly content
      const preElement = assemblyContent.querySelector('pre');
      if (preElement) {
        preElement.textContent = content;
      }
      
      // Setup copy functionality
      if (copyBtn) {
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(content).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => copyBtn.textContent = 'Copy', 2000);
          }).catch(() => {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = content;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            copyBtn.textContent = 'Copied!';
            setTimeout(() => copyBtn.textContent = 'Copy', 2000);
          });
        };
      }
      
      // Setup close button
      if (closeBtn) {
        closeBtn.onclick = () => {
          assemblyContainer.style.display = 'none';
          browser.style.display = '';
        };
      }
      
    } catch (err) {
      assemblyContent.innerHTML = `<div class='text-red-600 p-4'>Failed to load assembly: ${err.message}</div>`;
    }
  }

  // Initial render with error safety
  try {
    browser.innerHTML = '<div class="text-sm text-slate-600">Initializing class viewer…</div>';
    await renderBrowser();
  } catch (err) {
    console.error('[Classes] initialization error', err);
    browser.innerHTML = `<div class='text-red-600 p-4'>Initialization failed: ${err && err.message ? err.message : String(err)}</div>`;
  }

  // Keyboard navigation: Left/Up/PageUp -> previous, Right/Down/PageDown/Space -> next
  document.addEventListener('keydown', (e) => {
    try {
      const active = document.activeElement;
      const tag = active && active.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (active && active.isContentEditable)) return; // don't hijack typing

      const inlineIframe = document.getElementById('pdf-embed');
      const viewerVisible = viewerContainer && window.getComputedStyle(viewerContainer).display !== 'none';
      if (!viewerVisible && !inlineIframe) return;

      const prevKeys = ['ArrowLeft', 'ArrowUp', 'PageUp'];
      const nextKeys = ['ArrowRight', 'ArrowDown', 'PageDown', ' '];

      if (prevKeys.includes(e.key)) {
        e.preventDefault();
        if (inlineIframe) {
          const prev = document.querySelector('#fb-prev'); if (prev) prev.click();
        } else {
          if (viewerMode === 'nativeIframe' && currentPdfUrl) {
            pageNum = Math.max(1, pageNum - 1);
            const iframe = document.getElementById('pdf-embed');
            if (iframe) iframe.src = currentPdfUrl + '#page=' + pageNum;
            document.getElementById('page-info').textContent = `Page ${pageNum}`;
          } else if (typeof pageNum === 'number' && pageNum > 1) { pageNum--; renderPage(); }
        }
      } else if (nextKeys.includes(e.key)) {
        e.preventDefault();
        if (inlineIframe) {
          const next = document.querySelector('#fb-next'); if (next) next.click();
        } else {
          if (viewerMode === 'nativeIframe' && currentPdfUrl) {
            pageNum = pageNum + 1;
            const iframe = document.getElementById('pdf-embed');
            if (iframe) iframe.src = currentPdfUrl + '#page=' + pageNum;
            document.getElementById('page-info').textContent = `Page ${pageNum}`;
          } else if (typeof pageNum === 'number' && typeof numPages === 'number' && pageNum < numPages) { pageNum++; renderPage(); }
        }
      }
    } catch (err) { console.warn('[Classes] keyboard nav error', err); }
  });
}

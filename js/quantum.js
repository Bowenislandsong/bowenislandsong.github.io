// js/quantum.js
// Shared boot logic for the quantum page. Keeps the section partial markup-only.

(() => {
  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function parseChapterAnchor(anchor) {
    if (anchor && /^chapter\d+$/.test(anchor)) return anchor;
    const match = window.location.hash.match(/^#\/quantum#(chapter\d+)$/);
    return match ? match[1] : '';
  }

  function renderMarkdown(md) {
    if (window.marked && typeof window.marked.parse === 'function') {
      return window.marked.parse(md);
    }
    return `<pre class="whitespace-pre-wrap">${escapeHtml(md)}</pre>`;
  }

  window.setupQuantumPage = async function setupQuantumPage({ anchor = '' } = {}) {
    const root = document.querySelector('[data-page-root="quantum"]');
    if (!root) return;

    const toggleBtn = document.getElementById('understanding-toggle');
    const body = document.getElementById('understanding-body');
    const chevron = document.getElementById('understanding-chevron');
    const lessonList = document.getElementById('lesson-list');
    const lessonContent = document.getElementById('lesson-content');
    const lessonSearch = document.getElementById('lesson-search');
    const chapterCount = document.getElementById('chapter-count');
    const jumpButtons = root.querySelectorAll('[data-quantum-jump]');

    if (!lessonList || !lessonContent) return;

    if (toggleBtn && body && toggleBtn.dataset.bound !== 'true') {
      toggleBtn.dataset.bound = 'true';
      toggleBtn.addEventListener('click', () => {
        const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
        toggleBtn.setAttribute('aria-expanded', String(!expanded));
        body.style.display = expanded ? 'none' : '';
        if (chevron) chevron.style.transform = expanded ? 'rotate(180deg)' : '';
      });
    }

    lessonList.innerHTML = '<div class="text-sm text-slate-400 py-4 text-center">Loading chapters...</div>';

    let lessons = [];
    try {
      const res = await fetch('lessons/index.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Could not load lessons/index.json (${res.status})`);
      lessons = await res.json();
    } catch (error) {
      lessonList.innerHTML = `
        <div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not load the chapter index. ${error.message}
        </div>
      `;
      lessonContent.innerHTML = `
        <div class="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          The chapter browser is temporarily unavailable. Try refreshing the page.
        </div>
      `;
      return;
    }

    lessonList.innerHTML = '';
    let activeLessonIndex = -1;
    const buttons = [];

    const setActiveButton = (activeAnchor) => {
      lessonList.querySelectorAll('button').forEach((button) => {
        const isActive = button.dataset.anchor === activeAnchor;
        button.classList.toggle('bg-indigo-100', isActive);
        button.classList.toggle('text-indigo-700', isActive);
        button.classList.toggle('border-indigo-200', isActive);
        button.classList.toggle('border-transparent', !isActive);
      });
    };

    const updateControls = () => {
      const currentChapterLabel = document.getElementById('current-chapter-label');
      const prevBtn = document.getElementById('lesson-prev');
      const nextBtn = document.getElementById('lesson-next');
      if (chapterCount) chapterCount.textContent = `${lessons.length} total`;
      if (!lessons.length) {
        if (currentChapterLabel) currentChapterLabel.textContent = 'No chapter selected yet';
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
        return;
      }

      if (activeLessonIndex < 0) {
        if (currentChapterLabel) currentChapterLabel.textContent = 'No chapter selected yet';
      } else {
        const lesson = lessons[activeLessonIndex];
        const chapterMatch = lesson.path.match(/chapter(\d+)\.md$/);
        const chapterLabel = chapterMatch ? `Chapter ${chapterMatch[1]} of ${lessons.length}` : lesson.title;
        if (currentChapterLabel) currentChapterLabel.textContent = `${chapterLabel} — ${lesson.title}`;
      }

      if (prevBtn) prevBtn.disabled = activeLessonIndex <= 0;
      if (nextBtn) nextBtn.disabled = activeLessonIndex < 0 || activeLessonIndex >= lessons.length - 1;
    };

    const applyFilter = () => {
      const query = (lessonSearch && lessonSearch.value || '').trim().toLowerCase();
      let visibleCount = 0;

      buttons.forEach(({ button, lesson, chapterAnchor, idx }) => {
        const chapterNumber = chapterAnchor.replace('chapter', '');
        const haystack = `${chapterNumber} ${lesson.title} chapter ${idx + 1}`.toLowerCase();
        const show = !query || haystack.includes(query);
        button.classList.toggle('hidden', !show);
        if (show) visibleCount += 1;
      });

      if (chapterCount) {
        chapterCount.textContent = query ? `${visibleCount} match${visibleCount === 1 ? '' : 'es'}` : `${lessons.length} total`;
      }
    };

    const openLesson = async (lesson, button) => {
      const chapterMatch = lesson.path.match(/chapter(\d+)\.md$/);
      const chapterAnchor = chapterMatch ? `chapter${chapterMatch[1]}` : '';
      activeLessonIndex = lessons.findIndex(item => item.path === lesson.path);

      lessonContent.innerHTML = `
        <div class="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Reading Mode</p>
            <p id="current-chapter-label" class="mt-1 text-sm font-semibold text-slate-900">Loading ${lesson.title}...</p>
          </div>
          <div class="flex gap-2">
            <button id="lesson-prev" type="button" class="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40">Prev</button>
            <button id="lesson-next" type="button" class="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300">Next</button>
          </div>
        </div>
        <div class="text-sm text-slate-400 py-10 text-center">Loading ${lesson.title}...</div>
      `;

      try {
        const response = await fetch(lesson.path, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Could not load ${lesson.path} (${response.status})`);
        const md = await response.text();

        if (chapterAnchor) {
          const canonical = `#/quantum#${chapterAnchor}`;
          if (window.location.hash !== canonical) {
            history.replaceState(null, '', canonical);
          }
        }

        lessonContent.innerHTML = `
          <article id="${chapterAnchor || 'lesson-active'}" class="space-y-6">
            <div class="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Reading Mode</p>
                <p id="current-chapter-label" class="mt-1 text-sm font-semibold text-slate-900">Chapter ${chapterMatch ? chapterMatch[1] : '?'} of ${lessons.length} — ${lesson.title}</p>
              </div>
              <div class="flex gap-2">
                <button id="lesson-prev" type="button" class="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40">Prev</button>
                <button id="lesson-next" type="button" class="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300">Next</button>
              </div>
            </div>
            <div class="flex items-center gap-2 text-sm text-indigo-600 font-semibold">
              <span class="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center">📖</span>
              Beginner Lesson
            </div>
            <div class="prose prose-lg max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-indigo-600 prose-strong:text-slate-900">
              ${renderMarkdown(md)}
            </div>
          </article>
        `;
        setActiveButton(chapterAnchor);
        if (button) button.scrollIntoView({ block: 'nearest' });
        lessonContent.scrollTo({ top: 0, behavior: 'smooth' });
        bindPagerButtons();
        updateControls();
      } catch (error) {
        lessonContent.innerHTML = `
          <div class="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            Could not load this chapter. ${error.message}
          </div>
        `;
        updateControls();
      }
    };

    const bindPagerButtons = () => {
      const localPrevBtn = document.getElementById('lesson-prev');
      const localNextBtn = document.getElementById('lesson-next');

      if (localPrevBtn) {
        localPrevBtn.disabled = activeLessonIndex <= 0;
        localPrevBtn.onclick = () => {
          if (activeLessonIndex > 0) openLesson(lessons[activeLessonIndex - 1], buttons[activeLessonIndex - 1].button);
        };
      }
      if (localNextBtn) {
        localNextBtn.disabled = activeLessonIndex < 0 || activeLessonIndex >= lessons.length - 1;
        localNextBtn.onclick = () => {
          if (activeLessonIndex >= 0 && activeLessonIndex < lessons.length - 1) {
            openLesson(lessons[activeLessonIndex + 1], buttons[activeLessonIndex + 1].button);
          }
        };
      }
    };

    lessons.forEach((lesson, idx) => {
      const button = document.createElement('button');
      const chapterMatch = lesson.path.match(/chapter(\d+)\.md$/);
      const chapterAnchor = chapterMatch ? `chapter${chapterMatch[1]}` : `lesson-${idx + 1}`;
      button.type = 'button';
      button.id = chapterAnchor;
      button.dataset.anchor = chapterAnchor;
      button.className = 'w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 focus:bg-indigo-100 transition-all border border-transparent hover:border-indigo-200';
      button.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-xs font-bold text-indigo-700">
            ${String(idx + 1).padStart(2, '0')}
          </span>
          <div class="min-w-0">
            <p class="font-semibold text-slate-900">Chapter ${idx + 1}</p>
            <p class="truncate text-xs text-slate-500">${lesson.title}</p>
          </div>
        </div>
      `;
      button.addEventListener('click', () => openLesson(lesson, button));
      lessonList.appendChild(button);
      buttons.push({ button, lesson, chapterAnchor, idx });
    });

    if (lessonSearch) lessonSearch.addEventListener('input', applyFilter);
    jumpButtons.forEach(jumpBtn => {
      jumpBtn.addEventListener('click', () => {
        const targetAnchor = jumpBtn.getAttribute('data-quantum-jump');
        const target = buttons.find(item => item.chapterAnchor === targetAnchor);
        if (!target) return;
        if (lessonSearch) lessonSearch.value = '';
        applyFilter();
        openLesson(target.lesson, target.button);
        target.button.scrollIntoView({ block: 'nearest' });
      });
    });

    const requestedAnchor = parseChapterAnchor(anchor);
    if (requestedAnchor) {
      const target = buttons.find(item => item.chapterAnchor === requestedAnchor);
      if (target) {
        await openLesson(target.lesson, target.button);
      }
    }

    applyFilter();
    updateControls();
    bindPagerButtons();
  };
})();

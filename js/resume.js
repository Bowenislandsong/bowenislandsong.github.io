// js/resume.js
// Renders the resume chooser plus three role-specific resume views
// from a shared structured data source.

(function () {
  'use strict';

  const RESUME_URL = 'resume/index.json';
  let cachedResume = null;

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async function fetchResumeData() {
    if (cachedResume) return cachedResume;
    const res = await fetch(RESUME_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Could not load ${RESUME_URL} (${res.status})`);
    cachedResume = await res.json();
    return cachedResume;
  }

  function renderLink(link, className) {
    const href = escapeHtml(link.href || '#');
    const label = escapeHtml(link.label || 'Open');
    const isExternal = /^https?:\/\//i.test(link.href || '');
    const target = isExternal ? ' target="_blank" rel="noopener"' : '';
    const download = link.download ? ' download' : '';
    return `<a href="${href}"${target}${download} class="${className}">${label}</a>`;
  }

  function renderLinkRow(links, options = {}) {
    if (!Array.isArray(links) || !links.length) return '';
    const wrapperClass = options.wrapperClass || '';
    const itemClass = options.itemClass || 'inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50';
    return `
      <div class="resume-link-row ${wrapperClass} mt-6 flex flex-wrap gap-3">
        ${links.map((link) => renderLink(link, itemClass)).join('')}
      </div>
    `;
  }

  function renderVariantSwitcher(currentPage, variants) {
    const links = Object.entries(variants).map(([page, variant]) => {
      const active = page === currentPage;
      const className = active
        ? 'rounded-full bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white'
        : 'rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50';
      const href = `#/${page}`;
      return `<a href="${href}" class="${className}">${escapeHtml(variant.title)}</a>`;
    }).join('');

    return `
      <div class="print-hidden mt-6 flex flex-wrap gap-2">
        <a href="#/resume" class="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">All resume directions</a>
        ${links}
      </div>
    `;
  }

  function renderProofChips(values, className) {
    return values.map((value) => `<span class="${className}">${escapeHtml(value)}</span>`).join('');
  }

  function renderResumePdfButton(variant) {
    if (!variant || !variant.pdfHref) return '';
    const href = escapeHtml(variant.pdfHref);
    const downloadName = escapeHtml((variant.pdfHref.split('/').pop() || 'resume.pdf'));
    return `<a href="${href}" download="${downloadName}" data-resume-pdf class="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800">Download PDF</a>`;
  }

  function renderResumePdfLink(variant, className, label = 'Download PDF') {
    if (!variant || !variant.pdfHref) return '';
    const href = escapeHtml(variant.pdfHref);
    const downloadName = escapeHtml((variant.pdfHref.split('/').pop() || 'resume.pdf'));
    const linkClass = className || 'inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50';
    return `<a href="${href}" download="${downloadName}" data-resume-pdf class="${linkClass}">${escapeHtml(label)}</a>`;
  }

  function renderPrintContactLine(profile) {
    const items = [];
    if (profile.email) items.push(`<a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a>`);
    if (profile.homepage) items.push(`<a href="${escapeHtml(profile.homepage)}">${escapeHtml(profile.homepage.replace(/^https?:\/\//, ''))}</a>`);

    (profile.links || []).forEach((link) => {
      if (link.label === 'Fallback PDF' || !link.href || /^mailto:/i.test(link.href)) return;
      items.push(`<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`);
    });

    return `
      <p class="resume-contact-inline print-only mt-3 text-sm leading-6 text-slate-600">
        ${items.join(' · ')}
      </p>
    `;
  }

  function filterVisibleItems(items, page) {
    return (items || []).filter((item) => !item.audiences || item.audiences.includes(page));
  }

  function pickByIds(items, ids) {
    const byId = new Map((items || []).map((item) => [item.id, item]));
    return (ids || []).map((id) => byId.get(id)).filter(Boolean);
  }

  function isPrintPriority(id, ids) {
    if (!Array.isArray(ids) || !ids.length) return true;
    return ids.includes(id);
  }

  function renderSummary(profile, variant, page, variants) {
    const proofChips = renderProofChips(
      variant.proofChips || [],
      'rounded-full bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-800'
    );
    const keywords = renderProofChips(
      variant.keywords || [],
      'rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600'
    );

    return `
      <div class="resume-summary-card rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_30px_90px_-52px_rgba(15,23,42,0.28)] md:p-10">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div class="max-w-3xl">
            <p class="resume-kicker text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Resume Match</p>
            <h1 class="resume-main-title mt-4 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">${escapeHtml(variant.title)}</h1>
            <p class="resume-headline mt-4 text-lg leading-8 text-slate-700 md:text-xl">${escapeHtml(variant.headline)}</p>
            ${variant.summary.map((line, index) => `<p class="resume-summary-line mt-3 text-base leading-7 text-slate-600${index > 0 ? ' resume-summary-line-secondary' : ''}">${escapeHtml(line)}</p>`).join('')}
            <p class="resume-meta-line mt-4 text-sm leading-6 text-slate-500">${escapeHtml(profile.graduation)} · ${escapeHtml(profile.location)} · ${escapeHtml(profile.email)}</p>
            ${renderPrintContactLine(profile)}
          </div>
          <div class="print-hidden flex flex-wrap gap-3">
            ${renderResumePdfButton(variant)}
            <a href="#/engineering" class="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50">Engineering page</a>
            <a href="#/research" class="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50">Research page</a>
          </div>
        </div>

        <div class="resume-proof-chips mt-6 flex flex-wrap gap-2">
          ${proofChips}
        </div>
        <div class="resume-keywords mt-4 flex flex-wrap gap-2">
          ${keywords}
        </div>
        <p class="resume-best-for mt-5 text-sm leading-6 text-slate-600">${escapeHtml(variant.bestFor || '')}</p>
        ${renderLinkRow((profile.links || []).filter((link) => !link.download), { wrapperClass: 'resume-link-row--profile print-hidden' })}
        ${renderVariantSwitcher(page, variants)}
      </div>
    `;
  }

  function renderSectionHeader(label, title, subtitle) {
    return `
      <div class="resume-section-header flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div class="max-w-3xl">
          <p class="resume-section-kicker text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">${escapeHtml(label)}</p>
          <h2 class="resume-section-title mt-2 text-3xl font-semibold tracking-tight text-slate-950">${escapeHtml(title)}</h2>
          ${subtitle ? `<p class="resume-section-subtitle mt-3 text-base leading-7 text-slate-600">${escapeHtml(subtitle)}</p>` : ''}
        </div>
      </div>
    `;
  }

  function renderExperienceItem(item, page, options = {}) {
    const bullets = filterVisibleItems(item.bullets, page);
    if (!bullets.length) return '';
    const printClass = options.printOptional ? ' resume-print-optional' : '';
    const printBulletLimit = Number.isFinite(options.printBulletLimit) ? options.printBulletLimit : bullets.length;

    return `
      <article class="resume-item${printClass} rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div class="resume-item-header flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p class="resume-item-meta text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">${escapeHtml(item.organization)} · ${escapeHtml(item.location)}</p>
            <h3 class="resume-item-title mt-2 text-xl font-semibold text-slate-900">${escapeHtml(item.role)}</h3>
          </div>
          <span class="resume-item-dates rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">${escapeHtml(item.dates)}</span>
        </div>
        <p class="resume-item-summary mt-4 text-sm leading-6 text-slate-600">${escapeHtml(item.summary)}</p>
        <ul class="resume-item-bullets mt-4 space-y-3 text-sm leading-6 text-slate-700">
          ${bullets.map((bullet, index) => `<li class="${index >= printBulletLimit ? 'resume-print-optional-bullet' : ''}">${escapeHtml(bullet.text)}</li>`).join('')}
        </ul>
        ${item.detail ? `<p class="resume-item-detail mt-4 text-sm leading-6 text-slate-500">${escapeHtml(item.detail)}</p>` : ''}
      </article>
    `;
  }

  function renderProjectItem(item, options = {}) {
    const printClass = options.printOptional ? ' resume-print-optional' : '';
    return `
      <article class="resume-item${printClass} rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p class="resume-item-meta text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">${escapeHtml(item.tag)}</p>
        <h3 class="resume-item-title mt-2 text-xl font-semibold text-slate-900">${escapeHtml(item.name)}</h3>
        <p class="resume-project-summary mt-3 text-sm leading-6 text-slate-600">${escapeHtml(item.summary)}</p>
        <p class="resume-project-detail mt-4 text-sm leading-6 text-slate-500">${escapeHtml(item.detail || '')}</p>
        ${renderLinkRow(item.links, { wrapperClass: 'resume-link-row--resource print-hidden' })}
      </article>
    `;
  }

  function renderPublicationItem(item, page, options = {}) {
    const signal = item.signal && item.signal[page] ? item.signal[page] : '';
    const printClass = options.printOptional ? ' resume-print-optional' : '';
    return `
      <article class="resume-item${printClass} rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div class="resume-publication-badges flex flex-wrap gap-2">
          <span class="resume-publication-badge rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">${escapeHtml(item.venue)}</span>
          <span class="resume-publication-badge rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">${escapeHtml(item.year)}</span>
        </div>
        <h3 class="resume-item-title mt-3 text-xl font-semibold text-slate-900">${escapeHtml(item.title)}</h3>
        <p class="resume-publication-authors mt-2 text-sm leading-6 text-slate-500">${escapeHtml(item.authors)}</p>
        <p class="resume-publication-signal mt-4 text-sm leading-6 text-slate-600">${escapeHtml(signal)}</p>
        ${renderLinkRow(item.links, { wrapperClass: 'resume-link-row--resource print-hidden' })}
      </article>
    `;
  }

  function renderEducationItem(item, options = {}) {
    const printClass = options.printOptional ? ' resume-print-optional' : '';
    return `
      <article class="resume-item${printClass} rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div class="resume-item-header flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 class="resume-item-title text-xl font-semibold text-slate-900">${escapeHtml(item.degree)}</h3>
            <p class="resume-item-summary mt-2 text-sm leading-6 text-slate-600">${escapeHtml(item.institution)} · ${escapeHtml(item.location)}</p>
          </div>
          <span class="resume-item-dates rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">${escapeHtml(item.dates)}</span>
        </div>
        <p class="resume-education-summary mt-4 text-sm leading-6 text-slate-600">${escapeHtml(item.summary)}</p>
      </article>
    `;
  }

  function renderSkillGroup(group, page, options = {}) {
    const items = filterVisibleItems(group.items, page);
    if (!items.length) return '';
    const printClass = options.printOptional ? ' resume-print-optional' : '';
    return `
      <article class="resume-item${printClass} rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h3 class="resume-item-title text-xl font-semibold text-slate-900">${escapeHtml(group.label)}</h3>
        <div class="resume-skill-tags mt-4 flex flex-wrap gap-2">
          ${items.map((item) => `<span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700">${escapeHtml(item.text)}</span>`).join('')}
        </div>
      </article>
    `;
  }

  function fillShell(shellId, markup) {
    const shell = document.getElementById(shellId);
    if (shell) shell.innerHTML = markup;
  }

  function renderVariantSection(sectionId, markup, containerClassName) {
    fillShell(`resume-${sectionId}-shell`, `
      <div class="${containerClassName}">
        ${markup}
      </div>
    `);
  }

  function applySectionOrder(sectionOrder) {
    const container = document.getElementById('resume-sections');
    if (!container) return;

    (sectionOrder || []).forEach((sectionId) => {
      if (sectionId === 'summary') return;
      const section = document.getElementById(sectionId);
      if (section) container.appendChild(section);
    });
  }

  function renderVariantPage(data, page) {
    const variant = data.variants && data.variants[page];
    if (!variant) {
      fillShell('resume-summary-shell', `
        <div class="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 p-8 text-sm leading-6 text-slate-600">
          Could not find this resume direction.
        </div>
      `);
      return;
    }

    fillShell('resume-summary-shell', renderSummary(data.profile, variant, page, data.variants));

    const experiences = pickByIds(data.experience, variant.featuredExperienceIds);
    const projects = pickByIds(data.projects, variant.featuredProjectIds);
    const publications = pickByIds(data.publications, variant.featuredPublicationIds);
    const skillGroups = pickByIds(data.skills, variant.featuredSkillGroupIds);
    const printExperienceIds = variant.printFeaturedExperienceIds || variant.featuredExperienceIds;
    const printProjectIds = variant.printFeaturedProjectIds || variant.featuredProjectIds;
    const printPublicationIds = variant.printFeaturedPublicationIds || variant.featuredPublicationIds;
    const printSkillGroupIds = variant.printFeaturedSkillGroupIds || variant.featuredSkillGroupIds;
    const printEducationCount = Number.isFinite(variant.printEducationCount) ? variant.printEducationCount : (data.education || []).length;
    const printBulletLimit = Number.isFinite(variant.printBulletLimit) ? variant.printBulletLimit : 2;

    renderVariantSection(
      'experience',
      `
        ${renderSectionHeader('Experience', 'Selected experience', 'The strongest experience for this role direction, with impact first and overlap removed.')}
        <div class="resume-experience-list mt-6 grid gap-4">${experiences.map((item) => renderExperienceItem(item, page, {
          printOptional: !isPrintPriority(item.id, printExperienceIds),
          printBulletLimit
        })).join('')}</div>
      `,
      ''
    );

    renderVariantSection(
      'projects',
      `
        ${renderSectionHeader('Projects', 'Selected projects', 'Public proof that reinforces the story this version of the resume is telling.')}
        <div class="resume-project-list mt-6 grid gap-4 md:grid-cols-2">${projects.map((item) => renderProjectItem(item, {
          printOptional: !isPrintPriority(item.id, printProjectIds)
        })).join('')}</div>
      `,
      ''
    );

    renderVariantSection(
      'publications',
      `
        ${renderSectionHeader('Publications', 'Selected publications', 'Publications stay as supporting proof, with the reason each one matters for this lane.')}
        <div class="resume-publication-list mt-6 grid gap-4">${publications.map((item) => renderPublicationItem(item, page, {
          printOptional: !isPrintPriority(item.id, printPublicationIds)
        })).join('')}</div>
      `,
      ''
    );

    renderVariantSection(
      'education',
      `
        ${renderSectionHeader('Education', 'Education', 'Compact academic context for the hiring story above.')}
        <div class="resume-education-list mt-6 grid gap-4">${(data.education || []).map((item, index) => renderEducationItem(item, {
          printOptional: index >= printEducationCount
        })).join('')}</div>
      `,
      ''
    );

    renderVariantSection(
      'skills',
      `
        ${renderSectionHeader('Skills', 'Role-relevant skills', 'Keyword density is kept honest by showing only the skills that support this direction.')}
        <div class="resume-skill-list mt-6 grid gap-4">${skillGroups.map((group) => renderSkillGroup(group, page, {
          printOptional: !isPrintPriority(group.id, printSkillGroupIds)
        })).join('')}</div>
      `,
      ''
    );
    applySectionOrder(variant.sectionOrder);
  }

  function renderChooserCard(page, variant) {
    return `
      <article class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Resume Direction</p>
        <h3 class="mt-2 text-2xl font-semibold text-slate-900">${escapeHtml(variant.title)}</h3>
        <p class="mt-3 text-sm leading-6 text-slate-600">${escapeHtml(variant.bestFor)}</p>
        <div class="mt-4 flex flex-wrap gap-2">
          ${renderProofChips(
            variant.proofChips || [],
            'rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700'
          )}
        </div>
        <div class="mt-5 flex flex-wrap gap-3">
          <a href="#/${page}" class="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800">Open web resume</a>
          ${renderResumePdfLink(variant, 'inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50')}
          <a href="#/${page}#summary" class="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50">Jump to summary</a>
        </div>
      </article>
    `;
  }

  function renderLandingPage(data) {
    const pdfLinks = Object.entries(data.variants || {}).map(([, variant]) =>
      renderResumePdfLink(
        variant,
        'inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-900 transition-colors hover:bg-teal-100',
        `${variant.title} PDF`
      )
    ).join('');

    fillShell('resume-overview-shell', `
      <div class="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_30px_90px_-52px_rgba(15,23,42,0.28)] md:p-10">
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Resume</p>
        <h1 class="mt-4 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">Three resume directions, one shared source of truth.</h1>
        <p class="mt-4 text-lg leading-8 text-slate-700 md:text-xl">${escapeHtml(data.profile.tagline)}</p>
        <p class="mt-4 max-w-3xl text-base leading-7 text-slate-600">Use the version that matches the role. Engineering leads with systems ownership, embodied ML leads with wearable and interpretable modeling, and advanced ML leads with ranking, MoE, and evaluation-heavy model design.</p>
        <p class="mt-4 text-sm leading-6 text-slate-500">${escapeHtml(data.profile.graduation)} · ${escapeHtml(data.profile.location)} · ${escapeHtml(data.profile.email)}</p>
        <div class="mt-6 flex flex-wrap gap-3">
          ${pdfLinks}
        </div>
        ${renderLinkRow((data.profile.links || []).filter((link) => !link.download))}
      </div>
    `);

    fillShell('resume-directions-shell', `
      <div class="grid gap-4 lg:grid-cols-3">
        ${Object.entries(data.variants || {}).map(([page, variant]) => renderChooserCard(page, variant)).join('')}
      </div>
    `);
  }

  function renderError(shellId, message) {
    fillShell(shellId, `
      <div class="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 p-8 text-sm leading-6 text-slate-600">
        ${escapeHtml(message)}
      </div>
    `);
  }

  window.setupResumeLanding = async function setupResumeLanding() {
    try {
      const data = await fetchResumeData();
      renderLandingPage(data);
    } catch (error) {
      console.error('[Resume] failed to load landing page:', error);
      renderError('resume-overview-shell', `Could not load the resume chooser right now. ${error.message}`);
    }
  };

  window.setupResumePage = async function setupResumePage({ page } = {}) {
    try {
      const data = await fetchResumeData();
      renderVariantPage(data, page);
    } catch (error) {
      console.error('[Resume] failed to load resume page:', error);
      renderError('resume-summary-shell', `Could not load this resume right now. ${error.message}`);
    }
  };
})();

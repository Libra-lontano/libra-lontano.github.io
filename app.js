(() => {
  const data = window.SITE_DATA || {pages:[],entries:[]};
  const themeButton = document.querySelector('#theme-toggle');
  const themeLabel = () => themeButton?.setAttribute('aria-label', document.documentElement.dataset.theme === 'dark' ? '切换浅色模式' : '切换深色模式');
  themeLabel();
  themeButton?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('personal-home-theme', next); } catch {}
    themeLabel();
  });
  const current = document.querySelector('.main-nav [aria-current="page"]');
  if (current && current.offsetLeft + current.offsetWidth > current.parentElement.clientWidth) current.parentElement.scrollLeft = current.offsetLeft - 30;
  const dialog = document.querySelector('#search-dialog');
  const input = document.querySelector('#global-search');
  const results = document.querySelector('#search-results');
  let lastFocus;
  const escapeText = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function search() {
    const query = input.value.trim().toLocaleLowerCase();
    const items = [...data.pages, ...data.entries].filter(item => !query || [item.title,item.summary,item.category,item.keywords].join(' ').toLocaleLowerCase().includes(query));
    results.innerHTML = items.length ? items.slice(0,25).map(item => `<a class="search-result" href="${escapeText(document.body.dataset.root + item.href)}"><span>${escapeText(item.title)}</span><small>${escapeText(item.kind || '页面')} ↗</small></a>`).join('') : '<p class="search-empty">没有找到相关内容，试试其他关键词。</p>';
  }
  function openSearch() { if (!dialog) return; lastFocus=document.activeElement; input.value=''; search(); dialog.showModal(); input.focus(); }
  document.querySelector('#search-open')?.addEventListener('click', openSearch);
  document.querySelector('#search-close')?.addEventListener('click', () => dialog.close());
  input?.addEventListener('input', search);
  dialog?.addEventListener('click', e => { if (e.target === dialog) { const r=dialog.getBoundingClientRect(); if (e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) dialog.close(); } });
  dialog?.addEventListener('close', () => lastFocus?.focus());
  document.addEventListener('keydown', e => { if ((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k') { e.preventDefault(); if (dialog.open) dialog.close(); else openSearch(); } });
  const filters = [...document.querySelectorAll('.filter-btn')];
  const searchInput = document.querySelector('#collection-search');
  const cards = [...document.querySelectorAll('[data-entry]')];
  const empty = document.querySelector('#collection-empty');
  const title = document.querySelector('#empty-title');
  const description = document.querySelector('#empty-description');
  const count = document.querySelector('#collection-count');
  const originalTitle = title?.textContent;
  const originalDescription = description?.textContent;
  let category = '全部';
  function updateCollection() {
    const query = searchInput?.value.trim().toLocaleLowerCase() || '';
    const visible = cards.filter(card => {
      const match = (category==='全部'||card.dataset.category===category) && (!query||card.textContent.toLocaleLowerCase().includes(query));
      card.hidden = !match;
      return match;
    });
    if (count) count.textContent = `共 ${visible.length} 条记录`;
    if (empty) empty.hidden=visible.length>0;
    if (title) title.textContent = query ? `没有找到“${searchInput.value.trim()}”` : category!=='全部' ? `还没有${category}` : originalTitle;
    if (description) description.textContent = query ? '试试其他关键词，或者清空搜索查看全部内容。' : category!=='全部' ? '这一栏先留空，后面有新的内容再慢慢补上。' : originalDescription;
  }
  filters.forEach(button => button.addEventListener('click', () => { category=button.dataset.filter; filters.forEach(b=>b.setAttribute('aria-pressed', String(b===button))); updateCollection(); }));
  searchInput?.addEventListener('input', updateCollection);
})();

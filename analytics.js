/* Paste your public GA4 web-stream measurement ID here. Never paste API secrets. */
const GA_MEASUREMENT_ID = '';

(() => {
  const configured = /^G-[A-Z0-9]+$/.test(GA_MEASUREMENT_ID);
  const preferenceKey = 'arc-analytics-consent';
  const panel = document.getElementById('analytics-consent');
  const settings = document.getElementById('analytics-settings');
  let enabled = false;
  let loaded = false;
  let activeTab = document.querySelector('.page.on')?.id || 'home';
  let lastTick = performance.now();
  let tabSeconds = 0;
  const projects = [...document.querySelectorAll('.wc')].map(card => ({
    card, video: card.querySelector('video'), name: card.querySelector('.wt').textContent,
    viewSeconds: 0, watchSeconds: 0, milestones: new Set()
  }));
  window.dataLayer = window.dataLayer || [];
  const gtag = (...args) => window.dataLayer.push(args);
  function event(name, params = {}) {
    if (enabled) gtag('event', name, { ...params, transport_type: 'beacon' });
  }
  function pageView() {
    event('page_view', {
      page_title: `${document.title} | ${activeTab}`,
      page_location: `${location.origin}${location.pathname}#${activeTab}`,
      tab_name: activeTab
    });
  }
  function sample() {
    const now = performance.now();
    const seconds = Math.min((now - lastTick) / 1000, 2);
    lastTick = now;
    if (!enabled || document.hidden) return;
    tabSeconds += seconds;
    if (activeTab !== 'works') return;
    projects.forEach(p => {
      const r = p.card.getBoundingClientRect();
      const visible = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
      if (visible >= Math.min(r.height, innerHeight) / 2) p.viewSeconds += seconds;
      if (!p.video.paused && !p.video.ended) p.watchSeconds += seconds;
    });
  }
  function flush() {
    if (tabSeconds > 0) event('tab_engagement', { tab_name: activeTab, active_seconds: +tabSeconds.toFixed(2) });
    tabSeconds = 0;
    projects.forEach(p => {
      if (p.viewSeconds > 0) event('project_view_time', { project_name: p.name, active_seconds: +p.viewSeconds.toFixed(2) });
      if (p.watchSeconds > 0) event('project_watch_time', { project_name: p.name, watch_seconds: +p.watchSeconds.toFixed(2) });
      p.viewSeconds = p.watchSeconds = 0;
    });
  }
  function enable() {
    enabled = true;
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = false;
    if (!loaded) {
      gtag('js', new Date());
      gtag('config', GA_MEASUREMENT_ID, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script);
      loaded = true;
    }
    lastTick = performance.now();
    pageView();
  }
  function store(value) { try { localStorage.setItem(preferenceKey, value); } catch {} }
  function choose(allow) {
    if (allow) { store('granted'); if (!enabled) enable(); }
    else {
      enabled = false;
      window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
      tabSeconds = 0;
      projects.forEach(p => { p.viewSeconds = p.watchSeconds = 0; p.milestones.clear(); });
      store('denied');
      // Remove GA cookies on this host and parent domains after withdrawal.
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.trim().split('=')[0];
        if (!/^_ga(?:_|$)/.test(name)) return;
        document.cookie = `${name}=; Max-Age=0; path=/`;
        const parts = location.hostname.split('.');
        for (let i = 0; i < parts.length - 1; i++) document.cookie = `${name}=; Max-Age=0; path=/; domain=.${parts.slice(i).join('.')}`;
      });
    }
    panel.hidden = true;
  }
  if (!configured) { panel.hidden = true; settings.hidden = true; return; }
  settings.hidden = false;
  settings.addEventListener('click', () => { panel.hidden = false; });
  document.getElementById('analytics-accept').addEventListener('click', () => choose(true));
  document.getElementById('analytics-decline').addEventListener('click', () => choose(false));
  let saved;
  try { saved = localStorage.getItem(preferenceKey); } catch {}
  panel.hidden = saved === 'granted' || saved === 'denied';
  if (saved === 'granted') enable();
  document.addEventListener('portfolio:tab', e => {
    sample(); flush(); activeTab = e.detail; lastTick = performance.now(); pageView();
    projects.forEach(p => { if (activeTab !== 'works') p.video.pause(); });
  });
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const url = new URL(link.href, location.href);
    if (!['https:', 'http:'].includes(url.protocol) || url.origin === location.origin) return;
    event('outbound_click', { link_url: url.origin + url.pathname, link_text: link.textContent.trim().replace(/\s+/g, ' ').slice(0, 100), tab_name: activeTab });
  });
  projects.forEach(p => {
    ['play', 'pause', 'ended'].forEach(action => p.video.addEventListener(action, () => {
      sample(); flush();
      if (action === 'play' && p.video.currentTime === 0) p.milestones.clear();
      event(`project_video_${action}`, { project_name: p.name, video_position: Math.round(p.video.currentTime) });
    }));
    p.video.addEventListener('timeupdate', () => {
      if (!enabled || !Number.isFinite(p.video.duration) || p.video.duration <= 0) return;
      const percent = p.video.currentTime / p.video.duration * 100;
      [25, 50, 75].forEach(mark => {
        if (percent >= mark && !p.milestones.has(mark)) {
          p.milestones.add(mark);
          event('project_video_progress', { project_name: p.name, video_percent: mark });
        }
      });
    });
  });
  document.addEventListener('visibilitychange', () => { flush(); lastTick = performance.now(); });
  window.addEventListener('pagehide', flush);
  setInterval(sample, 1000);
  setInterval(flush, 15000);
})();

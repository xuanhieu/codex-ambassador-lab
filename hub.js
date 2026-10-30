/* Hub page: theme + language toggles. No network, no third-party code.
 * Only non-sensitive preferences are stored (localStorage keys hub:theme, hub:lang). */
(function () {
  'use strict';
  var root = document.documentElement;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode: keep in memory */ } }
  };

  // Theme: apply a saved choice before first paint; otherwise CSS follows the OS setting.
  var savedTheme = store.get('hub:theme');
  if (savedTheme === 'dark' || savedTheme === 'light') root.setAttribute('data-theme', savedTheme);

  function currentTheme() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyLang(lang, nodes) {
    nodes.forEach(function (el) {
      if (!el.hasAttribute('data-en')) el.setAttribute('data-en', el.textContent);
      el.textContent = el.getAttribute(lang === 'vi' ? 'data-vi' : 'data-en');
    });
    root.setAttribute('lang', lang);
    var btn = document.getElementById('lang-toggle');
    btn.textContent = lang === 'vi' ? 'EN' : 'VI';
    btn.setAttribute('aria-label', btn.getAttribute(lang === 'vi' ? 'data-label-vi' : 'data-label-en'));
  }

  function syncThemeButton(btn) {
    var t = currentTheme();
    var vi = root.getAttribute('lang') === 'vi';
    btn.setAttribute('aria-label', t === 'dark'
      ? (vi ? 'Chuyển sang giao diện sáng' : 'Switch to light theme')
      : (vi ? 'Chuyển sang giao diện tối' : 'Switch to dark theme'));
  }

  document.addEventListener('DOMContentLoaded', function () {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-vi]'));
    var langBtn = document.getElementById('lang-toggle');
    var themeBtn = document.getElementById('theme-toggle');
    var lang = store.get('hub:lang') === 'vi' ? 'vi' : 'en';
    if (lang === 'vi') applyLang('vi', nodes);

    langBtn.hidden = false;
    themeBtn.hidden = false;
    syncThemeButton(themeBtn);

    langBtn.addEventListener('click', function () {
      lang = lang === 'vi' ? 'en' : 'vi';
      applyLang(lang, nodes);
      store.set('hub:lang', lang);
      syncThemeButton(themeBtn);
    });
    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      store.set('hub:theme', next);
      syncThemeButton(themeBtn);
    });
  });
})();

/* ================================================================
   单元测试教程 · 共享脚本：侧边栏、目录、代码标签页、高亮、主题
   ================================================================ */
(function () {
  'use strict';

  var CHAPTERS = [
    { n: 1,  t: '单元测试的目标',         d: '为什么要写测试，以及覆盖率为什么骗人', part: '第一部分 · 全局视角' },
    { n: 2,  t: '什么是单元测试',         d: '「隔离」的两种理解：经典学派与伦敦学派' },
    { n: 3,  t: '单元测试的结构',         d: 'AAA 模式、命名、夹具复用与参数化' },
    { n: 4,  t: '好测试的四大支柱',       d: '衡量任何一个测试的统一标尺', part: '第二部分 · 让测试为你工作' },
    { n: 5,  t: 'Mock 与测试脆弱性',      d: '可观察行为、实现细节与六边形架构' },
    { n: 6,  t: '单元测试的三种风格',     d: '基于输出、状态、通信，以及函数式架构' },
    { n: 7,  t: '重构出有价值的测试',     d: '四类代码、Humble Object 与领域事件' },
    { n: 8,  t: '为什么需要集成测试',     d: '受管与不受管依赖、接口、日志', part: '第三部分 · 集成测试' },
    { n: 9,  t: 'Mock 最佳实践',          d: '在系统边缘验证，用 Spy 代替 Mock' },
    { n: 10, t: '测试数据库',             d: '迁移、事务、测试数据生命周期' },
    { n: 11, t: '单元测试反模式',         d: '私有方法、代码污染、时间等常见陷阱', part: '第四部分 · 反模式' }
  ];

  var cur = parseInt(document.body.dataset.chapter || '0', 10);

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  /* ---------- 侧边栏 ---------- */
  var side = document.getElementById('sidebar');
  if (side) {
    var html = '<a class="brand" href="index.html"><span class="flame">&#10003;</span>' +
      '<span>单元测试图解教程<small>原则 · 实践 · 模式</small></span></a>';
    CHAPTERS.forEach(function (c) {
      if (c.part) html += '<div class="part">' + c.part + '</div>';
      html += '<a class="ch' + (c.n === cur ? ' active' : '') + '" href="ch' +
        pad(c.n) + '.html"><span class="n">' + c.n + '</span><span>' + c.t + '</span></a>';
    });
    side.innerHTML = html;
  }

  /* ---------- 移动端菜单 ---------- */
  var btn = document.createElement('button');
  btn.id = 'menu-btn';
  btn.type = 'button';
  btn.setAttribute('aria-label', '目录');
  btn.innerHTML = '&#9776;';
  btn.onclick = function () { document.body.classList.toggle('nav-open'); };
  document.body.appendChild(btn);
  document.addEventListener('click', function (e) {
    if (document.body.classList.contains('nav-open') &&
        side && !side.contains(e.target) && e.target !== btn) {
      document.body.classList.remove('nav-open');
    }
  });

  /* ---------- 主题切换 ---------- */
  var tbtn = document.createElement('button');
  tbtn.id = 'theme-btn';
  tbtn.type = 'button';
  tbtn.setAttribute('aria-label', '切换深浅色');
  tbtn.innerHTML = '&#9789;';
  tbtn.onclick = function () {
    var root = document.documentElement;
    var now = root.getAttribute('data-theme');
    var dark = now ? now === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', dark ? 'light' : 'dark');
    store('ut-doc-theme', dark ? 'light' : 'dark');
  };
  document.body.appendChild(tbtn);
  var saved = load('ut-doc-theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);

  /* ---------- 箭头 marker（全局一次） ---------- */
  // SVG marker 的内容不会从引用它的元素继承 color，所以每种颜色各定义一个。
  var defs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  defs.setAttribute('width', '0'); defs.setAttribute('height', '0');
  defs.setAttribute('style', 'position:absolute');
  defs.setAttribute('aria-hidden', 'true');
  var mk = '';
  [['ar', '--fg-faint'], ['ar-a', '--accent'], ['ar-b', '--blue'], ['ar-g', '--green'],
   ['ar-r', '--red'], ['ar-p', '--purple']].forEach(function (m) {
    mk += '<marker id="' + m[0] + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" ' +
      'markerHeight="7" orient="auto-start-reverse">' +
      '<path d="M0,0 L10,5 L0,10 z" fill="var(' + m[1] + ')"/></marker>';
  });
  defs.innerHTML = '<defs>' + mk + '</defs>';
  document.body.appendChild(defs);

  /* ---------- 章节内目录 ---------- */
  var main = document.querySelector('main');
  var slot = document.getElementById('chapter-toc');
  if (slot && main) {
    var hs = main.querySelectorAll('h2');
    if (hs.length > 2) {
      var t = '<div class="h">本章目录</div><ol>';
      hs.forEach(function (h, i) {
        if (!h.id) h.id = 'sec-' + (i + 1);
        t += '<li><a href="#' + h.id + '">' + h.textContent + '</a></li>';
      });
      slot.className = 'toc';
      slot.innerHTML = t + '</ol>';
    }
  }

  /* ---------- 语法高亮 ---------- */
  var KW_C = ('const|let|var|function|return|if|else|await|async|import|from|export|default|new|class|' +
    'extends|implements|for|while|of|in|do|try|catch|finally|throw|throws|switch|case|break|continue|' +
    'type|interface|enum|as|satisfies|typeof|instanceof|delete|void|yield|public|private|protected|' +
    'readonly|null|undefined|true|false|this|super|static|declare|namespace|final|abstract|package|' +
    'int|long|double|float|boolean|char|byte|record|string|number|unknown|never|any|bool|decimal|' +
    'using|override|virtual|internal|get|set').split('|');

  var KW_PY = ('def|class|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|import|from|' +
    'as|with|try|except|finally|raise|pass|lambda|yield|assert|self|cls|async|await|global|nonlocal|' +
    'del|break|continue|match|case').split('|');

  var RE_C = new RegExp(
    '(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*)' +                        // 1 注释
    '|(`(?:\\\\[\\s\\S]|[^\\\\`])*`|\'(?:\\\\[\\s\\S]|[^\\\\\'\\n])*\'|"(?:\\\\[\\s\\S]|[^\\\\"\\n])*")' + // 2 字符串
    '|(@[A-Za-z_][\\w.]*)' +                                           // 3 注解
    '|\\b(' + KW_C.join('|') + ')\\b' +                                // 4 关键字
    '|\\b([A-Z][A-Za-z0-9_]*)\\b' +                                    // 5 类型
    '|\\b(\\d[\\d_]*(?:\\.\\d+)?[LlFfDd]?)\\b' +                       // 6 数字
    '|\\b([a-zA-Z_$][\\w$]*)(?=\\()',                                  // 7 函数调用
    'g');
  var CL_C = ['tk-cm', 'tk-st', 'tk-an', 'tk-kw', 'tk-tp', 'tk-nm', 'tk-fn'];

  var RE_PY = new RegExp(
    '(#[^\\n]*)' +                                                     // 1 注释
    '|((?:[fFrRbB]{1,2})?(?:"""[\\s\\S]*?"""|\'\'\'[\\s\\S]*?\'\'\'|"(?:\\\\.|[^"\\\\\\n])*"|\'(?:\\\\.|[^\'\\\\\\n])*\'))' + // 2 字符串
    '|(@[A-Za-z_][\\w.]*)' +                                           // 3 装饰器
    '|\\b(' + KW_PY.join('|') + ')\\b' +                               // 4 关键字
    '|\\b([A-Z][A-Za-z0-9_]*)\\b' +                                    // 5 类型
    '|\\b(\\d[\\d_]*(?:\\.\\d+)?)\\b' +                                // 6 数字
    '|\\b([a-zA-Z_][\\w]*)(?=\\()',                                    // 7 函数调用
    'g');

  var RE_SH = /(#[^\n]*)|('(?:\\[\s\S]|[^\\'])*'|"(?:\\[\s\S]|[^\\"])*")|\b(npm|npx|pnpm|mvn|gradle|pip|pytest|python|java|node|git|cd|mkdir|docker|vitest)\b/g;
  var RE_SQL = /(--[^\n]*)|('(?:''|[^'])*')|\b(SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|ADD|DROP|COLUMN|PRIMARY|KEY|NOT|NULL|AND|OR|BEGIN|COMMIT|ROLLBACK|TRANSACTION|INT|BIGINT|VARCHAR|NVARCHAR|BIT|IDENTITY|DEFAULT|REFERENCES|FOREIGN|EXEC|GO)\b/g;

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function paint(src, re, classes) {
    var out = '', last = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(src)) !== null) {
      out += esc(src.slice(last, m.index));
      for (var g = 1; g < m.length; g++) {
        if (m[g] !== undefined) { out += '<span class="' + classes[g - 1] + '">' + esc(m[g]) + '</span>'; break; }
      }
      last = m.index + m[0].length;
      if (m[0].length === 0) re.lastIndex++;
    }
    return out + esc(src.slice(last));
  }

  var LABEL = { java: 'Java', python: 'Python', py: 'Python', ts: 'TypeScript', csharp: 'C#',
                sql: 'SQL', bash: 'Shell', text: '', pseudo: '伪代码' };
  var NOTE = { java: 'JUnit 5 · AssertJ · Mockito', python: 'pytest · unittest.mock', ts: 'Vitest' };

  document.querySelectorAll('.code').forEach(function (box) {
    var pre = box.querySelector('pre');
    if (!pre) return;
    var lang = box.dataset.lang || '';
    var file = box.dataset.file || '';
    var inTabs = box.parentNode.classList.contains('tabs');
    var bar = document.createElement('div');
    bar.className = 'bar';
    var tag = file || (inTabs ? (NOTE[lang] || lang) : (LABEL[lang] !== undefined ? LABEL[lang] : lang)) || 'code';
    bar.innerHTML = '<span class="tag">' + esc(tag) + '</span>';
    var cp = document.createElement('button');
    cp.className = 'copy'; cp.type = 'button'; cp.textContent = '复制';
    cp.onclick = function () {
      var txt = pre.textContent;
      if (navigator.clipboard) navigator.clipboard.writeText(txt);
      cp.textContent = '已复制'; setTimeout(function () { cp.textContent = '复制'; }, 1400);
    };
    bar.appendChild(cp);
    box.insertBefore(bar, pre);

    var code = pre.textContent.replace(/^\n/, '').replace(/\s+$/, '');
    if (lang === 'python' || lang === 'py') {
      pre.innerHTML = paint(code, RE_PY, CL_C);
    } else if (lang === 'bash' || lang === 'sh' || lang === 'shell') {
      pre.innerHTML = paint(code, RE_SH, ['tk-cm', 'tk-st', 'tk-kw']);
    } else if (lang === 'sql') {
      pre.innerHTML = paint(code, RE_SQL, ['tk-cm', 'tk-st', 'tk-kw']);
    } else if (lang === 'text') {
      pre.innerHTML = esc(code);
    } else {
      pre.innerHTML = paint(code, RE_C, CL_C);
    }
  });

  /* ---------- 多语言标签页：选一次，全站记住 ---------- */
  var groups = [];
  function pick(lang, remember) {
    groups.forEach(function (g) {
      var has = g.panes.some(function (p) { return p.dataset.lang === lang; });
      var use = has ? lang : g.panes[0].dataset.lang;
      g.panes.forEach(function (p) { p.classList.toggle('on', p.dataset.lang === use); });
      g.btns.forEach(function (b) {
        var on = b.dataset.lang === use;
        b.classList.toggle('on', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    });
    if (remember) store('ut-doc-lang', lang);
  }
  document.querySelectorAll('.tabs').forEach(function (tabs) {
    var panes = Array.prototype.filter.call(tabs.children, function (c) {
      return c.classList.contains('code');
    });
    if (!panes.length) return;
    var barEl = document.createElement('div');
    barEl.className = 'tabbar';
    barEl.setAttribute('role', 'tablist');
    var btns = panes.map(function (p) {
      var b = document.createElement('button');
      b.type = 'button';
      b.dataset.lang = p.dataset.lang;
      b.setAttribute('role', 'tab');
      b.textContent = LABEL[p.dataset.lang] || p.dataset.lang;
      b.onclick = function () {
        // 切换后保持当前代码块在视口里的位置，避免其他代码块高度变化造成跳动
        var before = tabs.getBoundingClientRect().top;
        pick(p.dataset.lang, true);
        window.scrollBy(0, tabs.getBoundingClientRect().top - before);
      };
      barEl.appendChild(b);
      return b;
    });
    tabs.insertBefore(barEl, tabs.firstChild);
    tabs.classList.add('js');
    groups.push({ panes: panes, btns: btns });
  });
  if (groups.length) pick(load('ut-doc-lang') || 'java', false);

  /* ---------- 上一章 / 下一章 ---------- */
  var pager = document.getElementById('pager');
  if (pager && cur) {
    var prev = CHAPTERS.find(function (c) { return c.n === cur - 1; });
    var next = CHAPTERS.find(function (c) { return c.n === cur + 1; });
    var h = '';
    h += prev ? '<a class="prev" href="ch' + pad(prev.n) + '.html"><span>&larr; 上一章</span>第 ' + prev.n + ' 章 · ' + prev.t + '</a>'
              : '<a class="prev" href="index.html"><span>&larr; 返回</span>课程首页</a>';
    h += next ? '<a class="next" href="ch' + pad(next.n) + '.html"><span>下一章 &rarr;</span>第 ' + next.n + ' 章 · ' + next.t + '</a>'
              : '<a class="next" href="index.html"><span>读完了 &rarr;</span>回到课程首页</a>';
    pager.className = 'pager';
    pager.innerHTML = h;
  }

  /* ---------- 首页目录 ---------- */
  var grid = document.getElementById('toc-grid');
  if (grid) {
    var g = '';
    CHAPTERS.forEach(function (c) {
      if (c.part) g += '<div class="toc-part">' + c.part + '</div>';
      g += '<a class="toc-card" href="ch' + pad(c.n) + '.html">' +
        '<div class="n">第 ' + c.n + ' 章</div>' +
        '<div class="t">' + c.t + '</div>' +
        '<div class="d">' + c.d + '</div></a>';
    });
    grid.className = 'toc-grid';
    grid.innerHTML = g;
  }

  // 侧边栏滚到当前章节（放最后，避免影响主内容的锚点定位）
  if (side) {
    var active = side.querySelector('a.ch.active');
    if (active && active.offsetTop > side.clientHeight - 80) side.scrollTop = active.offsetTop - 120;
  }
})();

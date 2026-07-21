import React, { useEffect, useRef, useState } from "react";

/* ============================================================
   Sendify 帮助中心 — 首页组件（移植自 dingtalk-docs）
   - 由 /index.mdx 使用
   - 样式位于 /style.css 的 .dt-home 命名空间下
   - NOTE: Mintlify 的 .jsx snippet 编译器按 MDX 处理文件，
     模块级 const 在运行时不一定能被导出组件访问到 —
     只有唯一的 export（Home）可靠。因此本页所需的一切
     （图标、含 hooks 的子组件、工具函数）都放在 Home 闭包内。
   ============================================================ */

export const Home = ({ t, arts, hot }) => {
  /* ---- Mintlify 搜索触发 ----
     openSearchWithQuery("") -> 打开内置搜索弹窗（空状态）。
     openSearchWithQuery("foo") -> 打开 + 预填 "foo" 并触发 React 的
     onChange，让 Mintlify 立即执行搜索并渲染结果。
     Mintlify 通过 React portal 渲染弹窗，因此轮询若干帧等待其
     <input> 挂载，再用原型 value setter 让 React 感知程序化赋值。 */
  const openSearchWithQuery = (query) => {
    if (typeof document === "undefined") return;
    if (openSearchWithQuery._lock) return;
    openSearchWithQuery._lock = true;
    setTimeout(() => { openSearchWithQuery._lock = false; }, 300);

    const btn = document.querySelector(
      'button[id*="search-bar-entry"], button[aria-label*="Search" i], [data-search-trigger]'
    );
    if (btn) {
      btn.click();
    } else {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "k",
          code: "KeyK",
          metaKey: isMac,
          ctrlKey: !isMac,
          bubbles: true,
        })
      );
    }

    const trimmed = (query || "").trim();
    if (!trimmed) return;

    let tries = 0;
    const maxTries = 18;
    const tick = () => {
      tries++;
      const input =
        document.querySelector("#search-input") ||
        document.querySelector('[role="dialog"] input[role="combobox"]') ||
        document.querySelector('[role="dialog"] input');
      if (input) {
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value"
        ).set;
        setter.call(input, trimmed);
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.focus();
        try {
          input.setSelectionRange(trimmed.length, trimmed.length);
        } catch (_) {}
        return;
      }
      if (tries < maxTries) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  /* ---- 定位 + 遮罩 Mintlify 内置搜索弹窗。
     Mintlify 在 <body> 用 portal 渲染：固定全屏滚动容器（弹窗父级）>
     实际面板，外加一个兄弟遮罩层。给容器打 .dt-search-portal 把面板
     钉在上三分之一处，给遮罩打 .dt-search-backdrop 按主题重新着色，
     再加 body.dt-search-open 把自定义首页 header 压到 Mintlify z-40
     遮罩之下（否则默认 z-50 会亮浮在遮罩上方），header 保持可见但
     和页面其余部分一样被压暗。选择器避开 Mintlify 内部 Tailwind
     class，以承受其 DOM 变动。

     MutationObserver 统一所有打开路径（hero 按钮 / 热门标签 / ⌘K /
     Ctrl+K）：挂载时定位、着色遮罩、聚焦输入框并锁定 body 滚动；
     卸载时全部还原。 */
  useEffect(() => {
    if (typeof document === "undefined") return;
    const id = "dt-home-search-overrides";
    let styleEl = document.getElementById(id);
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = id;
      styleEl.textContent = `
        /* 面板钉在上三分之一（距顶约 16vh），死居中会显得偏低。
           flex-start + padding-top 让长结果列表在容器内滚动而非裁切。 */
        .dt-search-portal {
          display: flex !important;
          align-items: flex-start !important;
          justify-content: center !important;
          padding-top: 16vh !important;
        }
        /* flex 布局会把面板收缩到内容宽度；恢复整宽让输入框与文档页
           搜索框一致（面板自带 max-width:640px，移动端仍然自适应）。 */
        .dt-search-portal > [role="dialog"] {
          width: 100% !important;
        }
        /* 重新着色 Mintlify 遮罩：默认 0.4 黑在浅色模式下太淡，
           深色模式下面板对比度也不足。 */
        .dt-search-backdrop {
          background-color: rgba(2, 6, 23, 0.72) !important;
        }
        html.dark .dt-search-backdrop {
          background-color: rgba(0, 0, 0, 0.82) !important;
        }
        body.dt-search-open .dt-home-header {
          z-index: 0 !important;
        }
      `;
      document.head.appendChild(styleEl);
    }

    /* Mintlify 会常驻挂载 Ask Assistant 弹层（#chat-assistant-sheet，
       role="dialog" 且含 input），必须排除，否则页面一加载就会被误判为
       "搜索弹窗已打开"，body 被加上 dt-search-open，header 的 z-index
       被压成 0，导致移动端汉堡菜单面板被页面内容盖住。 */
    const isSearchDialog = (node) =>
      node && node.nodeType === 1 &&
      typeof node.matches === "function" &&
      node.matches('[role="dialog"]') &&
      node.id !== "chat-assistant-sheet" &&
      !node.closest("#chat-assistant-sheet") &&
      !!node.querySelector("input");

    const findSearchDialog = (root) => {
      if (isSearchDialog(root)) return root;
      if (root && root.nodeType === 1 && typeof root.querySelectorAll === "function") {
        for (const inner of root.querySelectorAll('[role="dialog"]')) {
          if (isSearchDialog(inner)) return inner;
        }
      }
      return null;
    };

    const onOpen = (dialog) => {
      const container = dialog.parentElement;
      if (container) {
        container.classList.add("dt-search-portal");
        // 遮罩是容器的兄弟节点：背景色非透明的那个 portal 子节点。
        // 打上标记以便 CSS 重新着色。
        const portalRoot = container.parentElement;
        if (portalRoot) {
          for (const c of portalRoot.children) {
            if (c === container) continue;
            const bg = getComputedStyle(c).backgroundColor;
            if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
              c.classList.add("dt-search-backdrop");
              break;
            }
          }
        }
      }
      document.body.classList.add("dt-search-open");
      document.body.style.overflow = "hidden";
      const focusInput = () => {
        const input =
          document.querySelector("#search-input") ||
          dialog.querySelector('input[role="combobox"], input');
        if (input && document.activeElement !== input) input.focus();
      };
      focusInput();
      requestAnimationFrame(focusInput);
    };
    const onClose = () => {
      document.body.classList.remove("dt-search-open");
      document.body.style.overflow = "";
      document
        .querySelectorAll(".dt-search-portal")
        .forEach((el) => el.classList.remove("dt-search-portal"));
      document
        .querySelectorAll(".dt-search-backdrop")
        .forEach((el) => el.classList.remove("dt-search-backdrop"));
    };

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          const d = findSearchDialog(node);
          if (d) onOpen(d);
        }
        for (const node of m.removedNodes) {
          const d = findSearchDialog(node);
          if (d) onClose();
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const existing = findSearchDialog(document.body);
    if (existing) onOpen(existing);

    return () => {
      observer.disconnect();
      onClose();
      const found = document.getElementById(id);
      if (found) found.remove();
    };
  }, []);

  /* ---- ?q= 深链处理 ----
     外部链接携带 ?q=foo 落地本页时，自动打开内置搜索弹窗并预填查询。 */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) openSearchWithQuery(q);
  }, []);

  /* ---- ParticleCanvas（闭包内子组件） ---- */
  const ParticleCanvas = () => {
    const ref = useRef(null);
    useEffect(() => {
      if (typeof window === "undefined") return;
      const canvas = ref.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const reduce =
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const CFG = {
        count: 75,
        spread: 19,
        speed: 0.1,
        baseSize: 120,
        sizeRandomness: 1,
        cameraDistance: 20,
        hover: true,
        hoverFactor: 1,
        rotate: !reduce,
        colors: ["#635bff", "#7c74ff", "#b3aeff"],
      };
      let W = 0, H = 0, DPR = 1, cx = 0, cy = 0, proj = 1;
      const resize = () => {
        const r = canvas.getBoundingClientRect();
        DPR = Math.min(window.devicePixelRatio || 1, 2);
        W = Math.max(1, r.width);
        H = Math.max(1, r.height);
        canvas.width = W * DPR;
        canvas.height = H * DPR;
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        cx = W / 2;
        cy = H / 2;
        proj = Math.min(W, H) * 0.085;
      };
      const rand = (a, b) => a + Math.random() * (b - a);
      const half = CFG.spread / 2;
      const particles = Array.from({ length: CFG.count }, () => ({
        x: rand(-half, half),
        y: rand(-half, half),
        z: rand(-half, half),
        sizeF: 1 + (Math.random() - 0.5) * CFG.sizeRandomness,
        phase: Math.random() * Math.PI * 2,
        color: CFG.colors[(Math.random() * CFG.colors.length) | 0],
      }));
      const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
      const hero = canvas.closest(".dt-home-hero") || canvas.parentElement;
      const onMove = (e) => {
        const r = hero.getBoundingClientRect();
        mouse.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        mouse.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      };
      const onLeave = () => {
        mouse.tx = 0;
        mouse.ty = 0;
      };
      if (CFG.hover && hero) {
        hero.addEventListener("mousemove", onMove);
        hero.addEventListener("mouseleave", onLeave);
      }
      let raf = 0, t = 0, last = performance.now();
      const frame = (now) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        t += dt * CFG.speed;
        mouse.x += (mouse.tx - mouse.x) * 0.06;
        mouse.y += (mouse.ty - mouse.y) * 0.06;
        const ay = CFG.rotate ? t * 0.6 : 0;
        const ax = CFG.rotate ? t * 0.25 : 0;
        const cosY = Math.cos(ay), sinY = Math.sin(ay);
        const cosX = Math.cos(ax), sinX = Math.sin(ax);
        const hx = mouse.x * CFG.hoverFactor * 1.4;
        const hy = mouse.y * CFG.hoverFactor * 1.4;
        ctx.clearRect(0, 0, W, H);
        const list = [];
        for (const p of particles) {
          const wob = 0.35;
          let x = p.x + Math.sin(t * 1.3 + p.phase) * wob;
          let y = p.y + Math.cos(t * 1.1 + p.phase) * wob;
          let z = p.z;
          let x1 = x * cosY - z * sinY, z1 = x * sinY + z * cosY;
          let y1 = y * cosX - z1 * sinX, z2 = y * sinX + z1 * cosX;
          const f = CFG.cameraDistance / (CFG.cameraDistance + z2);
          const depth = (z2 + half) / CFG.spread;
          const sx = cx + (x1 + hx * f) * proj * f;
          const sy = cy + (y1 + hy * f) * proj * f;
          const r = (CFG.baseSize / 20) * f * p.sizeF * (Math.min(W, H) / 900);
          const op = Math.max(0.05, Math.min(0.7, 0.12 + depth * 0.62));
          list.push({ sx, sy, r, op, z2, color: p.color });
        }
        list.sort((a, b) => b.z2 - a.z2);
        for (const d of list) {
          if (d.r <= 0.2) continue;
          ctx.globalAlpha = d.op;
          ctx.fillStyle = d.color;
          ctx.beginPath();
          ctx.arc(d.sx, d.sy, d.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        raf = requestAnimationFrame(frame);
      };
      resize();
      window.addEventListener("resize", resize);
      raf = requestAnimationFrame(frame);
      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
        if (hero) {
          hero.removeEventListener("mousemove", onMove);
          hero.removeEventListener("mouseleave", onLeave);
        }
      };
    }, []);
    return <canvas ref={ref} className="dt-home-particle-canvas" />;
  };

  /* ---- SearchBar ----
     Hero 搜索框。本地 val 状态保存输入文本。提交（回车 / 点搜索按钮）
     调用 openSearchWithQuery(val) 打开 Mintlify 内置弹窗并预填查询。
     热门标签同理。 */
  const SearchBar = () => {
    const [val, setVal] = useState("");
    const submit = () => openSearchWithQuery(val);
    const isMac =
      typeof navigator !== "undefined" &&
      navigator.platform.toLowerCase().includes("mac");
    const kbdHint = isMac ? "⌘K" : "Ctrl+K";
    return (
      <div className="dt-home-search">
        <div className="dt-home-search-box" role="search">
          <svg
            className="dt-home-search-ic"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.2-3.2" />
          </svg>
          <input
            type="text"
            role="searchbox"
            aria-label={t.ph}
            value={val}
            placeholder={t.ph}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <kbd
            aria-hidden="true"
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: "11.5px",
              fontWeight: 600,
              color: "var(--ink-3)",
              background: "var(--surface-2, rgba(15, 23, 42, 0.06))",
              border: "1px solid var(--line)",
              borderRadius: "5px",
              padding: "2px 6px",
              flex: "none",
              letterSpacing: "0.02em",
              userSelect: "none",
            }}
          >
            {kbdHint}
          </kbd>
          <button
            type="button"
            className="dt-home-search-go"
            aria-label={t.search_btn}
            onClick={(e) => {
              e.stopPropagation();
              submit();
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              style={{ display: "inline-block", verticalAlign: "-2px" }}
              aria-hidden="true"
            >
              <path d="M5 12h14m-6-6 6 6-6 6" />
            </svg>{" "}
            <span>{t.search_btn}</span>
          </button>
        </div>
      </div>
    );
  };

  /* ---- 热门标签（无状态，放在 SearchBar 外以免被
     .dt-home-search 的 max-width: 620px 限宽） ---- */
  const renderHotTags = () => (
    <div className="dt-home-hot">
      <span className="dt-home-hot-label">{t.hot_label}</span>
      {hot.map((tag, i) => (
        <a
          key={i}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            openSearchWithQuery(tag);
          }}
        >
          {tag}
        </a>
      ))}
    </div>
  );

  const homeHref = "/";
  const supportMail = "mailto:sendify-support@dingmail.work";

  /* ---- NavMenu（移动端汉堡菜单） ----
     桌面端内联导航 .dt-home-nav-links 在 ≤900px 隐藏（见 style.css）；
     此汉堡菜单在下拉面板中恢复这些链接 + 联系客服 CTA。 */
  const NavMenu = () => {
    const [open, setOpen] = useState(false);
    useEffect(() => {
      if (!open) return;
      const onDoc = (e) => {
        if (!e.target.closest(".dt-home-navmenu")) setOpen(false);
      };
      const onKey = (e) => {
        if (e.key === "Escape") setOpen(false);
      };
      document.addEventListener("click", onDoc);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("click", onDoc);
        document.removeEventListener("keydown", onKey);
      };
    }, [open]);
    return (
      <div className={`dt-home-navmenu${open ? " dt-home-navmenu-open" : ""}`}>
        <button
          type="button"
          className="dt-home-nav-burger"
          aria-haspopup="true"
          aria-expanded={open ? "true" : "false"}
          aria-label="Menu"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="dt-home-nav-panel" role="menu">
          <a href="#popular" role="menuitem" onClick={() => setOpen(false)}>
            {t.nav1}
          </a>
          <a href={supportMail} role="menuitem" onClick={() => setOpen(false)}>
            {t.nav4}
          </a>
          <a
            href={supportMail}
            role="menuitem"
            className="dt-home-nav-panel-cta"
            onClick={() => setOpen(false)}
          >
            {t.contact}
          </a>
        </div>
      </div>
    );
  };

  /* ---- Header（替代 Mintlify navbar；navbar 由 style.css 隐藏） ---- */
  const renderHeader = () => (
    <header className="dt-home-header">
      <nav className="dt-home-nav">
        <a href={homeHref} className="dt-home-brand">
          <span className="dt-home-brand-logo" aria-label="Sendify" />
          <small className="dt-home-brand-sub">{t.brand_sub}</small>
        </a>
        <div className="dt-home-nav-links">
          <a href="#popular">{t.nav1}</a>
          <a href={supportMail}>{t.nav4}</a>
        </div>
        <div className="dt-home-nav-right">
          <a href={supportMail} className="dt-home-btn-primary">
            {t.contact}
          </a>
          {React.createElement(NavMenu)}
        </div>
      </nav>
    </header>
  );

  /* ---- 各区块渲染 ---- */
  const renderHero = () => (
    <div className="dt-home-hero">
      <div className="dt-home-hero-bg">{React.createElement(ParticleCanvas)}</div>
      <div className="dt-home-hero-scrim" />
      <div className="dt-home-hero-inner">
        <span className="dt-home-eyebrow">
          <span className="dt-home-eyebrow-dot" />
          <span>{t.status}</span>
        </span>
        <h1 className="dt-home-hero-title">{t.title}</h1>
        <p className="dt-home-hero-sub">{t.subtitle}</p>
        {React.createElement(SearchBar)}
        {renderHotTags()}
      </div>
    </div>
  );

  const renderPopularArticles = () => (
    <section className="dt-home-popular" id="popular">
      <div className="dt-home-wrap dt-home-block">
        <div className="dt-home-sec-head">
          <div>
            <h2>{t.pop_title}</h2>
            <p>{t.pop_sub}</p>
          </div>
        </div>
        <div className="dt-home-art-grid">
          {arts.map((a, i) => (
            <a key={i} className="dt-home-art" href={`/${a.slug}`}>
              <span className="dt-home-art-num">{i + 1}</span>
              <span className="dt-home-art-info">
                <h4>{a.t}</h4>
                <span className="dt-home-art-tag">{a.tag}</span>
              </span>
              <svg
                className="dt-home-art-arr"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </section>
  );

  const renderSupportCTA = () => (
    <section className="dt-home-block dt-home-wrap" id="support">
      <div className="dt-home-support">
        <div className="dt-home-support-txt">
          <h2>{t.sup_title}</h2>
          <p>{t.sup_sub}</p>
        </div>
        <div className="dt-home-support-acts">
          <a href={supportMail} className="dt-home-support-s1">
            {t.sup_b1}
          </a>
          <a href={supportMail} className="dt-home-support-s2">
            {t.sup_b2}
          </a>
        </div>
      </div>
    </section>
  );

  /* Footer 链接暂沿用 dingtalk-docs 的内容占位，后续手工替换为
     Sendify 官方链接。 */
  const mkt = (path) => "https://www.dingtalk.io" + path;

  const renderHomeFooter = () => (
    <footer className="dt-home-footer">
      <div className="dt-home-wrap dt-home-foot">
        <div>
          <a href={homeHref} className="dt-home-foot-brand" aria-label="Sendify" />
          <p className="dt-home-foot-tagline">{t.foot_tag}</p>
        </div>
        <div>
          <h5>{t.foot_h1}</h5>
          <ul>
            <li><a href={mkt("/products/dingtalk-im/")} target="_blank" rel="noopener noreferrer">{t.foot_p1}</a></li>
            <li><a href={mkt("/products/dingtalk-meeting/")} target="_blank" rel="noopener noreferrer">{t.foot_p2}</a></li>
            <li><a href={mkt("/products/dingtalk-document/")} target="_blank" rel="noopener noreferrer">{t.foot_p3}</a></li>
            <li><a href={mkt("/products/ai-table/")} target="_blank" rel="noopener noreferrer">{t.foot_p4}</a></li>
          </ul>
        </div>
        <div>
          <h5>{t.foot_h2}</h5>
          <ul>
            <li><a href={mkt("/#pricing")} target="_blank" rel="noopener noreferrer">{t.foot_s1}</a></li>
            <li><a href={supportMail}>{t.foot_s2}</a></li>
            <li><a href={homeHref}>{t.foot_s3}</a></li>
            <li><a href={mkt("/blog/")} target="_blank" rel="noopener noreferrer">{t.foot_s4}</a></li>
          </ul>
        </div>
        <div>
          <h5>{t.foot_h3}</h5>
          <ul>
            <li><a href={mkt("/blog/")} target="_blank" rel="noopener noreferrer">{t.foot_r1}</a></li>
            <li><a href={mkt("/qa/")} target="_blank" rel="noopener noreferrer">{t.foot_r2}</a></li>
            <li><a href={mkt("/#customer-cases")} target="_blank" rel="noopener noreferrer">{t.foot_r3}</a></li>
            <li><a href={mkt("/download/")} target="_blank" rel="noopener noreferrer">{t.foot_r4}</a></li>
          </ul>
        </div>
      </div>
      <div className="dt-home-foot-bottom">
        <span>© 2026 Sendify. {t.rights}</span>
        <span style={{ display: "flex", gap: "20px" }}>
          <a href={mkt("/privacy-policy/")} target="_blank" rel="noopener noreferrer">{t.legal1}</a>
          <a href={mkt("/terms-of-service/")} target="_blank" rel="noopener noreferrer">{t.legal2}</a>
        </span>
      </div>
    </footer>
  );

  return (
    <div className="dt-home">
      {renderHeader()}
      {renderHero()}
      {renderPopularArticles()}
      {renderSupportCTA()}
      {renderHomeFooter()}
    </div>
  );
};

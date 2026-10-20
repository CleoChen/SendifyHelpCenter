/* Sendify 帮助中心首页。样式位于 /style.css 的 .dt-home 命名空间。 */

export const Home = ({ t, arts, hot, journeys, searchItems = arts, locale = "cn" }) => {
  const isEnglish = locale === "en";
  const localePrefix = isEnglish ? "/en" : "";
  const pageHref = (slug) => `${localePrefix}/${slug}`;
  const helpCenterHref = isEnglish ? "/en/index" : "/";
  const ui = isEnglish
    ? {
        searchFound: (count) => `${count} relevant ${count === 1 ? "article" : "articles"} found`,
        searchEmpty: "No relevant articles found",
        home: "Home",
        pricing: "Pricing",
        contactUs: "Contact us",
        helpCenter: "Help Center",
        openMenu: "Open navigation menu",
        clearSearch: "Clear search",
        quickStart: "Quick start",
        journeyTitle: "Follow the path to the answer you need",
        journeyDescription: "Move from setup to performance analysis with task-based guides.",
        viewGuide: "View guide",
        developerAccess: "Developer access",
        developerTitle: "Choose the integration that fits your workflow",
        developerDescription: "Build with the Open API or let AI assistants query Sendify data securely through MCP.",
        apiDescription: "Use a Bearer API Key to automate campaigns and contact workflows.",
        apiLink: "View API docs",
        mcpDescription: "Connect Codex, Cursor, or Claude and query campaigns and contacts in natural language.",
        mcpLink: "Connect MCP",
        commonGuides: "Popular guides",
        allGuides: "View all guides",
        moreQuestions: "Still have questions?",
        supportEmail: "Support email",
        contact: "Contact us",
        resources: "Resources",
        legal: "Legal",
        privacy: "Privacy Policy",
        terms: "Terms of Service",
        sla: "Service Level Agreement",
        footerCopyright: (year) => `Alibaba DingTalk © ${year} DingTalk (China) Information Technology Co., Ltd. and/or its affiliates. All rights reserved.`,
      }
    : {
        searchFound: (count) => `找到 ${count} 篇相关内容`,
        searchEmpty: "暂未找到相关内容",
        home: "首页",
        pricing: "价格",
        contactUs: "联系我们",
        helpCenter: "帮助中心",
        openMenu: "打开导航菜单",
        clearSearch: "清空搜索",
        quickStart: "快速开始",
        journeyTitle: "沿着使用路径，找到需要的答案",
        journeyDescription: "从基础配置到效果分析，按任务阶段快速进入对应指南。",
        viewGuide: "查看指南",
        developerAccess: "开发者接入",
        developerTitle: "选择适合你的集成方式",
        developerDescription: "通过 Open API 构建业务集成，或让 AI 助手用 MCP 安全查询 Sendify 数据。",
        apiDescription: "使用 Bearer API Key 调用联系人等接口，构建自动化工作流。",
        apiLink: "查看 API 文档",
        mcpDescription: "连接 Codex、Cursor 或 Claude，用自然语言查询营销活动与联系人。",
        mcpLink: "开始接入 MCP",
        commonGuides: "常用指南",
        allGuides: "查看全部指南",
        moreQuestions: "还有疑问？",
        supportEmail: "联系邮箱",
        contact: "联系我们",
        resources: "资源",
        legal: "法律协议",
        privacy: "隐私政策",
        terms: "服务协议",
        sla: "服务等级协议",
        footerCopyright: (year) => `阿里钉钉 ©版权公告 © ${year} 钉钉（中国）信息技术有限公司/或其关联公司版权所有`,
      };
  const applySearchQuery = (query, focus = false) => {
    if (typeof document === "undefined") return;
    const input = document.getElementById("home-search-input");
    const panel = document.getElementById("home-search-results");
    const summary = document.getElementById("home-search-summary");
    const submit = document.getElementById("home-search-submit");
    if (!input || !panel || !summary || !submit) return;

    const normalizedQuery = query.trim().toLocaleLowerCase(isEnglish ? "en" : "zh-CN");
    let visibleCount = 0;
    input.value = query;
    input.setAttribute("aria-expanded", String(Boolean(normalizedQuery)));

    panel.querySelectorAll("[data-search-item]").forEach((item) => {
      const matches =
        Boolean(normalizedQuery) &&
        item.dataset.searchText.includes(normalizedQuery) &&
        visibleCount < 6;
      item.hidden = !matches;
      if (matches) visibleCount += 1;
    });

    panel.hidden = !normalizedQuery;
    submit.disabled = visibleCount === 0;
    summary.textContent = visibleCount
      ? ui.searchFound(visibleCount)
      : ui.searchEmpty;
    if (focus) requestAnimationFrame(() => input.focus());
  };

  const productDocsHref = pageHref("getting-started");
  const apiDocsHref = pageHref("developer/overview");
  const mcpDocsHref = pageHref("mcp/overview");
  const websiteHref = "https://www.sendify.dingstore.cn/";
  const pricingHref = "https://www.sendify.dingstore.cn/pricing";
  const websiteContactHref = "https://www.sendify.dingstore.cn/contact-us";
  const supportEmail = "sendify-support@dingmail.work";
  const supportMail = `mailto:${supportEmail}`;
  const currentYear = new Date().getFullYear();
  const legalLinks = [
    [
      ui.privacy,
      "https://terms.alicdn.com/legal-agreement/terms/privacy_policy_full/20250320112834560/20250320112834560.html",
    ],
    [
      ui.terms,
      "https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20250320110123957/20250320110123957.html",
    ],
    [
      ui.sla,
      "https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20250320143730445/20250320143730445.html",
    ],
  ];

  const SearchIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.4-3.4" />
    </svg>
  );

  const ArrowIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 12h14m-5-5 5 5-5 5" />
    </svg>
  );

  const JourneyIcon = ({ name }) => {
    if (name === "domain") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="3.5" y="5" width="17" height="14" rx="3" />
          <path d="m5.5 8 6.5 5 6.5-5" />
        </svg>
      );
    }
    if (name === "contacts") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="12" cy="8" r="3" />
          <path d="M5.5 19c.8-3.7 3-5.5 6.5-5.5s5.7 1.8 6.5 5.5" />
          <path d="M18.5 7.5h2m-1-1v2" />
        </svg>
      );
    }
    if (name === "send") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="m21 3-8 18-2.5-7.5L3 11l18-8Z" />
          <path d="m10.5 13.5 4-4" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M5 19V9m5 10V5m5 14v-7m4 7V3" />
        <path d="M3 19h18" />
      </svg>
    );
  };

  const renderHeader = () => (
    <header className="dt-home-header">
      <nav className="dt-home-nav" aria-label={isEnglish ? "Home navigation" : "首页导航"}>
        <a href={websiteHref} className="dt-home-brand" aria-label={isEnglish ? "Sendify website" : "Sendify 官网"}>
          <span className="dt-home-brand-logo" aria-hidden="true" />
        </a>

        <div className="dt-home-nav-links">
          <a href={websiteHref}>{ui.home}</a>
          <a href={pricingHref}>{ui.pricing}</a>
          <a href={websiteContactHref}>{ui.contactUs}</a>
          <a href={helpCenterHref} aria-current="page">{ui.helpCenter}</a>
        </div>

        <details className="dt-home-mobile-menu">
          <summary aria-label={ui.openMenu}>
            <span />
            <span />
            <span />
          </summary>
          <div className="dt-home-mobile-panel">
            <a href={websiteHref}>{ui.home}</a>
            <a href={pricingHref}>{ui.pricing}</a>
            <a href={websiteContactHref}>{ui.contactUs}</a>
            <a href={helpCenterHref} aria-current="page">{ui.helpCenter}</a>
          </div>
        </details>
      </nav>
    </header>
  );

  const renderHelpVisual = () => (
    <div className="dt-home-help-visual" aria-hidden="true">
      <div className="dt-home-help-sheet dt-home-help-sheet-back" />
      <div className="dt-home-help-sheet">
        <span className="dt-home-help-mark">?</span>
        <div className="dt-home-help-lines">
          <i />
          <i />
          <i />
        </div>
        <span className="dt-home-help-check">✓</span>
      </div>
    </div>
  );

  const renderHero = () => (
    <main className="dt-home-hero">
      <div className="dt-home-hero-grid dt-home-wrap">
        <div className="dt-home-hero-copy">
          <span className="dt-home-eyebrow"><i /> Sendify {ui.helpCenter}</span>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>

          <form
            className="dt-home-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              const firstResult = document.querySelector(
                "#home-search-results [data-search-item]:not([hidden]) a"
              );
              if (firstResult) window.location.assign(firstResult.href);
            }}
          >
            <SearchIcon />
            <input
              id="home-search-input"
              name="query"
              type="search"
              aria-label={t.ph}
              aria-controls="home-search-results"
              aria-expanded="false"
              placeholder={t.ph}
              autoComplete="off"
              onInput={(event) => applySearchQuery(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") applySearchQuery("", true);
              }}
            />
            <button id="home-search-submit" type="submit" disabled>
              <span>{t.search_btn}</span>
              <ArrowIcon />
            </button>
          </form>

          <div className="dt-home-search-results" id="home-search-results" aria-live="polite" hidden>
            <div className="dt-home-search-summary">
              <span id="home-search-summary" />
              <button type="button" onClick={() => applySearchQuery("", true)} aria-label={ui.clearSearch}>{ui.clearSearch}</button>
            </div>
            <ul>
              {searchItems.map((item) => (
                <li
                  key={item.slug}
                  data-search-item
                  data-search-text={[item.t, item.tag, item.description, item.keywords]
                    .filter(Boolean)
                    .join(" ")
                    .toLocaleLowerCase(isEnglish ? "en" : "zh-CN")}
                  hidden
                >
                  <a href={pageHref(item.slug)}>
                    <span>{item.tag}</span>
                    <strong>{item.t}</strong>
                    <ArrowIcon />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="dt-home-hot" aria-label={isEnglish ? "Popular searches" : "热门搜索"}>
            <span>{t.hot_label}</span>
            {hot.map((tag) => (
              <button key={tag} type="button" onClick={() => applySearchQuery(tag, true)}>
                {tag}
              </button>
            ))}
          </div>
        </div>
        {renderHelpVisual()}
      </div>
    </main>
  );

  const renderJourneys = () => (
    <section className="dt-home-journeys" aria-labelledby="journey-title">
      <div className="dt-home-wrap dt-home-section">
        <div className="dt-home-section-head dt-home-section-head-centered">
          <span>{ui.quickStart}</span>
          <h2 id="journey-title">{ui.journeyTitle}</h2>
          <p>{ui.journeyDescription}</p>
        </div>
        <div className="dt-home-journey-grid">
          {journeys.map((item, index) => (
            <a className="dt-home-journey" href={pageHref(item.slug)} key={item.slug}>
              <span className="dt-home-journey-step">0{index + 1}</span>
              <span className="dt-home-journey-icon"><JourneyIcon name={item.icon} /></span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span className="dt-home-journey-link">{ui.viewGuide} <ArrowIcon /></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );

  const renderDeveloperAccess = () => (
    <section className="dt-home-developer" aria-labelledby="developer-title">
      <div className="dt-home-wrap dt-home-section">
        <div className="dt-home-section-head dt-home-section-head-centered">
          <span>{ui.developerAccess}</span>
          <h2 id="developer-title">{ui.developerTitle}</h2>
          <p>{ui.developerDescription}</p>
        </div>
        <div className="dt-home-developer-grid">
          <a className="dt-home-developer-card" href={apiDocsHref}>
            <small>REST API</small>
            <h3>Open API</h3>
            <p>{ui.apiDescription}</p>
            <span>{ui.apiLink} <ArrowIcon /></span>
          </a>
          <a className="dt-home-developer-card dt-home-developer-card-featured" href={mcpDocsHref}>
            <small>AI CONNECTOR</small>
            <h3>Sendify MCP</h3>
            <p>{ui.mcpDescription}</p>
            <span>{ui.mcpLink} <ArrowIcon /></span>
          </a>
        </div>
      </div>
    </section>
  );

  const renderPopularArticles = () => (
    <section className="dt-home-popular" id="popular" aria-labelledby="popular-title">
      <div className="dt-home-wrap dt-home-section">
        <div className="dt-home-section-head">
          <div>
          <span>{ui.commonGuides}</span>
            <h2 id="popular-title">{t.pop_title}</h2>
            <p>{t.pop_sub}</p>
          </div>
          <a className="dt-home-text-link" href={productDocsHref}>{ui.allGuides} <ArrowIcon /></a>
        </div>
        <div className="dt-home-art-grid">
          {arts.map((article, index) => (
            <a key={article.slug} className="dt-home-art" href={pageHref(article.slug)}>
              <span className="dt-home-art-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="dt-home-art-copy">
                <small>{article.tag}</small>
                <strong>{article.t}</strong>
              </span>
              <span className="dt-home-art-arrow"><ArrowIcon /></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );

  const renderSupport = () => (
    <section className="dt-home-support-wrap">
      <div className="dt-home-wrap dt-home-section">
        <div className="dt-home-support">
          <div className="dt-home-support-copy">
            <span>{ui.moreQuestions}</span>
            <h2>{t.sup_title}</h2>
            <p>{t.sup_sub}</p>
          </div>
          <div className="dt-home-support-email" aria-label={`${ui.supportEmail}: ${supportEmail}`}>
            <span>{ui.supportEmail}</span>
            <strong>{supportEmail}</strong>
          </div>
        </div>
      </div>
    </section>
  );

  const renderFooter = () => (
    <footer className="dt-home-footer">
      <div className="dt-home-wrap dt-home-footer-grid">
        <div className="dt-home-footer-brand">
          <span className="dt-home-brand-logo" aria-hidden="true" />
        </div>
        <div className="dt-home-footer-contact">
          <h2>{ui.contact}</h2>
          <a href={supportMail}>{supportEmail}</a>
        </div>
        <div className="dt-home-footer-resources">
          <h2>{ui.resources}</h2>
          <a href={productDocsHref}>{ui.helpCenter}</a>
          <a href={apiDocsHref}>Open API</a>
          <a href={mcpDocsHref}>MCP</a>
        </div>
        <div className="dt-home-footer-legal">
          <h2>{ui.legal}</h2>
          {legalLinks.map(([label, href]) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer">{label}</a>
          ))}
        </div>
      </div>
      <div className="dt-home-wrap dt-home-footer-bottom">
        <span>{ui.footerCopyright(currentYear)}</span>
        <span className="dt-home-footer-filings">
          <a
            href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=33011002018233"
            target="_blank"
            rel="noopener noreferrer"
          >
            浙公网安备 33011002018233号
          </a>
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
            浙ICP备18037475号-53
          </a>
        </span>
      </div>
    </footer>
  );

  return (
    <div className="dt-home">
      {renderHeader()}
      {renderHero()}
      {renderJourneys()}
      {renderDeveloperAccess()}
      {renderPopularArticles()}
      {renderSupport()}
      {renderFooter()}
    </div>
  );
};

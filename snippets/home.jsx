/* Sendify 帮助中心首页。样式位于 /style.css 的 .dt-home 命名空间。 */

export const Home = ({ t, arts, hot, journeys, searchItems = arts }) => {
  const applySearchQuery = (query, focus = false) => {
    if (typeof document === "undefined") return;
    const input = document.getElementById("home-search-input");
    const panel = document.getElementById("home-search-results");
    const summary = document.getElementById("home-search-summary");
    const submit = document.getElementById("home-search-submit");
    if (!input || !panel || !summary || !submit) return;

    const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
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
      ? `找到 ${visibleCount} 篇相关内容`
      : "暂未找到相关内容";
    if (focus) requestAnimationFrame(() => input.focus());
  };

  const productDocsHref = "/getting-started";
  const apiDocsHref = "/developer/overview";
  const mcpDocsHref = "/mcp/overview";
  const websiteHref = "https://www.sendify.dingstore.cn/";
  const pricingHref = "https://www.sendify.dingstore.cn/pricing";
  const websiteContactHref = "https://www.sendify.dingstore.cn/contact-us";
  const supportEmail = "sendify-support@dingmail.work";
  const supportMail = `mailto:${supportEmail}`;
  const currentYear = new Date().getFullYear();
  const legalLinks = [
    [
      "隐私政策",
      "https://terms.alicdn.com/legal-agreement/terms/privacy_policy_full/20250320112834560/20250320112834560.html",
    ],
    [
      "服务协议",
      "https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20250320110123957/20250320110123957.html",
    ],
    [
      "服务等级协议",
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
      <nav className="dt-home-nav" aria-label="首页导航">
        <a href={websiteHref} className="dt-home-brand" aria-label="Sendify 官网">
          <span className="dt-home-brand-logo" aria-hidden="true" />
        </a>

        <div className="dt-home-nav-links">
          <a href={websiteHref}>首页</a>
          <a href={pricingHref}>价格</a>
          <a href={websiteContactHref}>联系我们</a>
          <a href="/" aria-current="page">帮助中心</a>
        </div>

        <details className="dt-home-mobile-menu">
          <summary aria-label="打开导航菜单">
            <span />
            <span />
            <span />
          </summary>
          <div className="dt-home-mobile-panel">
            <a href={websiteHref}>首页</a>
            <a href={pricingHref}>价格</a>
            <a href={websiteContactHref}>联系我们</a>
            <a href="/" aria-current="page">帮助中心</a>
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
          <span className="dt-home-eyebrow"><i /> Sendify 帮助中心</span>
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
              <button type="button" onClick={() => applySearchQuery("", true)} aria-label="清空搜索">清空</button>
            </div>
            <ul>
              {searchItems.map((item) => (
                <li
                  key={item.slug}
                  data-search-item
                  data-search-text={[item.t, item.tag, item.description, item.keywords]
                    .filter(Boolean)
                    .join(" ")
                    .toLocaleLowerCase("zh-CN")}
                  hidden
                >
                  <a href={`/${item.slug}`}>
                    <span>{item.tag}</span>
                    <strong>{item.t}</strong>
                    <ArrowIcon />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="dt-home-hot" aria-label="热门搜索">
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
          <span>快速开始</span>
          <h2 id="journey-title">沿着使用路径，找到需要的答案</h2>
          <p>从基础配置到效果分析，按任务阶段快速进入对应指南。</p>
        </div>
        <div className="dt-home-journey-grid">
          {journeys.map((item, index) => (
            <a className="dt-home-journey" href={`/${item.slug}`} key={item.slug}>
              <span className="dt-home-journey-step">0{index + 1}</span>
              <span className="dt-home-journey-icon"><JourneyIcon name={item.icon} /></span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span className="dt-home-journey-link">查看指南 <ArrowIcon /></span>
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
          <span>开发者接入</span>
          <h2 id="developer-title">选择适合你的集成方式</h2>
          <p>通过 Open API 构建业务集成，或让 AI 助手用 MCP 安全查询 Sendify 数据。</p>
        </div>
        <div className="dt-home-developer-grid">
          <a className="dt-home-developer-card" href={apiDocsHref}>
            <small>REST API</small>
            <h3>Open API</h3>
            <p>使用 Bearer API Key 调用联系人等接口，构建自动化工作流。</p>
            <span>查看 API 文档 <ArrowIcon /></span>
          </a>
          <a className="dt-home-developer-card dt-home-developer-card-featured" href={mcpDocsHref}>
            <small>AI CONNECTOR</small>
            <h3>Sendify MCP</h3>
            <p>连接 Codex、Cursor 或 Claude，用自然语言查询营销活动与联系人。</p>
            <span>开始接入 MCP <ArrowIcon /></span>
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
            <span>常用指南</span>
            <h2 id="popular-title">{t.pop_title}</h2>
            <p>{t.pop_sub}</p>
          </div>
          <a className="dt-home-text-link" href={productDocsHref}>查看全部指南 <ArrowIcon /></a>
        </div>
        <div className="dt-home-art-grid">
          {arts.map((article, index) => (
            <a key={article.slug} className="dt-home-art" href={`/${article.slug}`}>
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
            <span>还有疑问？</span>
            <h2>{t.sup_title}</h2>
            <p>{t.sup_sub}</p>
          </div>
          <div className="dt-home-support-email" aria-label={`联系邮箱：${supportEmail}`}>
            <span>联系邮箱</span>
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
          <h2>联系我们</h2>
          <a href={supportMail}>{supportEmail}</a>
        </div>
        <div className="dt-home-footer-resources">
          <h2>资源</h2>
          <a href={productDocsHref}>帮助中心</a>
          <a href={apiDocsHref}>Open API</a>
          <a href={mcpDocsHref}>MCP</a>
        </div>
        <div className="dt-home-footer-legal">
          <h2>法律协议</h2>
          {legalLinks.map(([label, href]) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer">{label}</a>
          ))}
        </div>
      </div>
      <div className="dt-home-wrap dt-home-footer-bottom">
        <span>阿里钉钉 ©版权公告 © {currentYear} 钉钉（中国）信息技术有限公司/或其关联公司版权所有</span>
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

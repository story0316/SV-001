// ─── ROUTER ──────────────────────────────────────────────────────────────────

let _currentPage = 'home';
let _currentSlug = null;

function navigate(page, slug) {
  // Reset mega menu
  const menu = document.getElementById('megaMenu');
  if (menu) menu.classList.remove('open');

  // Reset company tab when navigating to a different company
  if (page !== 'company') _companyTab = '개요';

  _currentPage = page;
  _currentSlug = slug || null;

  // Update URL hash for bookmarkability
  if (page === 'company' && slug) {
    window.location.hash = `company/${slug}`;
  } else if (page === 'home') {
    window.location.hash = '';
  } else {
    window.location.hash = page;
  }

  renderApp();
}

function renderApp() {
  const app = document.getElementById('app');
  if (!app) return;

  const company = _currentSlug ? getCompanyBySlug(_currentSlug) : null;

  let pageHtml = '';
  switch (_currentPage) {
    case 'home':
      pageHtml = renderHomePage();
      break;
    case 'company':
      pageHtml = renderCompanyPage(company);
      break;
    case 'submit':
      pageHtml = renderSubmitPage();
      break;
    case 'levels':
      pageHtml = renderLevelMappingPage();
      break;
    case 'report':
      pageHtml = renderSalaryReportPage();
      break;
    case 'compare':
      pageHtml = renderBenefitsComparePage();
      break;
    default:
      pageHtml = renderHomePage();
  }

  app.innerHTML = `
    ${renderHeader(_currentPage, company)}
    ${renderMegaMenu()}
    <main id="pageContent" class="page-content">
      ${pageHtml}
    </main>
    ${renderBottomNav(_currentPage)}
  `;
}

// Handle hash-based routing on load
function initRouter() {
  const hash = window.location.hash.slice(1);
  if (hash.startsWith('company/')) {
    const slug = hash.split('/')[1];
    _currentPage = 'company';
    _currentSlug = slug;
  } else if (['submit', 'levels', 'report', 'compare'].includes(hash)) {
    _currentPage = hash;
  } else {
    _currentPage = 'home';
  }
  renderApp();
}

window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(1);
  if (hash.startsWith('company/')) {
    const slug = hash.split('/')[1];
    _currentPage = 'company';
    _currentSlug = slug;
  } else if (['submit', 'levels', 'report', 'compare'].includes(hash)) {
    _currentPage = hash;
    _currentSlug = null;
  } else {
    _currentPage = 'home';
    _currentSlug = null;
  }
  renderApp();
});

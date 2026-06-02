// ─── UTILS ────────────────────────────────────────────────────────────────────

function formatWon(v) {
  return `₩${(v * 10000).toLocaleString('ko-KR')}`;
}

function formatMan(v) {
  return `${v.toLocaleString('ko-KR')}만`;
}

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w가-힣-]/g, '');
}

function getCompanyBySlug(slug) {
  return POPULAR_COMPANIES.find(c => c.slug === slug || slugify(c.name) === slug) || null;
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function totalComp(row) {
  return row.base + row.stock + row.bonus;
}

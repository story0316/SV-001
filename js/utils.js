// ─── UTILITIES ───────────────────────────────────────────────────────────────

function formatWon(v) {
  return `₩${(v * 10000).toLocaleString('ko-KR')}`;
}

function formatMan(v) {
  return `${v.toLocaleString('ko-KR')}만`;
}

function slugify(name) {
  return name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w가-힣-]/g, '');
}

function getCompanyBySlug(slug) {
  return POPULAR_COMPANIES.find(c => c.slug === slug || slugify(c.name) === slug);
}

function logoStyle(company) {
  const isDark = company.color === '#FEE500';
  return `background:${company.color};color:${isDark ? '#3D2B00' : '#fff'}`;
}

function el(tag, attrs = {}, ...children) {
  const element = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'className') element.className = v;
    else if (k === 'style') element.style.cssText = v;
    else if (k.startsWith('on')) element.addEventListener(k.slice(2).toLowerCase(), v);
    else element.setAttribute(k, v);
  });
  children.forEach(child => {
    if (typeof child === 'string') element.appendChild(document.createTextNode(child));
    else if (child instanceof Node) element.appendChild(child);
  });
  return element;
}

function html(strings, ...values) {
  return strings.reduce((acc, str, i) => acc + str + (values[i] !== undefined ? values[i] : ''), '');
}

function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

function qsa(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

function on(element, event, handler) {
  element.addEventListener(event, handler);
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

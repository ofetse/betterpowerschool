const COLS = ['#7c3aed', '#0ea5e9', '#f59e0b', '#10b981'];

function load() {
  try { return JSON.parse(localStorage.getItem('gm_data')) || null; }
  catch { return null; }
}
function save() {
  localStorage.setItem('gm_data', JSON.stringify({ students, sel, sortK, curTab, nid }));
}

function mkCats(a, q, m, f) {
  return [
    { name: 'Assignments', weight: 30, assignments: [{ id: 1, name: 'HW 1',    score: a }] },
    { name: 'Quizzes',     weight: 20, assignments: [{ id: 2, name: 'Quiz 1',  score: q }] },
    { name: 'Midterm',     weight: 25, assignments: [{ id: 3, name: 'Midterm', score: m }] },
    { name: 'Final',       weight: 25, assignments: [{ id: 4, name: 'Final',   score: f }] },
  ];
}

const defaults = {
  students: [
    { id: 1, name: 'Salahdine Echchoujaa',  categories: mkCats(82, 92, 85, 90) },
    { id: 2, name: 'Samoin',        categories: mkCats(68, 78, 72, 68) },
    { id: 3, name: 'nubaid',        categories: mkCats(96, 100, 96, 94) },
    { id: 4, name: 'Ty kyfiuk',     categories: mkCats(58, 58, 62, 57) },
    { id: 5, name: 'Niaan Patel',   categories: mkCats(58, 48, 60, 89) },
    { id: 6, name: 'Ethan Curran',    categories: mkCats(58, 58, 62, 57) },
    { id: 7, name: 'Jayden Domenjoz',    categories: mkCats(58, 58, 62, 57) },
       { id: 7, name: 'Ritvik Mehrotra',    categories: mkCats(58, 58, 62, 57) },
  ],
  sel: 1, sortK: 'name', curTab: 'grades', nid: 5
};

const saved = load();
let { students, sel, sortK, curTab, nid } = saved || defaults;

const $ = id => document.getElementById(id);
const gsel = () => students.find(s => s.id === sel);

function gpa(cats) {
  if (!cats.length) return 0;
  const [h, ...t] = cats;
  const avg = h.assignments.length
    ? h.assignments.reduce((s, a) => s + a.score, 0) / h.assignments.length : 0;
  const tw = cats.reduce((s, c) => s + c.weight, 0);
  return avg * (h.weight / tw) + gpa(t) * (1 - h.weight / tw);
}

function gi(v) {
  if (v >= 90) return { l: 'A', c: '#4ade80' };
  if (v >= 80) return { l: 'B', c: '#60a5fa' };
  if (v >= 70) return { l: 'C', c: '#facc15' };
  if (v >= 60) return { l: 'D', c: '#fb923c' };
  return { l: 'F', c: '#f87171' };
}

function bar(sc, col) {
  return `<div class="bw">
    <div class="bt"><div class="bf" style="width:${sc}%;background:${col}"></div></div>
    <span class="bl" style="color:${col}">${sc.toFixed(1)}</span>
  </div>`;
}

function bsort(arr, k) {
  const a = arr.map(x => ({ ...x }));
  for (let i = 0; i < a.length - 1; i++)
    for (let j = 0; j < a.length - i - 1; j++) {
      const va = typeof a[j][k] === 'string' ? a[j][k].toLowerCase() : a[j][k];
      const vb = typeof a[j+1][k] === 'string' ? a[j+1][k].toLowerCase() : a[j+1][k];
      if (va > vb) [a[j], a[j+1]] = [a[j+1], a[j]];
    }
  return a;
}

function toast(m) {
  $('fmsg').textContent = m;
  $('flash').classList.add('on');
  setTimeout(() => $('flash').classList.remove('on'), 1800);
}

function rSidebar() {
  const sorted = bsort(students.map(s => ({ ...s, gpa: gpa(s.categories) })), sortK);
  $('sbl').innerHTML = sorted.map(s => {
    const { l, c } = gi(s.gpa);
    return `<div class="card ${s.id === sel ? 'on' : ''}" style="border-left-color:${s.id === sel ? '#7c3aed' : c}" onclick="pick(${s.id})">
      <div class="ct">
        <div><div class="cn">${s.name}</div><div class="ci">ID #${String(s.id).padStart(3, '0')}</div></div>
        <div class="gb" style="color:${c};background:${c}22">${l}</div>
      </div>${bar(s.gpa, c)}</div>`;
  }).join('');
}

function rGrades() {
  const s = gsel(); if (!s) return;
  const g = gpa(s.categories); const { l, c } = gi(g);
  $('hn').textContent = s.name;
  $('hi').textContent = `ID #${String(s.id).padStart(3, '0')}`;
  $('cats').innerHTML = s.categories.map((cat, i) => {
    const avg = cat.assignments.length
      ? cat.assignments.reduce((x, a) => x + a.score, 0) / cat.assignments.length : 0;
    const co = COLS[i];
    return `<div class="cb" style="color:${co};border-color:${co}44;background:${co}11">
      <div class="cl">${cat.name}</div>
      <div class="ca">${cat.assignments.length ? avg.toFixed(1) : '—'}</div>
      <div class="cw">weight: ${cat.weight}%</div></div>`;
  }).join('');
  const gc = $('gc'); gc.style.color = gc.style.borderColor = c; gc.style.background = c + '22';
  $('gl').textContent = l; $('gn').textContent = g.toFixed(1) + '%';
  const asgns = s.categories.flatMap((cat, i) => cat.assignments.map(a => ({ ...a, cat: cat.name, ci: i })));
  $('al').innerHTML = asgns.length
    ? asgns.map(a => {
        const co = COLS[a.ci]; const { c: ac } = gi(a.score);
        return `<div class="ar" style="border-left-color:${co}">
          <span class="an">${a.name}<span class="ac">${a.cat}</span></span>${bar(a.score, ac)}</div>`;
      }).join('')
    : '<div class="em">No assignments yet.</div>';
}

function rAdd() {
  const s = gsel(); if (!s) return;
  $('at').textContent = s.name;
  $('ac2').innerHTML = '<option value="">— select —</option>' +
    s.categories.map(c => `<option value="${c.name}">${c.name} (${c.weight}%)</option>`).join('');
  const g = gpa(s.categories); const { l, c } = gi(g);
  $('ppn').textContent = s.name;
  $('ppb').innerHTML = bar(g, c);
  $('ppg').textContent = l;
  $('ppg').style.color = c;
}

function rEdit() {
  const s = gsel(); if (!s) return;
  $('et').textContent = s.name;
  $('eni').value = s.name;
  const rows = s.categories.flatMap((cat, ci) => cat.assignments.map(a => {
    const co = COLS[ci]; const { c: ac } = gi(a.score);
    return `<div class="er" style="border-left-color:${co}">
      <div class="em2"><span style="font-size:12px">${a.name}</span> <span class="ac">${cat.name}</span></div>
      <div class="ec">
        <input class="ei" type="number" min="0" max="100" value="${a.score}" style="border-color:${ac}55"
          onchange="updScore('${cat.name}', ${a.id}, this.value)"/>
        <button class="dx" onclick="delA('${cat.name}', ${a.id})" title="Delete">✕</button>
      </div></div>`;
  }));
  $('eal').innerHTML = rows.length
    ? rows.join('')
    : '<div class="em">No assignments yet.</div>';
}

function render() {
  rSidebar();
  if (curTab === 'grades') rGrades();
  if (curTab === 'add')    rAdd();
  if (curTab === 'edit')   rEdit();
}

function pick(id) { sel = id; save(); render(); }

function ss(k) {
  sortK = k;
  $('snb').classList.toggle('on', k === 'name');
  $('sgb').classList.toggle('on', k === 'gpa');
  save(); rSidebar();
}

function tab(t) {
  curTab = t;
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('on'));
  document.querySelectorAll('.tab').forEach(tb => tb.classList.remove('on'));
  $(`p${t[0]}`).classList.add('on');
  document.querySelectorAll('.tab')[['grades', 'add', 'edit'].indexOf(t)].classList.add('on');
  save(); render();
}

function addStu() {
  const name = $('nin').value.trim(); if (!name) return;
  students.push({
    id: nid++, name,
    categories: [
      { name: 'Assignments', weight: 30, assignments: [] },
      { name: 'Quizzes',     weight: 20, assignments: [] },
      { name: 'Midterm',     weight: 25, assignments: [] },
      { name: 'Final',       weight: 25, assignments: [] },
    ]
  });
  $('nin').value = '';
  toast('Student added!'); save(); render();
}

function addScore() {
  const cat = $('ac2').value, asgn = $('aa').value.trim(), score = parseFloat($('as2').value);
  if (!cat || !asgn || isNaN(score) || score < 0 || score > 100) return;
  const s = gsel();
  s.categories = s.categories.map(c => c.name !== cat ? c : {
    ...c, assignments: [...c.assignments, { id: Date.now(), name: asgn, score }]
  });
  $('ac2').value = $('aa').value = $('as2').value = '';
  toast('Score added!'); save(); render();
}

function saveName() {
  const n = $('eni').value.trim(); if (!n) return;
  gsel().name = n;
  toast('Name updated!'); save(); render();
}

function updScore(catName, aid, raw) {
  const score = parseFloat(raw);
  if (isNaN(score) || score < 0 || score > 100) return;
  const s = gsel();
  s.categories = s.categories.map(c => c.name !== catName ? c : {
    ...c, assignments: c.assignments.map(a => a.id === aid ? { ...a, score } : a)
  });
  toast('Score updated!'); save(); rSidebar();
}

function delA(catName, aid) {
  const s = gsel();
  s.categories = s.categories.map(c => c.name !== catName ? c : {
    ...c, assignments: c.assignments.filter(a => a.id !== aid)
  });
  toast('Assignment deleted!'); save(); render();
}

render();

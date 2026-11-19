// ---------- 旅行助手：地图 / 行程任务 / 应急（依赖 app.js 的 $ / esc / toast / store / openDetail / setMode） ----------
const AMAP_CFG = window.MYTRIP_CONFIG?.amap || {};
const HAS_KEY = !!AMAP_CFG.key;
const DAY_COLORS = ["#8c8c8c", "#ff2442", "#7c5cff", "#00b578", "#ff8f1f", "#1677ff"];
const PRIORITY = {
  must: { label: "必做", color: "#ff2442" },
  should: { label: "推荐", color: "#ff8f1f" },
  optional: { label: "可选", color: "#8c8c8c" },
};
const MANUAL_KINDS = new Set(["didi", "access"]);

store.done ??= {};
store.layers ??= {};
Object.keys(KINDS).forEach(k => (store.layers[k] ??= true));

let places = PLACES;
const placeById = id => places.find(p => p.id === id);
const tasksOf = day => TASKS.filter(t => t.day === day);
const routeIds = day => [...new Set(tasksOf(day).map(t => t.place).filter(Boolean))];
const daysOfPlace = id => [...new Set(TASKS.filter(t => t.place === id && t.day > 0).map(t => t.day))];
const isDone = t => !!store.done[t.id];
const progress = list => `${list.filter(isDone).length}/${list.length}`;
const dayBadge = i => `<span class="dr-badge" style="background:${DAY_COLORS[i]}">${i ? "D" + i : "前"}</span>`;

function navUrl(name, [lng, lat], coordinate = "gaode") {
  return `https://uri.amap.com/marker?position=${lng},${lat}&name=${encodeURIComponent(name)}&src=myTrip&coordinate=${coordinate}&callnative=1`;
}
const fmtDist = m => (m >= 1000 ? (m / 1000).toFixed(1) + "km" : Math.round(m) + "m");
async function copyText(text, okMsg) {
  try { await navigator.clipboard.writeText(text); toast(okMsg); }
  catch { prompt("复制下面的内容发给团员：", text); }
}

// ---------- 底部 Tab ----------
let currentTab = "map";
function goto(tab) {
  currentTab = tab;
  document.querySelectorAll("#bottombar [data-goto]").forEach(b => b.classList.toggle("active", b.dataset.goto === tab));
  $("#mapTab").classList.toggle("hidden", tab !== "map");
  $("#planTab").classList.toggle("hidden", tab !== "plan");
  $("#sosTab").classList.toggle("hidden", tab !== "sos");
  $("#guideTab").classList.toggle("hidden", tab !== "guide");
  // 离开攻略时停掉竖屏播放；回到攻略从图文开始
  setMode("note");
  if (tab === "map") initMap();
  if (tab === "plan") renderPlan();
  if (tab === "sos") initSos();
}
document.addEventListener("click", e => {
  const g = e.target.closest("[data-goto]");
  if (g) goto(g.dataset.goto);
});

// ---------- 高德 JS API ----------
let amapPromise = null;
function loadAMap() {
  if (!HAS_KEY) return Promise.reject(new Error("未配置高德 Key"));
  if (amapPromise) return amapPromise;
  // 安全密钥必须在加载 JS API 之前设置
  window._AMapSecurityConfig = { securityJsCode: AMAP_CFG.securityJsCode };
  amapPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(AMAP_CFG.key)}&plugin=AMap.Scale,AMap.PlaceSearch,AMap.Driving,AMap.Geolocation`;
    s.onload = () => (window.AMap ? resolve(window.AMap) : reject(new Error("AMap 未定义")));
    s.onerror = () => reject(new Error("高德 JS API 加载失败"));
    document.head.appendChild(s);
  }).catch(err => { amapPromise = null; throw err; });
  return amapPromise;
}

function getAmapPosition() {
  return loadAMap().then(() => new Promise((resolve, reject) => {
    new AMap.Geolocation({ enableHighAccuracy: true, timeout: 10000 }).getCurrentPosition((status, res) =>
      status === "complete" ? resolve([res.position.lng, res.position.lat]) : reject(res));
  }));
}

function searchNearby(typeId, center) {
  const n = NEARBY.find(x => x.id === typeId);
  return loadAMap().then(() => new Promise(resolve => {
    const ps = new AMap.PlaceSearch({ type: n.type, pageSize: 8 });
    ps.searchNearBy("", center, n.radius || 2000, (status, res) =>
      resolve(status === "complete" ? res.poiList?.pois || [] : status === "no_data" ? [] : null));
  }));
}

// 地点数据源：local 直接用 PLACES；amap 逐个走 POI 搜索校准（串行，避免触发 QPS 限制）
async function fetchAmapPlaces() {
  const ps = new AMap.PlaceSearch({ city: AMAP_CFG.city || TRIP.city, citylimit: true, pageSize: 1 });
  const search = kw => new Promise(r => ps.search(kw, (status, res) => r(status === "complete" ? res.poiList?.pois?.[0] : null)));
  const out = [];
  for (const p of PLACES) {
    const poi = MANUAL_KINDS.has(p.kind) ? null : await search(p.keyword || p.name);
    out.push(poi?.location
      ? { ...p, lnglat: [poi.location.lng, poi.location.lat], address: typeof poi.address === "string" ? poi.address : "", poiId: poi.id }
      : p);
  }
  return out;
}

function poiListHTML(pois, n) {
  if (!pois.length) return `<div class="poi-empty">附近 ${fmtDist(n.radius || 2000)} 内没有找到${n.label}</div>`;
  return pois.map(p => {
    const addr = typeof p.address === "string" ? p.address : "";
    const tel = typeof p.tel === "string" && p.tel ? p.tel.split(";")[0] : "";
    return `<div class="poi">
      <span class="poi-emoji">${n.emoji}</span>
      <span class="poi-main"><b>${esc(p.name)}</b><small>${esc(addr)}</small></span>
      <span class="poi-dist">${p.distance != null ? fmtDist(p.distance) : ""}</span>
      ${tel ? `<a class="poi-btn" href="tel:${esc(tel)}" aria-label="拨打">📞</a>` : ""}
      <a class="poi-btn" href="${navUrl(p.name, [p.location.lng, p.location.lat])}" target="_blank" rel="noopener" aria-label="导航">🧭</a>
    </div>`;
  }).join("");
}

// ---------- 地图页 ----------
let map = null, mapReady = null, mapDay = null, activePlace = null, routeLine = null, meMarker = null, sheetOpen = false;
const markers = new Map();
const routeCache = {};
let nearbyMarkers = [];

function initMap() {
  renderMapHead();
  renderSheet();
  if (mapReady) return mapReady;
  if (!HAS_KEY) {
    showMapEmpty("还没有配置高德 Key", "在 config.js 填入高德「Web端(JS API)」的 key 和 securityJsCode 后刷新即可显示地图。地点详情、任务、导航跳转现在也能用。");
    return (mapReady = Promise.resolve());
  }
  mapReady = loadAMap().then(async () => {
    map = new AMap.Map("amap", { zoom: 11, center: TRIP.center });
    map.addControl(new AMap.Scale());
    map.on("click", () => { hidePlaceCard(); $("#layerPanel").classList.add("hidden"); });
    renderMap();
    if (AMAP_CFG.source === "amap") {
      places = await fetchAmapPlaces();
      Object.keys(routeCache).forEach(k => delete routeCache[k]);
      renderMap();
    }
  }).catch(err => {
    console.error(err);
    mapReady = null;
    showMapEmpty("高德地图加载失败", "请检查网络，以及 config.js 中的 key / securityJsCode 是否正确。");
  });
  return mapReady;
}

function renderMapHead() {
  $("#mapTitle").innerHTML = `🏔️ ${esc(TRIP.title)}<small>任务 ${progress(TASKS)}</small>`;
  $("#mapChips").innerHTML = `<span class="chip ${mapDay == null ? "active" : ""}" data-day-pick="all">全部</span>` +
    DAYS.map((d, i) => i ? `<span class="chip ${mapDay === i ? "active" : ""}" data-day-pick="${i}" style="--dc:${DAY_COLORS[i]}">D${i} ${esc(d)}</span>` : "").join("");
}

function setDay(d) {
  mapDay = d;
  sheetOpen = false;
  renderMapHead();
  renderMap();
}
$("#mapTab").addEventListener("click", e => {
  const d = e.target.closest("[data-day-pick]")?.dataset.dayPick;
  if (d == null) return;
  if (d === "0") return goto("plan");
  setDay(d === "all" ? null : +d);
});

function visiblePlaces() {
  const ids = mapDay == null ? null : new Set(routeIds(mapDay));
  return places.filter(p => store.layers[p.kind] && (!ids || ids.has(p.id) || ALWAYS_ON.has(p.kind)));
}

function pinHTML(p, order) {
  return `<div class="pin" data-pin="${p.id}" style="--c:${KINDS[p.kind].color}">
    <span class="pin-icon"><b>${p.emoji}</b>${order ? `<i>${order}</i>` : ""}</span>
    <span class="pin-name">${esc(p.name)}</span>
  </div>`;
}

function renderMap() {
  hidePlaceCard();
  renderSheet();
  if (!map) {
    if ($("#meList")) renderEmptyList();
    return;
  }
  map.remove([...markers.values()]);
  markers.clear();
  const order = mapDay == null ? [] : routeIds(mapDay);
  visiblePlaces().forEach(p => {
    const idx = order.indexOf(p.id);
    const m = new AMap.Marker({
      position: p.lnglat,
      anchor: "bottom-center",
      content: pinHTML(p, idx + 1),
      zIndex: idx >= 0 ? 120 : 100,
    });
    m.on("click", () => selectPlace(p.id));
    markers.set(p.id, m);
  });
  map.add([...markers.values()]);
  drawRoute();
  const focus = order.length ? order.map(id => markers.get(id)).filter(Boolean) : [...markers.values()];
  // avoid：[上, 下, 左, 右]，留出顶部筛选条和右侧按钮；地图容器本身已在任务面板之上
  if (focus.length) map.setFitView(focus, false, [170, 40, 40, 60], 15);
}

function drawRoute() {
  if (routeLine) { map.remove(routeLine); routeLine = null; }
  if (mapDay == null) return;
  const day = mapDay;
  const pts = routeIds(day).map(placeById).filter(Boolean).map(p => p.lnglat);
  if (pts.length < 2) return;
  const paint = (path, dashed) => {
    if (day !== mapDay) return;
    if (routeLine) map.remove(routeLine);
    routeLine = new AMap.Polyline({
      path, strokeColor: DAY_COLORS[day], strokeWeight: 6, strokeOpacity: 0.9, lineJoin: "round", showDir: true,
      ...(dashed ? { strokeStyle: "dashed", strokeDasharray: [12, 8] } : {}),
    });
    map.add(routeLine);
  };
  const cached = routeCache[day];
  if (cached) return paint(cached.path, !cached.km);
  // 先画直线示意，驾车规划成功后替换为真实道路
  paint(pts, true);
  const ll = ([lng, lat]) => new AMap.LngLat(lng, lat);
  new AMap.Driving().search(ll(pts[0]), ll(pts.at(-1)), { waypoints: pts.slice(1, -1).map(ll) }, (status, res) => {
    const r = status === "complete" && res.routes?.[0];
    routeCache[day] = r
      ? { path: r.steps.flatMap(s => s.path), km: (r.distance / 1000).toFixed(1), min: Math.round(r.time / 60) }
      : { path: pts };
    paint(routeCache[day].path, !r);
    if (day === mapDay) renderSheet();
  });
}

function routeText(day) {
  if (routeIds(day).length < 2) return "";
  if (!map) return "配置 Key 后显示路线";
  const r = routeCache[day];
  if (!r) return "🚗 路线规划中…";
  return r.km ? `🚗 ${r.km}km · 约 ${r.min} 分钟` : "📍 直线示意（路线规划不可用）";
}

// ---------- 底部任务面板 ----------
function taskHTML(t) {
  const p = t.place && placeById(t.place);
  const pr = PRIORITY[t.priority];
  return `<div class="task ${isDone(t) ? "done" : ""}" data-task="${t.id}">
    <button class="tk-check" data-tact="toggle" aria-label="完成">${isDone(t) ? "✓" : ""}</button>
    <div class="tk-main">
      <div class="tk-title"><span class="tk-pri" style="--pc:${pr.color}">${pr.label}</span>${t.time ? `<span class="tk-time">${t.time}</span>` : ""}${esc(t.title)}</div>
      ${p ? `<span class="tk-place" data-tact="locate">${p.emoji} ${esc(p.name)} ›</span>` : ""}
    </div>
  </div>`;
}

function renderSheet() {
  const el = $("#sheet");
  el.classList.toggle("open", sheetOpen);
  if (mapDay == null) {
    el.innerHTML = `
      <div class="sheet-head" data-sheet="toggle"><i class="grip"></i>
        <div class="sh-title">📅 全部行程 · 已完成 ${progress(TASKS)}</div>
        <div class="sh-sub">选择某一天，查看当天任务和路线</div>
      </div>
      <div class="sheet-body">${DAYS.map((d, i) => `
        <div class="day-row" data-day-pick="${i}">${dayBadge(i)}<span class="dr-name">${esc(d)}</span><span class="dr-prog">${progress(tasksOf(i))} ›</span></div>`).join("")}
      </div>`;
    return;
  }
  const ts = tasksOf(mapDay);
  el.innerHTML = `
    <div class="sheet-head" data-sheet="toggle"><i class="grip"></i>
      <div class="sh-title">${dayBadge(mapDay)} ${esc(DAYS[mapDay])} · 已完成 ${progress(ts)}</div>
      <div class="sh-sub">${routeText(mapDay) || "当天没有需要串联的地点"}</div>
    </div>
    <div class="sheet-body">${ts.map(taskHTML).join("")}</div>`;
}

function onTaskClick(e) {
  const row = e.target.closest("[data-task]");
  if (!row) return false;
  const t = TASKS.find(x => x.id === row.dataset.task);
  const act = e.target.closest("[data-tact]")?.dataset.tact;
  if (act === "toggle") {
    store.done[t.id] = !store.done[t.id];
    save();
    renderSheet(); renderPlan(); renderMapHead();
    if (store.done[t.id]) toast("✅ 已完成");
  }
  if (act === "locate") locatePlace(t.place, t.day);
  return true;
}
$("#sheet").addEventListener("click", e => {
  if (onTaskClick(e)) return;
  if (e.target.closest("[data-sheet=toggle]")) {
    sheetOpen = !sheetOpen;
    $("#sheet").classList.toggle("open", sheetOpen);
  }
});

function locatePlace(id, day) {
  if (currentTab !== "map") goto("map");
  if (day > 0 && day !== mapDay) setDay(day);
  (mapReady || Promise.resolve()).then(() => selectPlace(id));
}

// ---------- 地点卡片 + 周边搜索 ----------
function selectPlace(id) {
  const p = placeById(id);
  if (!p) return;
  activePlace = p;
  clearNearby();
  if (map) {
    markers.forEach((m, k) => m.setzIndex(k === id ? 200 : 100));
    map.panTo(p.lnglat);
  }
  document.querySelectorAll("#amap .pin").forEach(el => el.classList.toggle("on", el.dataset.pin === id));

  const k = KINDS[p.kind];
  $("#mapCard").innerHTML = `
    <div class="mc-head">
      <span class="mc-emoji" style="background:${k.color}1f">${p.emoji}</span>
      <div class="mc-title">
        <div class="mc-name">${esc(p.name)}</div>
        <div class="mc-sub"><span class="mc-kind" style="background:${k.color}">${k.label}</span>${daysOfPlace(id).map(d => `<span class="mc-day" style="color:${DAY_COLORS[d]}">Day${d}</span>`).join("")}${p.address ? esc(p.address) : ""}</div>
      </div>
      <button class="mc-close" data-mact="close" aria-label="关闭">×</button>
    </div>
    ${p.verified === false ? `<div class="mc-warn">⚠️ 示例数据，出发前请核实位置</div>` : ""}
    ${p.desc ? `<div class="mc-desc">${esc(p.desc)}</div>` : ""}
    ${p.bestTime ? `<div class="mc-line">⏰ 最佳时间：${esc(p.bestTime)}</div>` : ""}
    ${(p.tips || []).map(t => `<div class="mc-line">💡 ${esc(t)}</div>`).join("")}
    <div class="mc-actions">
      ${p.note ? `<button data-mact="note">📖 看攻略</button>` : ""}
      <button data-mact="nav" class="primary">🧭 高德导航</button>
    </div>
    <div class="mc-nearby">
      <div class="mc-label">附近设施</div>
      <div class="chips">${NEARBY.map(n => `<span class="chip" data-near="${n.id}">${n.emoji} ${n.label}</span>`).join("")}</div>
      <div class="poi-list" id="mcNearby"></div>
    </div>`;
  $("#mapCard").classList.remove("hidden");
  $("#mapCard").scrollTop = 0;
  $("#sheet").classList.add("hidden");
}

function hidePlaceCard() {
  activePlace = null;
  clearNearby();
  $("#mapCard").classList.add("hidden");
  $("#sheet").classList.remove("hidden");
  document.querySelectorAll("#amap .pin.on").forEach(el => el.classList.remove("on"));
}

function clearNearby() {
  if (map && nearbyMarkers.length) map.remove(nearbyMarkers);
  nearbyMarkers = [];
}

$("#mapCard").addEventListener("click", async e => {
  const p = activePlace;
  if (!p) return;
  const a = e.target.closest("[data-mact]")?.dataset.mact;
  if (a === "close") return hidePlaceCard();
  if (a === "note") return openDetail(p.note);
  if (a === "nav") return window.open(navUrl(p.name, p.lnglat), "_blank");

  const chip = e.target.closest("[data-near]");
  if (!chip) return;
  const n = NEARBY.find(x => x.id === chip.dataset.near);
  document.querySelectorAll("#mapCard [data-near]").forEach(c => c.classList.toggle("active", c === chip));
  const box = $("#mcNearby");
  if (!HAS_KEY) { box.innerHTML = `<div class="poi-empty">配置高德 Key 后可搜索附近${n.label}</div>`; return; }
  box.innerHTML = `<div class="poi-empty">正在搜索附近${n.label}…</div>`;
  const pois = await searchNearby(n.id, p.lnglat).catch(() => null);
  if (activePlace !== p || !chip.classList.contains("active")) return;
  box.innerHTML = pois ? poiListHTML(pois, n) : `<div class="poi-empty">搜索失败，请检查网络或 Key 权限</div>`;
  clearNearby();
  if (map && pois?.length) {
    nearbyMarkers = pois.map(poi => new AMap.Marker({
      position: [poi.location.lng, poi.location.lat],
      anchor: "center",
      content: `<div class="near-pin" title="${esc(poi.name)}">${n.emoji}</div>`,
      zIndex: 90,
    }));
    map.add(nearbyMarkers);
    map.setFitView([markers.get(p.id), ...nearbyMarkers].filter(Boolean), false, [170, 210, 40, 40], 17);
  }
});

// ---------- 图层 / 定位 ----------
function renderLayerPanel() {
  $("#layerPanel").innerHTML = `<div class="lp-title">显示图层</div>` +
    Object.entries(KINDS).map(([k, v]) => `
      <label class="lp-item">
        <input type="checkbox" data-layer="${k}" ${store.layers[k] ? "checked" : ""} />
        <span class="lp-dot" style="background:${v.color}">${v.emoji}</span>${v.label}
        <em>${places.filter(p => p.kind === k).length}</em>
      </label>`).join("") +
    `<div class="lp-tip">公交 / 地铁 / 医院 / 药店 / 公厕等：点开任一地点，在卡片里搜「附近设施」</div>`;
}
$("#layerBtn").addEventListener("click", () => {
  renderLayerPanel();
  $("#layerPanel").classList.toggle("hidden");
});
$("#layerPanel").addEventListener("change", e => {
  const k = e.target.dataset.layer;
  if (!k) return;
  store.layers[k] = e.target.checked;
  save();
  renderMap();
});

$("#locBtn").addEventListener("click", () => {
  if (!map) return toast("配置高德 Key 后可定位");
  toast("定位中…");
  getAmapPosition().then(pos => {
    if (meMarker) map.remove(meMarker);
    meMarker = new AMap.Marker({ position: pos, anchor: "center", content: `<div class="me-dot"></div>`, zIndex: 300 });
    map.add(meMarker);
    map.setZoomAndCenter(15, pos);
  }).catch(() => toast("定位失败，请允许定位权限"));
});

// ---------- 无 Key / 加载失败时的列表 ----------
function showMapEmpty(title, tip) {
  $("#mapEmpty").innerHTML = `
    <div class="me-title">🗺️ ${esc(title)}</div>
    <div class="me-tip">${esc(tip)}</div>
    <div class="me-list" id="meList"></div>`;
  $("#mapEmpty").classList.remove("hidden");
  renderEmptyList();
}
function renderEmptyList() {
  const order = mapDay == null ? [] : routeIds(mapDay);
  const rank = p => (order.includes(p.id) ? order.indexOf(p.id) : 99);
  $("#meList").innerHTML = visiblePlaces().sort((a, b) => rank(a) - rank(b)).map(p => `
    <div class="me-item" data-place="${p.id}">
      <span class="me-emoji" style="background:${KINDS[p.kind].color}1f">${p.emoji}</span>
      <span class="me-name">${order.includes(p.id) ? `<i class="me-order" style="background:${DAY_COLORS[mapDay]}">${rank(p) + 1}</i>` : ""}${esc(p.name)}</span>
      <span class="me-type">${KINDS[p.kind].label} ›</span>
    </div>`).join("");
}
$("#mapEmpty").addEventListener("click", e => {
  const item = e.target.closest("[data-place]");
  if (item) selectPlace(item.dataset.place);
});

// ---------- 行程任务页 ----------
let planFilter = "all";
function renderPlan() {
  const must = TASKS.filter(t => t.priority === "must");
  $("#planProgress").textContent = `全部 ${progress(TASKS)} · 必做 ${progress(must)}（勾选只保存在本机）`;
  $("#planChips").innerHTML = [["all", "全部"], ...Object.entries(PRIORITY).map(([k, v]) => [k, v.label])]
    .map(([k, l]) => `<span class="chip ${planFilter === k ? "active" : ""}" data-pf="${k}">${l}</span>`).join("");
  $("#planList").innerHTML = DAYS.map((d, i) => {
    const ts = tasksOf(i).filter(t => planFilter === "all" || t.priority === planFilter);
    if (!ts.length) return "";
    return `<section class="plan-day">
      <h2>${dayBadge(i)}${esc(d)}<em>${progress(tasksOf(i))}</em></h2>
      ${ts.map(taskHTML).join("")}
    </section>`;
  }).join("");
}
$("#planChips").addEventListener("click", e => {
  const c = e.target.closest("[data-pf]");
  if (!c) return;
  planFilter = c.dataset.pf;
  renderPlan();
});
$("#planList").addEventListener("click", onTaskClick);

// ---------- 应急页 ----------
let sosType = "hospital", sosCenter = null, sosInited = false;
function initSos() {
  if (sosInited) return;
  sosInited = true;
  $("#sosCalls").innerHTML = EMERGENCY_CALLS.map(c => `<a class="sos-call" href="tel:${c.tel}"><b>${c.tel}</b><span>${c.label}</span></a>`).join("");
  $("#sosTips").innerHTML = SAFETY_TIPS.map(t => `<li>${esc(t)}</li>`).join("");
  $("#sosManual").innerHTML = places.filter(p => MANUAL_KINDS.has(p.kind)).map(p => `
    <div class="poi">
      <span class="poi-emoji">${p.emoji}</span>
      <span class="poi-main"><b>${esc(p.name)}${p.verified === false ? `<i class="unverified">待核实</i>` : ""}</b><small>${esc(p.desc)}</small></span>
      <a class="poi-btn" href="${navUrl(p.name, p.lnglat)}" target="_blank" rel="noopener" aria-label="导航">🧭</a>
    </div>`).join("");
  renderSosTypes();
  runSosSearch();
}
function renderSosTypes() {
  $("#sosTypes").innerHTML = NEARBY.filter(n => n.sos)
    .map(n => `<span class="chip ${n.id === sosType ? "active" : ""}" data-sos="${n.id}">${n.emoji} ${n.label}</span>`).join("");
}
$("#sosTypes").addEventListener("click", e => {
  const c = e.target.closest("[data-sos]");
  if (!c) return;
  sosType = c.dataset.sos;
  renderSosTypes();
  runSosSearch();
});
$("#sosWhere").addEventListener("click", e => {
  if (e.target.closest("[data-relocate]")) runSosSearch(true);
});
async function runSosSearch(relocate) {
  const n = NEARBY.find(x => x.id === sosType);
  const box = $("#sosNearby");
  if (!HAS_KEY) {
    box.innerHTML = `<div class="poi-empty">配置高德 Key 后可搜索附近${n.label}。紧急情况请直接拨打上方电话。</div>`;
    return;
  }
  box.innerHTML = `<div class="poi-empty">正在定位并搜索附近${n.label}…</div>`;
  if (!sosCenter || relocate) {
    let where;
    try { sosCenter = await getAmapPosition(); where = "以当前位置为中心"; }
    catch { sosCenter = placeById("oldtown").lnglat; where = "定位失败，以大理古城为中心"; }
    $("#sosWhere").innerHTML = `· ${where} <button data-relocate>重新定位</button>`;
  }
  const type = sosType;
  const pois = await searchNearby(type, sosCenter).catch(() => null);
  if (type !== sosType) return;
  box.innerHTML = pois ? poiListHTML(pois, n) : `<div class="poi-empty">搜索失败，请检查网络。紧急情况请直接拨打上方电话。</div>`;
}

// 复制位置链接：团员点开即可在高德里看到并导航过来
function shareMyLocation() {
  const send = ([lng, lat], coord) =>
    copyText(`【我的位置】${navUrl("我在这里", [(+lng).toFixed(6), (+lat).toFixed(6)], coord)}`, "位置链接已复制，发到群里吧 📤");
  const browserLoc = () => {
    if (!navigator.geolocation) return toast("当前浏览器不支持定位");
    navigator.geolocation.getCurrentPosition(
      pos => send([pos.coords.longitude, pos.coords.latitude], "wgs84"),
      () => toast("定位失败，请允许定位权限"),
      { enableHighAccuracy: true, timeout: 10000 });
  };
  toast("定位中…");
  if (HAS_KEY) getAmapPosition().then(pos => send(pos, "gaode")).catch(browserLoc);
  else browserLoc();
}
document.addEventListener("click", e => {
  if (e.target.closest("[data-share-loc]")) shareMyLocation();
});

goto("map");

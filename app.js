const $ = (s, el = document) => el.querySelector(s);
const SLIDE_MS = 3200;

// ---------- 状态（点赞/收藏/关注/新评论 存 localStorage） ----------
const store = JSON.parse(localStorage.getItem("myTrip") || "{}");
store.liked ??= {}; store.starred ??= {}; store.cLiked ??= {}; store.myComments ??= {}; store.followed ??= false;
const save = () => localStorage.setItem("myTrip", JSON.stringify(store));

const byId = Object.fromEntries(NOTES.map(n => [n.id, n]));
const likeCount = n => n.likes + (store.liked[n.id] ? 1 : 0);
const starCount = n => n.stars + (store.starred[n.id] ? 1 : 0);
const cmtCount = n => n.comments + (store.myComments[n.id]?.length || 0);

function fmt(num) {
  if (num >= 10000) return (num / 10000).toFixed(1).replace(/\.0$/, "") + "w";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(num);
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 1400);
}
function pop(el) {
  el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
}

function toggleLike(id) {
  store.liked[id] = !store.liked[id]; save(); syncCounts(id);
  return store.liked[id];
}
function toggleStar(id) {
  store.starred[id] = !store.starred[id]; save(); syncCounts(id);
  toast(store.starred[id] ? "已收藏 ⭐" : "已取消收藏");
  return store.starred[id];
}
function toggleFollow() {
  store.followed = !store.followed; save();
  document.querySelectorAll("[data-follow]").forEach(paintFollow);
  toast(store.followed ? "关注成功 🎉" : "已取消关注");
}
function paintFollow(el) {
  el.classList.toggle("on", store.followed);
  if (el.classList.contains("follow-btn")) el.textContent = store.followed ? "已关注" : "关注";
  else el.textContent = store.followed ? "✓" : "+";
}
// 所有展示同一笔记计数的地方统一刷新
function syncCounts(id) {
  const n = byId[id];
  document.querySelectorAll(`[data-like="${id}"]`).forEach(el => {
    el.classList.toggle("on", !!store.liked[id]);
    $(".n", el).textContent = fmt(likeCount(n));
    $(".i, .heart", el).textContent = store.liked[id] ? "❤️" : (el.classList.contains("side-btn") ? "🤍" : "♡");
  });
  document.querySelectorAll(`[data-star="${id}"]`).forEach(el => {
    el.classList.toggle("on", !!store.starred[id]);
    $(".n", el).textContent = fmt(starCount(n));
    $(".i", el).textContent = store.starred[id] ? "⭐" : "☆";
  });
  document.querySelectorAll(`[data-cmt="${id}"]`).forEach(el => { $(".n", el).textContent = fmt(cmtCount(n)); });
}

// ---------- 小红书：瀑布流 ----------
let filter = "全部";
function renderChips() {
  const cats = ["全部", ...new Set(NOTES.map(n => n.category))];
  $("#chips").innerHTML = cats.map(c => `<span class="chip ${c === filter ? "active" : ""}" data-cat="${c}">${c}</span>`).join("");
}
function cardHTML(n, i) {
  const s = n.slides[0];
  return `
    <div class="card" data-open="${n.id}" style="animation-delay:${i * 60}ms">
      <div class="cover" style="background:${s.bg};aspect-ratio:1/${n.ratio}">
        <span class="badge">${n.category}</span>
        <span class="pages">1/${n.slides.length}</span>
        <div class="emoji">${s.emoji}</div>
        <div class="ctext">${esc(n.coverText)}</div>
        <div class="csub">${esc(n.coverSub)}</div>
      </div>
      <div class="card-info">
        <div class="card-title">${esc(n.title)}</div>
        <div class="card-foot">
          <span class="mini-author"><span class="av">${AUTHOR.avatar}</span>${AUTHOR.name}</span>
          <span class="like" data-like="${n.id}" data-act="like"><span class="heart">♡</span><span class="n"></span></span>
        </div>
      </div>
    </div>`;
}
function renderFeed() {
  const list = NOTES.filter(n => filter === "全部" || n.category === filter);
  const cols = [$("#col0"), $("#col1")];
  const heights = [0, 0];
  cols.forEach(c => (c.innerHTML = ""));
  list.forEach((n, i) => {
    const k = heights[0] <= heights[1] ? 0 : 1;
    cols[k].insertAdjacentHTML("beforeend", cardHTML(n, i));
    heights[k] += n.ratio + 0.35;
  });
  $("#noteCount").textContent = NOTES.length;
  list.forEach(n => syncCounts(n.id));
}
$("#chips").addEventListener("click", e => {
  const c = e.target.closest("[data-cat]");
  if (!c) return;
  filter = c.dataset.cat;
  renderChips(); renderFeed();
});
$("#masonry").addEventListener("click", e => {
  const like = e.target.closest("[data-act=like]");
  if (like) { e.stopPropagation(); toggleLike(like.dataset.like); return; }
  const card = e.target.closest("[data-open]");
  if (card) openDetail(card.dataset.open);
});

// ---------- 详情页 ----------
let current = null, slideIdx = 0;
function slideHTML(s) {
  return `<div class="slide" style="background:${s.bg}">
    <div class="emoji">${s.emoji}</div>
    <h2>${esc(s.title)}</h2>
    <div class="lines">${s.lines.map(l => `<div class="line">${esc(l)}</div>`).join("")}</div>
  </div>`;
}
function openDetail(id) {
  current = byId[id]; slideIdx = 0;
  const n = current;
  $("#detailAuthor").innerHTML = `<span class="av">${AUTHOR.avatar}</span>${AUTHOR.name}`;
  $("#detailFollow").dataset.follow = ""; paintFollow($("#detailFollow"));
  $("#track").innerHTML = n.slides.map(slideHTML).join("");
  $("#dots").innerHTML = n.slides.map(() => "<i></i>").join("");
  $("#detailTitle").textContent = n.title;
  $("#detailText").textContent = n.content;
  $("#detailTags").innerHTML = n.tags.map(t => `<span>#${esc(t)}</span>`).join("");
  $("#detailMeta").textContent = `编辑于 ${Math.floor(Math.random() * 20) + 1} 天前 · 云南大理`;
  ["barLike", "barStar", "barCmt"].forEach(b => {
    const el = $("#" + b);
    delete el.dataset.like; delete el.dataset.star; delete el.dataset.cmt;
  });
  $("#barLike").dataset.like = id; $("#barStar").dataset.star = id; $("#barCmt").dataset.cmt = id;
  renderComments();
  syncCounts(id);
  goSlide(0);
  $("#detailScroll").scrollTop = 0;
  $("#detail").classList.remove("hidden", "closing");
}
function closeDetail() {
  const d = $("#detail");
  d.classList.add("closing");
  setTimeout(() => d.classList.add("hidden"), 210);
}
function goSlide(i) {
  const total = current.slides.length;
  slideIdx = Math.max(0, Math.min(total - 1, i));
  $("#track").style.transform = `translateX(${-slideIdx * 100}%)`;
  $("#counter").textContent = `${slideIdx + 1}/${total}`;
  [...$("#dots").children].forEach((d, k) => d.classList.toggle("on", k === slideIdx));
}
function renderComments() {
  const n = current;
  const mine = (store.myComments[n.id] || []).map(c => ({ ...c, mine: true }));
  const all = [...mine.reverse(), ...n.commentList];
  $("#commentsTitle").textContent = `共 ${cmtCount(n)} 条评论`;
  $("#commentList").innerHTML = all.map((c, k) => {
    const key = `${n.id}-${c.mine ? "m" + c.time : k}`;
    const on = store.cLiked[key];
    return `<div class="comment">
      <div class="av">${c.avatar}</div>
      <div class="main">
        <div class="name">${esc(c.user)}${c.user === AUTHOR.name || c.mine ? `<span class="tag">${c.mine ? "我" : "作者"}</span>` : ""}</div>
        <div class="txt">${esc(c.text)}</div>
        <div class="time">${c.mine ? "刚刚" : c.time} · 云南</div>
        ${c.reply ? `<div class="reply"><b>${esc(c.reply.user)}</b> <span class="tag" style="font-size:10px;color:#ff2442">作者</span>：${esc(c.reply.text)}</div>` : ""}
      </div>
      <div class="clike ${on ? "on" : ""}" data-ckey="${key}"><span class="h">${on ? "❤️" : "♡"}</span>${fmt((c.likes || 0) + (on ? 1 : 0))}</div>
    </div>`;
  }).join("");
}
$("#commentList").addEventListener("click", e => {
  const b = e.target.closest("[data-ckey]");
  if (!b) return;
  store.cLiked[b.dataset.ckey] = !store.cLiked[b.dataset.ckey]; save();
  renderComments();
});
$("#commentInput").addEventListener("keydown", e => {
  if (e.key !== "Enter" || e.isComposing) return;
  const text = e.target.value.trim();
  if (!text) return;
  (store.myComments[current.id] ??= []).push({ user: "我", avatar: "😊", text, likes: 0, time: Date.now() });
  save();
  e.target.value = "";
  renderComments(); syncCounts(current.id);
  $("#commentList").firstElementChild?.classList.add("new");
  toast("评论成功 💬");
});
$("#commentFocus").addEventListener("click", () => $("#commentInput").focus());
$("#barCmt").addEventListener("click", () => {
  const sc = $("#detailScroll");
  sc.scrollTo({ top: $(".comments").offsetTop - 88, behavior: "smooth" });
});
$("#barLike").addEventListener("click", e => { toggleLike(current.id); pop(e.currentTarget); });
$("#barStar").addEventListener("click", e => { toggleStar(current.id); pop(e.currentTarget); });
$("#detailFollow").addEventListener("click", toggleFollow);
$("#detailBack").addEventListener("click", closeDetail);

// 轮播：拖拽/滑动切图，双击点赞
(() => {
  const car = $("#carousel"), track = $("#track");
  let startX = 0, dx = 0, dragging = false, lastTap = 0;
  car.addEventListener("pointerdown", e => {
    dragging = true; startX = e.clientX; dx = 0;
    track.style.transition = "none";
    car.setPointerCapture(e.pointerId);
  });
  car.addEventListener("pointermove", e => {
    if (!dragging) return;
    dx = e.clientX - startX;
    track.style.transform = `translateX(calc(${-slideIdx * 100}% + ${dx}px))`;
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    track.style.transition = "";
    if (Math.abs(dx) > 50) goSlide(slideIdx + (dx < 0 ? 1 : -1));
    else {
      goSlide(slideIdx);
      const now = Date.now();
      if (Math.abs(dx) < 5 && now - lastTap < 300 && !store.liked[current.id]) {
        toggleLike(current.id); pop($("#barLike"));
      }
      lastTap = now;
    }
  };
  car.addEventListener("pointerup", end);
  car.addEventListener("pointercancel", end);
  document.addEventListener("keydown", e => {
    if ($("#detail").classList.contains("hidden") || document.activeElement === $("#commentInput")) return;
    if (e.key === "ArrowRight") goSlide(slideIdx + 1);
    if (e.key === "ArrowLeft") goSlide(slideIdx - 1);
    if (e.key === "Escape") closeDetail();
  });
})();

// ---------- 抖音：竖屏滑动 ----------
let reelsBuilt = false;
const timers = new Map();
function buildReels() {
  $("#reels").innerHTML = NOTES.map(n => `
    <div class="reel" data-reel="${n.id}">
      <div class="reel-bg">
        ${n.slides.map(s => `
          <div class="reel-slide" style="background:${s.bg}">
            <div class="emoji">${s.emoji}</div>
            <h2>${esc(s.title)}</h2>
            ${s.lines.map(l => `<div class="line">${esc(l)}</div>`).join("")}
          </div>`).join("")}
      </div>
      <div class="reel-shade"></div>
      <div class="reel-side">
        <div class="reel-avatar">${AUTHOR.avatar}<span class="plus" data-follow></span></div>
        <button class="side-btn like" data-like="${n.id}" data-ract="like"><span class="i">🤍</span><span class="n"></span></button>
        <button class="side-btn" data-cmt="${n.id}" data-ract="open"><span class="i">💬</span><span class="n"></span></button>
        <button class="side-btn star" data-star="${n.id}" data-ract="star"><span class="i">☆</span><span class="n"></span></button>
        <button class="side-btn" data-share><span class="i">↪️</span><span class="n">分享</span></button>
        <div class="disc">🎵</div>
      </div>
      <div class="reel-info">
        <span class="loc">📍 云南 · 大理</span>
        <div class="who">@${AUTHOR.name}</div>
        <div class="cap">${esc(n.title)} ${n.tags.slice(0, 3).map(t => `<span class="t">#${esc(t)}</span>`).join("")}</div>
        <div class="music"><span>♫ ${esc(n.music)} · ${AUTHOR.name}创作的原声</span></div>
        <span class="reel-detail-link" data-ract="open">📖 查看完整图文攻略 ›</span>
      </div>
      <div class="reel-progress">${n.slides.map(() => "<i><b></b></i>").join("")}</div>
    </div>`).join("");
  document.querySelectorAll("#reels [data-follow]").forEach(paintFollow);
  NOTES.forEach(n => syncCounts(n.id));

  const io = new IntersectionObserver(entries => {
    entries.forEach(en => (en.intersectionRatio > 0.6 ? playReel(en.target) : stopReel(en.target)));
  }, { root: $("#reels"), threshold: [0, 0.6] });
  document.querySelectorAll(".reel").forEach(r => io.observe(r));
  reelsBuilt = true;
}
function playReel(reel) {
  stopReel(reel);
  const slides = reel.querySelectorAll(".reel-slide");
  const bars = reel.querySelectorAll(".reel-progress i");
  let i = 0;
  const show = () => {
    slides.forEach((s, k) => s.classList.toggle("on", k === i));
    bars.forEach((b, k) => {
      const fill = b.firstElementChild;
      b.classList.toggle("done", k < i);
      fill.style.transition = "none";
      fill.style.width = k < i ? "100%" : "0";
      if (k === i) requestAnimationFrame(() => requestAnimationFrame(() => {
        fill.style.transition = `width ${SLIDE_MS}ms linear`;
        fill.style.width = "100%";
      }));
    });
    i = (i + 1) % slides.length;
  };
  show();
  timers.set(reel, setInterval(show, SLIDE_MS));
}
function stopReel(reel) {
  clearInterval(timers.get(reel));
  timers.delete(reel);
}
$("#reels").addEventListener("click", e => {
  const reel = e.target.closest(".reel");
  if (!reel) return;
  const id = reel.dataset.reel;
  if (e.target.closest("[data-follow]")) return toggleFollow();
  const act = e.target.closest("[data-ract]");
  if (act) {
    const a = act.dataset.ract;
    if (a === "like") { toggleLike(id); pop(act); }
    if (a === "star") { toggleStar(id); pop(act); }
    if (a === "open") openDetail(id);
  }
});
$("#reels").addEventListener("dblclick", e => {
  const reel = e.target.closest(".reel");
  if (!reel || e.target.closest(".reel-side, [data-ract]")) return;
  const rect = reel.getBoundingClientRect();
  const h = document.createElement("div");
  h.className = "big-heart"; h.textContent = "❤️";
  h.style.left = e.clientX - rect.left + "px";
  h.style.top = e.clientY - rect.top + "px";
  h.style.setProperty("--r", `${Math.random() * 40 - 20}deg`);
  reel.appendChild(h);
  setTimeout(() => h.remove(), 800);
  const id = reel.dataset.reel;
  if (!store.liked[id]) { toggleLike(id); pop(reel.querySelector(".side-btn.like")); }
});

// ---------- 模式切换 / 顶部 Tab / 分享 ----------
function setMode(mode) {
  const video = mode === "video";
  document.querySelectorAll("#modeSwitch button").forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
  $("#feed").classList.toggle("hidden", video);
  $("#reels").classList.toggle("hidden", !video);
  ["#topbar", "#modeSwitch", "#bottombar"].forEach(s => $(s).classList.toggle("dark", video));
  if (video) {
    if (!reelsBuilt) buildReels();
  } else {
    timers.forEach((_, r) => stopReel(r));
    if (reelsBuilt) {
      // 回到竖屏时由 IntersectionObserver 重新触发播放
      $("#reels").innerHTML = ""; reelsBuilt = false;
    }
  }
}
$("#modeSwitch").addEventListener("click", e => {
  const b = e.target.closest("[data-mode]");
  if (b) setMode(b.dataset.mode);
});
$("#tabs").addEventListener("click", e => {
  const t = e.target.closest("[data-tab]");
  if (!t) return;
  document.querySelectorAll("#tabs span").forEach(s => s.classList.toggle("active", s === t));
  if (t.dataset.tab === "follow" && !store.followed) toast("先关注博主，才能看到更新哦～");
});
document.addEventListener("click", async e => {
  if (!e.target.closest("[data-share]")) return;
  try { await navigator.clipboard.writeText(location.href); toast("链接已复制，快去分享吧 🔗"); }
  catch { toast("分享成功 🔗"); }
});

renderChips();
renderFeed();

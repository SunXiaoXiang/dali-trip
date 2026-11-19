// 每篇笔记 = 一组「图片页」(slides) + 正文 + 评论。
// slide.bg 为 CSS 渐变，emoji 作为主视觉，lines 为图上的贴纸文字。
const AUTHOR = { name: "阿翔去旅行", avatar: "🧳", fans: "12.8w" };

const NOTES = [
  {
    id: "overview",
    category: "行程",
    title: "大理5天4晚保姆级攻略｜人均2000玩到爽🌊",
    coverText: "大理5天4晚\n保姆级攻略",
    coverSub: "人均2000 · 不踩雷",
    ratio: 1.33,
    likes: 23856, stars: 18420, comments: 1288,
    music: "陈粒 - 走马",
    tags: ["大理旅游攻略", "云南旅行", "洱海", "保姆级攻略", "穷游"],
    slides: [
      { bg: "linear-gradient(160deg,#4facfe,#00f2fe)", emoji: "🏔️", title: "大理 5天4晚", lines: ["苍山 · 洱海 · 古城 · 双廊", "人均 ¥2000 含住宿", "📌 建议收藏再看"] },
      { bg: "linear-gradient(160deg,#a18cd1,#fbc2eb)", emoji: "📅", title: "Day1 抵达古城", lines: ["✈️ 落地大理机场 → 古城 40min", "🏮 人民路 / 洋人街闲逛", "🍜 晚餐：喜洲粑粑 + 饵丝"] },
      { bg: "linear-gradient(160deg,#43e97b,#38f9d7)", emoji: "🚲", title: "Day2 洱海西线", lines: ["🌅 才村码头看日出", "🚲 骑行 S 弯 → 廊桥 → 磻溪", "📸 网红秋千 & 天空之境"] },
      { bg: "linear-gradient(160deg,#fa709a,#fee140)", emoji: "🏞️", title: "Day3 苍山+喜洲", lines: ["🚡 洗马潭索道（提前预约！）", "🌾 喜洲古镇 · 麦田 · 稻田", "🥮 必吃：喜洲粑粑 Top1"] },
      { bg: "linear-gradient(160deg,#30cfd0,#330867)", emoji: "🌙", title: "Day4 双廊环湖东", lines: ["🏝️ 双廊古镇 · 南诏风情岛", "🌇 挖色看日落超出片", "🏨 住一晚海景房"] },
      { bg: "linear-gradient(160deg,#f6d365,#fda085)", emoji: "🛍️", title: "Day5 返程", lines: ["☕ 古城咖啡馆 brunch", "🎁 伴手礼：鲜花饼 / 扎染", "✈️ 下午返程"] },
    ],
    content:
`姐妹们！这次大理真的玩得太舒服了😭 整理了一份保姆级攻略，照着走不踩雷👇

📍 路线：古城 → 洱海西线 → 苍山/喜洲 → 双廊 → 古城
💰 人均：¥2000（不含大交通）
🗓️ 最佳时间：3-5月 / 9-11月，避开国庆！

✅ 住宿建议：前两晚住古城（方便），第四晚住双廊海景房（氛围感拉满）
✅ 交通：古城租电动车 ¥80/天，环洱海建议包车 ¥400/天
✅ 防晒！防晒！防晒！紫外线是真的强☀️

有问题评论区问我，看到都会回～`,
    commentList: [
      { user: "小鹿乱撞", avatar: "🦌", text: "太及时了！下个月刚好去，已收藏🥹", likes: 892, time: "2天前", reply: { user: AUTHOR.name, text: "冲！记得带防晒～" } },
      { user: "云南本地人", avatar: "🌻", text: "很实在的攻略，补充一下：洱海东线比西线人少很多", likes: 541, time: "3天前" },
      { user: "Momo", avatar: "🐱", text: "索道一定要提前预约吗？", likes: 233, time: "5天前", reply: { user: AUTHOR.name, text: "旺季一定要！至少提前3天" } },
    ],
  },
  {
    id: "food",
    category: "美食",
    title: "大理古城必吃10家🔥本地人带路不踩雷",
    coverText: "大理古城\n必吃TOP10",
    coverSub: "本地人私藏",
    ratio: 1.15,
    likes: 15632, stars: 12087, comments: 864,
    music: "赵雷 - 成都",
    tags: ["大理美食", "古城美食", "云南美食", "吃货"],
    slides: [
      { bg: "linear-gradient(160deg,#ff9a9e,#fecfef)", emoji: "🍜", title: "古城必吃 TOP10", lines: ["吃了 5 天总结的", "人均 ¥30 吃到撑", "🔥 闭眼冲系列"] },
      { bg: "linear-gradient(160deg,#f093fb,#f5576c)", emoji: "🥘", title: "正餐推荐", lines: ["① 段公子 · 白族菜 ¥60", "② 酸辣鱼一条街 ¥80", "③ 菌子火锅（7-9月限定）"] },
      { bg: "linear-gradient(160deg,#ffecd2,#fcb69f)", emoji: "🥮", title: "小吃推荐", lines: ["④ 喜洲粑粑 ¥8", "⑤ 烤乳扇 ¥5", "⑥ 饵丝 / 米线 ¥15"] },
      { bg: "linear-gradient(160deg,#84fab0,#8fd3f4)", emoji: "🧋", title: "饮品甜品", lines: ["⑦ 玫瑰木瓜水 ¥10", "⑧ 云南小粒咖啡 ¥28", "⑨ 鲜花饼现烤 ¥6"] },
      { bg: "linear-gradient(160deg,#fccb90,#d57eeb)", emoji: "⚠️", title: "避雷提醒", lines: ["❌ 人民路门口拉客的别去", "❌ 菌子一定要炒熟！", "✅ 看本地人排队的准没错"] },
    ],
    content:
`在大理吃了5天，体重+3斤😂 这10家是我反复去的！

🔥 最爱：喜洲粑粑（咸甜都要）+ 玫瑰木瓜水，夏天绝配
🍄 7-9月一定要吃菌子火锅，见手青yyds（但一定要煮熟！）
☕ 古城咖啡馆很多，随便进一家都很出片

💡 Tips：古城里的店晚上 9 点后基本都关了，夜宵去北门菜市场～`,
    commentList: [
      { user: "干饭人", avatar: "🍚", text: "乳扇真的好吃！但不是每个人都能接受哈哈", likes: 420, time: "1天前" },
      { user: "七七", avatar: "🌸", text: "菌子火锅人均多少呀", likes: 186, time: "2天前", reply: { user: AUTHOR.name, text: "两个人大概 ¥200 左右～" } },
    ],
  },
  {
    id: "photo",
    category: "拍照",
    title: "洱海8个出片机位📸 随手一拍就是壁纸",
    coverText: "洱海\n8个神仙机位",
    coverSub: "附拍摄时间",
    ratio: 1.45,
    likes: 31204, stars: 26530, comments: 1547,
    music: "房东的猫 - 云烟成雨",
    tags: ["大理拍照", "洱海机位", "旅行拍照", "出片"],
    slides: [
      { bg: "linear-gradient(160deg,#89f7fe,#66a6ff)", emoji: "📸", title: "洱海 8 个机位", lines: ["附最佳拍摄时间", "手机就能拍", "📍 建议收藏"] },
      { bg: "linear-gradient(160deg,#fdfbfb,#a1c4fd)", emoji: "🪞", title: "① 天空之境", lines: ["📍 磻溪村 S 弯", "⏰ 无风的清晨", "💡 手机倒置贴近水面"] },
      { bg: "linear-gradient(160deg,#ffecd2,#a1c4fd)", emoji: "🌉", title: "② 廊桥", lines: ["📍 洱海生态廊道", "⏰ 傍晚 6-7 点", "💡 逆光拍剪影绝美"] },
      { bg: "linear-gradient(160deg,#a1ffce,#faffd1)", emoji: "🌾", title: "③ 喜洲麦田", lines: ["📍 喜洲古镇外", "⏰ 3-4月 绿麦 / 9月 金稻", "💡 穿白裙/草帽"] },
      { bg: "linear-gradient(160deg,#fbc2eb,#a6c1ee)", emoji: "🎠", title: "④ 网红秋千", lines: ["📍 才村码头", "⏰ 日出 7:00 左右", "💡 排队要早，人少"] },
      { bg: "linear-gradient(160deg,#ff9a8b,#ff6a88)", emoji: "🌇", title: "⑤-⑧ 更多机位", lines: ["⑤ 挖色日落", "⑥ 双廊玉几岛", "⑦ 小普陀  ⑧ 龙龛码头"] },
    ],
    content:
`整理了洱海最出片的8个机位📸 手机拍也绝美！

🪞 天空之境：一定要选无风的早上，水面才会像镜子
🌉 廊桥日落：傍晚逆光拍剪影，氛围感直接拉满
🌾 喜洲田野：3-4月是绿色麦田，9月是金色稻田

👗 穿搭建议：白色/浅色系 + 草帽，和蓝天洱海最配
📱 参数：iPhone 用 0.5x 广角，人站画面 1/3 处`,
    commentList: [
      { user: "摄影小白", avatar: "📷", text: "按照博主的机位拍了，朋友都以为我请了摄影师😂", likes: 1203, time: "4天前" },
      { user: "Luna", avatar: "🌙", text: "天空之境是不是要看运气呀", likes: 302, time: "6天前", reply: { user: AUTHOR.name, text: "对的，早上 7-8 点概率最大" } },
    ],
  },
  {
    id: "avoid",
    category: "避坑",
    title: "去大理前一定要看‼️ 12条避坑指南",
    coverText: "大理避坑\n12条‼️",
    coverSub: "血泪教训",
    ratio: 1.0,
    likes: 42310, stars: 38102, comments: 2306,
    music: "毛不易 - 消愁",
    tags: ["大理避坑", "旅游避坑", "云南旅游", "干货"],
    slides: [
      { bg: "linear-gradient(160deg,#ff0844,#ffb199)", emoji: "‼️", title: "大理避坑 12 条", lines: ["都是血泪教训", "看完少花 ¥500", "转给一起去的TA"] },
      { bg: "linear-gradient(160deg,#f77062,#fe5196)", emoji: "🚕", title: "交通篇", lines: ["❌ 机场门口黑车别坐", "❌ 环海一日游低价团", "✅ 打车用正规平台"] },
      { bg: "linear-gradient(160deg,#e0c3fc,#8ec5fc)", emoji: "🏨", title: "住宿篇", lines: ["❌ 照片过度美颜的海景房", "❌ 古城酒吧街附近很吵", "✅ 看最新带图差评"] },
      { bg: "linear-gradient(160deg,#fddb92,#d1fdff)", emoji: "💍", title: "购物篇", lines: ["❌ 翡翠/玉石店慎入", "❌ 古城“老板娘回老家”清仓", "✅ 伴手礼去超市买"] },
      { bg: "linear-gradient(160deg,#c1dfc4,#deecdd)", emoji: "🧴", title: "身体篇", lines: ["☀️ 紫外线超强必备防晒", "🌡️ 早晚温差大带外套", "🍄 菌子没熟 = 看见小人"] },
    ],
    content:
`第二次去大理才发现，第一次被坑了好多😭 总结12条，转给要去的朋友！

🚕 交通：机场出口拉客的不要理，正规打车到古城 ¥80 左右
🏨 住宿：古城人民路/洋人街附近酒吧到凌晨，浅眠选北门
💍 购物：任何「玉石」「翡翠」「茶叶」低价团都是坑
☀️ 身体：海拔 2000m，紫外线强，SPF50 + 墨镜 + 帽子

看完记得点赞收藏，出发前再翻一遍✅`,
    commentList: [
      { user: "踩过坑的人", avatar: "😭", text: "第3条真的！我就是被拉进玉石店了…", likes: 2108, time: "1天前" },
      { user: "阿杰", avatar: "🧢", text: "补充：洱海边骑车注意安全，路窄车多", likes: 876, time: "3天前", reply: { user: AUTHOR.name, text: "非常重要！感谢补充🙏" } },
    ],
  },
  {
    id: "stay",
    category: "住宿",
    title: "大理住宿怎么选？古城vs双廊vs海西🏡",
    coverText: "大理住哪里\n一篇说清楚",
    coverSub: "附价格参考",
    ratio: 1.25,
    likes: 9821, stars: 8732, comments: 512,
    music: "宋冬野 - 斑马斑马",
    tags: ["大理民宿", "大理住宿", "海景房", "民宿推荐"],
    slides: [
      { bg: "linear-gradient(160deg,#667eea,#764ba2)", emoji: "🏡", title: "大理住哪里？", lines: ["4 个区域对比", "附价格参考", "按需求选不纠结"] },
      { bg: "linear-gradient(160deg,#ffd3a5,#fd6585)", emoji: "🏮", title: "古城 ⭐⭐⭐⭐⭐", lines: ["💰 ¥150-400/晚", "👍 吃喝方便 · 交通枢纽", "👎 商业化 · 晚上吵"] },
      { bg: "linear-gradient(160deg,#4facfe,#43e97b)", emoji: "🌊", title: "双廊 ⭐⭐⭐⭐", lines: ["💰 ¥400-1200/晚", "👍 推窗即洱海", "👎 远 · 吃饭贵"] },
      { bg: "linear-gradient(160deg,#c2e9fb,#a1c4fd)", emoji: "🌿", title: "海西/喜洲 ⭐⭐⭐⭐", lines: ["💰 ¥300-800/晚", "👍 安静 · 田园风", "👎 需自驾/包车"] },
      { bg: "linear-gradient(160deg,#ffecd2,#fcb69f)", emoji: "💡", title: "我的建议", lines: ["古城 2 晚 + 双廊 1 晚", "+ 喜洲 1 晚", "体验感最丰富 ✨"] },
    ],
    content:
`经常被问住哪里，一篇说清楚👇

🏮 古城：第一次去首选，吃喝玩都方便
🌊 双廊：推窗就是洱海，适合情侣/度假，但贵
🌿 喜洲/海西：安静的田园风，适合躺平发呆

💡 我的方案：古城2晚 + 双廊1晚 + 喜洲1晚，换着住体验最丰富！
⚠️ 预订前一定看带图差评，海景房照片很多是广角+滤镜`,
    commentList: [
      { user: "躺平星人", avatar: "🛌", text: "喜洲的民宿真的太舒服了，推荐！", likes: 312, time: "2天前" },
    ],
  },
  {
    id: "budget",
    category: "预算",
    title: "大理5天花了多少钱💰 明细账单公开",
    coverText: "5天花费\n¥1986",
    coverSub: "明细账单",
    ratio: 1.3,
    likes: 12480, stars: 10230, comments: 689,
    music: "朴树 - 平凡之路",
    tags: ["大理穷游", "旅行预算", "花费明细", "学生党"],
    slides: [
      { bg: "linear-gradient(160deg,#11998e,#38ef7d)", emoji: "💰", title: "5 天总花费 ¥1986", lines: ["不含往返大交通", "两人出行人均", "学生党可再省 30%"] },
      { bg: "linear-gradient(160deg,#fbd786,#f7797d)", emoji: "🏨", title: "住宿 ¥860", lines: ["古城 2 晚 ¥360", "喜洲 1 晚 ¥200", "双廊海景 1 晚 ¥300"] },
      { bg: "linear-gradient(160deg,#ee9ca7,#ffdde1)", emoji: "🍽️", title: "餐饮 ¥520", lines: ["日均约 ¥100", "菌子火锅 ¥100（AA）", "小吃饮品 ¥120"] },
      { bg: "linear-gradient(160deg,#a8edea,#fed6e3)", emoji: "🚗", title: "交通+门票 ¥606", lines: ["包车环海 ¥200（AA）", "苍山索道 ¥286", "电动车/打车 ¥120"] },
    ],
    content:
`很多人问去大理要多少钱，直接公开账单💰

🏨 住宿 ¥860（4晚）
🍽️ 餐饮 ¥520
🚗 交通 ¥320
🎫 门票 ¥286
————————
合计 ¥1986/人

💡 省钱小技巧：
1️⃣ 环海包车找人拼，能省一半
2️⃣ 苍山不坐索道，徒步也很美
3️⃣ 住古城青旅，¥60/晚`,
    commentList: [
      { user: "学生党", avatar: "🎒", text: "这个预算很友好！准备暑假去", likes: 401, time: "3天前" },
    ],
  },
  {
    id: "transport",
    category: "交通",
    title: "大理交通全攻略🚗 怎么去+怎么玩",
    coverText: "大理交通\n一图看懂",
    coverSub: "飞机/高铁/包车",
    ratio: 1.1,
    likes: 7654, stars: 6890, comments: 345,
    music: "许巍 - 蓝莲花",
    tags: ["大理交通", "环洱海", "包车", "自驾"],
    slides: [
      { bg: "linear-gradient(160deg,#5ee7df,#b490ca)", emoji: "🚄", title: "怎么到大理", lines: ["✈️ 飞大理机场（航班少）", "✈️ 飞昆明 + 高铁 2h", "🚄 丽江 → 大理 1.5h"] },
      { bg: "linear-gradient(160deg,#d299c2,#fef9d7)", emoji: "🛵", title: "古城内", lines: ["🚶 步行就够了", "🛵 电动车 ¥80/天", "🚕 打车起步 ¥8"] },
      { bg: "linear-gradient(160deg,#9890e3,#b1f4cf)", emoji: "🚙", title: "环洱海", lines: ["🚙 包车 ¥400/天（推荐）", "🚗 自驾租车 ¥150/天", "🚲 骑行只建议西线一段"] },
    ],
    content:
`🚄 到大理：昆明南站高铁到大理约2小时，班次多很方便
🚙 环洱海：一圈约130km，强烈建议包车，司机还能帮拍照📸
🛵 古城周边：租电动车很方便，记得戴头盔

⚠️ 洱海生态廊道部分路段禁止机动车，只能骑行/步行`,
    commentList: [
      { user: "自驾达人", avatar: "🚗", text: "自驾环湖一天足够了，东线风景更好", likes: 156, time: "1周前" },
    ],
  },
  {
    id: "packing",
    category: "清单",
    title: "大理出行必备清单✅ 照着带不慌",
    coverText: "大理出行\n必带清单✅",
    coverSub: "可直接截图",
    ratio: 1.38,
    likes: 18230, stars: 21056, comments: 432,
    music: "阿肆 - 世界上的另一个我",
    tags: ["旅行清单", "出行必备", "大理旅游", "收藏"],
    slides: [
      { bg: "linear-gradient(160deg,#fff1eb,#ace0f9)", emoji: "🎒", title: "出行必备清单", lines: ["截图保存 ✅", "照着打包不慌", "分三类整理"] },
      { bg: "linear-gradient(160deg,#ffe29f,#ffa99f)", emoji: "☀️", title: "防晒类", lines: ["☐ SPF50 防晒霜", "☐ 墨镜 + 遮阳帽", "☐ 防晒衣 / 冰袖"] },
      { bg: "linear-gradient(160deg,#c3cfe2,#f5f7fa)", emoji: "👗", title: "衣物类", lines: ["☐ 薄外套（早晚凉）", "☐ 拍照长裙 / 白衬衫", "☐ 舒适运动鞋"] },
      { bg: "linear-gradient(160deg,#d4fc79,#96e6a1)", emoji: "💊", title: "其他", lines: ["☐ 充电宝 + 自拍杆", "☐ 保湿面霜（很干）", "☐ 肠胃药 / 晕车药"] },
    ],
    content:
`出发前照着这个清单打包，不会落东西✅

☀️ 防晒是重中之重！大理海拔高，晒一天就黑一度
🧥 早晚温差10度以上，一定要带外套
💧 气候干燥，保湿面霜和润唇膏必带

截图保存，打包时一项项打勾～`,
    commentList: [
      { user: "J人", avatar: "📋", text: "J人狂喜！已截图", likes: 520, time: "2天前" },
    ],
  },
];

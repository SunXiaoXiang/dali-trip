// 旅行助手数据：地点 / 每日任务 / 周边设施类型 / 应急信息。
// 坐标为 GCJ-02（高德坐标系）。config.js 中 source 设为 "amap" 时，
// 会用 keyword（缺省为 name）走高德 POI 搜索校准坐标与地址。

const TRIP = { title: "大理 5天4晚", city: "大理", center: [100.2, 25.78] };

// day 0 为出发前准备
const DAYS = ["出发前", "抵达古城", "洱海西线", "苍山+喜洲", "双廊环湖东", "返程"];

const KINDS = {
  sight:     { label: "景点",       emoji: "🏞️", color: "#00b578" },
  food:      { label: "美食",       emoji: "🍜", color: "#ff8f1f" },
  checkin:   { label: "打卡点",     emoji: "📍", color: "#ff2442" },
  photo:     { label: "拍摄点",     emoji: "📸", color: "#7c5cff" },
  stay:      { label: "住宿",       emoji: "🏨", color: "#1677ff" },
  transport: { label: "交通枢纽",   emoji: "🚉", color: "#5b6b7f" },
  didi:      { label: "滴滴上车点", emoji: "🚕", color: "#f5a000" },
  access:    { label: "电梯/无障碍", emoji: "🛗", color: "#13a8a8" },
};
// 服务类设施不随「按天筛选」隐藏
const ALWAYS_ON = new Set(["didi", "access", "transport"]);

// verified: false 表示示例数据，出发前请实地/电话核实后改为 true
const PLACES = [
  { id: "airport", name: "大理凤仪机场", kind: "transport", emoji: "✈️", lnglat: [100.3210, 25.6470], desc: "到古城打车约 40 分钟，正规平台 ¥80 左右", tips: ["出口拉客的黑车不要坐"], note: "transport" },
  { id: "station", name: "大理站", kind: "transport", emoji: "🚄", lnglat: [100.2506, 25.5896], desc: "昆明南站高铁约 2 小时，班次多", note: "transport" },
  { id: "oldtown", name: "大理古城", kind: "checkin", emoji: "🏮", lnglat: [100.1640, 25.6948], desc: "第一次去首选住这里，吃喝玩都方便", tips: ["浅眠选北门附近，酒吧街到凌晨"], note: "stay" },
  { id: "renmin", name: "人民路", keyword: "大理古城人民路", kind: "food", emoji: "🍜", lnglat: [100.1600, 25.6928], desc: "喜洲粑粑、饵丝、烤乳扇", bestTime: "傍晚到 21:00（之后多数关门）", tips: ["门口拉客的店别去"], note: "food" },
  { id: "beimen", name: "北门菜市场", keyword: "大理古城北门菜市场", kind: "food", emoji: "🛍️", lnglat: [100.1571, 25.6982], desc: "伴手礼（鲜花饼/扎染）+ 夜宵", note: "food" },
  { id: "caicun", name: "才村码头", kind: "photo", emoji: "🎠", lnglat: [100.1936, 25.7187], desc: "日出 + 网红秋千", bestTime: "日出前后 6:40-7:30", tips: ["秋千要早去排队"], note: "photo" },
  { id: "panxi", name: "磻溪村 S 弯", keyword: "磻溪S湾", kind: "photo", emoji: "🪞", lnglat: [100.1505, 25.7669], desc: "天空之境", bestTime: "无风的清晨 7-8 点", tips: ["手机倒置贴近水面", "0.5x 广角，人站 1/3 处"], note: "photo" },
  { id: "longkan", name: "龙龛码头", kind: "photo", emoji: "🌉", lnglat: [100.2073, 25.6968], desc: "生态廊道廊桥，逆光剪影", bestTime: "傍晚 18:00-19:00", note: "photo" },
  { id: "cangshan", name: "苍山洗马潭索道", kind: "sight", emoji: "🚡", lnglat: [100.1388, 25.6678], desc: "索道 ¥286，山顶海拔近 4000m", tips: ["旺季至少提前 3 天预约", "山顶冷，带外套"], note: "overview" },
  { id: "xizhou", name: "喜洲古镇", kind: "sight", emoji: "🌾", lnglat: [100.1316, 25.8529], desc: "白族古镇 + 麦田/稻田，必吃喜洲粑粑", bestTime: "3-4 月绿麦 / 9 月金稻", tips: ["穿白裙/草帽最出片"], note: "photo" },
  { id: "xiaoputuo", name: "小普陀", keyword: "大理小普陀", kind: "sight", emoji: "🛕", lnglat: [100.2230, 25.8075], desc: "洱海中的小岛，东线顺路打卡", note: "photo" },
  { id: "wase", name: "挖色", keyword: "挖色镇", kind: "food", emoji: "🐟", lnglat: [100.2257, 25.8289], desc: "东线人少，午饭吃酸辣鱼", note: "food" },
  { id: "nanzhao", name: "南诏风情岛", kind: "sight", emoji: "🏝️", lnglat: [100.1915, 25.9021], desc: "双廊对面的小岛，白族风情建筑", note: "overview" },
  { id: "shuanglang", name: "双廊古镇", kind: "stay", emoji: "🌊", lnglat: [100.1943, 25.9083], desc: "海景房 ¥400-1200/晚，推窗即洱海", bestTime: "日落看苍山方向", tips: ["预订前看带图差评"], note: "stay" },

  // 以下为手工维护的服务设施，示例数据需出发前核实
  { id: "didi-airport", name: "机场网约车上车点", kind: "didi", emoji: "🚕", lnglat: [100.3188, 25.6487], desc: "按到达层指示牌前往网约车专用通道", verified: false },
  { id: "didi-station", name: "大理站网约车上车点", kind: "didi", emoji: "🚕", lnglat: [100.2496, 25.5894], desc: "出站后按「网约车」指示牌走", verified: false },
  { id: "didi-nanmen", name: "古城南门上车点", kind: "didi", emoji: "🚕", lnglat: [100.1687, 25.6880], desc: "南门生态停车场附近；古城内部分路段禁行，到城门外打车更快", verified: false },
  { id: "lift-station", name: "大理站无障碍电梯", kind: "access", emoji: "🛗", lnglat: [100.2508, 25.5899], desc: "大件行李/老人可走无障碍电梯进出站", verified: false },
  { id: "lift-cangshan", name: "索道站无障碍通道", kind: "access", emoji: "♿", lnglat: [100.1392, 25.6682], desc: "索道下站在天龙八部影视城内，行动不便可咨询工作人员走无障碍通道", verified: false },
];

// priority: must 必做 / should 推荐 / optional 可选。同一天按顺序生成路线
const TASKS = [
  { id: "d0-1", day: 0, priority: "must", title: "预约苍山洗马潭索道（旺季提前 3 天）", place: "cangshan" },
  { id: "d0-2", day: 0, priority: "must", title: "订住宿：古城 2 晚 + 喜洲 1 晚 + 双廊 1 晚", place: "shuanglang" },
  { id: "d0-3", day: 0, priority: "should", title: "打包：SPF50 防晒、外套、充电宝、肠胃药" },
  { id: "d0-4", day: 0, priority: "optional", title: "高德地图下载大理离线包" },

  { id: "d1-1", day: 1, time: "10:00", priority: "must", title: "落地机场，正规平台打车去古城", place: "airport" },
  { id: "d1-2", day: 1, time: "12:00", priority: "must", title: "入住古城民宿", place: "oldtown" },
  { id: "d1-3", day: 1, time: "15:00", priority: "should", title: "人民路 / 洋人街闲逛", place: "renmin" },
  { id: "d1-4", day: 1, time: "18:30", priority: "optional", title: "晚餐：喜洲粑粑 + 饵丝", place: "renmin" },

  { id: "d2-1", day: 2, time: "06:40", priority: "must", title: "才村码头看日出", place: "caicun" },
  { id: "d2-2", day: 2, time: "07:30", priority: "should", title: "网红秋千拍照（趁人少）", place: "caicun" },
  { id: "d2-3", day: 2, time: "09:00", priority: "must", title: "骑行 S 弯，拍天空之境", place: "panxi" },
  { id: "d2-4", day: 2, time: "18:00", priority: "should", title: "龙龛码头廊桥拍日落剪影", place: "longkan" },

  { id: "d3-1", day: 3, time: "08:30", priority: "must", title: "洗马潭索道上苍山（带外套）", place: "cangshan" },
  { id: "d3-2", day: 3, time: "14:00", priority: "must", title: "喜洲古镇 + 田野拍照", place: "xizhou" },
  { id: "d3-3", day: 3, time: "15:30", priority: "should", title: "吃喜洲粑粑（Top1）", place: "xizhou" },
  { id: "d3-4", day: 3, priority: "optional", title: "住喜洲民宿，晚上安静躺平" },

  { id: "d4-1", day: 4, time: "10:00", priority: "should", title: "小普陀打卡", place: "xiaoputuo" },
  { id: "d4-2", day: 4, time: "12:00", priority: "optional", title: "挖色午饭：酸辣鱼", place: "wase" },
  { id: "d4-3", day: 4, time: "14:30", priority: "should", title: "南诏风情岛", place: "nanzhao" },
  { id: "d4-4", day: 4, time: "17:00", priority: "must", title: "入住双廊海景房，看日落", place: "shuanglang" },

  { id: "d5-1", day: 5, time: "09:30", priority: "must", title: "退房，包车回古城", place: "shuanglang" },
  { id: "d5-2", day: 5, time: "11:00", priority: "should", title: "北门菜市场买伴手礼", place: "beimen" },
  { id: "d5-3", day: 5, time: "14:00", priority: "must", title: "去机场返程（提前 2 小时到）", place: "airport" },
];

// 高德 POI 分类编码：https://lbs.amap.com/api/webservice/download
const NEARBY = [
  { id: "bus",      label: "公交站", emoji: "🚌", type: "150700" },
  { id: "metro",    label: "地铁站", emoji: "🚇", type: "150500", radius: 5000 },
  { id: "hospital", label: "医院",   emoji: "🏥", type: "090100", radius: 10000, sos: true },
  { id: "pharmacy", label: "药店",   emoji: "💊", type: "090601", sos: true },
  { id: "police",   label: "派出所", emoji: "👮", type: "130501", radius: 5000, sos: true },
  { id: "toilet",   label: "公厕",   emoji: "🚻", type: "200300", sos: true },
  { id: "parking",  label: "停车场", emoji: "🅿️", type: "150900" },
];

const EMERGENCY_CALLS = [
  { tel: "110", label: "报警" },
  { tel: "120", label: "急救" },
  { tel: "119", label: "火警" },
  { tel: "122", label: "交通事故" },
  { tel: "12301", label: "旅游投诉" },
  { tel: "12345", label: "政务热线" },
];

const SAFETY_TIPS = [
  "海拔约 2000m（苍山顶近 4000m），头晕气短先休息补水，严重时去医院",
  "菌子一定要熟透；出现幻觉、呕吐立即就医并保留剩余菌子",
  "紫外线极强：SPF50 + 墨镜 + 帽子，早晚温差 10℃ 以上",
  "洱海边骑行路窄车多，注意安全；生态廊道部分路段禁机动车",
  "走散时先用「复制我的位置」发到群里，原地等待",
];

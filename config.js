// 高德开放平台 https://console.amap.com/dev/key/app 申请「Web端(JS API)」Key
// 2021-12-02 之后申请的 Key 必须同时配置安全密钥 securityJsCode
window.MYTRIP_CONFIG = {
  amap: {
    key: "3c4607f3d95bb29a5b705585b434f718",
    securityJsCode: "",
    city: "大理",
    // local：使用 trip.js 里的 PLACES 坐标
    // amap：以 PLACES 的 keyword 调用高德 POI 搜索，用真实位置/地址覆盖本地数据
    source: "local",
  },
};

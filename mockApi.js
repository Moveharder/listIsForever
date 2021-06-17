// demo1 接口特点：无分页
export function fetchMonthInShop(params) {
  return Req(false).GET("/api/list/base", params);
}

// demo2 接口特点：有分页 ｜ 指定了需要的总页数
export function fetchMonthRankList(params) {
  return Req(false).GET("/api/list/pagination", params);
}

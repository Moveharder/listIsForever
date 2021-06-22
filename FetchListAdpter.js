/**
 * Code By @Believer  -2021.6.17 #代码写的6不6不是一等公民，开心才是！
 * 【列表请求适配器】-通俗易懂，朴实无华的好名字啊🤔
 * 【功能】这是一个专门用来从接口[获取列表数据]的适配器（叫啥开心就好✌️）：针对简单列表（只返回一个数组）、有分页的列表、甚至有统计数据的列表！
 * 【使用】通过传递简单的数据配置，快速完成 接口请求+字段赋值+打包返回预期数据 的工作（没错，老一条🐲了）
 * 【基本特点】默认支持处理 data数据列表，paginationData分页相关，summary统计。
 * 【附加特点】如需其他字段，可提供[extraAdpter]字段到fetchConfig自行配置：extraAdpter: [{dataKey:'xx', dataKeyChain:'xx.xx.xx'}]，这样会得到fetchConfig[dataKey]的值
 * 【人=我】用过的人都说好，我可以作证！
 * @param {*} fetchConfig 返回符合预期的数据【每一次的终点，给你的只会更多，不会遗漏！】
 */
export function fetchListAdpter(fetchConfig = {
  fetchExecutor, //必须滴：【一个获取接口的Promise方法，通常我们都会承诺些什么】
  params: {}, //?请求参数，有分页的数据需要设置page
  summaryKeyChain: '', //?一些有统计数据的接口会返回类似summary的字段（还不错吧～）
  summary: {}, // ?可能存在的统计类数据
  paginationKeyChain: '', //?定义了如何放问到分页数据的路径（挺方便吧～）
  hasMorePage: false, //?当有分页信息的时候需要，用于表明是否加载完毕（贴心吧～）
  paginationData: {}, //?接口返回的分页信息
  dataPagesLimit: 0, //?如果该值不为空，则参与控制hasMorePage的判断。弱水三千，我只取一瓢饮（意外吧～）
  dataKeyChain: 'data', //?定义了如何放问到数据列表的路径，默认'data'
  data: [], //?用于存储数据列表的容器。【真诚建议指定，否则可能出现开天辟地之初无此字段导致的访问问题】(不想吧～)
  dataItemDecorator, //?可能对数据列表的每一项做一些特殊操作，随便造！
  extraAdpter, //?处理附加字段(对接口返回的更多数据进行获取和赋值)（没想到吧～）
}) {
  let {
    fetchExecutor = () => Promise.resolve(null),
      params = {},
      summaryKeyChain = '',
      paginationKeyChain = '',
      dataPagesLimit = 0,
      dataKeyChain = 'data',
      dataItemDecorator,
      extraAdpter = []
  } = fetchConfig;

  if (!params.page || params.page == 1) {
    fetchConfig.data = []; //重制数据
  }

  return new Promise(async (resolve, reject) => {
    try {
      if (typeof params != 'object' || Array.isArray(params)) {
        fetchConfig.params = {}; //修正请求参数
        reject(new Error('params必须为Object类型'));
      }

      if (typeof fetchExecutor != 'function') {
        fetchConfig.fetchExecutor = () => Promise.resolve(null); //修正请求方法
        reject(new Error('fetchExecutor必须为Promise类型的方法'));
      }

      let res = await fetchExecutor(params);

      if (!res) {
        reject(new Error(`接口返回数据和预期不符，请修改传递的配置参数。接口返回如下：${JSON.stringify(res)}`));
      } else {
        // 处理列表数据
        let listData = tryToReachYourDeepHeart(res, dataKeyChain);
        // 特殊处理列表项
        if (dataItemDecorator) {
          if (typeof dataItemDecorator == 'function') {
            listData.map(item => dataItemDecorator(item));
          } else {
            reject(new Error('dataItemDecorator必须为Function类型，且接受一个参数'));
          }
        }

        // 处理分页数据
        if (paginationKeyChain) {
          let pageData = tryToReachYourDeepHeart(res, paginationKeyChain);
          const {
            current_page = 0, last_page = 0, per_page = 10
          } = pageData;
          fetchConfig.params.page = current_page;
          delete pageData.data;
          fetchConfig.paginationData = pageData;
          //如果有设定最后一页则用限定的，否则用接口返回的last_page。需要考虑last_page < dataPagesLimit的情况，这时相当于未提供dataPagesLimit
          let hasMore = false;
          if (dataPagesLimit && last_page >= dataPagesLimit) {
            if (current_page < dataPagesLimit && listData.length == per_page) {
              hasMore = true;
            } else {
              hasMore = false;
            }
          } else {
            hasMore = current_page < last_page;
          }
          fetchConfig.hasMorePage = hasMore;
          fetchConfig.data = fetchConfig.data.concat(listData);
        } else {
          fetchConfig.data = listData;
        }

        // 处理统计数据
        if (summaryKeyChain) {
          fetchConfig.summary = tryToReachYourDeepHeart(res, summaryKeyChain);
        }

        // 处理附加字段 (用户自行配置)
        if (extraAdpter && extraAdpter.length) {
          if (Array.isArray(extraAdpter)) {
            extraAdpter.map(({
              dataKey,
              dataKeyChain
            }) => {
              fetchConfig[dataKey] = tryToReachYourDeepHeart(res, dataKeyChain)
            })
          } else {
            reject(new Error("extraAdpter必须为对象数组，形如：[{dataKey:'xx', dataKeyChain:'xx.xx.xx'}]"));
          }
        }

        // 终点：给你的只会更多，不会遗漏！
        resolve(fetchConfig);
      }

    } catch (err) {
      // 再见，再也不见！
      reject(err)
    }
  })
}

/**
 * 没人能保证者不是十八层地狱！
 * @param {Object} data 装满数据的大心脏🫀
 * @param {String} keyChainStr 数据们的藏身之处
 */
function tryToReachYourDeepHeart(data, keyChainStr) {
  let reachedValue = data;
  let keyChainArr = keyChainStr.split('.');
  keyChainArr.map(key => {
    reachedValue = reachedValue[key]
  })
  return reachedValue;
}

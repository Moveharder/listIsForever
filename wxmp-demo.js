import {
  fetchPageList,
  fetchBaseList
} from './somedir/somefile';
import {
  fetchListAdpter
} from './FetchListAdpter';
Page({
  data: {
    loading: false,
    pageListData: {
      fetchExecutor: fetchPageList,
      params: {
        page: 1
      },
      dataKeyChain: 'data.data',
      data: [],
      paginationKeyChain: 'data',
      hasMorePage: false,
      dataPageSize: 10,
      dataPagesLimit: 10,
      extraAdpter: [{
        dataKey: 'nextPageUrl',
        dataKeyChain: 'data.next_page_url',
      }]
    },

    baseListData: {
      fetchExecutor: fetchBaseList,
      data: [],
      dataItemDecorator: item => {
        item.name = 'one world'
        return item;
      }
    },

    // 极限：就一个参数轻轻松松
    easyListData: {
      fetchExecutor: fetchBaseList,
    }
  },
  onShow: function () {
    this.setData({
      loading: true
    })

    fetchListAdpter(this.data.pageListData).then(res => {
      this.setData({
        pageListData: res,
        loading: false
      })
    })

    fetchListAdpter(this.data.baseListData).then(res => {
      this.setData({
        baseListData: res
      })
    }).catch(console.log)
  },
})
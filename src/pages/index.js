import { Component } from 'react'
import request from 'umi-request';
import { Table, message, Input, Modal, Button } from 'antd';

const { Search } = Input
const { confirm } = Modal
const success = () => {
  message.success('删除成功');
};
const fail = () => {
  message.error('删除失败，请重试');
};

export default class Index extends Component {

  constructor(props) {
    super(props)
    this.state = {
      pageNo: 0,
      limit: 10,
      total: 0,
      loading: true,
      result: [],
      columns: [
        {
          title: 'ID',
          key: 'id',
          render: (text, record, index) => index + 1
        },
        {
          title: 'IP',
          key: 'ip',
          dataIndex: 'ip',
        },
        {
          title: '时间',
          key: 'time',
          dataIndex: 'time',
          render: text => <span>{this.dateFormatter('yyyy-MM-DD HH:mm:ss', text)}</span>
        },
        {
          title: '电话',
          key: 'phone',
          dataIndex: 'phone'
        },
        {
          title: '关键字',
          key: 'keyword',
          dataIndex: 'keyword'
        },
        {
          title: '停留时间',
          key: 'rangeTime',
          dataIndex: 'rangeTime',
          render: text => text + 's'
        },
        {
          title: '浏览状态',
          key: 'status',
          dataIndex: 'status',
          render: text => Number(text.toFixed(2)) + '%'
        },
        {
          title: '终端',
          key: 'clientType',
          dataIndex: 'clientType'
        },
        {
          title: 'URL',
          key: 'url',
          dataIndex: 'url',
          render: text => <a href={text} target='_blank' rel='noopener noreferrer'>{text}</a>
        },
        {
          title: '操作',
          key: 'action',
          dataIndex: 'action',
          render: (text, record) => <Button onClick={() => {this.showDeleteConfirm(record._id)}} type="danger" ghost>删除</Button>
        },
      ]
    }
  }

  componentDidMount () {
    this.fetchList()
  }

  dateFormatter = (formatter, date) => {
    date = new Date(date)
    const Y = date.getFullYear() + '',
          M = date.getMonth() + 1,
          D = date.getDate(),
          H = date.getHours(),
          m = date.getMinutes(),
          s = date.getSeconds()
    return formatter.replace(/YYYY|yyyy/g, Y)
                    .replace(/YY|yy/g, Y.substr(2, 2))
                    .replace(/MM/g, (M < 10 ? '0' : '') + M)
                    .replace(/DD/g, (D < 10 ? '0' : '') + D)
                    .replace(/HH|hh/g, (H < 10 ? '0' : '') + H)
                    .replace(/mm/g, (m < 10 ? '0' : '') + m)
                    .replace(/ss/g, (s < 10 ? '0' : '') + s)
  }



  showDeleteConfirm = (id) => {
    confirm({
      title: '确定删除?',
      content: '',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        this.deleteItem(id)
      },
      onCancel: () => {
        console.log('Cancel')
      },
    })
  }

  fetchList = (page, url) => {
    let { pageNo, limit } = this.state
    let params = {
      pageNo,
      limit
    }
    if (page) {
      params.pageNo = page
    }
    if (url) {
      params.url = url
    }
    request.get("http://121.41.131.75:8080/fly/queryList", {params})
    .then((result) => {
      this.setState({
        total: result.totalCnt,
        result: result.data
      }, () => {
        this.setState({
          loading: false
        })
      })
    })
    .catch(function(error) {
      console.log(error);
      this.setState({
        loading: false
      })
    })
  }

  deleteItem = (id) => {
    request.post("http://121.41.131.75:8080/fly/deleteItem", {
      data: JSON.stringify({ id })
    })
    .then((result) => {
      if (result.status === 'ok') {
        success()
        this.fetchList()
      } else {
        fail()
      }
    })
    .catch(function(error) {
      console.log(error)
      fail()
    })
  }

  render () {
    let {
      loading,
      columns,
      result,
      limit,
      total
    } = this.state
    return (
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <Search
          placeholder="请输入URL"
          onSearch={url => {
            this.fetchList(0, url)
          }}
          enterButton
          style={{ maxWidth: 300, marginBottom: 20 }} />
        <Table
          rowKey={(record, index) => index}
          loading={loading}
          bordered
          columns={columns}
          dataSource={result}
          pagination={{pageSize: limit, total: total, onChange:(page) => {
            this.fetchList(page-1)
          }}} />
      </div>
    );
  }
}
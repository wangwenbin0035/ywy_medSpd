/*
 * @Author: yuwei  补登单据 - 新建出库单
 * @Date: 2018-07-24 13:13:55 
* @Last Modified time: 2018-07-24 13:13:55 
 */
import React, { PureComponent } from 'react';
import { Table , Select , Col, Button, Icon, Modal , message, InputNumber, Row , Tooltip, Spin, Form, Input } from 'antd';
import { Link } from 'react-router-dom';
import { supplementDoc } from '../../../../api/pharmacy/wareHouse';
import RemoteTable from '../../../../components/TableGrid';
import _ from 'lodash';
import { connect } from 'dva';
const Conform = Modal.confirm;
const { Option } = Select;
const modalColumns = [
  {
    title: '货位',
    dataIndex: 'goodsName',
    width: 112
  },
  {
    title: '货位类型',
    dataIndex: 'positionTypeName',
    width: 148
  },
  /*{
    title: '通用名称',
    dataIndex: 'ctmmGenericName',
    width: 200,
    className: 'ellipsis',
    render:(text)=>(
      <Tooltip placement="topLeft" title={text}>{text}</Tooltip>
    )
  },*/
  {
    title: '药品名称',
    dataIndex: 'ctmmTradeName',
    width: 350,
    className: 'ellipsis',
    render:(text)=>(
      <Tooltip placement="topLeft" title={text}>{text}</Tooltip>
    )
  },
  /*{
    title: '规格',
    dataIndex: 'ctmmSpecification',
    width: 148,
  },*/
  {
    title: '生产批号',
    width: 138,
    dataIndex: 'lot',
  },
  {
    title: '剂型',
    width: 90,
    dataIndex: 'ctmmDosageFormDesc',
  },
  {
    title: '生产日期',
    width: 118,
    dataIndex: 'productDate',
  },
  {
    title: '有效期至',
    width: 118,
    dataIndex: 'validEndDate',
  },
 
  {
    title: '包装规格',
    width: 100,
    dataIndex: 'packageSpecification',
  },
  {
    title: '生产厂家',
    width: 200,
    dataIndex: 'ctmmManufacturerName',
    className:'ellipsis',
    render:(text)=>(
      <Tooltip placement="topLeft" title={text}>{text}</Tooltip>
    )
  },
  {
    title: '批准文号',
    width: 150,
    dataIndex: 'approvalNo',
  }
];
class AddSupplementDocuments extends PureComponent{

  constructor(props){
    super(props)
    this.state={
      display: 'none',
      query: {},
      selectedRowKey: [],
      spinLoading: false,
      visible: false,
      btnLoading: false, // 添加产品modal 确认
      dataSource: [],
      selected: [],  // 新建, 编辑 table 勾选
      selectedRows: [],
      modalSelectedRows: [], // 模态框内勾选
      modalSelected: [],
      data: [],//远程搜索下拉框数据内容
      fetching: false,//远程fetch搜索状态
      typeList: [],
      typeValue: '',
      makeupCause: '',
    }

    this.fetchSelect = _.debounce(this.fetchSelect, 800);
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'base/orderStatusOrorderType',
      payload: {
        type: 'makeup_type_out'
      },
      callback: (data) => {
        this.setState({
          typeList: data
        });
      }
    })
  }
  // 模态框表单搜索
  fetchSelect = (value) => {
    console.log('fetching user', value);
    this.setState({ data: [], fetching: true });

    this.props.dispatch({
      type:'base/SearchProductSelect',
      payload:{
        paramName:value,
        queryType:3
      },
      callback:(data)=>{
        const dataList = data.map(item => ({
           value: `${item.bigDrugCode}`,
           text: item.ctmmParam,
        }));
        this.setState({ data:dataList, fetching: false });
      }
    })
  }
  handleChange = (value) => {
    this.setState({
      value,
      data: [],
      fetching: false,
    });
  }
  //模态框 - 下拉框选择后搜索
  searchTable = (value) => {
    this.refs.table.fetch({
      ...this.state.query,
      hisDrugCodeList:[value]
    })
  }
  //补登原因
  changeMakeupCause = (e) => {
    this.setState({
      makeupCause: e.target.value
    });
  }
  //提交
  onSubmit = () =>{
    const {dataSource, typeValue, makeupCause} = this.state;
    if( dataSource.length === 0 ){
      return message.warning('请至少添加一条数据');
    };
    if(!typeValue) {
      return message.warning('请选择类型');
    };
    if(!makeupCause.trim()) {
      return message.warning('请输入补登原因');
    };
    let isNull = dataSource.every(item => {
      if(!item.totalQuantity) {
        message.warning('数量不能为空');
        return false;
      };
      return true;
    });
    if(!isNull) return;
    Conform({
      content:"是否补登出库单",
      onOk:()=>{
        const { dispatch, history } = this.props;
        let postData = {}, List = [];
        postData.makeupType = typeValue;
        dataSource.map(item =>List.push({ 
          lot: item.lot,
          // batchNo: item.batchNo,
          // productDate: item.productDate,
          totalQuantity: item.totalQuantity,
          // validEndDate: item.validEndDate,
          drugCode: item.drugCode,
          supplierCode:  item.supplierCode,
        }));
        postData.makeupinsertlist = List;
        postData.makeupCause = makeupCause;
        console.log(postData,'postData')
        dispatch({
          type: 'base/InsertMakeup',
          payload: { ...postData },
          callback: () => {
            message.success('补登出库单成功');
            history.push({pathname:"/pharmacy/supplementDoc/supplementDocuments"})
          }
        })
      },
      onCancel:()=>{}
    })
  }
  //添加产品 到 主表
  handleOk = () => {
    let { modalSelectedRows } = this.state;
    if(modalSelectedRows.length === 0) {
      message.warning('至少选择一条信息');
      return;
    }
    let { dataSource } = this.state;
    modalSelectedRows.map(item => item.totalQuantity = 1);
    let newDataSource = [];
    newDataSource = [ ...dataSource, ...modalSelectedRows ];
    const existDrugList = newDataSource.map(item => ({
      locCode: item.goodsCode,
      drugCode: item.drugCode,
      lot: item.lot
    }));
    this.setState({ 
      dataSource: newDataSource, 
      visible: false, 
      modalSelected: [], 
      modalSelectedRows: [],
      query: {
        existDrugList 
      }
    }) 
  }
  delete = () => {  //删除
    let { selectedRows, dataSource, query } = this.state;
    dataSource = _.difference(dataSource, selectedRows);
    let existDrugList = dataSource.map((item) => ({
      locCode: item.goodsCode,
      drugCode: item.drugCode,
      lot: item.lot
    }));
    this.setState({
      dataSource,
      selected: [],
      selectedRows: [],
      query: {
        ...query,
        existDrugList
      }
    });
  }
  //单行设置datasource
  setRowInput = (val,field,index,isDate)=>{
    console.log(val)
    let ds = this.state.dataSource.slice();
    ds[index][field]=val
    console.log(ds)
    this.setState({dataSource:ds})
  }
  //状态下拉
  typeChange = (value) => {
    this.setState({
      typeValue: value
    });
  }
  //报溢单弹窗取消
  normalCancel = () => {
    this.setState({ 
      visible: false, 
      modalSelected: [],
      modalSelectedRows: [],
      query: {
        ...this.state.query,
        hisDrugCodeList: []
      }
    });
  }
  render(){
    const columns = [
      {
        title: '数量',
        width: 124,
        dataIndex: 'totalQuantity',
        render:(text,record,index) =>{
          return <InputNumber
                  min={1}
                  defaultValue={text} 
                  onChange={(e)=>this.setRowInput(e,'totalQuantity',index)}
                 />
        }
      },
      {
        title: '单位',
        width: 112,
        dataIndex: 'replanUnit',
      },
      {
        title: '货位',
        width: 112,
        dataIndex: 'goodsName',
      },
      {
        title: '可用库存',
        width: 112,
        dataIndex: 'usableQuantity',
      },
      {
        title: '货位类型',
        width: 112,
        dataIndex: 'positionTypeName',
      },
      {
          title: '药品名称',
          dataIndex: 'ctmmTradeName',
          width: 350,
        className: 'ellipsis',
        render:(text)=>(
          <Tooltip placement="topLeft" title={text}>{text}</Tooltip>
        )
      },
     /* {
        title: '规格',
        width: 168,
        dataIndex: 'ctmmSpecification',
      },*/
      {
        title: '生产厂家',
        width: 200,
        dataIndex: 'ctmmManufacturerName',
        className: 'ellipsis',
        render:(text)=>(
          <Tooltip placement="topLeft" title={text}>{text}</Tooltip>
        )
      },
      {
        title: '包装规格',
        width: 148,
        dataIndex: 'packageSpecification',
        className:'ellipsis',
        render:(text)=>(
          <Tooltip placement="topLeft" title={text}>{text}</Tooltip>
        )
      },
      {
        title: '批准文号',
        width: 148,
        dataIndex: 'approvalNo',
      },
      {
        title: '生产日期',
        width: 118,
        dataIndex: 'productDate',
      },
      {
        title: '有效期至',
        width: 118,
        dataIndex: 'validEndDate',
      }
    ];
    
    const { 
      visible, 
      dataSource, 
      query, 
      spinLoading, 
      fetching, 
      data, 
      typeList,
    } = this.state;

    return (
    <Spin spinning={spinLoading} size="large">
      <div className="fullCol" style={{ padding: 24, background: '#f0f2f5' }}>
        <div className="fullCol-fullChild" style={{margin: '-9px -24px 0'}}>
          <Row style={{borderBottom: '1px solid rgba(0, 0, 0, .1)', marginBottom: 10}}>
            <Col span={8}>
              <h2>补登出库单</h2>
            </Col>
            <Col span={16} style={{ textAlign: 'right' }}>
              <span style={{ cursor: 'pointer' }} onClick={() => this.props.history.go(-1)}><Icon type="close" style={{ fontSize: 26, marginTop: 8 }} /></span>
            </Col>
          </Row>
          <Row gutter={30} style={{ marginTop: 10 }}>
            <Col span={6}>
              <div className="ant-form-item-label-left ant-col-xs-24 ant-col-sm-5">
                <label>类型</label>
              </div>
              <div className="ant-form-item-control-wrapper ant-col-xs-24 ant-col-sm-19">
                <div className='ant-form-item-control'>
                  <Select 
                    style={{width: '100%'}}
                    placeholder="请选择类型"
                    onChange={this.typeChange}
                  >
                    {
                      typeList.filter(item => item.value !== "").map(item => (
                        <Option key={item.value} value={item.value}>{item.label}</Option>
                      ))
                    }
                  </Select>
                </div>
              </div>
            </Col>
            <Col 
              style={{
                height: 40,
                lineHeight: '40px'
              }}
              span={6}
            >
              <Input onChange={this.changeMakeupCause} placeholder="请输入补登原因"/>
            </Col>
            <Col 
              style={{
                height: 40,
                lineHeight: '40px'
              }}
              span={6}
            >
              <Button type='primary' className='button-gap' onClick={()=>{
                this.setState({visible:true});
              }}>
                添加产品
              </Button>
              <Button onClick={this.delete} >移除</Button>
            </Col>
          </Row>
          </div>
          <div className='detailCard' style={{margin: '-12px -8px -8px', minHeight: 'calc(100vh - 158px)'}}>
            <Table
              pagination={false}
              dataSource={dataSource}
              title={()=>'产品信息'}
              bordered
              scroll={{x: '100%'}}
              columns={columns}
              rowKey={'batchNo'}
              style={{marginTop: 24}}
              rowSelection={{
                selectedRowKeys: this.state.selected,
                onChange: (selectedRowKeys, selectedRows) => {
                  this.setState({ selected: selectedRowKeys, selectedRows })
                }
              }}
            />
          </div>
          {
            dataSource.length === 0 ? null : 
            <div className="detailCard" style={{margin: '-12px -8px 0px -8px'}}>
              <Row>
                <Col style={{ textAlign: 'right', padding: '10px' }}>
                  <Button onClick={this.onSubmit} type='primary' style={{ marginRight: 8 }}>确定</Button>
                  <Button type='primary' ghost>
                    <Link to={{pathname:`/pharmacy/supplementDoc/supplementDocuments`}}>取消</Link>
                  </Button>
                </Col>
              </Row>
            </div>
          }
          {/*选择产品-弹窗*/}
          <Modal 
            bordered
            title={'添加产品'}
            visible={visible}
            destroyOnClose
            width={1200}
            style={{ top: 20 }}
            onCancel={this.normalCancel}
            footer={[
              <Button key="submit" type="primary" onClick={this.handleOk}>确认</Button>,
              <Button key="back" onClick={this.normalCancel}>取消</Button>
            ]}
          >
            <Row gutter={30}>
              <Col span={8}>
                <Select
                  showSearch
                  showArrow={false}
                  placeholder="药品名称"
                  notFoundContent={fetching ? <Spin size="small" /> : null}
                  filterOption={false}
                  onSearch={this.fetchSelect}
                  onChange={this.handleChange}
                  onSelect={this.searchTable}
                  style={{ width: '100%' ,marginBottom: 12}}
                >
                  {data.map(d => <Option key={d.value}>{d.text}</Option>)}
                </Select>
              </Col>  
            </Row>
            <RemoteTable
              query={query}
              ref="table"
              isJson={true}
              url={supplementDoc.addProductList}
              scroll={{x: '100%'}}
              hasIndex={true}
              columns={modalColumns}
              rowKey={'id'}
              rowSelection={{
                selectedRowKeys: this.state.modalSelected,
                onChange: (selectedRowKeys, selectedRows) => {
                  this.setState({ modalSelected: selectedRowKeys, modalSelectedRows: selectedRows })
                }
              }}
            />
          </Modal>
      </div>
    </Spin>
    )
  }
}
export default connect(state => state)(Form.create()(AddSupplementDocuments));
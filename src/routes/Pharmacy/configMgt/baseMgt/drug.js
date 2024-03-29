/*
 * @Author: 药房 - 基数药目录管理 - 药品
 * @Date: 2018-08-28 17:42:54 
 * @Last Modified by: wwb
 * @Last Modified time: 2019-10-20 15:12:26
 */

import React , {PureComponent} from 'react';
import { Row, Col, Button, Modal, message, Tooltip, InputNumber} from 'antd';
import RemoteTable from '../../../../components/TableGrid';
import FetchSelect from '../../../../components/FetchSelect/index';
import { drugMgt } from '../../../../api/baseDrug/drugMgt';
import goodsAdjust from '../../../../api/drugStorage/goodsAdjust';
import { connect } from 'dva';
import querystring from 'querystring';

class BaseMgt extends PureComponent{
  constructor(props) {
    super(props);
    let info = this.props.match.params.id;
    info = querystring.parse(info);
    this.state = {
      info: {},
      medalQuery: {
        deptCode: info.code,
        mate: ''
      },
      query: {
        deptCode: info.code
      },
      visible: false,
      value: undefined,
      okLoading: false,
      modalSelectedRows: [],
      modalSelected: [],
      selectedRows: [],
      selected: [],
      removeLoading: false,
      editingKey: '',
      stockBaseValue: ''
    }
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'configMgt/getDeptNameByCode',
      payload: {...this.state.query},
      callback: (data) => {
        this.setState({
          info: data
        });
      }
    })
  }
  setQuery = (value) => {
    let {medalQuery} = this.state;
    medalQuery = {
      ...medalQuery,
      hisDrugCodeList: value? [value] : []
    };
    this.setState({
      medalQuery,
      value
    });
  }
  cancel = () => {
    this.setState({
      visible: false,
    });
  }
  addProduct = () => {
    let {modalSelectedRows, query} = this.state;
    if(modalSelectedRows.length === 0) {
      message.warning('至少选择一条数据');
      return;
    }
    this.setState({
      okLoading: true
    });
    let baseMedicineDetails = modalSelectedRows.map((item) => {
      return {
        bigDrugCode: item.bigDrugCode,
        drugCode: item.drugCode
      }
    });
    
    this.props.dispatch({
      type: 'configMgt/pitchOnCardinalMedicine',
      payload: {
        ...query,
        baseMedicineDetails
      },
      callback: (data) => {
        this.setState({
          okLoading: false,
          visible: false
        });
        this.refs.table.fetch(query);
      }
    });
  }
  showModal = () => {
    this.setState({
      visible: true,
      value: undefined,
      modalSelected: [],
    });
  }
  //移除
  remove = () => {
    let {selectedRows, query} = this.state;
    if(selectedRows.length === 0) {
      return message.warning('至少选择一条数据移除');
    };
    this.setState({
      removeLoading: true
    });
    let ids = selectedRows.map(item => item.id);
    this.props.dispatch({
      type: 'configMgt/MoveCardinalMedicineDetail',
      payload: {ids},
      callback: () => {
        message.success('移除成功');
        this.setState({
          removeLoading: false
        });
        this.refs.table.fetch(query);
      }
    })
  }
  //库存基数input
  changeStockBase = (value) => {
    console.log(value);
    
    this.setState({
      stockBaseValue: value
    });
  }
  //编辑
  editRow = (id) => {
    this.setState({
      editingKey: id
    });
  }
  //保存
  saveStockBase = () => {
    const {stockBaseValue, editingKey, query} = this.state;
    this.props.dispatch({
      type: 'configMgt/getHisMedicineBound',
      payload: {
        id: editingKey,
        stockBase: stockBaseValue,
        deptCode: query.deptCode
      },
      callback: ({data, code, msg}) => {
        if(code !== 200) return message.error(msg);
        this.setState({
          editingKey: '',
          stockBaseValue: ''
        });
        this.refs.table.fetch();
      }
    })
  }
  //取消
  cancelStockBase = () => {
    this.setState({
      editingKey: '',
      stockBaseValue: ''
    });
  }
  render(){
    const { medalQuery, info, visible, okLoading, value, query, editingKey } = this.state;
    const columns = [
     /* {
        title: '通用名称',
        dataIndex: 'ctmmGenericName',
        width: 224,
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
        width: 168,
      },*/
      {
        title: '剂型',
        dataIndex: 'ctmmDosageFormDesc',
        width: 90,
      },
      {
        title: '包装规格',
        dataIndex: 'packageSpecification',
        width: 148,
      },
      {
        title: '单位',
        dataIndex: 'replanUnit',
        width: 112,
      },
      {
        title: '批准文号',
        dataIndex: 'approvalNo',
        width: 200,
      },
      {
        title: '生产厂家',
        dataIndex: 'ctmmManufacturerName',
        width: 200,
        className: 'ellipsis',
        render:(text)=>(
          <Tooltip placement="topLeft" title={text}>{text}</Tooltip>
        )
      },
      {
        title: '库存基数',
        dataIndex: 'stockBase',
        width: 120,
        fixed: 'right',
        render:(text, record)=>{
          if(record.id === editingKey) {
            return <InputNumber
                    defaultValue={text}
                    min={1}
                    max={999999}
                    precision={0}
                    onChange={this.changeStockBase}
                   />
          }else {
            return <span>{text}</span>
          }
        }
      },
      {
        title: '操作',
        dataIndex: 'RN',
        width: 124,
        fixed: 'right',
        render: (text, record) => {
          if(record.id === editingKey) {
            return <span>
                    <a style={{margin: 8}} onClick={this.saveStockBase}>保存</a>
                    <a onClick={this.cancelStockBase}>取消</a>
                   </span>
          }else {
            return <a onClick={this.editRow.bind(this, record.id)}>编辑库存基数</a>
          }
        }
      }
    ]
    const modalColumns = [
      /*{
        title: '通用名',
        dataIndex: 'ctmmGenericName',
        width: 224,
        className: 'ellipsis',
        render:(text)=>(
          <Tooltip placement="topLeft" title={text}>{text}</Tooltip>
        )
      },*/{
        title: '药品名称',
        dataIndex: 'ctmmTradeName',
        className: 'ellipsis',
        render:(text)=>(
          <Tooltip placement="topLeft" title={text}>{text}</Tooltip>
        ),
        width: 350,
      },/*{
        title: '规格',
        dataIndex: 'ctmmSpecification',
        width: 168,
      },*/{
        title: '剂型',
        dataIndex: 'ctmmDosageFormDesc',
        width: 90,
      },{
        title: '单位',
        dataIndex: 'replanUnit',
        width: 112,
      },{
        title: '包装规格',
        dataIndex: 'packageSpecification',
        width: 148,
      },{
        title: '生产厂家',
        dataIndex: 'ctmmManufacturerName',
        width: 200,
        className: 'ellipsis',
        render:(text)=>(
          <Tooltip placement="topLeft" title={text}>{text}</Tooltip>
        )
      },
    ];
    return (
      <div className="fullCol fadeIn">
        <div className="fullCol-fullChild">
          <Row>
            <Col span={8}>
              <div className="ant-form-item-label-left ant-col-xs-24 ant-col-sm-5">
                <label>基数药部门</label>
              </div>
              <div className="ant-form-item-control-wrapper ant-col-xs-24 ant-col-sm-18">
                <div className="ant-form-item-control">
                  {info.deptName || ''}
                </div>
              </div>
            </Col>
          </Row>
        </div>
        <Modal
          destroyOnClose
          title={'添加产品'}
          visible={visible}
          width={1100}
          style={{ top: 20 }}
          onCancel={this.cancel}
          footer={[
            <Button key="submit" type="primary" loading={okLoading} onClick={this.addProduct}>确认</Button>,
            <Button key="back" onClick={this.cancel}>取消</Button>
          ]}
        >
          <Row>
            <Col span={8} style={{marginLeft: 4}}>
              <FetchSelect
                allowClear
                value={value}
                style={{ width: 496 }}
                placeholder='药品名称'
                url={goodsAdjust.QUERY_DRUG_BY_LIST}
                cb={this.setQuery}
              />
            </Col>
          </Row>
          <RemoteTable
            query={medalQuery}
            isJson={true}
            url={drugMgt.ADD_CARDINAL_MEDICINE}
            style={{ marginTop: 16 }} 
            hasIndex={true}
            columns={modalColumns}
            scroll={{ x: '100%' }}
            rowKey='drugCode'
            rowSelection={{
              selectedRowKeys: this.state.modalSelected,
              onChange: (selectedRowKeys, selectedRows) => {
                this.setState({modalSelected: selectedRowKeys, modalSelectedRows: selectedRows})
              }
            }}
          />
        </Modal>
        <div className='detailCard'>
          <h3>产品信息
            <Button style={{margin: '0 8px'}} onClick={this.showModal} type="primary">新增</Button>
            {/* <Button loading={removeLoading} onClick={this.remove}>移除</Button> */}
          </h3>
          <hr className="hr"/>
          <RemoteTable
            ref='table'
            query={query}
            hasIndex={true}
            url={drugMgt.FIND_CARDINAL_MEDICINE_DETAIL}
            scroll={{x: '100%'}}
            columns={columns}
            rowKey={'id'}
          />
        </div>
      </div>
    )
  }
}
export default connect()(BaseMgt)
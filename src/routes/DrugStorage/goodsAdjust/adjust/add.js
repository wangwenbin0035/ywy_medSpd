/*
 * @Author: gaofengjiao 
 * @Date: 2018-08-06 16:37:22 
 * @Last Modified by: wwb
 * @Last Modified time: 2019-10-20 15:06:49
 */
/**
 * @file 药库 - 货位调整--新建货位
 */
import React, { PureComponent } from 'react';
import {Row, message, InputNumber, Col, Button, Table, Modal, Icon, Tooltip} from 'antd';
import RemoteTable from '../../../../components/TableGrid/index';
import goodsAdjust from '../../../../api/drugStorage/goodsAdjust';
import FetchSelect from '../../../../components/FetchSelect/index';
import {connect} from 'dva';
import _ from 'lodash';
class NewAddGoodsAdjust extends PureComponent{
  state = {
    isShow: false,
    visible: false,
    okLoading: false,
    selected: [],
    value: undefined,
    selectedRows: [],
    modalSelected: [],
    modalSelectedRows: [],
    query: {
      existDrugList: [],
      hisDrugCodeList: []
    },
    dataSource: [],
    submitLoading: false
  }

  addProduct = () => {
    let {modalSelectedRows, dataSource} = this.state;
    if(modalSelectedRows.length === 0) {
      message.warning('请选择一条数据');
      return;
    };
    console.log(modalSelectedRows);
    
    modalSelectedRows = modalSelectedRows.map(item=>{
      return {
        drugCode: item.drugCode,
        lot: item.lot,
        locCode: item.goodsCode
      }
    });
    console.log(modalSelectedRows);
    
    this.setState({okLoading: true})
    let payload = {
      detailList: modalSelectedRows,
      locType: '1'
    };
    this.props.dispatch({
      type: 'base/drugInformation',
      payload,
      callback: (data) => {
        this.setState({
          dataSource: [
            ...dataSource,
            ...data
          ],
          okLoading: false,
          visible: false,
          modalSelected: [],
          modalSelectedRows: []
        });
      }
    })
  }

  showModal = () => {
    let {dataSource, query} = this.state;
    dataSource = dataSource.map(item=>({
        drugCode: item.drugCode,
        locCode: item.goodsCode,
        lot: item.lot,
      })
    );
    this.setState({
      query: {
        ...query,
        existDrugList: dataSource
      }, 
      visible: true,
    });
  }

  delete = () => {
    let {dataSource, selectedRows} = this.state;
    if(selectedRows.length === 0) {
      message.warning('请至少选择一条数据进行删除');
      return;
    };
    dataSource = _.difference(dataSource, selectedRows);
    this.setState({
      dataSource,
      selectedRows: [],
      selected: []
    });
  }

  search = (value) => {
    let {query} = this.state;
    this.setState({
      query: {
        ...query,
        paramName: value
      }
    });
  }

  submit = () => {
    let {dataSource} = this.state;
    let isNull = dataSource.every(item=>{
      if(!item.adjustNum) {
        message.warning('移动数量不能为空');
        return false;
      };
      if(!item.goalLocCode) {
        message.warning('目的货位不能为空');
        return false;
      };
      return true;
    });
    if(!isNull) return;
    this.setState({submitLoading: true});
    let goodsLocationDetailDtoList = dataSource.map(item=>{
      return {
        adjustNum: item.adjustNum,
        batchNo: item.batchNo,
        conversionRate: item.conversionRate,
        drugCode: item.drugCode,
        goalBigDrugCode: item.goalBigDrugCode,
        goalDrugCode: item.goalDrugCode,
        goalLocCode: item.goalLocCode,
        goalUnit: item.targetUnitCode,
        lot: item.lot,
        goalLot: item.lot,
        originalBigDrugCode: item.bigDrugCode,
        originalLocCode: item.goodsCode,
        originalStore: item.usableQuantity,
        productDate: item.productDate,
        supplierCode: item.supplierCode,
        validEndDate: item.validEndDate,
        originalUnit: item.replanUnitCode,
        originLocName: item.goodsName
      }
    });
    
    this.props.dispatch({
      type: 'base/confirmAdjust',
      payload: {
        goodsLocationDetailDtoList
      },
      callback: (data) => {
        message.success('移库成功！');
        this.props.history.go(-1);
        this.setState({
          submitLoading: false
        });
      }
    })
  }

  cancel = () => {
    this.setState({ 
      visible: false, 
      modalSelected: [] 
    });
  }

  changeGoalLoc = (value, i, data) => {
    let {dataSource} = this.state;
    dataSource[i].goalLocCode = value;
    dataSource[i].goalBigDrugCode = data.goalBigDrugCode;
    dataSource[i].goalDrugCode = data.goalDrugCode;
    dataSource[i].targetUnit = data.targetUnit;
    dataSource[i].targetUnitCode = data.targetUnitCode;
    dataSource[i].targetTypeName = data.targetTypeName;
    dataSource[i].conversionRate = data.conversionRate;
    this.setState({
      dataSource: [...dataSource]
    });
  }
  
  render(){
    const {visible, value, query, dataSource, okLoading, submitLoading} = this.state;
    const columns = [
      {
          title: '药品名称',
          width: 350,
          dataIndex: 'ctmmTradeName',
          className: 'ellipsis',
          render: (text) => (
              <Tooltip placement="topLeft" title={text}>{text}</Tooltip>
          )
      },
      /*{
        title: '规格',
		    width: 168,
        dataIndex: 'ctmmSpecification',
      },*/
      {
        title: '生产厂家',
        dataIndex: 'ctmmManufacturerName',
		    width: 200,
        className:'ellipsis',
        render:(text)=>(
          <Tooltip placement="topLeft" title={text}>{text}</Tooltip>
        )
      },
      {
        title: '移动数量',
        dataIndex: 'adjustNum',
		    width: 120,
        render: (text, record, i) => {
          return <InputNumber
                  min={1}
                  max={record.usableQuantity}
                  precision={0}
                  onChange={(value) => {
                    record.adjustNum = value;
                  }}
                 />
        }
      },
      {
        title: '移动单位',
		    width: 112,
        dataIndex: 'replanUnit',
      },
      {
        title: '原库存',
		    width: 112,
        dataIndex: 'usableQuantity'
      },
      {
        title: '原货位',
		    width: 112,
        dataIndex: 'goodsName'
      },
      {
        title: '原货位类型',
		    width: 168,
        dataIndex: 'positionTypeName',
      },
      {
        title: '目的货位',
        dataIndex: 'goalLocCode',
		    width: 280,
        render: (text, record, i) => {
          return <FetchSelect
                  queryKey={{
                    drugCode: record.drugCode,
                    goodsCode: record.goodsCode,
                    id: record.id,
                    lot: record.lot,
                    valueKey: 'goodsName'
                  }}
                  allowClear
                  valueAndLabel={{
                    value: 'id',
                    label: 'targetLocName'
                  }}
                  type="JSON"
                  style={{ width: '100%' }}
                  placeholder='请输入货位搜索选择'
                  url={goodsAdjust.QUERY_TARGET_LOCATION}
                  cb={(value, data) => {
                    this.changeGoalLoc(value, i, data);
                  }}
                />
        }
      },
      {
        title: '目的货位单位',
		    width: 168,
        dataIndex: 'targetUnit',
      },
      {
        title: '目的货位类型',
		    width: 168,
        dataIndex: 'targetTypeName'
      },
      {
        title: '转换系数',
		    width: 112,
        dataIndex: 'conversionRate'
      },
      {
        title: '生产批号',
        dataIndex: 'lot',
        width: 168,
      },
      {
        title: '包装规格',
		    width: 168,
        dataIndex: 'packageSpecification'
      }
    ];
    const modalColumns = [
      {
        title: '货位',
		    width: 112,
        dataIndex: 'goodsName'
      },{
        title: '货位类型',
		    width: 168,
        dataIndex: 'positionTypeName'
      },/*{
        title: '通用名',
		    width: 224,
        dataIndex: 'ctmmGenericName',
        className: 'ellipsis',
        render: (text) => (
          <Tooltip placement="topLeft" title={text}>{text}</Tooltip>
        )
      },*/{
        title: '药品名称',
		    width: 350,
        dataIndex: 'ctmmTradeName',
        className: 'ellipsis',
        render: (text) => (
          <Tooltip placement="topLeft" title={text}>{text}</Tooltip>
        )
      },/*{
        title: '规格',
		    width: 168,
        dataIndex: 'ctmmSpecification',
      },*/{
        title: '剂型',
		    width: 90,
        dataIndex: 'ctmmDosageFormDesc',
      },{
        title: '包装规格',
		    width: 168,
        dataIndex: 'packageSpecification'
      },{
        title: '生产批号',
		    width: 168,
        dataIndex: 'lot'
      },{
        title: '单位',
		    width: 112,
        dataIndex: 'replanUnit'
      },{
        title: '生产日期',
		    width: 118,
        dataIndex: 'productDate'
      },{
        title: '有效期至',
		    width: 118,
        dataIndex: 'validEndDate'
      },{
        title: '数量',
		    width: 112,
        dataIndex: 'usableQuantity'
      },{
        title: '生产厂家',
        dataIndex: 'ctmmManufacturerName',
        width: 200,
        className:'ellipsis',
        render:(text)=>(
          <Tooltip placement="topLeft" title={text}>{text}</Tooltip>
        )
      },{
        title: '批准文号',
		    width: 200,
        dataIndex: 'approvalNo'
      }
    ];
    return (
      <div className='fullCol fadeIn' style={{padding: '0 24px 24px', background: 'rgb(240, 242, 245)'}}>
        <div className='fullCol-fullChild' style={{margin: '0 -24px'}}> 
          <Row style={{margin: '0 -32px', borderBottom: '1px solid rgba(0, 0, 0, .2)'}}>
            <Col span={8}>
              <h3 style={{padding: '0 0 15px 32px', fontSize: '20px'}}>
                新建移库
              </h3>
            </Col>
            <Col span={16} style={{textAlign: 'right', paddingRight: 32}}>
              <Icon 
                onClick={()=>{
                  this.props.history.go(-1);
                }} 
                style={{cursor: 'pointer', transform: 'scale(2)'}} 
                type="close" 
                theme="outlined" 
              />
            </Col>
          </Row>
          <Row style={{marginTop: 10}}>
            <Button type='primary' icon='plus' onClick={this.showModal}>添加产品</Button>
            <Button type='default' onClick={this.delete} style={{ marginLeft: 8 }}>删除</Button>
          </Row>
        </div>
        <div className='detailCard' style={{margin: '-10px -6px', minHeight: 'calc(100vh - 170px)'}}>
          <h3>产品信息</h3>
          <Table 
            columns={columns}
            bordered
            rowKey='id'
            dataSource={dataSource}
            scroll={{ x: '100%' }}
            pagination={false}
            rowSelection={{
              selectedRowKeys: this.state.selected,
              onChange: (selectedRowKeys, selectedRows) => {
                this.setState({selected: selectedRowKeys, selectedRows: selectedRows})
              }
            }}
          />
        </div>
        <div className="detailCard" style={{margin: '-10px -6px'}}>
          {
            dataSource.length > 0?
            <Row gutter={30}>
              <Col style={{lineHeight: '32px'}} span={8}>
                共<span style={{color: 'red'}}>{dataSource.length}</span>种产品
              </Col>
              <Col style={{textAlign: 'right'}} span={16}>
                <Button loading={submitLoading} onClick={this.submit} type="primary" style={{marginRight: 8}}>确认移库</Button>
                <Button onClick={()=>{this.props.history.go(-1)}}>取消</Button>
              </Col>
            </Row> : null
          }
        </div>
        <Modal
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
                cb={(value, option) => {
                  let {query} = this.state;
                  query = {
                    ...query,
                    hisDrugCodeList: value ? [value] : []
                  };
                  this.setState({
                    query,
                    value
                  });
                }}
              />
            </Col>
          </Row>
          <RemoteTable
            query={query}
            hasIndex={true}
            isJson={true}
            url={goodsAdjust.roomDrugList}
            style={{ marginTop: 16 }} 
            columns={modalColumns}
            scroll={{ x: '100%' }}
            rowKey='id'
            rowSelection={{
              selectedRowKeys: this.state.modalSelected,
              onChange: (selectedRowKeys, selectedRows) => {
                this.setState({modalSelected: selectedRowKeys, modalSelectedRows: selectedRows})
              }
            }}
          />
        </Modal>
      </div>
    )
  }
}
export default connect(state=>state)(NewAddGoodsAdjust);
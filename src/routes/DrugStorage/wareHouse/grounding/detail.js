/*
 * @Author: yuwei  上架详情 /putaway/details
 * @Date: 2018-07-24 13:13:55 
* @Last Modified time: 2018-07-24 13:13:55 
 */
import React, { PureComponent } from 'react';
import { Row, Col, Select, Button, Tabs, message, Tooltip} from 'antd';
import {connect} from 'dva';
import RemoteTable from '../../../../components/TableGrid';
import wareHouse from '../../../../api/drugStorage/wareHouse';
const Option = Select.Option;
const {TabPane} = Tabs;


class DetailsPutaway extends PureComponent{
  state = {
    acceptanceCode: this.props.match.params.id,
    defaultActive: '',
    loading: true,
    info: {},
    selectedRowKeys: [],
    selectedRow: [],
    saveLoading: false,
    listysjQuery: {
      distributeCode: this.props.match.params.id,
      upFinishType: 1
    },
    listwsjQuery: {
      distributeCode: this.props.match.params.id,
      upFinishType: 0
    }
  }
  
  componentDidMount() {
    this.getDetails();
  }
  getDetails = () => {
    this.props.dispatch({//roomacceptanceInfo
      type: 'pharmacy/shelfInfoHead',
      payload: {
        distributeCode: this.props.match.params.id,
      },
      callback: ({data, code, msg}) => {
        if(code !== 200) return message.error(msg);
        this.setState({
          info: data,
          defaultActive: data.auditStatus === 2? '1' : '2',
        });
      }
    })
  }
  //确认
  onSubmit = () =>{
    let {selectedRow} = this.state;
    if(selectedRow.length === 0) {
      message.warning('请选择一条数据');
      return;
    };
    let isNull = selectedRow.every(item=>{
      if(!item.realReceiveStore) {
        message.warning('实际货位不能为空!');
        return false;
      };
      if(!item.realNum) {
        message.warning('实际上架数量不能为空!');
        return false;
      };
      return true;
    });
    if(!isNull) return;
    this.setState({saveLoading: true});
    let detailListVo = selectedRow.map(item=>{
      return {
        id: item.id,
        realNum: item.realNum,
        realReceiveStore: item.realReceiveStore,
        productBatchNo: item.productBatchNo
      }
    })
    let payload = {
      distributeCode: this.state.acceptanceCode,
      detailListVo
    };
    
    this.props.dispatch({
      type: 'pharmacy/finish',
      payload,
      callback: (data) => {
        message.success('上架成功');
        this.getDetails();
        this.listwsjTable.fetch();
        this.listysjTable && this.listysjTable.fetch();
        this.setState({
          saveLoading: false,
          selectedRowKeys: [],
          selectedRow: [],
        });
      }
    })
  }

  changeTabs = (key) => {
    this.setState({defaultActive: key});
  }

  listysjTableCallBack = (data) => {
    if(data.length > 0) {
      data = data.map(item => {   //如果实际货位下拉框不包含指示货位，则默认第一个
        let isSame =  item.acceptoodsVo.some(itemNum => {
          if(item.realReceiveStore !== itemNum.id) {
            return false;
          }else {
            return true;
          }
        });
        if(!isSame) {
          item.realReceiveStore = item.acceptoodsVo[0].id;
        }
        return item;
      });
      this.setState({
        listwsjData: data,
      });
    };
    this.setState({
      loading: false
    });
  }
  render(){
    let {
      defaultActive, 
      info, 
      loading, 
      saveLoading,
      listysjQuery,
      listwsjQuery,
      selectedRow,
      listwsjData
    } = this.state;
    const notColumns = [
      {
        title: '指示货位',
        width: 224,
        dataIndex: 'actualStore',
      },
      {
        title: '货位类型',
        width: 112,
        dataIndex: 'storeType',
      },
      {
        title: '实际货位',
        width: 224,
        dataIndex: 'realReceiveStore',
        render: (text, record) => {
          return <Select
                  defaultValue={text}
                  onChange={(value)=>{
                    const whetherInclude = selectedRow.some((item) => item.id === record.id);
                    record.realReceiveStore = value;
                    if(whetherInclude) {
                      selectedRow = selectedRow.map(item => {
                        if(item.id === record.id) {
                          item.realReceiveStore = value;
                        };
                        return item;
                      })
                      this.setState({
                        selectedRow
                      });
                    };
                  }}
                  style={{width: '100%'}}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                 >
                  {
                    record.acceptoodsVo.map(item=>{
                      return <Option key={item.id} value={item.id}>{item.positionName}</Option>
                    })
                  }
                 </Select>
        }
      },
      {
        title: '指示数量',
        width: 112,
        dataIndex: 'realReceiveQuantiry',
      },
      {
        title: '实际上架数量',
        width: 168,
        dataIndex: 'realNum',
        render: (text, record) => {
          return text;
          // return <InputNumber
          //         min={1}
          //         precision={0}
          //         onChange={(value) => {
          //           if(value > record.realReceiveQuantiry) {
          //             message.warning('注意：数量大于指示数量');
          //           };
          //           if(value <= 0) {
          //             message.warning('上架数量不能小于0');
          //           }
          //           record.realNum = value;
          //         }}
          //         defaultValue={text}
          //        />
        }
      },
      {
        title: '单位',
        width: 112,
        dataIndex: 'replanUnit'
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
        title: '包装规格',
        width: 168,
        dataIndex: 'packageSpecification',
      },
      {
        title: '生产厂家',
        width: 224,
        dataIndex: 'ctmmManufacturerName',
        className:'ellipsis',
        render:(text)=>(
          <Tooltip placement="topLeft" title={text}>{text}</Tooltip>
        )
      },
      {
        title: '生产批号',
        width: 168,
        dataIndex: 'productBatchNo',
      },
      {
        title: '生产日期',
        width: 118,
        dataIndex: 'realProductTime',
      },
      {
        title: '有效期至',
        width: 118,
        dataIndex: 'realValidEndDate',
      }
    ];
    const hasColumns = [
      {
        title: '指示货位',
        width: 224,
        dataIndex: 'actualStore',
      },
      {
        title: '货位类型',
        width: 112,
        dataIndex: 'storeType',
      },
      {
        title: '实际货位',
        width: 112,
        dataIndex: 'realReceiveStoreName',
      },
      {
        title: '指示数量',
        width: 112,
        dataIndex: 'realReceiveQuantiry',
      },
      {
        title: '实际上架数量',
        width: 112,
        dataIndex: 'realNum',
      },
      {
        title: '单位',
        width: 112,
        dataIndex: 'replanUnit'
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
        title: '包装规格',
        width: 168,
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
        title: '生产批号',
        width: 168,
        dataIndex: 'productBatchNo',
      },
      {
        title: '生产日期',
        width: 118,
        dataIndex: 'realProductTime',
      },
      {
        title: '有效期至',
        width: 118,
        dataIndex: 'realValidEndDate',
      }
    ];
    return (
      <div className='fadeIn ysynet-content'>
        <div style={{margin: '0 16px'}}>
          <h3>单据信息
          </h3>
          <Row>
            <Col span={8}>
              <div className="ant-form-item-label-left ant-col-xs-24 ant-col-sm-8">
                  <label>配送单/验收单号</label>
              </div>
              <div className="ant-form-item-control-wrapper ant-col-xs-24 ant-col-sm-16">
                <div className='ant-form-item-control'>{info.distributeCode || ''}</div>
              </div>
            </Col>
            <Col span={8}>
              <div className="ant-form-item-label-left ant-col-xs-24 ant-col-sm-8">
                  <label>状态</label>
              </div>
              <div className="ant-form-item-control-wrapper ant-col-xs-24 ant-col-sm-16">
                <div className='ant-form-item-control'>{info.statusName || ''}</div>
              </div>
            </Col>
            <Col span={8}>
              <div className="ant-form-item-label-left ant-col-xs-24 ant-col-sm-8">
                  <label>验收时间</label>
              </div>
              <div className="ant-form-item-control-wrapper ant-col-xs-24 ant-col-sm-16">
                <div className='ant-form-item-control'>{info.receptionTime || ''}
                </div>
              </div>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <div className="ant-form-item-label-left ant-col-xs-24 ant-col-sm-8">
                  <label>上架时间</label>
              </div>
              <div className="ant-form-item-control-wrapper ant-col-xs-24 ant-col-sm-16">
                <div className='ant-form-item-control'>{info.upUserDate || ''}</div>
              </div>
            </Col>
          </Row>
          <hr className='hr'/>
          <Tabs 
            onChange={this.changeTabs} 
            activeKey={defaultActive} 
            tabBarExtraContent={
              defaultActive === "1" && (info.auditStatus === 2||info.auditStatus === 3) ?
              <Button loading={saveLoading} onClick={this.onSubmit} type="primary">确认上架</Button> 
              : null
            }
          >
            <TabPane tab="待上架" key="1">
              {/* <Table
                loading={loading}
                dataSource={listwsj}
                bordered
                scroll={{x: '100%'}}
                columns={notColumns}
                rowKey={'id'}
                pagination={false}
                rowSelection={{
                  onChange: (selectedRowKeys, selectedRow) => {
                    this.setState({selectedRowKeys, selectedRow});
                  }
                }}
              /> */}
              <RemoteTable
                ref={(node) => this.listwsjTable = node}
                loading={loading}
                query={listwsjQuery}
                columns={notColumns}
                scroll={{ x: '100%' }}
                dataSource={listwsjData}
                cb={this.listysjTableCallBack}
                url={wareHouse.SHELF_INFO_LIST}
                rowKey='id'
                rowSelection={{
                  onChange: (selectedRowKeys, selectedRow) => {
                    this.setState({selectedRowKeys, selectedRow});
                  }
                }}
              />
            </TabPane>
            <TabPane tab="已上架" key="2">
              {/* <Table
                loading={loading}
                dataSource={listysj}
                bordered
                scroll={{x: '100%'}}
                columns={hasColumns}
                rowKey={'id'}
                pagination={false}
              /> */}
              <RemoteTable
                ref={(node) => this.listysjTable = node}
                query={listysjQuery}
                columns={hasColumns}
                scroll={{ x: '100%' }}
                url={wareHouse.SHELF_INFO_LIST}
                rowKey='id'
              />
            </TabPane>
          </Tabs>
        </div>
      </div>
    )
  }
}
export default connect()(DetailsPutaway);
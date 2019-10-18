/**
 * @file 药库 - 盘点损益 - 新建盘点
 */
import React, { PureComponent } from 'react';
import { Form, Row, Col, DatePicker, Input, Select, Button, Icon, message } from 'antd';
import { Link } from 'react-router-dom';
import { formItemLayout } from '../../../../utils/commonStyles';
import RemoteTable from '../../../../components/TableGrid';
import {common} from '../../../../api/checkDecrease';
import {connect} from 'dva';
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const { Option } = Select;

class SearchForm extends PureComponent {
  toggle = () => {
    this.props.formProps.dispatch({
      type:'base/setShowHide'
    });
  }
  handleSearch = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const makingTime = values.makingTime === undefined || values.makingTime === null ? "" : values.makingTime;
        if(makingTime.length > 0) {
          values.checkStartTime = makingTime[0].format('YYYY-MM-DD HH:mm');
          values.checkEndTime = makingTime[1].format('YYYY-MM-DD HH:mm');
        };
        let {filterStatus} = values;
        let {status} = this.props;
        if(filterStatus === "") {
          values.filterStatus = status.map(item=>item.value).filter(item=>item !== "").join(',');
        }
        this.props.formProps.dispatch({
          type:'base/updateConditions',
          payload: values
        });
      }
    })
  }
  componentDidMount() {
    let { queryConditons } = this.props.formProps.base;
    queryConditons = {...queryConditons};
    if(queryConditons.filterStatus && queryConditons.filterStatus.length > 1) {
      queryConditons.filterStatus = ""
    };
    //找出表单的name 然后set
    let values = this.props.form.getFieldsValue();
    values = Object.getOwnPropertyNames(values);
    let value = {};
    values.map(keyItem => {
      value[keyItem] = queryConditons[keyItem];
      return keyItem;
    });
    this.props.form.setFieldsValue(value);
  }
  handleReset = () => {
    this.props.form.resetFields();
    this.props.formProps.dispatch({
      type:'base/clearQueryConditions'
    });
  }
  listRender = (list) => {
    return <Select placeholder="请选择">
            {
              list.map(item => {
                return <Option key={item.value} value={item.value}>{item.label}</Option>
              })
            }
           </Select>
  } 
  render() {
    const { getFieldDecorator } = this.props.form;
    let {status, types, deptList} = this.props;
    const {display} = this.props.formProps.base;
    const expand = display === 'block';
    return(
      <Form onSubmit={this.handleSearch}>
        <Row gutter={30}>
          <Col span={8}>
            <FormItem label={'盘点部门'} {...formItemLayout}>
              {getFieldDecorator('checkBillDeptCode')(
                <Select placeholder="请选择"> 
                  <Option key='' value=''>全部</Option>
                  {
                    deptList.map(item => (
                      <Option key={item.id} value={item.id}>{item.deptName}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={'盘点时间'} {...formItemLayout}>
              {getFieldDecorator('makingTime')(
                <RangePicker />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={'单号'} {...formItemLayout} style={{ display }}>
              {getFieldDecorator('checkBillNo')(
                <Input placeholder={'盘点单号'} />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={'状态'} {...formItemLayout} style={{ display }}>
              {getFieldDecorator('filterStatus')(
                this.listRender(status)
              )}
            </FormItem>
          </Col>
          <Col span={8} style={{ display }}>
            <FormItem label={'类型'} {...formItemLayout}>
              {getFieldDecorator('checkBillType')(
                this.listRender(types)
              )}
            </FormItem>
          </Col>
          <Col span={8}>
          </Col>
          <Col span={8} style={{ textAlign: 'right', marginTop: 4 }}>
            <Button type="primary" htmlType="submit">查询</Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>重置</Button>
            <a style={{ marginLeft: 8, fontSize: 14 }} onClick={this.toggle}>
              {expand ? '收起' : '展开'} <Icon type={expand ? 'up' : 'down'} />
            </a>
          </Col>
        </Row>
      </Form>
    )
  }
}
const SearchFormWarp = Form.create()(SearchForm);

class InventoryAudit extends PureComponent {
  state = {
    query: {
      filterStatus: '3,4,5,6',
      sheveType: 1
    },
    types: [],
    status: [],
    deptList: []
  }
  componentDidMount() {
    const {dispatch} = this.props;
    dispatch({
      type: 'base/orderStatusOrorderType',
      payload: {
        type: 'check_bill_type'
      },
      callback: (data) => {
        this.setState({
          types: data
        });
      }
    });
    dispatch({
      type: 'base/orderStatusOrorderType',
      payload: {
        type: 'check_status',
        values: '3,4,5,6'
      },
      callback: (data) => {
        this.setState({
          status: data
        });
      }
    });
    dispatch({
      type: 'statistics/getDeptInfo',
      callback: ({data, code, msg}) => {
        if(code === 200) {
          this.setState({
            deptList: data
          });
        }else {
          message.error(msg);
        }
      }
    });
  }
  _tableChange = values => {
    this.props.dispatch({
      type:'base/setQueryConditions',
      payload: values
    });
  }
  //导出
  export = () => {
    let { queryConditons } = this.props.base;
    queryConditons = {...queryConditons};
    delete queryConditons.key;
    delete queryConditons.makingTime;
    delete queryConditons.pageNo;
    delete queryConditons.pageSize;
    delete queryConditons.sortOrder;
    delete queryConditons.sortField;
    this.props.dispatch({
      type: 'checkDecrease/checkBillSheveExport',
      payload: queryConditons
    })
  }
  render() {
    const {status, types, deptList} = this.state;
    const columns = [
      {
        title: '盘点单',
        dataIndex: 'checkBillNo',
        width: 168,
        render: (text, record) => {
          return <span><Link to={{ pathname: `/purchase/checkDecrease/inventoryAudit/details/${record.checkBillNo}`}}>{text}</Link></span>
        }
      },
      {
        title: '状态',
        dataIndex: 'checkStatusName',
        width: 112,
      },
      {
        title: '盘点类型',
        dataIndex: 'checkBillTypeName',
        width: 168,
      },
      {
        title: '盘点子类型',
        dataIndex: 'checkBillSubTypeName',
        width: 168,
      },
      {
        title: '药品特征',
        dataIndex: 'drugFeatureCodeName',
        width: 168,
      },
      {
        title: '采购类型',
        dataIndex: 'purchaseTypeName',
        width: 112,
      },
      {
        title: '盈亏总金额',
        dataIndex: 'excessiveTotalMoney',
        width: 168,
      },
      {
        title: '部门',
        dataIndex: 'checkBillDeptName',
        width: 112,
      },
      {
        title: '盘点责任人',
        dataIndex: 'createUserName',
        width: 112,
      },
      {
        title: '制单时间',
        dataIndex: 'createDate',
        width: 224,
      },
      {
        title: '盘点时间',
        dataIndex: 'checkTime',
        width: 224,
      },
      {
        title: '审核人',
        dataIndex: 'sheveUserName',
        width: 112,
      },
      {
        title: '审核时间',
        dataIndex: 'sheveDate',
        width: 168,
      },
      {
        title: '备注',
        dataIndex: 'remarks',
        width: 280,
      }
    ];
    let query = this.props.base.queryConditons;
    query = {...this.state.query, ...query};
    delete query.key;
    delete query.makingTime;
    return (
      <div className='ysynet-main-content'>
        <SearchFormWarp
          status={status}
          types={types}
          deptList={deptList}
          formProps={{...this.props}} 
        />
        <Row>
          <Button onClick={this.export}>导出</Button>
        </Row>
        <RemoteTable
          onChange={this._tableChange}
          query={query}
          url={common.SHEVE_LIST}
          columns={columns}
          rowKey={'id'}
          ref="table"
          scroll={{x: '100%'}}
          isDetail={true}
          style={{marginTop: 20}}
        />
      </div>
    )
  }
}
export default connect(state=>state)(InventoryAudit);
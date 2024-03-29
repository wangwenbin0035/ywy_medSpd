/**
 * @file 药库 - 盘点损益 - 新建盘点
 */
import React, { PureComponent } from 'react';
import { Form, Row, Col, DatePicker, Input, Select, Button, Icon } from 'antd';
import { Link } from 'react-router-dom';
import { formItemLayout } from '../../../../utils/commonStyles';
import RemoteTable from '../../../../components/TableGrid';
import {profiLossRecord} from '../../../../api/checkDecrease';
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
  componentDidMount() {
    let { queryConditons } = this.props.formProps.base;
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
  handleSearch = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const makingTime = values.makingTime === undefined || values.makingTime === null ? "" : values.makingTime;
        if(makingTime.length > 0) {
          values.checkStartTime = makingTime[0].format('YYYY-MM-DD HH:mm');
          values.checkEndTime = makingTime[1].format('YYYY-MM-DD HH:mm');
        };
        this.props.formProps.dispatch({
          type:'base/updateConditions',
          payload: values
        });
      }
    })
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
    let {types} = this.props;
    const {display} = this.props.formProps.base;
    const expand = display === 'block';
    return(
      <Form onSubmit={this.handleSearch}>
        <Row gutter={30}>
          <Col span={8}>
            <FormItem label={'盘点时间'} {...formItemLayout}>
              {getFieldDecorator('makingTime')(
                <RangePicker />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={'单号'} {...formItemLayout}>
              {getFieldDecorator('checkBillNo')(
                <Input placeholder={'盘点单号'} />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={'类型'} {...formItemLayout} style={{ display }}>
              {getFieldDecorator('checkBillType')(
                this.listRender(types)
              )}
            </FormItem>
          </Col>
          <Col span={8} style={{float: 'right', textAlign: 'right', marginTop: 4 }}>
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

class ProfiLossRecord extends PureComponent {
  state = {
    types: [],
    status: [],
  }
  componentDidMount() {
    this.props.dispatch({
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
      type: 'checkDecrease/excessiveExport',
      payload: queryConditons
    })
  }
  render() {
    const {types} = this.state;
    const columns = [
      {
        title: '损益单',
        dataIndex: 'causticExcessiveNo',
        width: 158,
        render: (text, record) => {
          return <span><Link to={{ pathname: `/pharmacy/checkDecrease/profiLossRecord/details/checkBillNo=${record.checkBillNo}&causticExcessiveNo=${record.causticExcessiveNo}`}}>{text}</Link></span>
        }
      },
      {
        title: '盘点单',
        dataIndex: 'checkBillNo',
        width: 158,
      },
      {
        title: '盘点类型',
        dataIndex: 'checkBillTypeName',
        width: 138,
      },
      {
        title: '盘点子类型',
        dataIndex: 'checkBillSubTypeName',
        width: 138,
      },
      {
        title: '药品特征',
        dataIndex: 'drugFeatureCodeName',
        width: 138,
      },
      {
        title: '部门',
        dataIndex: 'deptName',
        width: 100,
      },
      {
        title: '生成人',
        dataIndex: 'createUserName',
        width: 100,
      },
      {
        title: '生成时间',
        dataIndex: 'createDate',
        width: 200,
      }
    ];
    let query = this.props.base.queryConditons;
    query = {...query};
    delete query.key;
    delete query.makingTime;
    return (
      <div className='ysynet-main-content'>
        <SearchFormWarp
          types={types}
          formProps={{...this.props}}
        />
        <Row>
          <Button onClick={this.export}>导出</Button>
        </Row>
        <RemoteTable
          onChange={this._tableChange}
          query={query}
          hasIndex={true}
          url={profiLossRecord.CAUSTICEXCESSIVE_LIST}
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
export default connect(state=>state)(ProfiLossRecord);
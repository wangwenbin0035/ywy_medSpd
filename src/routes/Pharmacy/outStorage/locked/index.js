import React, { PureComponent } from 'react';
import { Form, Row, Col, DatePicker, Input, Select, Button, Icon, message } from 'antd';
import { Link } from 'react-router-dom';
import { formItemLayout } from '../../../../utils/commonStyles';
import RemoteTable from '../../../../components/TableGrid';
import { outStorage } from '../../../../api/drugStorage/outStorage';
import { connect } from 'dva';
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const { Option } = Select;

class SearchForm extends PureComponent {
  state = {
    recall_status_options: [],
    recallReason: []
  }
  toggle = () => {
    this.props.formProps.dispatch({
      type:'base/setShowHide'
    });
  }
  componentDidMount = () =>{
    const { dispatch } = this.props.formProps;
    dispatch({
      type: 'base/orderStatusOrorderType',
      payload: { 
        type: 'recall_status',
        values: '1,3,5,6'
      },
      callback: (data) =>{
        this.setState({ 
          recall_status_options: data 
        });
      }
    });
    dispatch({
      type: 'base/orderStatusOrorderType',
      payload: {
        type: 'recall_reason'
      },
      callback: (data) => {
        this.setState({
          recallReason: data
        });
      }
    });
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
        if (makingTime.length > 0) {
          values.startTime = makingTime[0].format('YYYY-MM-DD');
          values.endTime = makingTime[1].format('YYYY-MM-DD');
        }else {
          values.startTime = '';
          values.endTime = '';
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
  render() {
    const { recall_status_options, recallReason } = this.state;
    const { getFieldDecorator } = this.props.form;
    const {display} = this.props.formProps.base;
    const expand = display === 'block';
    return (
      <Form onSubmit={this.handleSearch}>
        <Row gutter={30}>
          <Col span={8}>
            <FormItem label={'单据号'} {...formItemLayout}>
              {getFieldDecorator('recallNo',{
                initialValue: ''
              })(
                <Input placeholder={'请输入'} />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={'原因'} {...formItemLayout}>
              {getFieldDecorator('recallReasonType',)(
                <Select
                  placeholder="请选择原因"
                  style={{width: '100%'}}
                >
                  {
                    recallReason.map(item => (
                      <Option key={item.value} value={item.value}>{item.label}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={'状态'} {...formItemLayout} style={{ display }}>
              {getFieldDecorator('recallStatus', {
                initialValue: ''
              })(
                <Select
                  showSearch
                  placeholder={'请选择'}
                  optionFilterProp="children"
                  filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                >
                  {
                     recall_status_options.map((item,index)=> <Option key={index} value={item.value}>{item.label}</Option>)
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem style={{ display }} label={'发起时间'} {...formItemLayout}>
              {getFieldDecorator('makingTime')(
                <RangePicker format={'YYYY-MM-DD'} />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={'供应商'} {...formItemLayout} style={{ display }}>
              {getFieldDecorator('supplierName', {
                initialValue: ''
              })(
                <Input placeholder={'请输入'} />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
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

class RecallAndLocked extends PureComponent {
  state = {
    loading: false,
    visible: false,
    selected: [],
    selectedRows: [],
    display: 'none'
  }
  delete = () =>{
    let { selectedRows, query } = this.state;
    if (selectedRows.length === 0) {
      return message.warn('请选择一条数据');
    };
    selectedRows = selectedRows.map(item => item.recallNo);
    this.setState({ loading: true });
    this.props.dispatch({
      type: 'outStorage/deleteRecallPlan',
      payload: { recallNos: selectedRows },
      callback: () =>{
        message.success('删除成功');
        this.setState({ loading: false });
        this.refs.table.fetch({ ...query });
      }
    })
    
  }
  _tableChange = values => {
    this.props.dispatch({
      type:'base/setQueryConditions',
      payload: values
    });
  }
  render() {
    const { loading } = this.state;
    const {match} = this.props;
    const columns = [
      {
        title: '锁定单号',
        dataIndex: 'recallNo',
        width: 168,
        render: (text, record) => 
        <span>
          <Link to={{pathname: `${match.path}/details/${text}/${record.recallStatus}`}}>{text}</Link>
        </span>
       },
      {
        title: '状态',
        width: 112,
        dataIndex: 'recallStatusName',
      },
      {
        title: '类型',
        width: 168,
        dataIndex: 'recallTypeName',
      },
      {
        title: '召回原因',
        width: 280,
        dataIndex: 'remarks',
      },
      {
        title: '发起人',
        width: 112,
        dataIndex: 'createUserName',
      },
      {
        title: '发起时间',
        width: 224,
        dataIndex: 'createDate',
      },
    ];
    let query = this.props.base.queryConditons;
    delete query.key;
    return (
      <div className='ysynet-main-content'>
        <SearchFormWarp 
          formProps={{...this.props}}
        />
        <div>
          <Button type='primary' style={{ marginLeft: 10 }}><Link to={{pathname: `${match.path}/add`}}>新建锁定</Link></Button>
          <Button style={{ marginLeft: 10 }} onClick={this.delete} loading={loading}>删除</Button>
        </div>
        <RemoteTable
          onChange={this._tableChange}
          ref='table'
          query={query}
          bordered
          hasIndex={true}
          url={outStorage.ROOMRECALL_LOCK_LIST}
          columns={columns}
          rowKey={'id'}
          scroll={{ x: '100%' , }}
          isDetail={true}
          style={{marginTop: 20}}
          rowSelection={{
            selectedRowKeys: this.state.selected,
            onChange: (selectedRowKeys, selectedRows) => {
              this.setState({selected: selectedRowKeys, selectedRows: selectedRows})
            },
            getCheckboxProps: record => ({
              disabled: record.recallStatus !== '3'
            }),
          }}
        />
      </div>
    )
  }
}
export default connect(state => state)(RecallAndLocked);
/*
 * @Author: wwb 
 * @Date: 2018-07-24 16:08:53 
 * @Last Modified by: wwb
 * @Last Modified time: 2019-10-20 15:20:12
 */

/**
 * @file 采购计划 - 补货管理--补货计划
 */
import React, { PureComponent } from 'react';
import { Form, Row, Col, Button, Icon, Select, Tooltip } from 'antd';
import RemoteTable from '../../../../components/TableGrid';
import FetchSelect from '../../../../components/FetchSelect';
import { connect } from 'dva';
import {statisticAnalysis} from '../../../../api/purchase/purchase';
import {common} from '../../../../api/purchase/purchase';
const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
    md: {span: 8}
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
    md: {span: 16}
  },
};


class SearchForm extends PureComponent{
  state = {
    timeList: [],
    deptList: [],
    supplierList: []
  }
  componentDidMount() {
    const {dispatch} = this.props.formProps;
    dispatch({
      type: 'statistics/getTimeList',
      callback: ({data, code, msg}) => {
        if(code === 200) {
          this.setState({
            timeList: data
          });
          // let id = '';
          // data.forEach(item => {
          //   if(item.desc === 180) {
          //     id = item.id;
          //   };
          // });
          this.props.form.setFieldsValue({
            diffDay: 180
          });
          this.props._handlQuery({diffDay: 180});
        }
      }
    });
    dispatch({
      type: 'statistics/getDeptByParam',
      callback: ({data, code, msg}) => {
        if(code === 200) {
          this.setState({
            deptList: data
          });
        }
      }
    });
    dispatch({
      type: 'statistics/supplierAll',
      callback: ({data, code, msg}) => {
        if(code === 200) {
          this.setState({
            supplierList: data
          });
        }
      }
    });
  }
  toggle = () => {
    this.props.formProps.dispatch({
      type:'base/setShowHide'
    });
  }
  handleSearch = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values.deptCodeList = values.deptCodeList ? [values.deptCodeList] : [];
        values.hisDrugCodeList = values.hisDrugCodeList ? [values.hisDrugCodeList] : [];
        values.supplierCodeList = values.supplierCodeList ? [values.supplierCodeList] : [];
        this.props._handlQuery(values);
      }
    })
  }
  //重置
  handleReset = () => {
    this.props.form.resetFields(['supplierCodeList', 'hisDrugCodeList', 'deptCodeList']);
  }
  render(){
    const { getFieldDecorator } = this.props.form;
    const {display} = this.props.formProps.base;
    const expand = display === 'block';
    const { timeList, deptList, supplierList } = this.state;
    return (
      <Form className="ant-advanced-search-form" onSubmit={this.handleSearch}>
        <Row gutter={30}>
        <Col span={8}>
            <FormItem {...formItemLayout} label={`临效期选择`}>
              {
                getFieldDecorator(`diffDay`)(
                  <Select 
                    placeholder="请选择"
                    style={{
                      width: '100%'
                    }}
                  >
                    {
                      timeList.map(item => (
                        <Option key={item.id} value={item.id}>{item.desc}</Option>
                      ))
                    }
                  </Select>
                )
              }
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label={`供应商`}>
              {
                getFieldDecorator(`supplierCodeList`)(
                  <Select 
                    placeholder="请选择"
                    style={{
                      width: '100%'
                    }}
                  >
                    <Option key="" value="">全部</Option>
                    {
                      supplierList.map(item => (
                        <Option key={item.ctmaSupplierCode} value={item.ctmaSupplierCode}>{item.ctmaSupplierName}</Option>
                      ))
                    }
                  </Select>
                )
              }
            </FormItem>
          </Col>
          <Col span={8} style={{ display: display }}>
            <FormItem {...formItemLayout} label={'药品名称'}>
              {
                getFieldDecorator(`hisDrugCodeList`)(
                  <FetchSelect
                    allowClear={true}
                    placeholder='药品名称'
                    query={{queryType: 3}}
                    url={common.QUERY_DRUG_BY_LIST}
                  />
                )
              }
            </FormItem>
          </Col>
          <Col span={8} style={{ display: display }}>
            <FormItem {...formItemLayout} label={`部门`}>
              {
                getFieldDecorator(`deptCodeList`)(
                  <Select 
                    placeholder="请选择"
                    style={{
                      width: '100%'
                    }}
                  >
                    <Option key="" value="">全部</Option>
                    {
                      deptList.map(item => (
                        <Option key={item.id} value={item.id}>{item.deptName}</Option>
                      ))
                    }
                  </Select>
                )
              }
            </FormItem>
          </Col>
          <Col span={8} style={{float: 'right', textAlign: 'right', marginTop: 4}} >
           <Button type="primary" htmlType="submit">查询</Button>
           <Button type='default' style={{marginLeft: 8}} onClick={this.handleReset}>重置</Button>
           <a style={{marginLeft: 8, fontSize: 14}} onClick={this.toggle}>
             {expand ? '收起' : '展开'} <Icon type={expand ? 'up' : 'down'} />
           </a>
         </Col>
        </Row>
      </Form>
    )
  }
}
const WrapperForm = Form.create()(SearchForm);

class NearlyEffective extends PureComponent {
  state = {
    query: {
      queryType: 2
    },
  }
  handlQuery = (query) => {
    this.setState({
      query: {
        ...this.state.query,
        ...query
      }
    });
  }
  export = () => {
    this.props.dispatch({
      type: 'statistics/ypjxqExport',
      payload: {
        ...this.state.query
      }
    })
  }
  render() {
    const columns = [
      {
        title: '部门',
        dataIndex: 'deptName',
        width: 168,
      }, {
        title: '临效期天数',
        dataIndex: 'diffDay',
        width: 168,
        render: (text) => {
          let color = '#f2a11c';
          let fontSize = '24px'
          if(text <= 30) {
            color = '#a8071a';
            fontSize = '24px'
          };
          if(text > 30 && text <= 60) {
            color = '#f5222d';
            fontSize = '24px'
          };
          if(text > 60 && text <= 90) {
            color = '#ff0000';
            fontSize = '24px'
          }
          return <span style={{color,fontSize}}>{text}</span>;
        }
      }, {
        title: '货位',
        dataIndex: 'goodsName',
        width: 168,
      }, {
        title: '货位类型',
        dataIndex: 'locName',
        width: 168,
      }, {
        title: '库存',
        dataIndex: 'totalQuantity',
        width: 112
      }, /*{
        title: '通用名',
        dataIndex: 'ctmmGenericName',
        width: 224,
        className: 'ellipsis',
        render:(text)=>(
          <Tooltip placement="topLeft" title={text}>{text}</Tooltip>
        )
      }, */{
        title: '药品名称',
        dataIndex: 'ctmmTradeName',
        width: 350,
        className: 'ellipsis',
        render:(text)=>(
          <Tooltip placement="topLeft" title={text}>{text}</Tooltip>
        )
      },/* {
        title: '规格',
        dataIndex: 'ctmmSpecification',
        width: 168,
      }, */{
        title: '生产厂家',
        dataIndex: 'ctmmManufacturerName',
        width: 200,
        className:'ellipsis',
        render:(text)=>(
          <Tooltip placement="right" title={text}>{text}</Tooltip>
        )
      }, {
        title: '单位',
        dataIndex: 'replanUnit',
        width: 112,
      }, {
        title: '生产批号',
        dataIndex: 'lot',
        width: 148,
      }, {
        title: '生产日期',
        dataIndex: 'productDate',
        width: 118,
      }, {
        title: '有效期至',
        dataIndex: 'validEndDate',
        width: 118,
      }, {
        title: '包装规格',
        dataIndex: 'packageSpecification',
        width: 118,
      }, {
        title: '剂型',
        dataIndex: 'ctmmDosageFormDesc',
        width: 90,
      }, {
        title: '采购方式',
        width: 112,
        dataIndex: 'purchaseType',
        render: (text) => text === 1 ? '零库存' : '自采'
      }, {
        title: '价格',
        width: 112,
        dataIndex: 'price',
      }, {
        title: '供应商',
        dataIndex: 'supplierName',
        width: 168,
        className: 'ellipsis',
        render:(text)=>(
            <Tooltip placement="topLeft" title={text}>{text}</Tooltip>
        )
      }, {
        title: '批准文号',
        dataIndex: 'approvalNo',
        width: 168,
      },
        {
            title: '药品编号',
            dataIndex: 'hisDrugCode',
            width: 168,
        },
    ];
    const {query} = this.state;
    return (
      <div className='ysynet-main-content'>
        <WrapperForm
          formProps={{...this.props}}
          _handlQuery={this.handlQuery}
        />
        <div>
          <Button onClick={this.export}>导出</Button>
        </div>
        {
          query.diffDay ? 
          <RemoteTable
            onChange={this._tableChange}
            query={query}
            isJson
            hasIndex={true}
            columns={columns}
            scroll={{x: '100%'}}
            isDetail={true}
            style={{marginTop: 20}}
            ref='table'
            rowKey={'batchNo'}
            url={statisticAnalysis.STATICS_LIST}
          /> : null
        }
        
      </div>
    )
  }
}
export default connect(state => state)(Form.create()(NearlyEffective));
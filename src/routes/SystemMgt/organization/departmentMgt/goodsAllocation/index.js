/*
 * @Author: yuwei 
 * @Date: 2018-08-22 15:34:09 
* @Last Modified time: 2018-08-22 15:34:09 
 */
 /**
 * @file 系统管理--组织机构--部门管理--货位goodsAllocation
 */

import React , { PureComponent } from 'react';
import {Form , Button , Row , Col, Input , Select , Modal, message} from 'antd';
import { formItemLayout } from '../../../../../utils/commonStyles';
import RemoteTable from '../../../../../components/TableGrid';
import { systemMgt } from '../../../../../api/systemMgt';
import { connect } from 'dva';
const FormItem = Form.Item;
const Option = Select.Option;
const singleFormItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 },
    md: {span: 8}
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 17 },
    md: {span: 14}
  },
}

class GoodsAllocation extends PureComponent{

  state={
    loading:false,
    visible:false,
    modalTitle:"新增",
    record:{},//当前要编辑的信息
    query:{
      deptCode:this.props.match.params.id
    },
    goosTypeSelect:[],//货位类型接口下拉框
    getUserListSelect:[],//责任人下拉框
    addLocLoading: false,
    maxSort: 0, //最大排序
  }

  componentDidMount(){
    const {id} = this.props.match.params;
    //所有的货位类型
    this.props.dispatch({
      type:'Organization/GetGoodsType',
      payload: {
        deptCode: id
      },
      callback:(data)=>{
        // console.log(data)
        this.setState({
          goosTypeSelect:data.data
        })
      }
    })

    //责任人
    this.props.dispatch({
      type:'Organization/GetUserList',
      payload:null,
      callback:(data)=>{
        // console.log(data)
        this.setState({
          getUserListSelect:data.data
        })
      }
    })
  }

  //新加货位 - 打开弹窗
  add = () => {
    this.props.form.resetFields();
    this.setState({visible:true,modalTitle:"新增"})
  }

  //新加货位 -提交表单
  onSubmitModal = () => {
    this.props.form.validateFields((err,values)=>{
      if(!err){
        this.setState({
          addLocLoading: true
        });
        values.deptCode = this.props.match.params.id;
        if(values.positionType){
          values.positionType=Number(values.positionType);
        };
        values.id = this.state.record.id;
        this.props.dispatch({
          type:'Organization/saveOrUpdateGoodsPlace',
          payload:{ ...values },
          callback:({data, code, msg})=>{
            if(code === 200) {
              this.onCancelModal();
              this.refs.tableGoods.fetch();
            }else {
              message.error(msg);
            };
            this.setState({
              addLocLoading: false
            });
          }
        })
      }
    })
  }

  //新加货位 -关闭弹窗
  onCancelModal = () => {
    this.props.form.resetFields();
    this.setState({
      visible:false, 
      record: {},
      addLocLoading: false
    })
  }

  //编辑货位-
  editModal=(record)=>{
    this.setState({record,visible:true,modalTitle:'编辑'});
    const { positionName , positionType , chargeInPerson ,sort} = record ;
    console.log(record);
    this.props.form.setFieldsValue({ positionName , positionType :`${positionType}`, chargeInPerson , sort })
  }

  render(){
    const { visible , modalTitle , query , goosTypeSelect , getUserListSelect, addLocLoading } = this.state;
    const { getFieldDecorator } = this.props.form;
    const columns = [
      {
        title: '货位名称',
        dataIndex: 'positionName',
      },
      {
        title: '货位类型',
        dataIndex: 'positionType',
        render:(text)=>{
          if(goosTypeSelect && goosTypeSelect.length){
            let a =  goosTypeSelect.filter(item=>{
              return item.id===`${text}`? item.locationName:false
            })
            if(a.length){
              return a[0].locationName
            }else{
              return ''
            }
          }
        }
      },
      {
        title: '货位排序号',
        dataIndex: 'sort',
      },
      {
        title: '货位责任人',
        dataIndex: 'personName',
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 60,
        render: (text,record,index)=>{
          return <span>
            <a onClick={()=>this.editModal(record)}>编辑</a>
          </span>
        }
      }
    ]

    return (
      <div className='fullCol'>
        <div className='fullCol-fullChild'>
          <Button type='primary' icon='plus' onClick={this.add}>新加货位</Button> 
        </div>
        <div className='detailCard'>
          <Row>
            <Col span={4} style={{fontSize:18,marginTop:5}}>
              货位信息
            </Col>
            <Col span={20}>
              <WrapperForm 
              query={(data)=>this.refs.tableGoods.fetch(data)} 
              goosTypeSelect={goosTypeSelect}
              deptCode={this.props.match.params.id}
              ></WrapperForm>
            </Col>
          </Row>
          <RemoteTable
            ref='tableGoods'
            query={query}
            style={{marginTop: 20}}
            columns={columns}
            hasIndex={true}
            scroll={{ x: '100%' }}
            url={systemMgt.goodsAllocation}
            rowSelection={{
              onChange:(selectRowKeys, selectedRows)=>{
                this.setState({selectRowKeys})
              }
            }}
            rowKey='id'
            cb={(value, option) => {
              this.setState({
                maxSort: value[0].maxSort
              })
              console.log(value+'option:'+option)
            }}
          />
        </div>

        <Modal 
          visible={visible}
          title={modalTitle}
          onOk={this.onSubmitModal}
          onCancel={this.onCancelModal}
          okButtonProps={{loading: addLocLoading}}
        >
          <Form onSubmit={this.onSubmit}>
            <FormItem {...singleFormItemLayout} label={`货位名称`}>
              {
                getFieldDecorator(`positionName`,{
                  rules: [{ required: true,message: '请输入货位名称' }]
                })(
                  <Input />
                )
              }
            </FormItem>
            <FormItem {...singleFormItemLayout} label={`货位排序号`} extra={`只能输入${this.state.maxSort}号以后的序号`}>
              {
                getFieldDecorator(`sort`,{
                  rules: [{
                      required: true,
                      message: '请输入数字', 
                      whitespace: true,
                      type:'number',
                      transform(value) {
                        if(value){
                          return Number(value);
                      }
                    },
                  }]
                })(
                  <Input />
                )
              }
            </FormItem>
            <FormItem {...singleFormItemLayout} label={`货位类型`}>
              {
                getFieldDecorator(`positionType`,{
                  rules: [{ required: true,message: '请选择货位类型' }]
                })(
                  <Select placeholder="请选择货位类型">
                    {
                      goosTypeSelect.map(item=>(
                        <Option key={item.id} value={item.id}>{item.locationName}</Option>
                      ))
                    }
                  </Select>
                )
              }
            </FormItem>
            <FormItem {...singleFormItemLayout} label={`责任人`}>
              {
                getFieldDecorator(`chargeInPerson`)(
                  <Select>
                    {
                      getUserListSelect.map(item=>(
                        <Option key={item.id} value={item.id}>{item.name}</Option>
                      ))
                    }
                  </Select>
                )
              }
            </FormItem>
          </Form>
        </Modal>
      </div>
    )
  }
}
export default connect(state=>state)( Form.create()(GoodsAllocation)) ; 



class SearchForm extends PureComponent{

  handleSearch = (e) =>{
    e.preventDefault();
    this.props.form.validateFields((err,values)=>{
      if(!err){
        console.log(values,'查询数据');
        if(values.positionType!==''){
          values.positionType = Number(values.positionType)
        }else{
          delete values['positionType']
        };
        values.deptCode = this.props.deptCode;
        this.props.query(values)
      }
    })
  }
  handleReset = () =>{
    this.props.form.resetFields();
    this.props.query({deptCode:this.props.deptCode})
  }
  render(){
    const { getFieldDecorator } = this.props.form;
    
    return (
      <Form className="ant-advanced-search-form" onSubmit={this.handleSearch}>
        <Row gutter={10}>
          <Col span={8}>
            <FormItem {...formItemLayout} label={`货位名称`}>
              {
                getFieldDecorator(`positionName`,{
                  initialValue: ''
                })(
                  <Input placeholder='请输入' />
                )
              }
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label={`货位类型`}>
              {
                getFieldDecorator(`positionType`)(
                  <Select placeholder="请选择货位类型">
                    {
                      this.props.goosTypeSelect?
                      this.props.goosTypeSelect.map(item=>(
                        <Option key={item.id} value={item.id}>{item.locationName}</Option>
                      )):null
                    }
                  </Select>
                )
              }
            </FormItem>
          </Col>
          <Col span={8} style={{textAlign: 'right', marginTop: 4}}>
            <Button type="primary" className='button-gap'  htmlType="submit">搜索</Button>
            <Button type='default' className='button-gap' onClick={this.handleReset}>重置</Button>
           </Col>
        </Row>
      </Form>
    )
  }
}
const WrapperForm = Form.create()(SearchForm);
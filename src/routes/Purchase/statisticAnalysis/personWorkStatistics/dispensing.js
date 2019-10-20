/*
 * @Author: wwb
 * @Date: 2018-07-24 16:08:53
 * @Last Modified by: wwb
 * @Last Modified time: 2019-10-20 15:21:02
 */

/**
 * @file 采购计划 - 统计分析--人员统计及追溯
 */
import React, { PureComponent } from 'react';
import { Row, Col,Tooltip } from 'antd';
import RemoteTable from '../../../../components/TableGrid';
import { connect } from 'dva';
import {tracingTotalList} from '../../../../api/purchase/patientTracing';
import moment from 'moment';

class OrderRetrospect extends PureComponent {

  render() {
    const columns = [
      {
        title: '单据号',
        dataIndex: 'dispensingno',
        width:160,
        className: 'ellipsis',
        render:(text)=>(
            <Tooltip placement="topLeft" title={text}>{text}</Tooltip>
        )
      },
      {
        title: '操作时间',
        width:118,
        dataIndex: 'createdate',
        className: 'ellipsis',
          render:(text)=>(
              <Tooltip>
                  {moment(text).format('YYYY-MM-DD')}
              </Tooltip>
          )
      },
      {
        title: '商品名称',
        dataIndex: 'ctmmtradename',
        width: 350,
      },
      {
        title: '规格',
        dataIndex: 'ctmmspecification',
        width: 168,
      },
      {
        title: '生产厂商',
        dataIndex: 'ctmmmanufacturername',
        width: 200,
      },
      {
        title: '单位',
        dataIndex: 'ctmmvaluationunit',
        width: 112,
      },
      {
        title: '操作前库存',
        dataIndex: 'storenum',
        width: 90,
      },
      {
        title: '操作数量',
        dataIndex: 'quantity',
        width:90,
      },
      {
        title: '操作后结存',
        dataIndex: 'number',
        width: 90,
      },
      {
        title: '货位',
        dataIndex: 'positionname',
        width: 166,
      },
    ];
      const {userid,userno,username} = this.props.match.params;
    let query = {
        userid: userid,
    }
    return (
      <div className="fullCol">
              <div className="fullCol-fullChild">
                <h3>基本信息</h3>
                  <Row>
                      <Col span={8}>
                          <div className="ant-form-item-label-left ant-col-xs-24 ant-col-sm-5">
                              <label>工号</label>
                          </div>
                          <div className="ant-form-item-control-wrapper ant-col-xs-24 ant-col-sm-18">
                              <div className='ant-form-item-control'>{userno&&userno!=='undefined'?userno:''}</div>
                          </div>
                      </Col>
                      <Col span={8}>
                          <div className="ant-form-item-label-left ant-col-xs-24 ant-col-sm-5">
                              <label>姓名</label>
                          </div>
                          <div className="ant-form-item-control-wrapper ant-col-xs-24 ant-col-sm-18">
                              <div className='ant-form-item-control'>{username?username:''}</div>
                          </div>
                      </Col>
                  </Row>
              </div>
      <div className='ysynet-main-content'>
      <h3 style={{marginBottom: 16}}>调剂信息</h3>
        <RemoteTable
          query={query}
          scroll={{x: '100%', y: 300}}
          isJson
          hasIndex={true}
          columns={columns}
          style={{marginTop: 20}}
          ref='table'
          rowKey={'id'}
          url={tracingTotalList.DISPENS}
        />
      </div>
      </div>
    )
  }

}
export default connect(state => state)(OrderRetrospect);

import React,{PureComponent} from "react";
import { Form } from 'antd';
import RemoteTable from '../../../../components/TableGrid';
import { connect } from 'dva';
import {tracingTotalList} from '../../../../api/purchase/patientTracing';
class OrderRetrospect extends PureComponent {
  render() {
    const columns = [
      {
        title: '商品名称',
        dataIndex: 'ctmmgenericname',
        width: 250,
        className: 'ellipsis'
      },

      {
        title: '规格',
        dataIndex: 'ctmmspecification',
        width: 200,
        className: 'ellipsis'
      },
      {
        title: '生产厂商',
        dataIndex: 'ctmmmanufacturername',
        width: 250,
      },
      {
        title: '单位',
        dataIndex: 'unit',
        width: 112,
      },
      {
        title: '数量',
        dataIndex: 'demandquantity',
        width: 112,
      },

    ];
    let query={userid:this.props.match.params.userid}
    return (
      <div className='ysynet-main-content'>
        <RemoteTable
          query={query}
          scroll={{x: '100%', y: 300}}
          isJson
          columns={columns}
          style={{marginTop: 20}}
          ref='table'
          rowKey={this.props.match.params.userid}
          url={tracingTotalList.GET_Purchase_Order_Details}
        />
      </div>
    )
  }
}
export default connect(state => state)(Form.create()(OrderRetrospect));


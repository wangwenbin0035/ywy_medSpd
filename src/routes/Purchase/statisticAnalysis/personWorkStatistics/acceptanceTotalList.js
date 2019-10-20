import React,{PureComponent} from "react";
import RemoteTable from '../../../../components/TableGrid';
import { connect } from 'dva';
import {tracingTotalList} from '../../../../api/purchase/patientTracing';;

class OrderRetrospect extends PureComponent {
  _tableChange = values => {

    //当table 变动时修改搜索条件
    this.props.dispatch({
      type:'base/setQueryConditions',
      payload: values
    });
    console.log(values)
  }
  render() {
    const columns = [
      {
        title: '商品名称',
        dataIndex: 'ctmmgenericname',
        width: 270,
      },

      {
        title: '规格',
        dataIndex: 'ctmmspecification',
        width: 200
      },
      {
        title: '单位',
        dataIndex: 'unit',
        width: 112,
      },
      {
        title: '操作前库存数量',
        dataIndex: 'storenum',
        width: 120,
      },

      {
        title: '操作数量',
        dataIndex: 'quantiry',
        width: 100,
      },
      {
        title: '操作后结存',
        dataIndex: 'balance',
        width: 100,
      },
    ];
    let query = {
        userid:this.props.match.params.userid
    }
    return (
      <div className='ysynet-main-content'>
        <RemoteTable
          query={query}
          scroll={{x: '100%', y: 400}}
          isJson
          columns={columns}
          style={{marginTop: 20}}
          ref='table'
          hasIndex={true}
          rowKey={'id'}
          url={tracingTotalList.GET_Checkaccept_Details}
        />
      </div>
    )
  }
}
export default connect(state => state)(OrderRetrospect);


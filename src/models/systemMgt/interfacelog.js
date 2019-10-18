/**
 * @author QER
 * @date 19/2/22
 * @Description: 接口监控
 */
import * as interfacelogService from '../../services/system/interfacelog';
// import { message } from 'antd';
export default {
    namespace: 'interfacelog',
    state:{

    },
    reducers: {
    },
    effects:{
        // 接口分类
        *getAllMethodType({ payload, callback },{ put, call }){
            const data = yield call(interfacelogService.getAllMethodType, payload);
            if(callback && typeof callback === 'function'){
                callback(data);
            }
        },
        // 接口
        *getRequestMethods({ payload, callback },{ put, call }){
            const data = yield call(interfacelogService.getRequestMethods, payload);
            if(callback && typeof callback === 'function'){
                callback(data);
            }
        },
        //今日调用汇总
        *getLogCountByDate({ payload, callback },{ put, call }){
            const data = yield call(interfacelogService.getLogCountByDate, payload);
            if(callback && typeof callback === 'function'){
                callback(data);
            }
        },
        //重发接口
        *reSend({ payload, callback },{ put, call }){
            const data = yield call(interfacelogService.reSend, payload);
            if(callback && typeof callback === 'function'){
                callback(data);
            }
        },
        //处理完毕接口
        *handleLog({ payload, callback },{ put, call }){
            const data = yield call(interfacelogService.handleLog, payload);
            if(callback && typeof callback === 'function'){
                callback(data);
            }
        },
    },


    subscriptions: {}
}
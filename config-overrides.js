const { 
  override,  // 覆盖重写
  fixBabelImports, 
  addLessLoader, // 
  addBabelPlugin, // babel 配置 装饰器
  addWebpackAlias // 添加别名
} = require('customize-cra');
const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const vendor = [
  "react", 
  "react-dom", 
  "lodash", 
  "moment",
  "react-router",
  "dva"
]

const addCustomize = () => config => {
  if (process.env.NODE_ENV === 'production') {
    config.devtool = false; //去掉map文件
    if (config.plugins) {
      config.plugins.push(new BundleAnalyzerPlugin());
    }
    const splitChunksConfig = config.optimization.splitChunks;
     if (config.entry && config.entry instanceof Array) {
       config.entry = {
         main: config.entry,
         vendor
       }
     } else if (config.entry && typeof config.entry === 'object') {
       config.entry.vendor = vendor
     }
 
    Object.assign(splitChunksConfig, {
      chunks: 'all',
      cacheGroups: {
        vendors: {// 抽离第三方插件
          test: /node_modules/,// 指定是node_modules下的第三方包
          name: 'vendors',// 打包后的文件名，任意命名
          priority: -10,  // 设置优先级，防止和自定义的公共代码提取时被覆盖，不进行打包

        },
        common: {// 抽离自己写的公共代码
          name: 'common',// 打包后的文件名，任意命名
          minChunks: 2,//最小引用2次
          minSize: 30000,// 只要超出30000字节就生成一个新包
          chunks: 'all'
        }
      }
    })
  }
  return config;
}

module.exports = override(
  addLessLoader({
    // strictMath: true,
    // noIeCompat: true,
    javascriptEnabled: true,
    // modifyVars: { '@primary-color': '#1DA57A' },
  }),
  fixBabelImports('import',
  {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true
  }),
  addWebpackAlias({ ["@"]: path.resolve(__dirname, 'src'), }),
  addCustomize(),
  addBabelPlugin(["@babel/plugin-proposal-decorators", {"legacy": true}]),
)

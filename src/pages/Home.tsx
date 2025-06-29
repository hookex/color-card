/**
 * Home页面组件
 * 重构为使用新架构的入口页面
 * 
 * @description 现在作为HomeContainer的简单包装器
 * 所有业务逻辑已移至HomeContainer和相关Hooks中
 */

import React from 'react';
import { HomeContainer } from '../containers';

/**
 * Home页面组件
 */
const Home: React.FC = () => {
  return <HomeContainer />;
};

export default Home;
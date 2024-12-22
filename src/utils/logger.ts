import debug from 'debug';

// 为不同的模块创建不同的命名空间
const createLogger = (namespace: string) => {
  const logger = debug(`colorcard:${namespace}`);
  
  // 在浏览器中启用调试
  if (process.env.NODE_ENV === 'development') {
    debug.enable(`colorcard:*`);
    // 确保在浏览器中持久化debug设置
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('debug', 'colorcard:*');
    }
  }

  return {
    log: logger,
    info: logger.extend('info'),
    warn: logger.extend('warn'),
    error: logger.extend('error'),
  };
};

export default createLogger;

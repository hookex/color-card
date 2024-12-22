import debug from 'debug';

// 启用所有日志
debug.enable('colorcard:*');

// 在浏览器中持久化debug设置
if (typeof window !== 'undefined') {
  localStorage.setItem('debug', 'colorcard:*');
}

// 为不同的模块创建不同的命名空间
const createLogger = (namespace: string) => {
  const logger = debug(`colorcard:${namespace}`);

  return {
    log: (...args: any[]) => {
      console.log(`[${namespace}]`, ...args);
      logger(...args);
    },
    info: (...args: any[]) => {
      console.info(`[${namespace}]`, ...args);
      logger.extend('info')(...args);
    },
    warn: (...args: any[]) => {
      console.warn(`[${namespace}]`, ...args);
      logger.extend('warn')(...args);
    },
    error: (...args: any[]) => {
      console.error(`[${namespace}]`, ...args);
      logger.extend('error')(...args);
    },
  };
};

export default createLogger;

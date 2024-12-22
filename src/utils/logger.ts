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
    log: (...args: unknown[]) => {
      console.log(`%c[${namespace}]`, 'color: blue', ...args);
      logger(...args);
    },
    info: (...args: unknown[]) => {
      console.info(`%c[${namespace}]`, 'color: green', ...args);
      logger(...args);
    },
    debug: (...args: unknown[]) => {
      console.debug(`%c[${namespace}]`, 'color: gray', ...args);
      logger(...args);
    },
    warn: (...args: unknown[]) => {
      console.warn(`%c[${namespace}]`, 'color: orange', ...args);
      logger.extend('warn')(...args);
    },
    error: (...args: unknown[]) => {
      console.error(`%c[${namespace}]`, 'color: red', ...args);
      logger.extend('error')(...args);
    },
  };
};

export default createLogger;

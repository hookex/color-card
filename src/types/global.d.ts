/**
 * 全局类型声明文件
 * 定义全局使用的类型和接口
 */

/**
 * React元素类型扩展
 */
declare namespace React {
  interface CSSProperties {
    '--ion-color-primary'?: string;
    '--ion-color-secondary'?: string;
    '--ion-color-tertiary'?: string;
    '--ion-color-background'?: string;
    '--ion-color-surface'?: string;
    [key: `--${string}`]: string | number | undefined;
  }
}

/**
 * Window对象扩展
 */
declare global {
  interface Window {
    /** Capacitor相关 */
    Capacitor?: {
      isNativePlatform: () => boolean;
      getPlatform: () => string;
    };
    
    /** 性能监控相关 */
    performance: Performance & {
      memory?: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
      };
    };
    
    /** 开发工具 */
    __REDUX_DEVTOOLS_EXTENSION__?: any;
    
    /** PWA相关 */
    workbox?: any;
  }

  /**
   * 环境变量类型
   */
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      VITE_APP_VERSION?: string;
      VITE_APP_BUILD_TIME?: string;
      VITE_API_BASE_URL?: string;
    }
  }

  /**
   * Vite环境变量
   */
  interface ImportMetaEnv {
    readonly VITE_APP_VERSION: string;
    readonly VITE_APP_BUILD_TIME: string;
    readonly VITE_API_BASE_URL: string;
    readonly DEV: boolean;
    readonly PROD: boolean;
    readonly SSR: boolean;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

/**
 * 模块声明
 */
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

/**
 * 工具类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

/**
 * 函数相关类型
 */
export type AsyncFunction<T = any> = (...args: any[]) => Promise<T>;
export type SyncFunction<T = any> = (...args: any[]) => T;
export type AnyFunction<T = any> = AsyncFunction<T> | SyncFunction<T>;

/**
 * 事件相关类型
 */
export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

/**
 * 状态相关类型
 */
export type SetState<T> = (value: T | ((prev: T) => T)) => void;
export type StateUpdater<T> = (prev: T) => T;

/**
 * API相关类型
 */
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: number;
}

export interface PaginatedResponse<T = any> extends APIResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 错误相关类型
 */
export interface ErrorInfo {
  message: string;
  stack?: string;
  code?: string | number;
  type?: string;
  timestamp?: number;
}

/**
 * 组件Props相关类型
 */
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  testId?: string;
}

export interface WithErrorBoundaryProps {
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export {};
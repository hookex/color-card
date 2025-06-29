import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.colorcard.wallpaper',
  appName: 'ColorCard',
  webDir: 'dist',
  
  // 服务器配置
  server: {
    // 生产环境不需要 allowNavigation
    // allowNavigation: ['https://colorcard.app']
  },

  // iOS 平台配置
  ios: {
    contentInset: 'automatic',
    // 性能优化
    preferredContentMode: 'mobile',
    // 键盘行为优化
    scrollEnabled: false,
    // 状态栏配置
    statusBarStyle: 'dark',
    // 启动画面优化
    splashScreenDelay: 0,
    // 安全区域处理
    handleScrollViewSafeArea: true,
    // WebView 性能优化
    allowInlineMediaPlayback: true,
    mediaPlaybackRequiresUserAction: false,
    // 内存优化
    allowsInlineMediaPlayback: true,
    // 网络安全
    allowsArbitraryLoads: false,
    minimumTlsVersion: '1.2'
  },

  // Android 平台配置
  android: {
    // 状态栏配置
    statusBarStyle: 'dark',
    statusBarBackgroundColor: '#000000',
    // 导航栏配置
    navigationBarStyle: 'dark',
    navigationBarBackgroundColor: '#000000',
    // 启动画面
    splashScreenDelay: 0,
    // 硬件加速
    hardwareAccelerated: true,
    // WebView 性能优化
    mixedContentMode: 'always-allow',
    // 键盘优化
    resizeOnFullScreen: true,
    // 安全优化
    allowClearTextTraffic: false,
    // 备份配置
    allowBackup: false,
    // 深度链接
    allowIntentLaunch: true
  },

  // 插件配置
  plugins: {
    // 状态栏插件
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000',
      overlaysWebView: false,
      androidStatusBarBackgroundColor: '#000000',
      iosStatusBarStyle: 'dark'
    },

    // 键盘插件
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },

    // 触觉反馈插件
    Haptics: {
      // 启用触觉反馈
    },

    // 应用生命周期
    App: {
      // 当应用进入后台时保持 WebView 活跃
      pauseOnBackground: false
    },

    // 设备信息
    Device: {
      // 允许获取设备信息用于分析
    },

    // 网络状态
    Network: {
      // 监控网络状态变化
    },

    // 文件系统
    Filesystem: {
      // iOS 配置
      iosDirectories: {
        DOCUMENTS: 'Documents',
        CACHE: 'Library/Caches'
      },
      // Android 配置  
      androidDirectories: {
        DOCUMENTS: 'Documents',
        CACHE: 'cache'
      }
    },

    // 分享功能
    Share: {
      // 配置分享选项
    },

    // 偏好设置存储
    Preferences: {
      // 配置存储组
      group: 'ColorCardPrefs'
    },

    // 相机功能
    Camera: {
      // 相机权限配置
      permissions: ['camera', 'photos']
    }
  },

  // 构建配置
  bundledWebRuntime: false,
  
  // 安全配置
  cordova: {
    preferences: {
      ScrollEnabled: 'false',
      BackupWebStorage: 'none',
      InterceptRemoteRequests: 'all',
      HandleOpenURL: 'true'
    }
  }
};

export default config;

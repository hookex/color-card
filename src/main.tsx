import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './i18n';

import './theme/tailwind.scss';
import './theme/variables.scss';

// 初始化性能监控
import { PerformanceService } from './services/monitoring';

// 生产环境启用性能监控
if (import.meta.env.PROD) {
  PerformanceService.getInstance({
    enableWebVitals: true,
    enableMemoryMonitoring: true,
    enableAnimationMonitoring: true,
    enableInteractionTracking: true,
    sampleRate: 0.1, // 10%采样率
    reportInterval: 60000 // 1分钟报告一次
  });
} else {
  // 开发环境使用较高采样率便于调试
  PerformanceService.getInstance({
    enableWebVitals: true,
    enableMemoryMonitoring: true,
    enableAnimationMonitoring: true,
    enableInteractionTracking: true,
    sampleRate: 1.0,
    reportInterval: 30000
  });
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
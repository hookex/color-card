# ColorCard Project - Claude Context

## 项目概述

ColorCard是一个基于React + Ionic + Capacitor的跨平台颜色管理应用，支持颜色展示、纹理预览、收藏管理等功能。经过完整的React最佳实践重构，采用现代化架构和性能优化。

## 技术栈

- **前端框架**: React 18.2.0
- **UI框架**: Ionic React 8.0.0
- **跨平台**: Capacitor 6.2.0
- **3D渲染**: Babylon.js
- **动画**: React Spring
- **状态管理**: Zustand
- **样式**: SCSS + Tailwind CSS
- **类型**: TypeScript
- **测试**: Vitest + Testing Library
- **构建**: Vite

## 项目结构

```
src/
├── components/           # 通用组件
│   ├── features/        # 功能组件
│   ├── ui/             # UI组件
│   └── ErrorBoundary.tsx
├── containers/          # 容器组件
├── hooks/               # 自定义Hooks
│   ├── business/       # 业务逻辑Hooks
│   ├── ui/            # UI相关Hooks
│   └── utils/         # 工具Hooks
├── pages/              # 页面组件
├── services/           # 服务层
│   ├── animation/     # 动画服务
│   ├── storage/       # 存储服务
│   ├── platform/      # 平台服务
│   └── monitoring/    # 性能监控
├── stores/             # 状态管理
│   └── slices/        # Zustand切片
├── types/              # 类型定义
├── utils/              # 工具函数
└── data/               # 静态数据
```

## 已完成的重构阶段

### Phase 1: 架构重构 ✅
1.1. 创建基础架构目录结构
1.2. 建立服务层 - 动画服务
1.3. 建立服务层 - 存储服务  
1.4. 建立服务层 - 平台服务
1.5. 重构状态管理为切片
1.6. 提取自定义Hooks
1.7. 拆分Home.tsx为容器组件
1.8. 创建功能组件

### Phase 2: 性能优化 ✅
2.1. 实施代码分割
2.2. 性能优化 - memo和callback
2.3. 移除死代码和内联CSS

### Phase 3: 质量保证 ✅
3.1. 添加错误边界
3.2. 建设测试框架
3.3. 添加性能监控
3.4. 完善文档和类型

## 核心服务

### 动画服务 (AnimationService)
- 统一的React Spring动画配置
- 页面转场动画
- 手势动画
- 缓动函数预设

### 存储服务 (StorageService)
- 跨平台存储抽象
- 用户偏好管理
- 缓存机制
- 文件操作

### 平台服务 (PlatformService)
- 设备检测
- 触觉反馈
- 网络状态监控
- 平台特性检测

### 性能监控 (PerformanceService)
- Web Vitals监控
- 内存使用跟踪
- 动画帧率监控
- 用户交互延迟测量

## 状态管理架构

使用Zustand实现模块化状态管理：

- **colorSlice**: 颜色选择、收藏、历史
- **textureSlice**: 纹理管理、预设
- **appSlice**: 应用级状态、偏好设置

## 测试策略

- **单元测试**: 所有服务和Hooks
- **组件测试**: 关键UI组件
- **集成测试**: 容器组件
- **E2E测试**: 核心用户流程

## 开发命令

```bash
# 开发环境
npm run dev

# 构建
npm run build

# 测试
npm run test
npm run test:coverage

# 类型检查
npm run type-check

# 代码格式化
npm run format

# 代码检查
npm run lint
```

## 代码规范

1. **组件**: 使用函数组件 + Hooks
2. **类型**: 严格的TypeScript类型定义
3. **样式**: SCSS模块 + Tailwind工具类
4. **状态**: Zustand切片模式
5. **错误处理**: 错误边界 + 异常捕获
6. **性能**: React.memo + useCallback优化
7. **测试**: 全面的测试覆盖

## 注意事项

- 所有异步操作需要错误处理
- 组件性能优化使用React.memo
- 状态更新使用不可变模式
- 跨平台兼容性考虑
- 无障碍访问支持
- 国际化支持(i18n)

## 性能指标

- FCP < 1.5s
- LCP < 2.5s  
- FID < 100ms
- CLS < 0.1
- 内存使用 < 50MB
- 帧率 > 50fps

## 部署流程

1. 类型检查: `npm run type-check`
2. 代码检查: `npm run lint`
3. 测试: `npm run test`
4. 构建: `npm run build`
5. 平台构建: `npm run build:ios` / `npm run build:android`

## 核心功能

### 色彩系统
- **品牌色**: 包含 Pantone 年度代表色（活珊瑚橘、经典蓝、极致灰等）
- **色彩分类**: 
  - 品牌色 (brand)
  - 中国传统色 (chinese)
  - 自然色 (nature)
  - 食物色 (food)
  - 情绪色 (mood)
  - 太空色 (space)

### 材质系统
- **纯色** (solid) - Div 渲染
- **平滑渐变** (linear) - Div 渲染
- **玉石效果** (paint) - Canvas 渲染
- **毛玻璃** (frosted) - Div 渲染
- **皮革质感** (leather) - Canvas 渲染（已禁用）
- **光芒效果** (glow) - Canvas 渲染（已禁用）

### 双渲染模式
- **Canvas 模式**: 使用 Babylon.js 进行 3D 渲染，支持复杂材质效果
- **Div 模式**: 基于 CSS 的轻量级渲染，性能更好

### 交互功能
- **手势控制**:
  - 单指滑动切换色彩分类
  - 双指触碰/右键点击切换最小化模式
- **触觉反馈**: 使用 Capacitor Haptics API
- **截图保存**: 支持生成 iPhone 壁纸尺寸 (1170x2532)

## 项目结构

### 核心组件
- `App.tsx` - 根组件，路由配置
- `Home.tsx` - 主页面，包含所有核心交互逻辑
- `ColorCard.tsx` - 色卡组件
- `CanvasBackground.tsx` - 3D 背景渲染
- `DivBackground.tsx` - CSS 背景渲染
- `TextureTools.tsx` - 材质选择工具栏
- `DevTools.tsx` - 开发者工具

### 配置文件
- `brandColors.ts` - 品牌色定义
- `colorTypes.ts` - 各类颜色定义
- `textureConfig.ts` - 材质配置
- `tabConfig.ts` - 标签页配置

### 工具类
- `useStore.ts` - Zustand 状态管理
- `screenshot.ts` - 截图功能
- `backgroundUtils.ts` - 背景工具函数
- `storage.ts` - 本地存储

## 特色功能

### 智能色彩计算
- 自动计算对比色用于文本显示
- 基于亮度计算玻璃效果透明度
- RGB/CMYK 色值显示

### 中英双语支持
- 完整的 i18n 国际化
- 中文色彩名称配有拼音标注
- 色彩描述富有诗意

### 开发者工具
- 实时调试模式
- 元素检查器
- 模式切换
- 新手引导重置

### 跨平台原生功能
- iOS/Android 文件系统访问
- 相机和相册集成
- 分享功能
- 状态栏样式控制

## 构建配置
- **开发**: `npm run dev` - Vite 开发服务器
- **构建**: `npm run build` - TypeScript + Vite 构建
- **iOS**: `npm run ios` - 同步并打开 Xcode
- **测试**: E2E (Cypress) + 单元测试 (Vitest)

## 已修复的问题

### Bug 1: TextureType 类型定义不一致 ✅
- **问题**: `src/types/index.ts` 中的 `TextureType` 定义与实际使用的纹理类型不匹配
- **修复**: 更新类型定义为实际使用的纹理类型：`'solid' | 'leather' | 'paint' | 'glass' | 'linear' | 'glow' | 'frosted'`

### Bug 2: 纹理配置重复和不匹配 ✅
- **问题**: `textureConfig.ts` 中存在重复的 glow 配置项
- **修复**: 移除重复配置，整理纹理配置数组，确保每种纹理类型只有一个配置

### Bug 3: 颜色过滤逻辑错误 ✅
- **问题**: `getColorCards()` 函数已经返回正确的颜色分类，但过滤逻辑还在做额外的不必要过滤
- **修复**: 简化过滤逻辑，只检查必需属性是否存在，让 `getColorCards()` 函数直接返回对应分类的颜色

### Bug 4: 手势控制缺少防抖机制 ✅
- **问题**: 快速滑动可能触发多次颜色类型切换，导致用户体验不佳
- **修复**: 添加 `isGestureProcessing` 状态标志，在手势处理期间阻止重复触发，500ms 后重置

### Bug 5: 截图功能选择器错误 ✅
- **问题**: 截图功能中使用 `.background` 选择器，但实际 DOM 中不存在该元素
- **修复**: 更改为使用 `.home-page` 选择器，截取整个页面内容，更符合壁纸生成的需求

### Bug 6: 顶部 Tab 切换动画不自然 ✅
- **问题**: 原始CSS动画切换顺序不合理，内容和动画时序不匹配，用户体验不佳
- **修复**: 
  - 使用 React Spring 替代 CSS 动画，实现更自然的弹簧动画效果
  - 重新设计切换逻辑：先滑出旧内容，在中间更新数据，再滑入新内容
  - 采用自定义弹簧配置，完全消除动画尾部抖动
  - 添加防重复触发机制，确保动画完成前不会响应新的切换请求

### Bug 7: React Spring 动画尾部抖动 ✅
- **问题**: 使用预设配置时动画结束会有轻微的弹跳抖动，影响视觉体验
- **修复**:
  - 使用自定义弹簧物理参数：`tension: 280, friction: 60, mass: 1`
  - 添加 `clamp: true` 参数完全防止过度振荡
  - 针对滑出和滑入动画分别优化配置参数
  - 确保动画平滑结束，无任何抖动或反弹效果

## 技术亮点
1. **双渲染引擎**: 根据材质特性智能选择 Canvas 或 Div 渲染
2. **状态持久化**: 使用 Zustand 持久化中间件保存用户设置
3. **性能优化**: Canvas 渲染优化、手势防抖、按需加载
4. **用户体验**: 丰富的触觉反馈、流畅的动画过渡
5. **字体支持**: 集成中文字体，支持传统色彩名称显示

## 开发注意事项
- 类型定义文件位于 `src/types/index.ts`，修改时需确保与实际使用保持一致
- 纹理配置在 `src/config/textureConfig.ts`，添加新纹理时需要同步更新类型定义
- 手势控制有防抖机制，修改时注意保持用户体验流畅
- 截图功能使用页面级选择器，确保能正确捕获所有背景内容
- 构建和代码质量检查：`npm run build` 和 `npm run lint`

这是一个设计精美、功能完整的颜色壁纸生成应用，结合了现代 Web 技术和原生移动应用能力，为用户提供了丰富的色彩体验和个性化壁纸定制功能。
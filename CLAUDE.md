# ColorCard 项目记忆文件

## 项目概述
ColorCard 是一个跨平台的移动应用，主要用于生成彩色壁纸。基于 Ionic React 和 Capacitor 构建，支持 iOS、Android 和 Web 平台。

## 技术栈
- **前端框架**: React 18.2.0 + Ionic React 8.0.0
- **跨平台**: Capacitor 6.2.0
- **3D渲染**: Babylon.js 7.41.1
- **状态管理**: Zustand 5.0.2
- **样式**: SCSS + Tailwind CSS
- **国际化**: i18next
- **构建工具**: Vite 5.2.0
- **测试**: Vitest + Cypress

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
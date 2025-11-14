# 文小豆英语学习应用

专为高二学生设计的英语单词学习应用，基于科学记忆原理，帮助学生高效掌握英语词汇。

## 🎯 项目特色

### 🧠 科学记忆算法
- **艾宾浩斯遗忘曲线**: 基于记忆规律的智能复习安排
- **间隔重复学习**: 根据掌握程度动态调整复习间隔
- **记忆强度评估**: 实时计算和追踪单词记忆强度

### 📚 高二水平词汇
- **核心词汇库**: 覆盖高考大纲要求的高二核心词汇
- **分级难度**: 1-5级难度分级，适合不同水平学生
- **详细信息**: 包含音标、释义、例句、词频等

### 🎮 多样化学习模式
- **拼写模式**: 根据释义拼写单词
- **选择模式**: 多选题形式测试理解
- **听力模式**: 听音辨词训练
- **释义模式**: 根据单词写出释义

### 📊 学习统计与分析
- **进度追踪**: 实时显示学习进度和掌握程度
- **数据可视化**: 图表展示学习效率和趋势
- **学习建议**: 基于数据提供个性化学习建议

### 🏆 激励系统
- **成就系统**: 多种成就徽章激励持续学习
- **学习统计**: 详细的学习数据记录和分析
- **游戏模式**: 通过游戏化元素增加学习趣味性

## 🛠️ 技术架构

### 前端技术栈
- **React Native**: 跨平台移动应用开发框架
- **Redux Toolkit**: 状态管理
- **React Navigation**: 应用导航
- **React Native Elements**: UI组件库
- **Victory Native**: 数据可视化图表库

### 数据存储
- **SQLite**: 本地数据库存储单词和学习记录
- **AsyncStorage**: 用户设置和配置存储

### 核心算法
- **遗忘曲线算法**: 实现科学复习间隔计算
- **记忆强度模型**: 动态评估单词掌握程度
- **学习效率分析**: 多维度学习效果评估

## 📱 功能模块

### 1. 主页 (HomeScreen)
- 学习进度概览
- 今日任务和统计
- 快速学习入口
- 学习数据可视化

### 2. 学习模块 (LearningScreen)
- 多种学习模式
- 实时发音播放
- 智能答题反馈
- 学习进度追踪

### 3. 复习系统
- 基于遗忘曲线的智能复习
- 错题收集和重点复习
- 复习效果评估

### 4. 测试模块 (TestScreen)
- 词汇能力测试
- 多种题型支持
- 成绩分析报告
- 薄弱环节识别

### 5. 游戏模块 (GameScreen)
- 单词配对游戏
- 拼写大赛
- 单词冲刺
- 记忆卡片

### 6. 统计分析 (StatisticsScreen)
- 学习进度统计
- 效率分析图表
- 学习趋势预测
- 个性化建议

### 7. 词汇表 (WordListScreen)
- 完整词汇浏览
- 分类筛选功能
- 搜索功能
- 词汇详情查看

### 8. 设置系统 (SettingsScreen)
- 学习目标设置
- 提醒时间配置
- 发音类型选择
- 学习模式调整

### 9. 成就系统 (AchievementsScreen)
- 成就徽章收集
- 学习里程碑
- 积分排行榜
- 激励奖励

## 🚀 快速开始

### 环境要求
- Node.js 14+
- React Native CLI
- Android Studio (Android开发)
- Xcode (iOS开发，仅macOS)

### 安装依赖
```bash
# 克隆项目
git clone https://github.com/your-username/XiaoDouEnglishApp.git
cd XiaoDouEnglishApp

# 安装依赖
npm install

# iOS依赖 (仅macOS)
cd ios && pod install && cd ..
```

### 运行应用
```bash
# 启动Metro服务器
npm start

# 运行Android版本
npm run android

# 运行iOS版本 (仅macOS)
npm run ios
```

## 📦 构建APK

### 自动构建
```bash
# 使用构建脚本
node scripts/build-android.js
```

### 手动构建
```bash
# 进入Android目录
cd android

# 清理构建
./gradlew clean

# 构建release版本
./gradlew assembleRelease
```

构建完成后，APK文件位于 `android/app/build/outputs/apk/release/` 目录。

## 📊 项目结构

```
XiaoDouEnglishApp/
├── src/
│   ├── components/          # 通用组件
│   │   └── LearningModes.js # 学习模式组件
│   ├── screens/             # 页面组件
│   │   ├── HomeScreen.js
│   │   ├── LearningScreen.js
│   │   ├── StatisticsScreen.js
│   │   ├── TestScreen.js
│   │   ├── GameScreen.js
│   │   ├── WordListScreen.js
│   │   ├── SettingsScreen.js
│   │   └── AchievementsScreen.js
│   ├── navigation/          # 导航配置
│   │   └── AppNavigator.js
│   ├── database/            # 数据库相关
│   │   └── DatabaseManager.js
│   ├── algorithms/          # 记忆算法
│   │   └── MemoryAlgorithm.js
│   ├── store/               # Redux状态管理
│   │   ├── store.js
│   │   ├── wordsSlice.js
│   │   ├── learningSlice.js
│   │   ├── userSlice.js
│   │   └── statisticsSlice.js
│   ├── utils/               # 工具函数
│   ├── styles/              # 样式文件
│   └── assets/              # 静态资源
├── android/                 # Android项目文件
├── ios/                     # iOS项目文件
├── scripts/                 # 构建脚本
│   └── build-android.js
└── docs/                    # 项目文档
```

## 🎯 核心功能说明

### 艾宾浩斯遗忘曲线算法
应用基于艾宾浩斯遗忘曲线理论，实现了智能的复习间隔计算：

```javascript
// 基础复习间隔（天）
const baseIntervals = [1, 2, 4, 7, 15, 30, 60, 120];

// 计算下次复习时间
function calculateNextReview(reviewCount, memoryStrength) {
    const baseInterval = baseIntervals[Math.min(reviewCount, 8)];
    const strengthMultiplier = 1 + (memoryStrength / 100);
    return Math.floor(baseInterval * strengthMultiplier);
}
```

### 记忆强度评估
系统会根据用户的答题正确率、响应时间等因素，动态评估每个单词的记忆强度：

- **准确率因素**: 答题正确率影响记忆强度
- **时间因素**: 响应时间反映记忆程度
- **频率因素**: 复习频率巩固记忆效果

### 多模式学习
支持多种学习模式，满足不同学习需求：

1. **新词学习模式**: 每日推荐新单词
2. **复习模式**: 基于遗忘曲线的智能复习
3. **测试模式**: 多种题型测试学习效果
4. **游戏模式**: 趣味化学习体验

## 📈 学习数据分析

### 效率指标
- **单词掌握率**: 已掌握单词占总词汇的比例
- **学习效率**: 每小时学习的单词数量
- **记忆保持率**: 长期记忆的效果评估
- **学习连续性**: 连续学习天数统计

### 预测功能
基于当前学习数据，预测未来学习进度：

```javascript
function predictLearningProgress(currentStats, days = 30) {
    const dailyWords = Math.max(5, efficiency.wordsPerHour * 0.5);
    const predictedLearned = currentStats.learnedWords + (dailyWords * days);
    return {
        days,
        predictedLearnedWords: predictedLearned,
        dailyAverage: dailyWords
    };
}
```

## 🤝 贡献指南

欢迎提交问题和改进建议！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- React Native 团队提供的优秀框架
- 所有参与测试和反馈的用户
- 教育心理学研究提供理论基础

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 项目主页: https://github.com/your-username/XiaoDouEnglishApp
- 问题反馈: https://github.com/your-username/XiaoDouEnglishApp/issues
- 邮箱: your-email@example.com

---

**文小豆英语学习** - 让英语学习更科学、更高效！
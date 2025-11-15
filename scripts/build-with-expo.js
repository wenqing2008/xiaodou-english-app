#!/usr/bin/env node

/**
 * 文小豆英语学习 - Expo构建脚本
 * 使用Expo在线构建服务生成APK
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始使用Expo构建文小豆英语学习APK...\n');

function executeCommand(command, description) {
  console.log(`📝 ${description}...`);
  try {
    const result = execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`✅ ${description} 完成`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} 失败:`, error.message);
    return false;
  }
}

function createAssets() {
  console.log('\n🎨 创建应用资源文件...');

  const assetsDir = path.join(process.cwd(), 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // 创建简单的占位符文件说明
  const files = [
    { name: 'icon.png', desc: '应用图标' },
    { name: 'adaptive-icon.png', desc: '自适应图标' },
    { name: 'splash.png', desc: '启动画面' },
    { name: 'favicon.png', desc: '网站图标' }
  ];

  files.forEach(file => {
    const filePath = path.join(assetsDir, file.name);
    if (!fs.existsSync(filePath)) {
      // 创建文本占位符
      fs.writeFileSync(filePath, `#${file.desc}\n# 这是一个占位符文件\n# 在实际构建中需要替换为真实的图片文件`);
      console.log(`📄 创建占位符文件: ${file.name}`);
    }
  });
}

function checkAndInstallDependencies() {
  console.log('\n📦 检查并安装依赖...');

  const requiredDeps = [
    'expo',
    '@expo/vector-icons',
    'expo-sqlite',
    'expo-av'
  ];

  for (const dep of requiredDeps) {
    try {
      require.resolve(dep);
      console.log(`✅ ${dep} 已安装`);
    } catch (error) {
      console.log(`📥 安装 ${dep}...`);
      executeCommand(`npm install ${dep}`, `安装 ${dep}`);
    }
  }
}

function prepareForExpoBuild() {
  console.log('\n🔧 准备Expo构建配置...');

  // 更新package.json
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // 确保有必要的脚本
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    packageJson.scripts['start'] = 'expo start';
    packageJson.scripts['android'] = 'expo start --android';
    packageJson.scripts['ios'] = 'expo start --ios';
    packageJson.scripts['web'] = 'expo start --web';

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ 更新package.json脚本');
  }

  // 创建metro.config.js（如果不存在）
  const metroConfigPath = path.join(process.cwd(), 'metro.config.js');
  if (!fs.existsSync(metroConfigPath)) {
    const metroConfig = `const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;`;
    fs.writeFileSync(metroConfigPath, metroConfig);
    console.log('✅ 创建metro.config.js');
  }
}

function provideBuildInstructions() {
  console.log('\n📋 构建说明：');
  console.log('');
  console.log('由于需要Expo账户登录，请按照以下步骤手动构建：');
  console.log('');
  console.log('🌐 方法1: 使用Expo在线构建服务');
  console.log('1. 访问 https://expo.dev 并注册账户');
  console.log('2. 登录后运行: npx eas-cli@latest login');
  console.log('3. 运行: npx eas-cli@latest build --platform android');
  console.log('4. 等待构建完成并下载APK');
  console.log('');
  console.log('🌐 方法2: 使用GitHub Actions');
  console.log('1. 将项目推送到GitHub仓库');
  console.log('2. 在GitHub Actions中运行构建工作流');
  console.log('3. 从构建产物中下载APK');
  console.log('');
  console.log('🌐 方法3: 使用免费在线构建服务');
  console.log('1. 访问 https://appcenter.ms');
  console.log('2. 导入项目并配置构建');
  console.log('3. 生成Android APK');
  console.log('');
  console.log('📱 项目特色：');
  console.log('- 基于艾宾浩斯遗忘曲线的科学记忆算法');
  console.log('- 100+高二核心英语词汇');
  console.log('- 多种学习模式（拼写、选择、听力、释义）');
  console.log('- 详细的学习统计和数据分析');
  console.log('- 成就系统和游戏化学习');
  console.log('- 完全离线使用，无需网络连接');
}

function main() {
  try {
    console.log('🎯 文小豆英语学习 - APK构建工具\n');

    // 创建占位符资源文件
    createAssets();

    // 检查依赖
    checkAndInstallDependencies();

    // 准备构建配置
    prepareForExpoBuild();

    // 提供构建说明
    provideBuildInstructions();

    console.log('\n✅ 项目准备完成！');
    console.log('📁 项目位置:', process.cwd());
    console.log('🚀 现在可以按照上述说明进行APK构建');

  } catch (error) {
    console.error('\n💥 构建准备过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 运行主程序
main();
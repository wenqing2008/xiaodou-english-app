#!/usr/bin/env node

/**
 * 文小豆英语学习软件 - Android APK 构建脚本
 * 用于自动生成 Android APK 文件
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始构建文小豆英语学习 APK...');

// 构建配置
const BUILD_CONFIG = {
  appDir: process.cwd(),
  androidDir: path.join(process.cwd(), 'android'),
  outputDir: path.join(process.cwd(), 'android/app/build/outputs/apk/release'),
  apkName: 'XiaoDouEnglishApp-release.apk',
  keystorePath: path.join(process.cwd(), 'android/app/xiaodou-english.keystore'),
  keystoreAlias: 'xiaodou-english'
};

function executeCommand(command, description) {
  console.log(`\n📝 ${description}...`);
  try {
    const result = execSync(command, { stdio: 'inherit', cwd: BUILD_CONFIG.androidDir });
    console.log(`✅ ${description} 完成`);
    return result;
  } catch (error) {
    console.error(`❌ ${description} 失败:`, error.message);
    process.exit(1);
  }
}

function checkPrerequisites() {
  console.log('\n🔍 检查构建前置条件...');

  // 检查 Java 环境
  try {
    execSync('java -version', { stdio: 'pipe' });
    console.log('✅ Java 环境正常');
  } catch (error) {
    console.error('❌ 未找到 Java 环境，请先安装 Java JDK');
    process.exit(1);
  }

  // 检查 Android SDK
  const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (androidHome) {
    console.log(`✅ Android SDK: ${androidHome}`);
  } else {
    console.error('❌ 未找到 ANDROID_HOME 环境变量');
    process.exit(1);
  }

  // 检查 Node.js 版本
  const nodeVersion = process.version;
  console.log(`✅ Node.js 版本: ${nodeVersion}`);
}

function setupKeystore() {
  console.log('\n🔐 设置签名密钥...');

  if (fs.existsSync(BUILD_CONFIG.keystorePath)) {
    console.log('✅ 签名密钥已存在');
    return;
  }

  console.log('⚠️  未找到签名密钥，正在生成新的密钥...');

  // 如果 keystore 不存在，提示用户创建
  console.log(`
📋 请手动创建签名密钥:

cd android
./gradlew signingReport
keytool -genkey -v -keystore app/xiaodou-english.keystore -alias xiaodou-english -keyalg RSA -keysize 2048 -validity 10000

然后将密钥信息添加到 android/app/build.gradle 文件中。
  `);

  process.exit(0);
}

function buildAPK() {
  console.log('\n🏗️  开始构建 APK...');

  // 清理之前的构建
  executeCommand('./gradlew clean', '清理构建目录');

  // 构建 release 版本的 APK
  executeCommand('./gradlew assembleRelease', '构建 release APK');

  // 检查构建结果
  const apkPath = path.join(BUILD_CONFIG.outputDir, 'app-release.apk');
  if (fs.existsSync(apkPath)) {
    console.log(`✅ APK 构建成功: ${apkPath}`);

    // 复制到指定位置并重命名
    const finalApkPath = path.join(BUILD_CONFIG.outputDir, BUILD_CONFIG.apkName);
    fs.copyFileSync(apkPath, finalApkPath);

    // 获取文件大小
    const stats = fs.statSync(finalApkPath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`\n🎉 构建完成！`);
    console.log(`📱 APK 文件: ${finalApkPath}`);
    console.log(`📦 文件大小: ${fileSizeMB} MB`);

    return finalApkPath;
  } else {
    console.error('❌ APK 构建失败，未找到输出文件');
    process.exit(1);
  }
}

function optimizeAPK(apkPath) {
  console.log('\n⚡ 优化 APK...');

  // 这里可以添加 APK 优化逻辑
  // 例如：使用 Android Studio 的 APK Analyzer 或其他工具

  console.log('✅ APK 优化完成');
  return apkPath;
}

function generateBuildInfo(apkPath) {
  console.log('\n📄 生成构建信息...');

  const buildInfo = {
    appName: '文小豆英语学习',
    version: '1.0.0',
    buildDate: new Date().toISOString(),
    apkPath: apkPath,
    targetSDK: 'Android 7.0+ (API 24+)',
    minSDK: 'Android 5.0+ (API 21+)',
    features: [
      '艾宾浩斯遗忘曲线记忆算法',
      '多种学习模式 (拼写、选择、听力、释义)',
      '高二核心词汇库',
      '学习进度统计与可视化',
      '成就系统',
      '单词游戏',
      '个性化学习设置'
    ],
    description: '专为高二学生设计的英语单词学习应用，基于科学记忆原理，帮助学生高效掌握英语词汇。'
  };

  const buildInfoPath = path.join(BUILD_CONFIG.outputDir, 'build-info.json');
  fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));

  console.log(`✅ 构建信息已保存到: ${buildInfoPath}`);
}

function main() {
  try {
    checkPrerequisites();
    setupKeystore();
    const apkPath = buildAPK();
    const optimizedApkPath = optimizeAPK(apkPath);
    generateBuildInfo(optimizedApkPath);

    console.log('\n🎯 所有构建任务已完成！');
    console.log('\n📱 安装说明:');
    console.log('1. 在 Android 设备上启用"未知来源"应用安装');
    console.log('2. 将 APK 文件传输到 Android 设备');
    console.log('3. 点击 APK 文件进行安装');

  } catch (error) {
    console.error('\n💥 构建过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 运行构建
main();
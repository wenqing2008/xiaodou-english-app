/**
 * 文小豆英语单词学习软件
 * 专为高二学生设计的英语单词学习应用，基于科学记忆原理
 */

import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import DatabaseManager from './src/database/DatabaseManager';
import { loadUserSettings } from './src/store/userSlice';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    // 初始化应用
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('正在初始化文小豆英语学习应用...');

      // 初始化数据库
      await DatabaseManager.initDatabase();
      console.log('数据库初始化完成');

      // 加载用户设置
      await store.dispatch(loadUserSettings()).unwrap();
      console.log('用户设置加载完成');

      console.log('应用初始化完成！');
    } catch (error) {
      console.error('应用初始化失败:', error);
    }
  };

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor="#f5f5f5"
        />
        <AppNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;

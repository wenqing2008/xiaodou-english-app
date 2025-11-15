import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';

// 导入屏幕组件
import HomeScreen from '../screens/HomeScreen';
import LearningScreen from '../screens/LearningScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import WordListScreen from '../screens/WordListScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TestScreen from '../screens/TestScreen';
import GameScreen from '../screens/GameScreen';
import AchievementsScreen from '../screens/AchievementsScreen';

// 创建导航器
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 主底部标签导航
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Learning':
              iconName = 'book';
              break;
            case 'Statistics':
              iconName = 'bar-chart';
              break;
            case 'WordList':
              iconName = 'list';
              break;
            case 'Settings':
              iconName = 'cog';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#95a5a6',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#ecf0f1',
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
        headerStyle: {
          backgroundColor: '#3498db',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: '首页',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Learning"
        component={LearningScreen}
        options={{
          title: '学习',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          title: '统计',
        }}
      />
      <Tab.Screen
        name="WordList"
        component={WordListScreen}
        options={{
          title: '词汇表',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: '设置',
        }}
      />
    </Tab.Navigator>
  );
};

// 主应用导航器
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#3498db',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainTabNavigator}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Learning"
          component={LearningScreen}
          options={{
            title: '学习单词',
            headerStyle: {
              backgroundColor: '#2ecc71',
            },
          }}
        />
        <Stack.Screen
          name="Test"
          component={TestScreen}
          options={{
            title: '词汇测试',
            headerStyle: {
              backgroundColor: '#9b59b6',
            },
          }}
        />
        <Stack.Screen
          name="Game"
          component={GameScreen}
          options={{
            title: '单词游戏',
            headerStyle: {
              backgroundColor: '#e74c3c',
            },
          }}
        />
        <Stack.Screen
          name="Achievements"
          component={AchievementsScreen}
          options={{
            title: '成就系统',
            headerStyle: {
              backgroundColor: '#f39c12',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
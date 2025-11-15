import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { Card, Button, Icon, Badge } from 'react-native-elements';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStatistics } from '../store/statisticsSlice';
import { fetchWordsForReview, fetchNewWords } from '../store/wordsSlice';
import { selectBasicStatistics, selectDueForReview } from '../store/statisticsSlice';

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const statistics = useSelector(selectBasicStatistics);
  const { dueForReview } = useSelector((state) => state.statistics);
  const userSettings = useSelector((state) => state.user.settings);
  const userProfile = useSelector((state) => state.user.profile);
  const loading = useSelector((state) => state.statistics.loading);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setRefreshing(true);
      await dispatch(fetchStatistics()).unwrap();
      // 可以在这里加载其他必要的数据
    } catch (error) {
      console.error('加载数据失败:', error);
      Alert.alert('错误', '加载统计数据失败，请重试');
    } finally {
      setRefreshing(false);
    }
  };

  const handleStartLearning = async (mode) => {
    try {
      if (mode === 'new') {
        const result = await dispatch(fetchNewWords(userSettings.dailyGoal)).unwrap();
        if (result && result.length > 0) {
          navigation.navigate('Learning', { mode: 'new', words: result });
        } else {
          Alert.alert('提示', '暂无新单词可学习');
        }
      } else if (mode === 'review') {
        const result = await dispatch(fetchWordsForReview()).unwrap();
        if (result && result.length > 0) {
          navigation.navigate('Learning', { mode: 'review', words: result });
        } else {
          Alert.alert('恭喜', '今天没有需要复习的单词！');
        }
      }
    } catch (error) {
      console.error('开始学习失败:', error);
      Alert.alert('错误', '加载单词失败，请重试');
    }
  };

  const getProgressPercentage = () => {
    if (statistics.totalWords === 0) return 0;
    return Math.round((statistics.learnedWords / statistics.totalWords) * 100);
  };

  const getGreetingMessage = () => {
    const hour = new Date().getHours();
    let greeting = '';

    if (hour < 6) greeting = '夜深了，早点休息吧';
    else if (hour < 9) greeting = '早上好';
    else if (hour < 12) greeting = '上午好';
    else if (hour < 14) greeting = '中午好';
    else if (hour < 17) greeting = '下午好';
    else if (hour < 19) greeting = '傍晚好';
    else if (hour < 22) greeting = '晚上好';
    else greeting = '夜深了';

    return `${greeting}，${userProfile.name}！`;
  };

  const getMotivationMessage = () => {
    const progress = getProgressPercentage();

    if (progress === 0) return '开始你的英语学习之旅吧！';
    if (progress < 25) return '良好的开端是成功的一半！';
    if (progress < 50) return '正在稳步前进，继续保持！';
    if (progress < 75) return '已经很棒了，加油冲刺！';
    if (progress < 100) return '即将完成目标，最后冲刺！';
    return '恭喜完成学习目标！';
  };

  const MainStatCard = ({ icon, title, value, color, subtitle }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Icon
        name={icon}
        type="font-awesome"
        color={color}
        size={24}
        containerStyle={styles.statIcon}
      />
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const ActionButton = ({ title, icon, color, onPress, disabled = false, badge = null }) => (
    <TouchableOpacity
      style={[
        styles.actionButton,
        { backgroundColor: disabled ? '#ccc' : color }
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Icon
        name={icon}
        type="font-awesome"
        color="white"
        size={20}
        containerStyle={styles.actionIcon}
      />
      <Text style={styles.actionTitle}>{title}</Text>
      {badge !== null && badge > 0 && (
        <Badge
          value={badge}
          status="error"
          containerStyle={styles.actionBadge}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 顶部欢迎区域 */}
        <View style={styles.headerSection}>
          <Text style={styles.greeting}>{getGreetingMessage()}</Text>
          <Text style={styles.motivation}>{getMotivationMessage()}</Text>
        </View>

        {/* 学习进度概览 */}
        <Card containerStyle={styles.progressCard}>
          <Card.Title style={styles.cardTitle}>学习进度</Card.Title>
          <Card.Divider />

          <View style={styles.progressOverview}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressPercentage}>{getProgressPercentage()}%</Text>
              <Text style={styles.progressLabel}>完成度</Text>
            </View>

            <View style={styles.progressStats}>
              <View style={styles.progressItem}>
                <Text style={styles.progressNumber}>{statistics.learnedWords}</Text>
                <Text style={styles.progressDesc}>已学习</Text>
              </View>
              <View style={styles.progressItem}>
                <Text style={styles.progressNumber}>{statistics.masteredWords}</Text>
                <Text style={styles.progressDesc}>已掌握</Text>
              </View>
              <View style={styles.progressItem}>
                <Text style={styles.progressNumber}>{statistics.totalWords - statistics.learnedWords}</Text>
                <Text style={styles.progressDesc}>待学习</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* 今日学习统计 */}
        <Card containerStyle={styles.statsCard}>
          <Card.Title style={styles.cardTitle}>今日统计</Card.Title>
          <Card.Divider />

          <View style={styles.statsGrid}>
            <MainStatCard
              icon="clock-o"
              title="待复习"
              value={dueForReview}
              color="#ff6b6b"
              subtitle="单词"
            />
            <MainStatCard
              icon="calendar-check-o"
              title="每日目标"
              value={userSettings.dailyGoal}
              color="#4ecdc4"
              subtitle="单词"
            />
            <MainStatCard
              icon="fire"
              title="连续天数"
              value={userProfile.studyDays}
              color="#ffd93d"
              subtitle="天"
            />
          </View>
        </Card>

        {/* 学习操作区 */}
        <Card containerStyle={styles.actionsCard}>
          <Card.Title style={styles.cardTitle}>开始学习</Card.Title>
          <Card.Divider />

          <View style={styles.actionsGrid}>
            <ActionButton
              title="学习新单词"
              icon="plus-circle"
              color="#2ecc71"
              onPress={() => handleStartLearning('new')}
            />
            <ActionButton
              title="复习单词"
              icon="refresh"
              color="#3498db"
              onPress={() => handleStartLearning('review')}
              badge={dueForReview > 99 ? '99+' : dueForReview}
            />
            <ActionButton
              title="词汇测试"
              icon="question-circle"
              color="#9b59b6"
              onPress={() => navigation.navigate('Test')}
            />
            <ActionButton
              title="单词游戏"
              icon="gamepad"
              color="#e74c3c"
              onPress={() => navigation.navigate('Game')}
            />
          </View>
        </Card>

        {/* 快速访问 */}
        <View style={styles.quickAccess}>
          <Text style={styles.sectionTitle}>快速访问</Text>
          <View style={styles.quickAccessGrid}>
            <TouchableOpacity
              style={styles.quickAccessItem}
              onPress={() => navigation.navigate('Statistics')}
            >
              <Icon name="bar-chart" type="font-awesome" color="#3498db" size={20} />
              <Text style={styles.quickAccessText}>学习统计</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAccessItem}
              onPress={() => navigation.navigate('WordList')}
            >
              <Icon name="list" type="font-awesome" color="#2ecc71" size={20} />
              <Text style={styles.quickAccessText}>词汇表</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAccessItem}
              onPress={() => navigation.navigate('Settings')}
            >
              <Icon name="cog" type="font-awesome" color="#95a5a6" size={20} />
              <Text style={styles.quickAccessText}>设置</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAccessItem}
              onPress={() => navigation.navigate('Achievements')}
            >
              <Icon name="trophy" type="font-awesome" color="#f39c12" size={20} />
              <Text style={styles.quickAccessText}>成就</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 底部间距 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 15,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  motivation: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  progressCard: {
    borderRadius: 15,
    elevation: 3,
    marginBottom: 15,
  },
  statsCard: {
    borderRadius: 15,
    elevation: 3,
    marginBottom: 15,
  },
  actionsCard: {
    borderRadius: 15,
    elevation: 3,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  progressOverview: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#3498db',
  },
  progressPercentage: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  progressLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  progressDesc: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 2,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    height: 80,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    position: 'relative',
  },
  actionIcon: {
    marginBottom: 8,
  },
  actionTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  quickAccess: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAccessItem: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    width: '22%',
  },
  quickAccessText: {
    fontSize: 12,
    color: '#2c3e50',
    marginTop: 8,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default HomeScreen;
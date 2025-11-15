import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Card, Button, Icon } from 'react-native-elements';
import { useDispatch, useSelector } from 'react-redux';
import {
  VictoryChart,
  VictoryLine,
  VictoryBar,
  VictoryAxis,
  VictoryTheme,
  VictoryPie,
  VictoryLabel
} from 'victory-native';
import {
  fetchStatistics,
  fetchStudySessions,
  selectBasicStatistics,
  selectEfficiencyMetrics,
  selectStudySessions,
  selectSuggestions,
  selectPredictions,
  selectDailyStudyData,
  selectLearningProgress
} from '../store/statisticsSlice';

const { width: screenWidth } = Dimensions.get('window');

const StatisticsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const basicStats = useSelector(selectBasicStatistics);
  const efficiency = useSelector(selectEfficiencyMetrics);
  const studySessions = useSelector(selectStudySessions);
  const suggestions = useSelector(selectSuggestions);
  const predictions = useSelector(selectPredictions);
  const dailyData = useSelector(selectDailyStudyData);
  const learningProgress = useSelector(selectLearningProgress);
  const loading = useSelector((state) => state.statistics.loading);

  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    loadStatisticsData();
  }, []);

  const loadStatisticsData = async () => {
    try {
      await dispatch(fetchStatistics()).unwrap();
      await dispatch(fetchStudySessions({ days: 30 })).unwrap();
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* 学习进度卡片 */}
      <Card containerStyle={styles.progressCard}>
        <Card.Title style={styles.cardTitle}>学习进度</Card.Title>
        <Card.Divider />

        <View style={styles.progressOverview}>
          <View style={styles.circularProgress}>
            <Text style={styles.progressPercentage}>
              {learningProgress.totalPercentage}%
            </Text>
            <Text style={styles.progressLabel}>总体掌握度</Text>
          </View>

          <View style={styles.progressStats}>
            <View style={styles.progressItem}>
              <Text style={styles.progressNumber}>
                {learningProgress.learnedPercentage}%
              </Text>
              <Text style={styles.progressDesc}>学习进度</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressNumber}>
                {learningProgress.masteredPercentage}%
              </Text>
              <Text style={styles.progressDesc}>掌握程度</Text>
            </View>
          </View>
        </View>

        <View style={styles.progressDetails}>
          <View style={styles.progressDetailItem}>
            <Icon name="book" type="font-awesome" color="#3498db" size={16} />
            <Text style={styles.progressDetailText}>
              已学习: {basicStats.learnedWords} 个单词
            </Text>
          </View>
          <View style={styles.progressDetailItem}>
            <Icon name="trophy" type="font-awesome" color="#f39c12" size={16} />
            <Text style={styles.progressDetailText}>
              已掌握: {basicStats.masteredWords} 个单词
            </Text>
          </View>
          <View style={styles.progressDetailItem}>
            <Icon name="clock-o" type="font-awesome" color="#e74c3c" size={16} />
            <Text style={styles.progressDetailText}>
              待复习: {basicStats.dueForReview} 个单词
            </Text>
          </View>
        </View>
      </Card>

      {/* 学习效率 */}
      <Card containerStyle={styles.efficiencyCard}>
        <Card.Title style={styles.cardTitle}>学习效率</Card.Title>
        <Card.Divider />

        <View style={styles.efficiencyGrid}>
          <View style={styles.efficiencyItem}>
            <Text style={styles.efficiencyValue}>{efficiency.wordsPerHour}</Text>
            <Text style={styles.efficiencyLabel}>单词/小时</Text>
          </View>
          <View style={styles.efficiencyItem}>
            <Text style={styles.efficiencyValue}>{efficiency.accuracy}%</Text>
            <Text style={styles.efficiencyLabel}>正确率</Text>
          </View>
          <View style={styles.efficiencyItem}>
            <Text style={styles.efficiencyValue}>{efficiency.retention}%</Text>
            <Text style={styles.efficiencyLabel}>保持率</Text>
          </View>
          <View style={styles.efficiencyItem}>
            <Text style={styles.efficiencyValue}>{efficiency.efficiency}</Text>
            <Text style={styles.efficiencyLabel}>综合效率</Text>
          </View>
        </View>
      </Card>

      {/* 学习建议 */}
      {suggestions.length > 0 && (
        <Card containerStyle={styles.suggestionsCard}>
          <Card.Title style={styles.cardTitle}>学习建议</Card.Title>
          <Card.Divider />

          {suggestions.map((suggestion, index) => (
            <View key={index} style={styles.suggestionItem}>
              <Icon
                name={suggestion.priority === 'high' ? 'exclamation-triangle' : 'info-circle'}
                type="font-awesome"
                color={suggestion.priority === 'high' ? '#e74c3c' : '#3498db'}
                size={16}
              />
              <View style={styles.suggestionContent}>
                <Text style={styles.suggestionMessage}>{suggestion.message}</Text>
                <Text style={styles.suggestionAction}>{suggestion.action}</Text>
              </View>
            </View>
          ))}
        </Card>
      )}
    </View>
  );

  const renderChartsTab = () => {
    // 准备图表数据
    const chartData = dailyData.slice(-7).map((day, index) => ({
      x: `Day ${index + 1}`,
      y: day.wordsStudied,
      date: day.date
    }));

    const pieData = [
      { x: '已掌握', y: basicStats.masteredWords, color: '#2ecc71' },
      { x: '学习中', y: learningProgress.inProgressWords, color: '#f39c12' },
      { x: '未学习', y: learningProgress.remainingWords, color: '#95a5a6' }
    ];

    return (
      <View style={styles.tabContent}>
        {/* 每日学习进度图表 */}
        <Card containerStyle={styles.chartCard}>
          <Card.Title style={styles.cardTitle}>最近7天学习进度</Card.Title>
          <Card.Divider />

          <VictoryChart
            width={screenWidth - 40}
            height={200}
            theme={VictoryTheme.material}
          >
            <VictoryAxis
              style={{
                tickLabels: { fontSize: 12, angle: -45 }
              }}
            />
            <VictoryAxis
              dependentAxis
              style={{
                tickLabels: { fontSize: 12 }
              }}
            />
            <VictoryBar
              data={chartData}
              style={{
                data: { fill: '#3498db' }
              }}
              labels={({ datum }) => datum.y}
              labelComponent={<VictoryLabel style={{ fontSize: 10 }} />}
            />
          </VictoryChart>
        </Card>

        {/* 学习分布饼图 */}
        <Card containerStyle={styles.chartCard}>
          <Card.Title style={styles.cardTitle}>词汇掌握分布</Card.Title>
          <Card.Divider />

          <VictoryPie
            data={pieData}
            width={screenWidth - 40}
            height={250}
            colorScale={pieData.map(d => d.color)}
            style={{
              labels: {
                fontSize: 12,
                fill: 'white'
              }
            }}
            labelRadius={({ innerRadius }) => innerRadius + 30}
          />
        </Card>
      </View>
    );
  };

  const renderPredictionsTab = () => (
    <View style={styles.tabContent}>
      {/* 学习预测 */}
      <Card containerStyle={styles.predictionCard}>
        <Card.Title style={styles.cardTitle}>学习进度预测</Card.Title>
        <Card.Divider />

        <View style={styles.predictionOverview}>
          <Text style={styles.predictionTitle}>
            预测{predictions.days || 30}天后：
          </Text>

          <View style={styles.predictionItem}>
            <Icon name="graduation-cap" type="font-awesome" color="#3498db" size={20} />
            <View style={styles.predictionContent}>
              <Text style={styles.predictionLabel}>
                累计学习单词: {predictions.predictedLearnedWords || 0}
              </Text>
              <Text style={styles.predictionDesc}>
                每日平均: {predictions.dailyAverage || 0} 个单词
              </Text>
            </View>
          </View>

          <View style={styles.predictionItem}>
            <Icon name="trophy" type="font-awesome" color="#f39c12" size={20} />
            <View style={styles.predictionContent}>
              <Text style={styles.predictionLabel}>
                掌握单词数: {predictions.predictedMasteredWords || 0}
              </Text>
              <Text style={styles.predictionDesc}>
                掌握率: {Math.round(((predictions.predictedMasteredWords || 0) / (predictions.predictedLearnedWords || 1)) * 100)}%
              </Text>
            </View>
          </View>

          <View style={styles.predictionItem}>
            <Icon name="calendar" type="font-awesome" color="#2ecc71" size={20} />
            <View style={styles.predictionContent}>
              <Text style={styles.predictionLabel}>
                完成时间: {predictions.estimatedCompletionTime?.message || '计算中...'}
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {/* 激励信息 */}
      <Card containerStyle={styles.motivationCard}>
        <Card.Title style={styles.cardTitle}>学习激励</Card.Title>
        <Card.Divider />

        <View style={styles.motivationContent}>
          <Text style={styles.motivationQuote}>
            "坚持就是胜利！每一天的努力都在为更好的自己铺路。"
          </Text>
          <View style={styles.motivationStats}>
            <View style={styles.motivationStat}>
              <Text style={styles.motivationNumber}>{learningProgress.totalPercentage}%</Text>
              <Text style={styles.motivationLabel}>已完成</Text>
            </View>
            <View style={styles.motivationDivider} />
            <View style={styles.motivationStat}>
              <Text style={styles.motivationNumber}>{learningProgress.remainingWords}</Text>
              <Text style={styles.motivationLabel}>待学习</Text>
            </View>
          </View>
        </View>
      </Card>
    </View>
  );

  const renderTabSelector = () => (
    <View style={styles.tabSelector}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          selectedTab === 'overview' && styles.activeTab
        ]}
        onPress={() => setSelectedTab('overview')}
      >
        <Icon
          name="dashboard"
          type="font-awesome"
          color={selectedTab === 'overview' ? '#fff' : '#3498db'}
          size={16}
        />
        <Text style={[
          styles.tabButtonText,
          selectedTab === 'overview' && styles.activeTabText
        ]}>
          概览
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabButton,
          selectedTab === 'charts' && styles.activeTab
        ]}
        onPress={() => setSelectedTab('charts')}
      >
        <Icon
          name="line-chart"
          type="font-awesome"
          color={selectedTab === 'charts' ? '#fff' : '#3498db'}
          size={16}
        />
        <Text style={[
          styles.tabButtonText,
          selectedTab === 'charts' && styles.activeTabText
        ]}>
          图表
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabButton,
          selectedTab === 'predictions' && styles.activeTab
        ]}
        onPress={() => setSelectedTab('predictions')}
      >
        <Icon
          name="crystal-ball"
          type="font-awesome"
          color={selectedTab === 'predictions' ? '#fff' : '#3498db'}
          size={16}
        />
        <Text style={[
          styles.tabButtonText,
          selectedTab === 'predictions' && styles.activeTabText
        ]}>
          预测
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      {renderTabSelector()}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {selectedTab === 'overview' && renderOverviewTab()}
        {selectedTab === 'charts' && renderChartsTab()}
        {selectedTab === 'predictions' && renderPredictionsTab()}

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
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 10,
    padding: 4,
    marginTop: 15,
    marginBottom: 20,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#3498db',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3498db',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#fff',
  },
  tabContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  progressCard: {
    borderRadius: 15,
    elevation: 3,
    marginBottom: 15,
  },
  progressOverview: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  circularProgress: {
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
  progressDetails: {
    marginTop: 20,
  },
  progressDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressDetailText: {
    fontSize: 14,
    color: '#2c3e50',
    marginLeft: 10,
  },
  efficiencyCard: {
    borderRadius: 15,
    elevation: 3,
    marginBottom: 15,
  },
  efficiencyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  efficiencyItem: {
    alignItems: 'center',
  },
  efficiencyValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
  efficiencyLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  suggestionsCard: {
    borderRadius: 15,
    elevation: 3,
    marginBottom: 15,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  suggestionContent: {
    flex: 1,
    marginLeft: 10,
  },
  suggestionMessage: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 4,
  },
  suggestionAction: {
    fontSize: 12,
    color: '#3498db',
    fontStyle: 'italic',
  },
  chartCard: {
    borderRadius: 15,
    elevation: 3,
    marginBottom: 15,
  },
  predictionCard: {
    borderRadius: 15,
    elevation: 3,
    marginBottom: 15,
  },
  predictionOverview: {
    paddingVertical: 10,
  },
  predictionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  predictionContent: {
    flex: 1,
    marginLeft: 15,
  },
  predictionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  predictionDesc: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  motivationCard: {
    borderRadius: 15,
    elevation: 3,
    marginBottom: 15,
  },
  motivationContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  motivationQuote: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 30,
    lineHeight: 24,
  },
  motivationStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  motivationStat: {
    alignItems: 'center',
  },
  motivationNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
  motivationLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  motivationDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#ecf0f1',
    marginHorizontal: 30,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default StatisticsScreen;
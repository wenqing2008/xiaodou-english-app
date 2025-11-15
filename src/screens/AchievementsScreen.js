import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity
} from 'react-native';
import { Card, Button, Icon } from 'react-native-elements';
import { useSelector } from 'react-redux';
import { selectUserAchievements, selectUserProfile } from '../store/userSlice';

const AchievementsScreen = ({ navigation }) => {
  const achievements = useSelector(selectUserAchievements);
  const userProfile = useSelector(selectUserProfile);

  const [selectedCategory, setSelectedCategory] = useState('all');

  const achievementCategories = [
    { key: 'all', label: '全部', icon: 'star', color: '#f39c12' },
    { key: 'learning', label: '学习', icon: 'book', color: '#3498db' },
    { key: 'consistency', label: '坚持', icon: 'calendar-check-o', color: '#2ecc71' },
    { key: 'mastery', label: '掌握', icon: 'trophy', color: '#e74c3c' },
    { key: 'special', label: '特殊', icon: 'gem', color: '#9b59b6' }
  ];

  const allAchievements = [
    {
      id: 1,
      type: 'learning',
      title: '初学者',
      description: '学习第一个单词',
      icon: 'graduation-cap',
      color: '#3498db',
      requirement: '学习1个单词',
      points: 10,
      unlocked: true,
      unlockedAt: '2024-01-01T10:00:00Z'
    },
    {
      id: 2,
      type: 'learning',
      title: '词汇新手',
      description: '学习50个单词',
      icon: 'book',
      color: '#3498db',
      requirement: '学习50个单词',
      points: 50,
      unlocked: false,
      progress: 32
    },
    {
      id: 3,
      type: 'consistency',
      title: '持之以恒',
      description: '连续学习7天',
      icon: 'calendar-check-o',
      color: '#2ecc71',
      requirement: '连续7天学习',
      points: 100,
      unlocked: userProfile.studyDays >= 7,
      unlockedAt: userProfile.studyDays >= 7 ? '2024-01-08T09:00:00Z' : null,
      progress: userProfile.studyDays
    },
    {
      id: 4,
      type: 'mastery',
      title: '单词大师',
      description: '掌握100个单词',
      icon: 'trophy',
      color: '#e74c3c',
      requirement: '掌握100个单词',
      points: 200,
      unlocked: false,
      progress: 45
    },
    {
      id: 5,
      type: 'learning',
      title: '学霸之路',
      description: '学习500个单词',
      icon: 'university',
      color: '#3498db',
      requirement: '学习500个单词',
      points: 500,
      unlocked: false,
      progress: 127
    },
    {
      id: 6,
      type: 'consistency',
      title: '月度冠军',
      description: '连续学习30天',
      icon: 'calendar',
      color: '#2ecc71',
      requirement: '连续30天学习',
      points: 300,
      unlocked: false,
      progress: userProfile.studyDays
    },
    {
      id: 7,
      type: 'mastery',
      title: '完美掌握',
      description: '一次测试全对',
      icon: 'star',
      color: '#e74c3c',
      requirement: '测试满分',
      points: 150,
      unlocked: false
    },
    {
      id: 8,
      type: 'special',
      title: '游戏达人',
      description: '在所有游戏中获得三星评价',
      icon: 'gamepad',
      color: '#9b59b6',
      requirement: '游戏全三星',
      points: 250,
      unlocked: false
    },
    {
      id: 9,
      type: 'special',
      title: '速度之星',
      description: '10秒内回答5个单词',
      icon: 'bolt',
      color: '#9b59b6',
      requirement: '快速回答',
      points: 180,
      unlocked: false
    },
    {
      id: 10,
      type: 'mastery',
      title: '词汇专家',
      description: '掌握1000个单词',
      icon: 'crown',
      color: '#e74c3c',
      requirement: '掌握1000个单词',
      points: 1000,
      unlocked: false,
      progress: 156
    }
  ];

  const filteredAchievements = selectedCategory === 'all'
    ? allAchievements
    : allAchievements.filter(achievement => achievement.type === selectedCategory);

  const unlockedCount = allAchievements.filter(a => a.unlocked).length;
  const totalPoints = allAchievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);

  const renderCategorySelector = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categorySelector}
      contentContainerStyle={styles.categoryContent}
    >
      {achievementCategories.map((category) => (
        <TouchableOpacity
          key={category.key}
          style={[
            styles.categoryButton,
            selectedCategory === category.key && styles.selectedCategory,
            { borderLeftColor: category.color }
          ]}
          onPress={() => setSelectedCategory(category.key)}
        >
          <Icon
            name={category.icon}
            type="font-awesome"
            color={selectedCategory === category.key ? category.color : '#95a5a6'}
            size={16}
          />
          <Text style={[
            styles.categoryText,
            selectedCategory === category.key && styles.selectedCategoryText
          ]}>
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderStatsOverview = () => (
    <Card containerStyle={styles.statsCard}>
      <Card.Title style={styles.cardTitle}>成就统计</Card.Title>
      <Card.Divider />

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{unlockedCount}</Text>
          <Text style={styles.statLabel}>已解锁</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{allAchievements.length}</Text>
          <Text style={styles.statLabel}>总成就</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalPoints}</Text>
          <Text style={styles.statLabel}>积分</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {Math.round((unlockedCount / allAchievements.length) * 100)}%
          </Text>
          <Text style={styles.statLabel}>完成度</Text>
        </View>
      </View>
    </Card>
  );

  const renderAchievement = (achievement) => {
    const category = achievementCategories.find(c => c.key === achievement.type);
    const progress = achievement.progress || 0;
    const requirement = parseInt(achievement.requirement.match(/\d+/)?.[0] || 1);
    const progressPercentage = Math.min(100, (progress / requirement) * 100);

    return (
      <Card key={achievement.id} containerStyle={styles.achievementCard}>
        <View style={styles.achievementHeader}>
          <View style={styles.achievementIcon}>
            <Icon
              name={achievement.icon}
              type="font-awesome"
              color={achievement.unlocked ? achievement.color : '#95a5a6'}
              size={30}
            />
          </View>
          <View style={styles.achievementInfo}>
            <Text style={[
              styles.achievementTitle,
              !achievement.unlocked && styles.lockedTitle
            ]}>
              {achievement.title}
            </Text>
            <Text style={styles.achievementDescription}>
              {achievement.description}
            </Text>
            <View style={styles.achievementMeta}>
              <Text style={styles.achievementRequirement}>
                {achievement.requirement}
              </Text>
              <Text style={styles.achievementPoints}>
                +{achievement.points} 积分
              </Text>
            </View>
          </View>
          <View style={styles.achievementStatus}>
            {achievement.unlocked ? (
              <Icon name="check-circle" type="font-awesome" color="#2ecc71" size={24} />
            ) : (
              <Icon name="lock" type="font-awesome" color="#95a5a6" size={24" />
            )}
          </View>
        </View>

        {!achievement.unlocked && progress > 0 && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              进度: {progress}/{requirement}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPercentage}%`, backgroundColor: category.color }
                ]}
              />
            </View>
          </View>
        )}

        {achievement.unlocked && achievement.unlockedAt && (
          <Text style={styles.unlockDate}>
            解锁时间: {new Date(achievement.unlockedAt).toLocaleDateString()}
          </Text>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      {renderCategorySelector()}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderStatsOverview()}

        <View style={styles.achievementsContainer}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? '全部成就' :
             achievementCategories.find(c => c.key === selectedCategory)?.label + '成就'}
          </Text>

          {filteredAchievements.length > 0 ? (
            filteredAchievements.map(achievement => renderAchievement(achievement))
          ) : (
            <Card containerStyle={styles.emptyCard}>
              <View style={styles.emptyContainer}>
                <Icon name="trophy" type="font-awesome" color="#95a5a6" size={40} />
                <Text style={styles.emptyText}>
                  该分类暂无成就
                </Text>
              </View>
            </Card>
          )}
        </View>

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
  categorySelector: {
    marginHorizontal: 15,
    marginVertical: 10,
  },
  categoryContent: {
    paddingHorizontal: 5,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderLeftWidth: 3,
    elevation: 2,
  },
  selectedCategory: {
    backgroundColor: '#ecf0f1',
  },
  categoryText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  selectedCategoryText: {
    color: '#2c3e50',
  },
  statsCard: {
    borderRadius: 15,
    elevation: 3,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  achievementsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  achievementCard: {
    borderRadius: 15,
    elevation: 3,
    marginBottom: 15,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  lockedTitle: {
    color: '#95a5a6',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  achievementMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  achievementRequirement: {
    fontSize: 12,
    color: '#95a5a6',
  },
  achievementPoints: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f39c12',
  },
  achievementStatus: {
    alignItems: 'center',
  },
  progressContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  progressText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  unlockDate: {
    fontSize: 10,
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  emptyCard: {
    borderRadius: 15,
    elevation: 3,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
    marginTop: 15,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default AchievementsScreen;
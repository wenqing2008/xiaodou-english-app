import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Switch,
  Alert,
  ScrollView
} from 'react-native';
import { Card, Button, Icon } from 'react-native-elements';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateSettings,
  saveUserSettings,
  selectUserSettings
} from '../store/userSlice';

const SettingsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const userSettings = useSelector(selectUserSettings);
  const [loading, setLoading] = useState(false);

  const [localSettings, setLocalSettings] = useState({
    dailyGoal: 20,
    reminderEnabled: true,
    reminderTime: '19:00',
    soundEnabled: true,
    pronunciationType: 'US',
    autoPlayAudio: true,
    showPronunciation: true,
    showExample: true,
    difficulty: 3,
    theme: 'light',
    language: 'zh-CN',
    learningMode: 'balanced'
  });

  useEffect(() => {
    if (userSettings) {
      setLocalSettings(userSettings);
    }
  }, [userSettings]);

  const handleSettingChange = async (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);

    try {
      setLoading(true);
      await dispatch(saveUserSettings(newSettings)).unwrap();
      dispatch(updateSettings({ key, value }));
    } catch (error) {
      console.error('保存设置失败:', error);
      Alert.alert('错误', '保存设置失败，请重试');
      // 恢复原设置
      setLocalSettings(userSettings);
    } finally {
      setLoading(false);
    }
  };

  const showTimePicker = () => {
    Alert.alert(
      '选择提醒时间',
      '请设置学习提醒时间',
      [
        { text: '早上 9:00', onPress: () => handleSettingChange('reminderTime', '09:00') },
        { text: '下午 2:00', onPress: () => handleSettingChange('reminderTime', '14:00') },
        { text: '晚上 7:00', onPress: () => handleSettingChange('reminderTime', '19:00') },
        { text: '晚上 9:00', onPress: () => handleSettingChange('reminderTime', '21:00') },
        { text: '取消', style: 'cancel' }
      ]
    );
  };

  const showDailyGoalSelector = () => {
    const goals = [10, 15, 20, 25, 30, 50];
    Alert.alert(
      '选择每日学习目标',
      '设置每天要学习的新单词数量',
      goals.map(goal => ({
        text: `${goal} 个单词`,
        onPress: () => handleSettingChange('dailyGoal', goal)
      })).concat([{ text: '取消', style: 'cancel' }])
    );
  };

  const showDifficultySelector = () => {
    const difficulties = [
      { key: 1, label: '简单', description: '适合初学者' },
      { key: 2, label: '较简单', description: '基础词汇' },
      { key: 3, label: '中等', description: '高中核心词汇' },
      { key: 4, label: '较难', description: '进阶词汇' },
      { key: 5, label: '困难', description: '高级词汇' }
    ];

    Alert.alert(
      '选择学习难度',
      '设置单词学习的难度级别',
      difficulties.map(diff => ({
        text: `${diff.label} - ${diff.description}`,
        onPress: () => handleSettingChange('difficulty', diff.key)
      })).concat([{ text: '取消', style: 'cancel' }])
    );
  };

  const showLearningModeSelector = () => {
    const modes = [
      { key: 'conservative', label: '保守模式', description: '注重复习，较少新词' },
      { key: 'balanced', label: '平衡模式', description: '新词与复习平衡' },
      { key: 'aggressive', label: '激进模式', description: '更多新词，快速进步' }
    ];

    Alert.alert(
      '选择学习模式',
      '设置学习进度策略',
      modes.map(mode => ({
        text: `${mode.label} - ${mode.description}`,
        onPress: () => handleSettingChange('learningMode', mode.key)
      })).concat([{ text: '取消', style: 'cancel' }])
    );
  };

  const showPronunciationSelector = () => {
    Alert.alert(
      '选择发音类型',
      '设置单词发音的标准',
      [
        { text: '美式发音 (US)', onPress: () => handleSettingChange('pronunciationType', 'US') },
        { text: '英式发音 (UK)', onPress: () => handleSettingChange('pronunciationType', 'UK') },
        { text: '取消', style: 'cancel' }
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, value, type, onPress }) => {
    const renderValue = () => {
      switch (type) {
        case 'switch':
          return (
            <Switch
              value={value}
              onValueChange={onPress}
              disabled={loading}
            />
          );
        case 'selector':
          return (
            <TouchableOpacity onPress={onPress} disabled={loading}>
              <View style={styles.selectorValue}>
                <Text style={styles.valueText}>{value}</Text>
                <Icon name="chevron-right" type="font-awesome" color="#95a5a6" size={14} />
              </View>
            </TouchableOpacity>
          );
        default:
          return <Text style={styles.valueText}>{value}</Text>;
      }
    };

    return (
      <TouchableOpacity style={styles.settingItem} onPress={type === 'selector' ? onPress : null}>
        <View style={styles.settingLeft}>
          <Icon
            name={icon}
            type="font-awesome"
            color="#3498db"
            size={20}
            containerStyle={styles.settingIcon}
          />
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{title}</Text>
            {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
          </View>
        </View>
        {renderValue()}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 学习设置 */}
        <Card containerStyle={styles.card}>
          <Card.Title style={styles.cardTitle}>学习设置</Card.Title>
          <Card.Divider />

          <SettingItem
            icon="bullseye"
            title="每日学习目标"
            subtitle="设置每天要学习的新单词数量"
            value={`${localSettings.dailyGoal} 个单词`}
            type="selector"
            onPress={showDailyGoalSelector}
          />

          <SettingItem
            icon="graduation-cap"
            title="学习难度"
            subtitle="选择适合的单词难度级别"
            value={`${localSettings.difficulty} 级`}
            type="selector"
            onPress={showDifficultySelector}
          />

          <SettingItem
            icon="balance-scale"
            title="学习模式"
            subtitle="设置学习进度策略"
            value={
              localSettings.learningMode === 'conservative' ? '保守模式' :
              localSettings.learningMode === 'balanced' ? '平衡模式' : '激进模式'
            }
            type="selector"
            onPress={showLearningModeSelector}
          />
        </Card>

        {/* 提醒设置 */}
        <Card containerStyle={styles.card}>
          <Card.Title style={styles.cardTitle}>提醒设置</Card.Title>
          <Card.Divider />

          <SettingItem
            icon="bell"
            title="学习提醒"
            subtitle="开启每日学习提醒"
            value={localSettings.reminderEnabled}
            type="switch"
            onPress={(value) => handleSettingChange('reminderEnabled', value)}
          />

          {localSettings.reminderEnabled && (
            <SettingItem
              icon="clock-o"
              title="提醒时间"
              subtitle="设置每日提醒的具体时间"
              value={localSettings.reminderTime}
              type="selector"
              onPress={showTimePicker}
            />
          )}
        </Card>

        {/* 音频设置 */}
        <Card containerStyle={styles.card}>
          <Card.Title style={styles.cardTitle}>音频设置</Card.Title>
          <Card.Divider />

          <SettingItem
            icon="volume-up"
            title="音效"
            subtitle="开启应用音效"
            value={localSettings.soundEnabled}
            type="switch"
            onPress={(value) => handleSettingChange('soundEnabled', value)}
          />

          <SettingItem
            icon="headphones"
            title="自动播放发音"
            subtitle="学习时自动播放单词发音"
            value={localSettings.autoPlayAudio}
            type="switch"
            onPress={(value) => handleSettingChange('autoPlayAudio', value)}
          />

          <SettingItem
            icon="microphone"
            title="发音类型"
            subtitle="选择单词发音的标准"
            value={localSettings.pronunciationType === 'US' ? '美式发音' : '英式发音'}
            type="selector"
            onPress={showPronunciationSelector}
          />
        </Card>

        {/* 显示设置 */}
        <Card containerStyle={styles.card}>
          <Card.Title style={styles.cardTitle}>显示设置</Card.Title>
          <Card.Divider />

          <SettingItem
            icon="font"
            title="显示音标"
            subtitle="在学习界面显示单词音标"
            value={localSettings.showPronunciation}
            type="switch"
            onPress={(value) => handleSettingChange('showPronunciation', value)}
          />

          <SettingItem
            icon="align-left"
            title="显示例句"
            subtitle="在学习界面显示单词例句"
            value={localSettings.showExample}
            type="switch"
            onPress={(value) => handleSettingChange('showExample', value)}
          />

          <SettingItem
            icon="bar-chart"
            title="显示统计"
            subtitle="在主页显示学习统计信息"
            value={localSettings.showStatistics}
            type="switch"
            onPress={(value) => handleSettingChange('showStatistics', value)}
          />
        </Card>

        {/* 数据管理 */}
        <Card containerStyle={styles.card}>
          <Card.Title style={styles.cardTitle}>数据管理</Card.Title>
          <Card.Divider />

          <TouchableOpacity style={styles.actionItem}>
            <Icon name="download" type="font-awesome" color="#3498db" size={20} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>导出学习数据</Text>
              <Text style={styles.actionSubtitle}>备份学习进度和统计数据</Text>
            </View>
            <Icon name="chevron-right" type="font-awesome" color="#95a5a6" size={14} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <Icon name="upload" type="font-awesome" color="#2ecc71" size={20} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>导入学习数据</Text>
              <Text style={styles.actionSubtitle}>从备份文件恢复学习数据</Text>
            </View>
            <Icon name="chevron-right" type="font-awesome" color="#95a5a6" size={14} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <Icon name="trash" type="font-awesome" color="#e74c3c" size={20} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>清除学习数据</Text>
              <Text style={styles.actionSubtitle}>删除所有学习记录（不可恢复）</Text>
            </View>
            <Icon name="chevron-right" type="font-awesome" color="#95a5a6" size={14} />
          </TouchableOpacity>
        </Card>

        {/* 关于应用 */}
        <Card containerStyle={styles.card}>
          <Card.Title style={styles.cardTitle}>关于应用</Card.Title>
          <Card.Divider />

          <View style={styles.aboutInfo}>
            <Text style={styles.appName}>文小豆英语学习</Text>
            <Text style={styles.appVersion}>版本 1.0.0</Text>
            <Text style={styles.appDescription}>
              专为高二学生设计的英语单词学习应用，基于科学记忆原理，帮助高效掌握词汇。
            </Text>
          </View>

          <View style={styles.aboutActions}>
            <Button
              title="用户反馈"
              type="clear"
              icon={<Icon name="comment" type="font-awesome" color="#3498db" size={16} />}
              titleStyle={styles.aboutButtonTitle}
            />
            <Button
              title="使用帮助"
              type="clear"
              icon={<Icon name="question-circle" type="font-awesome" color="#3498db" size={16} />}
              titleStyle={styles.aboutButtonTitle}
            />
          </View>
        </Card>

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
  card: {
    borderRadius: 15,
    elevation: 3,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  selectorValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 16,
    color: '#3498db',
    marginRight: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  actionContent: {
    flex: 1,
    marginLeft: 15,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  aboutInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  appVersion: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 15,
  },
  appDescription: {
    fontSize: 14,
    color: '#2c3e50',
    textAlign: 'center',
    lineHeight: 20,
  },
  aboutActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  aboutButtonTitle: {
    fontSize: 14,
    color: '#3498db',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default SettingsScreen;
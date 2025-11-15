/**
 * 文小豆英语单词学习软件 - 记忆算法模块
 * 基于艾宾浩斯遗忘曲线的科学记忆算法
 */

class MemoryAlgorithm {
  constructor() {
    // 艾宾浩斯遗忘曲线标准复习间隔（天）
    this.baseIntervals = [1, 2, 4, 7, 15, 30, 60, 120, 240];

    // 记忆强度衰减因子
    this.decayFactor = 0.9;

    // 难度调整因子
    this.difficultyMultipliers = {
      1: 1.2,  // 简单
      2: 1.1,  // 较简单
      3: 1.0,  // 中等
      4: 0.9,  // 较难
      5: 0.8   // 困难
    };
  }

  /**
   * 计算下次复习时间
   * @param {Object} learningRecord 学习记录
   * @param {boolean} isCorrect 是否答对
   * @param {number} responseTime 响应时间（毫秒）
   * @returns {Object} 包含下次复习时间和记忆强度的对象
   */
  calculateNextReview(learningRecord, isCorrect, responseTime = null) {
    const {
      review_count = 0,
      correct_count = 0,
      memory_strength = 0,
      difficulty = 3
    } = learningRecord;

    const newReviewCount = review_count + 1;
    const newCorrectCount = correct_count + (isCorrect ? 1 : 0);

    // 计算准确率
    const accuracy = newCorrectCount / newReviewCount;

    // 计算响应时间因子
    const timeFactor = this.calculateTimeFactor(responseTime);

    // 获取基础间隔
    const baseInterval = this.getBaseInterval(newReviewCount);

    // 根据难度调整间隔
    const difficultyMultiplier = this.difficultyMultipliers[difficulty] || 1.0;

    // 计算新的记忆强度
    let newMemoryStrength = this.calculateMemoryStrength(
      accuracy,
      isCorrect,
      memory_strength,
      timeFactor
    );

    // 计算复习间隔
    let reviewInterval;

    if (isCorrect) {
      // 答对的情况，根据记忆强度调整间隔
      const strengthMultiplier = 1 + (newMemoryStrength / 100) * 0.5;
      reviewInterval = Math.floor(baseInterval * difficultyMultiplier * strengthMultiplier);

      // 记忆强度提升
      newMemoryStrength = Math.min(100, newMemoryStrength + 5);
    } else {
      // 答错的情况，缩短间隔
      reviewInterval = Math.max(1, Math.floor(baseInterval * 0.3));

      // 记忆强度下降
      newMemoryStrength = Math.max(0, newMemoryStrength - 20);
    }

    return {
      nextReviewInterval: reviewInterval,
      newMemoryStrength: Math.round(newMemoryStrength),
      newReviewCount,
      newCorrectCount,
      accuracy: Math.round(accuracy * 100)
    };
  }

  /**
   * 获取基础复习间隔
   * @param {number} reviewCount 复习次数
   * @returns {number} 基础间隔（天）
   */
  getBaseInterval(reviewCount) {
    if (reviewCount <= 0) return 1;

    const index = Math.min(reviewCount - 1, this.baseIntervals.length - 1);
    return this.baseIntervals[index];
  }

  /**
   * 计算记忆强度
   * @param {number} accuracy 准确率
   * @param {boolean} isCorrect 是否答对
   * @param {number} currentStrength 当前记忆强度
   * @param {number} timeFactor 时间因子
   * @returns {number} 新的记忆强度（0-100）
   */
  calculateMemoryStrength(accuracy, isCorrect, currentStrength, timeFactor) {
    let strength = currentStrength;

    if (isCorrect) {
      // 答对时增强记忆
      const accuracyBonus = accuracy * 20;
      const timeBonus = timeFactor * 10;
      strength += accuracyBonus + timeBonus;
    } else {
      // 答错时减弱记忆
      strength -= 25;
    }

    // 应用记忆衰减
    strength *= this.decayFactor;

    return Math.max(0, Math.min(100, strength));
  }

  /**
   * 计算响应时间因子
   * @param {number} responseTime 响应时间（毫秒）
   * @returns {number} 时间因子（0-1）
   */
  calculateTimeFactor(responseTime) {
    if (!responseTime) return 0.8;

    // 理想响应时间为3-8秒
    if (responseTime < 1000) return 0.6;      // 太快，可能猜测
    if (responseTime < 3000) return 0.8;      // 较快
    if (responseTime < 8000) return 1.0;      // 理想
    if (responseTime < 15000) return 0.9;     // 稍慢
    return 0.7;                               // 太慢
  }

  /**
   * 评估单词掌握程度
   * @param {Object} learningRecord 学习记录
   * @returns {string} 掌握程度：'new', 'learning', 'familiar', 'mastered'
   */
  evaluateMastery(learningRecord) {
    const { memory_strength = 0, review_count = 0, accuracy = 0 } = learningRecord;

    if (review_count === 0) return 'new';
    if (review_count < 3) return 'learning';
    if (memory_strength >= 80 && accuracy >= 0.8) return 'mastered';
    if (memory_strength >= 50) return 'familiar';
    return 'learning';
  }

  /**
   * 生成每日学习计划
   * @param {Object} options 配置选项
   * @returns {Object} 学习计划
   */
  generateDailyStudyPlan(options = {}) {
    const {
      dailyGoal = 20,
      newWordsRatio = 0.3,       // 新词比例
      reviewRatio = 0.7          // 复习比例
    } = options;

    const newWordsCount = Math.floor(dailyGoal * newWordsRatio);
    const reviewWordsCount = dailyGoal - newWordsCount;

    return {
      totalWords: dailyGoal,
      newWords: newWordsCount,
      reviewWords: reviewWordsCount,
      categories: [
        {
          name: '新单词',
          count: newWordsCount,
          priority: 'high',
          reason: '打好基础，逐步积累'
        },
        {
          name: '复习单词',
          count: reviewWordsCount,
          priority: 'high',
          reason: '巩固记忆，防止遗忘'
        }
      ]
    };
  }

  /**
   * 计算学习效率
   * @param {Array} studySessions 学习会话记录
   * @param {number} timePeriod 时间周期（天）
   * @returns {Object} 学习效率指标
   */
  calculateLearningEfficiency(studySessions, timePeriod = 7) {
    if (!studySessions || studySessions.length === 0) {
      return {
        efficiency: 0,
        wordsPerHour: 0,
        accuracy: 0,
        retention: 0
      };
    }

    // 筛选指定时间段内的记录
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timePeriod);

    const recentSessions = studySessions.filter(session =>
      new Date(session.session_date) >= cutoffDate
    );

    if (recentSessions.length === 0) {
      return {
        efficiency: 0,
        wordsPerHour: 0,
        accuracy: 0,
        retention: 0
      };
    }

    // 计算总学习时间和单词数
    const totalTime = recentSessions.reduce((sum, session) => {
      const startTime = new Date(session.start_time);
      const endTime = session.end_time ? new Date(session.end_time) : new Date();
      return sum + (endTime - startTime) / (1000 * 60 * 60); // 转换为小时
    }, 0);

    const totalWords = recentSessions.reduce((sum, session) =>
      sum + session.words_studied, 0
    );

    const totalCorrect = recentSessions.reduce((sum, session) =>
      sum + session.correct_answers, 0
    );

    const totalAnswers = recentSessions.reduce((sum, session) =>
      sum + session.total_answers, 0
    );

    // 计算指标
    const wordsPerHour = totalTime > 0 ? Math.round(totalWords / totalTime) : 0;
    const accuracy = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;

    // 计算保持率（简化版本）
    const retention = this.calculateRetention(recentSessions);

    // 综合效率评分
    const efficiency = Math.round(
      (wordsPerHour * 0.3 + accuracy * 0.4 + retention * 0.3)
    );

    return {
      efficiency,
      wordsPerHour,
      accuracy,
      retention,
      totalTime: Math.round(totalTime * 10) / 10
    };
  }

  /**
   * 计算知识保持率
   * @param {Array} sessions 学习会话
   * @returns {number} 保持率（0-100）
   */
  calculateRetention(sessions) {
    if (sessions.length === 0) return 0;

    // 简化的保持率计算
    // 基于重复学习次数和正确率
    let retentionScore = 0;
    let totalSessions = 0;

    sessions.forEach(session => {
      if (session.total_answers > 0) {
        const sessionAccuracy = session.correct_answers / session.total_answers;
        retentionScore += sessionAccuracy * 100;
        totalSessions++;
      }
    });

    return totalSessions > 0 ? Math.round(retentionScore / totalSessions) : 0;
  }

  /**
   * 生成个性化学习建议
   * @param {Object} statistics 学习统计数据
   * @param {Object} efficiency 学习效率数据
   * @returns {Array} 建议列表
   */
  generateStudyAdvice(statistics, efficiency) {
    const advice = [];

    // 基于记忆强度的建议
    const { masteredWords, learnedWords, totalWords } = statistics;
    const masteryRate = totalWords > 0 ? (masteredWords / learnedWords) * 100 : 0;

    if (masteryRate < 30) {
      advice.push({
        type: 'memory',
        priority: 'high',
        message: '建议增加复习频率，巩固已学单词的记忆',
        action: '每天安排30%时间用于复习'
      });
    }

    // 基于学习效率的建议
    if (efficiency.wordsPerHour < 10) {
      advice.push({
        type: 'speed',
        priority: 'medium',
        message: '学习速度较慢，可以尝试集中注意力学习',
        action: '选择安静的环境，减少干扰'
      });
    }

    if (efficiency.accuracy < 70) {
      advice.push({
        type: 'accuracy',
        priority: 'high',
        message: '正确率偏低，建议放慢学习节奏',
        action: '仔细阅读单词释义和例句'
      });
    }

    // 基于学习时间的建议
    if (efficiency.totalTime < 0.5) {
      advice.push({
        type: 'consistency',
        priority: 'medium',
        message: '学习时间较短，建议增加每日学习时间',
        action: '每天保持至少15分钟的学习时间'
      });
    }

    return advice;
  }

  /**
   * 预测学习进度
   * @param {Object} currentStats 当前统计
   * @param {number} days 预测天数
   * @returns {Object} 预测结果
   */
  predictLearningProgress(currentStats, days = 30) {
    const { learnedWords, masteredWords, efficiency } = currentStats;

    // 基于当前效率预测未来进度
    const dailyNewWords = Math.max(5, efficiency.wordsPerHour * 0.5);
    const dailyMasteredWords = masteredWords / Math.max(1, learnedWords) * dailyNewWords;

    const predictedLearned = learnedWords + (dailyNewWords * days);
    const predictedMastered = masteredWords + (dailyMasteredWords * days);

    return {
      days,
      predictedLearnedWords: Math.round(predictedLearned),
      predictedMasteredWords: Math.round(predictedMastered),
      dailyAverage: Math.round(dailyNewWords),
      estimatedCompletionTime: this.estimateCompletionTime(predictedLearned)
    };
  }

  /**
   * 估算完成所有单词学习的时间
   * @param {number} learnedWords 已学单词数
   * @returns {Object} 完成时间估算
   */
  estimateCompletionTime(learnedWords) {
    // 假设目标词汇量为3000个
    const targetWords = 3000;
    const remainingWords = Math.max(0, targetWords - learnedWords);

    if (remainingWords === 0) {
      return { days: 0, months: 0, message: '恭喜！已完成目标词汇量' };
    }

    // 基于平均学习速度估算
    const dailyWords = 20; // 每日学习20个单词
    const daysNeeded = Math.ceil(remainingWords / dailyWords);
    const monthsNeeded = Math.ceil(daysNeeded / 30);

    return {
      days: daysNeeded,
      months: monthsNeeded,
      message: `预计需要${monthsNeeded}个月完成目标词汇量`
    };
  }
}

export default new MemoryAlgorithm();
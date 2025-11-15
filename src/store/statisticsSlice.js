import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import DatabaseManager from '../database/DatabaseManager';
import MemoryAlgorithm from '../algorithms/MemoryAlgorithm';

// 异步操作
export const fetchStatistics = createAsyncThunk(
  'statistics/fetchStatistics',
  async () => {
    const stats = await DatabaseManager.getStudyStatistics();
    return stats;
  }
);

export const fetchStudySessions = createAsyncThunk(
  'statistics/fetchStudySessions',
  async ({ days = 7 }) => {
    // 这里需要实现获取学习会话的方法
    // 暂时返回模拟数据
    const mockSessions = [
      {
        session_date: new Date().toISOString().split('T')[0],
        start_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        words_studied: 15,
        correct_answers: 12,
        total_answers: 15,
        session_type: 'review'
      },
      {
        session_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        start_time: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        words_studied: 20,
        correct_answers: 18,
        total_answers: 20,
        session_type: 'new_words'
      }
    ];
    return mockSessions;
  }
);

const statisticsSlice = createSlice({
  name: 'statistics',
  initialState: {
    // 基础统计
    totalWords: 0,
    learnedWords: 0,
    masteredWords: 0,
    dueForReview: 0,

    // 学习效率
    efficiency: 0,
    wordsPerHour: 0,
    accuracy: 0,
    retention: 0,

    // 学习历史
    studySessions: [],
    dailyStats: {},
    weeklyStats: {},
    monthlyStats: {},

    // 进度预测
    predictions: {},

    // 学习建议
    suggestions: [],

    loading: false,
    error: null
  },
  reducers: {
    updateDailyStats: (state, action) => {
      const { date, stats } = action.payload;
      state.dailyStats[date] = stats;
    },
    updateWeeklyStats: (state, action) => {
      const { week, stats } = action.payload;
      state.weeklyStats[week] = stats;
    },
    updateMonthlyStats: (state, action) => {
      const { month, stats } = action.payload;
      state.monthlyStats[month] = stats;
    },
    calculateEfficiency: (state) => {
      const efficiency = MemoryAlgorithm.calculateLearningEfficiency(state.studySessions, 7);
      state.efficiency = efficiency.efficiency;
      state.wordsPerHour = efficiency.wordsPerHour;
      state.accuracy = efficiency.accuracy;
      state.retention = efficiency.retention;
    },
    generateSuggestions: (state) => {
      const statistics = {
        totalWords: state.totalWords,
        learnedWords: state.learnedWords,
        masteredWords: state.masteredWords
      };

      const efficiency = {
        wordsPerHour: state.wordsPerHour,
        accuracy: state.accuracy,
        totalTime: state.studySessions.reduce((sum, session) => {
          const start = new Date(session.start_time);
          const end = session.end_time ? new Date(session.end_time) : new Date();
          return sum + (end - start) / (1000 * 60 * 60);
        }, 0)
      };

      state.suggestions = MemoryAlgorithm.generateStudyAdvice(statistics, efficiency);
    },
    generatePredictions: (state) => {
      const currentStats = {
        learnedWords: state.learnedWords,
        masteredWords: state.masteredWords,
        efficiency: {
          wordsPerHour: state.wordsPerHour
        }
      };

      state.predictions = MemoryAlgorithm.predictLearningProgress(currentStats, 30);
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchStatistics
      .addCase(fetchStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.loading = false;
        const {
          totalWords = 0,
          learnedWords = 0,
          masteredWords = 0,
          dueForReview = 0
        } = action.payload;

        state.totalWords = totalWords;
        state.learnedWords = learnedWords;
        state.masteredWords = masteredWords;
        state.dueForReview = dueForReview;
      })
      .addCase(fetchStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // fetchStudySessions
      .addCase(fetchStudySessions.fulfilled, (state, action) => {
        state.studySessions = action.payload;

        // 自动计算效率
        statisticsSlice.caseReducers.calculateEfficiency(state);

        // 自动生成建议
        statisticsSlice.caseReducers.generateSuggestions(state);

        // 自动生成预测
        statisticsSlice.caseReducers.generatePredictions(state);
      });
  },
});

export const {
  updateDailyStats,
  updateWeeklyStats,
  updateMonthlyStats,
  calculateEfficiency,
  generateSuggestions,
  generatePredictions,
  setError,
  clearError
} = statisticsSlice.actions;

export default statisticsSlice.reducer;

// 选择器
export const selectBasicStatistics = (state) => ({
  totalWords: state.statistics.totalWords,
  learnedWords: state.statistics.learnedWords,
  masteredWords: state.statistics.masteredWords,
  dueForReview: state.statistics.dueForReview
});

export const selectEfficiencyMetrics = (state) => ({
  efficiency: state.statistics.efficiency,
  wordsPerHour: state.statistics.wordsPerHour,
  accuracy: state.statistics.accuracy,
  retention: state.statistics.retention
});

export const selectStudySessions = (state) => state.statistics.studySessions;
export const selectSuggestions = (state) => state.statistics.suggestions;
export const selectPredictions = (state) => state.statistics.predictions;
export const selectStatisticsLoading = (state) => state.statistics.loading;
export const selectStatisticsError = (state) => state.statistics.error;

// 复合选择器
export const selectLearningProgress = (state) => {
  const { learnedWords, masteredWords, totalWords } = state.statistics;

  return {
    learnedPercentage: totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0,
    masteredPercentage: learnedWords > 0 ? Math.round((masteredWords / learnedWords) * 100) : 0,
    totalPercentage: totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0,
    remainingWords: Math.max(0, totalWords - learnedWords),
    inProgressWords: learnedWords - masteredWords
  };
};

export const selectDailyStudyData = (state) => {
  const sessions = state.statistics.studySessions;
  const dailyData = {};

  sessions.forEach(session => {
    const date = session.session_date;
    if (!dailyData[date]) {
      dailyData[date] = {
        date,
        wordsStudied: 0,
        correctAnswers: 0,
        totalAnswers: 0,
        sessionsCount: 0
      };
    }

    dailyData[date].wordsStudied += session.words_studied;
    dailyData[date].correctAnswers += session.correct_answers;
    dailyData[date].totalAnswers += session.total_answers;
    dailyData[date].sessionsCount += 1;
  });

  return Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));
};
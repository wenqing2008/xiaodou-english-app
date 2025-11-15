import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import DatabaseManager from '../database/DatabaseManager';
import MemoryAlgorithm from '../algorithms/MemoryAlgorithm';

// 异步操作
export const submitWordAnswer = createAsyncThunk(
  'learning/submitAnswer',
  async ({ wordId, isCorrect, responseTime }) => {
    await DatabaseManager.updateLearningRecord(wordId, isCorrect, responseTime);
    return { wordId, isCorrect, responseTime };
  }
);

export const startNewLearning = createAsyncThunk(
  'learning/startNewLearning',
  async (wordId) => {
    const recordId = await DatabaseManager.createLearningRecord(wordId);
    return { wordId, recordId };
  }
);

const learningSlice = createSlice({
  name: 'learning',
  initialState: {
    currentSession: null,
    sessionStartTime: null,
    wordsStudied: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    currentStreak: 0,
    bestStreak: 0,
    sessionType: null, // 'new_words', 'review', 'test', 'game'
    sessionStats: {},
    recentAnswers: [],
    isLoading: false,
    error: null
  },
  reducers: {
    startSession: (state, action) => {
      const { sessionType } = action.payload;
      state.sessionStartTime = new Date().toISOString();
      state.sessionType = sessionType;
      state.wordsStudied = 0;
      state.correctAnswers = 0;
      state.totalAnswers = 0;
      state.currentStreak = 0;
      state.recentAnswers = [];
      state.error = null;
    },
    endSession: (state) => {
      const endTime = new Date().toISOString();

      // 保存会话统计
      state.sessionStats = {
        startTime: state.sessionStartTime,
        endTime,
        wordsStudied: state.wordsStudied,
        correctAnswers: state.correctAnswers,
        totalAnswers: state.totalAnswers,
        accuracy: state.totalAnswers > 0 ? Math.round((state.correctAnswers / state.totalAnswers) * 100) : 0,
        averageResponseTime: state.calculateAverageResponseTime?.() || 0
      };

      // 更新最佳连续答对记录
      if (state.currentStreak > state.bestStreak) {
        state.bestStreak = state.currentStreak;
      }

      state.currentSession = null;
      state.sessionStartTime = null;
    },
    recordAnswer: (state, action) => {
      const { isCorrect, responseTime, wordId } = action.payload;

      state.totalAnswers += 1;

      if (isCorrect) {
        state.correctAnswers += 1;
        state.currentStreak += 1;
        state.wordsStudied += 1;
      } else {
        state.currentStreak = 0;
      }

      // 记录最近答案用于分析
      state.recentAnswers.push({
        wordId,
        isCorrect,
        responseTime,
        timestamp: new Date().toISOString()
      });

      // 只保留最近50个答案记录
      if (state.recentAnswers.length > 50) {
        state.recentAnswers.shift();
      }
    },
    calculateAverageResponseTime: (state) => {
      if (state.recentAnswers.length === 0) return 0;

      const totalTime = state.recentAnswers.reduce((sum, answer) =>
        sum + (answer.responseTime || 0), 0
      );

      return Math.round(totalTime / state.recentAnswers.length);
    },
    resetSession: (state) => {
      state.currentSession = null;
      state.sessionStartTime = null;
      state.wordsStudied = 0;
      state.correctAnswers = 0;
      state.totalAnswers = 0;
      state.currentStreak = 0;
      state.recentAnswers = [];
      state.sessionStats = {};
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
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
      .addCase(submitWordAnswer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitWordAnswer.fulfilled, (state, action) => {
        state.isLoading = false;
        // 使用同步的 recordAnswer reducer
        learningSlice.caseReducers.recordAnswer(state, action);
      })
      .addCase(submitWordAnswer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(startNewLearning.fulfilled, (state, action) => {
        state.currentSession = action.payload;
      });
  },
});

export const {
  startSession,
  endSession,
  recordAnswer,
  resetSession,
  setLoading,
  setError,
  clearError
} = learningSlice.actions;

export default learningSlice.reducer;

// 选择器
export const selectLearningSession = (state) => state.learning.currentSession;
export const selectSessionStats = (state) => state.learning.sessionStats;
export const selectCurrentStreak = (state) => state.learning.currentStreak;
export const selectBestStreak = (state) => state.learning.bestStreak;
export const selectSessionAccuracy = (state) => {
  const { correctAnswers, totalAnswers } = state.learning;
  return totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
};
export const selectRecentAnswers = (state) => state.learning.recentAnswers;
export const selectLearningError = (state) => state.learning.error;
export const selectLearningLoading = (state) => state.learning.isLoading;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import DatabaseManager from '../database/DatabaseManager';

// 异步操作
export const fetchNewWords = createAsyncThunk(
  'words/fetchNewWords',
  async (limit = 20) => {
    const words = await DatabaseManager.getNewWords(limit);
    return words;
  }
);

export const fetchWordsByDifficulty = createAsyncThunk(
  'words/fetchByDifficulty',
  async ({ difficulty, limit = 20 }) => {
    const words = await DatabaseManager.getWordsByDifficulty(difficulty, limit);
    return words;
  }
);

export const fetchWordsForReview = createAsyncThunk(
  'words/fetchForReview',
  async () => {
    const words = await DatabaseManager.getWordsForReview();
    return words;
  }
);

export const fetchWordById = createAsyncThunk(
  'words/fetchById',
  async (wordId) => {
    const word = await DatabaseManager.getWordById(wordId);
    return word;
  }
);

const wordsSlice = createSlice({
  name: 'words',
  initialState: {
    currentWords: [],
    reviewWords: [],
    currentWord: null,
    loading: false,
    error: null,
    currentIndex: 0,
    isNewWordsMode: false,
    isReviewMode: false
  },
  reducers: {
    setCurrentWord: (state, action) => {
      state.currentWord = action.payload;
    },
    nextWord: (state) => {
      if (state.currentIndex < state.currentWords.length - 1) {
        state.currentIndex += 1;
        state.currentWord = state.currentWords[state.currentIndex];
      }
    },
    previousWord: (state) => {
      if (state.currentIndex > 0) {
        state.currentIndex -= 1;
        state.currentWord = state.currentWords[state.currentIndex];
      }
    },
    setCurrentWords: (state, action) => {
      state.currentWords = action.payload;
      state.currentWord = action.payload[0] || null;
      state.currentIndex = 0;
    },
    setReviewWords: (state, action) => {
      state.reviewWords = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setMode: (state, action) => {
      const { isNewWordsMode, isReviewMode } = action.payload;
      state.isNewWordsMode = isNewWordsMode;
      state.isReviewMode = isReviewMode;
    },
    resetWordIndex: (state) => {
      state.currentIndex = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchNewWords
      .addCase(fetchNewWords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewWords.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWords = action.payload;
        state.currentWord = action.payload[0] || null;
        state.currentIndex = 0;
        state.isNewWordsMode = true;
        state.isReviewMode = false;
      })
      .addCase(fetchNewWords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // fetchWordsForReview
      .addCase(fetchWordsForReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWordsForReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviewWords = action.payload;
        state.isReviewMode = true;
        state.isNewWordsMode = false;
      })
      .addCase(fetchWordsForReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // fetchWordById
      .addCase(fetchWordById.fulfilled, (state, action) => {
        state.currentWord = action.payload;
      });
  },
});

export const {
  setCurrentWord,
  nextWord,
  previousWord,
  setCurrentWords,
  setReviewWords,
  setLoading,
  setMode,
  resetWordIndex
} = wordsSlice.actions;

export default wordsSlice.reducer;

// 选择器
export const selectCurrentWords = (state) => state.words.currentWords;
export const selectReviewWords = (state) => state.words.reviewWords;
export const selectCurrentWord = (state) => state.words.currentWord;
export const selectCurrentIndex = (state) => state.words.currentIndex;
export const selectLoading = (state) => state.words.loading;
export const selectMode = (state) => ({
  isNewWordsMode: state.words.isNewWordsMode,
  isReviewMode: state.words.isReviewMode
});
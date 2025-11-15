import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_SETTINGS_KEY = '@user_settings';

// 异步操作
export const loadUserSettings = createAsyncThunk(
  'user/loadSettings',
  async () => {
    try {
      const settings = await AsyncStorage.getItem(USER_SETTINGS_KEY);
      return settings ? JSON.parse(settings) : getDefaultSettings();
    } catch (error) {
      console.error('加载用户设置失败:', error);
      return getDefaultSettings();
    }
  }
);

export const saveUserSettings = createAsyncThunk(
  'user/saveSettings',
  async (settings) => {
    try {
      await AsyncStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(settings));
      return settings;
    } catch (error) {
      console.error('保存用户设置失败:', error);
      throw error;
    }
  }
);

// 默认设置
function getDefaultSettings() {
  return {
    dailyGoal: 20,
    reminderEnabled: true,
    reminderTime: '19:00',
    soundEnabled: true,
    pronunciationType: 'US', // 'US' or 'UK'
    autoPlayAudio: true,
    showPronunciation: true,
    showExample: true,
    difficulty: 3, // 1-5
    theme: 'light', // 'light' or 'dark'
    language: 'zh-CN',
    studyReminders: {
      morning: '09:00',
      afternoon: '14:00',
      evening: '19:00'
    },
    learningMode: 'balanced', // 'conservative', 'balanced', 'aggressive'
    showStatistics: true,
    exportProgress: false
  };
}

const userSlice = createSlice({
  name: 'user',
  initialState: {
    settings: getDefaultSettings(),
    profile: {
      name: '文小豆',
      avatar: null,
      level: 'High School Grade 11',
      joinDate: new Date().toISOString(),
      studyDays: 0
    },
    achievements: [],
    notifications: [],
    loading: false,
    error: null
  },
  reducers: {
    updateSetting: (state, action) => {
      const { key, value } = action.payload;
      state.settings[key] = value;
    },
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    updateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    addAchievement: (state, action) => {
      const achievement = {
        id: Date.now(),
        ...action.payload,
        unlockedAt: new Date().toISOString()
      };

      // 检查是否已存在相同成就
      const exists = state.achievements.some(a => a.type === achievement.type);
      if (!exists) {
        state.achievements.push(achievement);
      }
    },
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        ...action.payload,
        timestamp: new Date().toISOString(),
        read: false
      };
      state.notifications.unshift(notification);

      // 最多保留50条通知
      if (state.notifications.length > 50) {
        state.notifications.pop();
      }
    },
    markNotificationAsRead: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    incrementStudyDays: (state) => {
      state.profile.studyDays += 1;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
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
      // loadUserSettings
      .addCase(loadUserSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUserSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(loadUserSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // saveUserSettings
      .addCase(saveUserSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveUserSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(saveUserSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const {
  updateSetting,
  updateSettings,
  updateProfile,
  addAchievement,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications,
  incrementStudyDays,
  setLoading,
  setError,
  clearError
} = userSlice.actions;

export default userSlice.reducer;

// 选择器
export const selectUserSettings = (state) => state.user.settings;
export const selectUserProfile = (state) => state.user.profile;
export const selectUserAchievements = (state) => state.user.achievements;
export const selectUserNotifications = (state) => state.user.notifications;
export const selectUnreadNotifications = (state) =>
  state.user.notifications.filter(notification => !notification.read);
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;

// 复合选择器
export const selectLearningPreferences = (state) => {
  const { settings } = state.user;
  return {
    dailyGoal: settings.dailyGoal,
    difficulty: settings.difficulty,
    learningMode: settings.learningMode,
    soundEnabled: settings.soundEnabled,
    autoPlayAudio: settings.autoPlayAudio,
    pronunciationType: settings.pronunciationType
  };
};

export const selectNotificationSettings = (state) => {
  const { settings } = state.user;
  return {
    reminderEnabled: settings.reminderEnabled,
    reminderTime: settings.reminderTime,
    studyReminders: settings.studyReminders
  };
};

export const selectDisplaySettings = (state) => {
  const { settings } = state.user;
  return {
    theme: settings.theme,
    language: settings.language,
    showPronunciation: settings.showPronunciation,
    showExample: settings.showExample,
    showStatistics: settings.showStatistics
  };
};
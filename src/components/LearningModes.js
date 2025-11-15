import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import Sound from 'react-native-sound';

// 启用音频播放
Sound.setCategory('Playback');

class LearningModes {
  constructor() {
    this.currentSound = null;
    this.responseStartTime = null;
    this.responseEndTime = null;
  }

  /**
   * 播放单词发音
   * @param {string} word - 要播放的单词
   * @param {string} pronunciationType - 发音类型 ('US' 或 'UK')
   */
  playWordAudio(word, pronunciationType = 'US') {
    try {
      // 停止之前的音频
      if (this.currentSound) {
        this.currentSound.stop();
        this.currentSound.release();
      }

      // 构建音频文件路径（实际项目中需要准备音频文件）
      const audioPath = pronunciationType === 'US'
        ? `audio/us/${word.toLowerCase()}.mp3`
        : `audio/uk/${word.toLowerCase()}.mp3`;

      // 播放音频（这里使用TTS作为备选）
      this.currentSound = new Sound(audioPath, Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.log('音频加载失败:', error);
          // 如果音频文件不存在，可以使用TTS API
          this.fallbackToTTS(word);
          return;
        }

        this.currentSound.play();
      });
    } catch (error) {
      console.error('音频播放失败:', error);
      this.fallbackToTTS(word);
    }
  }

  /**
   * TTS备选方案
   * @param {string} word - 要朗读的单词
   */
  fallbackToTTS(word) {
    // 在实际项目中，这里可以调用TTS API
    console.log('TTS朗读:', word);
    Alert.alert('语音提示', word);
  }

  /**
   * 开始计时响应时间
   */
  startResponseTimer() {
    this.responseStartTime = Date.now();
  }

  /**
   * 结束计时并返回响应时间
   * @returns {number} 响应时间（毫秒）
   */
  endResponseTimer() {
    this.responseEndTime = Date.now();
    const responseTime = this.responseEndTime - this.responseStartTime;
    this.responseStartTime = null;
    this.responseEndTime = null;
    return responseTime;
  }

  /**
   * 生成选择题选项
   * @param {Object} correctWord - 正确的单词对象
   * @param {Array} allWords - 所有单词列表
   * @param {number} optionsCount - 选项数量
   * @returns {Array} 选项数组
   */
  generateMultipleChoiceOptions(correctWord, allWords, optionsCount = 4) {
    const options = [{
      id: correctWord.id,
      text: correctWord.definition,
      isCorrect: true
    }];

    // 从其他单词中选择干扰项
    const availableWords = allWords.filter(word => word.id !== correctWord.id);
    const shuffled = this.shuffleArray(availableWords);

    for (let i = 0; i < optionsCount - 1 && i < shuffled.length; i++) {
      options.push({
        id: shuffled[i].id,
        text: shuffled[i].definition,
        isCorrect: false
      });
    }

    return this.shuffleArray(options);
  }

  /**
   * 生成拼写检查的干扰选项
   * @param {string} correctWord - 正确的单词
   * @returns {Array} 选项数组
   */
  generateSpellingOptions(correctWord) {
    const options = [correctWord];
    const variations = this.generateSpellingVariations(correctWord);

    // 添加一些变体作为干扰项
    for (let i = 0; i < Math.min(3, variations.length); i++) {
      options.push(variations[i]);
    }

    return this.shuffleArray(options);
  }

  /**
   * 生成拼写变体（常见拼写错误）
   * @param {string} word - 原单词
   * @returns {Array} 拼写变体数组
   */
  generateSpellingVariations(word) {
    const variations = [];

    // 常见的拼写错误模式
    const patterns = [
      // 双写字母
      () => word.replace(/([a-z])/, '$1$1'),
      // 删除字母
      () => word.slice(0, -1),
      () => word.slice(1),
      // 字母位置交换
      () => {
        if (word.length < 2) return word;
        const chars = word.split('');
        const i = Math.floor(Math.random() * (word.length - 1));
        [chars[i], chars[i + 1]] = [chars[i + 1], chars[i]];
        return chars.join('');
      },
      // 字母替换（相似的字母）
      () => word.replace(/[i]/g, 'l').replace(/[l]/g, 'i'),
      () => word.replace(/[c]/g, 'k').replace(/[k]/g, 'c'),
      () => word.replace(/[s]/g, 'z').replace(/[z]/g, 's'),
    ];

    patterns.forEach(pattern => {
      try {
        const variation = pattern();
        if (variation && variation !== word && variation.length > 2) {
          variations.push(variation);
        }
      } catch (error) {
        console.log('生成拼写变体失败:', error);
      }
    });

    return variations.slice(0, 3);
  }

  /**
   * 洗牌算法
   * @param {Array} array - 要洗牌的数组
   * @returns {Array} 洗牌后的数组
   */
  shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  /**
   * 评估答案并给出反馈
   * @param {string} userAnswer - 用户答案
   * @param {string} correctAnswer - 正确答案
   * @param {string} mode - 学习模式
   * @returns {Object} 评估结果
   */
  evaluateAnswer(userAnswer, correctAnswer, mode) {
    const normalizedUser = userAnswer.toLowerCase().trim();
    const normalizedCorrect = correctAnswer.toLowerCase().trim();

    let isCorrect = false;
    let score = 0;
    let feedback = '';

    switch (mode) {
      case 'spelling':
        isCorrect = normalizedUser === normalizedCorrect;
        score = isCorrect ? 100 : 0;
        feedback = this.getSpellingFeedback(normalizedUser, normalizedCorrect);
        break;

      case 'multiple_choice':
        // 选择题在用户选择时已经判断了正确性
        isCorrect = userAnswer === correctAnswer;
        score = isCorrect ? 100 : 0;
        feedback = isCorrect ? '回答正确！' : '答案不正确，再想想';
        break;

      case 'listening':
        // 听力题：判断拼写是否正确
        isCorrect = this.isSimilarSpelling(normalizedUser, normalizedCorrect);
        score = isCorrect ? 100 : 0;
        feedback = isCorrect ? '听力很好！拼写正确' : '拼写有误，请再听一遍';
        break;

      case 'definition':
        // 定义题：判断定义是否匹配
        isCorrect = this.isDefinitionMatch(userAnswer, correctAnswer);
        score = isCorrect ? 100 : this.getPartialScore(userAnswer, correctAnswer);
        feedback = this.getDefinitionFeedback(userAnswer, correctAnswer);
        break;

      default:
        isCorrect = normalizedUser === normalizedCorrect;
        score = isCorrect ? 100 : 0;
        feedback = isCorrect ? '正确！' : '错误';
    }

    return {
      isCorrect,
      score,
      feedback,
      similarity: this.calculateSimilarity(normalizedUser, normalizedCorrect)
    };
  }

  /**
   * 获取拼写反馈
   * @param {string} userAnswer - 用户答案
   * @param {string} correctAnswer - 正确答案
   * @returns {string} 反馈信息
   */
  getSpellingFeedback(userAnswer, correctAnswer) {
    if (userAnswer === correctAnswer) {
      return '拼写完全正确！';
    }

    if (userAnswer.length === correctAnswer.length) {
      const differences = this.findDifferences(userAnswer, correctAnswer);
      if (differences.length <= 1) {
        return '很接近了！只有一处错误';
      } else if (differences.length <= 2) {
        return '有少量错误，再仔细看看';
      }
    }

    if (Math.abs(userAnswer.length - correctAnswer.length) === 1) {
      return '字母数量不对，请检查';
    }

    return '拼写错误，正确答案是：' + correctAnswer;
  }

  /**
   * 查找两个字符串的差异
   * @param {string} str1 - 字符串1
   * @param {string} str2 - 字符串2
   * @returns {Array} 差异位置数组
   */
  findDifferences(str1, str2) {
    const differences = [];
    const minLength = Math.min(str1.length, str2.length);

    for (let i = 0; i < minLength; i++) {
      if (str1[i] !== str2[i]) {
        differences.push(i);
      }
    }

    return differences;
  }

  /**
   * 判断拼写是否相似
   * @param {string} word1 - 单词1
   * @param {string} word2 - 单词2
   * @returns {boolean} 是否相似
   */
  isSimilarSpelling(word1, word2) {
    const similarity = this.calculateSimilarity(word1, word2);
    return similarity >= 0.8; // 80%以上相似度认为正确
  }

  /**
   * 计算字符串相似度
   * @param {string} str1 - 字符串1
   * @param {string} str2 - 字符串2
   * @returns {number} 相似度 (0-1)
   */
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * 计算编辑距离
   * @param {string} str1 - 字符串1
   * @param {string} str2 - 字符串2
   * @returns {number} 编辑距离
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * 判断定义是否匹配
   * @param {string} userAnswer - 用户答案
   * @param {string} correctAnswer - 正确答案
   * @returns {boolean} 是否匹配
   */
  isDefinitionMatch(userAnswer, correctAnswer) {
    const userWords = userAnswer.toLowerCase().split(/[\s，,、]+/);
    const correctWords = correctAnswer.toLowerCase().split(/[\s，,、]+/);

    // 检查是否包含关键词汇
    const matchCount = userWords.filter(word =>
      correctWords.some(correctWord =>
        correctWord.includes(word) || word.includes(correctWord)
      )
    ).length;

    return matchCount >= Math.max(1, Math.floor(correctWords.length * 0.5));
  }

  /**
   * 获取部分得分
   * @param {string} userAnswer - 用户答案
   * @param {string} correctAnswer - 正确答案
   * @returns {number} 部分得分 (0-100)
   */
  getPartialScore(userAnswer, correctAnswer) {
    const similarity = this.calculateSimilarity(userAnswer, correctAnswer);
    return Math.round(similarity * 60); // 最高60分，鼓励完整回答
  }

  /**
   * 获取定义题反馈
   * @param {string} userAnswer - 用户答案
   * @param {string} correctAnswer - 正确答案
   * @returns {string} 反馈信息
   */
  getDefinitionFeedback(userAnswer, correctAnswer) {
    const similarity = this.calculateSimilarity(userAnswer, correctAnswer);

    if (similarity >= 0.9) {
      return '回答很准确！';
    } else if (similarity >= 0.7) {
      return '回答基本正确，可以更精确一些';
    } else if (similarity >= 0.5) {
      return '方向正确，但需要更准确的表达';
    } else {
      return `不正确。正确答案是：${correctAnswer}`;
    }
  }

  /**
   * 清理资源
   */
  cleanup() {
    if (this.currentSound) {
      this.currentSound.stop();
      this.currentSound.release();
      this.currentSound = null;
    }
  }
}

export default new LearningModes();
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  SafeAreaView,
  StatusBar,
  Alert,
  TextInput,
  ScrollView,
  Modal
} from 'react-native';
import { Card, Button, Icon, Overlay } from 'react-native-elements';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectCurrentWord,
  nextWord,
  previousWord,
  selectCurrentWords,
  selectMode
} from '../store/wordsSlice';
import {
  submitWordAnswer,
  startSession,
  endSession,
  selectCurrentStreak,
  selectSessionAccuracy
} from '../store/learningSlice';
import LearningModes from '../components/LearningModes';
import Sound from 'react-native-sound';

// 学习模式枚举
const LEARNING_MODES = {
  SPELLING: 'spelling',
  MULTIPLE_CHOICE: 'multiple_choice',
  LISTENING: 'listening',
  DEFINITION: 'definition'
};

const LearningScreen = ({ route, navigation }) => {
  const { mode, words } = route.params || {};
  const dispatch = useDispatch();
  const currentWord = useSelector(selectCurrentWord);
  const currentWords = useSelector(selectCurrentWords);
  const currentStreak = useSelector(selectCurrentStreak);
  const sessionAccuracy = useSelector(selectSessionAccuracy);
  const userSettings = useSelector((state) => state.user.settings);

  const [currentMode, setCurrentMode] = useState(LEARNING_MODES.SPELLING);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [options, setOptions] = useState([]);
  const [responseStartTime, setResponseStartTime] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [sessionProgress, setSessionProgress] = useState({
    current: 0,
    total: 0,
    correct: 0
  });

  // 动画值
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (mode && words) {
      initializeSession();
    }
  }, [mode, words]);

  useEffect(() => {
    if (currentWord) {
      prepareQuestion();
    }
  }, [currentWord]);

  const initializeSession = () => {
    dispatch(startSession({ sessionType: mode }));
    setSessionProgress({
      current: 0,
      total: words.length,
      correct: 0
    });
  };

  const prepareQuestion = () => {
    setShowAnswer(false);
    setUserAnswer('');
    setResponseStartTime(Date.now());

    // 随机选择学习模式
    const modes = Object.values(LEARNING_MODES);
    const randomMode = modes[Math.floor(Math.random() * modes.length)];
    setCurrentMode(randomMode);

    // 根据模式准备题目
    switch (randomMode) {
      case LEARNING_MODES.MULTIPLE_CHOICE:
        prepareMultipleChoice();
        break;
      case LEARNING_MODES.SPELLING:
        prepareSpelling();
        break;
      case LEARNING_MODES.LISTENING:
        prepareListening();
        break;
      case LEARNING_MODES.DEFINITION:
        prepareDefinition();
        break;
    }

    // 卡片翻转动画
    Animated.sequence([
      Animated.timing(flipAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(flipAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  };

  const prepareMultipleChoice = () => {
    if (!currentWord) return;
    const generatedOptions = LearningModes.generateMultipleChoiceOptions(
      currentWord,
      currentWords,
      4
    );
    setOptions(generatedOptions);
  };

  const prepareSpelling = () => {
    setOptions([]);
  };

  const prepareListening = () => {
    setOptions([]);
    // 自动播放音频
    setTimeout(() => {
      playWordAudio();
    }, 500);
  };

  const prepareDefinition = () => {
    setOptions([]);
  };

  const playWordAudio = () => {
    if (currentWord) {
      LearningModes.playWordAudio(currentWord.word, userSettings.pronunciationType);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentWord || !userAnswer.trim()) {
      Alert.alert('提示', '请输入答案');
      return;
    }

    const responseTime = responseStartTime ? Date.now() - responseStartTime : 0;

    // 评估答案
    let isCorrect = false;
    let answer = userAnswer;

    switch (currentMode) {
      case LEARNING_MODES.MULTIPLE_CHOICE:
        const selectedOption = options.find(opt => opt.text === userAnswer);
        isCorrect = selectedOption ? selectedOption.isCorrect : false;
        break;
      case LEARNING_MODES.SPELLING:
      case LEARNING_MODES.LISTENING:
        const result = LearningModes.evaluateAnswer(userAnswer, currentWord.word, currentMode);
        isCorrect = result.isCorrect;
        break;
      case LEARNING_MODES.DEFINITION:
        const definitionResult = LearningModes.evaluateAnswer(userAnswer, currentWord.definition, currentMode);
        isCorrect = definitionResult.isCorrect;
        break;
      default:
        isCorrect = userAnswer.toLowerCase().trim() === currentWord.word.toLowerCase();
    }

    // 提交答案
    try {
      await dispatch(submitWordAnswer({
        wordId: currentWord.id,
        isCorrect,
        responseTime
      })).unwrap();

      // 更新进度
      setSessionProgress(prev => ({
        ...prev,
        current: prev.current + 1,
        correct: isCorrect ? prev.correct + 1 : prev.correct
      }));

      // 显示结果
      setLastResult({
        isCorrect,
        userAnswer,
        correctAnswer: currentMode === LEARNING_MODES.MULTIPLE_CHOICE ?
          options.find(opt => opt.isCorrect)?.text :
          currentWord.word,
        feedback: getFeedback(isCorrect, currentMode),
        score: calculateScore(isCorrect, responseTime)
      });

      setShowResultModal(true);
      setShowAnswer(true);

    } catch (error) {
      console.error('提交答案失败:', error);
      Alert.alert('错误', '提交答案失败，请重试');
    }
  };

  const getFeedback = (isCorrect, mode) => {
    if (isCorrect) {
      const encouragements = [
        '太棒了！',
        '答对了！',
        '很好！',
        '继续保持！',
        '优秀！'
      ];
      return encouragements[Math.floor(Math.random() * encouragements.length)];
    } else {
      switch (mode) {
        case LEARNING_MODES.SPELLING:
          return '拼写不正确，再看看正确答案';
        case LEARNING_MODES.LISTENING:
          return '听力练习需要加强，多听几遍';
        case LEARNING_MODES.DEFINITION:
          return '理解不够准确，看看解释';
        default:
          return '答错了，正确答案是：';
      }
    }
  };

  const calculateScore = (isCorrect, responseTime) => {
    if (!isCorrect) return 0;

    // 根据响应时间计算得分
    let timeScore = 100;
    if (responseTime > 10000) timeScore = 60;  // 超过10秒
    else if (responseTime > 5000) timeScore = 80;  // 5-10秒
    else if (responseTime > 3000) timeScore = 90;  // 3-5秒

    return timeScore;
  };

  const handleNextWord = () => {
    setShowResultModal(false);
    dispatch(nextWord());

    // 检查是否完成所有单词
    if (sessionProgress.current >= sessionProgress.total - 1) {
      completeSession();
    }
  };

  const handlePreviousWord = () => {
    dispatch(previousWord());
  };

  const completeSession = () => {
    dispatch(endSession());
    Alert.alert(
      '学习完成',
      `恭喜完成本次学习！\n正确率：${sessionAccuracy}%\n连续答对：${currentStreak}次`,
      [
        { text: '查看统计', onPress: () => navigation.navigate('Statistics') },
        { text: '返回首页', onPress: () => navigation.navigate('Home') }
      ]
    );
  };

  const renderQuestion = () => {
    switch (currentMode) {
      case LEARNING_MODES.MULTIPLE_CHOICE:
        return renderMultipleChoice();
      case LEARNING_MODES.SPELLING:
        return renderSpelling();
      case LEARNING_MODES.LISTENING:
        return renderListening();
      case LEARNING_MODES.DEFINITION:
        return renderDefinition();
      default:
        return renderSpelling();
    }
  };

  const renderMultipleChoice = () => (
    <View style={styles.questionContainer}>
      <Text style={styles.questionTitle}>选择正确的释义</Text>
      <View style={styles.wordDisplay}>
        <Text style={styles.wordText}>{currentWord?.word}</Text>
        <TouchableOpacity style={styles.audioButton} onPress={playWordAudio}>
          <Icon name="volume-up" type="font-awesome" color="#3498db" size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={option.id || index}
            style={[
              styles.optionButton,
              userAnswer === option.text && styles.selectedOption
            ]}
            onPress={() => setUserAnswer(option.text)}
          >
            <Text style={[
              styles.optionText,
              userAnswer === option.text && styles.selectedOptionText
            ]}>
              {option.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSpelling = () => (
    <View style={styles.questionContainer}>
      <Text style={styles.questionTitle}>拼写这个单词</Text>
      <View style={styles.wordDisplay}>
        <Text style={styles.definitionText}>{currentWord?.definition}</Text>
        <Text style={styles.exampleText}>例句：{currentWord?.example}</Text>
      </View>

      <TextInput
        style={styles.textInput}
        placeholder="请输入单词拼写"
        value={userAnswer}
        onChangeText={setUserAnswer}
        autoCapitalize="none"
        autoCorrect={false}
        onSubmitEditing={handleSubmitAnswer}
      />
    </View>
  );

  const renderListening = () => (
    <View style={styles.questionContainer}>
      <Text style={styles.questionTitle}>听音拼写</Text>
      <View style={styles.listeningContainer}>
        <TouchableOpacity style={styles.playButton} onPress={playWordAudio}>
          <Icon name="volume-up" type="font-awesome" color="white" size={40} />
        </TouchableOpacity>
        <Text style={styles.listenInstruction}>点击播放单词发音</Text>
        <Text style={styles.listenHint}>仔细听，然后拼写出来</Text>
      </View>

      <TextInput
        style={styles.textInput}
        placeholder="请输入听到的单词"
        value={userAnswer}
        onChangeText={setUserAnswer}
        autoCapitalize="none"
        autoCorrect={false}
        onSubmitEditing={handleSubmitAnswer}
      />
    </View>
  );

  const renderDefinition = () => (
    <View style={styles.questionContainer}>
      <Text style={styles.questionTitle}>根据单词写出释义</Text>
      <View style={styles.wordDisplay}>
        <Text style={styles.wordText}>{currentWord?.word}</Text>
        <TouchableOpacity style={styles.audioButton} onPress={playWordAudio}>
          <Icon name="volume-up" type="font-awesome" color="#3498db" size={20} />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.textInput}
        style={styles.definitionInput}
        placeholder="请输入单词的中文释义"
        value={userAnswer}
        onChangeText={setUserAnswer}
        multiline
        numberOfLines={3}
        onSubmitEditing={handleSubmitAnswer}
      />
    </View>
  );

  const renderResultModal = () => (
    <Overlay
      isVisible={showResultModal}
      onBackdropPress={() => setShowResultModal(false)}
      overlayStyle={styles.resultOverlay}
    >
      <View style={styles.resultContainer}>
        <Icon
          name={lastResult?.isCorrect ? "check-circle" : "times-circle"}
          type="font-awesome"
          color={lastResult?.isCorrect ? "#2ecc71" : "#e74c3c"}
          size={60}
        />
        <Text style={[
          styles.resultText,
          { color: lastResult?.isCorrect ? "#2ecc71" : "#e74c3c" }
        ]}>
          {lastResult?.feedback}
        </Text>

        {lastResult && !lastResult.isCorrect && (
          <View style={styles.correctAnswerContainer}>
            <Text style={styles.correctAnswerLabel}>正确答案：</Text>
            <Text style={styles.correctAnswerText}>{lastResult.correctAnswer}</Text>
          </View>
        )}

        {lastResult && (
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>得分：{lastResult.score}</Text>
          </View>
        )}

        <View style={styles.resultButtons}>
          <Button
            title="下一个"
            onPress={handleNextWord}
            buttonStyle={styles.nextButton}
            containerStyle={styles.buttonContainer}
          />
        </View>
      </View>
    </Overlay>
  );

  if (!currentWord) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>加载中...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" type="font-awesome" color="#2c3e50" size={24} />
        </TouchableOpacity>

        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {sessionProgress.current + 1}/{sessionProgress.total}
          </Text>
          <Text style={styles.streakText}>
            连续答对: {currentStreak}
          </Text>
        </View>

        <TouchableOpacity onPress={completeSession}>
          <Icon name="stop" type="font-awesome" color="#e74c3c" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((sessionProgress.current + 1) / sessionProgress.total) * 100}%` }
          ]}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.cardContainer,
            {
              transform: [
                {
                  rotateY: flipAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Card containerStyle={styles.wordCard}>
            {renderQuestion()}
          </Card>
        </Animated.View>

        {showAnswer && currentWord && (
          <Card containerStyle={styles.answerCard}>
            <Text style={styles.answerTitle}>详细信息</Text>
            <Text style={styles.pronunciationText}>
              音标: {currentWord.pronunciation}
            </Text>
            <Text style={styles.definitionText}>
              释义: {currentWord.definition}
            </Text>
            <Text style={styles.exampleText}>
              例句: {currentWord.example}
            </Text>
          </Card>
        )}

        <View style={styles.actionButtons}>
          <Button
            title="上一题"
            onPress={handlePreviousWord}
            disabled={sessionProgress.current === 0}
            buttonStyle={styles.previousButton}
            containerStyle={styles.buttonContainer}
          />
          <Button
            title="提交答案"
            onPress={handleSubmitAnswer}
            disabled={!userAnswer.trim()}
            buttonStyle={styles.submitButton}
            containerStyle={styles.buttonContainer}
          />
        </View>
      </ScrollView>

      {renderResultModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    elevation: 2,
  },
  progressInfo: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  streakText: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#ecf0f1',
    marginHorizontal: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498db',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  cardContainer: {
    marginBottom: 20,
  },
  wordCard: {
    borderRadius: 15,
    elevation: 3,
    padding: 20,
    minHeight: 300,
  },
  answerCard: {
    borderRadius: 15,
    elevation: 3,
    backgroundColor: '#ecf0f1',
  },
  questionContainer: {
    flex: 1,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
  },
  wordDisplay: {
    alignItems: 'center',
    marginBottom: 30,
  },
  wordText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 10,
  },
  audioButton: {
    marginTop: 10,
  },
  definitionText: {
    fontSize: 18,
    color: '#2c3e50',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 15,
  },
  exampleText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  optionsContainer: {
    marginTop: 20,
  },
  optionButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  optionText: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#fff',
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    marginTop: 20,
  },
  definitionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  listeningContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  listenInstruction: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 10,
  },
  listenHint: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  previousButton: {
    backgroundColor: '#95a5a6',
  },
  submitButton: {
    backgroundColor: '#2ecc71',
  },
  resultOverlay: {
    width: '80%',
    borderRadius: 20,
    padding: 30,
  },
  resultContainer: {
    alignItems: 'center',
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  correctAnswerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  correctAnswerLabel: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 5,
  },
  correctAnswerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
  },
  scoreContainer: {
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 16,
    color: '#f39c12',
    fontWeight: 'bold',
  },
  resultButtons: {
    width: '100%',
  },
  nextButton: {
    backgroundColor: '#3498db',
  },
  answerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  pronunciationText: {
    fontSize: 16,
    color: '#3498db',
    marginBottom: 10,
  },
});

export default LearningScreen;
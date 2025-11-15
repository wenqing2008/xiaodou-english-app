import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView
} from 'react-native';
import { Card, Button, Icon, Progress } from 'react-native-elements';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWordsByDifficulty } from '../store/wordsSlice';

const TestScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [questions, setQuestions] = useState([]);

  const totalQuestions = 20;

  useEffect(() => {
    // 这里应该生成测试题目
    generateTestQuestions();
  }, []);

  const generateTestQuestions = async () => {
    try {
      // 模拟生成测试题目
      const mockQuestions = [
        {
          id: 1,
          question: '选择 "abandon" 的正确释义',
          options: ['放弃，抛弃', '接受，同意', '实现，达到', '吸收；吸引注意力'],
          correctAnswer: 0,
          type: 'multiple_choice'
        },
        {
          id: 2,
          question: '拼写单词：/əˈbɪləti/',
          correctAnswer: 'ability',
          type: 'spelling'
        },
        {
          id: 3,
          question: '选择与 "happy" 意思相近的词',
          options: ['sad', 'angry', 'joyful', 'tired'],
          correctAnswer: 2,
          type: 'synonym'
        }
      ];

      setQuestions(mockQuestions);
    } catch (error) {
      console.error('生成测试题目失败:', error);
    }
  };

  const startTest = () => {
    setTestStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setAnswers([]);
    setShowResult(false);
    setTestCompleted(false);
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSpellingAnswer = (spelling) => {
    setSelectedAnswer(spelling);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) {
      Alert.alert('提示', '请选择答案');
      return;
    }

    const isCorrect = checkAnswer(selectedAnswer);
    const newScore = isCorrect ? score + 1 : score;

    setScore(newScore);
    setAnswers([...answers, {
      questionId: questions[currentQuestion].id,
      selectedAnswer,
      isCorrect
    }]);

    setShowResult(true);
  };

  const checkAnswer = (answer) => {
    const question = questions[currentQuestion];
    if (question.type === 'multiple_choice' || question.type === 'synonym') {
      return answer === question.correctAnswer;
    } else if (question.type === 'spelling') {
      return answer.toLowerCase() === question.correctAnswer.toLowerCase();
    }
    return false;
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      completeTest();
    }
  };

  const completeTest = () => {
    setTestCompleted(true);
  };

  const retakeTest = () => {
    startTest();
  };

  const goHome = () => {
    navigation.navigate('Home');
  };

  const renderQuestion = () => {
    const question = questions[currentQuestion];
    if (!question) return null;

    switch (question.type) {
      case 'multiple_choice':
        return renderMultipleChoiceQuestion(question);
      case 'spelling':
        return renderSpellingQuestion(question);
      case 'synonym':
        return renderSynonymQuestion(question);
      default:
        return renderMultipleChoiceQuestion(question);
    }
  };

  const renderMultipleChoiceQuestion = (question) => (
    <View style={styles.questionContainer}>
      <Text style={styles.questionText}>{question.question}</Text>
      <View style={styles.optionsContainer}>
        {question.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedAnswer === index && styles.selectedOption,
              showResult && index === question.correctAnswer && styles.correctOption,
              showResult && selectedAnswer === index && !checkAnswer(selectedAnswer) && styles.wrongOption
            ]}
            onPress={() => handleAnswerSelect(index)}
            disabled={showResult}
          >
            <Text style={[
              styles.optionText,
              selectedAnswer === index && styles.selectedOptionText
            ]}>
              {String.fromCharCode(65 + index)}. {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSpellingQuestion = (question) => (
    <View style={styles.questionContainer}>
      <Text style={styles.questionText}>听音拼写</Text>
      <Text style={styles.pronunciationText}>{question.question}</Text>
      <TouchableOpacity style={styles.playButton}>
        <Icon name="volume-up" type="font-awesome" color="white" size={30} />
      </TouchableOpacity>
      <Text style={styles.spellingInstruction}>请输入听到的单词：</Text>
      {/* 这里应该有一个输入框 */}
    </View>
  );

  const renderSynonymQuestion = (question) => (
    <View style={styles.questionContainer}>
      <Text style={styles.questionText}>{question.question}</Text>
      <View style={styles.optionsContainer}>
        {question.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedAnswer === index && styles.selectedOption,
              showResult && index === question.correctAnswer && styles.correctOption,
              showResult && selectedAnswer === index && !checkAnswer(selectedAnswer) && styles.wrongOption
            ]}
            onPress={() => handleAnswerSelect(index)}
            disabled={showResult}
          >
            <Text style={[
              styles.optionText,
              selectedAnswer === index && styles.selectedOptionText
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTestStart = () => (
    <View style={styles.startContainer}>
      <Icon name="graduation-cap" type="font-awesome" color="#3498db" size={80" />
      <Text style={styles.startTitle}>词汇测试</Text>
      <Text style={styles.startDescription}>
        测试你的英语词汇掌握程度
      </Text>
      <Text style={styles.testInfo}>
        共 {totalQuestions} 道题目 • 包含选择题、拼写题等
      </Text>
      <Button
        title="开始测试"
        onPress={startTest}
        buttonStyle={styles.startButton}
        containerStyle={styles.startButtonContainer}
      />
    </View>
  );

  const renderTestInProgress = () => (
    <View style={styles.testContainer}>
      {/* 进度条 */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          第 {currentQuestion + 1} / {questions.length} 题
        </Text>
        <Progress
          value={((currentQuestion + 1) / questions.length) * 100}
          width={null}
          color="#3498db"
          height={8}
        />
      </View>

      {/* 题目内容 */}
      <Card containerStyle={styles.questionCard}>
        {renderQuestion()}
      </Card>

      {/* 答题结果 */}
      {showResult && (
        <Card containerStyle={styles.resultCard}>
          <View style={styles.resultContent}>
            <Icon
              name={checkAnswer(selectedAnswer) ? "check-circle" : "times-circle"}
              type="font-awesome"
              color={checkAnswer(selectedAnswer) ? "#2ecc71" : "#e74c3c"}
              size={30}
            />
            <Text style={[
              styles.resultText,
              { color: checkAnswer(selectedAnswer) ? "#2ecc71" : "#e74c3c" }
            ]}>
              {checkAnswer(selectedAnswer) ? '回答正确！' : '回答错误'}
            </Text>
            {!checkAnswer(selectedAnswer) && (
              <Text style={styles.correctAnswerText}>
                正确答案：{questions[currentQuestion].options[questions[currentQuestion].correctAnswer]}
              </Text>
            )}
          </View>
        </Card>
      )}

      {/* 操作按钮 */}
      <View style={styles.actionButtons}>
        {!showResult ? (
          <Button
            title="提交答案"
            onPress={submitAnswer}
            disabled={selectedAnswer === null}
            buttonStyle={styles.submitButton}
            containerStyle={styles.buttonContainer}
          />
        ) : (
          <Button
            title={currentQuestion < questions.length - 1 ? '下一题' : '完成测试'}
            onPress={nextQuestion}
            buttonStyle={styles.nextButton}
            containerStyle={styles.buttonContainer}
          />
        )}
      </View>
    </View>
  );

  const renderTestCompleted = () => (
    <View style={styles.completionContainer}>
      <Icon
        name={score >= questions.length * 0.8 ? "trophy" : "graduation-cap"}
        type="font-awesome"
        color={score >= questions.length * 0.8 ? "#f39c12" : "#3498db"}
        size={80}
      />
      <Text style={styles.completionTitle}>测试完成！</Text>
      <Text style={styles.completionScore}>
        {score} / {questions.length} 分
      </Text>
      <Text style={styles.completionPercentage}>
        正确率：{Math.round((score / questions.length) * 100)}%
      </Text>

      <View style={styles.performanceLevel}>
        <Text style={styles.performanceTitle}>表现评价：</Text>
        <Text style={[
          styles.performanceText,
          { color: score >= questions.length * 0.8 ? '#2ecc71' :
                  score >= questions.length * 0.6 ? '#f39c12' : '#e74c3c' }
        ]}>
          {score >= questions.length * 0.8 ? '优秀' :
           score >= questions.length * 0.6 ? '良好' : '需要加强'}
        </Text>
      </View>

      <View style={styles.completionActions}>
        <Button
          title="重新测试"
          onPress={retakeTest}
          buttonStyle={styles.retakeButton}
          containerStyle={styles.completionButtonContainer}
        />
        <Button
          title="返回首页"
          onPress={goHome}
          buttonStyle={styles.homeButton}
          containerStyle={styles.completionButtonContainer}
        />
      </View>
    </View>
  );

  if (!testStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderTestStart()}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (testCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderTestCompleted()}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderTestInProgress()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  startContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 10,
  },
  startDescription: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
  },
  testInfo: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 40,
    paddingVertical: 15,
  },
  startButtonContainer: {
    width: 200,
  },
  testContainer: {
    flex: 1,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  questionCard: {
    borderRadius: 15,
    elevation: 3,
    marginBottom: 20,
  },
  questionContainer: {
    padding: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsContainer: {
    marginTop: 10,
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
  correctOption: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  wrongOption: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
  },
  optionText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  selectedOptionText: {
    color: '#fff',
  },
  resultCard: {
    borderRadius: 15,
    elevation: 3,
    marginBottom: 20,
  },
  resultContent: {
    alignItems: 'center',
    padding: 20,
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  correctAnswerText: {
    fontSize: 14,
    color: '#2c3e50',
    textAlign: 'center',
  },
  actionButtons: {
    marginTop: 20,
  },
  buttonContainer: {
    width: '100%',
  },
  submitButton: {
    backgroundColor: '#2ecc71',
  },
  nextButton: {
    backgroundColor: '#3498db',
  },
  completionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 10,
  },
  completionScore: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 5,
  },
  completionPercentage: {
    fontSize: 18,
    color: '#7f8c8d',
    marginBottom: 30,
  },
  performanceLevel: {
    alignItems: 'center',
    marginBottom: 40,
  },
  performanceTitle: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 5,
  },
  performanceText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  completionActions: {
    width: '100%',
  },
  completionButtonContainer: {
    marginVertical: 10,
  },
  retakeButton: {
    backgroundColor: '#3498db',
  },
  homeButton: {
    backgroundColor: '#95a5a6',
  },
  pronunciationText: {
    fontSize: 24,
    color: '#3498db',
    textAlign: 'center',
    marginBottom: 20,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  spellingInstruction: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
  },
});

export default TestScreen;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
  Animated,
  Dimensions
} from 'react-native';
import { Card, Button, Icon } from 'react-native-elements';

const { width, height } = Dimensions.get('window');

const GameScreen = ({ navigation }) => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);

  const games = [
    {
      id: 'word_match',
      title: '单词配对',
      description: '将单词与对应的释义配对',
      icon: 'puzzle-piece',
      color: '#3498db',
      difficulty: '简单'
    },
    {
      id: 'spelling_bee',
      title: '拼写大赛',
      description: '根据发音和释义拼写单词',
      icon: 'spell-check',
      color: '#9b59b6',
      difficulty: '中等'
    },
    {
      id: 'word_rush',
      title: '单词冲刺',
      description: '限时内回答尽可能多的单词',
      icon: 'rocket',
      color: '#e74c3c',
      difficulty: '困难'
    },
    {
      id: 'memory_cards',
      title: '记忆卡片',
      description: '翻转卡片找到配对的单词',
      icon: 'clone',
      color: '#2ecc71',
      difficulty: '简单'
    }
  ];

  const startGame = (game) => {
    setSelectedGame(game);
    setGameStarted(true);
    setScore(0);
    setLevel(1);
    setLives(3);
    setTimeLeft(60);
  };

  const exitGame = () => {
    Alert.alert(
      '退出游戏',
      '确定要退出当前游戏吗？',
      [
        { text: '取消', style: 'cancel' },
        { text: '确定', onPress: () => {
          setGameStarted(false);
          setSelectedGame(null);
        }}
      ]
    );
  };

  const renderGameSelection = () => (
    <View style={styles.gameSelectionContainer}>
      <Text style={styles.title}>单词游戏</Text>
      <Text style={styles.subtitle}>通过游戏学习英语单词</Text>

      <ScrollView style={styles.gamesList} showsVerticalScrollIndicator={false}>
        {games.map((game) => (
          <TouchableOpacity
            key={game.id}
            style={[styles.gameCard, { borderLeftColor: game.color }]}
            onPress={() => startGame(game)}
          >
            <View style={styles.gameHeader}>
              <Icon
                name={game.icon}
                type="font-awesome"
                color={game.color}
                size={24}
              />
              <View style={styles.gameInfo}>
                <Text style={styles.gameTitle}>{game.title}</Text>
                <Text style={styles.gameDifficulty}>难度：{game.difficulty}</Text>
              </View>
            </View>
            <Text style={styles.gameDescription}>{game.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderWordMatchGame = () => {
    const [words, setWords] = useState([]);
    const [selectedCards, setSelectedCards] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);

    return (
      <View style={styles.gameContainer}>
        <View style={styles.gameHeader}>
          <Text style={styles.gameTitle}>单词配对</Text>
          <View style={styles.gameStats}>
            <Text style={styles.statText}>得分: {score}</Text>
            <Text style={styles.statText}>关卡: {level}</Text>
            <TouchableOpacity onPress={exitGame}>
              <Icon name="times" type="font-awesome" color="#e74c3c" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <Card containerStyle={styles.gameCard}>
          <Text style={styles.gameInstruction}>
            找到单词与释义的配对
          </Text>

          <View style={styles.cardsGrid}>
            {/* 这里应该渲染实际的卡片 */}
            <View style={styles.placeholderCards}>
              <Text style={styles.placeholderText}>
                游戏内容正在开发中...
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.gameControls}>
          <Button
            title="重新开始"
            onPress={() => {
              setScore(0);
              setLevel(1);
              setSelectedCards([]);
              setMatchedPairs([]);
            }}
            buttonStyle={styles.controlButton}
          />
        </View>
      </View>
    );
  };

  const renderSpellingBeeGame = () => (
    <View style={styles.gameContainer}>
      <View style={styles.gameHeader}>
        <Text style={styles.gameTitle}>拼写大赛</Text>
        <View style={styles.gameStats}>
          <Text style={styles.statText}>得分: {score}</Text>
          <Text style={styles.statText}>生命: {'❤️'.repeat(lives)}</Text>
          <TouchableOpacity onPress={exitGame}>
            <Icon name="times" type="font-awesome" color="#e74c3c" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <Card containerStyle={styles.gameCard}>
        <Text style={styles.gameInstruction}>
          根据发音和释义拼写单词
        </Text>

        <View style={styles.spellingArea}>
          <TouchableOpacity style={styles.playButton}>
            <Icon name="volume-up" type="font-awesome" color="white" size={30} />
          </TouchableOpacity>
          <Text style={styles.wordDefinition}>
            放弃，抛弃
          </Text>
          <Text style={styles.spellingHint}>
            例句：They had to abandon their car in the snow.
          </Text>
          <View style={styles.spellingInput}>
            <Text style={styles.inputPlaceholder}>
              请输入单词拼写...
            </Text>
          </View>
        </View>
      </Card>

      <View style={styles.gameControls}>
        <Button
          title="提交答案"
          buttonStyle={styles.submitButton}
        />
      </View>
    </View>
  );

  const renderWordRushGame = () => (
    <View style={styles.gameContainer}>
      <View style={styles.gameHeader}>
        <Text style={styles.gameTitle}>单词冲刺</Text>
        <View style={styles.gameStats}>
          <Text style={styles.statText}>得分: {score}</Text>
          <Text style={styles.statText}>时间: {timeLeft}s</Text>
          <TouchableOpacity onPress={exitGame}>
            <Icon name="times" type="font-awesome" color="#e74c3c" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <Card containerStyle={styles.gameCard}>
        <Text style={styles.gameInstruction}>
          快速选择正确的释义！
        </Text>

        <View style={styles.rushArea}>
          <Text style={styles.rushWord}>achieve</Text>
          <View style={styles.rushOptions}>
            <TouchableOpacity style={styles.rushOption}>
              <Text style={styles.rushOptionText}>实现，达到</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rushOption}>
              <Text style={styles.rushOptionText}>放弃，抛弃</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rushOption}>
              <Text style={styles.rushOptionText}>接受，同意</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rushOption}>
              <Text style={styles.rushOptionText}>吸收；吸引</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${(timeLeft / 60) * 100}%` }]} />
      </View>
    </View>
  );

  const renderMemoryCardsGame = () => (
    <View style={styles.gameContainer}>
      <View style={styles.gameHeader}>
        <Text style={styles.gameTitle}>记忆卡片</Text>
        <View style={styles.gameStats}>
          <Text style={styles.statText}>得分: {score}</Text>
          <Text style={styles.statText}>翻牌: {score * 2}</Text>
          <TouchableOpacity onPress={exitGame}>
            <Icon name="times" type="font-awesome" color="#e74c3c" size={20" />
          </TouchableOpacity>
        </View>
      </View>

      <Card containerStyle={styles.gameCard}>
        <Text style={styles.gameInstruction}>
          翻转卡片找到配对的单词
        </Text>

        <View style={styles.memoryGrid}>
          {/* 这里应该渲染记忆卡片网格 */}
          <View style={styles.placeholderCards}>
            <Text style={styles.placeholderText}>
              记忆游戏正在开发中...
            </Text>
          </View>
        </View>
      </Card>
    </View>
  );

  const renderGame = () => {
    if (!selectedGame) return renderGameSelection();

    switch (selectedGame.id) {
      case 'word_match':
        return renderWordMatchGame();
      case 'spelling_bee':
        return renderSpellingBeeGame();
      case 'word_rush':
        return renderWordRushGame();
      case 'memory_cards':
        return renderMemoryCardsGame();
      default:
        return renderGameSelection();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderGame()}
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
  gameSelectionContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
  },
  gamesList: {
    flex: 1,
  },
  gameCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    borderLeftWidth: 4,
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  gameInfo: {
    flex: 1,
    marginLeft: 15,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  gameDifficulty: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  gameDescription: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  gameContainer: {
    flex: 1,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  gameStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginRight: 20,
  },
  gameInstruction: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 20,
  },
  placeholderCards: {
    alignItems: 'center',
    padding: 40,
  },
  placeholderText: {
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
  },
  gameControls: {
    marginTop: 20,
  },
  controlButton: {
    backgroundColor: '#3498db',
  },
  spellingArea: {
    alignItems: 'center',
    marginVertical: 20,
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
  wordDefinition: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 15,
  },
  spellingHint: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  spellingInput: {
    width: '100%',
    height: 50,
    backgroundColor: '#ecf0f1',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputPlaceholder: {
    fontSize: 16,
    color: '#95a5a6',
  },
  submitButton: {
    backgroundColor: '#2ecc71',
  },
  rushArea: {
    alignItems: 'center',
    marginVertical: 20,
  },
  rushWord: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 20,
  },
  rushOptions: {
    width: '100%',
  },
  rushOption: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  rushOptionText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#e74c3c',
  },
  memoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 20',
  },
});

export default GameScreen;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { Card, Button, Icon, SearchBar } from 'react-native-elements';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWordsByDifficulty } from '../store/wordsSlice';

const WordListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);

  const difficulties = [
    { key: 'all', label: '全部', color: '#95a5a6' },
    { key: 1, label: '简单', color: '#2ecc71' },
    { key: 2, label: '较简单', color: '#3498db' },
    { key: 3, label: '中等', color: '#f39c12' },
    { key: 4, label: '较难', color: '#e67e22' },
    { key: 5, label: '困难', color: '#e74c3c' }
  ];

  useEffect(() => {
    loadWords();
  }, [selectedDifficulty]);

  const loadWords = async () => {
    setLoading(true);
    try {
      let result;
      if (selectedDifficulty === 'all') {
        // 这里应该有一个获取所有单词的方法
        result = [];
      } else {
        result = await dispatch(fetchWordsByDifficulty({
          difficulty: parseInt(selectedDifficulty),
          limit: 100
        })).unwrap();
      }
      setWords(result);
    } catch (error) {
      console.error('加载单词列表失败:', error);
      Alert.alert('错误', '加载单词列表失败');
    } finally {
      setLoading(false);
    }
  };

  const filteredWords = words.filter(word =>
    word.word.toLowerCase().includes(searchText.toLowerCase()) ||
    word.definition.toLowerCase().includes(searchText.toLowerCase())
  );

  const getDifficultyColor = (difficulty) => {
    const difficultyConfig = difficulties.find(d => d.key === difficulty);
    return difficultyConfig ? difficultyConfig.color : '#95a5a6';
  };

  const renderWordItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.wordItem}
      onPress={() => {
        navigation.navigate('WordDetail', { word: item });
      }}
    >
      <View style={styles.wordHeader}>
        <Text style={styles.wordText}>{item.word}</Text>
        <View
          style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor(item.difficulty) }
          ]}
        >
          <Text style={styles.difficultyText}>{item.difficulty}</Text>
        </View>
      </View>

      <Text style={styles.pronunciationText}>{item.pronunciation}</Text>
      <Text style={styles.definitionText}>{item.definition}</Text>
      <Text style={styles.exampleText}>例句：{item.example}</Text>

      <View style={styles.wordFooter}>
        <Icon name="volume-up" type="font-awesome" color="#3498db" size={16} />
        <Text style={styles.frequencyText}>频率：{item.frequency}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>选择难度</Text>

          {difficulties.map((difficulty) => (
            <TouchableOpacity
              key={difficulty.key}
              style={[
                styles.difficultyOption,
                selectedDifficulty === difficulty.key && styles.selectedDifficulty,
                { borderLeftColor: difficulty.color }
              ]}
              onPress={() => {
                setSelectedDifficulty(difficulty.key);
                setShowFilterModal(false);
              }}
            >
              <View
                style={[
                  styles.difficultyDot,
                  { backgroundColor: difficulty.color }
                ]}
              />
              <Text style={styles.difficultyOptionText}>
                {difficulty.label}
              </Text>
              {selectedDifficulty === difficulty.key && (
                <Icon name="check" type="font-awesome" color="#3498db" size={16} />
              )}
            </TouchableOpacity>
          ))}

          <Button
            title="取消"
            type="clear"
            onPress={() => setShowFilterModal(false)}
            buttonStyle={styles.cancelButton}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      {/* 搜索栏 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="搜索单词或释义..."
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Icon name="filter" type="font-awesome" color="#3498db" size={20} />
        </TouchableOpacity>
      </View>

      {/* 难度指示器 */}
      <View style={styles.difficultyIndicator}>
        <Text style={styles.difficultyIndicatorText}>
          当前难度：{difficulties.find(d => d.key === selectedDifficulty)?.label}
        </Text>
      </View>

      {/* 单词列表 */}
      <FlatList
        data={filteredWords}
        renderItem={renderWordItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadWords}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="search" type="font-awesome" color="#95a5a6" size={40} />
            <Text style={styles.emptyText}>暂无单词数据</Text>
          </View>
        }
      />

      {renderFilterModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#ecf0f1',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  filterButton: {
    marginLeft: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyIndicator: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  difficultyIndicatorText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  wordItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  wordText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  difficultyText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  pronunciationText: {
    fontSize: 14,
    color: '#3498db',
    marginBottom: 8,
  },
  definitionText: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 8,
    lineHeight: 22,
  },
  exampleText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  wordFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  frequencyText: {
    fontSize: 12,
    color: '#95a5a6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  difficultyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    borderLeftWidth: 4,
  },
  selectedDifficulty: {
    backgroundColor: '#ecf0f1',
  },
  difficultyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 15,
  },
  difficultyOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
  },
  cancelButton: {
    marginTop: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
    marginTop: 15,
  },
});

export default WordListScreen;
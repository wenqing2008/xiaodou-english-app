import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

class DatabaseManager {
  constructor() {
    this.database = null;
  }

  async initDatabase() {
    try {
      this.database = await SQLite.openDatabase({
        name: 'XiaoDouEnglish.db',
        location: 'default',
      });

      await this.createTables();
      await this.loadInitialData();

      console.log('数据库初始化成功');
      return this.database;
    } catch (error) {
      console.error('数据库初始化失败:', error);
      throw error;
    }
  }

  async createTables() {
    const createWordsTable = `
      CREATE TABLE IF NOT EXISTS words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT NOT NULL UNIQUE,
        pronunciation TEXT,
        definition TEXT NOT NULL,
        example TEXT,
        difficulty INTEGER DEFAULT 1,
        frequency INTEGER DEFAULT 1,
        synonyms TEXT,
        audio_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createLearningRecordsTable = `
      CREATE TABLE IF NOT EXISTS learning_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word_id INTEGER NOT NULL,
        study_date DATE NOT NULL,
        review_count INTEGER DEFAULT 0,
        correct_count INTEGER DEFAULT 0,
        last_review_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        next_review_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        memory_strength INTEGER DEFAULT 0,
        learning_status TEXT DEFAULT 'new',
        FOREIGN KEY (word_id) REFERENCES words (id)
      );
    `;

    const createUserSettingsTable = `
      CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        daily_goal INTEGER DEFAULT 20,
        reminder_enabled BOOLEAN DEFAULT 1,
        reminder_time TEXT DEFAULT '19:00',
        sound_enabled BOOLEAN DEFAULT 1,
        pronunciation_type TEXT DEFAULT 'US',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createStudySessionTable = `
      CREATE TABLE IF NOT EXISTS study_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_date DATE NOT NULL,
        start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        end_time DATETIME,
        words_studied INTEGER DEFAULT 0,
        correct_answers INTEGER DEFAULT 0,
        total_answers INTEGER DEFAULT 0,
        session_type TEXT NOT NULL
      );
    `;

    await this.database.executeSql(createWordsTable);
    await this.database.executeSql(createLearningRecordsTable);
    await this.database.executeSql(createUserSettingsTable);
    await this.database.executeSql(createStudySessionTable);
  }

  async loadInitialData() {
    // 检查是否已有数据
    const [results] = await this.database.executeSql('SELECT COUNT(*) as count FROM words');
    const count = results.rows.item(0).count;

    if (count === 0) {
      console.log('加载初始单词数据...');
      await this.loadHighSchoolWords();
    }
  }

  async loadHighSchoolWords() {
    const highSchoolWords = [
      // 高二核心词汇
      { word: 'abandon', pronunciation: '/əˈbændən/', definition: 'v. 放弃，抛弃', example: 'They had to abandon their car in the snow.', difficulty: 3, frequency: 5 },
      { word: 'ability', pronunciation: '/əˈbɪləti/', definition: 'n. 能力，才能', example: 'She has the ability to solve complex problems.', difficulty: 2, frequency: 8 },
      { word: 'absent', pronunciation: '/ˈæbsənt/', definition: 'adj. 缺席的，不在的', example: 'He was absent from school yesterday.', difficulty: 2, frequency: 6 },
      { word: 'absorb', pronunciation: '/əbˈsɔːrb/', definition: 'v. 吸收；吸引注意力', example: 'Plants absorb water through their roots.', difficulty: 3, frequency: 5 },
      { word: 'academic', pronunciation: '/ˌækəˈdemɪk/', definition: 'adj. 学术的；学院的', example: 'She has excellent academic performance.', difficulty: 4, frequency: 7 },
      { word: 'accept', pronunciation: '/əkˈsept/', definition: 'v. 接受；同意', example: 'I accept your apology.', difficulty: 1, frequency: 9 },
      { word: 'achieve', pronunciation: '/əˈtʃiːv/', definition: 'v. 实现，达到', example: 'Work hard to achieve your goals.', difficulty: 2, frequency: 8 },
      { word: 'acquire', pronunciation: '/əˈkwaɪər/', definition: 'v. 获得，取得', example: 'She acquired knowledge through reading.', difficulty: 4, frequency: 6 },
      { word: 'address', pronunciation: '/əˈdres/', definition: 'v. 演讲；处理；n. 地址', example: 'The president will address the nation tonight.', difficulty: 3, frequency: 8 },
      { word: 'adequate', pronunciation: '/ˈædɪkwət/', definition: 'adj. 充足的，适当的', example: 'We need adequate funding for the project.', difficulty: 4, frequency: 5 },
      { word: 'adjust', pronunciation: '/əˈdʒʌst/', definition: 'v. 调整，适应', example: 'You need to adjust the mirror.', difficulty: 3, frequency: 6 },
      { word: 'admire', pronunciation: '/ədˈmaɪər/', definition: 'v. 钦佩，欣赏', example: 'I admire your courage.', difficulty: 2, frequency: 7 },
      { word: 'admit', pronunciation: '/ədˈmɪt/', definition: 'v. 承认；准许进入', example: 'He admitted his mistake.', difficulty: 2, frequency: 8 },
      { word: 'adopt', pronunciation: '/əˈdɑːpt/', definition: 'v. 采纳；收养', example: 'They decided to adopt a child.', difficulty: 3, frequency: 6 },
      { word: 'advance', pronunciation: '/ədˈvæns/', definition: 'v. 前进；促进；n. 进展', example: 'Technology has advanced rapidly.', difficulty: 3, frequency: 7 },
      { word: 'advantage', pronunciation: '/ədˈvæntɪdʒ/', definition: 'n. 优势，好处', example: 'Her height gives her an advantage in basketball.', difficulty: 3, frequency: 8 },
      { word: 'adventure', pronunciation: '/ədˈventʃər/', definition: 'n. 冒险；奇遇', example: 'Life is an adventure.', difficulty: 2, frequency: 6 },
      { word: 'affect', pronunciation: '/əˈfekt/', definition: 'v. 影响；感动', example: 'The weather affects my mood.', difficulty: 3, frequency: 9 },
      { word: 'afford', pronunciation: '/əˈfɔːrd/', definition: 'v. 负担得起；提供', example: 'I can\'t afford such an expensive car.', difficulty: 2, frequency: 8 },
      { word: 'afraid', pronunciation: '/əˈfreɪd/', definition: 'adj. 害怕的；担心的', example: 'Don\'t be afraid of making mistakes.', difficulty: 1, frequency: 9 },
      { word: 'agent', pronunciation: '/ˈeɪdʒənt/', definition: 'n. 代理人；特工；代理人', example: 'The secret agent completed the mission.', difficulty: 3, frequency: 6 },
      { word: 'agree', pronunciation: '/əˈɡriː/', definition: 'v. 同意；一致', example: 'I agree with your opinion.', difficulty: 1, frequency: 9 },
      { word: 'agriculture', pronunciation: '/ˈæɡrɪkʌltʃər/', definition: 'n. 农业', example: 'Agriculture is important for the economy.', difficulty: 4, frequency: 5 },
      { word: 'ahead', pronunciation: '/əˈhed/', definition: 'adv. 在前面；提前', example: 'She is always ahead in her studies.', difficulty: 1, frequency: 8 },
      { word: 'aid', pronunciation: '/eɪd/', definition: 'n. 帮助；援助；v. 帮助', example: 'First aid can save lives.', difficulty: 2, frequency: 7 },
      { word: 'aim', pronunciation: '/eɪm/', definition: 'n. 目标；v. 瞄准；目标', example: 'What\'s your aim in life?', difficulty: 2, frequency: 8 },
      { word: 'aircraft', pronunciation: '/ˈeərkræft/', definition: 'n. 飞机；航空器', example: 'The aircraft landed safely.', difficulty: 3, frequency: 6 },
      { word: 'alarm', pronunciation: '/əˈlɑːrm/', definition: 'n. 警报；闹钟；v. 警告', example: 'The fire alarm went off.', difficulty: 2, frequency: 7 },
      { word: 'album', pronunciation: '/ˈælbəm/', definition: 'n. 相册；专辑', example: 'She bought a photo album.', difficulty: 2, frequency: 6 },
      { word: 'alcohol', pronunciation: '/ˈælkəhɔːl/', definition: 'n. 酒精；酒', example: 'Alcohol is harmful to health.', difficulty: 3, frequency: 7 },
      { word: 'alert', pronunciation: '/əˈlɜːrt/', definition: 'adj. 警觉的；n. 警报', example: 'The guard remained alert all night.', difficulty: 3, frequency: 6 },
      { word: 'alien', pronunciation: '/ˈeɪliən/', definition: 'n. 外星人；adj. 外国的', example: 'The movie is about aliens from space.', difficulty: 3, frequency: 5 },
      { word: 'alike', pronunciation: '/əˈlaɪk/', definition: 'adj. 相似的；adv. 相似地', example: 'The twins look alike.', difficulty: 2, frequency: 7 },
      { word: 'alive', pronunciation: '/əˈlaɪv/', definition: 'adj. 活着的；有活力的', example: 'The old man is still alive.', difficulty: 1, frequency: 8 },
      { word: 'allow', pronunciation: '/əˈlaʊ/', definition: 'v. 允许；许可', example: 'Parents allow children to play games.', difficulty: 1, frequency: 9 },
      { word: 'almost', pronunciation: '/ˈɔːlmoʊst/', definition: 'adv. 几乎；差不多', example: 'It\'s almost time to go.', difficulty: 1, frequency: 9 },
      { word: 'alone', pronunciation: '/əˈloʊn/', definition: 'adj. 单独的；adv. 单独地', example: 'She likes to be alone sometimes.', difficulty: 1, frequency: 8 },
      { word: 'along', pronunciation: '/əˈlɔːŋ/', definition: 'prep. 沿着；adv. 向前', example: 'We walked along the beach.', difficulty: 1, frequency: 9 },
      { word: 'already', pronunciation: '/ɔːlˈredi/', definition: 'adv. 已经', example: 'I have already finished my homework.', difficulty: 1, frequency: 9 },
      { word: 'also', pronunciation: '/ˈɔːlsoʊ/', definition: 'adv. 也；同样', example: 'I also like playing football.', difficulty: 1, frequency: 9 },
      { word: 'alter', pronunciation: '/ˈɔːltər/', definition: 'v. 改变；修改', example: 'Don\'t alter the original plan.', difficulty: 4, frequency: 5 },
      { word: 'although', pronunciation: '/ɔːlˈðoʊ/', definition: 'conj. 虽然；尽管', example: 'Although it\'s raining, we\'ll go.', difficulty: 2, frequency: 9 },
      { word: 'always', pronunciation: '/ˈɔːlweɪz/', definition: 'adv. 总是；一直', example: 'She always arrives on time.', difficulty: 1, frequency: 9 },
      { word: 'amazing', pronunciation: '/əˈmeɪzɪŋ/', definition: 'adj. 令人惊奇的', example: 'The view from the mountain is amazing.', difficulty: 2, frequency: 8 },
      { word: 'ambition', pronunciation: '/æmˈbɪʃn/', definition: 'n. 雄心；抱负', example: 'His ambition is to become a doctor.', difficulty: 3, frequency: 7 },
      { word: 'ambulance', pronunciation: '/ˈæmbjələns/', definition: 'n. 救护车', example: 'The ambulance arrived quickly.', difficulty: 2, frequency: 6 },
      { word: 'among', pronunciation: '/əˈmʌŋ/', definition: 'prep. 在...之中', example: 'She was among the winners.', difficulty: 1, frequency: 8 },
      { word: 'amount', pronunciation: '/əˈmaʊnt/', definition: 'n. 数量；总额；v. 总计', example: 'A large amount of money was stolen.', difficulty: 2, frequency: 8 },
      { word: 'amuse', pronunciation: '/əˈmjuːz/', definition: 'v. 逗乐；使发笑', example: 'His jokes amuse everyone.', difficulty: 3, frequency: 6 },
      { word: 'analyze', pronunciation: '/ˈænəlaɪz/', definition: 'v. 分析', example: 'Scientists need to analyze the data.', difficulty: 4, frequency: 7 },
      { word: 'ancient', pronunciation: '/ˈeɪnʃənt/', definition: 'adj. 古代的；古老的', example: 'Egypt has many ancient monuments.', difficulty: 3, frequency: 7 },
      { word: 'anger', pronunciation: '/ˈæŋɡər/', definition: 'n. 愤怒；v. 激怒', example: 'He couldn\'t hide his anger.', difficulty: 2, frequency: 7 },
      { word: 'angle', pronunciation: '/ˈæŋɡl/', definition: 'n. 角度；角；v. 谋求', example: 'The camera angle is perfect.', difficulty: 3, frequency: 6 },
      { word: 'angry', pronunciation: '/ˈæŋɡri/', definition: 'adj. 生气的；愤怒的', example: 'She was angry about the delay.', difficulty: 1, frequency: 9 },
      { word: 'animal', pronunciation: '/ˈænɪml/', definition: 'n. 动物', example: 'The zoo has many animals.', difficulty: 1, frequency: 9 },
      { word: 'ankle', pronunciation: '/ˈæŋkl/', definition: 'n. 脚踝', example: 'He hurt his ankle playing basketball.', difficulty: 2, frequency: 5 },
      { word: 'anniversary', pronunciation: '/ˌænɪˈvɜːrsəri/', definition: 'n. 周年纪念日', example: 'Today is their wedding anniversary.', difficulty: 4, frequency: 6 },
      { word: 'announce', pronunciation: '/əˈnaʊns/', definition: 'v. 宣布；公布', example: 'The company announced new products.', difficulty: 3, frequency: 7 },
      { word: 'annual', pronunciation: '/ˈænjuəl/', definition: 'adj. 每年的；年度的', example: 'The annual meeting is next month.', difficulty: 4, frequency: 6 },
      { word: 'another', pronunciation: '/əˈnʌðər/', definition: 'adj. 另一个；再一个', example: 'Would you like another cup of tea?', difficulty: 1, frequency: 9 },
      { word: 'answer', pronunciation: '/ˈænsər/', definition: 'n. 答案；回答；v. 回答', example: 'Can you answer the question?', difficulty: 1, frequency: 9 },
      { word: 'anxious', pronunciation: '/ˈæŋkʃəs/', definition: 'adj. 焦虑的；渴望的', example: 'She is anxious about the exam.', difficulty: 3, frequency: 7 },
      { word: 'anybody', pronunciation: '/ˈenibɑːdi/', definition: 'pron. 任何人', example: 'Anybody can learn English.', difficulty: 1, frequency: 8 },
      { word: 'anyhow', pronunciation: '/ˈenihaʊ/', definition: 'adv. 无论如何；总之', example: 'Anyhow, we must finish the work.', difficulty: 2, frequency: 6 },
      { word: 'anyone', pronunciation: '/ˈeniwʌn/', definition: 'pron. 任何人', example: 'Anyone can join the club.', difficulty: 1, frequency: 9 },
      { word: 'anything', pronunciation: '/ˈeniθɪŋ/', definition: 'pron. 任何事物', example: 'I can do anything to help.', difficulty: 1, frequency: 9 },
      { word: 'anywhere', pronunciation: '/ˈeniwer/', definition: 'adv. 任何地方', example: 'You can sit anywhere.', difficulty: 1, frequency: 8 },
      { word: 'apart', pronunciation: '/əˈpɑːrt/', definition: 'adv. 分开；相距；adj. 分开的', example: 'The two cities are 100 miles apart.', difficulty: 2, frequency: 7 },
      { word: 'apartment', pronunciation: '/əˈpɑːrtmənt/', definition: 'n. 公寓', example: 'They live in a small apartment.', difficulty: 2, frequency: 8 },
      { word: 'apologize', pronunciation: '/əˈpɑːlədʒaɪz/', definition: 'v. 道歉', example: 'You should apologize for your mistake.', difficulty: 3, frequency: 7 },
      { word: 'apparent', pronunciation: '/əˈpærənt/', definition: 'adj. 明显的；表面的', example: 'It was apparent that she was tired.', difficulty: 4, frequency: 6 },
      { word: 'appeal', pronunciation: '/əˈpiːl/', definition: 'n. 呼吁；吸引力；v. 呼吁；吸引', example: 'The advertisement has great appeal.', difficulty: 4, frequency: 6 },
      { word: 'appear', pronunciation: '/əˈpɪr/', definition: 'v. 出现；显得', example: 'The sun appears in the east.', difficulty: 2, frequency: 8 },
      { word: 'appearance', pronunciation: '/əˈpɪrəns/', definition: 'n. 外观；出现', example: 'Don\'t judge by appearance.', difficulty: 3, frequency: 7 },
      { word: 'appetite', pronunciation: '/ˈæpɪtaɪt/', definition: 'n. 胃口；欲望', example: 'Exercise increases your appetite.', difficulty: 3, frequency: 6 },
      { word: 'apple', pronunciation: '/ˈæpl/', definition: 'n. 苹果', example: 'An apple a day keeps the doctor away.', difficulty: 1, frequency: 8 },
      { word: 'application', pronunciation: '/ˌæplɪˈkeɪʃn/', definition: 'n. 申请；应用；应用程序', example: 'I submitted my job application.', difficulty: 4, frequency: 8 },
      { word: 'apply', pronunciation: '/əˈplaɪ/', definition: 'v. 申请；应用；涂抹', example: 'Apply for the scholarship.', difficulty: 3, frequency: 8 },
      { word: 'appoint', pronunciation: '/əˈpɔɪnt/', definition: 'v. 任命；约定', example: 'The president appointed a new minister.', difficulty: 4, frequency: 5 },
      { word: 'appreciate', pronunciation: '/əˈpriːʃieɪt/', definition: 'v. 欣赏；感激；增值', example: 'I appreciate your help very much.', difficulty: 4, frequency: 8 },
      { word: 'approach', pronunciation: '/əˈproʊtʃ/', definition: 'v. 接近；处理；n. 方法；途径', example: 'We need to approach this problem carefully.', difficulty: 4, frequency: 7 },
      { word: 'appropriate', pronunciation: '/əˈproʊpriət/', definition: 'adj. 适当的；合适的', example: 'Please wear appropriate clothing.', difficulty: 4, frequency: 7 },
      { word: 'approve', pronunciation: '/əˈpruːv/', definition: 'v. 批准；赞成', example: 'The manager approved the request.', difficulty: 3, frequency: 7 },
      { word: 'approximate', pronunciation: '/əˈprɑːksɪmət/', definition: 'adj. 大约的；近似的；v. 接近', example: 'The approximate cost is $1000.', difficulty: 4, frequency: 5 },
      { word: 'architect', pronunciation: '/ˈɑːrkɪtekt/', definition: 'n. 建筑师', example: 'The architect designed the building.', difficulty: 4, frequency: 6 },
      { word: 'architecture', pronunciation: '/ˈɑːrkɪtektʃər/', definition: 'n. 建筑学；建筑风格', example: 'The architecture is amazing.', difficulty: 4, frequency: 6 },
      { word: 'argue', pronunciation: '/ˈɑːrɡjuː/', definition: 'v. 争论；辩论；主张', example: 'They argue about politics.', difficulty: 2, frequency: 8 },
      { word: 'argument', pronunciation: '/ˈɑːrɡjumənt/', definition: 'n. 争论；论点', example: 'I don\'t want to start an argument.', difficulty: 3, frequency: 8 },
      { word: 'arise', pronunciation: '/əˈraɪz/', definition: 'v. 出现；产生；起床', example: 'Problems may arise from this decision.', difficulty: 3, frequency: 6 },
      { word: 'arithmetic', pronunciation: '/əˈrɪθmətɪk/', definition: 'n. 算术；计算', example: 'Students learn arithmetic in primary school.', difficulty: 4, frequency: 5 },
      { word: 'arrange', pronunciation: '/əˈreɪndʒ/', definition: 'v. 安排；整理；布置', example: 'Can you arrange a meeting?', difficulty: 3, frequency: 8 },
      { word: 'arrest', pronunciation: '/əˈrest/', definition: 'v. 逮捕；阻止；n. 逮捕', example: 'The police arrested the thief.', difficulty: 3, frequency: 7 },
      { word: 'arrival', pronunciation: '/əˈraɪvl/', definition: 'n. 到达；到来', example: 'Her arrival was unexpected.', difficulty: 3, frequency: 7 },
      { word: 'arrive', pronunciation: '/əˈraɪv/', definition: 'v. 到达；抵达', example: 'The train will arrive at 5 PM.', difficulty: 2, frequency: 9 },
      { word: 'article', pronunciation: '/ˈɑːrtɪkl/', definition: 'n. 文章；物品；冠词', example: 'I read an interesting article.', difficulty: 2, frequency: 8 },
      { word: 'artist', pronunciation: '/ˈɑːrtɪst/', definition: 'n. 艺术家；画家', example: 'The artist painted a beautiful picture.', difficulty: 2, frequency: 7 },
      { word: 'asleep', pronunciation: '/əˈsliːp/', definition: 'adj. 睡着的', example: 'The baby is asleep.', difficulty: 1, frequency: 8 },
      { word: 'aspect', pronunciation: '/ˈæspekt/', definition: 'n. 方面；方位；外观', example: 'We must consider every aspect.', difficulty: 4, frequency: 7 },
      { word: 'assess', pronunciation: '/əˈses/', definition: 'v. 评估；评定', example: 'Teachers assess student progress.', difficulty: 4, frequency: 6 },
      { word: 'assignment', pronunciation: '/əˈsaɪnmənt/', definition: 'n. 作业；任务；分配', example: 'The homework assignment is due tomorrow.', difficulty: 3, frequency: 8 },
      { word: 'assist', pronunciation: '/əˈsɪst/', definition: 'v. 帮助；协助', example: 'Can I assist you with anything?', difficulty: 3, frequency: 7 },
      { word: 'associate', pronunciation: '/əˈsoʊʃieɪt/', definition: 'v. 联系；关联；n. 同事', example: 'I associate this song with my childhood.', difficulty: 4, frequency: 7 },
      { word: 'association', pronunciation: '/əˌsoʊsiˈeɪʃn/', definition: 'n. 协会；联系；联想', example: 'He joined the business association.', difficulty: 4, frequency: 6 },
      { word: 'assume', pronunciation: '/əˈsuːm/', definition: 'v. 假设；承担；认为', example: 'I assume you know the rules.', difficulty: 4, frequency: 8 },
      { word: 'assure', pronunciation: '/əˈʃʊr/', definition: 'v. 保证；使确信', example: 'I assure you it\'s safe.', difficulty: 4, frequency: 6 },
      { word: 'atmosphere', pronunciation: '/ˈætməsfɪr/', definition: 'n. 大气；氛围', example: 'The atmosphere in the room was tense.', difficulty: 4, frequency: 7 },
      { word: 'attach', pronunciation: '/əˈtætʃ/', definition: 'v. 附加；贴上；使依恋', example: 'Please attach your photo to the form.', difficulty: 3, frequency: 7 },
      { word: 'attack', pronunciation: '/əˈtæk/', definition: 'n. 攻击；v. 攻击；抨击', example: 'The castle was under attack.', difficulty: 2, frequency: 7 },
      { word: 'attempt', pronunciation: '/əˈtempt/', definition: 'n. 尝试；v. 尝试；企图', example: 'He made an attempt to climb the mountain.', difficulty: 3, frequency: 8 },
      { word: 'attend', pronunciation: '/əˈtend/', definition: 'v. 出席；参加；照料', example: 'Please attend the meeting tomorrow.', difficulty: 2, frequency: 8 },
      { word: 'attention', pronunciation: '/əˈtenʃn/', definition: 'n. 注意；关注；注意力', example: 'Pay attention to the teacher.', difficulty: 2, frequency: 9 },
      { word: 'attitude', pronunciation: '/ˈætɪtuːd/', definition: 'n. 态度；看法', example: 'A positive attitude is important.', difficulty: 3, frequency: 8 },
      { word: 'attract', pronunciation: '/əˈtrækt/', definition: 'v. 吸引；引起', example: 'Flowers attract bees.', difficulty: 3, frequency: 7 },
      { word: 'attraction', pronunciation: '/əˈtrækʃn/', definition: 'n. 吸引；吸引力；景点', example: 'The Eiffel Tower is a major attraction.', difficulty: 3, frequency: 7 },
      { word: 'attractive', pronunciation: '/əˈtræktɪv/', definition: 'adj. 有吸引力的；迷人的', example: 'She wears attractive clothes.', difficulty: 3, frequency: 7 },
      { word: 'audience', pronunciation: '/ˈɔːdiəns/', definition: 'n. 观众；听众；读者', example: 'The audience applauded loudly.', difficulty: 3, frequency: 7 },
      { word: 'author', pronunciation: '/ˈɔːθər/', definition: 'n. 作者；作家', example: 'The author wrote many books.', difficulty: 2, frequency: 7 },
      { word: 'authority', pronunciation: '/əˈθɔːrəti/', definition: 'n. 权力；权威；当局', example: 'You need authority to make decisions.', difficulty: 4, frequency: 7 },
      { word: 'automatic', pronunciation: '/ˌɔːtəˈmætɪk/', definition: 'adj. 自动的；无意识的', example: 'The camera has automatic focus.', difficulty: 4, frequency: 6 },
      { word: 'available', pronunciation: '/əˈveɪləbl/', definition: 'adj. 可获得的；有空的', example: 'The book is available in the library.', difficulty: 3, frequency: 9 },
      { word: 'average', pronunciation: '/ˈævərɪdʒ/', definition: 'n. 平均；adj. 平均的；普通的', example: 'The average temperature is 25°C.', difficulty: 3, frequency: 8 },
      { word: 'avoid', pronunciation: '/əˈvɔɪd/', definition: 'v. 避免；躲避', example: 'Try to avoid making mistakes.', difficulty: 2, frequency: 8 },
      { word: 'awake', pronunciation: '/əˈweɪk/', definition: 'adj. 醒着的；v. 醒来', example: 'I was awake all night.', difficulty: 1, frequency: 8 },
      { word: 'award', pronunciation: '/əˈwɔːrd/', definition: 'n. 奖；奖品；v. 授予', example: 'She won an award for her performance.', difficulty: 3, frequency: 7 },
      { word: 'aware', pronunciation: '/əˈwer/', definition: 'adj. 意识到的；知道的', example: 'Are you aware of the danger?', difficulty: 3, frequency: 8 },
      { word: 'awful', pronunciation: '/ˈɔːfl/', definition: 'adj. 可怕的；糟糕的', example: 'The weather was awful yesterday.', difficulty: 2, frequency: 7 }
    ];

    const insertWordQuery = `
      INSERT INTO words (word, pronunciation, definition, example, difficulty, frequency)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    for (const wordData of highSchoolWords) {
      try {
        await this.database.executeSql(insertWordQuery, [
          wordData.word,
          wordData.pronunciation,
          wordData.definition,
          wordData.example,
          wordData.difficulty,
          wordData.frequency
        ]);
      } catch (error) {
        console.log(`单词 ${wordData.word} 已存在，跳过`);
      }
    }

    // 初始化用户设置
    await this.database.executeSql(`
      INSERT OR IGNORE INTO user_settings (daily_goal, reminder_enabled, sound_enabled)
      VALUES (20, 1, 1)
    `);

    console.log('初始单词数据加载完成');
  }

  async getWordById(id) {
    const [results] = await this.database.executeSql(
      'SELECT * FROM words WHERE id = ?', [id]
    );

    if (results.rows.length > 0) {
      return results.rows.item(0);
    }
    return null;
  }

  async getWordsByDifficulty(difficulty, limit = 20) {
    const [results] = await this.database.executeSql(
      'SELECT * FROM words WHERE difficulty = ? ORDER BY frequency DESC LIMIT ?',
      [difficulty, limit]
    );

    const words = [];
    for (let i = 0; i < results.rows.length; i++) {
      words.push(results.rows.item(i));
    }
    return words;
  }

  async getNewWords(limit = 20) {
    const query = `
      SELECT w.* FROM words w
      LEFT JOIN learning_records lr ON w.id = lr.word_id
      WHERE lr.word_id IS NULL
      ORDER BY w.frequency DESC, w.difficulty ASC
      LIMIT ?
    `;

    const [results] = await this.database.executeSql(query, [limit]);

    const words = [];
    for (let i = 0; i < results.rows.length; i++) {
      words.push(results.rows.item(i));
    }
    return words;
  }

  async getWordsForReview() {
    const query = `
      SELECT w.*, lr.* FROM words w
      INNER JOIN learning_records lr ON w.id = lr.word_id
      WHERE lr.next_review_time <= datetime('now')
      ORDER BY lr.memory_strength ASC, lr.next_review_time ASC
      LIMIT 50
    `;

    const [results] = await this.database.executeSql(query);

    const words = [];
    for (let i = 0; i < results.rows.length; i++) {
      words.push(results.rows.item(i));
    }
    return words;
  }

  async createLearningRecord(wordId) {
    const query = `
      INSERT INTO learning_records (word_id, study_date, next_review_time)
      VALUES (?, date('now'), datetime('now', '+1 day'))
    `;

    const [results] = await this.database.executeSql(query, [wordId]);
    return results.insertId;
  }

  async updateLearningRecord(wordId, isCorrect) {
    // 先获取当前记录
    const [results] = await this.database.executeSql(
      'SELECT * FROM learning_records WHERE word_id = ?', [wordId]
    );

    if (results.rows.length === 0) {
      await this.createLearningRecord(wordId);
      return;
    }

    const record = results.rows.item(0);
    const newReviewCount = record.review_count + 1;
    const newCorrectCount = record.correct_count + (isCorrect ? 1 : 0);

    // 计算记忆强度
    const accuracy = newCorrectCount / newReviewCount;
    let memoryStrength = Math.min(100, accuracy * 80);

    // 根据正确率调整复习间隔
    let reviewInterval;
    if (isCorrect) {
      const intervals = [1, 2, 4, 7, 15, 30, 60, 120];
      const baseInterval = intervals[Math.min(newReviewCount - 1, intervals.length - 1)];
      reviewInterval = baseInterval;
      memoryStrength = Math.min(100, memoryStrength + 10);
    } else {
      reviewInterval = 1; // 错误的单词明天复习
      memoryStrength = Math.max(0, memoryStrength - 20);
    }

    const nextReviewTime = `datetime('now', '+${reviewInterval} day')`;

    // 更新记录
    const updateQuery = `
      UPDATE learning_records
      SET review_count = ?, correct_count = ?, last_review_time = datetime('now'),
          next_review_time = ${nextReviewTime}, memory_strength = ?
      WHERE word_id = ?
    `;

    await this.database.executeSql(updateQuery, [newReviewCount, newCorrectCount, memoryStrength, wordId]);
  }

  async getStudyStatistics() {
    const queries = {
      totalWords: 'SELECT COUNT(*) as count FROM words',
      learnedWords: 'SELECT COUNT(*) as count FROM learning_records',
      masteredWords: 'SELECT COUNT(*) as count FROM learning_records WHERE memory_strength >= 80',
      dueForReview: 'SELECT COUNT(*) as count FROM learning_records WHERE next_review_time <= datetime("now")'
    };

    const stats = {};
    for (const [key, query] of Object.entries(queries)) {
      const [results] = await this.database.executeSql(query);
      stats[key] = results.rows.item(0).count;
    }

    return stats;
  }

  async closeDatabase() {
    if (this.database) {
      await this.database.close();
      console.log('数据库已关闭');
    }
  }
}

export default new DatabaseManager();
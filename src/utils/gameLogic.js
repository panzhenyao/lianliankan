/**
 * 连连看游戏逻辑模块
 */

// 定义卡片类型 - 符号及其对应颜色
export const CARD_TYPES = [
    { symbol: "♥", color: "#e74c3c" }, // 红心
    { symbol: "♦", color: "#e67e22" }, // 方块
    { symbol: "♣", color: "#2ecc71" }, // 梅花
    { symbol: "♠", color: "#3498db" }, // 黑桃
    { symbol: "★", color: "#9b59b6" }, // 星星
    { symbol: "✿", color: "#ff7979" }, // 花朵1
    { symbol: "◆", color: "#f1c40f" }, // 菱形
    { symbol: "❀", color: "#1abc9c" }, // 花朵2
  ];
  
  /**
   * 创建游戏卡片
   * @param {number} rows - 行数
   * @param {number} cols - 列数
   * @returns {Array} - 二维数组形式的游戏棋盘
   */
  export function createGameCards(rows, cols) {
    // 检查是否可以创建成对的卡片
    if ((rows * cols) % 2 !== 0) {
      throw new Error("行数与列数的乘积必须是偶数");
    }
  
    // 创建需要的卡片对数
    const totalPairs = (rows * cols) / 2;
    const cards = generateCardPairs(totalPairs);
    
    // 随机打乱卡片顺序
    shuffleArray(cards);
  
    // 将卡片排列成二维网格
    return arrangeCardsInGrid(cards, rows, cols);
  }
  
  /**
   * 生成成对的卡片
   * @param {number} totalPairs - 需要的卡片对数
   * @returns {Array} - 卡片数组
   */
  function generateCardPairs(totalPairs) {
    const cards = [];
    
    for (let i = 0; i < totalPairs; i++) {
      // 循环使用卡片类型
      const cardType = CARD_TYPES[i % CARD_TYPES.length];
      
      // 为每种类型创建两张相同的卡片
      cards.push(createCard(i * 2, cardType));
      cards.push(createCard(i * 2 + 1, cardType));
    }
    
    return cards;
  }
  
  /**
   * 创建单张卡片
   * @param {number} id - 卡片ID
   * @param {Object} cardType - 卡片类型
   * @returns {Object} - 卡片对象
   */
  function createCard(id, cardType) {
    return {
      id,
      type: cardType,
      matched: false, // 是否已匹配
      hinted: false,  // 是否被提示高亮
    };
  }
  
  /**
   * 将卡片排列成网格
   * @param {Array} cards - 卡片数组
   * @param {number} rows - 行数
   * @param {number} cols - 列数
   * @returns {Array} - 二维数组形式的游戏棋盘
   */
  function arrangeCardsInGrid(cards, rows, cols) {
    const board = [];
    
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        const index = i * cols + j;
        
        // 添加行列索引以便定位
        const card = {
          ...cards[index],
          rowIndex: i,
          colIndex: j,
        };
        
        row.push(card);
      }
      board.push(row);
    }
    
    return board;
  }
  
  /**
   * 洗牌算法 - Fisher-Yates 洗牌
   * @param {Array} array - 要打乱的数组
   * @returns {Array} - 打乱后的数组
   */
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      // 随机选择一个索引
      const j = Math.floor(Math.random() * (i + 1));
      // 交换元素
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
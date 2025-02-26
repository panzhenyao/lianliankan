
// 定义卡片类型
export const CARD_TYPES = [
    { symbol: '♥', color: '#e74c3c' },
    { symbol: '♦', color: '#e67e22' },
    { symbol: '♣', color: '#2ecc71' },
    { symbol: '♠', color: '#3498db' },
    { symbol: '★', color: '#9b59b6' },
    { symbol: '✿', color: '#ff7979' },
    { symbol: '◆', color: '#f1c40f' },
    { symbol: '✿', color: '#1abc9c' }
  ];
  
  // 创建游戏卡片
  export function createGameCards(rows, cols) {
    if (rows * cols % 2 !== 0) {
      throw new Error('行数与列数的乘积必须是偶数');
    }
  
    // 创建配对卡片
    const totalPairs = (rows * cols) / 2;
    let cards = [];
  
    // 为每对卡片选择图案
    for (let i = 0; i < totalPairs; i++) {
      const cardType = CARD_TYPES[i % CARD_TYPES.length];
      // 创建两张相同的卡片
      cards.push({ id: i * 2, type: cardType, matched: false, visible: true });
      cards.push({ id: i * 2 + 1, type: cardType, matched: false, visible: true });
    }
  
    // 随机打乱卡片顺序
    shuffleArray(cards);
  
    // 将卡片排列成网格
    let board = [];
    for (let i = 0; i < rows; i++) {
      let row = [];
      for (let j = 0; j < cols; j++) {
        const card = cards[i * cols + j];
        row.push({
          ...card,
          rowIndex: i,
          colIndex: j
        });
      }
      board.push(row);
    }
  
    return board;
  }
  
  // 洗牌函数
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
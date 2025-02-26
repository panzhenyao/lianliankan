<template>
  <div class="app-container">
    <h1>连连看游戏</h1>
    <GameStatus 
      :remainingPairs="remainingPairs" 
      :timeLeft="timeLeft" 
      :gameState="gameState" 
    />
    <GameBoard 
      :board="board" 
      :selectedCard="selectedCard"
      :connectingPath="connectingPath"
      @card-click="handleCardClick" 
    />
    <GameControls 
      @new-game="startNewGame"
      @shuffle="shuffleCards"
      @hint="showHint"
      :gameState="gameState"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import GameBoard from './components/GameBoard.vue';
import GameStatus from './components/GameStatus.vue';
import GameControls from './components/GameControls.vue';
import { createGameCards } from './utils/gameLogic';
import { canConnect, findPath } from './utils/pathFinder';

export default {
  name: 'App',
  components: {
    GameBoard,
    GameStatus,
    GameControls
  },
  setup() {
    // 游戏状态
    const gameState = ref('ready'); // ready, playing, paused, won, lost
    const board = ref([]);
    const selectedCard = ref(null);
    const connectingPath = ref([]);
    const timer = ref(null);
    const timeLeft = ref(180); // 3分钟
    const rows = 8;
    const cols = 8;
    
    // 计算剩余配对数
    const remainingPairs = computed(() => {
      if (!board.value.length) return 0;
      
      let count = 0;
      for (let row of board.value) {
        for (let card of row) {
          if (!card.matched) {
            count++;
          }
        }
      }
      return count / 2; // 除以2得到配对数
    });
    
    // 初始化游戏
    const initGame = () => {
      board.value = createGameCards(rows, cols);
      selectedCard.value = null;
      connectingPath.value = [];
      timeLeft.value = 180;
      gameState.value = 'ready';
    };
    
    // 开始新游戏
    const startNewGame = () => {
      initGame();
      startTimer();
      gameState.value = 'playing';
    };
    
    // 开始计时器
    const startTimer = () => {
      if (timer.value) {
        clearInterval(timer.value);
      }
      
      timer.value = setInterval(() => {
        if (timeLeft.value > 0) {
          timeLeft.value--;
        } else {
          clearInterval(timer.value);
          gameState.value = 'lost';
        }
      }, 1000);
    };
    
    // 洗牌
    const shuffleCards = () => {
      if (gameState.value !== 'playing') return;
      
      // 只洗牌未匹配的卡片
      let unmatched = [];
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (!board.value[i][j].matched) {
            unmatched.push({ ...board.value[i][j] });
          }
        }
      }
      
      // 打乱未匹配卡片的顺序
      for (let i = unmatched.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [unmatched[i], unmatched[j]] = [unmatched[j], unmatched[i]];
      }
      
      // 重新分配未匹配卡片的位置
      let index = 0;
      let newBoard = JSON.parse(JSON.stringify(board.value));
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (!newBoard[i][j].matched) {
            newBoard[i][j] = { 
              ...unmatched[index], 
              rowIndex: i, 
              colIndex: j 
            };
            index++;
          }
        }
      }
      
      board.value = newBoard;
      selectedCard.value = null;
      connectingPath.value = [];
    };
    
    // 提示功能
    const showHint = () => {
      if (gameState.value !== 'playing') return;
      
      // 寻找可以连接的卡片对
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (board.value[i][j].matched) continue;
          
          for (let m = 0; m < rows; m++) {
            for (let n = 0; n < cols; n++) {
              // 跳过同一张卡片
              if (i === m && j === n) continue;
              
              // 跳过已匹配的卡片
              if (board.value[m][n].matched) continue;
              
              // 检查是否可以连接
              if (board.value[i][j].type.symbol === board.value[m][n].type.symbol) {
                const path = findPath(board.value, board.value[i][j], board.value[m][n]);
                if (path.length > 0) {
                  // 显示提示
                  board.value[i][j].hinted = true;
                  board.value[m][n].hinted = true;
                  
                  // 3秒后取消提示
                  setTimeout(() => {
                    if (board.value[i][j] && !board.value[i][j].matched) {
                      board.value[i][j].hinted = false;
                    }
                    if (board.value[m][n] && !board.value[m][n].matched) {
                      board.value[m][n].hinted = false;
                    }
                  }, 3000);
                  
                  return; // 找到一对即可
                }
              }
            }
          }
        }
      }
    };
    
    // 处理卡片点击
    const handleCardClick = (card) => {
      if (gameState.value !== 'playing' || card.matched) return;
      
      // 确保游戏已经开始
      if (gameState.value === 'ready') {
        startTimer();
        gameState.value = 'playing';
      }
      
      // 第一次选择卡片
      if (selectedCard.value === null) {
        selectedCard.value = card;
        return;
      }
      
      // 点击了同一张卡片，取消选择
      if (selectedCard.value.rowIndex === card.rowIndex && 
          selectedCard.value.colIndex === card.colIndex) {
        selectedCard.value = null;
        return;
      }
      
      // 尝试连接两张卡片
      if (canConnect(board.value, selectedCard.value, card)) {
        // 找到连接路径
        connectingPath.value = findPath(board.value, selectedCard.value, card);
        
        // 显示连接动画，然后移除卡片
        setTimeout(() => {
          // 标记卡片为已匹配
          board.value[selectedCard.value.rowIndex][selectedCard.value.colIndex].matched = true;
          board.value[card.rowIndex][card.colIndex].matched = true;
          
          // 清除选择和路径
          selectedCard.value = null;
          connectingPath.value = [];
          
          // 检查游戏是否胜利
          if (remainingPairs.value === 0) {
            gameState.value = 'won';
            clearInterval(timer.value);
          }
        }, 500);
      } else {
        // 选择不同的卡片
        selectedCard.value = card;
      }
    };
    
    // 组件挂载时初始化游戏
    onMounted(() => {
      initGame();
    });
    
    // 组件卸载时清除计时器
    onUnmounted(() => {
      if (timer.value) {
        clearInterval(timer.value);
      }
    });
    
    return {
      board,
      selectedCard,
      connectingPath,
      timeLeft,
      remainingPairs,
      gameState,
      startNewGame,
      shuffleCards,
      showHint,
      handleCardClick
    };
  }
};
</script>

<style>
.app-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  text-align: center;
}

h1 {
  color: #2c3e50;
  margin-bottom: 20px;
}
</style>
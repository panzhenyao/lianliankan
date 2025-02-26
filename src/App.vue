<template>
  <div class="app-container">
    <h1>连连看游戏</h1>
    <GameStatus
      :remainingPairs="remainingPairs"
      :timeLeft="timeLeft"
      :gameState="gameState"
      :previewCountdown="previewCountdown"
      :hintsRemaining="hintsRemaining"
    />
    <GameBoard
      :board="board"
      :selectedCard="selectedCard"
      :previousCard="previousCard"
      :connectingPath="connectingPath"
      :isPreviewMode="gameState === 'preview'"
      @card-click="handleCardClick"
    />
    <GameControls
      @new-game="startNewGame"
      @shuffle="shuffleCards"
      @hint="showHint"
      :gameState="gameState"
      :hintsRemaining="hintsRemaining"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import GameBoard from "./components/GameBoard.vue";
import GameStatus from "./components/GameStatus.vue";
import GameControls from "./components/GameControls.vue";
import { createGameCards } from "./utils/gameLogic";
import { canConnect, findPath } from "./utils/pathFinder";

export default {
  name: "App",
  components: {
    GameBoard,
    GameStatus,
    GameControls,
  },
  setup() {
    // 游戏配置
    const rows = 8;
    const cols = 8;
    const gameDuration = 180; // 3分钟
    const previewDuration = 3; // 3秒预览
    const maxHints = 3;

    // 游戏状态
    const gameState = ref("ready"); // ready, preview, playing, paused, won, lost
    const board = ref([]);
    const selectedCard = ref(null);
    const previousCard = ref(null);
    const connectingPath = ref([]);
    const timeLeft = ref(gameDuration);
    const previewCountdown = ref(previewDuration);
    const hintsRemaining = ref(maxHints);
    
    // 计时器
    const timer = ref(null);
    const previewTimer = ref(null);

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
      return count / 2;
    });

    // 游戏功能实现
    const initGame = () => {
      // 清除计时器
      clearTimers();
      
      // 重置游戏状态
      board.value = createGameCards(rows, cols);
      selectedCard.value = null;
      previousCard.value = null;
      connectingPath.value = [];
      timeLeft.value = gameDuration;
      gameState.value = "ready";
      hintsRemaining.value = maxHints;
      previewCountdown.value = previewDuration;
    };

    const clearTimers = () => {
      if (timer.value) {
        clearInterval(timer.value);
        timer.value = null;
      }
      if (previewTimer.value) {
        clearInterval(previewTimer.value);
        previewTimer.value = null;
      }
    };

    const startNewGame = () => {
      initGame();
      
      // 开始预览模式
      gameState.value = "preview";
      
      previewTimer.value = setInterval(() => {
        if (previewCountdown.value > 0) {
          previewCountdown.value--;
        } else {
          clearInterval(previewTimer.value);
          previewTimer.value = null;
          
          // 预览结束，切换到游戏模式
          gameState.value = "playing";
          
          // 确保视图更新后再启动计时器
          nextTick(() => {
            startTimer();
          });
        }
      }, 1000);
    };

    const startTimer = () => {
      if (timer.value) clearInterval(timer.value);
      
      timer.value = setInterval(() => {
        if (timeLeft.value > 0) {
          timeLeft.value--;
        } else {
          clearInterval(timer.value);
          gameState.value = "lost";
        }
      }, 1000);
    };

    const shuffleCards = () => {
      if (gameState.value !== "playing") return;

      // 收集未匹配的卡片
      let unmatched = [];
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (!board.value[i][j].matched) {
            unmatched.push({ ...board.value[i][j] });
          }
        }
      }

      // 打乱未匹配卡片顺序
      for (let i = unmatched.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [unmatched[i], unmatched[j]] = [unmatched[j], unmatched[i]];
      }

      // 更新棋盘
      let index = 0;
      let newBoard = JSON.parse(JSON.stringify(board.value));
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (!newBoard[i][j].matched) {
            newBoard[i][j] = {
              ...unmatched[index],
              rowIndex: i,
              colIndex: j,
            };
            index++;
          }
        }
      }

      board.value = newBoard;
      resetSelection();
    };

    const resetSelection = () => {
      selectedCard.value = null;
      previousCard.value = null;
      
      // 清除连接路径
      connectingPath.value = [];
    };

    const showHint = () => {
      if (gameState.value !== "playing" || hintsRemaining.value <= 0) return;

      // 查找可连接的卡片对
      const matchablePairs = findMatchablePairs();
      
      if (matchablePairs.length > 0) {
        // 随机选择一对
        const pair = matchablePairs[Math.floor(Math.random() * matchablePairs.length)];
        const card1 = board.value[pair.card1.row][pair.card1.col];
        const card2 = board.value[pair.card2.row][pair.card2.col];
        
        // 显示连接路径
        connectingPath.value = pair.path;
        
        // 高亮显示卡片
        card1.hinted = true;
        card2.hinted = true;
        
        // 延迟后自动匹配
        setTimeout(() => {
          // 匹配卡片
          card1.matched = true;
          card2.matched = true;
          
          // 清除高亮和路径
          card1.hinted = false;
          card2.hinted = false;
          connectingPath.value = [];
          
          // 减少提示次数
          hintsRemaining.value--;
          
          // 检查游戏是否胜利
          checkWinCondition();
        }, 1000);
      }
    };

    const findMatchablePairs = () => {
      let pairs = [];
      
      // 遍历所有未匹配的卡片
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (board.value[i][j].matched) continue;
          
          // 寻找可能匹配的另一张卡片
          for (let m = 0; m < rows; m++) {
            for (let n = 0; n < cols; n++) {
              // 跳过同一张卡片和已匹配的卡片
              if ((i === m && j === n) || board.value[m][n].matched) continue;
              
              // 检查类型是否相同且可以连接
              if (board.value[i][j].type.symbol === board.value[m][n].type.symbol) {
                if (canConnect(board.value, board.value[i][j], board.value[m][n])) {
                  const path = findPath(board.value, board.value[i][j], board.value[m][n]);
                  if (path.length > 0) {
                    pairs.push({
                      card1: { row: i, col: j },
                      card2: { row: m, col: n },
                      path: path,
                    });
                  }
                }
              }
            }
          }
        }
      }
      
      return pairs;
    };

    const handleCardClick = (card) => {
      console.log('handleCardClick ==>1 ');
      // 检查游戏状态
      if (gameState.value !== "playing" || card.matched || previousCard.value) {
        return;
      }
      console.log('handleCardClick ==>2 ');

      // 如果没有选择卡片，记录第一次选择
      if (selectedCard.value === null) {
        selectedCard.value = card;
        return;
      }
      console.log('handleCardClick ==>3 ');

      // 点击同一张卡片，取消选择
      if (selectedCard.value.rowIndex === card.rowIndex && 
          selectedCard.value.colIndex === card.colIndex) {
        selectedCard.value = null;
        return;
      }
      console.log('handleCardClick ==>4 ');

      // 记录第二张卡片
      previousCard.value = card;

      // 尝试连接
      processCardMatching(selectedCard.value, card);
    };

    const processCardMatching = (card1, card2) => {
      // 检查是否可以连接
      if (card1.type.symbol === card2.type.symbol) {
        // 使用canConnect函数检查是否可以连接
        if (canConnect(board.value, card1, card2)) {
          // 找到连接路径
          const path = findPath(board.value, card1, card2);
          
          if (path && path.length > 0) {
            // 确保路径有效再赋值
            connectingPath.value = path;
            console.log("找到连接路径:", connectingPath.value);
            
            // 显示连接并延迟匹配
            setTimeout(() => {
              // 设置为已匹配
              board.value[card1.rowIndex][card1.colIndex].matched = true;
              board.value[card2.rowIndex][card2.colIndex].matched = true;
              
              // 延长连线显示时间
              setTimeout(() => {
                // 重置状态
                resetSelection();
                
                // 检查游戏是否结束
                checkWinCondition();
              }, 800); // 保持连线显示800ms
            }, 300);
          } else {
            console.log("无法找到有效连接路径");
            // 不能连接，延时后重置
            setTimeout(resetSelection, 1000);
          }
        } else {
          console.log("卡片无法连接");
          // 不能连接，延时后重置
          setTimeout(resetSelection, 1000);
        }
      } else {
        console.log("卡片类型不匹配");
        // 类型不匹配，延时后重置
        setTimeout(resetSelection, 1000);
      }
    };

    const checkWinCondition = () => {
      if (remainingPairs.value === 0) {
        gameState.value = "won";
        clearInterval(timer.value);
      }
    };

    // 生命周期钩子
    onMounted(() => {
      initGame();
    });

    onUnmounted(() => {
      clearTimers();
    });

    return {
      // 游戏状态
      board,
      selectedCard,
      previousCard,
      connectingPath,
      timeLeft,
      remainingPairs,
      gameState,
      previewCountdown,
      hintsRemaining,
      
      // 游戏操作
      startNewGame,
      shuffleCards,
      showHint,
      handleCardClick,
    };
  },
};
</script>

<style>
.app-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  text-align: center;
  box-sizing: border-box;
  overflow-x: hidden;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

h1 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: min(2rem, 8vw);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .app-container {
    padding: 15px;
  }

  h1 {
    font-size: min(1.8rem, 7vw);
  }
}

@media (max-width: 480px) {
  .app-container {
    padding: 10px;
  }

  h1 {
    font-size: min(1.5rem, 6vw);
    margin-bottom: 15px;
  }
}

/* 全局样式 */
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow-x: hidden;
}

#app {
  height: 100%;
}
</style>
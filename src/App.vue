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
      :connectingPath="connectingPath"
      :isPreviewMode="isPreviewMode"
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
import { ref, computed, onMounted, onUnmounted } from "vue";
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
    // 游戏状态
    const gameState = ref("ready"); // ready, preview, playing, paused, won, lost
    const board = ref([]);
    const selectedCard = ref(null);
    const connectingPath = ref([]);
    const timer = ref(null);
    const timeLeft = ref(180); // 3分钟
    const rows = 8;
    const cols = 8;

    // Add preview mode state
    const isPreviewMode = ref(false);
    const previewDuration = ref(3); // 3 second preview
    const previewCountdown = ref(3); // Countdown display for preview

    // Add hints limit
    const hintsRemaining = ref(3);

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
      gameState.value = "ready";
      isPreviewMode.value = false;
      previewCountdown.value = previewDuration.value;
      hintsRemaining.value = 3; // Reset hints
    };

    // 开始新游戏
    const startNewGame = () => {
      initGame();

      // Start with preview mode
      isPreviewMode.value = true;
      gameState.value = "preview";

      // Create preview countdown timer
      const previewTimer = setInterval(() => {
        if (previewCountdown.value > 0) {
          previewCountdown.value--;
        } else {
          clearInterval(previewTimer);
          isPreviewMode.value = false;
          gameState.value = "playing";
          startTimer(); // Start the actual game timer after preview
        }
      }, 1000);
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
          gameState.value = "lost";
        }
      }, 1000);
    };

    // 洗牌
    const shuffleCards = () => {
      if (gameState.value !== "playing") return;

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
              colIndex: j,
            };
            index++;
          }
        }
      }

      board.value = newBoard;
      selectedCard.value = null;
      connectingPath.value = [];
    };

    // 提示功能 - 修改为自动匹配一对卡片
    const showHint = () => {
      if (gameState.value !== "playing" || hintsRemaining.value <= 0) return;

      // 寻找可以连接的卡片对
      let foundPairs = [];

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
              if (
                board.value[i][j].type.symbol === board.value[m][n].type.symbol
              ) {
                const path = findPath(
                  board.value,
                  board.value[i][j],
                  board.value[m][n]
                );
                if (path.length > 0) {
                  foundPairs.push({
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

      // 如果找到可匹配的对子
      if (foundPairs.length > 0) {
        // 随机选择一对
        const randomPair =
          foundPairs[Math.floor(Math.random() * foundPairs.length)];
        const card1 = board.value[randomPair.card1.row][randomPair.card1.col];
        const card2 = board.value[randomPair.card2.row][randomPair.card2.col];

        // 显示连接路径
        connectingPath.value = randomPair.path;

        // 先高亮显示选中的卡片
        card1.hinted = true;
        card2.hinted = true;

        // 延迟后自动匹配
        setTimeout(() => {
          // 标记卡片为已匹配
          board.value[randomPair.card1.row][
            randomPair.card1.col
          ].matched = true;
          board.value[randomPair.card2.row][
            randomPair.card2.col
          ].matched = true;

          // 清除高亮和路径
          card1.hinted = false;
          card2.hinted = false;
          connectingPath.value = [];

          // 减少可用提示次数
          hintsRemaining.value--;

          // 检查游戏是否胜利
          if (remainingPairs.value === 0) {
            gameState.value = "won";
            clearInterval(timer.value);
          }
        }, 1000);
      }
    };

    const handleCardClick = (card) => {
      // Don't allow clicks during preview mode or if the game isn't active
      if (isPreviewMode.value || gameState.value !== "playing" || card.matched)
        return;

      // First-time card selection
      if (selectedCard.value === null) {
        selectedCard.value = card;
        return;
      }

      // Clicked the same card, deselect it
      if (
        selectedCard.value.rowIndex === card.rowIndex &&
        selectedCard.value.colIndex === card.colIndex
      ) {
        selectedCard.value = null;
        return;
      }

      // Try to connect two cards
      if (canConnect(board.value, selectedCard.value, card)) {
        // Find connection path
        connectingPath.value = findPath(board.value, selectedCard.value, card);

        // Show connection animation, then remove cards
        setTimeout(() => {
          // Mark cards as matched
          board.value[selectedCard.value.rowIndex][
            selectedCard.value.colIndex
          ].matched = true;
          board.value[card.rowIndex][card.colIndex].matched = true;

          // Clear selection and path
          selectedCard.value = null;
          connectingPath.value = [];

          // Check if game is won
          if (remainingPairs.value === 0) {
            gameState.value = "won";
            clearInterval(timer.value);
          }
        }, 500);
      } else {
        // Select different card
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
      isPreviewMode,
      previewCountdown,
      hintsRemaining,
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
  overflow-x: hidden; /* 防止水平滚动条 */
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

/* 添加到HTML和BODY, 可以放到main.js中引入的全局CSS中 */
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

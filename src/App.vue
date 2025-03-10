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
      @card-click="debouncedHandleCardClick"
    />
    <GameControls
      @new-game="startNewGame"
      @shuffle="shuffleCards"
      @hint="showHint"
      :gameState="gameState"
      :hintsRemaining="hintsRemaining"
    />

    <!-- 调试信息 -->
    <div v-if="isDebugMode" class="debug-info">
      <p>游戏状态: {{ gameState }}</p>
      <p>正在处理匹配: {{ isProcessingMatch }}</p>
      <p>
        已选卡片:
        {{
          selectedCard
            ? `(${selectedCard.rowIndex},${selectedCard.colIndex})`
            : "无"
        }}
      </p>
      <p>连接路径: {{ connectingPath.length }}</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
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
    // 调试模式
    // 优化1: 默认关闭调试模式
    const isDebugMode = ref(false); // 原来是true

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
    // 标记是否正在处理卡片匹配的状态
    const isProcessingMatch = ref(false);
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

    // 优化5: 简化initGame函数
    const initGame = () => {
      clearTimers();
      board.value = createGameCards(rows, cols);
      selectedCard.value = null;
      previousCard.value = null;
      connectingPath.value = [];
      timeLeft.value = gameDuration;
      gameState.value = "ready";
      hintsRemaining.value = maxHints;
      previewCountdown.value = previewDuration;
      isProcessingMatch.value = false;
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

    // 优化2: 简化debounce函数
    const debounce = (fn, delay) => {
      let timer = null;
      return (...args) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
      };
    };

    // 为handleCardClick添加防抖保护
    const debouncedHandleCardClick = debounce((card) => {
      handleCardClick(card);
    }, 300);

    // 优化6: 简化startNewGame函数
    const startNewGame = () => {
      initGame();
      gameState.value = "preview";

      previewTimer.value = setInterval(() => {
        if (previewCountdown.value > 0) {
          previewCountdown.value--;
        } else {
          clearInterval(previewTimer.value);
          previewTimer.value = null;
          gameState.value = "playing";
          nextTick(() => startTimer());
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
          console.log("时间到，游戏结束");
        }
      }, 1000);
    };

    const shuffleCards = () => {
      if (gameState.value !== "playing") return;

      // 防止在处理匹配时洗牌
      if (isProcessingMatch.value) return;

      console.log("洗牌开始");

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
      console.log("洗牌完成");
    };

    const resetSelection = () => {
      console.log("重置选择状态");
      selectedCard.value = null;
      previousCard.value = null;

      // 清除连接路径
      connectingPath.value = [];

      // 重置正在处理匹配的标志
      isProcessingMatch.value = false;
    };

    // 优化4: 简化showHint函数
    const showHint = () => {
      if (
        gameState.value !== "playing" ||
        hintsRemaining.value <= 0 ||
        isProcessingMatch.value
      )
        return;

      isProcessingMatch.value = true;
      const matchablePairs = findMatchablePairs();

      if (matchablePairs.length > 0) {
        const pair =
          matchablePairs[Math.floor(Math.random() * matchablePairs.length)];
        const card1 = board.value[pair.card1.row][pair.card1.col];
        const card2 = board.value[pair.card2.row][pair.card2.col];

        card1.hinted = true;
        card2.hinted = true;
        connectingPath.value = pair.path;

        setTimeout(() => {
          card1.matched = true;
          card2.matched = true;
          card1.hinted = false;
          card2.hinted = false;

          setTimeout(() => {
            connectingPath.value = [];
            isProcessingMatch.value = false;
            hintsRemaining.value--;
            checkWinCondition();
          }, 600);
        }, 1200);
      } else {
        isProcessingMatch.value = false;
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
              if (
                board.value[i][j].type.symbol === board.value[m][n].type.symbol
              ) {
                if (
                  canConnect(board.value, board.value[i][j], board.value[m][n])
                ) {
                  const path = findPath(
                    board.value,
                    board.value[i][j],
                    board.value[m][n]
                  );
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

    // 仅修改handleCardClick函数，解决点击事件问题

    // 优化3: 简化handleCardClick函数
    const handleCardClick = (card) => {
      // 基本游戏状态检查 - 合并多个条件判断
      if (
        gameState.value !== "playing" ||
        card.matched ||
        isProcessingMatch.value
      )
        return;

      // 如果没有选择卡片，记录第一次选择
      if (selectedCard.value === null) {
        selectedCard.value = card;
        return;
      }

      // 点击同一张卡片，取消选择
      if (
        selectedCard.value.rowIndex === card.rowIndex &&
        selectedCard.value.colIndex === card.colIndex
      ) {
        selectedCard.value = null;
        return;
      }

      // 保存第一张卡片的引用，然后尝试匹配
      const firstCard = selectedCard.value;
      isProcessingMatch.value = true;
      processCardMatching(firstCard, card);
    };

    const processCardMatching = (card1, card2) => {
      // 高亮显示这两张卡片
      selectedCard.value = card1;
      previousCard.value = card2;

      // 检查是否可以连接
      if (card1.type.symbol === card2.type.symbol) {
        console.log("卡片类型匹配，检查是否可连接");
        // 使用canConnect函数检查是否可以连接
        if (canConnect(board.value, card1, card2)) {
          // 找到连接路径
          const path = findPath(board.value, card1, card2);

          if (path && path.length > 0) {
            console.log("找到连接路径，长度:", path.length);
            // 确保路径有效再赋值
            connectingPath.value = path;

            // 显示连接并延迟匹配
            setTimeout(() => {
              console.log("设置卡片为已匹配状态");
              // 设置为已匹配
              board.value[card1.rowIndex][card1.colIndex].matched = true;
              board.value[card2.rowIndex][card2.colIndex].matched = true;

              // 延长连线显示时间
              setTimeout(() => {
                console.log("清除连接路径和重置选择状态");
                // 清除连接路径
                connectingPath.value = [];

                // 重置状态
                resetSelection();

                // 检查游戏是否结束
                checkWinCondition();
              }, 600); // 保持连线显示600ms
            }, 400); // 等待400ms后匹配
            return;
          } else {
            console.log("未找到有效连接路径");
          }
        } else {
          console.log("卡片无法连接");
        }
      } else {
        console.log("卡片类型不匹配");
      }

      // 如果执行到这里，说明匹配失败
      console.log("匹配失败，重置状态");

      // 不能连接或类型不匹配，显示短暂的失败视觉反馈后重置
      setTimeout(() => {
        resetSelection();
      }, 800);
    };

    const checkWinCondition = () => {
      if (remainingPairs.value === 0) {
        console.log("恭喜！游戏胜利");
        gameState.value = "won";
        clearInterval(timer.value);
      }
    };

    // 添加监听器确保路径绘制正确
    watch(
      () => connectingPath.value,
      (newPath) => {
        if (newPath.length > 0) {
          console.log("App监测到路径变化:", newPath);
        }
      },
      { deep: true }
    );

    // 生命周期钩子
    onMounted(() => {
      console.log("App组件挂载完成");
      initGame();

      // 添加键盘快捷键
      window.addEventListener("keydown", handleKeyDown);
    });

    onUnmounted(() => {
      clearTimers();
      window.removeEventListener("keydown", handleKeyDown);
    });

    // 键盘快捷键处理
    const handleKeyDown = (event) => {
      // 按D键切换调试模式
      if (event.key.toLowerCase() === "d") {
        isDebugMode.value = !isDebugMode.value;
        console.log("调试模式:", isDebugMode.value ? "开启" : "关闭");
      }

      // 按N键开始新游戏
      if (event.key.toLowerCase() === "n") {
        startNewGame();
      }

      // 按S键洗牌
      if (event.key.toLowerCase() === "s" && gameState.value === "playing") {
        shuffleCards();
      }

      // 按H键提示
      if (event.key.toLowerCase() === "h" && gameState.value === "playing") {
        showHint();
      }
    };

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
      isProcessingMatch,
      isDebugMode,
      // 游戏操作

      debouncedHandleCardClick,
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

/* 调试信息面板 */
.debug-info {
  position: fixed;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-size: 12px;
  text-align: left;
  z-index: 1000;
  max-width: 300px;
}

.debug-info p {
  margin: 5px 0;
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

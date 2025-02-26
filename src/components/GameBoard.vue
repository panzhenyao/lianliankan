<template>
    <div class="game-board-container">
      <div class="game-board">
        <div class="board-grid" :style="boardGridStyle">
          <div
            v-for="(row, rowIndex) in board"
            :key="`row-${rowIndex}`"
            class="board-row"
          >
            <GameCard
              v-for="(card, colIndex) in row"
              :key="`${rowIndex}-${colIndex}`"
              :card="card"
              :isSelected="isCardSelected(card)"
              :isPrevious="isCardPrevious(card)"
              :isHinted="card.hinted"
              :isPreviewMode="isPreviewMode"
              @click="$emit('card-click', card)"
            />
          </div>
  
          <!-- 连接线 -->
          <svg class="connecting-lines" v-if="connectingPath && connectingPath.length > 0">
            <polyline
              :points="pathPoints"
              stroke="#ff9500"
              stroke-width="4"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-dasharray="5,5"
              class="connecting-path"
            />
          </svg>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { computed, ref, onMounted, nextTick, watch, onUnmounted } from "vue";
  import GameCard from "./GameCard.vue";
  
  export default {
    name: "GameBoard",
    components: {
      GameCard,
    },
    props: {
      board: {
        type: Array,
        required: true,
        default: () => [],
      },
      selectedCard: {
        type: Object,
        default: null,
      },
      previousCard: {
        type: Object,
        default: null,
      },
      connectingPath: {
        type: Array,
        default: () => [],
      },
      isPreviewMode: {
        type: Boolean,
        default: false,
      },
    },
    emits: ["card-click"],
    setup(props) {
      console.log("GameBoard setup with props:", 
        { 
          boardLength: props.board?.length,
          pathLength: props.connectingPath?.length 
        }
      );
      
      // 计算棋盘网格样式
      const boardGridStyle = computed(() => {
        if (!props.board || props.board.length === 0) {
          return {
            gridTemplateRows: "repeat(1, 1fr)",
            gridTemplateColumns: "repeat(1, 1fr)",
          };
        }
  
        const rowCount = props.board.length;
        const colCount = props.board[0]?.length || 1;
  
        return {
          gridTemplateRows: `repeat(${rowCount}, 1fr)`,
          gridTemplateColumns: `repeat(${colCount}, 1fr)`,
        };
      });
  
      // 卡片选择状态判断
      const isCardSelected = (card) => {
        if (!props.selectedCard) return false;
        return (
          props.selectedCard.rowIndex === card.rowIndex &&
          props.selectedCard.colIndex === card.colIndex
        );
      };
  
      const isCardPrevious = (card) => {
        if (!props.previousCard) return false;
        return (
          props.previousCard.rowIndex === card.rowIndex &&
          props.previousCard.colIndex === card.colIndex
        );
      };
  
      // 卡片尺寸测量
      const cardWidth = ref(0);
      const cardHeight = ref(0);
  
      // 计算连接线路径点
      const pathPoints = computed(() => {
        if (!props.connectingPath || props.connectingPath.length === 0) return "";
  
        // 获取棋盘元素
        const boardElement = document.querySelector(".board-grid");
        if (!boardElement || !props.board.length || !props.board[0]?.length) {
          return "";
        }
  
        // 计算卡片尺寸
        const boardWidth = boardElement.clientWidth;
        const boardHeight = boardElement.clientHeight;
        const rowCount = props.board.length;
        const colCount = props.board[0].length;
        
        // 计算单个卡片尺寸（考虑间距）
        const cellWidth = boardWidth / colCount;
        const cellHeight = boardHeight / rowCount;
  
        // 生成路径点坐标
        return props.connectingPath
          .map((point) => {
            // 确保point对象包含row和col属性
            if (typeof point.row !== 'number' || typeof point.col !== 'number') {
              console.error('Invalid path point:', point);
              return '';
            }
            
            // 计算卡片中心点坐标
            const x = point.col * cellWidth + cellWidth / 2;
            const y = point.row * cellHeight + cellHeight / 2;
            return `${x},${y}`;
          })
          .filter(coord => coord !== '')  // 过滤掉无效坐标
          .join(" ");
      });
  
      // 测量实际卡片大小的函数
      const measureCardSize = () => {
        nextTick(() => {
          const boardElement = document.querySelector(".board-grid");
          if (!boardElement || !props.board.length || !props.board[0]?.length) {
            return;
          }
  
          const rowCount = props.board.length;
          const colCount = props.board[0].length;
          const boardWidth = boardElement.clientWidth;
          const boardHeight = boardElement.clientHeight;
  
          // 计算单个卡片尺寸
          const gapSize = 5; // 间隙大小
          const availableWidth = boardWidth - gapSize * (colCount - 1);
          const availableHeight = boardHeight - gapSize * (rowCount - 1);
  
          cardWidth.value = availableWidth / colCount;
          cardHeight.value = availableHeight / rowCount;
        });
      };
  
      // 在组件挂载和更新时测量卡片大小
      onMounted(() => {
        measureCardSize();
        window.addEventListener("resize", measureCardSize);
      });
  
      onUnmounted(() => {
        window.removeEventListener("resize", measureCardSize);
      });
  
      // 当棋盘变化时重新测量
      watch(() => props.board, measureCardSize, { deep: true });
      
      // 监听连接路径的变化
      watch(() => props.connectingPath, (newPath) => {
        console.log("连接路径变化:", newPath);
      }, { deep: true });
  
      return {
        boardGridStyle,
        isCardSelected,
        isCardPrevious,
        pathPoints,
      };
    },
  };
  </script>
  
  <style scoped>
  .game-board-container {
    width: 100%;
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }
  
  .game-board {
    position: relative;
    width: 100%;
    height: 100%;
    max-width: min(600px, 90vw);
    max-height: min(600px, 60vh);
    box-sizing: border-box;
    padding: 0 10px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .board-grid {
    display: grid;
    gap: 5px;
    background-color: #f5f5f5;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    width: 100%;
    height: 100%;
    aspect-ratio: 1;
  }
  
  .board-row {
    display: contents;
  }
  
  .connecting-lines {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 20; /* 提高z-index确保在卡片上方 */
  }
  
  .connecting-path {
    animation: dash 1s linear infinite, glow 1.5s ease-in-out infinite;
  }
  
  @keyframes dash {
    to {
      stroke-dashoffset: -20;
    }
  }
  
  @keyframes glow {
    0%, 100% { stroke: #ff9500; stroke-width: 3px; }
    50% { stroke: #ffcc00; stroke-width: 5px; }
  }
  
  /* 响应式样式 */
  @media (max-width: 768px) {
    .game-board {
      max-width: 100%;
      max-height: 50vh;
    }
  
    .board-grid {
      gap: 3px;
      padding: 8px;
    }
  }
  
  @media (max-width: 480px) {
    .board-grid {
      gap: 2px;
      padding: 5px;
    }
  }
  </style>
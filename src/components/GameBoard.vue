<template>
    <div class="game-board-container">
      <div class="game-board">
        <div 
          class="board-grid"
          :style="boardGridStyle"
        >
          <div v-for="(row, rowIndex) in board" :key="`row-${rowIndex}`" class="board-row">
            <GameCard 
              v-for="(card, colIndex) in row"
              :key="`${rowIndex}-${colIndex}`"
              :card="card"
              :isSelected="isCardSelected(card)"
              :isHinted="card.hinted"
              :isPreviewMode="isPreviewMode"
              @click="$emit('card-click', card)"
            />
          </div>
          
          <!-- 连接线 -->
          <svg class="connecting-lines" v-if="connectingPath.length > 0">
            <polyline 
              :points="pathPoints" 
              stroke="#ff9500" 
              stroke-width="3" 
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
  import { computed, ref, onMounted, nextTick, watch } from 'vue';
  import GameCard from './GameCard.vue';
  
  export default {
    name: 'GameBoard',
    components: {
      GameCard
    },
    props: {
      board: {
        type: Array,
        required: true,
        default: () => []
      },
      selectedCard: {
        type: Object,
        default: null
      },
      connectingPath: {
        type: Array,
        default: () => []
      },
      isPreviewMode: {
        type: Boolean,
        default: false
      }
    },
    setup(props) {
      // 计算棋盘样式，添加安全检查
      const boardGridStyle = computed(() => {
        if (!props.board || props.board.length === 0) {
          return {
            gridTemplateRows: 'repeat(1, 1fr)',
            gridTemplateColumns: 'repeat(1, 1fr)'
          };
        }
        
        const firstRow = props.board[0] || [];
        
        return {
          gridTemplateRows: `repeat(${props.board.length}, 1fr)`,
          gridTemplateColumns: `repeat(${firstRow.length}, 1fr)`
        };
      });
      
      // 计算卡片是否被选中
      const isCardSelected = (card) => {
        if (!props.selectedCard) return false;
        return (
          props.selectedCard.rowIndex === card.rowIndex && 
          props.selectedCard.colIndex === card.colIndex
        );
      };
      
      // 卡片大小测量
      const cardWidth = ref(60);
      const cardHeight = ref(60);
      
      // 测量实际卡片大小的函数
      const measureCardSize = () => {
        nextTick(() => {
          const cardElement = document.querySelector('.game-card');
          if (cardElement) {
            cardWidth.value = cardElement.offsetWidth;
            cardHeight.value = cardElement.offsetHeight;
          }
        });
      };
      
      // 在组件挂载后测量实际卡片大小
      onMounted(() => {
        measureCardSize();
        
        // 添加窗口大小变化监听，确保在屏幕大小变化时重新计算
        window.addEventListener('resize', measureCardSize);
      });
      
      // 在卸载时移除事件监听器
      onMounted(() => {
        return () => {
          window.removeEventListener('resize', measureCardSize);
        };
      });
      
      // 当board变化时重新测量
      watch(() => props.board, () => {
        measureCardSize();
      });
      
      // 计算连接线的路径点
      const pathPoints = computed(() => {
        if (!props.connectingPath.length) return '';
        
        // 使用测量的卡片尺寸
        return props.connectingPath.map(point => {
          const x = point.col * cardWidth.value + cardWidth.value / 2;
          const y = point.row * cardHeight.value + cardHeight.value / 2;
          return `${x},${y}`;
        }).join(' ');
      });
      
      return {
        isCardSelected,
        pathPoints,
        boardGridStyle
      };
    }
  };
  </script>
  
  <style scoped>
  .game-board-container {
    width: 100%;
    display: flex;
    justify-content: center;
    overflow: hidden; /* 防止内容溢出 */
  }
  
  .game-board {
    position: relative;
    margin: 20px auto;
    width: 100%;
    max-width: 600px; /* 限制最大宽度 */
    box-sizing: border-box;
    padding: 0 10px; /* 添加一些内边距，避免触碰到屏幕边缘 */
  }
  
  .board-grid {
    display: grid;
    gap: 5px;
    background-color: #f5f5f5;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    max-height: 70vh; /* 限制最大高度，避免在小屏幕上太大 */
    overflow: hidden;
  }
  
  .board-row {
    display: contents; /* 使行内元素直接成为grid的子元素 */
  }
  
  .connecting-lines {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 2;
  }
  
  .connecting-path {
    animation: dash 1s linear infinite;
  }
  
  @keyframes dash {
    to {
      stroke-dashoffset: -20;
    }
  }
  
  /* 添加响应式样式 */
  @media (max-width: 768px) {
    .game-board {
      max-width: 100%;
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
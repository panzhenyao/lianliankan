<!-- Update GameBoard.vue -->
<template>
    <div class="game-board">
      <div 
        class="board-grid"
        :style="{ 
          gridTemplateRows: `repeat(${board.length}, 1fr)`,
          gridTemplateColumns: `repeat(${board[0].length}, 1fr)`
        }"
      >
        <div v-for="(row, rowIndex) in board" :key="`row-${rowIndex}`">
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
  </template>
  
  <script>
  import { computed } from 'vue';
  import GameCard from './GameCard.vue';
  
  export default {
    name: 'GameBoard',
    components: {
      GameCard
    },
    props: {
      board: {
        type: Array,
        required: true
      },
      selectedCard: {
        type: Object,
        default: null
      },
      connectingPath: {
        type: Array,
        default: () => []
      },
      isPreviewMode: {  // Add this new prop
        type: Boolean,
        default: false
      }
    },
    setup(props) {
      // 计算卡片是否被选中
      const isCardSelected = (card) => {
        if (!props.selectedCard) return false;
        return (
          props.selectedCard.rowIndex === card.rowIndex && 
          props.selectedCard.colIndex === card.colIndex
        );
      };
      
      // 计算连接线的路径点
      const pathPoints = computed(() => {
        if (!props.connectingPath.length) return '';
        
        // 计算每个格子的大小
        const cardWidth = 60;
        const cardHeight = 60;
        
        // 将路径点转换为SVG坐标
        return props.connectingPath.map(point => {
          const x = point.col * cardWidth + cardWidth / 2;
          const y = point.row * cardHeight + cardHeight / 2;
          return `${x},${y}`;
        }).join(' ');
      });
      
      return {
        isCardSelected,
        pathPoints
      };
    }
  };
  </script>
  
  <style scoped>
  /* No changes needed to the styles */
  .game-board {
    position: relative;
    margin: 20px auto;
    width: 100%;
    max-width: 600px;
  }
  
  .board-grid {
    display: grid;
    gap: 5px;
    background-color: #f5f5f5;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  </style>
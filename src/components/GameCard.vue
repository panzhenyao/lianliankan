<template>
    <div 
      class="game-card" 
      :class="{ 
        'selected': isSelected, 
        'matched': card.matched && !isPreviewMode,
        'hinted': isHinted,
        'preview': isPreviewMode
      }"
      @click="handleClick"
    >
      <div class="card-inner" v-if="!card.matched || isPreviewMode">
        <div class="card-content" :style="{ color: card.type.color }">
          {{ card.type.symbol }}
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'GameCard',
    props: {
      card: {
        type: Object,
        required: true
      },
      isSelected: {
        type: Boolean,
        default: false
      },
      isHinted: {
        type: Boolean,
        default: false
      },
      isPreviewMode: {
        type: Boolean,
        default: false
      }
    },
    setup(props, { emit }) {
      const handleClick = () => {
        if (!props.card.matched && !props.isPreviewMode) {
          emit('click');
        }
      };
      
      return {
        handleClick
      };
    }
  };
  </script>
  
  <style scoped>
  .game-card {
    width: 100%;
    aspect-ratio: 1;
    background-color: #ffffff;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: relative;
    user-select: none;
    max-width: 60px; /* 限制最大宽度 */
    max-height: 60px; /* 限制最大高度 */
    margin: 0 auto; /* 居中 */
  }
  
  .game-card.selected {
    box-shadow: 0 0 0 3px #42b983, 0 2px 4px rgba(0, 0, 0, 0.1);
    transform: scale(1.05);
    z-index: 1;
  }
  
  .game-card.matched {
    visibility: hidden;
    opacity: 0;
    transform: scale(0.8);
  }
  
  .game-card.hinted {
    animation: pulse 1s infinite;
  }
  
  .game-card.preview {
    box-shadow: 0 0 10px rgba(233, 168, 38, 0.8);
    animation: previewPulse 2s infinite;
  }
  
  .card-inner {
    width: 90%;
    height: 90%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f8f8f8;
    border-radius: 5px;
    border: 1px solid #e0e0e0;
  }
  
  .card-content {
    font-size: 1.5rem; /* 使用相对单位 */
    font-weight: bold;
    /* 确保文字不溢出 */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(66, 185, 131, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(66, 185, 131, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(66, 185, 131, 0);
    }
  }
  
  @keyframes previewPulse {
    0% {
      box-shadow: 0 0 5px rgba(233, 168, 38, 0.5);
    }
    50% {
      box-shadow: 0 0 15px rgba(233, 168, 38, 0.8);
    }
    100% {
      box-shadow: 0 0 5px rgba(233, 168, 38, 0.5);
    }
  }
  
  /* 响应式调整 */
  @media (max-width: 768px) {
    .game-card {
      max-width: 50px;
      max-height: 50px;
    }
    
    .card-content {
      font-size: 1.2rem;
    }
  }
  
  @media (max-width: 480px) {
    .game-card {
      max-width: 40px;
      max-height: 40px;
    }
    
    .card-content {
      font-size: 1rem;
    }
  }
  </style>
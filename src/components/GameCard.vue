<template>
    <div 
      class="game-card" 
      :class="{ 
        'selected': isSelected, 
        'matched': card.matched && !isPreviewMode,
        'hinted': isHinted,
        'preview': isPreviewMode,
        'flipped': showFront
      }"
      @click="handleClick"
    >
      <div class="card-inner" :class="{'is-flipped': !showFront}">
        <div class="card-front" v-if="showFront">
          <div class="card-content" :style="{ color: card.type.color }">
            {{ card.type.symbol }}
          </div>
        </div>
        <div class="card-back" v-else>
          <div class="card-back-content">?</div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { computed } from 'vue';
  
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
      // Compute whether to show the front of the card
      const showFront = computed(() => {
        // During preview mode, cards should be face-down (back)
        if (props.isPreviewMode) {
          return false;
        }
        
        // Show front if card is selected or hinted
        if (props.isSelected || props.isHinted) {
          return true;
        }
        
        // Show front if card is matched
        if (props.card.matched) {
          return true;
        }
        
        // Otherwise, keep the card face-down
        return false;
      });
      
      const handleClick = () => {
        if (!props.card.matched && !props.isPreviewMode) {
          emit('click');
        }
      };
      
      return {
        handleClick,
        showFront
      };
    }
  };
  </script>
  
  <style scoped>
  .game-card {
    width: 100%;
    aspect-ratio: 1;
    background-color: transparent;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    position: relative;
    user-select: none;
    max-width: 60px; /* 限制最大宽度 */
    max-height: 60px; /* 限制最大高度 */
    margin: 0 auto; /* 居中 */
    perspective: 1000px; /* 3D effect */
  }
  
  .card-inner {
    width: 100%;
    height: 100%;
    position: relative;
    transition: transform 0.6s;
    transform-style: preserve-3d;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
  }
  
  .card-inner.is-flipped {
    transform: rotateY(180deg);
  }
  
  .card-front, .card-back {
    width: 100%;
    height: 100%;
    position: absolute;
    backface-visibility: hidden;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .card-front {
    background-color: #f8f8f8;
    border: 1px solid #e0e0e0;
  }
  
  .card-back {
    background-color: #2c3e50;
    transform: rotateY(180deg);
    border: 1px solid #1c2e40;
  }
  
  .card-back-content {
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
  }
  
  .card-content {
    font-size: 1.5rem; /* 使用相对单位 */
    font-weight: bold;
    /* 确保文字不溢出 */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .game-card.selected .card-inner {
    box-shadow: 0 0 0 3px #42b983, 0 2px 4px rgba(0, 0, 0, 0.1);
    transform: scale(1.05);
    z-index: 10;
  }
  
  .game-card.matched {
    visibility: hidden;
    opacity: 0;
    transform: scale(0.8);
  }
  
  .game-card.hinted .card-inner {
    animation: pulse 1s infinite;
  }
  
  .game-card.preview .card-inner {
    box-shadow: 0 0 10px rgba(233, 168, 38, 0.8);
    animation: previewPulse 2s infinite;
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
    
    .card-content, .card-back-content {
      font-size: 1.2rem;
    }
  }
  
  @media (max-width: 480px) {
    .game-card {
      max-width: 40px;
      max-height: 40px;
    }
    
    .card-content, .card-back-content {
      font-size: 1rem;
    }
  }
  </style>
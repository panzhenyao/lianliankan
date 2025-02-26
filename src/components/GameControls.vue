<template>
    <div class="game-controls">
      <button
        class="control-button new-game"
        @click="$emit('new-game')"
        :disabled="isLoading"
      >
        {{ gameState === "playing" ? "重新开始" : "新游戏" }}
      </button>
  
      <button
        class="control-button shuffle"
        @click="$emit('shuffle')"
        :disabled="gameState !== 'playing' || isLoading"
      >
        洗牌
      </button>
  
      <button
        class="control-button hint"
        @click="$emit('hint')"
        :disabled="gameState !== 'playing' || hintsRemaining <= 0 || isLoading"
      >
        提示 ({{ hintsRemaining }})
      </button>
    </div>
  </template>
  
  <script>
  import { ref, watch } from 'vue';
  
  export default {
    name: "GameControls",
    props: {
      gameState: {
        type: String,
        required: true
      },
      hintsRemaining: {
        type: Number,
        default: 3
      }
    },
    emits: ["new-game", "shuffle", "hint"],
    setup(props) {
      // 按钮加载状态，防止连续点击
      const isLoading = ref(false);
      
      // 当游戏状态改变时，重置加载状态
      watch(() => props.gameState, () => {
        isLoading.value = false;
      });
      
      return {
        isLoading
      };
    }
  };
  </script>
  
  <style scoped>
  .game-controls {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
    flex-wrap: wrap;
    padding: 0 10px 10px;
  }
  
  .control-button {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 100px;
    position: relative;
    overflow: hidden;
  }
  
  .control-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .control-button::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, 0.5);
    opacity: 0;
    border-radius: 100%;
    transform: scale(1, 1) translate(-50%);
    transform-origin: 50% 50%;
  }
  
  .control-button:not(:disabled):active::after {
    animation: ripple 0.4s ease-out;
  }
  
  @keyframes ripple {
    0% {
      transform: scale(0, 0);
      opacity: 0.5;
    }
    100% {
      transform: scale(20, 20);
      opacity: 0;
    }
  }
  
  .new-game {
    background-color: #42b983;
    color: white;
  }
  
  .new-game:hover:not(:disabled) {
    background-color: #3aa876;
  }
  
  .shuffle {
    background-color: #3498db;
    color: white;
  }
  
  .shuffle:hover:not(:disabled) {
    background-color: #2980b9;
  }
  
  .hint {
    background-color: #f1c40f;
    color: #333;
  }
  
  .hint:hover:not(:disabled) {
    background-color: #e5b90c;
  }
  
  /* 响应式样式 */
  @media (max-width: 480px) {
    .game-controls {
      gap: 10px;
    }
    
    .control-button {
      padding: 8px 15px;
      min-width: 80px;
      font-size: 14px;
    }
  }
  </style>
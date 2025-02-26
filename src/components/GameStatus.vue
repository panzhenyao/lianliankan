<template>
    <div class="game-status">
      <div class="status-item">
        <div class="label">剩余配对</div>
        <div class="value">{{ remainingPairs }}</div>
      </div>
  
      <div class="status-item">
        <div class="label">剩余时间</div>
        <div class="value" :class="{ warning: timeLeft < 30 }">
          {{ formatTime(timeLeft) }}
        </div>
      </div>
  
      <div class="status-item">
        <div class="label">提示</div>
        <div class="value" :class="{ warning: hintsRemaining === 0 }">
          {{ hintsRemaining }}
        </div>
      </div>
  
      <!-- 游戏状态消息 -->
      <transition name="fade">
        <div
          class="status-message"
          v-if="gameState !== 'playing' && gameState !== 'ready' && gameState !== 'preview'"
        >
          {{ statusMessage }}
        </div>
      </transition>
  
      <!-- 预览倒计时 -->
      <transition name="fade">
        <div class="preview-overlay" v-if="gameState === 'preview'">
          <div class="preview-message">记忆卡片位置</div>
          <div class="preview-countdown">{{ previewCountdown }}</div>
        </div>
      </transition>
    </div>
  </template>
  
  <script>
  import { computed } from "vue";
  
  export default {
    name: "GameStatus",
    props: {
      remainingPairs: {
        type: Number,
        required: true,
      },
      timeLeft: {
        type: Number,
        required: true,
      },
      gameState: {
        type: String,
        required: true,
      },
      previewCountdown: {
        type: Number,
        default: 0,
      },
      hintsRemaining: {
        type: Number,
        default: 3,
      },
    },
    setup(props) {
      // 格式化时间 (MM:SS)
      const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
      };
  
      // 根据游戏状态显示的消息
      const statusMessage = computed(() => {
        const messages = {
          won: "恭喜你赢了！",
          lost: "时间到，游戏结束！",
          paused: "游戏已暂停",
          preview: "记忆卡片位置",
        };
        
        return messages[props.gameState] || "";
      });
  
      return {
        formatTime,
        statusMessage,
      };
    },
  };
  </script>
  
  <style scoped>
  .game-status {
    display: flex;
    justify-content: space-around;
    margin-bottom: 20px;
    position: relative;
  }
  
  .status-item {
    text-align: center;
    padding: 10px;
    background-color: #f8f8f8;
    border-radius: 8px;
    min-width: 80px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .label {
    font-size: 14px;
    color: #666;
    margin-bottom: 5px;
  }
  
  .value {
    font-size: 18px;
    font-weight: bold;
    color: #2c3e50;
  }
  
  .value.warning {
    color: #e74c3c;
  }
  
  .status-message {
    position: absolute;
    width: 100%;
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    color: #42b983;
    margin-top: 40px;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    z-index: 10;
  }
  
  /* 预览模式样式 */
  .preview-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    user-select: none;
  }
  
  .preview-message {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 20px;
  }
  
  .preview-countdown {
    font-size: 72px;
    font-weight: bold;
  }
  
  /* 过渡动画 */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  
  /* 响应式样式 */
  @media (max-width: 768px) {
    .status-item {
      padding: 8px;
      min-width: 70px;
    }
    
    .label {
      font-size: 12px;
    }
    
    .value {
      font-size: 16px;
    }
    
    .preview-message {
      font-size: 24px;
    }
    
    .preview-countdown {
      font-size: 60px;
    }
  }
  
  @media (max-width: 480px) {
    .status-item {
      padding: 5px;
      min-width: 60px;
    }
    
    .label {
      font-size: 11px;
    }
    
    .value {
      font-size: 14px;
    }
    
    .preview-message {
      font-size: 20px;
    }
    
    .preview-countdown {
      font-size: 48px;
    }
  }
  </style>
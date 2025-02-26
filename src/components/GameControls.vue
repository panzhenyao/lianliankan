<template>
    <div class="game-controls">
      <button 
        class="control-button new-game"
        @click="$emit('new-game')"
      >
        新游戏
      </button>
      
      <button 
        class="control-button shuffle"
        @click="$emit('shuffle')"
        :disabled="gameState !== 'playing'"
      >
        洗牌
      </button>
      
      <button 
        class="control-button hint"
        @click="$emit('hint')"
        :disabled="gameState !== 'playing'"
      >
        提示
      </button>
    </div>
  </template>
  
  <script>
  export default {
    name: 'GameControls',
    props: {
      gameState: {
        type: String,
        required: true
      }
    },
    emits: ['new-game', 'shuffle', 'hint']
  };
  </script>
  
  <style scoped>
  .game-controls {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
  }
  
  .control-button {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 100px;
  }
  
  .control-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
  </style>
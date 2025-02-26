<template>
    <div 
      class="game-card" 
      :class="{ 
        'selected': isSelected, 
        'matched': card.matched,
        'hinted': isHinted
      }"
      @click="handleClick"
    >
      <div class="card-inner" v-if="!card.matched">
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
      }
    },
    setup(props, { emit }) {
      const handleClick = () => {
        if (!props.card.matched) {
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
    font-size: 24px;
    font-weight: bold;
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
  </style>
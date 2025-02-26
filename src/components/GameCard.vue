<template>
  <div
    class="game-card"
    :class="{
      selected: isSelected,
      matched: card.matched && !isPreviewMode,
      hinted: isHinted,
      preview: isPreviewMode,
      previous: isPrevious
    }"
    @click.stop="handleClick"
  >
    <div class="card-inner" :class="{ 'is-flipped': !showFront }">
      <div class="card-front">
        <div class="card-content" :style="{ color: card.type.color }">
          {{ card.type.symbol }}
        </div>
      </div>
      <div class="card-back">
        <div class="card-back-content">?</div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, watch } from "vue";

export default {
  name: "GameCard",
  props: {
    card: {
      type: Object,
      required: true,
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
    isHinted: {
      type: Boolean,
      default: false,
    },
    isPreviewMode: {
      type: Boolean,
      default: false,
    },
    isPrevious: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    // 显示卡片正面的计算属性
    const showFront = computed(() => {
      // 当卡片被选中、是第二张临时卡片、提示中或已匹配时显示正面
      if (
        props.isSelected ||
        props.isPrevious ||
        props.isHinted ||
        props.card.matched
      ) {
        return true;
      }

      // 预览模式下显示正面
      if (props.isPreviewMode) {
        return true;
      }

      // 其他情况显示背面
      return false;
    });

    // 处理点击事件 - 修复重复点击问题
    const handleClick = (event) => {
      // 添加事件终止，防止冒泡
      event.preventDefault();
      event.stopPropagation();
      
      // 检查游戏状态条件
      if (props.isPreviewMode || props.card.matched) {
        console.log("忽略点击: 预览模式或已匹配");
        return;
      }
      
      // 记录点击发送给父组件
      console.log(`Card clicked: (${props.card.rowIndex}, ${props.card.colIndex}), symbol: ${props.card.type.symbol}`);
      emit("click");
    };

    // 卡片状态变化监听
    watch(() => props.isSelected, (newVal) => {
      if (newVal) {
        console.log(`卡片 (${props.card.rowIndex}, ${props.card.colIndex}) 被选中`);
      }
    });

    watch(() => props.card.matched, (newVal) => {
      if (newVal) {
        console.log(`卡片 (${props.card.rowIndex}, ${props.card.colIndex}) 已匹配`);
      }
    });

    return {
      handleClick,
      showFront,
    };
  },
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
  transition: transform 0.4s, box-shadow 0.3s;
  transform-style: preserve-3d;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

/* 修复翻转样式，确保正反面显示逻辑正确 */
.card-inner.is-flipped {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  width: 100%;
  height: 100%;
  position: absolute;
  backface-visibility: hidden;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  /* 确保3D转换正确 */
  transition: all 0.3s ease;
}

.card-front {
  background-color: #f8f8f8;
  border: 1px solid #e0e0e0;
  transform: rotateY(0deg); /* 确保正面朝前 */
}

.card-back {
  background-color: #2c3e50;
  transform: rotateY(180deg); /* 确保背面朝后 */
  border: 1px solid #1c2e40;
}

.card-back-content {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.card-content {
  font-size: 1.5rem;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 选中状态 */
.game-card.selected .card-inner {
  box-shadow: 0 0 0 3px #42b983, 0 2px 4px rgba(0, 0, 0, 0.1);
  transform: scale(1.05);
  z-index: 10;
}

/* 第二张选中的卡片 */
.game-card.previous .card-inner {
  box-shadow: 0 0 0 3px #42b983, 0 2px 4px rgba(0, 0, 0, 0.1);
  transform: scale(1.05);
  z-index: 10;
}

/* 匹配状态 - 改为透明而非隐藏，确保位置保持但视觉上消失 */
.game-card.matched {
  opacity: 0;
  transition: opacity 0.5s ease-out;
  pointer-events: none; /* 防止点击已匹配的卡片 */
}

/* 提示状态 */
.game-card.hinted .card-inner {
  animation: pulse 1s infinite;
  box-shadow: 0 0 15px rgba(66, 185, 131, 0.8);
}

/* 预览状态 */
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

  .card-content,
  .card-back-content {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .game-card {
    max-width: 40px;
    max-height: 40px;
  }

  .card-content,
  .card-back-content {
    font-size: 1rem;
  }
}
</style>
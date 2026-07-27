<script setup lang="ts">
// ============================================================
// 灵气粒子系统 —— 修炼/突破/天劫/战斗四级粒子
// ============================================================
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = withDefaults(defineProps<{
  density?: number         // 粒子数量
  color?: string           // 粒子主色
  speed?: 'slow' | 'medium' | 'fast'
  mode?: 'rising' | 'converging' | 'falling' | 'bursting'  // 运动模式
}>(), {
  density: 10,
  color: '#DAA520',
  speed: 'slow',
  mode: 'rising',
})

const containerRef = ref<HTMLElement | null>(null)
const particles = ref<{ id: number; x: number; y: number; size: number; delay: number; duration: number }[]>([])

const speedMap = { slow: [4, 6], medium: [2, 4], fast: [0.8, 2] }

function createParticles() {
  const newParticles = []
  for (let i = 0; i < props.density; i++) {
    newParticles.push({
      id: i,
      x: Math.random() * 100,
      y: props.mode === 'falling' ? -10 : 90 + Math.random() * 10,
      size: 2 + Math.random() * 4,
      delay: Math.random() * (props.mode === 'bursting' ? 0.3 : 3),
      duration: speedMap[props.speed][0] + Math.random() * (speedMap[props.speed][1] - speedMap[props.speed][0]),
    })
  }
  particles.value = newParticles
}

onMounted(() => createParticles())
watch(() => [props.density, props.speed, props.mode], () => createParticles())
</script>

<template>
  <div ref="containerRef" class="spirit-particles-container">
    <div
      v-for="p in particles"
      :key="p.id"
      class="spirit-dot"
      :class="`mode-${mode}`"
      :style="{
        left: `${p.x}%`,
        top: `${p.y}%`,
        width: `${p.size}px`,
        height: `${p.size}px`,
        background: color,
        boxShadow: `0 0 ${p.size * 3}px ${color}`,
        animationDelay: `${p.delay}s`,
        animationDuration: `${p.duration}s`,
      }"
    />
  </div>
</template>

<style scoped>
.spirit-particles-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.spirit-dot {
  position: absolute;
  border-radius: 50%;
  animation-timing-function: ease-out;
  animation-iteration-count: infinite;
  opacity: 0;
}

/* 上升模式（修炼） */
.mode-rising {
  animation-name: particleRise;
}
@keyframes particleRise {
  0% { transform: translateY(0) scale(0.8); opacity: 0; }
  10% { opacity: 0.7; }
  80% { opacity: 0.2; }
  100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
}

/* 汇聚模式（突破蓄力） */
.mode-converging {
  animation-name: particleConverge;
}
@keyframes particleConverge {
  0% { transform: translate(0, 0) scale(1.5); opacity: 0.8; }
  100% { transform: translate(
    calc((50 - var(--start-x, 50)) * 1px),
    calc((50 - var(--start-y, 50)) * 1px)
  ) scale(0.2); opacity: 0; }
}

/* 下落模式（天劫） */
.mode-falling {
  animation-name: particleFall;
}
@keyframes particleFall {
  0% { transform: translateY(0) scale(0.8); opacity: 0.9; }
  100% { transform: translateY(120px) scale(1.5); opacity: 0; }
}

/* 爆发模式（战斗碰撞） */
.mode-bursting {
  animation-name: particleBurst;
}
@keyframes particleBurst {
  0% { transform: scale(0) translate(0, 0); opacity: 1; }
  100% { transform: scale(2) translate(
    calc((var(--dx)) * 1px),
    calc((var(--dy)) * 1px)
  ); opacity: 0; }
}
</style>

<script setup lang="ts">
// ============================================================
// 丹田可视化组件 —— 各境界不同形态
// ============================================================
import { computed } from 'vue'
import type { RealmLevel } from '@/types'

const props = defineProps<{
  realm: RealmLevel
  size?: number
}>()

const sizePx = computed(() => `${props.size || 120}px`)

const dantianClass = computed(() => `dantian-orb realm-${props.realm}`)

const realmLabels: Record<string, string> = {
  mortal: '凡人',
  qi_refining: '炼气期',
  foundation: '筑基期',
  golden_core: '金丹期',
  nascent_soul: '元婴期',
  spirit_severing: '化神期',
  void_refining: '炼虚期',
  body_integration: '合体期',
  mahayana: '大乘期',
  tribulation: '渡劫期',
}

const realmLabel = computed(() => realmLabels[props.realm] || props.realm)

const dantianEmoji = computed(() => {
  const map: Record<string, string> = {
    mortal: '🌑',
    qi_refining: '💠',
    foundation: '🔮',
    golden_core: '🟡',
    nascent_soul: '👶',
    spirit_severing: '🧘',
    void_refining: '✨',
    body_integration: '🌟',
    mahayana: '👑',
    tribulation: '⚡',
  }
  return map[props.realm] || '💠'
})
</script>

<template>
  <div class="dantian-container" :style="{ width: sizePx, height: sizePx }">
    <div :class="dantianClass">
      <!-- 炼气期：气团 -->
      <div v-if="realm === 'mortal'" class="dantian-empty">空</div>
      <div v-else-if="realm === 'qi_refining'" class="dantian-qi-mist"></div>

      <!-- 筑基期：液态球 -->
      <div v-else-if="realm === 'foundation'" class="dantian-liquid">
        <div class="liquid-core"></div>
        <div v-for="n in 3" :key="n" class="liquid-particle" :style="{ animationDelay: `${n * 0.5}s` }"></div>
      </div>

      <!-- 金丹期：金丹 -->
      <div v-else-if="realm === 'golden_core'" class="dantian-golden">
        <div class="golden-sphere"></div>
      </div>

      <!-- 元婴期及以上 -->
      <div v-else-if="realm === 'nascent_soul'" class="dantian-nascent">
        <span class="nascent-emoji">{{ dantianEmoji }}</span>
        <div class="nascent-halo"></div>
      </div>

      <!-- 化神期及以上：光环 -->
      <div v-else-if="realm === 'spirit_severing' || realm === 'void_refining'" class="dantian-advanced">
        <span class="advanced-emoji">{{ dantianEmoji }}</span>
        <div class="advanced-halo"></div>
      </div>

      <!-- 大乘期/渡劫期：金身 -->
      <div v-else class="dantian-supreme">
        <span class="supreme-emoji">{{ dantianEmoji }}</span>
        <div class="supreme-glow"></div>
        <div v-if="realm === 'tribulation'" class="tribulation-lightning"></div>
      </div>
    </div>
    <div class="dantian-label">{{ realmLabel }}</div>
  </div>
</template>

<style scoped>
.dantian-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
}

.dantian-orb {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.6s ease;
  position: relative;
  overflow: hidden;
}

.dantian-label {
  font-family: 'STKaiti', 'KaiTi', serif;
  font-size: 0.85rem;
  color: #8b6914;
  letter-spacing: 0.05em;
}

/* 凡人 - 空 */
.dantian-empty {
  color: #a09888;
  font-family: 'STKaiti', 'KaiTi', serif;
  font-size: 0.8rem;
}

/* 炼气期 - 淡蓝气团 */
.dantian-qi-mist {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(100,160,220,0.5) 0%, rgba(100,160,220,0.15) 50%, transparent 70%);
  animation: qiBreathe 3s ease-in-out infinite;
}
@keyframes qiBreathe {
  0%,100% { transform: scale(0.85); opacity: 0.7; }
  50% { transform: scale(1.05); opacity: 1; }
}

/* 筑基期 - 液态球 */
.dantian-liquid {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(80,160,200,0.7) 0%, rgba(40,100,160,0.4) 50%, rgba(20,60,120,0.15) 80%, transparent 100%);
  animation: liquidRotate 6s linear infinite;
  position: relative;
}
.liquid-core {
  position: absolute;
  top: 50%; left: 50%;
  width: 40%; height: 40%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: rgba(120,200,240,0.6);
  box-shadow: 0 0 15px rgba(100,180,220,0.5);
}
.liquid-particle {
  position: absolute;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: rgba(150,210,245,0.8);
  animation: liquidFloat 2s ease-in-out infinite;
}
.liquid-particle:nth-child(2) { top: 20%; left: 30%; }
.liquid-particle:nth-child(3) { top: 65%; left: 70%; }
@keyframes liquidRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes liquidFloat {
  0%,100% { transform: translateY(0); opacity: 0.6; }
  50% { transform: translateY(-8px); opacity: 1; }
}

/* 金丹期 - 金丹 */
.dantian-golden {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, #ffd700 0%, #daa520 30%, #b8860b 60%, rgba(184,134,11,0.2) 85%, transparent 100%);
  box-shadow: 0 0 25px rgba(255,215,0,0.5), 0 0 50px rgba(255,215,0,0.2);
  animation: goldenGlow 2s ease-in-out infinite, goldenRotate 8s linear infinite;
}
.golden-sphere {
  width: 30%;
  height: 30%;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 10px rgba(255,255,255,0.8);
}
@keyframes goldenGlow {
  0%,100% { box-shadow: 0 0 25px rgba(255,215,0,0.5), 0 0 50px rgba(255,215,0,0.2); }
  50% { box-shadow: 0 0 40px rgba(255,215,0,0.7), 0 0 80px rgba(255,215,0,0.35); }
}
@keyframes goldenRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* 元婴期 - 婴孩 */
.dantian-nascent {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(200,160,255,0.2) 50%, rgba(180,130,220,0.1) 80%, transparent 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: nascentBreathe 3s ease-in-out infinite;
}
.nascent-emoji { font-size: 2.5em; animation: breathe 4s ease-in-out infinite; }
.nascent-halo {
  position: absolute;
  width: 90%; height: 90%;
  border-radius: 50%;
  border: 2px solid rgba(200,160,255,0.3);
  animation: rotate 6s linear infinite;
}
@keyframes nascentBreathe {
  0%,100% { box-shadow: 0 0 20px rgba(200,160,255,0.3); }
  50% { box-shadow: 0 0 35px rgba(200,160,255,0.5); }
}

/* 化神期+ - 光环 */
.dantian-advanced {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(180,140,220,0.4) 0%, rgba(120,100,180,0.2) 60%, transparent 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.advanced-emoji { font-size: 3em; animation: breathe 3s ease-in-out infinite; }
.advanced-halo {
  position: absolute;
  width: 85%; height: 85%;
  border-radius: 50%;
  border: 2px dashed rgba(200,160,255,0.35);
  animation: rotate 5s linear infinite;
}

/* 大乘期/渡劫期 - 金身 */
.dantian-supreme {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,215,0,0.5) 0%, rgba(200,160,50,0.3) 50%, rgba(150,120,40,0.1) 80%, transparent 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 30px rgba(255,215,0,0.4), 0 0 60px rgba(255,215,0,0.2);
}
.supreme-emoji { font-size: 3em; animation: breathe 3s ease-in-out infinite; }
.supreme-glow {
  position: absolute;
  width: 100%; height: 100%;
  border-radius: 50%;
  background: transparent;
  box-shadow: inset 0 0 20px rgba(255,215,0,0.3);
  animation: goldenGlow 2s ease-in-out infinite;
}

/* 天劫闪电 */
.tribulation-lightning {
  position: absolute;
  width: 100%; height: 100%;
  border-radius: 50%;
  background: repeating-conic-gradient(
    transparent 0deg,
    rgba(200,180,255,0.2) 5deg,
    transparent 10deg,
    rgba(200,180,255,0.2) 15deg
  );
  animation: rotate 1s linear infinite;
}
</style>

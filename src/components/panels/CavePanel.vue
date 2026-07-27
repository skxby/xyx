<script setup lang="ts">
// ============================================================
// 洞府系统面板
// ============================================================
import { ref } from 'vue'
import { useCaveStore } from '@/stores/caveStore'
import { usePlayerStore } from '@/stores/playerStore'

const caveStore = useCaveStore()
const playerStore = usePlayerStore()
const upgradeMsg = ref('')

function doUpgrade() {
  upgradeMsg.value = caveStore.upgrade()
  setTimeout(() => { upgradeMsg.value = '' }, 3000)
}
</script>

<template>
  <div class="cave-panel fade-in-up">
    <h2 class="cave-title">🏠 洞府</h2>

    <!-- 当前洞府 -->
    <div class="cave-current ink-panel">
      <div class="cave-level-badge">Lv.{{ caveStore.currentLevel }}</div>
      <div class="cave-name">{{ caveStore.currentCave.name }}</div>
      <p class="cave-desc">{{ caveStore.currentCave.description }}</p>
      <div class="cave-bonus">
        ⬆️ 修炼速度加成：
        <span class="bonus-value">+{{ Math.round(caveStore.currentCave.cultivationBonus * 100) }}%</span>
      </div>
    </div>

    <!-- 升级 -->
    <div v-if="caveStore.nextCave" class="cave-upgrade ink-panel">
      <h3>⬆️ 下一等级：{{ caveStore.nextCave.name }}</h3>
      <p>{{ caveStore.nextCave.description }}</p>
      <div class="upgrade-bonus">
        修炼加成将提升至：+{{ Math.round(caveStore.nextCave.cultivationBonus * 100) }}%
      </div>
      <div class="upgrade-cost">
        <div class="cost-title">升级消耗：</div>
        <div class="cost-item">💎 {{ caveStore.nextCave.upgradeCost.stones }} 灵石</div>
        <div v-for="mat in caveStore.nextCave.upgradeCost.materials" :key="mat.itemId" class="cost-item">
          📦 {{ mat.quantity }}x {{ mat.itemId }}
        </div>
      </div>
      <button
        class="btn-gold upgrade-btn"
        :class="{ disabled: !caveStore.canUpgrade }"
        @click="doUpgrade"
      >
        {{ caveStore.canUpgrade ? '🏗️ 升级洞府' : '资源不足' }}
      </button>
      <div v-if="upgradeMsg" class="upgrade-msg">{{ upgradeMsg }}</div>
    </div>

    <div v-else class="max-level ink-panel">
      🎉 洞府已达到最高等级——太虚幻境！
    </div>
  </div>
</template>

<style scoped>
.cave-panel { padding: 10px; max-width: 500px; margin: 0 auto; }
.cave-title { text-align: center; color: var(--text-gold); font-family: var(--font-ancient); margin-bottom: 12px; }

.cave-current { text-align: center; }
.cave-level-badge {
  display: inline-block; background: var(--text-gold); color: #faf7f0;
  padding: 3px 14px; border-radius: 12px; font-size: 0.8rem; margin-bottom: 8px;
}
.cave-name { font-size: 1.2rem; color: var(--text-gold); font-family: var(--font-ancient); margin-bottom: 6px; }
.cave-desc { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; }
.cave-bonus { margin-top: 8px; font-size: 0.85rem; color: var(--text-primary); }
.bonus-value { color: var(--success); font-weight: bold; }

.cave-upgrade { margin-top: 12px; }
.cave-upgrade h3 { font-size: 0.95rem; color: var(--text-gold); margin-bottom: 6px; }
.cave-upgrade p { font-size: 0.82rem; color: var(--text-secondary); }
.upgrade-bonus { margin: 8px 0; font-size: 0.85rem; color: var(--success); }
.upgrade-cost { margin: 10px 0; padding: 8px; background: rgba(0,0,0,0.03); border-radius: 6px; }
.cost-title { font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 4px; }
.cost-item { font-size: 0.78rem; color: var(--text-primary); padding: 1px 0; }
.upgrade-btn { margin-top: 8px; width: 100%; }
.upgrade-btn.disabled { opacity: 0.5; cursor: not-allowed; }
.upgrade-msg { margin-top: 8px; font-size: 0.85rem; color: var(--success); text-align: center; }
.max-level { text-align: center; color: var(--text-gold); font-family: var(--font-ancient); padding: 24px; }
</style>

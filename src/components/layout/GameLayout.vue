<script setup lang="ts">
// ============================================================
// 游戏主布局 v2 - 中枢首页 + 底部导航
// ============================================================
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { useCombatStore } from '@/stores/combatStore'
import { usePetStore } from '@/stores/petStore'
import { useCaveStore } from '@/stores/caveStore'
import CultivationHub from '@/components/panels/CultivationHub.vue'
import CombatPanel from '@/components/panels/CombatPanel.vue'
import InventoryPanel from '@/components/panels/InventoryPanel.vue'
import ExplorationPanel from '@/components/panels/ExplorationPanel.vue'
import ShopPanel from '@/components/panels/ShopPanel.vue'
import CraftPanel from '@/components/panels/CraftPanel.vue'
import PetCompanionPanel from '@/components/panels/PetCompanionPanel.vue'
import PlayerInfoPanel from '@/components/panels/PlayerInfoPanel.vue'
import StoryPanel from '@/components/panels/StoryPanel.vue'
import CavePanel from '@/components/panels/CavePanel.vue'

const playerStore = usePlayerStore()
const combatStore = useCombatStore()
const petStore = usePetStore()
const caveStore = useCaveStore()
const activePanel = ref<string | null>(null) // null = 中枢首页

// 同步修炼加成（道侣/宗门 + 洞府）
let boostSyncInterval: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  boostSyncInterval = setInterval(() => {
    const total = petStore.totalCultivationBoost + caveStore.getCultivationBonus()
    playerStore.setCultivationBoost(total)
  }, 5000)
})
onUnmounted(() => {
  if (boostSyncInterval) clearInterval(boostSyncInterval)
})

// 面板列表
const panels = [
  { key: 'combat', label: '战斗', icon: '⚔️', component: CombatPanel },
  { key: 'backpack', label: '背包', icon: '🎒', component: InventoryPanel },
  { key: 'explore', label: '探索', icon: '🗺️', component: ExplorationPanel },
  { key: 'shop', label: '商店', icon: '🏪', component: ShopPanel },
  { key: 'craft', label: '制作', icon: '🔧', component: CraftPanel },
  { key: 'pet', label: '灵兽', icon: '🐉', component: PetCompanionPanel },
  { key: 'player', label: '属性', icon: '👤', component: PlayerInfoPanel },
  { key: 'story', label: '故事', icon: '📜', component: StoryPanel },
  { key: 'cave', label: '洞府', icon: '🏠', component: CavePanel },
]

const currentComponent = computed(() => {
  if (!activePanel.value) return CultivationHub
  const panel = panels.find(p => p.key === activePanel.value)
  return panel?.component || CultivationHub
})

const showPanel = computed(() => activePanel.value !== null)

function goHome() { activePanel.value = null }
function openPanel(key: string) { activePanel.value = key }

// 战斗中自动跳转
const isCombatActive = computed(() => combatStore.inCombat ||
  combatStore.phase === 'victory' || combatStore.phase === 'defeat')

// 如果战斗进入活跃状态但不在战斗面板，自动跳转
if (isCombatActive.value && activePanel.value !== 'combat') {
  // 这个逻辑通过 watch 在组件内处理
}
</script>

<template>
  <div class="game-layout" v-if="playerStore.player">
    <!-- ===== 顶部状态栏（精简版） ===== -->
    <header class="top-bar">
      <div class="top-left" @click="goHome">
        <span class="top-avatar">{{ playerStore.player.cultivationType === 'sword' ? '⚔️' : playerStore.player.cultivationType === 'spirit' ? '🔮' : '👿' }}</span>
        <div class="top-info">
          <span class="top-name">{{ playerStore.player.name }}</span>
          <span class="top-realm">{{ playerStore.currentRealmInfo()?.name || '凡人' }}</span>
        </div>
      </div>
      <div class="top-right">
        <span class="top-stat">💎{{ playerStore.player.attributes.spiritStones }}</span>
        <span class="top-stat">⚡{{ playerStore.player.attributes.cultivation }}</span>
      </div>
    </header>

    <!-- ===== 主内容 ===== -->
    <main class="main-area">
      <transition name="panel-slide" mode="out-in">
        <component :is="currentComponent" :key="activePanel || 'home'" />
      </transition>
    </main>

    <!-- ===== 底部导航栏（仅在中枢页显示完整导航） ===== -->
    <nav class="bottom-nav">
      <button :class="['nav-item', { active: !showPanel }]" @click="goHome">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">修炼</span>
      </button>
      <button
        v-for="panel in panels.slice(0, 3)"
        :key="panel.key"
        :class="['nav-item', { active: activePanel === panel.key }]"
        @click="openPanel(panel.key)"
      >
        <span class="nav-icon">{{ panel.icon }}</span>
        <span class="nav-label">{{ panel.label }}</span>
      </button>
      <button
        :class="['nav-item', { active: activePanel && panels.slice(3).some(p => p.key === activePanel) }]"
        @click="openPanel(panels[3].key)"
      >
        <span class="nav-icon">📋</span>
        <span class="nav-label">更多</span>
      </button>
    </nav>

    <!-- 更多面板选择器（点击「更多」时弹出） -->
    <transition name="fade">
      <div v-if="activePanel && panels.slice(3).some(p => p.key === activePanel)" class="sub-nav">
        <button
          v-for="panel in panels.slice(3)"
          :key="panel.key"
          :class="['sub-nav-item', { active: activePanel === panel.key }]"
          @click="openPanel(panel.key)"
        >
          <span class="nav-icon">{{ panel.icon }}</span>
          <span class="nav-label">{{ panel.label }}</span>
        </button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.game-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(ellipse at 50% 30%, rgba(74,48,128,0.15) 0%, transparent 60%),
    radial-gradient(ellipse at 50% 80%, rgba(255,215,0,0.05) 0%, transparent 50%),
    linear-gradient(180deg, #0a0a1a 0%, #111133 50%, #0a0a1a 100%);
}

/* ========== 顶栏 ========== */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  background: rgba(10,10,26,0.85);
  border-bottom: 1px solid rgba(255,215,0,0.08);
  backdrop-filter: blur(10px);
  z-index: 10;
}

.top-left {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.top-avatar {
  font-size: 1.4rem;
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(122,94,176,0.2);
  border-radius: 50%;
  border: 1px solid rgba(122,94,176,0.3);
}

.top-info { display: flex; flex-direction: column; }
.top-name { font-size: 0.85rem; color: #ffd700; font-family: var(--font-ancient); font-weight: bold; }
.top-realm { font-size: 0.68rem; color: #c0b0e0; }

.top-right { display: flex; gap: 10px; }
.top-stat { font-size: 0.78rem; color: #c0c0c0; }

/* ========== 主内容 ========== */
.main-area {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 0;
}

/* ========== 底部导航 ========== */
.bottom-nav {
  display: flex;
  background: rgba(10,10,26,0.9);
  border-top: 1px solid rgba(255,215,0,0.08);
  padding: 4px 0;
  padding-bottom: env(safe-area-inset-bottom, 4px);
  backdrop-filter: blur(10px);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 2px;
  background: transparent;
  border: none;
  color: #807870;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.nav-item.active { color: #ffd700; }
.nav-item.active::before {
  content: '';
  position: absolute;
  top: 0; left: 30%; right: 30%;
  height: 2px;
  background: #ffd700;
  border-radius: 0 0 2px 2px;
}

.nav-icon { font-size: 1.2rem; }
.nav-label { font-size: 0.62rem; font-family: var(--font-ancient); }

/* ========== 子导航 ========== */
.sub-nav {
  display: flex;
  background: rgba(10,10,26,0.95);
  border-top: 1px solid rgba(255,215,0,0.1);
  padding: 6px 4px;
  backdrop-filter: blur(10px);
  gap: 4px;
}

.sub-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 5px 2px;
  background: rgba(255,255,255,0.03);
  border: 1px solid transparent;
  border-radius: 8px;
  color: #807870;
  cursor: pointer;
  transition: all 0.2s;
}

.sub-nav-item.active {
  background: rgba(122,94,176,0.15);
  border-color: rgba(122,94,176,0.4);
  color: #ffd700;
}

/* ========== 过渡动画 ========== */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: all 0.25s ease-out;
}
.panel-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.panel-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

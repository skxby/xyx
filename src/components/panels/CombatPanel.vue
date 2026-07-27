<script setup lang="ts">
// ============================================================
// 战斗面板 v2 - 动画特效增强
// ============================================================
import { computed, ref, watch, nextTick, onUnmounted } from 'vue'
import { useCombatStore } from '@/stores/combatStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useInventoryStore } from '@/stores/inventoryStore'
import { getEnemyById, getEnemiesByTier } from '@/data/enemies'
import { floatDamage as gsapFloat, shakeElement, flashElement, burstParticles, goldenDescent } from '@/utils/animations'
import { getRealmById } from '@/data/realms'

const combatStore = useCombatStore()
const playerStore = usePlayerStore()
const inventoryStore = useInventoryStore()

const selectedTier = ref('novice')
const showEnemyList = ref(!combatStore.inCombat)
const logContainer = ref<HTMLElement | null>(null)
const playerOrbRef = ref<HTMLElement | null>(null)
const enemyOrbRef = ref<HTMLElement | null>(null)
const battleStageRef = ref<HTMLElement | null>(null)
const playerHpPercent = ref(100)
const enemyHpPercent = ref(100)
const lastLogType = ref('')
const floatDamageList = ref<{ id: number; text: string; side: 'player' | 'enemy'; crit: boolean }[]>([])
let floatId = 0

// 球形大小（境界越大球越大）
const playerOrbSize = computed(() => {
  const r = playerStore.currentRealmInfo()
  return 80 + (r?.level || 0) * 14
})
const enemyOrbSize = computed(() => {
  const r = combatStore.enemyData?.realmLevel
  return 70 + (r || 0) * 12
})

// 道修颜色
const playerOrbColor = computed(() => {
  const t = playerStore.player?.cultivationType
  if (t === 'sword') return 'radial-gradient(circle, #e8e0d0 0%, #c0b8a8 40%, #a09888 100%)'
  if (t === 'spirit') return 'radial-gradient(circle, #d0e8f0 0%, #90c0d8 40%, #5098b8 100%)'
  return 'radial-gradient(circle, #e8d0d0 0%, #c09090 40%, #a06060 100%)'
})

// 自动滚动日志
watch(() => combatStore.logs.length, async () => {
  await nextTick()
  if (logContainer.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight
  }
  if (combatStore.logs.length > 0) {
    lastLogType.value = combatStore.logs[combatStore.logs.length - 1].type
  }
  updateHpBars()
})

// 自动更新血条
function updateHpBars() {
  const pu = combatStore.playerUnit
  const eu = combatStore.enemyUnit
  if (pu) playerHpPercent.value = Math.max(0, (pu.attributes.currentHp / pu.attributes.maxHp) * 100)
  if (eu) enemyHpPercent.value = Math.max(0, (eu.attributes.currentHp / eu.attributes.maxHp) * 100)
}

// 飘字 + 视觉反馈
function showFloat(text: string, side: 'player' | 'enemy', crit: boolean) {
  const id = floatId++
  floatDamageList.value.push({ id, text, side, crit })
  setTimeout(() => { floatDamageList.value = floatDamageList.value.filter(f => f.id !== id) }, 1100)

  // GSAP 视觉反馈
  const targetEl = side === 'player' ? playerOrbRef.value : enemyOrbRef.value
  const containerEl = battleStageRef.value
  if (targetEl) {
    shakeElement(targetEl, crit ? 8 : 4)
    if (crit) flashElement(targetEl, 'rgba(255,200,50,0.5)')
    else flashElement(targetEl, 'rgba(255,255,255,0.3)')
  }
  if (containerEl && crit) {
    burstParticles(targetEl || containerEl, 6, '#DAA520')
  }
}

const enemyOptions = computed(() => getEnemiesByTier(selectedTier.value))

function selectEnemy(enemyId: string) {
  combatStore.initCombat(enemyId)
  showEnemyList.value = false
}

function doAttack() {
  combatStore.playerAction(0)
  updateHpBars()
  // 飘字
  const lastLog = combatStore.logs[combatStore.logs.length - 1]
  if (lastLog?.type === 'crit') showFloat('暴击!', 'enemy', true)
  else if (lastLog?.type === 'miss') showFloat('未命中', 'enemy', false)
  else if (lastLog?.type === 'normal') showFloat('攻击', 'enemy', false)

  if (combatStore.phase === 'enemy_turn') {
    setTimeout(() => {
      combatStore.enemyAction()
      updateHpBars()
      showFloat('反击', 'player', false)
    }, 700)
  }
}

const isAutoBattle = ref(false)
let autoTimer: any = null

function toggleAuto() {
  isAutoBattle.value = !isAutoBattle.value
  if (isAutoBattle.value) {
    autoTimer = setInterval(() => {
      if (combatStore.phase === 'player_turn') doAttack()
      else if (!combatStore.inCombat) stopAuto()
    }, 1100)
  } else stopAuto()
}

function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null } isAutoBattle.value = false }
onUnmounted(() => stopAuto())

function back() { combatStore.leaveCombat(); stopAuto(); showEnemyList.value = true }
function acceptDrop(i: number) { combatStore.handleDropChoice(true, i) }
function rejectDrop(i: number) { combatStore.handleDropChoice(false, i) }

// 敌人图标
const enemyIcon = computed(() => {
  const e = combatStore.enemyData
  if (!e) return '👹'
  const tierIcons: Record<string, string> = {
    novice: '🐺', normal: '🐍', elite: '👹', lord: '🐉',
    ancient_beast: '🦅', unique_boss: '👿',
  }
  return tierIcons[e.tier] || '👹'
})
</script>

<template>
  <div class="combat-v2">
    <!-- ===== 选敌界面 ===== -->
    <div v-if="showEnemyList" class="select-screen fade-in-up">
      <h2 class="select-title">⚔️ 选择挑战目标</h2>
      <div class="tier-tabs">
        <button v-for="t in [
          { k:'novice',l:'新手' },{ k:'normal',l:'普通' },{ k:'elite',l:'精英' },
          { k:'lord',l:'领主' },{ k:'ancient_beast',l:'神兽' },{ k:'unique_boss',l:'唯一' }
        ]" :key="t.k" :class="['tier-tab',{active:selectedTier===t.k}]" @click="selectedTier=t.k">{{ t.l }}</button>
      </div>
      <div class="enemy-grid">
        <div v-for="e in enemyOptions" :key="e.id" class="enemy-card" @click="selectEnemy(e.id)">
          <div class="ec-icon">{{ e.id.includes('dragon')||e.id.includes('serpent')?'🐉':e.id.includes('phoenix')||e.id.includes('bird')?'🦅':e.id.includes('thunder')?'⚡':e.id.includes('fire')?'🔥':e.id.includes('ice')?'❄️':e.id.includes('demon')||e.id.includes('shadow')?'👿':e.id.includes('tiger')?'🐯':e.id.includes('snake')?'🐍':'👹' }}</div>
          <div class="ec-name">{{ e.name }}</div>
          <div class="ec-stats">❤️{{ e.stats.maxHp }} ⚔️{{ e.stats.attack }}</div>
          <div class="ec-rewards">🏆{{ e.expReward }}修 💎{{ e.stoneReward }}石</div>
        </div>
        <div v-if="enemyOptions.length===0" class="empty">该梯度暂无敌人</div>
      </div>
    </div>

    <!-- ===== 战斗场景 ===== -->
    <div v-else class="battle-screen fade-in">
      <!-- 对战舞台 —— 球形战斗 -->
      <div class="battle-stage" ref="battleStageRef">
        <!-- 玩家球体 -->
        <div class="fighter-orb-container player-side">
          <div
            ref="playerOrbRef"
            class="combat-orb player-orb"
            :class="{ 'orb-hit': lastLogType === 'normal' || lastLogType === 'crit' }"
            :style="{
              width: playerOrbSize + 'px',
              height: playerOrbSize + 'px',
              background: playerOrbColor,
            }"
          >
            <span class="orb-icon">{{ playerStore.player?.cultivationType==='sword'?'⚔️':playerStore.player?.cultivationType==='spirit'?'🔮':'👿' }}</span>
          </div>
          <div class="orb-label">{{ playerStore.player?.name }}</div>
          <div class="hp-bar-wrap">
            <div class="hp-bar p-hp" :style="{width:playerHpPercent+'%'}"/>
          </div>
          <span class="hp-num">{{combatStore.playerUnit?.attributes.currentHp}}/{{combatStore.playerUnit?.attributes.maxHp}}</span>
          <!-- 飘字 -->
          <div v-for="fd in floatDamageList.filter(f=>f.side==='player')" :key="fd.id" :class="['damage-pop',fd.crit?'crit':'']">
            {{ fd.text }}
          </div>
        </div>

        <!-- VS -->
        <div class="vs-divider">
          <span class="vs-text">⚡</span>
        </div>

        <!-- 敌人球体 -->
        <div class="fighter-orb-container enemy-side">
          <div
            ref="enemyOrbRef"
            class="combat-orb enemy-orb"
            :class="{ 'orb-hit': lastLogType === 'normal' || lastLogType === 'crit' }"
            :style="{
              width: enemyOrbSize + 'px',
              height: enemyOrbSize + 'px',
            }"
          >
            <span class="orb-icon">{{ enemyIcon }}</span>
          </div>
          <div class="orb-label">{{ combatStore.enemyUnit?.name }}</div>
          <div class="hp-bar-wrap">
            <div class="hp-bar e-hp" :style="{width:enemyHpPercent+'%'}"/>
          </div>
          <span class="hp-num">{{combatStore.enemyUnit?.attributes.currentHp}}/{{combatStore.enemyUnit?.attributes.maxHp}}</span>
          <!-- 飘字 -->
          <div v-for="fd in floatDamageList.filter(f=>f.side==='enemy')" :key="fd.id" :class="['damage-pop',fd.crit?'crit':'']">
            {{ fd.text }}
          </div>
        </div>
      </div>

      <!-- 战斗日志 -->
      <div class="battle-log" ref="logContainer">
        <div v-for="(log,i) in combatStore.logs" :key="i" :class="['log-line',log.type]">
          <span class="log-round" v-if="log.round>0">[{{log.round}}]</span> {{ log.message }}
        </div>
      </div>

      <!-- 操作 -->
      <div class="battle-bar" v-if="combatStore.inCombat">
        <button class="bbtn attack" :disabled="combatStore.phase!=='player_turn'" @click="doAttack">⚔️ 攻击</button>
        <button class="bbtn flee" :disabled="combatStore.phase!=='player_turn'" @click="combatStore.flee()">🏃 逃跑</button>
        <button :class="['bbtn auto',{active:isAutoBattle}]" @click="toggleAuto">{{ isAutoBattle?'⏸️ 手动':'🤖 自动' }}</button>
      </div>

      <!-- 掉落 -->
      <div v-if="combatStore.showDropChoice" class="drop-pop fade-in-up">
        <h4>🎁 获得战利品</h4>
        <div v-for="(item,i) in combatStore.pendingDrops" :key="i" class="drop-row">
          <span>{{ item.name }}</span>
          <span :class="'q-'+item.rarity">[{{ item.rarity }}]</span>
          <button class="dbtn accept" @click="acceptDrop(i)">领取</button>
          <button class="dbtn reject" @click="rejectDrop(i)">放弃</button>
        </div>
      </div>

      <!-- 结果 -->
      <div v-if="!combatStore.inCombat && combatStore.phase!=='idle'" class="battle-result">
        <div class="result-msg">{{ combatStore.phase==='victory'?'🎉 胜利！':combatStore.phase==='defeat'?'💀 败北...':'🏃 已逃跑' }}</div>
        <button class="bbtn back" @click="back">↩ 返回</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.combat-v2 { height: 100%; }

/* ===== 选敌 ===== */
.select-screen { padding: 10px; }
.select-title { text-align: center; color: var(--text-gold); font-family: var(--font-ancient); margin-bottom: 10px; font-size: 1.1rem; }
.tier-tabs { display: flex; gap: 4px; margin-bottom: 10px; flex-wrap: wrap; justify-content: center; }
.tier-tab {
  padding: 5px 12px; background: rgba(139,105,20,0.06); border: 1px solid var(--border-panel);
  border-radius: 14px; color: var(--text-secondary); font-size: 0.72rem; cursor: pointer; transition: all 0.2s;
}
.tier-tab.active { background: rgba(139,105,20,0.15); border-color: var(--text-gold); color: var(--text-gold); }
.enemy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.enemy-card {
  background: var(--bg-card); border: 1px solid var(--border-panel); border-radius: 10px;
  padding: 12px; text-align: center; cursor: pointer; transition: all 0.2s;
}
.enemy-card:hover { border-color: var(--text-gold); transform: translateY(-2px); }
.enemy-card:active { transform: scale(0.96); }
.ec-icon { font-size: 2rem; margin-bottom: 4px; }
.ec-name { color: var(--text-primary); font-weight: bold; font-size: 0.85rem; }
.ec-stats { font-size: 0.7rem; color: var(--text-secondary); margin: 3px 0; }
.ec-rewards { font-size: 0.68rem; color: var(--success); }

/* ===== 球形战斗舞台 ===== */
.battle-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px 8px;
  position: relative;
  min-height: 200px;
}
.fighter-orb-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
  position: relative;
}

/* 战斗球体 */
.combat-orb {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow:
    0 4px 15px rgba(44,24,16,0.15),
    inset 0 2px 8px rgba(255,255,255,0.3);
  cursor: default;
}
.combat-orb.orb-hit {
  animation: orbHit 0.3s ease;
}
@keyframes orbHit {
  0% { transform: scale(1); }
  30% { transform: scale(1.1); }
  60% { transform: scale(0.95); }
  100% { transform: scale(1); }
}
.enemy-orb {
  background: radial-gradient(circle, #e8d8d0 0%, #c0a090 40%, #a08070 100%);
  box-shadow:
    0 4px 15px rgba(44,24,16,0.2),
    inset 0 2px 8px rgba(255,255,255,0.25);
}
.orb-icon { font-size: 1.8rem; }
.orb-label {
  font-size: 0.8rem;
  color: var(--text-primary);
  font-weight: bold;
  font-family: var(--font-ancient);
}

.hp-bar-wrap { width: 80px; height: 8px; background: rgba(0,0,0,0.06); border-radius: 4px; overflow: hidden; }
.hp-bar { height: 100%; border-radius: 4px; transition: width 0.4s; }
.p-hp { background: linear-gradient(90deg, #5d8c4e, #4ecb71); }
.e-hp { background: linear-gradient(90deg, #c0392b, #e85545); }
.hp-num { font-size: 0.62rem; color: var(--text-secondary); }

.vs-divider { flex: 0; }
.vs-text { font-size: 1.5rem; color: var(--text-gold); }

/* 飘字 */
.damage-pop {
  position: absolute; right: -10px; top: 0;
  font-size: 1rem; font-weight: bold; pointer-events: none;
  animation: floatDmg 1s ease-out forwards; z-index: 20;
  color: var(--text-gold); font-weight: bold;
}
.damage-pop.crit { font-size: 1.3rem; color: #b8860b; text-shadow: 0 1px 6px rgba(184,134,11,0.3); }
@keyframes floatDmg {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-40px) scale(1.3); }
}

/* 日志 */
.battle-log {
  height: 140px; overflow-y: auto; margin: 0 10px;
  background: rgba(44,24,16,0.03); border-radius: 8px; padding: 8px;
  border: 1px solid var(--border-subtle);
}
.log-line { padding: 2px 0; font-size: 0.75rem; color: var(--text-secondary); border-bottom: 1px solid var(--border-subtle); }
.log-line.crit { color: #b8860b; }
.log-line.miss { color: var(--text-secondary); opacity: 0.6; }
.log-line.system { color: var(--info); }
.log-round { color: var(--text-secondary); font-size: 0.65rem; opacity: 0.5; }

/* 操作栏 */
.battle-bar { display: flex; gap: 8px; padding: 10px; }
.bbtn {
  flex: 1; padding: 10px; border: none; border-radius: 8px;
  color: #faf7f0; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;
  font-family: var(--font-ancient);
}
.bbtn:disabled { opacity: 0.35; }
.bbtn:active { transform: scale(0.95); }
.bbtn.attack { background: #c0392b; }
.bbtn.flee { background: #8b7355; }
.bbtn.auto { background: #5d8c4e; }
.bbtn.auto.active { background: #c07830; }
.bbtn.back { width: 100%; background: #8b6914; margin-top: 6px; }

/* 掉落 */
.drop-pop {
  margin: 10px; padding: 14px;
  background: var(--bg-panel); border: 2px solid var(--text-gold); border-radius: 12px;
}
.drop-pop h4 { color: var(--text-gold); margin-bottom: 8px; font-family: var(--font-ancient); }
.drop-row { display: flex; align-items: center; gap: 6px; padding: 6px 0; font-size: 0.85rem; color: var(--text-primary); }
.dbtn { padding: 4px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem; color: #faf7f0; }
.dbtn.accept { background: #5d8c4e; }
.dbtn.reject { background: #c0392b; }

/* 结果 */
.battle-result { text-align: center; padding: 20px; }
.result-msg { font-size: 1.4rem; color: var(--text-gold); font-family: var(--font-ancient); margin-bottom: 12px; }

.empty { grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 30px; }
</style>

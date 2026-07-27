// ============================================================
// 事件/探险 状态管理
// ============================================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RandomEvent, EventOutcome, Dungeon } from '@/types'
import { usePlayerStore } from './playerStore'
import { useInventoryStore } from './inventoryStore'
import { useCombatStore } from './combatStore'
import { getEventsByRealm } from '@/data/events'
import { items as gameItems } from '@/data/items'
import { randomPick, weightedRandom, rollProbability } from '@/utils/random'
import { generateRandomDrop } from '@/utils/loot'

export const useEventStore = defineStore('event', () => {
  // ==================== 状态 ====================
  const currentEvent = ref<RandomEvent | null>(null)
  const eventOutcome = ref<EventOutcome | null>(null)
  const isExploring = ref(false)
  const exploreCooldown = ref(0)
  const exploreInterval = ref<ReturnType<typeof setInterval> | null>(null)

  // ==================== 探险 ====================

  /** 开始随机探险 */
  function startExplore(): boolean {
    const playerStore = usePlayerStore()
    if (!playerStore.player) return false
    if (isExploring.value) return false

    const p = playerStore.player
    const realmLevel = p.attributes.currentRealm ? 0 : 0 // fallback
    // 获取当前境界等级
    const realmData = playerStore.currentRealmInfo()
    const currentRealmLevel = realmData?.level || 0

    // 获取可用事件池
    const eventPool = getEventsByRealm(currentRealmLevel)
    if (eventPool.length === 0) return false

    // 概率触发事件
    const triggeredEvent = weightedRandom(eventPool, e => e.probability)

    if (!triggeredEvent) {
      return false
    }

    currentEvent.value = triggeredEvent

    // 根据事件性质随机选择一个结果
    const outcome = weightedRandom(triggeredEvent.outcomes, o => o.probability)
    eventOutcome.value = outcome

    return true
  }

  /** 处理事件结果 */
  function processEventResult(): string {
    if (!currentEvent.value || !eventOutcome.value) return ''

    const playerStore = usePlayerStore()
    const inventoryStore = useInventoryStore()
    const combatStore = useCombatStore()
    const p = playerStore.player
    if (!p) return ''

    let resultMsg = `【${currentEvent.value.name}】\n${eventOutcome.value.description}\n`

    for (const effect of eventOutcome.value.effects) {
      switch (effect.type) {
        case 'gain_cultivation':
          p.attributes.cultivation += effect.value || 0
          resultMsg += `✅ 获得 ${effect.value} 修为\n`
          break
        case 'lose_cultivation':
          p.attributes.cultivation = Math.max(0, p.attributes.cultivation - (effect.value || 0))
          resultMsg += `❌ 损失 ${effect.value} 修为\n`
          break
        case 'gain_stones':
          p.attributes.spiritStones += effect.value || 0
          resultMsg += `💰 获得 ${effect.value} 灵石\n`
          break
        case 'lose_stones':
          p.attributes.spiritStones = Math.max(0, p.attributes.spiritStones - (effect.value || 0))
          resultMsg += `💸 损失 ${effect.value} 灵石\n`
          break
        case 'damage_hp':
          p.attributes.currentHp = Math.max(0, p.attributes.currentHp - (effect.value || 0))
          if (p.attributes.currentHp <= 0) {
            // 事件致死
            const cultivationLoss = Math.floor(p.attributes.cultivation * 0.25)
            p.attributes.cultivation = Math.max(0, p.attributes.cultivation - cultivationLoss)
            p.attributes.deathCount = (p.attributes.deathCount || 0) + 1
            p.attributes.resurrectionTime = Date.now() + 60000
            p.attributes.currentHp = Math.floor(p.attributes.maxHp * 0.3)
            resultMsg += `💀 身受重伤，险些丧命！损失 ${cultivationLoss} 修为，死亡次数 +1\n`
          } else {
            resultMsg += `💔 受到 ${effect.value} 点伤害\n`
          }
          break
        case 'heal_hp':
          p.attributes.currentHp = Math.min(p.attributes.maxHp, p.attributes.currentHp + (effect.value || 0))
          resultMsg += `💚 恢复 ${effect.value} 生命值\n`
          break
        case 'gain_item':
          if (effect.itemId) {
            const item = gameItems.find((i) => i.id === effect.itemId)
            if (item) {
              inventoryStore.addItem(item)
              resultMsg += `📦 获得【${item.name}】\n`
            }
          }
          break
        case 'trigger_combat':
          if (effect.enemyId) {
            resultMsg += '⚔️ 触发战斗！\n'
            combatStore.initCombat(effect.enemyId)
          }
          break
      }
    }

    playerStore.incrementTotalEvents()
    playerStore.saveCurrentGame()
    return resultMsg
  }

  /** 清除当前事件 */
  function clearEvent(): void {
    currentEvent.value = null
    eventOutcome.value = null
  }

  return {
    currentEvent,
    eventOutcome,
    isExploring,
    exploreCooldown,
    startExplore,
    processEventResult,
    clearEvent,
  }
})

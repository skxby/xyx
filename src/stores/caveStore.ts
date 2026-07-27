// ============================================================
// 洞府系统状态管理
// ============================================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { caveLevels } from '@/data/cave'
import { usePlayerStore } from './playerStore'
import { useInventoryStore } from './inventoryStore'

export const useCaveStore = defineStore('cave', () => {
  const currentLevel = ref(1)

  const currentCave = computed(() =>
    caveLevels.find(c => c.level === currentLevel.value) || caveLevels[0]
  )

  const nextCave = computed(() =>
    caveLevels.find(c => c.level === currentLevel.value + 1) || null
  )

  const canUpgrade = computed(() => {
    if (!nextCave.value) return false
    const playerStore = usePlayerStore()
    const p = playerStore.player
    if (!p) return false

    const cost = nextCave.value.upgradeCost
    if (p.attributes.spiritStones < cost.stones) return false

    for (const mat of cost.materials) {
      const owned = p.inventory
        .filter(i => i.itemId === mat.itemId)
        .reduce((sum, i) => sum + i.quantity, 0)
      if (owned < mat.quantity) return false
    }

    return true
  })

  /** 升级洞府 */
  function upgrade(): string {
    if (!nextCave.value) return '已达到最高等级'
    if (!canUpgrade.value) return '资源不足，无法升级'

    const playerStore = usePlayerStore()
    const p = playerStore.player
    if (!p) return '玩家数据不存在'

    const cost = nextCave.value.upgradeCost
    p.attributes.spiritStones -= cost.stones

    for (const mat of cost.materials) {
      let remaining = mat.quantity
      for (const entry of p.inventory) {
        if (entry.itemId === mat.itemId && remaining > 0) {
          const toRemove = Math.min(remaining, entry.quantity)
          entry.quantity -= toRemove
          remaining -= toRemove
        }
      }
      // 清理空物品
      p.inventory = p.inventory.filter(i => i.quantity > 0)
    }

    currentLevel.value++
    playerStore.saveCurrentGame()
    return `洞府升级成功！现在是【${nextCave.value.name}】，修炼速度+${Math.round(nextCave.value.cultivationBonus * 100)}%`
  }

  /** 获取修炼加成 */
  function getCultivationBonus(): number {
    return currentCave.value?.cultivationBonus || 0
  }

  return {
    currentLevel,
    currentCave,
    nextCave,
    canUpgrade,
    upgrade,
    getCultivationBonus,
    caveLevels,
  }
})

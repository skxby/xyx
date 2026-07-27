// ============================================================
// 每日任务状态管理
// ============================================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { dailyQuestTemplates, MAX_DAILY_QUESTS } from '@/data/quests'
import { usePlayerStore } from './playerStore'
import { useInventoryStore } from './inventoryStore'
import { getItemById } from '@/utils/loot'
import type { DailyQuest } from '@/types'

export const useQuestStore = defineStore('quest', () => {
  const activeQuests = ref<DailyQuest[]>([])
  const lastResetDate = ref('')

  /** 检查是否需要刷新每日任务 */
  function checkDailyReset() {
    const today = new Date().toDateString()
    if (lastResetDate.value !== today) {
      lastResetDate.value = today
      resetQuests()
    }
  }

  /** 刷新每日任务 */
  function resetQuests() {
    const playerStore = usePlayerStore()
    const realm = playerStore.currentRealmInfo()
    const realmLevel = realm?.level || 0

    // 筛选当前境界可用的任务
    const available = dailyQuestTemplates.filter(q => q.minRealmLevel <= realmLevel)

    // 随机选择 MAX_DAILY_QUESTS 个
    const shuffled = [...available].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, MAX_DAILY_QUESTS)

    activeQuests.value = selected.map(q => ({
      id: q.id,
      title: q.title,
      description: q.description,
      type: q.type,
      target: q.target,
      progress: 0,
      reward: { ...q.reward },
      completed: false,
      claimed: false,
    }))
  }

  /** 更新任务进度 */
  function updateProgress(type: DailyQuest['type'], amount: number = 1) {
    checkDailyReset()
    for (const quest of activeQuests.value) {
      if (quest.type === type && !quest.completed) {
        quest.progress = Math.min(quest.target, quest.progress + amount)
        if (quest.progress >= quest.target) {
          quest.completed = true
        }
      }
    }
  }

  /** 领取奖励 */
  function claimReward(questId: string): string {
    const quest = activeQuests.value.find(q => q.id === questId)
    if (!quest) return '任务不存在'
    if (!quest.completed) return '任务未完成'
    if (quest.claimed) return '奖励已领取'

    const playerStore = usePlayerStore()
    const inventoryStore = useInventoryStore()

    if (!playerStore.player) return '玩家数据不存在'

    playerStore.player.attributes.cultivation += quest.reward.cultivation
    playerStore.player.attributes.spiritStones += quest.reward.stones
    quest.claimed = true

    if (quest.reward.itemId) {
      const item = getItemById(quest.reward.itemId)
      if (item) {
        inventoryStore.addItem(item)
      }
    }

    playerStore.saveCurrentGame()
    return `领取成功！获得 ${quest.reward.cultivation} 修为 + ${quest.reward.stones} 灵石`
  }

  /** 可领取的完成数 */
  const completableCount = computed(() =>
    activeQuests.value.filter(q => q.completed && !q.claimed).length
  )

  return {
    activeQuests,
    lastResetDate,
    checkDailyReset,
    resetQuests,
    updateProgress,
    claimReward,
    completableCount,
  }
})

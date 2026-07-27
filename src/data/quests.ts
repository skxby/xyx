// ============================================================
// 每日任务数据配置
// ============================================================
import type { DailyQuest } from '@/types'

export interface DailyQuestTemplate {
  id: string
  title: string
  description: string
  type: DailyQuest['type']
  target: number
  minRealmLevel: number
  reward: { cultivation: number; stones: number; itemId?: string }
}

export const dailyQuestTemplates: DailyQuestTemplate[] = [
  {
    id: 'dq_kill_3', title: '斩妖除魔', description: '击败3名敌人',
    type: 'kill', target: 3, minRealmLevel: 0,
    reward: { cultivation: 100, stones: 30 },
  },
  {
    id: 'dq_kill_10', title: '战意昂扬', description: '击败10名敌人',
    type: 'kill', target: 10, minRealmLevel: 2,
    reward: { cultivation: 500, stones: 100, itemId: 'pill_cultivation' },
  },
  {
    id: 'dq_cultivate_500', title: '勤修不辍', description: '获得500点修为',
    type: 'cultivate', target: 500, minRealmLevel: 0,
    reward: { cultivation: 150, stones: 20 },
  },
  {
    id: 'dq_cultivate_2000', title: '大彻大悟', description: '获得2000点修为',
    type: 'cultivate', target: 2000, minRealmLevel: 3,
    reward: { cultivation: 500, stones: 80, itemId: 'pill_heal_medium' },
  },
  {
    id: 'dq_explore_2', title: '云游四海', description: '探索2次',
    type: 'explore', target: 2, minRealmLevel: 0,
    reward: { cultivation: 80, stones: 50, itemId: 'mat_herb' },
  },
  {
    id: 'dq_explore_5', title: '秘境寻踪', description: '探索5次',
    type: 'explore', target: 5, minRealmLevel: 2,
    reward: { cultivation: 300, stones: 150, itemId: 'mat_herb_rare' },
  },
  {
    id: 'dq_craft_1', title: '炼丹新手', description: '制作1次丹药',
    type: 'craft', target: 1, minRealmLevel: 1,
    reward: { cultivation: 60, stones: 40, itemId: 'mat_herb' },
  },
  {
    id: 'dq_craft_3', title: '炼器大师', description: '制作3次',
    type: 'craft', target: 3, minRealmLevel: 3,
    reward: { cultivation: 300, stones: 200, itemId: 'mat_ore_spirit' },
  },
  {
    id: 'dq_buy_1', title: '坊市常客', description: '购买1件物品',
    type: 'buy', target: 1, minRealmLevel: 0,
    reward: { cultivation: 50, stones: 15 },
  },
  {
    id: 'dq_buy_5', title: '挥金如土', description: '购买5件物品',
    type: 'buy', target: 5, minRealmLevel: 1,
    reward: { cultivation: 200, stones: 100, itemId: 'pill_cultivation' },
  },
]

/** 每日可领取的最大任务数 */
export const MAX_DAILY_QUESTS = 3

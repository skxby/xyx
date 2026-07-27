// ============================================================
// 境界数据配置
// ============================================================
import type { Realm } from '@/types'

export const realms: Realm[] = [
  {
    id: 'mortal',
    name: '凡人',
    level: 0,
    requiredCultivation: 0,
    breakthroughBaseRate: 1.0,
    tribulationRate: 0,
    statBonus: {},
    description: '尚未踏入修仙之途，需觉醒灵根方能修炼',
  },
  {
    id: 'qi_refining',
    name: '炼气期',
    level: 1,
    requiredCultivation: 100,
    breakthroughBaseRate: 0.90,
    tribulationRate: 0,
    statBonus: { attack: 5, defense: 3, dodge: 0.01, accuracy: 0.02 },
    description: '感应天地灵气，凝聚灵力于丹田，修仙入门之境',
  },
  {
    id: 'foundation',
    name: '筑基期',
    level: 2,
    requiredCultivation: 500,
    breakthroughBaseRate: 0.75,
    tribulationRate: 0,
    statBonus: { attack: 15, defense: 10, dodge: 0.03, accuracy: 0.04 },
    description: '筑就道基，灵力初成，正式踏上修仙大道',
  },
  {
    id: 'golden_core',
    name: '金丹期',
    level: 3,
    requiredCultivation: 2000,
    breakthroughBaseRate: 0.60,
    tribulationRate: 0,
    statBonus: { attack: 35, defense: 25, dodge: 0.05, accuracy: 0.06 },
    description: '凝结金丹，灵力凝实，寿元大增',
  },
  {
    id: 'nascent_soul',
    name: '元婴期',
    level: 4,
    requiredCultivation: 8000,
    breakthroughBaseRate: 0.45,
    tribulationRate: 0.10,
    statBonus: { attack: 70, defense: 50, dodge: 0.08, accuracy: 0.09 },
    description: '金丹化婴，神识初开，可御剑飞行',
  },
  {
    id: 'spirit_severing',
    name: '化神期',
    level: 5,
    requiredCultivation: 30000,
    breakthroughBaseRate: 0.35,
    tribulationRate: 0.20,
    statBonus: { attack: 130, defense: 90, dodge: 0.10, accuracy: 0.12 },
    description: '化身千万，神识覆盖千里，神通初显',
  },
  {
    id: 'void_refining',
    name: '炼虚期',
    level: 6,
    requiredCultivation: 100000,
    breakthroughBaseRate: 0.25,
    tribulationRate: 0.35,
    statBonus: { attack: 250, defense: 170, dodge: 0.13, accuracy: 0.15 },
    description: '炼化虚空，身融天地，举手投足引动天地之力',
  },
  {
    id: 'body_integration',
    name: '合体期',
    level: 7,
    requiredCultivation: 350000,
    breakthroughBaseRate: 0.18,
    tribulationRate: 0.50,
    statBonus: { attack: 500, defense: 350, dodge: 0.16, accuracy: 0.18 },
    description: '天人合一，法力与肉身合为一体，战力暴增',
  },
  {
    id: 'mahayana',
    name: '大乘期',
    level: 8,
    requiredCultivation: 1200000,
    breakthroughBaseRate: 0.12,
    tribulationRate: 0.70,
    statBonus: { attack: 1000, defense: 700, dodge: 0.20, accuracy: 0.22 },
    description: '万法归一，几近飞升，只差最后一步渡劫',
  },
  {
    id: 'tribulation',
    name: '渡劫期',
    level: 9,
    requiredCultivation: 5000000,
    breakthroughBaseRate: 0.08,
    tribulationRate: 0.90,
    statBonus: { attack: 2000, defense: 1400, dodge: 0.25, accuracy: 0.25 },
    description: '历经天劫洗礼，渡过即可飞升仙界',
  },
]

/** 根据境界ID获取境界数据 */
export function getRealmById(id: string): Realm | undefined {
  return realms.find(r => r.id === id)
}

/** 获取下一个境界 */
export function getNextRealm(currentId: string): Realm | undefined {
  const current = getRealmById(currentId)
  if (!current) return undefined
  return realms.find(r => r.level === current.level + 1)
}

/** 获取上一个境界（用于死亡降级） */
export function getPreviousRealm(currentId: string): Realm | undefined {
  const current = getRealmById(currentId)
  if (!current || current.level <= 0) return undefined
  return realms.find(r => r.level === current.level - 1)
}

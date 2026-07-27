// ============================================================
// 洞府系统数据
// ============================================================
import type { CaveDwelling } from '@/types'

export const caveLevels: CaveDwelling[] = [
  {
    level: 1,
    name: '简陋石室',
    cultivationBonus: 0.05,
    upgradeCost: { stones: 200, materials: [{ itemId: 'mat_ore_iron', quantity: 5 }] },
    description: '山中开采的简陋石室，勉强可遮风挡雨，灵气稀薄。',
  },
  {
    level: 2,
    name: '灵气洞府',
    cultivationBonus: 0.10,
    upgradeCost: { stones: 800, materials: [{ itemId: 'mat_ore_spirit', quantity: 5 }, { itemId: 'mat_crystal', quantity: 10 }] },
    description: '选址在灵气汇聚之处，修炼效率大幅提升。',
  },
  {
    level: 3,
    name: '仙家福地',
    cultivationBonus: 0.20,
    upgradeCost: { stones: 3000, materials: [{ itemId: 'mat_jade_fire', quantity: 5 }, { itemId: 'mat_ore_spirit', quantity: 10 }] },
    description: '布置了聚灵阵法的洞府，灵气如雾，修炼一日千里。',
  },
  {
    level: 4,
    name: '洞天福地',
    cultivationBonus: 0.35,
    upgradeCost: { stones: 10000, materials: [{ itemId: 'mat_dragon_blood', quantity: 3 }, { itemId: 'mat_heart_lava', quantity: 5 }] },
    description: '传说中的福地洞天，内有乾坤，自成一方小世界。',
  },
  {
    level: 5,
    name: '太虚幻境',
    cultivationBonus: 0.50,
    upgradeCost: { stones: 50000, materials: [{ itemId: 'mat_phoenix_feather', quantity: 3 }, { itemId: 'mat_dragon_blood', quantity: 10 }] },
    description: '太虚之中开辟的幻境，灵气浓郁如实质。修炼速度提升五成。',
  },
]

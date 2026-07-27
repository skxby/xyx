// ============================================================
// 灵兽/道侣/宗门 养成系统数据
// ============================================================

export interface SpiritPet {
  id: string
  name: string
  rarity: 'green' | 'blue' | 'purple' | 'gold'
  description: string
  /** 灵兽提供的属性加成 */
  statBonus: { type: string; value: number }[]
  /** 灵兽技能 */
  skillDescription: string
  /** 进化所需灵石 */
  evolveCost: number
  /** 最大进化等级 */
  maxLevel: number
}

export const spiritPets: SpiritPet[] = [
  {
    id: 'pet_spirit_fox', name: '灵狐', rarity: 'green',
    description: '一只通体雪白的小灵狐，眼中透着灵性',
    statBonus: [{ type: 'dodge', value: 0.03 }, { type: 'speed', value: 3 }],
    skillDescription: '战斗中偶尔帮助主人闪避攻击',
    evolveCost: 200, maxLevel: 5,
  },
  {
    id: 'pet_flame_bird', name: '火雀', rarity: 'blue',
    description: '拥有凤凰血脉的小火鸟，栖息在主人肩头',
    statBonus: [{ type: 'attack', value: 10 }, { type: 'critRate', value: 0.03 }],
    skillDescription: '战斗中偶尔喷吐火焰协助攻击',
    evolveCost: 500, maxLevel: 6,
  },
  {
    id: 'pet_ice_dragon', name: '冰蛟幼崽', rarity: 'purple',
    description: '一条拥有真龙血脉的冰蛟幼崽，环绕在主人身边',
    statBonus: [{ type: 'attack', value: 25 }, { type: 'defense', value: 15 }, { type: 'critRate', value: 0.05 }],
    skillDescription: '战斗中可能释放冰霜吐息造成额外伤害',
    evolveCost: 1500, maxLevel: 8,
  },
  {
    id: 'pet_thunder_phoenix', name: '雷凤', rarity: 'gold',
    description: '传说中掌控雷电的凤凰后裔，展翅间雷光闪烁',
    statBonus: [{ type: 'attack', value: 50 }, { type: 'speed', value: 10 }, { type: 'critRate', value: 0.08 }, { type: 'dodge', value: 0.05 }],
    skillDescription: '战斗中有概率释放雷霆万钧对全体敌人造成伤害',
    evolveCost: 5000, maxLevel: 10,
  },
]

// ==================== 道侣系统 ====================

export interface Companion {
  id: string
  name: string
  gender: 'male' | 'female'
  rarity: 'blue' | 'purple' | 'gold'
  description: string
  meetCondition: string      // 结识条件描述
  statBonus: { type: string; value: number }[]
  specialSkill: string
  cultivationBoost: number   // 修炼速度加成百分比
}

export const companions: Companion[] = [
  {
    id: 'companion_lingshan', name: '灵珊仙子', gender: 'female', rarity: 'blue',
    description: '温柔体贴的灵修女修，擅长炼丹之术',
    meetCondition: '境界达到筑基期后，有概率在随机探险中结识',
    statBonus: [{ type: 'defense', value: 10 }, { type: 'daoHeart', value: 2 }],
    specialSkill: '每日可赠送1枚聚灵丹',
    cultivationBoost: 0.10,
  },
  {
    id: 'companion_fengchen', name: '风尘剑客', gender: 'male', rarity: 'blue',
    description: '武艺超群的剑修侠客，豪气干云',
    meetCondition: '通关精英级副本后，有概率在探险中结识',
    statBonus: [{ type: 'attack', value: 15 }, { type: 'critRate', value: 0.03 }],
    specialSkill: '战斗中偶尔协同攻击',
    cultivationBoost: 0.05,
  },
  {
    id: 'companion_xueji', name: '血姬魔女', gender: 'female', rarity: 'purple',
    description: '神秘妖艳的邪修高手，实力深不可测',
    meetCondition: '邪修专属，境界达到金丹期后可结识',
    statBonus: [{ type: 'attack', value: 25 }, { type: 'critRate', value: 0.05 }, { type: 'critResist', value: 0.03 }],
    specialSkill: '战斗失败时，有概率为你抵挡致命一击',
    cultivationBoost: 0.08,
  },
  {
    id: 'companion_qingyun', name: '青云道尊', gender: 'male', rarity: 'gold',
    description: '修为深不可测的前辈高人，愿意提携后辈',
    meetCondition: '境界达到化神期后，在秘境中有极低概率遇到',
    statBonus: [{ type: 'attack', value: 40 }, { type: 'defense', value: 30 }, { type: 'daoHeart', value: 5 }],
    specialSkill: '突破时提供额外15%成功率加成',
    cultivationBoost: 0.20,
  },
]

// ==================== 宗门系统 ====================

export interface Sect {
  id: string
  name: string
  description: string
  joinRequirement: string
  bonuses: { name: string; value: string }[]
  statBonuses: { attack?: number; defense?: number; critRate?: number; cultivationSpeed?: number; maxHp?: number; speed?: number }
  dailyReward: string
}

export const sects: Sect[] = [
  {
    id: 'sect_sword', name: '天剑宗', description: '以剑道闻名天下的大宗门，门下弟子皆为剑修',
    joinRequirement: '剑修专属，境界达到筑基期',
    bonuses: [
      { name: '剑道真意', value: '攻击力+15' },
      { name: '剑罡护体', value: '防御力+10' },
      { name: '宗门资源', value: '每日领取30灵石' },
    ],
    statBonuses: { attack: 15, defense: 10 },
    dailyReward: '30灵石 + 1枚聚灵丹',
  },
  {
    id: 'sect_spirit', name: '玄灵宗', description: '以感悟天道为宗旨的大宗门，灵修圣地',
    joinRequirement: '灵修专属，境界达到筑基期',
    bonuses: [
      { name: '天道感悟', value: '修炼速度+15%' },
      { name: '灵光普照', value: '悟性+3' },
      { name: '宗门药园', value: '每日领取2株灵草' },
    ],
    statBonuses: { cultivationSpeed: 0.15 },
    dailyReward: '20灵石 + 2株灵草',
  },
  {
    id: 'sect_demon', name: '万魔殿', description: '邪修聚集的隐秘宗门，追求极致力量',
    joinRequirement: '邪修专属，境界达到筑基期',
    bonuses: [
      { name: '魔功真传', value: '暴击率+5%' },
      { name: '以战养战', value: '击败敌人额外获得20%修为' },
      { name: '血池修炼', value: '每日可挑战血池获得修为' },
    ],
    statBonuses: { critRate: 0.05, attack: 8 },
    dailyReward: '50灵石（高风险高回报）',
  },
  {
    id: 'sect_neutral', name: '散修联盟', description: '不属于任何大势力的散修互助组织',
    joinRequirement: '无限制，境界达到筑基期即可',
    bonuses: [
      { name: '自由之身', value: '不受宗门约束，可随时切换' },
      { name: '情报共享', value: '探索触发稀有事件概率+5%' },
      { name: '集市优惠', value: '商店购买9折' },
    ],
    statBonuses: { speed: 5, defense: 5 },
    dailyReward: '15灵石',
  },
]

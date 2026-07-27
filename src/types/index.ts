// ============================================================
// 文字修仙游戏 - 全局类型定义
// ============================================================

// ==================== 基础枚举 ====================

/** 修炼方向 */
export type CultivationType = 'sword' | 'spirit' | 'demon' // 剑修 | 灵修 | 邪修
export const CultivationTypeLabel: Record<CultivationType, string> = {
  sword: '剑修',
  spirit: '灵修',
  demon: '邪修',
}

/** 灵根类型 */
export type SpiritRoot = 'gold' | 'wood' | 'water' | 'fire' | 'earth' | 'wind' | 'thunder'
export const SpiritRootLabel: Record<SpiritRoot, string> = {
  gold: '金灵根',
  wood: '木灵根',
  water: '水灵根',
  fire: '火灵根',
  earth: '土灵根',
  wind: '风灵根',
  thunder: '雷灵根',
}

/** 性别 */
export type Gender = 'male' | 'female'
export const GenderLabel: Record<Gender, string> = {
  male: '男',
  female: '女',
}

/** 境界 */
export type RealmLevel =
  | 'mortal'
  | 'qi_refining'
  | 'foundation'
  | 'golden_core'
  | 'nascent_soul'
  | 'spirit_severing'
  | 'void_refining'
  | 'body_integration'
  | 'mahayana'
  | 'tribulation'
export const RealmLevelLabel: Record<RealmLevel, string> = {
  mortal: '凡人',
  qi_refining: '炼气期',
  foundation: '筑基期',
  golden_core: '金丹期',
  nascent_soul: '元婴期',
  spirit_severing: '化神期',
  void_refining: '炼虚期',
  body_integration: '合体期',
  mahayana: '大乘期',
  tribulation: '渡劫期',
}

/** 稀有度 */
export type Rarity = 'white' | 'green' | 'blue' | 'purple' | 'gold' | 'unique'
export const RarityLevel: Record<Rarity, number> = {
  white: 1,
  green: 2,
  blue: 3,
  purple: 4,
  gold: 5,
  unique: 6,
}
export const RarityLabel: Record<Rarity, string> = {
  white: '凡品',
  green: '中品',
  blue: '上品',
  purple: '极品',
  gold: '仙品',
  unique: '唯一',
}
export const RarityColor: Record<Rarity, string> = {
  white: '#9E9E9E',
  green: '#4CAF50',
  blue: '#2196F3',
  purple: '#9C27B0',
  gold: '#FF9800',
  unique: '#F44336',
}

/** 物品类型 */
export type ItemType = 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material' | 'skill_book' | 'special'

/** 技能类型 */
export type SkillType = 'attack' | 'defense' | 'support' | 'cultivation' | 'passive'

/** 敌人梯度 */
export type EnemyTier = 'novice' | 'normal' | 'elite' | 'lord' | 'ancient_beast' | 'unique_boss'

/** 事件类型 */
export type EventType =
  | 'fortune'       // 奇遇
  | 'secret_realm'  // 秘境
  | 'tribulation'   // 天劫
  | 'opportunity'   // 机缘
  | 'trap'          // 陷阱
  | 'duel'          // 修士切磋
  | 'inheritance'   // 上古传承
  | 'punishment'    // 惩戒事件
  | 'treasure'      // 宝藏

/** 事件性质 */
export type EventNature = 'positive' | 'negative' | 'neutral'

// ==================== 属性接口 ====================

/** 基础生存属性 */
export interface VitalStats {
  currentHp: number
  maxHp: number
  cultivation: number      // 修为值
  currentRealm: RealmLevel
}

/** 战斗核心属性 */
export interface CombatStats {
  attack: number
  defense: number
  dodge: number            // 闪避值
  accuracy: number         // 命中率
  speed: number
  critRate: number         // 暴击率
  critResist: number       // 抗暴击率
}

/** 修仙属性 */
export interface CultivationStats {
  rootBone: number         // 根骨
  comprehension: number    // 悟性
  divineSense: number      // 神识
  daoHeart: number         // 道心
  fortune: number          // 气运
}

/** 玩家完整属性 */
export interface PlayerAttributes extends VitalStats, CombatStats, CultivationStats {
  spiritStones: number          // 灵石
  merit: number                 // 功德
  breakthroughBonus: number     // 突破成功率加成（限下次突破）
  activeBuffs: ActiveBuff[]     // 当前生效的临时增益
  deathCount: number            // 死亡次数
  resurrectionTime: number      // 复活倒计时结束时间戳（0=正常）
}

/** 临时增益/Buff */
export interface ActiveBuff {
  id: string
  name: string
  type: 'attack' | 'defense' | 'crit' | 'dodge' | 'speed' | 'hp_regen' | 'cultivation_speed'
  value: number
  remainingSeconds: number
}

// ==================== 角色/灵根 ====================

/** 角色信息 */
export interface Player {
  name: string
  gender: Gender
  cultivationType: CultivationType
  spiritRoots: SpiritRoot[]  // 1-2个灵根
  attributes: PlayerAttributes
  equipment: EquipmentSlots
  skills: PlayerSkill[]
  inventory: InventoryItem[]
  unlockedSkills: string[]    // 已解锁技能ID
  defeatedUniqueItems: string[] // 已击败的唯一掉落物品ID
}

/** 装备槽位 */
export interface EquipmentSlots {
  weapon: Equipment | null
  armor: Equipment | null
  accessory: Equipment | null
}

/** 玩家已学技能 */
export interface PlayerSkill {
  skillId: string
  level: number             // 技能等级
  isActive: boolean         // 是否启用(被动技能)
}

// ==================== 境界 ====================

export interface Realm {
  id: RealmLevel
  name: string
  level: number             // 境界排序
  requiredCultivation: number
  breakthroughBaseRate: number  // 突破基础成功率
  tribulationRate: number       // 天劫触发概率
  statBonus: Partial<CombatStats>
  description: string
}

// ==================== 物品/装备 ====================

export interface BaseItem {
  id: string
  name: string
  type: ItemType
  rarity: Rarity
  description: string
  price: number             // 灵石价格
  stackable: boolean
  maxStack: number
}

export interface Equipment extends BaseItem {
  type: 'weapon' | 'armor' | 'accessory'
  level: number
  stats: Partial<CombatStats>
  setBonus?: {
    setId: string
    setName: string
    piecesRequired: number
    bonus: Partial<CombatStats>
    description: string
  }
}

export interface Consumable extends BaseItem {
  type: 'consumable'
  effects: ConsumableEffect[]
  cooldown?: number          // 使用冷却(回合数)
}

export interface ConsumableEffect {
  type: 'heal_hp' | 'heal_mp' | 'buff_attack' | 'buff_defense' | 'buff_crit' | 'buff_speed'
       | 'restore' | 'cultivation_boost' | 'breakthrough_boost' | 'permanent_stat'
  value: number
  duration?: number          // 持续回合数
}

export interface Material extends BaseItem {
  type: 'material'
  materialType: 'alchemy' | 'forging' | 'formation'  // 炼丹|炼器|阵法
  tier: number               // 材料等级
}

export interface SkillBook extends BaseItem {
  type: 'skill_book'
  skillId: string            // 对应的技能ID
}

export type GameItem = Equipment | Consumable | Material | SkillBook

// ==================== 技能 ====================

export interface Skill {
  id: string
  name: string
  rarity: Rarity
  type: SkillType
  cultivationType: CultivationType | 'all'  // 道修方向限制
  level: number
  description: string
  power: number              // 威力系数(0-1)
  effects: SkillEffect[]
  learnRequirements: {
    realmLevel: number
  }
  isUnique: boolean          // 是否唯一技能
}

export interface SkillEffect {
  type: 'damage' | 'heal' | 'buff_attack' | 'buff_defense' | 'debuff_defense' | 'dot'
       | 'passive_attack' | 'passive_defense' | 'passive_hp' | 'passive_speed'
       | 'passive_crit' | 'passive_dodge' | 'passive_cultivation'
  value: number
  duration?: number          // 持续回合
}

// ==================== 战斗 ====================

export interface CombatUnit {
  id: string
  name: string
  isPlayer: boolean
  attributes: {
    currentHp: number
    maxHp: number
    attack: number
    defense: number
    dodge: number
    accuracy: number
    speed: number
    critRate: number
    critResist: number
  }
  skills: CombatSkill[]
  buffs: CombatBuff[]
}

export interface CombatSkill {
  skillId: string
  name: string
  type: SkillType
  power: number
  currentCooldown: number
  maxCooldown: number
}

export interface CombatBuff {
  id: string
  name: string
  type: 'attack' | 'defense' | 'crit' | 'dodge' | 'dot'
  value: number
  remainingTurns: number
}

export interface CombatLog {
  round: number
  message: string
  type: 'normal' | 'crit' | 'miss' | 'dodge' | 'skill' | 'heal' | 'buff' | 'system'
}

export type CombatPhase =
  | 'idle'
  | 'player_turn'
  | 'enemy_turn'
  | 'victory'
  | 'defeat'
  | 'fled'

// ==================== 敌人/BOSS ====================

export interface Enemy {
  id: string
  name: string
  tier: EnemyTier
  realmLevel: number
  stats: {
    maxHp: number
    attack: number
    defense: number
    dodge: number
    accuracy: number
    speed: number
    critRate: number
    critResist: number
  }
  skills: string[]          // 技能ID列表
  drops: DropEntry[]
  expReward: number
  stoneReward: number
  description: string
}

export interface DropEntry {
  itemId: string
  probability: number        // 掉落概率（0-1）
  rarity: Rarity
}

// ==================== 副本/事件 ====================

export interface Dungeon {
  id: string
  name: string
  realmRequirement: number
  enemies: string[]          // 敌人ID池
  bossId: string             // Boss ID
  rewards: DungeonReward
  description: string
  cooldownMinutes: number    // 冷却时间（分钟）
}

export interface DungeonReward {
  exp: number
  stones: number
  bonusDrops: DropEntry[]
}

export interface RandomEvent {
  id: string
  name: string
  type: EventType
  nature: EventNature
  description: string
  probability: number        // 触发概率
  minRealmLevel: number
  outcomes: EventOutcome[]
}

export interface EventOutcome {
  description: string
  probability: number
  effects: EventEffect[]
}

export interface EventEffect {
  type: 'gain_cultivation' | 'lose_cultivation' | 'gain_item' | 'lose_item' | 'gain_stones' | 'lose_stones'
      | 'damage_hp' | 'heal_hp' | 'trigger_combat' | 'unlock_skill' | 'buff' | 'debuff'
  value?: number
  itemId?: string
  enemyId?: string
}

// ==================== 存档 ====================

export interface SaveData {
  version: string
  timestamp: number
  player: Player
  gameProgress: GameProgress
}

export interface GameProgress {
  totalKills: number
  totalEvents: number
  dungeonsCleared: string[]
  defeatedUniqueItems: string[]
  achievements: string[]
  completedChapters: string[]
}

// ==================== 故事线 ====================

export interface StoryChapter {
  id: string
  title: string
  subtitle: string
  requiredRealm: RealmLevel
  description: string
  dialogue: string[]
  rewards: { cultivation: number; stones: number; items: string[] }
}

// ==================== 每日任务 ====================

export interface DailyQuest {
  id: string
  title: string
  description: string
  type: 'kill' | 'cultivate' | 'explore' | 'craft' | 'buy'
  target: number
  progress: number
  reward: { cultivation: number; stones: number; itemId?: string }
  completed: boolean
  claimed: boolean
}

// ==================== 洞府 ====================

export interface CaveDwelling {
  level: number
  name: string
  cultivationBonus: number
  upgradeCost: { stones: number; materials: { itemId: string; quantity: number }[] }
  description: string
}

// ==================== 背包物品 ====================

export interface InventoryItem {
  uid: string               // 唯一标识（用于区分同种物品的不同实例）
  itemId: string
  quantity: number
  isEquipped: boolean
}

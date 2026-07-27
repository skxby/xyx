// ============================================================
// 游戏全局常量配置
// ============================================================

/** 游戏版本 */
export const GAME_VERSION = '1.0.0'

/** 存档键名 */
export const SAVE_KEY = 'xiuxian_game_save'

/** 自动保存间隔（毫秒） */
export const AUTO_SAVE_INTERVAL = 30000

// ==================== 灵根概率配置 ====================

/** 七大灵根池 */
export const SPIRIT_ROOT_POOL = ['gold', 'wood', 'water', 'fire', 'earth', 'wind', 'thunder'] as const

/** 单灵根概率（70%） */
export const SINGLE_ROOT_CHANCE = 0.7
/** 双灵根概率（30%） */
export const DOUBLE_ROOT_CHANCE = 0.3

// ==================== 稀有度掉落概率 ====================

/** 各稀有度基础掉落概率（从低到高递减） */
export const RARITY_DROP_RATES: Record<string, number> = {
  white: 0.45,    // 45%
  green: 0.25,    // 25%
  blue: 0.15,     // 15%
  purple: 0.10,   // 10%
  gold: 0.04,     // 4%
  unique: 0.01,   // 1%
}

// ==================== 战斗公式常量 ====================

/** 基础命中率 */
export const BASE_HIT_RATE = 0.5

/** 基础暴击率（0表示完全由属性决定） */
export const BASE_CRIT_RATE = 0.05

/** 暴击伤害倍率 */
export const CRIT_DAMAGE_MULTIPLIER = 1.5

/** 浮动伤害范围 */
export const DAMAGE_VARIANCE = 0.1  // ±10%

// ==================== 境界常量 ====================

// ==================== 死亡/复活机制 ====================

/** 死亡时修为损失比例 */
export const DEATH_CULTIVATION_LOSS = 0.25

/** 复活冷却时间（毫秒） */
export const RESURRECTION_COOLDOWN = 60000

/** 死亡时境界掉落概率 */
export const DEATH_REALM_DEMOTION_CHANCE = 0.05

// ==================== 生命恢复 ====================

/** HP每秒恢复率（maxHp的百分比） */
export const HP_REGEN_RATE = 0.01

// ==================== 境界常量 ====================

/** 修炼速度基础值（修为/秒） */
export const BASE_CULTIVATION_SPEED = 1

/** 不同类型修炼速度加成 */
export const CULTIVATION_TYPE_SPEED_BONUS: Record<string, number> = {
  sword: 1.0,     // 剑修标准速度
  spirit: 1.3,    // 灵修快30%
  demon: 0.8,     // 邪修慢20%但战力高
}

// ==================== 初始属性 ====================

/** 新手初始属性 */
export const INITIAL_ATTRIBUTES = {
  currentHp: 100,
  maxHp: 100,
  cultivation: 0,
  currentRealm: 'mortal' as const,
  attack: 10,
  defense: 5,
  dodge: 0.05,
  accuracy: 0.10,
  speed: 10,
  critRate: 0.05,
  critResist: 0.02,
  rootBone: 5,
  comprehension: 5,
  divineSense: 5,
  daoHeart: 5,
  fortune: 5,
  spiritStones: 0,
  merit: 0,
  breakthroughBonus: 0,
  activeBuffs: [],
  deathCount: 0,
  resurrectionTime: 0,
}

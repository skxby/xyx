// ============================================================
// 玩家核心状态管理
// ============================================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Player, Gender, CultivationType, SpiritRoot, PlayerAttributes, RealmLevel, GameProgress } from '@/types'
import { INITIAL_ATTRIBUTES, SPIRIT_ROOT_POOL, SINGLE_ROOT_CHANCE } from '@/data/constants'
import { getRealmById } from '@/data/realms'
import { getInitialSkill, skills } from '@/data/skills'
import { randomPick, randomPickN, rollProbability } from '@/utils/random'
import { calcCultivationSpeed, addCultivation, attemptBreakthrough, getCultivationProgress } from '@/utils/cultivation'
import { saveGame, createNewSave, loadGame, deleteSave, hasSave } from '@/utils/save'

export const usePlayerStore = defineStore('player', () => {
  // ==================== 状态 ====================
  const player = ref<Player | null>(null)
  const cultivationInterval = ref<ReturnType<typeof setInterval> | null>(null)
  const externalCultivationBoost = ref(0)  // 道侣/宗门等外部修炼加成
  const gameProgress = ref<GameProgress>({
    totalKills: 0, totalEvents: 0, dungeonsCleared: [], defeatedUniqueItems: [], achievements: [], completedChapters: [],
  })
  const isCreated = computed(() => player.value !== null)

  // ==================== 角色创建 ====================

  /** 随机觉醒灵根 */
  function awakenSpiritRoots(): SpiritRoot[] {
    const isSingle = rollProbability(SINGLE_ROOT_CHANCE)
    if (isSingle) {
      // 单灵根：7种均等概率
      return [randomPick([...SPIRIT_ROOT_POOL])!]
    } else {
      // 双灵根：随机2种，不重复
      return randomPickN([...SPIRIT_ROOT_POOL], 2)
    }
  }

  /** 创建角色 */
  function createPlayer(
    name: string,
    gender: Gender,
    cultivationType: CultivationType
  ): Player {
    const spiritRoots = awakenSpiritRoots()

    const attributes: PlayerAttributes = { ...INITIAL_ATTRIBUTES }

    // 修炼方向专属初始属性
    switch (cultivationType) {
      case 'sword':
        attributes.attack += 5
        attributes.defense += 2
        attributes.critRate += 0.03
        break
      case 'spirit':
        attributes.attack += 2
        attributes.defense += 3
        attributes.dodge += 0.02
        attributes.accuracy += 0.03
        break
      case 'demon':
        attributes.attack += 8
        attributes.defense += 1
        attributes.critRate += 0.05
        attributes.maxHp -= 10
        attributes.currentHp -= 10
        break
    }

    // 灵根属性加成
    for (const root of spiritRoots) {
      switch (root) {
        case 'gold': attributes.attack += 3; break
        case 'wood': attributes.maxHp += 20; attributes.currentHp += 20; break
        case 'water': attributes.defense += 3; break
        case 'fire': attributes.critRate += 0.02; break
        case 'earth': attributes.defense += 2; attributes.maxHp += 10; attributes.currentHp += 10; break
        case 'wind': attributes.speed += 3; attributes.dodge += 0.03; break
        case 'thunder': attributes.attack += 2; attributes.critRate += 0.03; break
      }
    }

    const newPlayer: Player = {
      name,
      gender,
      cultivationType,
      spiritRoots,
      attributes,
      equipment: { weapon: null, armor: null, accessory: null },
      skills: [],
      inventory: [],
      unlockedSkills: [],
      defeatedUniqueItems: [],
    }

    // 赋予初始技能
    const initialSkill = getInitialSkill(cultivationType)
    newPlayer.skills.push({ skillId: initialSkill.id, level: 1, isActive: true })
    newPlayer.unlockedSkills.push(initialSkill.id)

    player.value = newPlayer
    saveCurrentGame()
    return newPlayer
  }

  /** 重置灵根 */
  function resetSpiritRoots(): void {
    if (!player.value) return

    // 重新选择修炼方向时保留（也可以让玩家重选）
    const newRoots = awakenSpiritRoots()
    player.value.spiritRoots = newRoots

    // 修为境界清零
    player.value.attributes.cultivation = 0
    player.value.attributes.currentRealm = 'mortal'
    // 重置属性到初始值
    Object.assign(player.value.attributes, INITIAL_ATTRIBUTES)
    // 重新计算灵根加成
    for (const root of newRoots) {
      switch (root) {
        case 'gold': player.value.attributes.attack += 3; break
        case 'wood': player.value.attributes.maxHp += 20; player.value.attributes.currentHp = player.value.attributes.maxHp; break
        case 'water': player.value.attributes.defense += 3; break
        case 'fire': player.value.attributes.critRate += 0.02; break
        case 'earth': player.value.attributes.defense += 2; player.value.attributes.maxHp += 10; player.value.attributes.currentHp = player.value.attributes.maxHp; break
        case 'wind': player.value.attributes.speed += 3; player.value.attributes.dodge += 0.03; break
        case 'thunder': player.value.attributes.attack += 2; player.value.attributes.critRate += 0.03; break
      }
    }

    saveCurrentGame()
  }

  /** 全局重置 */
  function globalReset(): void {
    stopCultivation()
    player.value = null
    deleteSave()
  }

  // ==================== 修炼 ====================

  /** 开始自动修炼（每秒增加修为） */
  function startCultivation(): void {
    if (cultivationInterval.value) return
    let lastSaveTime = Date.now()
    cultivationInterval.value = setInterval(() => {
      if (!player.value) return
      const p = player.value

      const speed = calcCultivationSpeed(p, externalCultivationBoost.value)
      p.attributes.cultivation += speed

      // HP自动恢复 (1% maxHp per second)
      if (p.attributes.currentHp > 0 && p.attributes.currentHp < p.attributes.maxHp) {
        p.attributes.currentHp = Math.min(
          p.attributes.maxHp,
          Math.ceil(p.attributes.currentHp + p.attributes.maxHp * 0.01)
        )
      }

      // 复活倒计时检查
      if (p.attributes.resurrectionTime && p.attributes.resurrectionTime > 0) {
        if (Date.now() >= p.attributes.resurrectionTime) {
          p.attributes.resurrectionTime = 0
          p.attributes.currentHp = Math.floor(p.attributes.maxHp * 0.5)
        }
      }

      // 临时增益计时
      if (p.attributes.activeBuffs && p.attributes.activeBuffs.length > 0) {
        p.attributes.activeBuffs = p.attributes.activeBuffs
          .map(b => ({ ...b, remainingSeconds: b.remainingSeconds - 1 }))
          .filter(b => b.remainingSeconds > 0)
      }

      // 节流保存：每30秒保存一次
      const now = Date.now()
      if (now - lastSaveTime >= 30000) {
        saveCurrentGame()
        lastSaveTime = now
      }
    }, 1000)
  }

  /** 设置外部修炼加成（由GameLayout调用） */
  function setCultivationBoost(boost: number): void {
    externalCultivationBoost.value = boost
  }

  /** 停止自动修炼 */
  function stopCultivation(): void {
    if (cultivationInterval.value) {
      clearInterval(cultivationInterval.value)
      cultivationInterval.value = null
    }
  }

  /** 尝试突破境界 */
  function breakthrough(): ReturnType<typeof attemptBreakthrough> {
    if (!player.value) throw new Error('玩家数据不存在')
    const result = attemptBreakthrough(player.value)
    saveCurrentGame()
    return result
  }

  /** 获取修为进度 */
  function cultivationProgress() {
    if (!player.value) return { current: 0, required: 0, percent: 0 }
    return getCultivationProgress(player.value)
  }

  // ==================== 属性相关 ====================

  /** 获取当前境界信息 */
  function currentRealmInfo() {
    if (!player.value) return null
    return getRealmById(player.value.attributes.currentRealm)
  }

  /** 计算总攻击力（基础+装备+技能被动加成） */
  const totalAttack = computed(() => {
    if (!player.value) return 0
    return Math.floor(getBuffedStat('attack'))
  })

  /** 计算总防御力 */
  const totalDefense = computed(() => {
    if (!player.value) return 0
    return Math.floor(getBuffedStat('defense'))
  })

  /** 获取被动技能加成 */
  function getPassiveBonuses(): { attack: number; defense: number; maxHp: number; speed: number; critRate: number; dodge: number; cultivationSpeed: number } {
    const bonuses = { attack: 0, defense: 0, maxHp: 0, speed: 0, critRate: 0, dodge: 0, cultivationSpeed: 0 }
    if (!player.value) return bonuses

    for (const ps of player.value.skills) {
      const skill = skills.find(s => s.id === ps.skillId)
      if (!skill || skill.type !== 'passive') continue

      for (const effect of skill.effects) {
        switch (effect.type) {
          case 'passive_attack': bonuses.attack += effect.value; break
          case 'passive_defense': bonuses.defense += effect.value; break
          case 'passive_hp': bonuses.maxHp += effect.value; break
          case 'passive_speed': bonuses.speed += effect.value; break
          case 'passive_crit': bonuses.critRate += effect.value; break
          case 'passive_dodge': bonuses.dodge += effect.value; break
          case 'passive_cultivation': bonuses.cultivationSpeed += effect.value; break
        }
      }
    }
    return bonuses
  }

  /** 获取某项属性的总加成 */
  function getBuffedStat(stat: string): number {
    if (!player.value) return 0
    const p = player.value
    const passives = getPassiveBonuses()
    let base = 0

    switch (stat) {
      case 'attack':
        base = p.attributes.attack
        if (p.equipment.weapon?.stats.attack) base += p.equipment.weapon.stats.attack
        if (p.equipment.accessory?.stats.attack) base += p.equipment.accessory.stats.attack
        base += passives.attack
        break
      case 'defense':
        base = p.attributes.defense
        if (p.equipment.armor?.stats.defense) base += p.equipment.armor.stats.defense
        if (p.equipment.accessory?.stats.defense) base += p.equipment.accessory.stats.defense
        base += passives.defense
        break
      case 'maxHp':
        base = p.attributes.maxHp
        base += passives.maxHp
        break
      case 'speed':
        base = p.attributes.speed
        if (p.equipment.accessory?.stats.speed) base += p.equipment.accessory.stats.speed
        base += passives.speed
        break
      case 'critRate':
        base = p.attributes.critRate
        if (p.equipment.weapon?.stats.critRate) base += p.equipment.weapon.stats.critRate
        if (p.equipment.accessory?.stats.critRate) base += p.equipment.accessory.stats.critRate
        base += passives.critRate
        break
      case 'dodge':
        base = p.attributes.dodge
        if (p.equipment.armor?.stats.dodge) base += p.equipment.armor.stats.dodge
        base += passives.dodge
        break
    }
    return base
  }

  // ==================== 存档 ====================

  function saveCurrentGame(): boolean {
    if (!player.value) return false
    return saveGame({
      version: '1.0.0',
      timestamp: Date.now(),
      player: player.value,
      gameProgress: gameProgress.value,
    })
  }

  /** 增加击杀数 */
  function incrementTotalKills(): void {
    gameProgress.value.totalKills++
  }

  /** 增加事件数 */
  function incrementTotalEvents(): void {
    gameProgress.value.totalEvents++
  }

  function loadGameData() {
    const data = loadGame()
    if (!data) return false
    player.value = data.player
    if (data.gameProgress) {
      gameProgress.value = data.gameProgress
    }
    return data
  }

  function hasExistingSave(): boolean {
    return hasSave()
  }

  return {
    player,
    isCreated,
    gameProgress,
    totalAttack,
    totalDefense,
    getPassiveBonuses,
    getBuffedStat,
    setCultivationBoost,
    incrementTotalKills,
    incrementTotalEvents,
    createPlayer,
    resetSpiritRoots,
    globalReset,
    startCultivation,
    stopCultivation,
    breakthrough,
    cultivationProgress,
    currentRealmInfo,
    saveCurrentGame,
    loadGameData,
    hasExistingSave,
  }
})

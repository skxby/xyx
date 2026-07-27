// ============================================================
// 战斗状态机管理
// ============================================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CombatUnit, CombatLog, CombatPhase, Enemy, CombatSkill, CombatBuff } from '@/types'
import { usePlayerStore } from './playerStore'
import { useInventoryStore } from './inventoryStore'
import { usePetStore } from './petStore'
import { useQuestStore } from './questStore'
import { executeAttack, tickBuffs, tickDots, calcCombatPower } from '@/utils/combat'
import { getSkillById } from '@/data/skills'
import { processEnemyDrops } from '@/utils/loot'
import { getEnemyById } from '@/data/enemies'
import { DEATH_CULTIVATION_LOSS, DEATH_REALM_DEMOTION_CHANCE, RESURRECTION_COOLDOWN } from '@/data/constants'
import { getRealmById, getPreviousRealm } from '@/data/realms'
import { rollProbability } from '@/utils/random'

export const useCombatStore = defineStore('combat', () => {
  // ==================== 状态 ====================
  const phase = ref<CombatPhase>('idle')
  const round = ref(0)
  const playerUnit = ref<CombatUnit | null>(null)
  const enemyUnit = ref<CombatUnit | null>(null)
  const enemyData = ref<Enemy | null>(null)
  const logs = ref<CombatLog[]>([])
  const selectedSkillIndex = ref(0)
  const dropItems = ref<any[]>([])
  const showDropChoice = ref(false)
  const pendingDrops = ref<any[]>([])

  const inCombat = computed(() => phase.value !== 'idle' && phase.value !== 'victory' && phase.value !== 'defeat')

  // ==================== 战斗初始化 ====================

  function initCombat(enemyId: string): void {
    const playerStore = usePlayerStore()
    const p = playerStore.player
    if (!p) return

    const enemy = getEnemyById(enemyId)
    if (!enemy) return

    // 构建玩家战斗单位
    playerUnit.value = buildPlayerUnit(p)

    // 构建敌人战斗单位
    enemyUnit.value = {
      id: enemy.id,
      name: enemy.name,
      isPlayer: false,
      attributes: {
        currentHp: enemy.stats.maxHp,
        maxHp: enemy.stats.maxHp,
        attack: enemy.stats.attack,
        defense: enemy.stats.defense,
        dodge: enemy.stats.dodge,
        accuracy: enemy.stats.accuracy,
        speed: enemy.stats.speed,
        critRate: enemy.stats.critRate,
        critResist: enemy.stats.critResist,
      },
      skills: enemy.skills.map(skillId => ({
        skillId,
        name: skillId,
        type: 'attack' as const,
        power: 0.6,
        currentCooldown: 0,
        maxCooldown: 2,
      })),
      buffs: [],
    }

    enemyData.value = enemy
    logs.value = []
    round.value = 0
    dropItems.value = []
    showDropChoice.value = false

    logs.value.push({
      round: 0,
      message: `⚔️ 战斗开始！【${p.name}】 VS 【${enemy.name}】`,
      type: 'system',
    })

    // 根据速度决定先手
    if ((playerUnit.value?.attributes.speed || 0) >= (enemyUnit.value?.attributes.speed || 0)) {
      phase.value = 'player_turn'
    } else {
      phase.value = 'enemy_turn'
    }
  }

  function buildPlayerUnit(p: any): CombatUnit {
    const playerStore = usePlayerStore()
    const petStore = usePetStore()
    const passives = playerStore.getPassiveBonuses()
    const externals = petStore.getExternalBonuses()
    // 合并临时增益
    const tempBuffs = p.attributes.activeBuffs || []
    let attackBuff = 0, defenseBuff = 0, speedBuff = 0, critBuff = 0
    for (const buff of tempBuffs) {
      switch (buff.type) {
        case 'attack': attackBuff += buff.value; break
        case 'defense': defenseBuff += buff.value; break
        case 'speed': speedBuff += buff.value; break
        case 'crit': critBuff += buff.value; break
      }
    }

    return {
      id: 'player',
      name: p.name,
      isPlayer: true,
      attributes: {
        currentHp: p.attributes.currentHp,
        maxHp: p.attributes.maxHp
          + (p.equipment.armor?.stats.maxHp || 0)
          + passives.maxHp
          + externals.maxHp,
        attack: p.attributes.attack
          + (p.equipment.weapon?.stats.attack || 0)
          + (p.equipment.accessory?.stats.attack || 0)
          + passives.attack
          + externals.attack
          + Math.floor(p.attributes.attack * attackBuff),
        defense: p.attributes.defense
          + (p.equipment.armor?.stats.defense || 0)
          + (p.equipment.accessory?.stats.defense || 0)
          + passives.defense
          + externals.defense
          + Math.floor(p.attributes.defense * defenseBuff),
        dodge: p.attributes.dodge
          + (p.equipment.armor?.stats.dodge || 0)
          + passives.dodge
          + externals.dodge,
        accuracy: p.attributes.accuracy
          + (p.equipment.weapon?.stats.accuracy || 0)
          + (p.equipment.accessory?.stats.accuracy || 0),
        speed: p.attributes.speed
          + (p.equipment.accessory?.stats.speed || 0)
          + passives.speed
          + externals.speed
          + speedBuff,
        critRate: p.attributes.critRate
          + (p.equipment.weapon?.stats.critRate || 0)
          + (p.equipment.accessory?.stats.critRate || 0)
          + passives.critRate
          + externals.critRate
          + critBuff,
        critResist: p.attributes.critResist
          + (p.equipment.armor?.stats.critResist || 0)
          + (p.equipment.accessory?.stats.critResist || 0),
      },
      skills: p.skills.filter((s: any) => s.isActive).map((s: any) => {
        const skillDef = getSkillById(s.skillId)
        return {
          skillId: s.skillId,
          name: skillDef?.name || '未知技能',
          type: skillDef?.type || 'attack',
          power: skillDef?.power || 0.5,
          currentCooldown: 0,
          maxCooldown: skillDef?.type === 'attack' ? 1 : 3,
        }
      }),
      buffs: [],
    }
  }

  // ==================== 战斗行动 ====================

  function playerAction(skillIndex: number = 0): void {
    if (phase.value !== 'player_turn' || !playerUnit.value || !enemyUnit.value) return

    const activeSkills = playerUnit.value.skills.filter(s => s.currentCooldown <= 0)
    const skill = activeSkills[skillIndex]
    const skillName = skill?.name || '普通攻击'
    const skillPower = skill?.power || 0.5

    if (skill && skill.currentCooldown <= 0) {
      skill.currentCooldown = skill.maxCooldown
    }

    const result = executeAttack(playerUnit.value, enemyUnit.value, skillPower, skillName, round.value + 1)
    logs.value.push(result.log)

    if (result.targetDefeated) {
      endCombat('victory')
      return
    }

    round.value++
    phase.value = 'enemy_turn'
  }

  function enemyAction(): void {
    if (phase.value !== 'enemy_turn' || !playerUnit.value || !enemyUnit.value) return

    // 敌人AI：如果有可用技能随机使用
    const availableSkills = enemyUnit.value.skills.filter(s => s.currentCooldown <= 0)
    const useSkill = availableSkills.length > 0 && Math.random() < 0.5
    let skillName = '普通攻击'
    let skillPower = 0.5

    if (useSkill && availableSkills.length > 0) {
      const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)]
      skillName = skill.name
      skillPower = skill.power
      skill.currentCooldown = skill.maxCooldown
    }

    const result = executeAttack(enemyUnit.value, playerUnit.value, skillPower, skillName, round.value + 1)
    logs.value.push(result.log)

    // 更新玩家实际HP
    const playerStore = usePlayerStore()
    if (playerStore.player) {
      playerStore.player.attributes.currentHp = playerUnit.value.attributes.currentHp
    }

    if (result.targetDefeated) {
      endCombat('defeat')
      return
    }

    // DOT结算
    const dotLogs = tickDots(playerUnit.value, round.value + 1)
    logs.value.push(...dotLogs)

    // Buff回合减少
    tickBuffs(playerUnit.value)
    tickBuffs(enemyUnit.value)

    round.value++
    phase.value = 'player_turn'
  }

  // ==================== 战斗结束 ====================

  function endCombat(result: 'victory' | 'defeat'): void {
    phase.value = result

    if (result === 'victory' && enemyData.value) {
      const playerStore = usePlayerStore()
      const p = playerStore.player
      if (!p) return

      // 奖励
      p.attributes.cultivation += enemyData.value.expReward
      p.attributes.spiritStones += enemyData.value.stoneReward
      playerStore.incrementTotalKills()
      try { useQuestStore().updateProgress('kill') } catch { /* quest store may not be initialized */ }

      logs.value.push({
        round: round.value + 1,
        message: `🎉 胜利！获得 ${enemyData.value.expReward} 修为 + ${enemyData.value.stoneReward} 灵石！`,
        type: 'system',
      })

      // 掉落处理
      const drops = processEnemyDrops(enemyData.value, p.defeatedUniqueItems)
      if (drops.length > 0) {
        pendingDrops.value = drops
        showDropChoice.value = true
      }

      playerStore.saveCurrentGame()
    } else if (result === 'defeat') {
      // 死亡惩罚
      const playerStore = usePlayerStore()
      if (playerStore.player) {
        const p = playerStore.player
        const cultivationLoss = Math.floor(p.attributes.cultivation * DEATH_CULTIVATION_LOSS)
        p.attributes.cultivation = Math.max(0, p.attributes.cultivation - cultivationLoss)
        p.attributes.deathCount = (p.attributes.deathCount || 0) + 1
        p.attributes.resurrectionTime = Date.now() + RESURRECTION_COOLDOWN
        p.attributes.currentHp = Math.floor(p.attributes.maxHp * 0.3)

        // 小概率境界掉落
        let demotionMsg = ''
        if (rollProbability(DEATH_REALM_DEMOTION_CHANCE)) {
          const prevRealm = getPreviousRealm(p.attributes.currentRealm)
          if (prevRealm) {
            p.attributes.currentRealm = prevRealm.id
            demotionMsg = `境界跌落至【${prevRealm.name}】！`
          }
        }

        logs.value.push({
          round: round.value + 1,
          message: `💀 战斗败亡！损失 ${cultivationLoss} 修为，${p.attributes.deathCount} 次陨落。${demotionMsg}需等待 ${RESURRECTION_COOLDOWN / 1000} 秒复活`,
          type: 'system',
        })

        playerStore.saveCurrentGame()
      }
    }
  }

  /** 处理掉落选择 */
  function handleDropChoice(accepted: boolean, itemIndex: number = 0): void {
    if (!showDropChoice.value) return

    const inventoryStore = useInventoryStore()
    if (accepted && pendingDrops.value[itemIndex]) {
      inventoryStore.addItem(pendingDrops.value[itemIndex])
      logs.value.push({
        round: round.value + 1,
        message: `📦 获得了【${pendingDrops.value[itemIndex].name}】！`,
        type: 'system',
      })
    } else {
      logs.value.push({
        round: round.value + 1,
        message: '放弃了掉落物品。',
        type: 'system',
      })
    }

    pendingDrops.value = []
    showDropChoice.value = false
  }

  /** 逃跑 */
  function flee(): void {
    if (phase.value !== 'player_turn') return
    const success = Math.random() < 0.5
    if (success) {
      logs.value.push({ round: round.value + 1, message: '🏃 你成功逃跑了！', type: 'system' })
      phase.value = 'fled'
    } else {
      logs.value.push({ round: round.value + 1, message: '逃跑失败！', type: 'system' })
      phase.value = 'enemy_turn'
    }
  }

  /** 离开战斗 */
  function leaveCombat(): void {
    phase.value = 'idle'
    playerUnit.value = null
    enemyUnit.value = null
    enemyData.value = null
    logs.value = []
    round.value = 0
    dropItems.value = []
    showDropChoice.value = false
  }

  return {
    phase,
    round,
    playerUnit,
    enemyUnit,
    enemyData,
    logs,
    inCombat,
    showDropChoice,
    pendingDrops,
    initCombat,
    playerAction,
    enemyAction,
    flee,
    leaveCombat,
    handleDropChoice,
  }
})

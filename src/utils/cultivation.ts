// ============================================================
// 修炼/突破系统计算
// ============================================================
import type { Player, RealmLevel } from '@/types'
import { getRealmById, getNextRealm, realms } from '@/data/realms'
import { BASE_CULTIVATION_SPEED, CULTIVATION_TYPE_SPEED_BONUS } from '@/data/constants'
import { rollProbability } from './random'

/**
 * 计算修炼速度（修为/秒）
 * 受灵根类型、修炼方向、功法、丹药影响
 */
export function calcCultivationSpeed(player: Player, externalBoost: number = 0): number {
  let speed = BASE_CULTIVATION_SPEED

  // 修炼方向加成
  speed *= CULTIVATION_TYPE_SPEED_BONUS[player.cultivationType] || 1

  // 灵根加成（单灵根修炼更快）
  if (player.spiritRoots.length === 1) {
    speed *= 1.5
  } else if (player.spiritRoots.length === 2) {
    speed *= 1.2
  }

  // 悟性加成（每点悟性+2%）
  speed *= 1 + player.attributes.comprehension * 0.02

  // 根骨加成（每点根骨+1%）
  speed *= 1 + player.attributes.rootBone * 0.01

  // 道侣/宗门修炼速度加成
  speed *= 1 + externalBoost

  return Math.max(0.1, speed)
}

/**
 * 计算离线收益
 * @param player 玩家数据
 * @param offlineSeconds 离线秒数
 * @returns 获得的修为
 */
export function calcOfflineCultivation(player: Player, offlineSeconds: number): number {
  const speed = calcCultivationSpeed(player)
  // 离线效率为在线的80%
  return Math.floor(speed * offlineSeconds * 0.8)
}

/**
 * 添加修为值
 */
export function addCultivation(player: Player, amount: number): void {
  player.attributes.cultivation += amount
}

/**
 * 计算突破成功率
 * 基础成功率 + 悟性加成 + 气运加成 - 境界难度
 */
export function calcBreakthroughRate(player: Player): number {
  const realm = getRealmById(player.attributes.currentRealm)
  if (!realm) return 0

  let rate = realm.breakthroughBaseRate

  // 悟性加成（每点+2%）
  rate += player.attributes.comprehension * 0.02

  // 气运加成（每点+1.5%）
  rate += player.attributes.fortune * 0.015

  // 道心加成（每点+1%）
  rate += player.attributes.daoHeart * 0.01

  return Math.min(0.95, Math.max(0.01, rate))
}

/**
 * 突破结果
 */
export interface BreakthroughResult {
  success: boolean
  tribulationTriggered: boolean
  tribulationSurvived: boolean
  newRealm: RealmLevel
  message: string
}

/**
 * 尝试突破境界
 */
export function attemptBreakthrough(player: Player): BreakthroughResult {
  const currentRealm = getRealmById(player.attributes.currentRealm)
  const nextRealm = getNextRealm(player.attributes.currentRealm)

  if (!currentRealm || !nextRealm) {
    return {
      success: false,
      tribulationTriggered: false,
      tribulationSurvived: false,
      newRealm: player.attributes.currentRealm,
      message: '已达到最高境界，无法继续突破',
    }
  }

  // 检查修为是否达标
  if (player.attributes.cultivation < currentRealm.requiredCultivation) {
    return {
      success: false,
      tribulationTriggered: false,
      tribulationSurvived: false,
      newRealm: player.attributes.currentRealm,
      message: '修为不足，无法突破',
    }
  }

  // 判定突破成功
  const baseRate = calcBreakthroughRate(player)
  const breakthroughBonus = player.attributes.breakthroughBonus || 0
  const rate = Math.min(0.95, baseRate + breakthroughBonus)
  const success = rollProbability(rate)

  // 消耗破境丹加成
  if (breakthroughBonus > 0) {
    player.attributes.breakthroughBonus = 0
  }

  if (!success) {
    // 失败扣除部分修为
    const lossAmount = Math.floor(player.attributes.cultivation * 0.2)
    player.attributes.cultivation = Math.max(0, player.attributes.cultivation - lossAmount)
    return {
      success: false,
      tribulationTriggered: false,
      tribulationSurvived: false,
      newRealm: player.attributes.currentRealm,
      message: `突破失败！修为反噬，损失 ${lossAmount} 修为。继续努力修炼吧！`,
    }
  }

  // 天劫判定
  const tribulationTriggered = rollProbability(nextRealm.tribulationRate)
  let tribulationSurvived = true

  if (tribulationTriggered) {
    // 天劫存活率受道心、根骨影响
    const surviveRate = 0.5 + player.attributes.daoHeart * 0.03 + player.attributes.rootBone * 0.02
    tribulationSurvived = rollProbability(Math.min(0.9, surviveRate))
  }

  if (tribulationTriggered && !tribulationSurvived) {
    // 天劫失败，损失大量修为但保留进度
    const lossAmount = Math.floor(player.attributes.cultivation * 0.5)
    player.attributes.cultivation = Math.max(0, player.attributes.cultivation - lossAmount)
    return {
      success: false,
      tribulationTriggered: true,
      tribulationSurvived: false,
      newRealm: player.attributes.currentRealm,
      message: `天劫降临！未能扛过天劫，修为大损，损失 ${lossAmount} 修为！`,
    }
  }

  // 突破成功
  player.attributes.currentRealm = nextRealm.id
  player.attributes.cultivation = 0

  // 应用突破属性加成
  const bonus = nextRealm.statBonus
  if (bonus.attack) player.attributes.attack += bonus.attack
  if (bonus.defense) player.attributes.defense += bonus.defense
  if (bonus.dodge) player.attributes.dodge += bonus.dodge
  if (bonus.accuracy) player.attributes.accuracy += bonus.accuracy

  // 突破后生命值回满
  player.attributes.currentHp = player.attributes.maxHp
  // 突破后最大生命值提升
  player.attributes.maxHp += Math.floor(nextRealm.level * 50)
  player.attributes.currentHp = player.attributes.maxHp

  let msg = `突破成功！晋升【${nextRealm.name}】！`
  if (tribulationTriggered) {
    msg += '历经天劫洗礼，实力大增！'
  }

  return {
    success: true,
    tribulationTriggered,
    tribulationSurvived: true,
    newRealm: nextRealm.id,
    message: msg,
  }
}

/**
 * 获取当前境界的修为进度百分比
 */
export function getCultivationProgress(player: Player): { current: number; required: number; percent: number } {
  const realm = getRealmById(player.attributes.currentRealm)
  if (!realm) return { current: 0, required: 0, percent: 0 }

  const current = player.attributes.cultivation
  // 使用下一个境界的所需修为（或者当前境界大圆满）
  const nextRealm = getNextRealm(player.attributes.currentRealm)
  const required = nextRealm?.requiredCultivation ?? realm.requiredCultivation * 10

  return {
    current,
    required,
    percent: Math.min(100, Math.floor((current / required) * 100)),
  }
}

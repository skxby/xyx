// ============================================================
// 存档管理 - localStorage持久化
// ============================================================
import type { SaveData } from '@/types'
import { SAVE_KEY, GAME_VERSION } from '@/data/constants'

/**
 * 保存游戏
 */
export function saveGame(data: SaveData): boolean {
  try {
    const json = JSON.stringify(data)
    localStorage.setItem(SAVE_KEY, json)
    return true
  } catch (e) {
    console.error('保存失败:', e)
    return false
  }
}

/**
 * 加载游戏（含版本迁移）
 */
export function loadGame(): SaveData | null {
  try {
    const json = localStorage.getItem(SAVE_KEY)
    if (!json) return null
    const data = JSON.parse(json) as SaveData
    if (!data.version) return null
    return migrateSave(data)
  } catch (e) {
    console.error('加载存档失败:', e)
    return null
  }
}

/**
 * 存档版本迁移
 */
export function migrateSave(data: SaveData): SaveData {
  // 补充缺失的字段（v1.0.0 → v1.1.0）
  if (typeof data.player.attributes.breakthroughBonus === 'undefined') {
    data.player.attributes.breakthroughBonus = 0
  }
  if (!data.player.attributes.activeBuffs) {
    data.player.attributes.activeBuffs = []
  }
  if (!data.gameProgress) {
    (data as any).gameProgress = {
      totalKills: 0,
      totalEvents: 0,
      dungeonsCleared: [],
      defeatedUniqueItems: [],
      achievements: [],
      completedChapters: [],
    }
  }
  return data
}

/**
 * 删除存档
 */
export function deleteSave(): boolean {
  try {
    localStorage.removeItem(SAVE_KEY)
    return true
  } catch {
    return false
  }
}

/**
 * 检查是否有存档
 */
export function hasSave(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null
}

/**
 * 导出存档为JSON字符串（用于备份）
 */
export function exportSave(): string | null {
  const data = loadGame()
  if (!data) return null
  return JSON.stringify(data, null, 2)
}

/**
 * 导入存档
 */
export function importSave(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr) as SaveData
    if (!data.version || !data.player) return false
    saveGame(data)
    return true
  } catch {
    return false
  }
}

/**
 * 创建新存档数据
 */
export function createNewSave(playerData: SaveData['player']): SaveData {
  return {
    version: GAME_VERSION,
    timestamp: Date.now(),
    player: playerData,
    gameProgress: {
      totalKills: 0,
      totalEvents: 0,
      dungeonsCleared: [],
      defeatedUniqueItems: [],
      achievements: [],
      completedChapters: [],
    },
  }
}

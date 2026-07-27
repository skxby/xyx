// ============================================================
// 背包/装备/道具 状态管理
// ============================================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { InventoryItem, GameItem, Equipment, Consumable, SkillBook, PlayerSkill, ItemType } from '@/types'
import { usePlayerStore } from './playerStore'
import { createInventoryItem, getItemById } from '@/utils/loot'
import { getSkillById } from '@/data/skills'

export const useInventoryStore = defineStore('inventory', () => {
  // ==================== 状态 ====================
  const selectedCategory = ref<ItemType | 'all'>('all')

  // ==================== 计算属性 ====================

  function getPlayer() {
    return usePlayerStore().player
  }

  const inventory = computed(() => getPlayer()?.inventory || [])

  /** 已装备的物品 */
  const equippedItems = computed(() => {
    const p = getPlayer()
    if (!p) return []
    const items: Equipment[] = []
    if (p.equipment.weapon) items.push(p.equipment.weapon)
    if (p.equipment.armor) items.push(p.equipment.armor)
    if (p.equipment.accessory) items.push(p.equipment.accessory)
    return items
  })

  /** 按分类筛选 */
  const filteredInventory = computed(() => {
    const inv = inventory.value
    return inv.filter(entry => {
      const item = getItemById(entry.itemId)
      if (!item) return false
      if (selectedCategory.value === 'all') return true
      return item.type === selectedCategory.value
    })
  })

  // ==================== 背包操作 ====================

  /** 添加物品到背包 */
  function addItem(item: GameItem, quantity: number = 1): void {
    const p = getPlayer()
    if (!p) return

    // 唯一物品检查
    if (item.rarity === 'unique' && p.defeatedUniqueItems.includes(item.id)) {
      return // 已获得，不能再获得
    }

    if (item.stackable) {
      const existing = p.inventory.find(i => i.itemId === item.id)
      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, item.maxStack)
        return
      }
    }

    p.inventory.push(createInventoryItem(item))
    usePlayerStore().saveCurrentGame()
  }

  /** 移除物品 */
  function removeItem(uid: string, quantity: number = 1): void {
    const p = getPlayer()
    if (!p) return

    const idx = p.inventory.findIndex(i => i.uid === uid)
    if (idx === -1) return

    const entry = p.inventory[idx]
    if (entry.quantity > quantity) {
      entry.quantity -= quantity
    } else {
      p.inventory.splice(idx, 1)
    }
    usePlayerStore().saveCurrentGame()
  }

  /** 穿戴装备 */
  function equipItem(uid: string): boolean {
    const p = getPlayer()
    if (!p) return false

    const idx = p.inventory.findIndex(i => i.uid === uid)
    if (idx === -1) return false

    const entry = p.inventory[idx]
    const item = getItemById(entry.itemId)
    if (!item || (item.type !== 'weapon' && item.type !== 'armor' && item.type !== 'accessory')) {
      return false
    }

    const equipment = item as Equipment

    // 卸下原有装备
    const slot = equipment.type as 'weapon' | 'armor' | 'accessory'
    const currentEquipped = p.equipment[slot]
    if (currentEquipped) {
      // 把当前装备放回背包
      const existingInInv = p.inventory.find(i => i.itemId === currentEquipped.id && !i.isEquipped)
      if (existingInInv) {
        existingInInv.quantity++
      } else {
        p.inventory.push(createInventoryItem(currentEquipped))
      }
    }

    // 穿戴新装备
    p.equipment[slot] = equipment
    entry.isEquipped = true
    p.inventory.splice(idx, 1)

    usePlayerStore().saveCurrentGame()
    return true
  }

  /** 卸下装备 */
  function unequipItem(slot: 'weapon' | 'armor' | 'accessory'): boolean {
    const p = getPlayer()
    if (!p) return false

    const equipment = p.equipment[slot]
    if (!equipment) return false

    // 放回背包
    p.inventory.push(createInventoryItem(equipment))
    p.equipment[slot] = null

    usePlayerStore().saveCurrentGame()
    return true
  }

  /** 使用消耗品 */
  function useConsumable(uid: string): string {
    const p = getPlayer()
    if (!p) return '玩家数据不存在'

    const idx = p.inventory.findIndex(i => i.uid === uid)
    if (idx === -1) return '物品不存在'

    const entry = p.inventory[idx]
    const item = getItemById(entry.itemId)
    if (!item || item.type !== 'consumable') return '该物品不可使用'

    const consumable = item as Consumable
    let msg = `使用了【${consumable.name}】：`

    for (const effect of consumable.effects) {
      switch (effect.type) {
        case 'heal_hp':
          p.attributes.currentHp = Math.min(
            p.attributes.maxHp,
            p.attributes.currentHp + effect.value
          )
          msg += `恢复 ${effect.value} 生命值；`
          break
        case 'cultivation_boost':
          p.attributes.cultivation += effect.value
          msg += `获得 ${effect.value} 修为；`
          break
        case 'breakthrough_boost':
          p.attributes.breakthroughBonus = (p.attributes.breakthroughBonus || 0) + effect.value
          msg += `突破成功率提升 ${Math.round(effect.value * 100)}%（下次突破消耗）；`
          break
        case 'permanent_stat':
          // 永久提升属性（神元丹等）
          p.attributes.rootBone += effect.value
          msg += `根骨永久提升 ${effect.value} 点；`
          break
        case 'buff_attack':
        case 'buff_defense':
        case 'buff_speed':
        case 'buff_crit': {
          // 临时增益效果：存入 activeBuffs
          const buffTypeMap: Record<string, string> = {
            buff_attack: 'attack',
            buff_defense: 'defense',
            buff_speed: 'speed',
            buff_crit: 'crit',
          }
          const buffType = buffTypeMap[effect.type] || 'attack'
          if (!p.attributes.activeBuffs) p.attributes.activeBuffs = []
          p.attributes.activeBuffs.push({
            id: `${consumable.id}_${Date.now()}`,
            name: consumable.name,
            type: buffType as any,
            value: effect.value,
            remainingSeconds: effect.duration || 30,
          })
          msg += `${consumable.name}效果持续 ${effect.duration || 30} 秒；`
          break
        }
      }
    }

    // 消耗物品
    removeItem(uid, 1)
    usePlayerStore().saveCurrentGame()
    return msg
  }

  /** 学习技能书 */
  function learnSkill(uid: string): string {
    const p = getPlayer()
    if (!p) return '玩家数据不存在'

    const idx = p.inventory.findIndex(i => i.uid === uid)
    if (idx === -1) return '物品不存在'

    const entry = p.inventory[idx]
    const item = getItemById(entry.itemId)
    if (!item || item.type !== 'skill_book') return '该物品不是技能书'

    const skillBook = item as SkillBook
    const skill = getSkillById(skillBook.skillId)
    if (!skill) return '技能不存在'

    // 检查道修方向
    if (skill.cultivationType !== 'all' && skill.cultivationType !== p.cultivationType) {
      return `你的修炼方向（${p.cultivationType}）无法学习此技能`
    }

    // 检查是否已学习
    if (p.unlockedSkills.includes(skill.id)) {
      return '你已经学会了该技能'
    }

    // 学习技能
    p.skills.push({ skillId: skill.id, level: 1, isActive: skill.type !== 'passive' })
    p.unlockedSkills.push(skill.id)

    // 被动技能的被动效果
    if (skill.type === 'passive') {
      // 效果在属性计算时处理
    }

    // 消耗技能书
    p.inventory.splice(idx, 1)
    usePlayerStore().saveCurrentGame()
    return `成功学会【${skill.name}】！`
  }

  return {
    selectedCategory,
    inventory,
    equippedItems,
    filteredInventory,
    addItem,
    removeItem,
    equipItem,
    unequipItem,
    useConsumable,
    learnSkill,
  }
})

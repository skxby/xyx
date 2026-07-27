// ============================================================
// 灵兽/道侣/宗门 状态管理
// ============================================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { spiritPets, companions, sects, type SpiritPet, type Companion, type Sect } from '@/data/petsCompanions'
import { usePlayerStore } from './playerStore'

export const usePetStore = defineStore('pet', () => {
  // 灵兽
  const ownedPets = ref<{ petId: string; level: number; equipped: boolean }[]>([])
  // 道侣
  const metCompanions = ref<string[]>([])
  const activeCompanionId = ref<string | null>(null)
  // 宗门
  const joinedSectId = ref<string | null>(null)

  /** 获取灵兽 */
  function acquirePet(petId: string): string {
    const pet = spiritPets.find(p => p.id === petId)
    if (!pet) return '灵兽不存在'

    if (ownedPets.value.find(p => p.petId === petId)) {
      return '已经拥有该灵兽'
    }

    ownedPets.value.push({ petId, level: 1, equipped: false })
    return `获得了灵兽【${pet.name}】！`
  }

  /** 装备灵兽 */
  function equipPet(petId: string): void {
    ownedPets.value.forEach(p => { p.equipped = p.petId === petId })
  }

  /** 卸下灵兽 */
  function unequipPet(): void {
    ownedPets.value.forEach(p => { p.equipped = false })
  }

  /** 灵兽进化 */
  function evolvePet(petId: string): string {
    const entry = ownedPets.value.find(p => p.petId === petId)
    if (!entry) return '灵兽不存在'

    const pet = spiritPets.find(p => p.id === petId)
    if (!pet) return '灵兽数据不存在'
    if (entry.level >= pet.maxLevel) return '已达到最大等级'

    const playerStore = usePlayerStore()
    const cost = pet.evolveCost * entry.level
    if ((playerStore.player?.attributes.spiritStones || 0) < cost) {
      return `灵石不足！需要 ${cost} 灵石`
    }

    playerStore.player!.attributes.spiritStones -= cost
    entry.level++
    playerStore.saveCurrentGame()
    return `【${pet.name}】进化到 Lv.${entry.level}！`
  }

  /** 当前装备灵兽的加成 */
  const activePetBonus = computed(() => {
    const equipped = ownedPets.value.find(p => p.equipped)
    if (!equipped) return []
    const pet = spiritPets.find(p => p.id === equipped.petId)
    if (!pet) return []
    return pet.statBonus.map(b => ({ ...b, value: b.value * equipped.level }))
  })

  /** 结识道侣 */
  function meetCompanion(companionId: string): string {
    if (metCompanions.value.includes(companionId)) return '已经结识该道侣'
    const comp = companions.find(c => c.id === companionId)
    if (!comp) return '道侣不存在'
    metCompanions.value.push(companionId)
    activeCompanionId.value = companionId
    return `结识了道侣【${comp.name}】！`
  }

  /** 当前道侣 */
  const activeCompanion = computed(() => {
    if (!activeCompanionId.value) return null
    return companions.find(c => c.id === activeCompanionId.value) || null
  })

  /** 加入宗门 */
  function joinSect(sectId: string): string {
    const sect = sects.find(s => s.id === sectId)
    if (!sect) return '宗门不存在'

    const playerStore = usePlayerStore()
    const p = playerStore.player
    if (!p) return ''

    // 检查专属宗门限制
    if (sectId === 'sect_sword' && p.cultivationType !== 'sword') return '天剑宗只收剑修弟子'
    if (sectId === 'sect_spirit' && p.cultivationType !== 'spirit') return '玄灵宗只收灵修弟子'
    if (sectId === 'sect_demon' && p.cultivationType !== 'demon') return '万魔殿只收邪修弟子'

    joinedSectId.value = sectId
    playerStore.saveCurrentGame()
    return `成功加入【${sect.name}】！`
  }

  /** 离开宗门 */
  function leaveSect(): void {
    joinedSectId.value = null
  }

  /** 当前宗门 */
  const currentSect = computed(() => {
    if (!joinedSectId.value) return null
    return sects.find(s => s.id === joinedSectId.value) || null
  })

  /** 获取所有外部加成（灵兽+道侣+宗门） */
  function getExternalBonuses(): {
    attack: number; defense: number; maxHp: number; speed: number
    critRate: number; dodge: number; cultivationSpeed: number
  } {
    const bonuses = { attack: 0, defense: 0, maxHp: 0, speed: 0, critRate: 0, dodge: 0, cultivationSpeed: 0 }

    // 灵兽加成
    for (const b of activePetBonus.value) {
      switch (b.type) {
        case 'attack': bonuses.attack += b.value; break
        case 'defense': bonuses.defense += b.value; break
        case 'maxHp': bonuses.maxHp += b.value; break
        case 'speed': bonuses.speed += b.value; break
        case 'critRate': bonuses.critRate += b.value; break
        case 'dodge': bonuses.dodge += b.value; break
      }
    }

    // 道侣加成
    if (activeCompanion.value) {
      const comp = activeCompanion.value
      for (const b of comp.statBonus) {
        switch (b.type) {
          case 'attack': bonuses.attack += b.value; break
          case 'defense': bonuses.defense += b.value; break
          case 'maxHp': bonuses.maxHp += b.value; break
          case 'speed': bonuses.speed += b.value; break
          case 'critRate': bonuses.critRate += b.value; break
          case 'dodge': bonuses.dodge += b.value; break
        }
      }
      bonuses.cultivationSpeed += activeCompanion.value.cultivationBoost || 0
    }

    // 宗门加成
    if (currentSect.value) {
      const sb = currentSect.value.statBonuses
      if (sb.attack) bonuses.attack += sb.attack
      if (sb.defense) bonuses.defense += sb.defense
      if (sb.critRate) bonuses.critRate += sb.critRate
      if (sb.cultivationSpeed) bonuses.cultivationSpeed += sb.cultivationSpeed
      if (sb.speed) bonuses.speed += sb.speed
      if (sb.maxHp) bonuses.maxHp += sb.maxHp
    }

    return bonuses
  }

  /** 获取修炼速度总加成 */
  const totalCultivationBoost = computed(() => {
    let boost = 0
    if (activeCompanion.value) {
      boost += activeCompanion.value.cultivationBoost || 0
    }
    if (currentSect.value) {
      boost += currentSect.value.statBonuses.cultivationSpeed || 0
    }
    return boost
  })

  return {
    ownedPets,
    metCompanions,
    activeCompanionId,
    joinedSectId,
    acquirePet,
    equipPet,
    unequipPet,
    evolvePet,
    activePetBonus,
    meetCompanion,
    activeCompanion,
    joinSect,
    leaveSect,
    currentSect,
    getExternalBonuses,
    totalCultivationBoost,
  }
})

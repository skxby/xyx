// ============================================================
// 物品/装备/道具/材料数据配置
// ============================================================
import type { GameItem } from '@/types'

export const items: GameItem[] = [
  // ==================== 武器 ====================
  { id: 'sword_iron', name: '铁剑', type: 'weapon', rarity: 'white', level: 1, description: '凡铁锻造的普通长剑', price: 10, stackable: false, maxStack: 1, stats: { attack: 3 } },
  { id: 'sword_steel', name: '精钢剑', type: 'weapon', rarity: 'green', level: 3, description: '百炼精钢所铸，锋利无比', price: 50, stackable: false, maxStack: 1, stats: { attack: 8 } },
  { id: 'sword_ice', name: '寒冰剑', type: 'weapon', rarity: 'blue', level: 5, description: '以千年寒铁铸成，附带冰霜之力', price: 200, stackable: false, maxStack: 1, stats: { attack: 18, critRate: 0.03 } },
  { id: 'sword_thunder', name: '紫电神剑', type: 'weapon', rarity: 'purple', level: 8, description: '蕴含雷霆之力的神剑，一剑出百邪辟易', price: 800, stackable: false, maxStack: 1, stats: { attack: 40, critRate: 0.06, speed: 5 } },
  { id: 'sword_immortal', name: '诛仙剑', type: 'weapon', rarity: 'gold', level: 12, description: '传说中的仙剑，可斩仙灭魔', price: 5000, stackable: false, maxStack: 1, stats: { attack: 90, critRate: 0.10, accuracy: 0.05 } },
  { id: 'sword_chaos', name: '混沌开天剑', type: 'weapon', rarity: 'unique', level: 15, description: '开天辟地时诞生的第一把剑，蕴含混沌之力。全游戏唯一', price: 99999, stackable: false, maxStack: 1, stats: { attack: 200, critRate: 0.15, accuracy: 0.10, speed: 10 } },

  // ==================== 防具 ====================
  { id: 'armor_cloth', name: '布衣', type: 'armor', rarity: 'white', level: 1, description: '粗布缝制的衣物', price: 5, stackable: false, maxStack: 1, stats: { defense: 2 } },
  { id: 'armor_leather', name: '皮甲', type: 'armor', rarity: 'green', level: 3, description: '妖兽皮鞣制的护甲', price: 40, stackable: false, maxStack: 1, stats: { defense: 7 } },
  { id: 'armor_scale', name: '鳞甲战衣', type: 'armor', rarity: 'blue', level: 5, description: '以龙鳞打造的坚韧护甲', price: 180, stackable: false, maxStack: 1, stats: { defense: 15, dodge: 0.02 } },
  { id: 'armor_spirit', name: '灵光法袍', type: 'armor', rarity: 'purple', level: 8, description: '以灵丝织就，自带护体灵光', price: 700, stackable: false, maxStack: 1, stats: { defense: 35, dodge: 0.04, critResist: 0.03 } },
  { id: 'armor_heaven', name: '天罡战甲', type: 'armor', rarity: 'gold', level: 12, description: '天庭战将的制式神甲', price: 4500, stackable: false, maxStack: 1, stats: { defense: 80, dodge: 0.06, critResist: 0.06 } },
  { id: 'armor_universe', name: '乾坤无极甲', type: 'armor', rarity: 'unique', level: 15, description: '以乾坤之力凝聚的无上神甲。全游戏唯一', price: 99999, stackable: false, maxStack: 1, stats: { defense: 180, dodge: 0.10, critResist: 0.10 } },

  // ==================== 饰品 ====================
  { id: 'acc_ring_jade', name: '玉指环', type: 'accessory', rarity: 'white', level: 1, description: '普通玉石打磨的指环', price: 8, stackable: false, maxStack: 1, stats: { speed: 1 } },
  { id: 'acc_ring_blood', name: '血玉戒指', type: 'accessory', rarity: 'green', level: 3, description: '以妖兽精血浸润的戒指', price: 45, stackable: false, maxStack: 1, stats: { attack: 3, speed: 2 } },
  { id: 'acc_amulet_soul', name: '魂玉护符', type: 'accessory', rarity: 'blue', level: 5, description: '可护住心魂的玉符', price: 190, stackable: false, maxStack: 1, stats: { defense: 5, critResist: 0.04 } },
  { id: 'acc_crown_phoenix', name: '凤凰冠', type: 'accessory', rarity: 'purple', level: 8, description: '以凤凰羽翎编织的发冠', price: 750, stackable: false, maxStack: 1, stats: { attack: 15, critRate: 0.05, speed: 5 } },
  { id: 'acc_orb_dragon', name: '龙珠', type: 'accessory', rarity: 'gold', level: 12, description: '真龙陨落后留下的龙珠', price: 4800, stackable: false, maxStack: 1, stats: { attack: 25, defense: 15, critRate: 0.06, accuracy: 0.04 } },
  { id: 'acc_star', name: '星辰之心', type: 'accessory', rarity: 'unique', level: 15, description: '一枚恒星坍缩凝聚的精华。全游戏唯一', price: 99999, stackable: false, maxStack: 1, stats: { attack: 50, defense: 30, critRate: 0.08, speed: 15, accuracy: 0.05 } },

  // ==================== 消耗品 ====================
  { id: 'pill_heal_small', name: '小还丹', type: 'consumable', rarity: 'white', description: '恢复少量生命值', price: 5, stackable: true, maxStack: 99, effects: [{ type: 'heal_hp', value: 30 }] },
  { id: 'pill_heal_medium', name: '大还丹', type: 'consumable', rarity: 'green', description: '恢复中量生命值', price: 20, stackable: true, maxStack: 99, effects: [{ type: 'heal_hp', value: 80 }] },
  { id: 'pill_heal_large', name: '九转还魂丹', type: 'consumable', rarity: 'blue', description: '恢复大量生命值', price: 80, stackable: true, maxStack: 99, effects: [{ type: 'heal_hp', value: 200 }] },
  { id: 'pill_heal_immortal', name: '仙灵续命丹', type: 'consumable', rarity: 'purple', description: '恢复全部生命值', price: 300, stackable: true, maxStack: 50, effects: [{ type: 'heal_hp', value: 9999 }] },
  { id: 'pill_cultivation', name: '聚灵丹', type: 'consumable', rarity: 'green', description: '服用后获得100修为', price: 30, stackable: true, maxStack: 99, effects: [{ type: 'cultivation_boost', value: 100 }] },
  { id: 'pill_breakthrough', name: '破境丹', type: 'consumable', rarity: 'purple', description: '提升突破成功率15%（下次突破消耗）', price: 500, stackable: true, maxStack: 10, effects: [{ type: 'breakthrough_boost', value: 0.15 }] },
  { id: 'pill_divine', name: '神元丹', type: 'consumable', rarity: 'gold', description: '永久提升根骨+2', price: 2000, stackable: true, maxStack: 5, effects: [{ type: 'permanent_stat', value: 2 }] },

  // ==================== 材料 ====================
  { id: 'mat_herb', name: '灵草', type: 'material', rarity: 'white', description: '常见的基础炼丹材料', price: 2, stackable: true, maxStack: 999, materialType: 'alchemy', tier: 1 },
  { id: 'mat_ore_iron', name: '玄铁矿石', type: 'material', rarity: 'white', description: '基础炼器材料', price: 3, stackable: true, maxStack: 999, materialType: 'forging', tier: 1 },
  { id: 'mat_herb_rare', name: '千年灵芝', type: 'material', rarity: 'green', description: '稀有炼丹材料', price: 25, stackable: true, maxStack: 99, materialType: 'alchemy', tier: 2 },
  { id: 'mat_ore_spirit', name: '灵石矿', type: 'material', rarity: 'green', description: '蕴含灵气的矿石', price: 30, stackable: true, maxStack: 99, materialType: 'forging', tier: 2 },
  { id: 'mat_jade_fire', name: '火灵玉', type: 'material', rarity: 'blue', description: '蕴含火灵力的宝玉', price: 100, stackable: true, maxStack: 99, materialType: 'formation', tier: 3 },
  { id: 'mat_dragon_blood', name: '龙血草', type: 'material', rarity: 'purple', description: '以龙血浇灌生长的神草', price: 500, stackable: true, maxStack: 50, materialType: 'alchemy', tier: 4 },
  { id: 'mat_phoenix_feather', name: '凤凰翎', type: 'material', rarity: 'gold', description: '真正的凤凰尾翎', price: 3000, stackable: true, maxStack: 10, materialType: 'forging', tier: 5 },

  // ==================== 技能书 ====================
  { id: 'book_sword_advanced', name: '万剑归宗秘籍', type: 'skill_book', rarity: 'purple', description: '记载着剑修绝学的秘籍', price: 1000, stackable: false, maxStack: 1, skillId: 'sword_advanced' },
  { id: 'book_spirit_advanced', name: '五雷正法秘籍', type: 'skill_book', rarity: 'purple', description: '记载着灵修绝学的秘籍', price: 1000, stackable: false, maxStack: 1, skillId: 'spirit_advanced' },
  { id: 'book_demon_advanced', name: '血煞大法秘籍', type: 'skill_book', rarity: 'purple', description: '记载着邪修绝学的秘籍', price: 1000, stackable: false, maxStack: 1, skillId: 'demon_advanced' },
  { id: 'book_sword_defense', name: '剑罡护体秘籍', type: 'skill_book', rarity: 'green', description: '记载防御剑诀的秘籍', price: 200, stackable: false, maxStack: 1, skillId: 'sword_defense' },
  { id: 'book_spirit_heal', name: '回春术秘籍', type: 'skill_book', rarity: 'green', description: '记载疗伤法术的秘籍', price: 200, stackable: false, maxStack: 1, skillId: 'spirit_heal' },
  { id: 'book_demon_lifesteal', name: '嗜血术秘籍', type: 'skill_book', rarity: 'green', description: '记载吸血秘法的秘籍', price: 200, stackable: false, maxStack: 1, skillId: 'demon_lifesteal' },
  { id: 'book_passive_attack', name: '战意诀秘籍', type: 'skill_book', rarity: 'blue', description: '记载战意的秘籍', price: 400, stackable: false, maxStack: 1, skillId: 'passive_attack' },
  { id: 'book_passive_defense', name: '金刚体秘籍', type: 'skill_book', rarity: 'blue', description: '记载炼体的秘籍', price: 400, stackable: false, maxStack: 1, skillId: 'passive_defense' },
  { id: 'book_cultivation_boost', name: '吐纳心法秘籍', type: 'skill_book', rarity: 'green', description: '基础修炼法门', price: 100, stackable: false, maxStack: 1, skillId: 'cultivation_boost' },
  { id: 'book_passive_hp', name: '长生诀秘籍', type: 'skill_book', rarity: 'purple', description: '记载长生秘法的秘籍', price: 800, stackable: false, maxStack: 1, skillId: 'passive_hp' },
  { id: 'book_passive_speed', name: '疾风步秘籍', type: 'skill_book', rarity: 'green', description: '记载轻功步法的秘籍', price: 300, stackable: false, maxStack: 1, skillId: 'passive_speed' },
  { id: 'book_passive_crit', name: '破军心经秘籍', type: 'skill_book', rarity: 'purple', description: '记载杀伐之道的秘籍', price: 1200, stackable: false, maxStack: 1, skillId: 'passive_crit' },
  { id: 'book_passive_cultivation', name: '太虚吐纳术秘籍', type: 'skill_book', rarity: 'gold', description: '记载上古吐纳法的秘籍', price: 5000, stackable: false, maxStack: 1, skillId: 'passive_cultivation' },

  // ==================== 扩展物品 ====================
  // 武器
  { id: 'sword_wood', name: '桃木剑', type: 'weapon', rarity: 'white', level: 1, description: '百年桃木削成的法剑，对鬼物有奇效', price: 12, stackable: false, maxStack: 1, stats: { attack: 4, speed: 1 } },
  { id: 'sword_blood', name: '饮血刀', type: 'weapon', rarity: 'green', level: 4, description: '以敌人之血淬炼的魔刀', price: 80, stackable: false, maxStack: 1, stats: { attack: 12, critRate: 0.04 } },
  // 防具
  { id: 'armor_iron', name: '铁甲', type: 'armor', rarity: 'white', level: 1, description: '铁匠铺制式铁甲', price: 8, stackable: false, maxStack: 1, stats: { defense: 3 } },
  { id: 'armor_silk', name: '天蚕丝衣', type: 'armor', rarity: 'green', level: 4, description: '以千年天蚕丝织成，轻如无物', price: 80, stackable: false, maxStack: 1, stats: { defense: 10, dodge: 0.04 } },
  // 饰品
  { id: 'acc_belt_stone', name: '储物腰带', type: 'accessory', rarity: 'white', level: 1, description: '附带微小储物空间的腰带', price: 10, stackable: false, maxStack: 1, stats: { speed: 2 } },
  { id: 'acc_bell_wind', name: '御风铃', type: 'accessory', rarity: 'green', level: 3, description: '系在腰间的铃铛，清脆的铃声加速移动', price: 60, stackable: false, maxStack: 1, stats: { speed: 5, dodge: 0.03 } },
  // 消耗品
  { id: 'pill_speed', name: '疾风丹', type: 'consumable', rarity: 'green', description: '30秒内提升速度5点', price: 25, stackable: true, maxStack: 50, effects: [{ type: 'buff_speed', value: 5, duration: 30 }] },
  { id: 'pill_power', name: '暴血丹', type: 'consumable', rarity: 'blue', description: '30秒内提升攻击力30%', price: 100, stackable: true, maxStack: 20, effects: [{ type: 'buff_attack', value: 0.3, duration: 30 }] },
  // 材料
  { id: 'mat_crystal', name: '灵气水晶', type: 'material', rarity: 'white', description: '蕴含微量灵气的天然水晶', price: 4, stackable: true, maxStack: 999, materialType: 'alchemy', tier: 1 },
  { id: 'mat_silk_ice', name: '冰蚕丝', type: 'material', rarity: 'green', description: '极寒之地生长的冰蚕吐出的丝', price: 35, stackable: true, maxStack: 99, materialType: 'forging', tier: 2 },
  { id: 'mat_pearl_thunder', name: '雷灵珠', type: 'material', rarity: 'blue', description: '蕴含雷电之力的灵珠', price: 150, stackable: true, maxStack: 50, materialType: 'formation', tier: 3 },
  { id: 'mat_heart_lava', name: '熔岩之心', type: 'material', rarity: 'purple', description: '火山核心凝聚的赤红晶石', price: 600, stackable: true, maxStack: 30, materialType: 'forging', tier: 4 },
  // 技能书
  { id: 'book_sword_ultimate', name: '剑开天门秘籍', type: 'skill_book', rarity: 'unique', description: '剑修终极奥义', price: 50000, stackable: false, maxStack: 1, skillId: 'sword_ultimate' },
  { id: 'book_spirit_ultimate', name: '万法归元秘籍', type: 'skill_book', rarity: 'unique', description: '灵修终极奥义', price: 50000, stackable: false, maxStack: 1, skillId: 'spirit_ultimate' },
  { id: 'book_demon_ultimate', name: '魔临天下秘籍', type: 'skill_book', rarity: 'unique', description: '邪修终极奥义', price: 50000, stackable: false, maxStack: 1, skillId: 'demon_ultimate' },
]

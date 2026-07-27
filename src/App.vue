<script setup lang="ts">
// ============================================================
// 根组件 - 游戏主入口
// ============================================================
import { onMounted, onUnmounted, ref } from 'vue'
import { usePlayerStore } from './stores/playerStore'
import CharacterCreate from './components/panels/CharacterCreate.vue'
import GameLayout from './components/layout/GameLayout.vue'
import { calcOfflineCultivation } from './utils/cultivation'

const playerStore = usePlayerStore()
const offlineGains = ref(0)

onMounted(() => {
  // 尝试加载已有存档
  if (playerStore.hasExistingSave()) {
    const data = playerStore.loadGameData()
    if (data && playerStore.player) {
      // 计算离线收益
      const now = Date.now()
      if (data.timestamp && now > data.timestamp) {
        const offlineSeconds = Math.floor((now - data.timestamp) / 1000)
        if (offlineSeconds > 10) {  // Only calculate for >10 seconds offline
          const gains = calcOfflineCultivation(playerStore.player, offlineSeconds)
          if (gains > 0) {
            playerStore.player.attributes.cultivation += gains
            offlineGains.value = gains
          }
        }
      }
    }
  }
  // 如果已创建角色，开始修炼
  if (playerStore.isCreated) {
    playerStore.startCultivation()
  }
})

onUnmounted(() => {
  playerStore.stopCultivation()
  // 离开前强制保存
  playerStore.saveCurrentGame()
})
</script>

<template>
  <div class="app-container">
    <!-- 创建角色 / 游戏主界面 -->
    <CharacterCreate v-if="!playerStore.isCreated" />
    <GameLayout v-else />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(200,180,160,0.15) 0%, transparent 60%),
    radial-gradient(ellipse at 20% 80%, rgba(180,160,140,0.1) 0%, transparent 50%),
    linear-gradient(180deg, #f5f0e8 0%, #ede6db 40%, #e8dfd5 100%);
}
</style>

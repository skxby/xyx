<script setup lang="ts">
// ============================================================
// 主线故事面板
// ============================================================
import { computed } from 'vue'
import { useStoryStore } from '@/stores/storyStore'

const storyStore = useStoryStore()

const currentChapter = computed(() => {
  if (!storyStore.currentChapterId) return null
  return storyStore.storyChapters.find(c => c.id === storyStore.currentChapterId) || null
})

const currentDialogue = computed(() => {
  if (!currentChapter.value) return ''
  return currentChapter.value.dialogue[storyStore.dialogueIndex] || ''
})

const hasMoreDialogue = computed(() => {
  if (!currentChapter.value) return false
  return storyStore.dialogueIndex < currentChapter.value.dialogue.length - 1
})

function handleChapterClick() {
  const chapter = storyStore.availableChapter
  if (chapter) storyStore.startChapter(chapter)
}
</script>

<template>
  <div class="story-panel fade-in-up">
    <!-- 故事对话中 -->
    <div v-if="storyStore.showStory && currentChapter" class="story-dialogue">
      <div class="dialogue-chapter-title">{{ currentChapter.title }}</div>
      <div class="dialogue-subtitle">{{ currentChapter.subtitle }}</div>
      <div class="dialogue-card ink-panel">
        <p class="dialogue-text">{{ currentDialogue }}</p>
      </div>
      <div class="dialogue-actions">
        <button v-if="hasMoreDialogue" class="btn-primary" @click="storyStore.nextDialogue()">继续</button>
        <button v-else class="btn-gold" @click="storyStore.completeChapter()">领取奖励</button>
        <button class="btn-danger" @click="storyStore.skipStory()">跳过</button>
      </div>
    </div>

    <!-- 章节列表 -->
    <div v-else>
      <h2 class="story-title">📜 仙途纪事</h2>

      <!-- 可接取章节 -->
      <div v-if="storyStore.availableChapter" class="available-chapter ink-panel">
        <h3>🆕 新篇章</h3>
        <div class="chapter-name">{{ storyStore.availableChapter.title }}</div>
        <div class="chapter-subtitle">{{ storyStore.availableChapter.subtitle }}</div>
        <p class="chapter-desc">{{ storyStore.availableChapter.description }}</p>
        <div class="chapter-rewards">
          🏆 {{ storyStore.availableChapter.rewards.cultivation }}修 💎 {{ storyStore.availableChapter.rewards.stones }}石
        </div>
        <button class="btn-primary" @click="handleChapterClick">开启篇章</button>
      </div>

      <!-- 已完成章节 -->
      <div v-if="storyStore.completedChapterList.length > 0" class="completed-section">
        <h3>✅ 已完成篇章</h3>
        <div v-for="ch in storyStore.completedChapterList" :key="ch.id" class="completed-chapter">
          <span class="completed-icon">☑️</span>
          <span>{{ ch.title }} - {{ ch.subtitle }}</span>
        </div>
      </div>

      <div v-if="!storyStore.availableChapter && storyStore.completedChapterList.length === 0" class="empty-state">
        暂无故事可看，提升境界解锁新篇章
      </div>
    </div>
  </div>
</template>

<style scoped>
.story-panel { padding: 10px; max-width: 600px; margin: 0 auto; }
.story-title { text-align: center; color: var(--text-gold); font-family: var(--font-ancient); margin-bottom: 12px; }

/* 对话 */
.dialogue-chapter-title { text-align: center; font-size: 1.3rem; color: var(--text-gold); font-family: var(--font-ancient); margin: 16px 0 4px; }
.dialogue-subtitle { text-align: center; color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 12px; }
.dialogue-card { min-height: 100px; display: flex; align-items: center; margin: 12px 0; }
.dialogue-text { line-height: 1.8; font-size: 0.95rem; color: var(--text-primary); }
.dialogue-actions { display: flex; gap: 8px; justify-content: center; margin-top: 12px; }

/* 章节 */
.available-chapter { text-align: center; }
.chapter-name { font-size: 1.1rem; color: var(--text-gold); font-family: var(--font-ancient); margin: 8px 0 4px; }
.chapter-subtitle { color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 8px; }
.chapter-desc { font-size: 0.85rem; line-height: 1.6; color: var(--text-primary); margin: 8px 0; }
.chapter-rewards { font-size: 0.8rem; color: var(--success); margin: 8px 0; }
.completed-section { margin-top: 16px; }
.completed-chapter { padding: 4px 0; font-size: 0.85rem; color: var(--text-secondary); }
.completed-icon { margin-right: 6px; color: var(--success); }
.empty-state { text-align: center; color: var(--text-secondary); padding: 40px 0; font-size: 0.9rem; }
</style>

// ============================================================
// 主线故事状态管理
// ============================================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storyChapters } from '@/data/story'
import { usePlayerStore } from './playerStore'
import type { StoryChapter } from '@/types'

export const useStoryStore = defineStore('story', () => {
  const currentChapterId = ref<string | null>(null)
  const dialogueIndex = ref(0)
  const showStory = ref(false)

  const completedChapters = computed(() => {
    return usePlayerStore().gameProgress?.completedChapters || []
  })

  /** 当前可解锁的章节 */
  const availableChapter = computed(() => {
    const p = usePlayerStore().player
    if (!p) return null
    const realm = p.attributes.currentRealm

    const allChapters = storyChapters.filter(ch => {
      const alreadyCompleted = completedChapters.value.includes(ch.id)
      const realmMatch = ch.requiredRealm === realm || (
        // 也检查是否已达到更高境界但未完成本章
        !alreadyCompleted && isRealmSufficient(realm, ch.requiredRealm)
      )
      return !alreadyCompleted && realmMatch
    })
    return allChapters[0] || null
  })

  /** 所有已完成的章节 */
  const completedChapterList = computed(() => {
    return storyChapters.filter(ch => completedChapters.value.includes(ch.id))
  })

  /** 开始一个章节 */
  function startChapter(chapter: StoryChapter) {
    currentChapterId.value = chapter.id
    dialogueIndex.value = 0
    showStory.value = true
  }

  /** 推进对话 */
  function nextDialogue(): boolean {
    const chapter = storyChapters.find(ch => ch.id === currentChapterId.value)
    if (!chapter) return false
    if (dialogueIndex.value < chapter.dialogue.length - 1) {
      dialogueIndex.value++
      return true
    }
    return false
  }

  /** 完成章节 */
  function completeChapter() {
    if (!currentChapterId.value) return null
    const chapter = storyChapters.find(ch => ch.id === currentChapterId.value)
    if (!chapter) return null

    const playerStore = usePlayerStore()
    if (!playerStore.gameProgress.completedChapters) {
      playerStore.gameProgress.completedChapters = []
    }
    playerStore.gameProgress.completedChapters.push(chapter.id)

    // 发放奖励
    if (playerStore.player) {
      playerStore.player.attributes.cultivation += chapter.rewards.cultivation
      playerStore.player.attributes.spiritStones += chapter.rewards.stones
    }

    showStory.value = false
    currentChapterId.value = null
    dialogueIndex.value = 0
    playerStore.saveCurrentGame()
    return chapter
  }

  /** 跳过故事 */
  function skipStory() {
    showStory.value = false
    currentChapterId.value = null
    dialogueIndex.value = 0
  }

  return {
    currentChapterId,
    dialogueIndex,
    showStory,
    completedChapters,
    availableChapter,
    completedChapterList,
    startChapter,
    nextDialogue,
    completeChapter,
    skipStory,
    storyChapters,
  }
})

function isRealmSufficient(currentRealm: string, requiredRealm: string): boolean {
  const realmOrder = ['mortal', 'qi_refining', 'foundation', 'golden_core', 'nascent_soul', 'spirit_severing', 'void_refining', 'body_integration', 'mahayana', 'tribulation']
  return realmOrder.indexOf(currentRealm) >= realmOrder.indexOf(requiredRealm)
}

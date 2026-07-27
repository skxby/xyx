// ============================================================
// GSAP 动画工具集 —— 战斗/修炼/突破/UI动效
// ============================================================
import gsap from 'gsap'

// ==================== 屏幕震动 ====================

export function screenShake(target: string | HTMLElement, intensity: 'light' | 'medium' | 'heavy' = 'light') {
  const map = { light: 3, medium: 8, heavy: 15 }
  const power = map[intensity]
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) return
  gsap.to(el, {
    x: `random(-${power}, ${power})`,
    y: `random(-${power}, ${power})`,
    duration: 0.08,
    repeat: 4,
    yoyo: true,
    ease: 'none',
    onComplete: () => gsap.set(el, { x: 0, y: 0 }),
  })
}

// ==================== 飘字伤害 ====================

export function floatDamage(
  text: string,
  container: HTMLElement,
  isCrit: boolean = false,
  isHeal: boolean = false,
  isDodge: boolean = false
) {
  const el = document.createElement('div')
  el.className = 'damage-float'
  el.textContent = text
  el.style.cssText = `
    position: absolute; pointer-events: none; z-index: 1000;
    font-family: 'STKaiti','KaiTi',serif; font-weight: bold;
    font-size: ${isCrit ? '1.6rem' : '1rem'};
    color: ${isHeal ? '#5d8c4e' : isDodge ? '#8c8c8c' : isCrit ? '#b8860b' : '#2c1810'};
    left: 50%; top: 30%;
    transform: translate(-50%, -50%);
  `
  container.appendChild(el)

  gsap.to(el, {
    y: -60,
    opacity: 0,
    scale: isCrit ? 1.5 : 1,
    duration: 1,
    ease: 'power2.out',
    onComplete: () => el.remove(),
  })
}

// ==================== 球体抖动 ====================

export function shakeElement(el: HTMLElement, intensity: number = 5) {
  gsap.to(el, {
    x: `random(-${intensity}, ${intensity})`,
    y: `random(-${intensity}, ${intensity})`,
    duration: 0.06,
    repeat: 5,
    yoyo: true,
    ease: 'none',
    onComplete: () => gsap.set(el, { x: 0, y: 0 }),
  })
}

// ==================== 闪白效果 ====================

export function flashElement(el: HTMLElement, color: string = 'rgba(255,255,255,0.6)') {
  gsap.to(el, {
    backgroundColor: color,
    duration: 0.1,
    yoyo: true,
    repeat: 1,
    onComplete: () => gsap.set(el, { backgroundColor: '' }),
  })
}

// ==================== 粒子爆发 ====================

export function burstParticles(container: HTMLElement, count: number = 10, color: string = '#DAA520') {
  const rect = container.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div')
    particle.style.cssText = `
      position: fixed; pointer-events: none; z-index: 1001;
      width: 6px; height: 6px; border-radius: 50%;
      background: ${color};
      left: ${cx}px; top: ${cy}px;
    `
    document.body.appendChild(particle)

    const angle = Math.random() * Math.PI * 2
    const distance = 30 + Math.random() * 60
    gsap.to(particle, {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      opacity: 0,
      scale: 0,
      duration: 0.6 + Math.random() * 0.4,
      ease: 'power2.out',
      onComplete: () => particle.remove(),
    })
  }
}

// ==================== 光点汇聚 ====================

export function convergeParticles(container: HTMLElement, count: number = 15, color: string = '#DAA520') {
  const rect = container.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div')
    const startX = cx + (Math.random() - 0.5) * 300
    const startY = cy + (Math.random() - 0.5) * 300
    particle.style.cssText = `
      position: fixed; pointer-events: none; z-index: 1001;
      width: 4px; height: 4px; border-radius: 50%;
      background: ${color};
      left: ${startX}px; top: ${startY}px;
      opacity: 0.8;
    `
    document.body.appendChild(particle)

    gsap.to(particle, {
      x: cx - startX,
      y: cy - startY,
      opacity: 0,
      scale: 2,
      duration: 0.8 + Math.random() * 0.3,
      ease: 'power2.in',
      onComplete: () => particle.remove(),
    })
  }
}

// ==================== 金色降临 ====================

export function goldenDescent(container: HTMLElement) {
  const rect = container.getBoundingClientRect()
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div')
    particle.style.cssText = `
      position: fixed; pointer-events: none; z-index: 1001;
      width: 3px; height: ${10 + Math.random() * 20}px;
      background: linear-gradient(to bottom, transparent, #DAA520);
      left: ${rect.left + Math.random() * rect.width}px;
      top: -20px;
      opacity: 0.7;
    `
    document.body.appendChild(particle)

    gsap.to(particle, {
      y: rect.height + 40,
      opacity: 0,
      duration: 1 + Math.random() * 0.8,
      delay: Math.random() * 0.5,
      ease: 'power1.in',
      onComplete: () => particle.remove(),
    })
  }
}

// ==================== 境界突破全流程动画 ====================

export function breakthroughAnimation(container: HTMLElement, onStage: (stage: number) => void): gsap.core.Timeline {
  const tl = gsap.timeline()

  // 阶段1: 蓄力
  tl.to(container, { filter: 'brightness(0.6)', duration: 0.5 })
  tl.call(() => onStage(1))

  // 阶段2: 冲击
  tl.to(container, { filter: 'brightness(1.5)', duration: 0.3 })
  tl.to(container, { filter: 'brightness(1)', duration: 0.4 })
  tl.call(() => onStage(2))

  // 阶段3: 蜕变
  tl.to(container, {
    boxShadow: '0 0 60px rgba(218,165,32,0.6), 0 0 120px rgba(218,165,32,0.3)',
    duration: 0.8,
  })
  tl.call(() => onStage(3))

  // 阶段4: 天劫（条件触发在调用处处理）
  tl.call(() => onStage(4))

  // 阶段5: 礼成
  tl.to(container, {
    boxShadow: '0 0 100px rgba(218,165,32,0.8), 0 0 200px rgba(255,215,0,0.5)',
    duration: 0.6,
  })
  tl.to(container, { boxShadow: '0 0 20px rgba(218,165,32,0.2)', duration: 1 })
  tl.call(() => onStage(5))

  return tl
}

// ==================== 淡入淡出过渡 ====================

export function fadeTransition(el: HTMLElement, direction: 'in' | 'out', duration: number = 0.3): gsap.core.Tween {
  return gsap.to(el, {
    opacity: direction === 'in' ? 1 : 0,
    duration,
    ease: 'power2.out',
  })
}

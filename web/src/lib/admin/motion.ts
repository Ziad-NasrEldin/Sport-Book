export const transitions = {
  fast: 'duration-100 ease-out-quart',
  default: 'duration-150 ease-out-quart',
  slow: 'duration-300 ease-out-quart',
  spring: 'duration-400 ease-out-expo',
} as const

export const animations = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  pulse: 'animate-pulse',
} as const

export const motionReduce = '@media (prefers-reduced-motion: reduce)'

export const staggerDelay = (index: number, base: number = 50) => `animation-delay: ${index * base}ms`
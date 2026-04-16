'use client'

import { useEffect, useRef, useState } from 'react'

const days = [
  { dayName: 'SUN', date: '06' },
  { dayName: 'MON', date: '07' },
  { dayName: 'TUE', date: '08' },
  { dayName: 'WED', date: '09' },
  { dayName: 'THU', date: '10' },
  { dayName: 'FRI', date: '11' },
]

const MOBILE_DAY_WIDTH = 88

export function DateSelector() {
  const [selectedDate, setSelectedDate] = useState('08')
  const sliderRef = useRef<HTMLDivElement | null>(null)
  const dayRefs = useRef<Array<HTMLButtonElement | null>>([])
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const centerDay = (index: number, behavior: ScrollBehavior) => {
    const slider = sliderRef.current
    const dayEl = dayRefs.current[index]
    if (!slider || !dayEl) return

    const targetScroll = dayEl.offsetLeft - slider.clientWidth / 2 + dayEl.clientWidth / 2
    slider.scrollTo({ left: targetScroll, behavior })
  }

  const getClosestDayIndex = () => {
    const slider = sliderRef.current
    if (!slider) return 0

    const sliderCenterX = slider.scrollLeft + slider.clientWidth / 2
    let closestIndex = 0
    let smallestDistance = Number.POSITIVE_INFINITY

    dayRefs.current.forEach((dayEl, index) => {
      if (!dayEl) return
      const dayCenterX = dayEl.offsetLeft + dayEl.clientWidth / 2
      const distance = Math.abs(dayCenterX - sliderCenterX)
      if (distance < smallestDistance) {
        smallestDistance = distance
        closestIndex = index
      }
    })

    return closestIndex
  }

  const commitClosestDay = (behavior: ScrollBehavior) => {
    if (!window.matchMedia('(max-width: 767px)').matches) return

    const closestIndex = getClosestDayIndex()
    const nextDate = days[closestIndex]?.date

    if (nextDate && nextDate !== selectedDate) {
      setSelectedDate(nextDate)
    }

    centerDay(closestIndex, behavior)
  }

  const handleDayTap = (index: number, date: string) => {
    setSelectedDate(date)

    if (window.matchMedia('(max-width: 767px)').matches) {
      centerDay(index, 'smooth')
    }
  }

  const handleMobileScroll = () => {
    if (scrollEndTimerRef.current) {
      clearTimeout(scrollEndTimerRef.current)
    }

    // Update only after user stops dragging to avoid rapid visual toggling.
    scrollEndTimerRef.current = setTimeout(() => {
      commitClosestDay('smooth')
    }, 85)
  }

  useEffect(() => {
    const selectedIndex = days.findIndex((item) => item.date === selectedDate)
    if (selectedIndex < 0) return

    const centerInitially = () => {
      if (!window.matchMedia('(max-width: 767px)').matches) return
      centerDay(selectedIndex, 'auto')
    }

    centerInitially()
    window.addEventListener('resize', centerInitially)

    return () => {
      window.removeEventListener('resize', centerInitially)
      if (scrollEndTimerRef.current) {
        clearTimeout(scrollEndTimerRef.current)
      }
    }
  }, [selectedDate])

  return (
    <section className="mb-10 md:mb-12">
      <div className="px-5 mb-5 md:px-10 lg:px-14 flex items-end justify-between">
        <h2 className="text-[28px] font-extrabold text-primary tracking-tight md:text-[32px]">
          August 2024
        </h2>
        <button className="text-secondary-container font-lexend font-bold uppercase tracking-widest text-[11px] md:text-xs hover:opacity-80 transition-opacity pb-1.5 focus:outline-none">
          SCHEDULE
        </button>
      </div>

      <div className="px-5 md:px-10 lg:px-14">
        <div className="bg-surface-container-low rounded-[2.5rem] h-[130px] overflow-hidden shadow-ambient/5 md:hidden">
          <div
            ref={sliderRef}
            onScroll={handleMobileScroll}
            onTouchEnd={() => commitClosestDay('smooth')}
            onMouseUp={() => commitClosestDay('smooth')}
            className="flex h-full items-center gap-2 overflow-x-auto hide-scrollbar touch-pan-x snap-x snap-mandatory"
            style={{ paddingInline: `calc(50% - ${MOBILE_DAY_WIDTH / 2}px)` }}
          >
            {days.map((item, index) => {
              const isSelected = selectedDate === item.date

              return (
                <button
                  key={item.date}
                  ref={(el) => {
                    dayRefs.current[index] = el
                  }}
                  onClick={() => handleDayTap(index, item.date)}
                  className={`relative flex-none w-[88px] h-[106px] flex flex-col items-center justify-center rounded-[2.5rem] snap-center transition-[transform,background-color,color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
                    isSelected
                      ? 'bg-tertiary-fixed shadow-[0_12px_28px_-10px_rgba(195,244,0,0.55)] scale-105'
                      : 'bg-transparent scale-100'
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold font-lexend uppercase tracking-wider mb-2 transition-[transform,color,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isSelected ? 'text-[#0a1631]' : 'text-primary/50'
                    }`}
                  >
                    {item.dayName}
                  </span>
                  <span
                    className={`text-2xl font-black font-lexend leading-none transition-[transform,color,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isSelected ? 'text-[#0a1631]' : 'text-primary/70'
                    }`}
                  >
                    {item.date}
                  </span>
                  <div
                    className={`absolute bottom-3.5 w-1.5 h-1.5 rounded-full bg-[#0a1631] transition-[opacity,transform] duration-250 ease-out ${
                      isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                    }`}
                  />
                </button>
              )
            })}
          </div>
        </div>

        <div className="hidden md:flex bg-surface-container-low rounded-[2.5rem] h-[130px] px-5 shadow-ambient/5 items-center justify-between gap-2">
          {days.map((item, index) => {
            const isSelected = selectedDate === item.date

            return (
              <button
                key={item.date}
                onClick={() => handleDayTap(index, item.date)}
                className={`relative flex flex-col items-center justify-center rounded-[2.5rem] transition-[transform,background-color,color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] min-w-[88px] h-[106px] ${
                  isSelected
                    ? 'bg-tertiary-fixed shadow-[0_12px_28px_-10px_rgba(195,244,0,0.55)] scale-105'
                    : 'bg-transparent hover:bg-black/5 scale-100'
                }`}
              >
                <span
                  className={`text-[11px] font-bold font-lexend uppercase tracking-wider mb-2 transition-[transform,color,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isSelected ? 'text-[#0a1631]' : 'text-primary/50'
                  }`}
                >
                  {item.dayName}
                </span>
                <span
                  className={`text-[28px] font-black font-lexend leading-none transition-[transform,color,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isSelected ? 'text-[#0a1631]' : 'text-primary/70'
                  }`}
                >
                  {item.date}
                </span>
                <div
                  className={`absolute bottom-3.5 w-1.5 h-1.5 rounded-full bg-[#0a1631] transition-[opacity,transform] duration-250 ease-out ${
                    isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                  }`}
                />
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

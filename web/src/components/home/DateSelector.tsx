'use client'

import { useEffect, useRef, useState, useMemo } from 'react'

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function generateDaysFromToday(count: number = 7) {
  const days = []
  const today = new Date()
  for (let i = 0; i < count; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    days.push({
      dayName: DAY_NAMES[date.getDay()],
      date: date.getDate().toString().padStart(2, '0'),
      fullDate: date.toISOString().split('T')[0],
    })
  }
  return days
}

export function DateSelector() {
  const days = useMemo(() => generateDaysFromToday(7), [])
  const [selectedDate, setSelectedDate] = useState(() => days[0]?.date || '01')
  const [animatingKey, setAnimatingKey] = useState<string | null>(null)

  const handleSelect = (item: typeof days[0]) => {
    if (selectedDate === item.date) return
    setAnimatingKey(item.fullDate)
    setSelectedDate(item.date)
    // Reset animation flag after animation completes
    setTimeout(() => setAnimatingKey(null), 300)
  }

  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar">
      {days.map((item) => {
        const isSelected = selectedDate === item.date
        const isAnimating = animatingKey === item.fullDate
        return (
          <button
            key={item.fullDate}
            onClick={() => handleSelect(item)}
            className={`relative flex flex-col items-center justify-center rounded-xl transition-all duration-200 flex-none w-[72px] h-[72px] hover:-translate-y-0.5 ${
              isSelected
                ? 'bg-[#0a1631] shadow-md'
                : 'bg-surface-container-high hover:bg-surface-container-lowest'
            } ${isAnimating ? 'animate-chip-select' : ''}`}
          >
            <span className={`text-[10px] font-black uppercase tracking-wider mb-0.5 ${isSelected ? 'text-[#c3f400]' : 'text-primary/50'}`}>
              {item.dayName}
            </span>
            <span className={`text-lg font-black leading-none ${isSelected ? 'text-white' : 'text-primary/70'}`}>
              {item.date}
            </span>
            <div
              className={`absolute bottom-2 w-1.5 h-1.5 bg-[#c3f400] rounded-full transition-all duration-200 ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
            />
          </button>
        )
      })}
    </div>
  )
}

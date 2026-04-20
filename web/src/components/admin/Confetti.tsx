"use client"

import { useEffect, useState, useCallback } from "react"
import { clsx } from "clsx"

type ConfettiPiece = {
  id: number
  x: number
  y: number
  rotation: number
  scale: number
  color: string
  velocityX: number
  velocityY: number
  opacity: number
}

const colors = ["#002366", "#fd8b00", "#c3f400", "#904d00", "#00113a"]

interface ConfettiProps {
  isActive: boolean
  particleCount?: number
  duration?: number
  onComplete?: () => void
}

export function Confetti({
  isActive,
  particleCount = 50,
  duration = 2500,
  onComplete,
}: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const createParticles = useCallback(() => {
    const newPieces: ConfettiPiece[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      velocityX: (Math.random() - 0.5) * 4,
      velocityY: 2 + Math.random() * 3,
      opacity: 1,
    }))
    setPieces(newPieces)
  }, [particleCount])

  useEffect(() => {
    if (isActive && isMounted) {
      createParticles()
      const timer = setTimeout(() => {
        onComplete?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isActive, isMounted, createParticles, duration, onComplete])

  useEffect(() => {
    if (pieces.length === 0) return

    const interval = setInterval(() => {
      setPieces((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.velocityX,
            y: p.y + p.velocityY,
            velocityY: p.velocityY + 0.1,
            rotation: p.rotation + p.velocityX * 2,
            opacity: p.opacity > 0 ? p.opacity - 0.015 : 0,
          }))
          .filter((p) => p.y < 120 && p.opacity > 0)
      )
    }, 16)

    return () => clearInterval(interval)
  }, [pieces.length])

  if (!isActive || pieces.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-2.5 h-2.5 rounded-sm"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            transform: `rotate(${piece.rotation}deg) scale(${piece.scale})`,
            backgroundColor: piece.color,
            opacity: piece.opacity,
            transition: "none",
          }}
        />
      ))}
    </div>
  )
}

export function useConfetti() {
  const [isActive, setIsActive] = useState(false)

  const celebrate = useCallback(() => {
    setIsActive(true)
  }, [])

  const onComplete = useCallback(() => {
    setIsActive(false)
  }, [])

  return { isActive, celebrate, Confetti: <Confetti isActive={isActive} onComplete={onComplete} /> }
}
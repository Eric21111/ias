import { useCallback, useEffect, useMemo, useRef } from 'react'

function ClickSpark({
  sparkColor = '#fff',
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = 'ease-out',
  extraScale = 1,
  className = '',
  children,
}) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const sparksRef = useRef([])
  const animationIdRef = useRef(null)
  const startTimeRef = useRef(null)
  const resizeTimeoutRef = useRef(null)

  const easeFunc = useMemo(() => {
    return (t) => {
      switch (easing) {
        case 'linear':
          return t
        case 'ease-in':
          return t * t
        case 'ease-in-out':
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
        default:
          return t * (2 - t)
      }
    }
  }, [easing])

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const parent = canvas.parentElement
    if (!parent) return

    const { width, height } = parent.getBoundingClientRect()
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }
  }, [])

  const handleResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current)
    }

    resizeTimeoutRef.current = setTimeout(() => {
      resizeCanvas()
    }, 100)
  }, [resizeCanvas])

  const handlePointerDown = useCallback(
    (e) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const now = performance.now()

      const newSparks = Array.from({ length: sparkCount }, (_, i) => ({
        x,
        y,
        angle: (2 * Math.PI * i) / sparkCount,
        startTime: now,
      }))

      sparksRef.current.push(...newSparks)
    },
    [sparkCount],
  )

  const draw = useCallback(
    (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime
        if (elapsed >= duration) {
          return false
        }

        const progress = elapsed / duration
        const eased = easeFunc(progress)

        const distance = eased * sparkRadius * extraScale
        const lineLength = sparkSize * (1 - eased)

        const x1 = spark.x + distance * Math.cos(spark.angle)
        const y1 = spark.y + distance * Math.sin(spark.angle)
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle)
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle)

        ctx.strokeStyle = sparkColor
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()

        return true
      })

      animationIdRef.current = requestAnimationFrame(draw)
    },
    [duration, easeFunc, extraScale, sparkColor, sparkRadius, sparkSize],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const parent = canvas.parentElement
    if (!parent) return undefined

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(parent)

    resizeCanvas()
    animationIdRef.current = requestAnimationFrame(draw)

    return () => {
      resizeObserver.disconnect()

      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }

      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
    }
  }, [draw, handleResize, resizeCanvas])

  return (
    <div
      ref={containerRef}
      className={`clickspark-container ${className}`}
      onPointerDownCapture={handlePointerDown}
    >
      <canvas ref={canvasRef} className="clickspark-canvas" />
      {children}
    </div>
  )
}

export default ClickSpark

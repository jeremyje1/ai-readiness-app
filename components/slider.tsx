"use client"

import * as React from "react"

interface SliderProps {
  defaultValue?: number[]
  min?: number
  max?: number
  step?: number
  onValueChange?: (value: number[]) => void
  className?: string
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ defaultValue = [0], min = 0, max = 100, step = 1, onValueChange, className }, ref) => {
    const [value, setValue] = React.useState(defaultValue[0])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value)
      setValue(newValue)
      onValueChange?.([newValue])
    }

    return (
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${className}`}
      />
    )
  }
)
Slider.displayName = "Slider"

export { Slider }

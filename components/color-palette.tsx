"use client"

interface ColorPaletteProps {
  colors: Array<{
    number: number
    color: string
    rgb: string
  }>
}

export function ColorPalette({ colors }: ColorPaletteProps) {
  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Color Palette</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {colors.map((color) => (
          <div
            key={color.number}
            className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 bg-white hover:shadow-sm transition-shadow min-w-24"
          >
            <div
              className="w-12 h-12 rounded-md border border-gray-300 shadow-sm"
              style={{ backgroundColor: color.color }}
            />
            <div className="text-center">
              <div className="font-serif text-lg font-semibold text-gray-900">{color.number}</div>
              <div className="text-xs text-gray-600 mt-1">{color.rgb}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

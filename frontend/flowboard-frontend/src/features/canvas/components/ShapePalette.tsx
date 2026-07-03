import { useMemo, useState } from "react";
import { Search, Shapes } from "lucide-react";
import { SHAPES, type ShapeDefinition } from "../config/shapes";

import { Button } from "@/components/ui/button";
import { NODE_COLORS, type NodeColor } from "../config/colors";

interface ShapePaletteProps {
  selectedColor: NodeColor;
  onColorChange: (color: NodeColor) => void;
  onAddShape: (shape: ShapeDefinition) => void;
}

export function ShapePalette({
  selectedColor,
  onColorChange,
  onAddShape,
}: ShapePaletteProps) {
  const [search, setSearch] = useState("");

  const filteredShapes = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return SHAPES;

    return SHAPES.filter((shape) => {
      return (
        shape.label.toLowerCase().includes(query) ||
        shape.category.toLowerCase().includes(query) ||
        shape.type.toLowerCase().includes(query)
      );
    });
  }, [search]);

  const groupedShapes = useMemo(() => {
    return filteredShapes.reduce<Record<string, ShapeDefinition[]>>(
      (acc, shape) => {
        if (!acc[shape.category]) {
          acc[shape.category] = [];
        }

        acc[shape.category].push(shape);
        return acc;
      },
      {}
    );
  }, [filteredShapes]);

  return (
    <div className="absolute left-4 top-28 z-20 flex max-h-[calc(100vh-10rem)] w-64 flex-col rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur">
      <div className="border-b border-white/10 p-3">
        <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
          <Shapes className="h-4 w-4" />
          Shape Library
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shape..."
            className="h-9 w-full rounded-xl border border-white/10 bg-slate-950 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
          />
        </div>
      </div>

      <div className="border-b border-white/10 p-3">
        <p className="mb-2 text-xs font-medium text-slate-400">Color</p>

        <div className="grid grid-cols-6 gap-2">
          {NODE_COLORS.map((color) => {
            const active =
              selectedColor.bg === color.bg &&
              selectedColor.border === color.border;

            return (
              <button
                key={color.name}
                type="button"
                title={color.name}
                onClick={() => onColorChange(color)}
                className={`h-7 w-7 rounded-full border-2 transition ${
                  active
                    ? "scale-110 border-white"
                    : "border-white/20 hover:scale-105"
                }`}
                style={{
                  backgroundColor: color.bg,
                  boxShadow: `0 0 0 2px ${color.border}`,
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="scrollbar-hide flex-1 space-y-4 overflow-y-auto p-3">
        {Object.entries(groupedShapes).map(([category, shapes]) => (
          <div key={category}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {category}
            </p>

            <div className="grid grid-cols-2 gap-2">
              {shapes.map((shape) => {
                const Icon = shape.icon;

                return (
                  <Button
                    key={shape.type}
                    variant="outline"
                    className="h-20 flex-col gap-2 border-white/10 bg-slate-800/80 text-slate-100 hover:bg-slate-700"
                    onClick={() => onAddShape(shape)}
                  >
                    <Icon className="h-5 w-5 text-cyan-300" />
                    <span className="text-xs">{shape.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        ))}

        {filteredShapes.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-slate-500">
            No shape found.
          </div>
        )}
      </div>
    </div>
  );
}
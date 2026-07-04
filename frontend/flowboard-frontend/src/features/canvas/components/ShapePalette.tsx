import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, Shapes, Workflow } from "lucide-react";
import { SHAPES, type ShapeDefinition } from "../config/shapes";

import { Button } from "@/components/ui/button";
import { NODE_COLORS, type NodeColor } from "../config/colors";

interface ShapePaletteProps {
  selectedColor: NodeColor;
  onColorChange: (color: NodeColor) => void;
  onAddShape: (shape: ShapeDefinition) => void;
}

function ShapePreview({
  shape,
  selectedColor,
}: {
  shape: ShapeDefinition;
  selectedColor: NodeColor;
}) {
  const style: React.CSSProperties = {
    backgroundColor: selectedColor.bg,
    borderColor: selectedColor.border,
    color: selectedColor.text,
  };

  if (shape.type === "circle") {
    return <div className="h-9 w-9 rounded-full border" style={style} />;
  }

  if (shape.type === "diamond") {
    return (
      <div className="flex h-10 w-10 items-center justify-center">
        <div className="h-7 w-7 rotate-45 border" style={style} />
      </div>
    );
  }

  if (shape.type === "triangle") {
    return (
      <div
        className="h-0 w-0 border-x-[18px] border-b-[32px] border-x-transparent"
        style={{
          borderBottomColor: selectedColor.border,
        }}
      />
    );
  }

  if (shape.type === "database") {
    return (
      <div
        className="flex h-8 w-12 items-center justify-center rounded-[18px] border text-[10px] font-semibold"
        style={style}
      >
        DB
      </div>
    );
  }

  if (shape.type === "rounded" || shape.type === "service") {
    return (
      <div
        className="flex h-8 w-12 items-center justify-center rounded-xl border"
        style={style}
      />
    );
  }

  if (shape.type === "api") {
    return (
      <div
        className="flex h-8 w-12 items-center justify-center rounded-lg border text-[9px] font-semibold"
        style={style}
      >
        API
      </div>
    );
  }

  if (shape.type === "queue") {
    return (
      <div className="flex items-center">
        <div className="h-7 w-4 rounded-l-md border" style={style} />
        <div className="-ml-1 h-7 w-4 border" style={style} />
        <div className="-ml-1 h-7 w-4 rounded-r-md border" style={style} />
      </div>
    );
  }

  if (shape.type === "process") {
    return (
      <div
        className="flex h-8 w-12 items-center justify-center rounded-md border"
        style={style}
      >
        <Workflow className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div
      className="flex h-8 w-12 items-center justify-center rounded-md border"
      style={style}
    />
  );
}

export function ShapePalette({
  selectedColor,
  onColorChange,
  onAddShape,
}: ShapePaletteProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(true);

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
      {},
    );
  }, [filteredShapes]);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="absolute left-4 top-28 z-20 flex h-12 items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/95 px-3 text-sm font-medium text-slate-200 shadow-2xl backdrop-blur transition hover:bg-slate-800 hover:text-white"
        title="Open shape library"
      >
        <Shapes className="h-5 w-5 text-cyan-300" />
        <ChevronRight className="h-4 w-4 text-slate-400" />
      </button>
    );
  }

  return (
    <div className="absolute left-4 top-28 z-20 flex max-h-[calc(100vh-10rem)] w-64 flex-col rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur">
      <div className="border-b border-white/10 p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            <Shapes className="h-4 w-4" />
            Shape Library
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
            title="Close shape library"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
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
                return (
                  <Button
                    key={shape.type}
                    type="button"
                    variant="outline"
                    className="h-24 flex-col gap-2 border-white/10 bg-slate-800/80 text-slate-100 hover:bg-slate-700"
                    onClick={() => onAddShape(shape)}
                  >
                    <ShapePreview shape={shape} selectedColor={selectedColor} />

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
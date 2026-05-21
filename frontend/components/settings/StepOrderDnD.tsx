"use client";

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { STEP_LABEL, type StepKind, useSettingsStore } from "@/lib/store/settingsStore";

function SortableRow({
  kind,
  index,
  enabled,
  onToggle,
}: {
  kind: StepKind;
  index: number;
  enabled: boolean;
  onToggle: (next: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: kind });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  // Only the drag handle area gets the DnD listeners so the checkbox stays clickable.
  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border bg-white px-4 py-3 text-sm select-none ${
        enabled ? "" : "bg-slate-50"
      }`}
      data-testid={`step-row-${kind}`}
    >
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => onToggle(e.target.checked)}
        className="h-4 w-4 cursor-pointer"
        aria-label={`${STEP_LABEL[kind]} 사용`}
      />
      <div
        {...attributes}
        {...listeners}
        className="flex-1 flex items-center gap-3 cursor-grab active:cursor-grabbing"
      >
        <span className="text-slate-400 text-xs w-6 tabular-nums">{index + 1}.</span>
        <span className="text-slate-400">⋮⋮</span>
        <span className={`flex-1 font-medium ${enabled ? "" : "text-slate-400 line-through"}`}>
          {STEP_LABEL[kind]}
        </span>
      </div>
    </li>
  );
}

export function StepOrderDnD() {
  const order = useSettingsStore((s) => s.stepOrder);
  const enabled = useSettingsStore((s) => s.enabled);
  const setOrder = useSettingsStore((s) => s.setStepOrder);
  const setEnabled = useSettingsStore((s) => s.setEnabled);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(active.id as StepKind);
    const newIndex = order.indexOf(over.id as StepKind);
    if (oldIndex < 0 || newIndex < 0) return;
    setOrder(arrayMove(order, oldIndex, newIndex));
  }

  return (
    <section className="bg-white rounded-xl border p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">적용 순서</h3>
        <span className="text-xs text-slate-500">체크박스로 사용 여부 · 드래그로 순서 변경</span>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">
            {order.map((kind, i) => (
              <SortableRow
                key={kind}
                kind={kind}
                index={i}
                enabled={enabled[kind]}
                onToggle={(next) => setEnabled(kind, next)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      <p className="text-xs text-slate-500">
        매 추천 후 마지막에 자동으로 <code>필터 검증</code> 단계가 적용됩니다.
      </p>
    </section>
  );
}

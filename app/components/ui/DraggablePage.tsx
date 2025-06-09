'use client';

import React, { useRef } from 'react';
import { useDrag, useDrop, DropTargetMonitor, DragSourceMonitor } from 'react-dnd';

export const ItemTypes = {
    PAGE: 'page',
} as const;

export interface PageInfo {
    id: number; // Original 0-based index
    pageNumber: number; // 1-based display number (original index + 1)
    text: string; // e.g., "Page X (W x H pt)"
}

interface DraggablePageProps {
    pageInfo: PageInfo;
    index: number; // Current index in the reordered list
    movePage: (dragIndex: number, hoverIndex: number) => void;
}

interface DragItem {
    index: number;
    id: string; // pageInfo.id.toString()
    type: typeof ItemTypes.PAGE; // Use typeof for type safety
}

const DraggablePage: React.FC<DraggablePageProps> = ({ pageInfo, index, movePage }) => {
    const ref = useRef<HTMLDivElement>(null);

    const [, drop] = useDrop<DragItem, void, { handlerId: string | symbol | null }>({
        // Added handlerId to collected props for drop
        accept: ItemTypes.PAGE,
        hover(
            item: DragItem,
            monitor: DropTargetMonitor<DragItem, { handlerId: string | symbol | null }>
        ) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;

            if (dragIndex === hoverIndex) {
                return;
            }

            const hoverBoundingRect = ref.current.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset(); // This can be null

            if (!clientOffset) {
                return;
            }
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;

            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }
            movePage(dragIndex, hoverIndex);
            item.index = hoverIndex; // Mutate the item's index for subsequent hovers
        },
        collect: (monitor) => ({
            // To satisfy explicit return type for collected props
            handlerId: monitor.getHandlerId(),
        }),
    });

    const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>({
        type: ItemTypes.PAGE,
        item: () => ({ id: pageInfo.id.toString(), index, type: ItemTypes.PAGE }),
        collect: (monitor: DragSourceMonitor<DragItem, unknown>) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const opacity = isDragging ? 0.4 : 1;
    drag(drop(ref)); // Attach drag and drop to the same ref

    return (
        <div
            ref={ref}
            style={{ opacity }}
            className="p-3 mb-2 border border-slate-600 bg-slate-700 rounded-md cursor-move select-none flex justify-between items-center"
            data-testid={`page-${pageInfo.id}`}
        >
            <span className="text-slate-200">{pageInfo.text}</span>
            <span className="text-slate-400 text-xs">Original Page {pageInfo.pageNumber}</span>
        </div>
    );
};

export default DraggablePage;

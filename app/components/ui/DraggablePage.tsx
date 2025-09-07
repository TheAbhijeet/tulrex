'use client';

import React, { useRef } from 'react';
import { useDrag, useDrop, DropTargetMonitor, DragSourceMonitor } from 'react-dnd';

export const ItemTypes = {
    PAGE: 'page',
} as const;

export interface PageInfo {
    id: number;
    pageNumber: number;
    text: string;
}

interface DraggablePageProps {
    pageInfo: PageInfo;
    index: number;
    movePage: (dragIndex: number, hoverIndex: number) => void;
}

interface DragItem {
    index: number;
    id: string;
    type: typeof ItemTypes.PAGE;
}

const DraggablePage: React.FC<DraggablePageProps> = ({ pageInfo, index, movePage }) => {
    const ref = useRef<HTMLDivElement>(null);

    const [, drop] = useDrop<DragItem, void, { handlerId: string | symbol | null }>({
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
            const clientOffset = monitor.getClientOffset();

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
            item.index = hoverIndex;
        },
        collect: (monitor) => ({
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
    drag(drop(ref));

    return (
        <div
            ref={ref}
            style={{ opacity }}
            className="p-3 mb-2 border border-gray-600 bg-gray-700 rounded-md cursor-move select-none flex justify-between items-center"
            data-testid={`page-${pageInfo.id}`}
        >
            <span className="text-gray-200">{pageInfo.text}</span>
            <span className="text-gray-400 text-xs">Original Page {pageInfo.pageNumber}</span>
        </div>
    );
};

export default DraggablePage;

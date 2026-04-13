import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableCardProps {
  card: any;
  onClick: () => void;
}

const SortableCard: React.FC<SortableCardProps> = ({ card, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: card.card_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      key={card.card_id}
      className="card-title"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
    >
      <span
        className="drag-handle"
        onClick={(e) => e.stopPropagation()}
        style={{ display: 'inline-block', cursor: 'grab', float: 'right', padding: '1px' }}
      >
        ::
      </span>
      {card.title}
    </div>
  );
};

export default SortableCard;
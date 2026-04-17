import React, { useState } from 'react';
import './TagBox.css';

interface Tag {
  label_id: number;
  title: string;
  color: string;
}

interface TagBoxProps {
  tags: Tag[];
  cardLabels: number[];
  onCreateTag: (title: string, color: string) => void;
  onAssignTag: (tagId: number) => void;
  onClose: () => void;
}

const TagBox: React.FC<TagBoxProps> = ({tags, cardLabels, onCreateTag, onAssignTag, onClose}) => {
  const [newTagTitle, setNewTagTitle] = useState('');
  const [color, setColor] = useState('#7a7a7a');
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);

  return (
    <div className="tag-box">
      <div className="tag-box-header">
        <span>Tags</span>
        <button className="tag-box-header-button" onClick={onClose}>×</button>
      </div>

      {/* CREATE TAG */}
    <div className="tag-create-row">
        <input
            type="text"
            placeholder="Nouveau tag"
            value={newTagTitle}
            onChange={(e) => setNewTagTitle(e.target.value)}
        />

        <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="tag-color-picker"
        />
    </div>

    <button className='newColorButton'
        onClick={() => {
            if (newTagTitle.trim()) {
                onCreateTag(newTagTitle, color);
                setNewTagTitle('');
            }
        }}
        >
          Créer
    </button>

      {/* LISTE TAGS */}
      <div className="tag-list">
        {tags ?.filter((tag) => !cardLabels?.includes(tag.label_id)).map((tag) => (
          <div
            key={tag.label_id}
            className={`tag-item ${selectedTagId === tag.label_id ? 'selected' : ''}`}
            style={{ backgroundColor: tag.color }}
            onClick={() => setSelectedTagId(tag.label_id)}
          >
            {tag.title}
          </div>
        ))}
      </div>

      {/* ASSIGN */}
      <button
        className="tag-assign-button"
        onClick={() => {
          if (selectedTagId !== null) {
            onAssignTag(selectedTagId);
          }
        }}
      >
        Ajouter à la carte
      </button>
    </div>
  );
};

export default TagBox;
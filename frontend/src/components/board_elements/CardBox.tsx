import React, { useState, useEffect, useRef } from "react";
import { CirclePlus } from "lucide-react";
import "./CardBox.css";

interface CardBoxProps {
  listId: number;
  onCreateCard: (listId: number, title: string, description: string) => void;
  onClose: () => void;
}

const CardBox: React.FC<CardBoxProps> = ({
  listId,
  onCreateCard,
  onClose,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        boxRef.current &&
        !boxRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleCreate = () => {
    if (title.trim()) {
      onCreateCard(listId, title, description);
      setTitle("");
      setDescription("");
      onClose();
    }
  };

  return (
    <div className="card-box"  ref={boxRef}>
      {/* HEADER */}
      <div className="card-box-header">
        <span>Nouvelle carte</span>
        <button className="card-box-header-button" onClick={onClose}>
          ×
        </button>
      </div>
      {/* FORMULAIRE */}
      <div className="card-create">
        <input
          type="text" placeholder="Titre de la carte"
          value={title} onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description" value={description}
          onChange={(e) => setDescription(e.target.value)} rows={3}
        />
      </div>
      {/* BOUTON DE CRÉATION */}
      <button className="card-create-button" onClick={handleCreate}>
        <CirclePlus size={18} />
        Créer la carte
      </button>
    </div>
  );
};

export default CardBox;
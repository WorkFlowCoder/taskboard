import React, { useState } from 'react';
import { SendHorizonal, Loader2 } from 'lucide-react'; // Import des icônes
import './Comments.css';

interface CommentResponse {
  send: boolean;
  message: string;
}

interface CommentsProps {
  comments: any[];
  members: any[];
  onAddComment: (content: string) => Promise<CommentResponse>;
}

const Comments: React.FC<CommentsProps> = ({ comments, members, onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await onAddComment(newComment);
      setNewComment('');
    } catch (error) {
      console.error("Erreur lors de l'envoi du commentaire:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="comments">
      {comments?.map((comment: any) => {
        const author = members.find((member: any) => member.user_id === comment.author);
        return (
          <div key={comment.comment_id} className="comment">
            <div className="comment-header">
              <span className="comment-author">
                {author ? `${author.first_name} ${author.last_name}` : 'Utilisateur inconnu'}
              </span>
              <span className="comment-date">{new Date(comment.created_at).toLocaleDateString()}</span>
            </div>
            <p className="comment-content">{comment.content}</p>
          </div>
        );
      })}

      <hr className="comment-separator" />

      {/* Zone pour publier un nouveau commentaire */}
      <form className="comment add-comment-form" onSubmit={handleSubmit}>
        <div className="comment-header">
          <span className="comment-author">Publier un commentaire</span>
        </div>
        <textarea
          className="comment-textarea"
          placeholder="Votre message ici..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          required
        />
        <div className="comment-actions">
          <button 
            type="submit" 
            className="comment-submit-icon-button"
            disabled={!newComment.trim() || isSubmitting}
            title="Envoyer le commentaire"
          >
            {isSubmitting ? (
              <Loader2 className="icon-spin" size={20} />
            ) : (
              <SendHorizonal size={20} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Comments;
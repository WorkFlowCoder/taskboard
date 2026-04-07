import React from 'react';
import './Comments.css';

interface CommentsProps {
  comments: any[];
  members: any[];
}

const Comments: React.FC<CommentsProps> = ({ comments, members }) => {
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
    </div>
  );
};

export default Comments;
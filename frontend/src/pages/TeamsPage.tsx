import React, { useEffect, useState } from 'react';
import { deleteBoardMember, fetchUserBoardsWithMembers } from '../services/memberService';
import './TeamsPage.css';
import { useAuth } from '../components/AuthContext';
import type { Board } from '../types/Objects';

const TeamsPage: React.FC = () => {
  const {authToken, isAuthenticated} = useAuth(); // Use the token from AuthContext
  const [boards, setBoards] = useState<Board[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{ board_id: number; user_id: number; first_name: string; last_name: string } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchBoards = async () => {
        try {
          const data = await fetchUserBoardsWithMembers(authToken);
          setBoards(data);
        } catch (err: any) {
          console.error('Error fetching boards:', err);
          setError(err.message);
        }
      };

      fetchBoards();
    }
  }, [authToken, isAuthenticated]);

  const handleDeleteClick = (member: { board_id: number; user_id: number; first_name: string; last_name: string }) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedMember) {
      try {
        if (!isAuthenticated) throw new Error('Utilisateur non authentifié.');
        await deleteBoardMember(authToken, selectedMember.board_id, selectedMember.user_id);
        // Remove the member from the board in the state
        setBoards((prevBoards) =>
          prevBoards.map((board) =>
            board.board_id === selectedMember.board_id
              ? {
                  ...board,
                  members: board.members.filter((member) => member.user_id !== selectedMember.user_id),
                }
              : board
          )
        );
      } catch (error) {
        console.error('Erreur lors de la suppression du membre :', error);
      } finally {
        setShowDeleteModal(false);
        setSelectedMember(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedMember(null);
  };

  return (
    <div className="teams-page">
      <h1>Équipes</h1>
      {isAuthenticated ? (
        error ? (
          <p className="error-message">Erreur : {error}</p>
        ) : boards.length > 0 ? (
          <div className="teams-list">
            {boards.map((board, boardIndex) => (
              <div key={board.board_id || `board-${boardIndex}`} className="team-section">
                <h2>{board.title}</h2>
                <table className="members-table">
                  <thead>
                    <tr>
                      <th>Utilisateur</th>
                      <th className="role">Rôle</th>
                      {board.requester_role === 'admin' && <th className="actions-column">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {board.members.map((member, memberIndex) => (
                      <tr key={member.user_id || `member-${boardIndex}-${memberIndex}`} className="member-row">
                        <td>{member.first_name} {member.last_name}</td>
                        <td className="role">{board.user_id === member.user_id ? 'Propriétaire' : member.role}</td>
                        {board.requester_role === 'admin' && board.user_id !== member.user_id && (
                          (board.user_id === board.requester_user_id || member.role !== 'admin') && (
                            <td className="actions-column">
                              <button className="edit-role-button" disabled={member.user_id===board.requester_user_id}>Modifier Rôle</button>
                              <button
                                className="delete-user-button"
                                onClick={() => handleDeleteClick({ board_id: board.board_id, user_id: member.user_id, first_name: member.first_name, last_name: member.last_name })}
                              >
                                Supprimer
                              </button>
                            </td>
                          )
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {board.requester_role === 'admin' && (
                  <button className="add-member-button">Ajouter un membre</button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>Aucun board trouvé.</p>
        )
      ) : (
        <>
          <p>Veuillez vous connecter pour voir vos équipes.</p>
        </>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Êtes-vous sûr de vouloir supprimer {selectedMember?.first_name} {selectedMember?.last_name} ?</h2>
            <div className="modal-actions">
              <button className="cancel-button" onClick={handleCancelDelete}>Annuler</button>
              <button className="confirm-button" onClick={handleConfirmDelete}>Oui, supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
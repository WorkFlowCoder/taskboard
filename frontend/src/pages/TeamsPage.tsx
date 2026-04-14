import React, { useEffect, useState } from 'react';
import { deleteBoardMember, updateMemberRole, fetchUserBoardsWithMembers } from '../services/memberService';
import './TeamsPage.css';
import { useAuth } from '../components/AuthContext';
import type { Board } from '../types/Objects';

const TeamsPage: React.FC = () => {
  const {authToken, isAuthenticated} = useAuth(); // Use the token from AuthContext
  const [boards, setBoards] = useState<Board[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{ board_id: number; user_id: number; first_name: string; last_name: string } | null>(null);
  const [editingRole, setEditingRole] = useState<{ board_id: number; user_id: number; role: string } | null>(null);

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

  const handleEditRoleClick = (board_id: number, user_id: number, role: string) => {
    setEditingRole({ board_id, user_id, role });
  };

  const handleRoleChange = (newRole: string) => {
    if (editingRole) {
      setEditingRole((prev) => prev ? { ...prev, role: newRole } : null);
    }
  };

  const handleCancelEdit = () => {
    setEditingRole(null);
  };

  const handleSaveRole = async () => {
    if (editingRole) {
      try {
        if (!isAuthenticated) throw new Error('Utilisateur non authentifié.');
        await updateMemberRole(editingRole.board_id, editingRole.user_id, editingRole.role, authToken);

        // If the role was changed to 'owner', refresh the boards data
        if (editingRole.role === 'owner') {
          const updatedBoards = await fetchUserBoardsWithMembers(authToken);
          setBoards(updatedBoards);
          setEditingRole(null);
          return;
        }

        // Update the role in the local state
        setBoards((prevBoards) =>
          prevBoards.map((board) =>
            board.board_id === editingRole.board_id
              ? {
                  ...board,
                  members: board.members.map((member) =>
                    member.user_id === editingRole.user_id
                      ? { ...member, role: editingRole.role }
                      : member
                  ),
              }
              : board
          )
        );
        setEditingRole(null);
      } catch (error) {
        console.error('Erreur lors de la mise à jour du rôle :', error);
      }
    }
  };

  const handleDeleteMember = (board_id: number, user_id: number, first_name: string, last_name: string) => {
    handleDeleteClick({ board_id, user_id, first_name, last_name });
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
                        <td className="role">
                          {editingRole && editingRole.user_id === member.user_id && editingRole.board_id === board.board_id ? (
                            <select
                              value={editingRole.role}
                              onChange={(e) => handleRoleChange(e.target.value)}
                            >
                              <option value="member">Membre</option>
                              <option value="admin">Admin</option>
                              {board.owner_id === board.requester_user_id && <option value="owner">Propriétaire</option>}
                            </select>
                          ) : (
                            <span>{board.owner_id === member.user_id ? 'Propriétaire' : member.role}</span>
                          )}
                        </td>
                        {board.requester_role === 'admin' && board.owner_id !== member.user_id && (
                          (board.owner_id === board.requester_user_id || member.role !== 'admin') && (
                            <td className="actions-column">
                              {editingRole && editingRole.user_id === member.user_id && editingRole.board_id === board.board_id ? (
                                <>
                                  <button
                                    className="cancel-edit-button"
                                    onClick={handleCancelEdit}
                                  >
                                    Annuler
                                  </button>
                                  <button
                                    className="save-role-button"
                                    onClick={handleSaveRole}
                                  >
                                    Sauvegarder
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="edit-role-button"
                                    onClick={() => handleEditRoleClick(board.board_id, member.user_id, member.role)}
                                    disabled={member.user_id === board.requester_user_id}
                                  >
                                    Modifier Rôle
                                  </button>
                                  <button
                                    className="delete-user-button"
                                    onClick={() => handleDeleteMember(board.board_id, member.user_id, member.first_name, member.last_name)}
                                  >
                                    Supprimer
                                  </button>
                                </>
                              )}
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
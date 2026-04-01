-- Users
INSERT INTO users (first_name,last_name,email,password)
VALUES ('Doe', 'John', 'john@example.com', 'hash');

-- Boards
INSERT INTO boards (title, user_id)
VALUES ('Projet Trello', 1);

-- Memberships
INSERT INTO board_members (board_id, user_id, role)
VALUES (1, 1, 'admin');

-- Lists
INSERT INTO lists (title, position, board_id)
VALUES ('To Do', 1, 1);

-- Cards
INSERT INTO cards (title, position, list_id)
VALUES ('Créer API', 0, 1);

-- Labels
INSERT INTO labels (title, color, board_id)
VALUES ('Bug', '#FF0000', 1);

-- Assign labels
INSERT INTO card_labels (card_id, label_id)
VALUES (1, 1);

-- Assign users
INSERT INTO card_members (card_id, user_id)
VALUES (1, 1);

-- Comments
INSERT INTO comments (content, user_id, card_id)
VALUES ('Premier commentaire', 1, 1);

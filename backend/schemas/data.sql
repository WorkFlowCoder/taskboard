-- User
INSERT INTO user (first_name,last_name,email,password)
VALUES ('Doe', 'John', 'john@example.com', 'hash');

-- Board
INSERT INTO board (title, user_id)
VALUES ('Projet Trello', 1);

-- Membership
INSERT INTO board_member (board_id, user_id, role)
VALUES (1, 1, 'admin');

-- List
INSERT INTO list (title, position, board_id)
VALUES ('To Do', 1, 1);

-- Card
INSERT INTO card (title, position, list_id)
VALUES ('Créer API', 0, 1);

-- Label
INSERT INTO label (title, color, board_id)
VALUES ('Bug', '#FF0000', 1);

-- Assign label
INSERT INTO card_label (card_id, label_id)
VALUES (1, 1);

-- Assign user
INSERT INTO card_member (card_id, user_id)
VALUES (1, 1);

-- Comment
INSERT INTO comment (content, user_id, card_id)
VALUES ('Premier commentaire', 1, 1);

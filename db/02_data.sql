-- Users
INSERT INTO users (first_name, last_name, email, password)
VALUES 
    ('John', 'Doe', 'johnDoe@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$qZXSuhcCAGDs/T+HcK6V8g$RpnlqmxQ5MZp2cQwQOjynBEQBOmhEv1VCqwo5/az0uA');
-- mot de passe : @JohnDoe35fr

-- Boards
INSERT INTO boards (title, user_id)
VALUES 
    ('Projet Trello', 1);

-- Memberships
INSERT INTO board_members (board_id, user_id, role)
VALUES 
    (1, 1, 'admin');

-- Lists
INSERT INTO lists (title, position, board_id)
VALUES 
    ('To', 0, 1),
    ('Do', 1, 1),
    ('Done', 2, 1);

-- Cards
INSERT INTO cards (title, position, list_id)
VALUES 
    ('Créer API', 0, 1),
    ('Creation DB', 1, 1),
    ('Mise en place du docker', 0, 2),
    ('R&D du projet', 0, 3);

-- Labels
INSERT INTO labels (title, color, board_id)
VALUES 
    ('Bug', '#FF0000', 1),
    ('REVIEW', '#f3bf50', 1);

-- Assign labels
INSERT INTO card_labels (card_id, label_id)
VALUES 
    (1, 1),
    (2, 1),
    (3, 2),
    (4, 2);

-- Assign users
INSERT INTO card_members (card_id, user_id)
VALUES 
    (1, 1);

-- Comments
INSERT INTO comments (content, user_id, card_id)
VALUES 
    ('Utilisation d''une IA à prévoir ?', 1, 1),
    ('Je ne pense pas que cela soit pour tout de suite', 1, 1),
    ('Je m''occupe de la creation de la DB', 1, 2),
    ('Enfin la fin de la lecture !', 1, 4);

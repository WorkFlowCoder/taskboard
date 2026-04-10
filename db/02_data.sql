-- =========================================
-- RESET (optionnel)
-- =========================================
TRUNCATE comments, card_members, card_labels, labels, cards, lists, board_members, boards, users RESTART IDENTITY CASCADE;


-- =========================================
-- USERS (50 utilisateurs réalistes)
-- =========================================
INSERT INTO users (first_name, last_name, email, password)
SELECT
    fn,
    ln,
    LOWER(fn || '.' || ln || id || '@gmail.com'),
    '$argon2id$v=19$m=65536,t=3,p=4$qZXSuhcCAGDs/T+HcK6V8g$RpnlqmxQ5MZp2cQwQOjynBEQBOmhEv1VCqwo5/az0uA'
FROM (
    SELECT
        gs AS id,
        (ARRAY[
            'Lucas','Hugo','Emma','Léa','Chloé','Louis','Nathan','Jules','Manon','Camille',
            'Paul','Inès','Sarah','Tom','Noah','Clara','Julien','Eva','Adam','Lisa'
        ])[ (random()*19+1)::int ] AS fn,
        (ARRAY[
            'Martin','Bernard','Dubois','Thomas','Robert','Richard','Petit','Durand','Leroy','Moreau',
            'Simon','Laurent','Lefebvre','Michel','Garcia','David','Bertrand','Roux','Vincent','Fournier'
        ])[ (random()*19+1)::int ] AS ln
    FROM generate_series(1, 50) AS gs
) t;


-- =========================================
-- BOARDS (1 board par user MIN)
-- =========================================
INSERT INTO boards (title, description, user_id)
SELECT
    'Board de ' || first_name,
    'Projet de ' || first_name || ' ' || last_name,
    user_id
FROM users;


-- =========================================
-- + BOARDS SUPPLÉMENTAIRES (optionnel)
-- =========================================
INSERT INTO boards (title, description, user_id)
SELECT
    'Projet ' || gs,
    'Projet collaboratif ' || gs,
    ((gs - 1) % 50) + 1
FROM generate_series(1, 20) gs;


-- =========================================
-- BOARD MEMBERS
-- Chaque user :
--  - admin de SON board
--  - membre d'au moins 1 autre board
-- =========================================

-- Admin (propriétaire)
INSERT INTO board_members (board_id, user_id, role)
SELECT board_id, user_id, 'admin'
FROM boards;


-- Participation minimale (chaque user dans 1 autre board)
INSERT INTO board_members (board_id, user_id, role)
SELECT
    ((u.user_id % (SELECT COUNT(*) FROM boards)) + 1),
    u.user_id,
    'member'
FROM users u;


-- Membres supplémentaires (3 à 10 par board)
INSERT INTO board_members (board_id, user_id, role)
SELECT
    b.board_id,
    ((b.board_id * 7 + gs) % 50) + 1,
    'member'
FROM boards b
CROSS JOIN LATERAL generate_series(
    1,
    FLOOR(random() * 8 + 3)::INT
) gs;


-- =========================================
-- LISTS (3 à 10 par board)
-- =========================================
INSERT INTO lists (title, position, board_id)
SELECT
    'Liste ' || gs,
    gs - 1,
    b.board_id
FROM boards b
CROSS JOIN LATERAL generate_series(
    1,
    FLOOR(random() * 8 + 3)::INT
) gs;


-- =========================================
-- CARDS (10 à 30 par liste)
-- =========================================
INSERT INTO cards (title, description, position, list_id)
SELECT
    'Tâche ' || gs,
    'Description détaillée de la tâche ' || gs,
    gs - 1,
    l.list_id
FROM lists l
CROSS JOIN LATERAL generate_series(
    1,
    FLOOR(random() * 21 + 10)::INT
) gs;


-- =========================================
-- LABELS (1 à 3 par board)
-- =========================================
INSERT INTO labels (title, color, board_id)
SELECT
    (ARRAY['Bug','Feature','Review'])[gs],
    (ARRAY['#FF0000','#00FF00','#FFFF00'])[gs],
    b.board_id
FROM boards b
CROSS JOIN LATERAL generate_series(
    1,
    FLOOR(random() * 3 + 1)::INT
) gs;


-- =========================================
-- CARD_LABELS (1 label par carte)
-- =========================================
INSERT INTO card_labels (card_id, label_id)
SELECT
    c.card_id,
    (
        SELECT l.label_id
        FROM labels l
        JOIN lists li ON li.board_id = l.board_id
        WHERE li.list_id = c.list_id
        ORDER BY random()
        LIMIT 1
    )
FROM cards c;


-- =========================================
-- CARD MEMBERS (1 à 3 users par carte)
-- =========================================
INSERT INTO card_members (card_id, user_id)
SELECT
    c.card_id,
    ((c.card_id + gs) % 50) + 1
FROM cards c
CROSS JOIN LATERAL generate_series(
    1,
    FLOOR(random() * 3 + 1)::INT
) gs;


-- =========================================
-- COMMENTS (7 à 12 par carte)
-- =========================================
INSERT INTO comments (content, user_id, card_id)
SELECT
    'Commentaire #' || gs || ' sur carte ' || c.card_id,
    ((c.card_id + gs) % 50) + 1,
    c.card_id
FROM cards c
CROSS JOIN LATERAL generate_series(
    7,
    FLOOR(random() * 6 + 7)::INT
) gs;
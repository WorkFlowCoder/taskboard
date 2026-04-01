-- USERS
CREATE TABLE users (
	user_id SERIAL PRIMARY KEY,
	first_name VARCHAR(100) NOT NULL,
	last_name VARCHAR(100) NOT NULL,
	email VARCHAR(255) UNIQUE NOT NULL,
	password TEXT NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BOARDS
CREATE TABLE boards (
	board_id SERIAL PRIMARY KEY,
	title VARCHAR(255) NOT NULL,
	description TEXT,
	user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BOARD MEMBERS
CREATE TABLE board_members (
	board_member_id SERIAL PRIMARY KEY,
	board_id INT REFERENCES boards(board_id) ON DELETE CASCADE,
	user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
	role VARCHAR(20) CHECK (role IN ('admin','member'))
);

-- LISTS
CREATE TABLE lists (
	list_id SERIAL PRIMARY KEY,
	title VARCHAR(255) NOT NULL,
	color VARCHAR(20),
	position INT NOT NULL,
	board_id INT REFERENCES boards(board_id) ON DELETE CASCADE
);

-- CARDS
CREATE TABLE cards (
	card_id SERIAL PRIMARY KEY,
	title VARCHAR(255),
	description TEXT,
	position INT NOT NULL,
	list_id INT REFERENCES lists(list_id) ON DELETE CASCADE,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- COMMENTS
CREATE TABLE comments (
	comment_id SERIAL PRIMARY KEY,
	content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
	card_id INT REFERENCES cards(card_id) ON DELETE CASCADE
);

-- LABELS
CREATE TABLE labels (
	label_id SERIAL PRIMARY KEY,
	title VARCHAR(200) NOT NULL,
	color VARCHAR(20),
	board_id INT REFERENCES boards(board_id) ON DELETE CASCADE,
	UNIQUE(board_id, title)
);

-- CARD_LABELS
CREATE TABLE card_labels (
	card_id INT REFERENCES cards(card_id) ON DELETE CASCADE,
	label_id INT REFERENCES labels(label_id) ON DELETE CASCADE,
	PRIMARY KEY (card_id, label_id)
);

-- CARD_MEMBERS
CREATE TABLE card_members (
        card_id INT REFERENCES cards(card_id) ON DELETE CASCADE,
        user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
        PRIMARY KEY (card_id, user_id)
);

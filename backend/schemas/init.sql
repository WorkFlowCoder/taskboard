-- USERS
CREATE TABLE user (
	user_id SERIAL PRIMARY KEY,
	first_name VARCHAR(100) NOT NULL,
	last_name VARCHAR(100) NOT NULL,
	email VARCHAR(255) UNIQUE NOT NULL,
	password TEXT NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BOARDS
CREATE TABLE board (
	board_id SERIAL PRIMARY KEY,
	title VARCHAR(255) NOT NULL,
	description TEXT,
	user_id INT REFERENCES user(user_id) ON DELETE CASCADE,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BOARD MEMBER
CREATE TABLE board_member (
	board_member_id SERIAL PRIMARY KEY,
	board_id INT REFERENCES board(board_id) ON DELETE CASCADE,
	user_id INT REFERENCES user(user_id) ON DELETE CASCADE,
	role CARCHAR(20) CHECK (role IN ('admin','member'))
);

-- LIST
CREATE TABLE list (
	list_id SERIAL PRIMARY KEY,
	title VARCHAR(255) NOT NULL,
	color VARCHAR(20),
	position INT NOT NULL,
	board_id INT REFERENCES board(board_id) ON DELETE CASCADE
);

-- CARD
CREATE TABLE card (
	card_id SERIAL PRIMARY KEY,
	title VARCHAR(255),
	description TEXT,
	position INT NOT NULL,
	list_id INT REFERENCES list(list_id) ON DELETE CASCADE,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- COMMENT
CREATE TABLE comment (
	comment_id SERIAL PRIMARY KEY,
	content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	user_id INT REFERENCES user(user_id) ON DELETE CASCADE,
	card_id INT REFERENCES card(card_id) ON DELETE CASCADE
);

-- LABEL
CREATE TABLE label (
	label_id SERIAL PRIMARY KEY,
	title VARCHAR(200) NOT NULL,
	color VARCHAR(20),
	board_id INT REFERENCES board(board_id) ON DELETE CASCADE,
	UNIQUE(board_id, title)
);

-- CARD_LABEL
CREATE TABLE card_label (
	card_id INT REFERENCES card(card_id) ON DELETE CASCADE,
	label_id INT REFERENCES label(label_id) ON DELETE CASCADE,
	PRIMARY KEY (card_id, label_id)
);

-- CARD_MEMBER
CREATE TABLE card_member (
        card_id INT REFERENCES card(card_id) ON DELETE CASCADE,
        user_id INT REFERENCES user(user_id) ON DELETE CASCADE,
        PRIMARY KEY (card_id, user_id)
);

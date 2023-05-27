CREATE DATABASE artifeed;
USE artifeed;

CREATE TABLE User(
	user_id INTEGER unsigned NOT NULL AUTO_INCREMENT,
    email VARCHAR(64) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    first_name VARCHAR(32) NOT NULL,
    last_name VARCHAR(32) NOT NULL,
    username VARCHAR(30) UNIQUE,
    description VARCHAR(200),
    image_url VARCHAR(200),
    refreshToken VARCHAR(1024),
    PRIMARY KEY(user_id)
);

CREATE TABLE Category(
	category_id INTEGER unsigned NOT NULL AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL,
    PRIMARY KEY(category_id)
);

CREATE TABLE Article(
	article_id INTEGER unsigned NOT NULL AUTO_INCREMENT,
    author_id INTEGER unsigned NOT NULL,
    title VARCHAR(250) NOT NULL,
    category_id INTEGER unsigned NOT NULL,
    featured_image VARCHAR(200),
	content TEXT NOT NULL, /*65535 characters*/
    description VARCHAR(200) NOT NULL,
    permalink VARCHAR(200) NOT NULL UNIQUE,
    publish_date DATE NOT NULL DEFAULT(CURRENT_DATE),
    PRIMARY KEY(article_id),
    FOREIGN KEY (author_id) REFERENCES User(user_id),
    FOREIGN KEY (category_id) REFERENCES Category(category_id)
);

CREATE TABLE ArticleView(
	article_id INTEGER unsigned NOT NULL,
    date DATE NOT NULL DEFAULT(CURRENT_DATE),
    view_count INTEGER unsigned NOT NULL,
    PRIMARY KEY(article_id, date),
    FOREIGN KEY (article_id) REFERENCES Article(article_id)
);

CREATE TABLE ArticleLike(
	user_id INTEGER unsigned NOT NULL,
	article_id INTEGER unsigned NOT NULL,
    PRIMARY KEY(user_id, article_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (article_id) REFERENCES Article(article_id)
);


---- Insert the categories ----
INSERT INTO Category(name) VALUES('Music'), ('Fashion'),
('Travel'), ('Design'), ('Food'), ('Photography'), ('Finance'),
('Health'), ('Technology'), ('Programming'), ('History'), ('Marketing'), ('Lifestyle'),
('Fitness'), ('Education'), ('Science'), ('Entertainment'),
('Sports'), ('Social Media'), ('Nature'),
('Gaming'), ('Vehicle'), ('Animal'), ('Political'), ('Advice'), ('Other');


---- Publish article ----
--INSERT INTO Article(author_id, title, category_id, featured_image, content, description, permalink)
--VALUES (?, ?, ?, ?, ?, ?, ?);
---- Example ----
--INSERT INTO Article(author_id, title, category_id, featured_image, content, description, permalink, publish_date)
--VALUES (1, "lorem ipsum", 23, "https://example.com/image.png", "This is test content.", "This is test description.", "test-permalink-2", "2022-05-20");

---- Table to store removed articles for reporting of illegal/copyrighted/abusive contents ----
CREATE TABLE RemovedArticle(
	article_id INTEGER unsigned NOT NULL,
    author_id INTEGER unsigned NOT NULL,
    title VARCHAR(250) NOT NULL,
    featured_image VARCHAR(200),
	content TEXT NOT NULL,
    description VARCHAR(200) NOT NULL,
    publish_date DATE NOT NULL DEFAULT(CURRENT_DATE),
    PRIMARY KEY(article_id),
    FOREIGN KEY (author_id) REFERENCES User(user_id)
);

---- Trigger to store deleted article information in RemovedArticle table ----
drop trigger if exists TG_DeletedArticleInfoStorage;
DELIMITER $$
CREATE TRIGGER DeletedArticleInfo
    AFTER DELETE ON Article
    FOR EACH ROW
BEGIN
	INSERT INTO RemovedArticle(article_id, author_id, title, featured_image, content, description, publish_date)
    VALUES (OLD.article_id, OLD.author_id, OLD.title, OLD.featured_image,
    OLD.content, OLD.description, OLD.publish_date);
END $$
DELIMITER ;

---- Register user ----
DROP PROCEDURE IF EXISTS RegisterUser;
DELIMITER $$
CREATE PROCEDURE RegisterUser(
IN in_email VARCHAR(64), IN password VARCHAR(100), IN first_name VARCHAR(32),
IN last_name VARCHAR(32), IN in_username VARCHAR(50), IN image_url VARCHAR(200),
OUT success Integer, OUT user_id INTEGER, OUT message VARCHAR(255)
)
BEGIN
	DECLARE email_count INTEGER;
	DECLARE username_count INTEGER;
    DECLARE updated_username VARCHAR(50);

    SELECT count(*) INTO email_count
    FROM User
    WHERE email = in_email;

    IF email_count = 0 THEN
        SELECT count(*) INTO username_count
		FROM User
		WHERE username = in_username OR
		username LIKE CONCAT(in_username, '\_%');
		
		IF username_count > 0 THEN
		SET updated_username = CONCAT(in_username, '_', (100 + username_count));
		ELSE
		SET updated_username = in_username;
		END IF;
        
		INSERT INTO User(`email`, `password`, `first_name`, `last_name`, `username`, `image_url`)
		VALUES (in_email, password, first_name, last_name, updated_username, image_url);
        
		SELECT User.user_id INTO user_id
        FROM User
        WHERE email = in_email;
		SET success = 1;
		SET message = "Registration Successful";
    ELSE
		SET success = 0;
		SET message = "Email is already registered. Please use another email address.";
		SET user_id = -1;
    END IF;
    
    SELECT success, user_id, message;
END $$
DELIMITER ;

---- Get article contents along with information that the user has liked it or not ----
SELECT a.article_id, a.author_id, title, content, CONCAT(u.first_name, ' ', u.last_name) as author_name,
COUNT(l.user_id) as total_likes, u.description as author_description, u.image_url as author_image_url,
EXISTS(SELECT * from ArticleLike WHERE user_id=1 AND article_id IN (
	SELECT article_id FROM Article WHERE permalink="test-permalink"
)) as liked
FROM Article AS a
INNER JOIN User AS u ON a.author_id = u.user_id
LEFT JOIN ArticleLike as l ON a.article_id = l.article_id
WHERE permalink="test-permalink";

---- Article details with total views in corresponding article ----
CREATE OR REPLACE VIEW ArticleDetailWithView AS
SELECT a.article_id, a.author_id, CONCAT(first_name, ' ', last_name) as author_name, title, featured_image, permalink, publish_date,
a.description as article_description, c.category_id, c.name as category_name, SUM(v.view_count) as view_count
FROM Article AS a
INNER JOIN User AS u ON a.author_id = u.user_id
INNER JOIN Category AS c ON a.category_id = c.category_id
LEFT JOIN ArticleView AS v ON a.article_id = v.article_id
GROUP BY a.article_id;

---- Article details with total likes in corresponding article ----
CREATE OR REPLACE VIEW ArticleDetailWithLike AS
SELECT a.article_id, a.author_id, CONCAT(first_name, ' ', last_name) as author_name, title, featured_image, permalink, publish_date,
a.description as article_description, c.category_id, c.name as category_name, COUNT(DISTINCT l.user_id) as like_count
FROM Article AS a
INNER JOIN User AS u ON a.author_id = u.user_id
INNER JOIN Category AS c ON a.category_id = c.category_id
LEFT JOIN ArticleLike AS l ON a.article_id = l.article_id
GROUP BY a.article_id;

---- Article details with total views and total likes in that article ----
CREATE OR REPLACE VIEW FullArticleDetail AS
SELECT v.article_id, v.author_id, v.author_name, v.title, v.featured_image,
v.permalink, v.publish_date, v.article_description, v.category_id, v.category_name, like_count, view_count
FROM ArticleDetailWithView AS v
INNER JOIN ArticleDetailWithLike AS l
ON v.article_id = l.article_id
ORDER BY publish_date DESC, article_id DESC;


---- Filter my articles ----
--SELECT *
--FROM FullArticleDetail
--WHERE author_id=1 AND (title LIKE "%design%" OR description LIKE "%design%" OR category_name LIKE "%design%")
--AND category_id=23
--ORDER BY publish_date ASC, article_id ASC;

---- Filter all articles (in search page) ----
--SELECT *
--FROM FullArticleDetail
--WHERE (title LIKE "%design%" OR description LIKE "%design%" OR category_name LIKE "%design%")
--AND category_id=23
--ORDER BY publish_date ASC, article_id ASC;

---- Increment the view count ----
--INSERT INTO ArticleView (article_id, date, view_count)
--VALUES(8, CURRENT_DATE(), 1)
--ON DUPLICATE KEY
--UPDATE view_count = view_count + 1;

---- For showing trending articles ----
--SELECT *
--FROM ArticleDetailWithView
--WHERE publish_date >= DATE(NOW() - INTERVAL 7 DAY)
--ORDER BY view_count DESC
--LIMIT 5;

---- For showing trending articles ----
--SELECT *
--FROM ArticleDetailWithView
--ORDER BY view_count DESC
--LIMIT 5;

---- For showing more articles from Artifeed(in 'read' page) ----
--SELECT *
--FROM FullArticleDetail
--WHERE author_id<>1
--ORDER BY like_count DESC, view_count DESC
--LIMIT 5;

---- For showing other articles from author ----
--SELECT article_id, title, permalink, featured_image
--FROM FullArticleDetail
--WHERE article_id<>8 AND author_id=1
--ORDER BY like_count DESC, view_count DESC
--LIMIT 5;


---- Function to delete article ----
DROP FUNCTION IF EXISTS Fn_DeleteArticle;
delimiter $$
CREATE function Fn_DeleteArticle(uid INTEGER, aid INTEGER)
returns VARCHAR(10)
DETERMINISTIC
BEGIN
	DECLARE art_count INT;
    DECLARE output VARCHAR(10) DEFAULT "failure";
    SELECT COUNT(*) INTO art_count
    FROM Article
	WHERE author_id = uid AND article_id = aid;
    
    IF art_count = 1 THEN
		DELETE FROM ArticleLike
		WHERE article_id = aid;
		DELETE FROM ArticleView
		WHERE article_id = aid;
		DELETE FROM Article
		WHERE author_id = uid AND article_id = aid;

		SET output = "success";
	END IF;
    
    return output;
END $$
delimiter ;

--SELECT Fn_DeleteArticle(1, 9);




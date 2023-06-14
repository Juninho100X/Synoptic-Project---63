ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
flush privileges;
SET SQL_SAFE_UPDATES = 0;

create database userdb;
use userdb;

drop database userdb;

create table Forum (
    uniqueId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	title VARCHAR(100),
	content VARCHAR(500),
    username VARCHAR(45),
    FOREIGN KEY (username) REFERENCES logininfo(username)
);

drop table Forum;

create table Replies (
    uniqueId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    replyTo INT,
    FOREIGN KEY (replyTo) REFERENCES Forum(uniqueId),
	title VARCHAR(100),
	content VARCHAR(500),
    username VARCHAR(45),
    FOREIGN KEY (username) REFERENCES logininfo(username)
);

drop table Replies;

create table logininfo (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(45) NOT NULL UNIQUE KEY,
    userpassword VARCHAR(128),
    adminbool BOOLEAN
);

drop table logininfo;

insert into logininfo(username, userpassword, adminbool) 
values  ("admin", "e52b8910d3dd2b91e6981a5b0df632b7", true),
		("workerjoe", "e04efcfda166ec49ba7af5092877030e", false); 
        
TRUNCATE TABLE logininfo;
        
        
select * from logininfo where username = "admin" and userpassword = "e52b8910d3dd2b91e6981a5b0df632b7";      

select * from logininfo;  

insert into forum(title, content, username) values ("HOW I SOLD MY MUM","it was ez","workerjoe" ), ("Heroes - David Bowie", 
    "I.... I WISH YOU COULD SWIM, LIKE THE DOLPHINS.... LIKE DOLPHINS CAN SWIM. THOUGH NOTHING THOUGH NOTHING WILL KEEP US TOGETHER. WE CAN BEAT THEM FOREVER AND EVER WE CAN BE HEROES JUST FOR ONE DAY.",
    "admin");

insert into Replies(title, content, username, replyTo) values ("ur stupid", "reasons ur stupd. 1: ur cute.", "admin", 3);

select * from forum;
drop table forum;

select * from replies;

select * from replies where title = "ur stupid";

select * from logininfo;

create table foodBank(
   	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(45) NOT NULL UNIQUE KEY,
    x int,
    y int
);

drop table foodBank;

insert into foodBank(name, x, y) values ("Govan Food Bank", 10, 15);
insert into foodBank(name, x, y) values ("All Saints Church Food Bank", 25, 30);
insert into foodBank(name, x, y) values ("Govan Community Center Food Bank", -10, 20);
insert into foodBank(name, x, y) values ("The Govan Pantry", 20, 10);

select * from foodBank;

select name from foodBank;

create table stock(
   	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(45) NOT NULL ,
    foodBankID INT,
    FOREIGN KEY (foodBankID) references foodBank(id),
    quantity int
);

drop table stock;

insert into stock(name, quantity, foodBankID) values ("Potato", 12, 1);
insert into stock(name, quantity, foodBankID) values ("cheese", 14, 1);
insert into stock(name, quantity, foodBankID) values ("Potato", 22, 2);
insert into stock(name, quantity, foodBankID) values ("Rice", 10, 3);
insert into stock(name, quantity, foodBankID) values ("Rice", 10, 2);
insert into stock(name, quantity, foodBankID) values ("Rice", 10, 1);

insert into stock(name, quantity, foodBankID) values ("Rice", 25, 4);
insert into stock(name, quantity, foodBankID) values ("pasta", 15, 4);
insert into stock(name, quantity, foodBankID) values ("Carrots", 5, 4);
insert into stock(name, quantity, foodBankID) values ("Apples", 20, 3);

drop table stock;

select * from stock;

SELECT foodBank.name, stock.name, stock.quantity from stock INNER JOIN foodBank on stock.foodBankID=foodBank.id;

SELECT foodBank.name, stock.name, stock.quantity from stock INNER JOIN foodBank on stock.foodBankID=foodBank.id where foodBank.name = "Govan Food Bank";

SELECT foodBank.name, foodBank.x, foodBank.y from foodBank;

drop table stock;

create table categories(
	category VARCHAR(128) NOT NULL PRIMARY KEY
);

insert into categories(category)
values  ("Food"), 
		("Drinks"),
		("Extras");

create table product(
	productId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(128) NOT NULL,
	category VARCHAR(128),
    ageRestricted BOOL,
    price DECIMAL(10, 2) NOT NULL,
    twoForOne BOOL DEFAULT false,
    percentOff int DEFAULT 0
);

insert into product(name, category, ageRestricted, price) 
values  ("Sausage Roll", "Food", false, 1.3),
        ("Cake", "Food", false, 1.1),
        ("Fish", "Food", false, 1.1),
        ("Hot Chocolate", "Drinks", false, 5.2),
        ("Coffee", "Drinks", false, 33),
        ("Wine", "Extras", true, 2.3);
        
insert into product(name, category, ageRestricted, price, twoForOne, percentOff)
values ("Cheap Meat", "Extras", false, 1.0, false, 50),
       ("Two for one", "Extras", false, 1.0, true, 0);

select * from product;

UPDATE product SET twoForOne = 0 WHERE name = "Cheap Meat";

create table shoppingbasket(
	shoppingItemId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    productId INT NOT NULL,
	name VARCHAR(128),
	category VARCHAR(128),
    ageRestricted BOOLEAN,
    price DECIMAL(10,2)  NOT NULL,
	twoForOne BOOL DEFAULT false,
    percentOff int DEFAULT 0
);

create table transactions(
     transactionId int not null AUTO_INCREMENT PRIMARY KEY
);

drop table transactions;

insert into transactions values();

create table pastTransactions( 
    transactionId int not null default 0,
    shoppingItemId INT NOT NULL,
    productId INT NOT NULL,
    name VARCHAR(128),
	category VARCHAR(128),
    ageRestricted BOOLEAN,
	price DECIMAL(10, 2) NOT NULL,
	twoForOne BOOL DEFAULT false,
    percentOff int DEFAULT 0
);

SELECT name, price, COUNT(*) as count FROM pastTransactions GROUP BY name, price order by count;
SELECT SUM(price) AS totalPrice FROM pastTransactions;


SELECT SUM(price) AS totalPrice FROM shoppingbasket;

INSERT INTO shoppingbasket(productId, name, ageRestricted, price) values (1, "hi robin", false, 2.00);
INSERT INTO shoppingbasket(productId, name, category, ageRestricted, price, twoForOne, percentOFf) SELECT * FROM product WHERE name = "Fish";

INSERT INTO pastTransactions(transactionId) SELECT * from transactions;

-- Add shopping basket to past transactions. Update the next transactionId. update default transactionId's to new one so they may be grouped. 
INSERT INTO pastTransactions(shoppingItemId, productId, name, category, ageRestricted, price, twoForOne, percentOFf) SELECT * FROM shoppingbasket;

INSERT INTO pastTransactions(shoppingItemId, productId, name, category, ageRestricted, price, twoForOne, percentOFf) values(999, 999, "refund", "Extras", 0, -20, 0, 0);

insert into transactions values();
update pastTransactions SET transactionId = (SELECT transactionId FROM transactions ORDER BY transactionId DESC LIMIT 1) where transactionId = 0;

select * from pastTransactions;
select * from transactions;

drop table pastTransactions;

select * from shoppingbasket;
delete from shoppingbasket order by shoppingItemId desc limit 1;

SELECT COUNT(productId) AS numOfProduct FROM shoppingbasket WHERE name = "Fish";

UPDATE shoppingbasket SET price = 0 ORDER BY shoppingItemID DESC LIMIT 1;

UPDATE shoppingbasket SET price = 20 ORDER BY shoppingItemID DESC LIMIT 1;

select * from product;
DELETE FROM product WHERE name = "23";

select * from categories;

DELETE FROM shoppingbasket;

drop table product;

drop table shoppingbasket;

drop table categories;

drop table pastTransactions;
DROP DATABASE IF EXISTS recipes_db;
CREATE DATABASE recipes_db;

Use recipes_db;
SELECT * FROM Users;
SELECT * FROM Recipes;
 
 alter table Users auto_increment = 4;

drop table Recipes;
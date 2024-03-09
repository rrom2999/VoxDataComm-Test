## Basic Guidelines

### Database
The API does not verify the existence of the tables (Users and Properties), it assumes that they already exist and that they already have all the columns defined. 
For this the query is available in ./Backend/assets/tables-creation.sql this will create both tables.

You also need a .env environment variables file in the ./Backend/ directory at the same level as app.js.
The following variables must exist in the .env: 
 - DB_HOST
 - DB_USER
 - DB_PASSWORD
 - DB_DATABASE

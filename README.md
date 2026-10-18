# MongoDB with ESlint and Zod
I found it more practical to reuse the library project created for the postgreSQL and make some modifications to it so it can run with Mongodb instead of postgreSQL.
  
Note: Make sure to install the packages for types for express: Bash: **npm install -D @types/express @types/node**\
Otherwise you will start getting type-error messages as soon as you rename the files from .js to .ts\
  
## Task 1 - Setup
- I adapted the old project files (.env, .env.examples, db.ts, schemas.ts, index.ts) to run using the mongodb settings. Tested that everything worked for CRUD operations following the video material.
- The connection string is inside src/db.ts and reads: const url = `mongodb://${env.MONGO_USER}:${env.MONGO_PASSWORD}@${env.MONGO_HOST}:${env.MONGO_PORT}/${env.MONGO_DB}?authSource=admin`;  
![Task-2](/images/get-items-test.png)  

## Task 2 - Assignments
1-3 done, but so much work to understand how this non-sql database model works. And so much hussle with copy/paste the long id:s for the different "tables". I'm sorry but I stick to my SQL (for better or worse).  
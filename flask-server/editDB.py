import duckdb

con = duckdb.connect("PBJ.duckdb")

def add_user(username, password):
    con.execute("""
        INSERT INTO users (username, password)
        VALUES (?, ?)
        """, (username, password))
    
def delete_user(username):
    con.execute("""
        DELETE FROM users
        WHERE username = ?
        """, (username,))

add_user('Niko', 'Ross')

con.sql("SELECT * FROM users").show()


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

def add_column(column_name, column_type):
    con.execute(f"""
        ALTER TABLE users
        ADD COLUMN {column_name} {column_type}
        """)
    
def delete_row(username):
    con.execute("""
        DELETE FROM users
        WHERE username = ?
        """, (username,))

def delete_null_users():
    con.execute("""
        DELETE FROM users
        WHERE username IS NULL
    """)

con.sql("SELECT * FROM users").show()


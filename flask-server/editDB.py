import duckdb

con = duckdb.connect("PBJ.duckdb")

def add_user(username, password):
    con.execute("""
        INSERT INTO users (username, password, End_Index)
        VALUES (?, ?, 0)
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

def edit_cell(username, column_name, new_value):
    con.execute(f"""
        UPDATE users
        SET {column_name} = ?
        WHERE username = ?
        """, (new_value, username))

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


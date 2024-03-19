import duckdb
import pandas

con = duckdb.connect("file.db")
# con.sql("CREATE TABLE integers (i INTEGER)")
# con.sql("INSERT INTO integers VALUES (40)")
con.sql("SELECT * FROM integers").show()


# my_df = pandas.DataFrame.from_dict({'a': [42]})

# # query the Pandas DataFrame "my_df"
# # Note: duckdb.sql connects to the default in-memory database connection
# results = duckdb.sql("SELECT * FROM my_df").df()
# print(results)
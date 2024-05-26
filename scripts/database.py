import psycopg2
from psycopg2 import sql
import csv

# Database connection parameters
dbname = "Telegram"
user = "postgres"
password = "123"  # Replace with your actual password
host = "localhost"
port = "5434"

# Function to execute SQL command
def execute_sql(conn, sql_command):
    try:
        cur = conn.cursor()
        cur.execute(sql_command)
        conn.commit()
        cur.close()
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Error executing SQL command: {e}")
        raise

# Function to import data from CSV
def import_data_from_csv(conn, table_name, file_path):
    try:
        # Open CSV file
        with open(file_path, 'r', encoding='utf-8') as f:
            # Create a cursor object using cursor() method
            cur = conn.cursor()
            # Skip the header row
            next(f)
            # Execute SQL COPY command
            cur.copy_expert(sql=f"COPY {table_name} FROM STDIN CSV HEADER", file=f)
            # Commit the transaction
            conn.commit()
            # Close the cursor
            cur.close()
            print(f"Data imported into table '{table_name}' successfully.")
    except Exception as e:
        conn.rollback()
        print(f"Error importing data into table '{table_name}': {e}")
        raise

try:
    # Connect to the PostgreSQL database
    conn = psycopg2.connect(dbname=dbname, user=user, password=password, host=host, port=port)
    print("Connected to the daatabase.")

    # Import data into google_play_reviews table
    import_data_from_csv(conn, 'google_play_reviews', r'C:\Users\ende\Desktop\10x\Week-4\Notebooks\GooglePlay.csv')

    # Import data into subscribers table
    import_data_from_csv(conn, 'subscribers', r'C:\Users\ende\Desktop\10x\Week-4\Notebooks\subscription_preprocessed.csv')

    # Import data into posts table
    import_data_from_csv(conn, 'posts', r'C:\Users\ende\Desktop\10x\Week-4\Notebooks\post.csv')

except psycopg2.Error as e:
    print(f"Error connecting to PostgreSQL: {e}")

finally:
    # Close database connection
    if conn is not None:
        conn.close()
        print("Database connection closed.")

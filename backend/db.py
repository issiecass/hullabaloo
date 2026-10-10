import os
import psycopg
from psycopg.rows import dict_row

DATABASE_URL = os.environ["DATABASE_URL_POOLED"]

def connect():
    # Neon's pooler runs PgBouncer in transaction mode, which can't keep server-side prepared statements.
    return psycopg.connect(DATABASE_URL, row_factory=dict_row, prepare_threshold=None)

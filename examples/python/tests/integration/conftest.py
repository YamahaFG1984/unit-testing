import os

import psycopg
import pytest

CONNECTION_STRING = os.environ.get(
    "CRM_DB_URL", "postgresql://crm:crm@localhost:54329/crm")


def pytest_collection_modifyitems(items):
    for item in items:
        if "integration" in str(item.fspath):
            item.add_marker(pytest.mark.integration)


@pytest.fixture(autouse=True)
def clear_database():
    """在每个测试「开始」时清理普通数据；不动参考数据 user_type（第 10 章）。"""
    with psycopg.connect(CONNECTION_STRING) as connection:
        connection.execute("DELETE FROM users")
        connection.execute("DELETE FROM company")

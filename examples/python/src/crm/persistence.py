"""受管依赖：应用自己的数据库。事务与仓储分开（第 10 章）。"""
from __future__ import annotations

import psycopg

from crm.domain import Company, User


class Transaction:
    """贯穿一次业务操作。commit() 只在成功时调用；退出时没提交就回滚。"""

    def __init__(self, connection_string: str) -> None:
        self.connection = psycopg.connect(connection_string)
        self._committed = False

    def commit(self) -> None:
        self._committed = True

    def close(self) -> None:
        if self._committed:
            self.connection.commit()
        else:
            self.connection.rollback()
        self.connection.close()

    def __enter__(self) -> "Transaction":
        return self

    def __exit__(self, *exc) -> None:
        self.close()


class UserRepository:
    def __init__(self, transaction: Transaction) -> None:
        self._connection = transaction.connection

    def get_user_by_id(self, user_id: int) -> tuple | None:
        return self._connection.execute(
            "SELECT user_id, email, type, is_email_confirmed FROM users WHERE user_id = %s",
            (user_id,),
        ).fetchone()

    def save_user(self, user: User) -> None:
        if user.user_id == 0:
            row = self._connection.execute(
                "INSERT INTO users (email, type, is_email_confirmed) "
                "VALUES (%s, %s, %s) RETURNING user_id",
                (user.email, user.type.value, user.is_email_confirmed),
            ).fetchone()
            user.user_id = row[0]
        else:
            self._connection.execute(
                "UPDATE users SET email = %s, type = %s, is_email_confirmed = %s "
                "WHERE user_id = %s",
                (user.email, user.type.value, user.is_email_confirmed, user.user_id),
            )


class CompanyRepository:
    def __init__(self, transaction: Transaction) -> None:
        self._connection = transaction.connection

    def get_company(self) -> tuple | None:
        return self._connection.execute(
            "SELECT domain_name, number_of_employees FROM company"
        ).fetchone()

    def save_company(self, company: Company) -> None:
        updated = self._connection.execute(
            "UPDATE company SET domain_name = %s, number_of_employees = %s",
            (company.domain_name, company.number_of_employees),
        ).rowcount
        if updated == 0:
            self._connection.execute(
                "INSERT INTO company (domain_name, number_of_employees) VALUES (%s, %s)",
                (company.domain_name, company.number_of_employees),
            )

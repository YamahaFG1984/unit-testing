"""集成测试里与业务无关的技术细节：造数据、执行、查询、断言（第 10 章）。"""
from __future__ import annotations

from typing import Callable

from crm.application import DomainLogger, MessageBus, UserController
from crm.domain import Company, CompanyFactory, User, UserFactory, UserType
from crm.persistence import CompanyRepository, Transaction, UserRepository

from .conftest import CONNECTION_STRING


# ---- 准备段：Object Mother ----
def create_user(email: str = "user@mycorp.com",
                user_type: UserType = UserType.EMPLOYEE,
                is_email_confirmed: bool = False) -> User:
    with Transaction(CONNECTION_STRING) as transaction:
        user = User(0, email, user_type, is_email_confirmed)
        UserRepository(transaction).save_user(user)
        transaction.commit()
        return user


def create_company(domain_name: str, number_of_employees: int) -> Company:
    with Transaction(CONNECTION_STRING) as transaction:
        company = Company(domain_name, number_of_employees)
        CompanyRepository(transaction).save_company(company)
        transaction.commit()
        return company


# ---- 执行段：装饰方法 ----
def execute(func: Callable[[UserController], str],
            message_bus: MessageBus, logger: DomainLogger) -> str:
    with Transaction(CONNECTION_STRING) as transaction:
        controller = UserController(transaction, message_bus, logger)
        return func(controller)


# ---- 断言段：重新查库 + 流式断言 ----
def query_user(user_id: int) -> User | None:
    with Transaction(CONNECTION_STRING) as transaction:
        data = UserRepository(transaction).get_user_by_id(user_id)
        return UserFactory.create(data) if data else None


def query_company() -> Company | None:
    with Transaction(CONNECTION_STRING) as transaction:
        data = CompanyRepository(transaction).get_company()
        return CompanyFactory.create(data) if data else None


class UserAssert:
    def __init__(self, user: User | None) -> None:
        self._user = user

    def should_exist(self) -> "UserAssert":
        assert self._user is not None
        return self

    def with_email(self, email: str) -> "UserAssert":
        assert self._user.email == email
        return self

    def with_type(self, user_type: UserType) -> "UserAssert":
        assert self._user.type == user_type
        return self


class CompanyAssert:
    def __init__(self, company: Company | None) -> None:
        self._company = company

    def should_exist(self) -> "CompanyAssert":
        assert self._company is not None
        return self

    def with_number_of_employees(self, number: int) -> "CompanyAssert":
        assert self._company.number_of_employees == number
        return self


class BusSpy:
    """手写的 Mock，站在系统的最边缘（第 9 章）。消息格式在这里独立地又写了一遍。"""

    def __init__(self) -> None:
        self._sent_messages: list[str] = []

    def send(self, message: str) -> None:
        self._sent_messages.append(message)

    def should_send_number_of_messages(self, number: int) -> "BusSpy":
        assert len(self._sent_messages) == number
        return self

    def with_email_changed_message(self, user_id: int, new_email: str) -> "BusSpy":
        message = f"Type: USER EMAIL CHANGED; Id: {user_id}; NewEmail: {new_email}"
        assert message in self._sent_messages
        return self

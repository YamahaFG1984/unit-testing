"""领域模型：只做决定，不碰任何进程外依赖（第 7 章）。"""
from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class Precondition:
    @staticmethod
    def requires(condition: bool) -> None:
        if not condition:
            raise RuntimeError("Precondition failed")


class UserType(Enum):
    CUSTOMER = 1
    EMPLOYEE = 2


@dataclass(frozen=True)
class EmailChangedEvent:
    user_id: int
    new_email: str


@dataclass(frozen=True)
class UserTypeChangedEvent:
    user_id: int
    old_type: UserType
    new_type: UserType


DomainEvent = EmailChangedEvent | UserTypeChangedEvent


class Company:
    def __init__(self, domain_name: str, number_of_employees: int) -> None:
        self.domain_name = domain_name
        self.number_of_employees = number_of_employees

    def change_number_of_employees(self, delta: int) -> None:
        Precondition.requires(self.number_of_employees + delta >= 0)
        self.number_of_employees += delta

    def is_email_corporate(self, email: str) -> bool:
        email_domain = email.split("@")[1]
        return email_domain == self.domain_name


class User:
    def __init__(self, user_id: int, email: str, user_type: UserType,
                 is_email_confirmed: bool) -> None:
        self.user_id = user_id
        self.email = email
        self.type = user_type
        self.is_email_confirmed = is_email_confirmed
        self.domain_events: list[DomainEvent] = []

    def can_change_email(self) -> str | None:
        if self.is_email_confirmed:
            return "Can't change a confirmed email"
        return None

    def change_email(self, new_email: str, company: Company) -> None:
        Precondition.requires(self.can_change_email() is None)

        if self.email == new_email:
            return

        new_type = (UserType.EMPLOYEE if company.is_email_corporate(new_email)
                    else UserType.CUSTOMER)

        if self.type != new_type:
            delta = 1 if new_type == UserType.EMPLOYEE else -1
            company.change_number_of_employees(delta)
            self.domain_events.append(
                UserTypeChangedEvent(self.user_id, self.type, new_type))

        self.email = new_email
        self.type = new_type
        self.domain_events.append(EmailChangedEvent(self.user_id, new_email))


class UserFactory:
    """把数据库里的一行还原成 User。没有协作者，可以直接做单元测试。"""

    @staticmethod
    def create(data: tuple) -> User:
        Precondition.requires(len(data) >= 4)
        return User(int(data[0]), str(data[1]), UserType(data[2]), bool(data[3]))


class CompanyFactory:
    @staticmethod
    def create(data: tuple) -> Company:
        Precondition.requires(len(data) >= 2)
        return Company(str(data[0]), int(data[1]))

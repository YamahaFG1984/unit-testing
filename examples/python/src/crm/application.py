"""应用服务层：只做编排（第 7、8、9 章）。"""
from __future__ import annotations

import logging
from typing import Protocol

from crm.domain import (CompanyFactory, DomainEvent, EmailChangedEvent, UserFactory,
                        UserType, UserTypeChangedEvent)
from crm.persistence import CompanyRepository, Transaction, UserRepository


class Bus(Protocol):
    """系统的最边缘：包在消息总线 SDK 外面的适配器。测试里只替换这一层（第 9 章）。"""

    def send(self, message: str) -> None: ...


class MessageBus:
    """领域消息。它决定发到总线上的文本长什么样。"""

    def __init__(self, bus: Bus) -> None:
        self._bus = bus

    def send_email_changed_message(self, user_id: int, new_email: str) -> None:
        self._bus.send(
            f"Type: USER EMAIL CHANGED; Id: {user_id}; NewEmail: {new_email}")


class DomainLogger:
    """支持日志：业务要求记录的事件，逐个列成方法（第 8 章）。"""

    def __init__(self, logger: logging.Logger) -> None:
        self._logger = logger

    def user_type_has_changed(self, user_id: int, old_type: UserType,
                              new_type: UserType) -> None:
        self._logger.info(
            "User %s changed type from %s to %s", user_id, old_type.name, new_type.name)


class EventDispatcher:
    """把领域事件翻译成对不受管依赖的调用。"""

    def __init__(self, message_bus: MessageBus, domain_logger: DomainLogger) -> None:
        self._message_bus = message_bus
        self._domain_logger = domain_logger

    def dispatch(self, events: list[DomainEvent]) -> None:
        for ev in events:
            match ev:
                case EmailChangedEvent():
                    self._message_bus.send_email_changed_message(ev.user_id, ev.new_email)
                case UserTypeChangedEvent():
                    self._domain_logger.user_type_has_changed(
                        ev.user_id, ev.old_type, ev.new_type)


class UserController:
    def __init__(self, transaction: Transaction, message_bus: MessageBus,
                 domain_logger: DomainLogger) -> None:
        self._transaction = transaction
        self._user_repository = UserRepository(transaction)
        self._company_repository = CompanyRepository(transaction)
        self._event_dispatcher = EventDispatcher(message_bus, domain_logger)

    def change_email(self, user_id: int, new_email: str) -> str:
        user_data = self._user_repository.get_user_by_id(user_id)
        user = UserFactory.create(user_data)

        error = user.can_change_email()
        if error is not None:
            return error

        company_data = self._company_repository.get_company()
        company = CompanyFactory.create(company_data)

        user.change_email(new_email, company)

        self._company_repository.save_company(company)
        self._user_repository.save_user(user)
        self._event_dispatcher.dispatch(user.domain_events)

        self._transaction.commit()
        return "OK"

from unittest.mock import Mock

from crm.application import DomainLogger, MessageBus
from crm.domain import UserType

from .helpers import (BusSpy, CompanyAssert, UserAssert, create_company, create_user,
                      execute, query_company, query_user)


def test_changing_email_from_corporate_to_non_corporate():
    # Arrange
    user = create_user(email="user@mycorp.com", user_type=UserType.EMPLOYEE)
    create_company("mycorp.com", 1)

    bus_spy = BusSpy()
    message_bus = MessageBus(bus_spy)
    logger_mock = Mock(spec=DomainLogger)

    # Act
    result = execute(
        lambda x: x.change_email(user.user_id, "new@gmail.com"),
        message_bus, logger_mock)

    # Assert
    assert result == "OK"

    (UserAssert(query_user(user.user_id))
        .should_exist()
        .with_email("new@gmail.com")
        .with_type(UserType.CUSTOMER))

    (CompanyAssert(query_company())
        .should_exist()
        .with_number_of_employees(0))

    (bus_spy.should_send_number_of_messages(1)
            .with_email_changed_message(user.user_id, "new@gmail.com"))
    logger_mock.user_type_has_changed.assert_called_once_with(
        user.user_id, UserType.EMPLOYEE, UserType.CUSTOMER)

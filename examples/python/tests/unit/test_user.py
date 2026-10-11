import pytest

from crm.domain import (Company, EmailChangedEvent, User, UserFactory, UserType,
                        UserTypeChangedEvent)


def test_changing_email_from_non_corporate_to_corporate():
    company = Company("mycorp.com", 1)
    sut = User(1, "user@gmail.com", UserType.CUSTOMER, False)

    sut.change_email("new@mycorp.com", company)

    assert company.number_of_employees == 2
    assert sut.email == "new@mycorp.com"
    assert sut.type == UserType.EMPLOYEE
    assert sut.domain_events == [
        UserTypeChangedEvent(1, UserType.CUSTOMER, UserType.EMPLOYEE),
        EmailChangedEvent(1, "new@mycorp.com"),
    ]


def test_changing_email_from_corporate_to_non_corporate():
    company = Company("mycorp.com", 1)
    sut = User(1, "user@mycorp.com", UserType.EMPLOYEE, False)

    sut.change_email("new@gmail.com", company)

    assert company.number_of_employees == 0
    assert sut.email == "new@gmail.com"
    assert sut.type == UserType.CUSTOMER
    assert sut.domain_events == [
        UserTypeChangedEvent(1, UserType.EMPLOYEE, UserType.CUSTOMER),
        EmailChangedEvent(1, "new@gmail.com"),
    ]


def test_changing_email_without_changing_user_type():
    company = Company("mycorp.com", 1)
    sut = User(1, "user@gmail.com", UserType.CUSTOMER, False)

    sut.change_email("new@gmail.com", company)

    assert company.number_of_employees == 1
    assert sut.email == "new@gmail.com"
    assert sut.type == UserType.CUSTOMER
    assert sut.domain_events == [EmailChangedEvent(1, "new@gmail.com")]


def test_changing_email_to_the_same_one():
    company = Company("mycorp.com", 1)
    sut = User(1, "user@gmail.com", UserType.CUSTOMER, False)

    sut.change_email("user@gmail.com", company)

    assert company.number_of_employees == 1
    assert sut.email == "user@gmail.com"
    assert sut.type == UserType.CUSTOMER
    assert sut.domain_events == []


def test_a_confirmed_email_cannot_be_changed():
    sut = User(1, "user@gmail.com", UserType.CUSTOMER, True)

    error = sut.can_change_email()

    assert error == "Can't change a confirmed email"


def test_changing_a_confirmed_email_fails_fast():
    company = Company("mycorp.com", 1)
    sut = User(1, "user@gmail.com", UserType.CUSTOMER, True)

    with pytest.raises(RuntimeError):
        sut.change_email("new@gmail.com", company)


def test_a_user_is_restored_from_a_database_row():
    user = UserFactory.create((5, "user@mycorp.com", 2, True))

    assert user.user_id == 5
    assert user.email == "user@mycorp.com"
    assert user.type == UserType.EMPLOYEE
    assert user.is_email_confirmed is True

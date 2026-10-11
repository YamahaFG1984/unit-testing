import pytest

from crm.domain import Company


@pytest.mark.parametrize("domain, email, expected_result", [
    ("mycorp.com", "email@mycorp.com", True),
    ("mycorp.com", "email@gmail.com", False),
])
def test_differentiates_a_corporate_email_from_non_corporate(domain, email, expected_result):
    sut = Company(domain, 0)

    is_email_corporate = sut.is_email_corporate(email)

    assert is_email_corporate == expected_result


def test_the_number_of_employees_cannot_become_negative():
    sut = Company("mycorp.com", 0)

    with pytest.raises(RuntimeError):
        sut.change_number_of_employees(-1)

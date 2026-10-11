package crm.domain;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UserTests {
    @Test
    void changing_email_from_non_corporate_to_corporate() {
        var company = new Company("mycorp.com", 1);
        var sut = new User(1, "user@gmail.com", UserType.CUSTOMER, false);

        sut.changeEmail("new@mycorp.com", company);

        assertThat(company.getNumberOfEmployees()).isEqualTo(2);
        assertThat(sut.getEmail()).isEqualTo("new@mycorp.com");
        assertThat(sut.getType()).isEqualTo(UserType.EMPLOYEE);
        assertThat(sut.getDomainEvents()).containsExactly(
            new UserTypeChangedEvent(1, UserType.CUSTOMER, UserType.EMPLOYEE),
            new EmailChangedEvent(1, "new@mycorp.com"));
    }

    @Test
    void changing_email_from_corporate_to_non_corporate() {
        var company = new Company("mycorp.com", 1);
        var sut = new User(1, "user@mycorp.com", UserType.EMPLOYEE, false);

        sut.changeEmail("new@gmail.com", company);

        assertThat(company.getNumberOfEmployees()).isEqualTo(0);
        assertThat(sut.getEmail()).isEqualTo("new@gmail.com");
        assertThat(sut.getType()).isEqualTo(UserType.CUSTOMER);
        assertThat(sut.getDomainEvents()).containsExactly(
            new UserTypeChangedEvent(1, UserType.EMPLOYEE, UserType.CUSTOMER),
            new EmailChangedEvent(1, "new@gmail.com"));
    }

    @Test
    void changing_email_without_changing_user_type() {
        var company = new Company("mycorp.com", 1);
        var sut = new User(1, "user@gmail.com", UserType.CUSTOMER, false);

        sut.changeEmail("new@gmail.com", company);

        assertThat(company.getNumberOfEmployees()).isEqualTo(1);
        assertThat(sut.getEmail()).isEqualTo("new@gmail.com");
        assertThat(sut.getType()).isEqualTo(UserType.CUSTOMER);
        assertThat(sut.getDomainEvents()).containsExactly(
            new EmailChangedEvent(1, "new@gmail.com"));
    }

    @Test
    void changing_email_to_the_same_one() {
        var company = new Company("mycorp.com", 1);
        var sut = new User(1, "user@gmail.com", UserType.CUSTOMER, false);

        sut.changeEmail("user@gmail.com", company);

        assertThat(company.getNumberOfEmployees()).isEqualTo(1);
        assertThat(sut.getEmail()).isEqualTo("user@gmail.com");
        assertThat(sut.getType()).isEqualTo(UserType.CUSTOMER);
        assertThat(sut.getDomainEvents()).isEmpty();
    }

    @Test
    void a_confirmed_email_cannot_be_changed() {
        var sut = new User(1, "user@gmail.com", UserType.CUSTOMER, true);

        String error = sut.canChangeEmail();

        assertThat(error).isEqualTo("Can't change a confirmed email");
    }

    @Test
    void changing_a_confirmed_email_fails_fast() {
        var company = new Company("mycorp.com", 1);
        var sut = new User(1, "user@gmail.com", UserType.CUSTOMER, true);

        assertThatThrownBy(() -> sut.changeEmail("new@gmail.com", company))
            .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void a_user_is_restored_from_a_database_row() {
        User user = UserFactory.create(new Object[] {5, "user@mycorp.com", 2, true});

        assertThat(user.getUserId()).isEqualTo(5);
        assertThat(user.getEmail()).isEqualTo("user@mycorp.com");
        assertThat(user.getType()).isEqualTo(UserType.EMPLOYEE);
        assertThat(user.isEmailConfirmed()).isTrue();
    }
}

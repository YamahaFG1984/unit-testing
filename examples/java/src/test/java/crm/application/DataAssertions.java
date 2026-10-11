package crm.application;

import crm.domain.Company;
import crm.domain.User;
import crm.domain.UserType;

import static org.assertj.core.api.Assertions.assertThat;

/** 断言段的流式接口（第 10 章）。 */
final class DataAssertions {
    private DataAssertions() {}

    static UserAssert assertThatUser(User user) { return new UserAssert(user); }
    static CompanyAssert assertThatCompany(Company company) { return new CompanyAssert(company); }

    static final class UserAssert {
        private final User user;
        private UserAssert(User user) { this.user = user; }

        UserAssert exists() {
            assertThat(user).isNotNull();
            return this;
        }
        UserAssert hasEmail(String email) {
            assertThat(user.getEmail()).isEqualTo(email);
            return this;
        }
        UserAssert hasType(UserType type) {
            assertThat(user.getType()).isEqualTo(type);
            return this;
        }
    }

    static final class CompanyAssert {
        private final Company company;
        private CompanyAssert(Company company) { this.company = company; }

        CompanyAssert exists() {
            assertThat(company).isNotNull();
            return this;
        }
        CompanyAssert hasNumberOfEmployees(int number) {
            assertThat(company.getNumberOfEmployees()).isEqualTo(number);
            return this;
        }
    }
}

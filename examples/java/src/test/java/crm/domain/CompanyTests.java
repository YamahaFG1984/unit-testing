package crm.domain;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CompanyTests {
    @ParameterizedTest
    @CsvSource({
        "mycorp.com, email@mycorp.com, true",
        "mycorp.com, email@gmail.com,  false"
    })
    void differentiates_a_corporate_email_from_non_corporate(
            String domain, String email, boolean expectedResult) {
        var sut = new Company(domain, 0);

        boolean isEmailCorporate = sut.isEmailCorporate(email);

        assertThat(isEmailCorporate).isEqualTo(expectedResult);
    }

    @Test
    void the_number_of_employees_cannot_become_negative() {
        var sut = new Company("mycorp.com", 0);

        assertThatThrownBy(() -> sut.changeNumberOfEmployees(-1))
            .isInstanceOf(IllegalStateException.class);
    }
}

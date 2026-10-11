package crm.application;

import crm.domain.User;
import crm.domain.UserType;
import org.junit.jupiter.api.Test;

import static crm.application.DataAssertions.assertThatCompany;
import static crm.application.DataAssertions.assertThatUser;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

class UserControllerTests extends IntegrationTests {
    @Test
    void changing_email_from_corporate_to_non_corporate() {
        // Arrange
        User user = createUser("user@mycorp.com", UserType.EMPLOYEE);
        createCompany("mycorp.com", 1);

        var busSpy = new BusSpy();
        var messageBus = new MessageBus(busSpy);
        IDomainLogger loggerMock = mock(IDomainLogger.class);

        // Act
        String result = execute(
            x -> x.changeEmail(user.getUserId(), "new@gmail.com"),
            messageBus, loggerMock);

        // Assert
        assertThat(result).isEqualTo("OK");

        assertThatUser(queryUser(user.getUserId()))
            .exists()
            .hasEmail("new@gmail.com")
            .hasType(UserType.CUSTOMER);

        assertThatCompany(queryCompany())
            .exists()
            .hasNumberOfEmployees(0);

        busSpy.shouldSendNumberOfMessages(1)
              .withEmailChangedMessage(user.getUserId(), "new@gmail.com");
        verify(loggerMock, times(1)).userTypeHasChanged(
            user.getUserId(), UserType.EMPLOYEE, UserType.CUSTOMER);
        verifyNoMoreInteractions(loggerMock);
    }
}

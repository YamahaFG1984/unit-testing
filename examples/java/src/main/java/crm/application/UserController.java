package crm.application;

import crm.domain.Company;
import crm.domain.CompanyFactory;
import crm.domain.User;
import crm.domain.UserFactory;
import crm.persistence.CompanyRepository;
import crm.persistence.Transaction;
import crm.persistence.UserRepository;

/** 应用服务：只做编排（第 7、8 章）。 */
public class UserController {
    private final Transaction transaction;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final EventDispatcher eventDispatcher;

    public UserController(Transaction transaction, MessageBus messageBus,
                          IDomainLogger domainLogger) {
        this.transaction = transaction;
        this.userRepository = new UserRepository(transaction);
        this.companyRepository = new CompanyRepository(transaction);
        this.eventDispatcher = new EventDispatcher(messageBus, domainLogger);
    }

    public String changeEmail(int userId, String newEmail) {
        Object[] userData = userRepository.getUserById(userId);
        User user = UserFactory.create(userData);

        String error = user.canChangeEmail();
        if (error != null) {
            return error;
        }

        Object[] companyData = companyRepository.getCompany();
        Company company = CompanyFactory.create(companyData);

        user.changeEmail(newEmail, company);

        companyRepository.saveCompany(company);
        userRepository.saveUser(user);
        eventDispatcher.dispatch(user.getDomainEvents());

        transaction.commit();
        return "OK";
    }
}

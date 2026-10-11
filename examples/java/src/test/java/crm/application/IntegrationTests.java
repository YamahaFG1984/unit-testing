package crm.application;

import crm.domain.Company;
import crm.domain.CompanyFactory;
import crm.domain.User;
import crm.domain.UserFactory;
import crm.domain.UserType;
import crm.persistence.CompanyRepository;
import crm.persistence.Transaction;
import crm.persistence.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;

import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.function.Function;

/**
 * 所有集成测试的基类：每个测试「开始」时清库，外加与业务无关的辅助方法（第 10 章）。
 * JUnit 默认顺序执行测试，正是集成测试需要的。
 */
@Tag("integration")
abstract class IntegrationTests {
    protected static final String CONNECTION_STRING =
        System.getenv().getOrDefault(
            "CRM_DB_URL", "jdbc:postgresql://localhost:54329/crm?user=crm&password=crm");

    @BeforeEach
    void clearDatabase() throws SQLException {
        // 只删普通数据；参考数据 user_type 由迁移管理，不能动
        try (var connection = DriverManager.getConnection(CONNECTION_STRING);
             var statement = connection.createStatement()) {
            statement.execute("DELETE FROM users; DELETE FROM company;");
        }
    }

    // ---- 准备段：工厂方法（Java 没有默认参数，用重载）----
    protected User createUser(String email, UserType type, boolean isEmailConfirmed) {
        try (var transaction = new Transaction(CONNECTION_STRING)) {
            var user = new User(0, email, type, isEmailConfirmed);
            new UserRepository(transaction).saveUser(user);
            transaction.commit();
            return user;
        }
    }

    protected User createUser(String email, UserType type) {
        return createUser(email, type, false);
    }

    protected Company createCompany(String domainName, int numberOfEmployees) {
        try (var transaction = new Transaction(CONNECTION_STRING)) {
            var company = new Company(domainName, numberOfEmployees);
            new CompanyRepository(transaction).saveCompany(company);
            transaction.commit();
            return company;
        }
    }

    // ---- 执行段：装饰方法 ----
    protected String execute(Function<UserController, String> func,
                             MessageBus messageBus, IDomainLogger logger) {
        try (var transaction = new Transaction(CONNECTION_STRING)) {
            var controller = new UserController(transaction, messageBus, logger);
            return func.apply(controller);
        }
    }

    // ---- 断言段：用新的事务重新查库 ----
    protected User queryUser(int userId) {
        try (var transaction = new Transaction(CONNECTION_STRING)) {
            Object[] data = new UserRepository(transaction).getUserById(userId);
            return data == null ? null : UserFactory.create(data);
        }
    }

    protected Company queryCompany() {
        try (var transaction = new Transaction(CONNECTION_STRING)) {
            Object[] data = new CompanyRepository(transaction).getCompany();
            return data == null ? null : CompanyFactory.create(data);
        }
    }
}

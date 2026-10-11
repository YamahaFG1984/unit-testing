package crm.domain;

import java.util.ArrayList;
import java.util.List;

/** 领域模型：只做决定，不碰任何进程外依赖（第 7 章）。 */
public class User {
    private int userId;
    private String email;
    private UserType type;
    private final boolean isEmailConfirmed;
    private final List<DomainEvent> domainEvents = new ArrayList<>();

    public User(int userId, String email, UserType type, boolean isEmailConfirmed) {
        this.userId = userId;
        this.email = email;
        this.type = type;
        this.isEmailConfirmed = isEmailConfirmed;
    }

    public String canChangeEmail() {
        if (isEmailConfirmed) {
            return "Can't change a confirmed email";
        }
        return null;
    }

    public void changeEmail(String newEmail, Company company) {
        Precondition.requires(canChangeEmail() == null);

        if (email.equals(newEmail)) {
            return;
        }

        UserType newType = company.isEmailCorporate(newEmail)
            ? UserType.EMPLOYEE
            : UserType.CUSTOMER;

        if (type != newType) {
            int delta = newType == UserType.EMPLOYEE ? 1 : -1;
            company.changeNumberOfEmployees(delta);
            domainEvents.add(new UserTypeChangedEvent(userId, type, newType));
        }

        email = newEmail;
        type = newType;
        domainEvents.add(new EmailChangedEvent(userId, newEmail));
    }

    public int getUserId() { return userId; }
    public String getEmail() { return email; }
    public UserType getType() { return type; }
    public boolean isEmailConfirmed() { return isEmailConfirmed; }
    public List<DomainEvent> getDomainEvents() { return List.copyOf(domainEvents); }

    /** 仅供仓储在插入新用户后回填数据库生成的主键。 */
    public void assignId(int userId) {
        Precondition.requires(this.userId == 0);
        this.userId = userId;
    }
}

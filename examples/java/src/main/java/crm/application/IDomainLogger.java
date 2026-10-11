package crm.application;

import crm.domain.UserType;

/** 支持日志：业务要求记录的事件，逐个列成方法（第 8 章）。 */
public interface IDomainLogger {
    void userTypeHasChanged(int userId, UserType oldType, UserType newType);
}

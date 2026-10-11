package crm.application;

import crm.domain.UserType;

import java.util.logging.Logger;

public class DomainLogger implements IDomainLogger {
    private final Logger logger;

    public DomainLogger(Logger logger) { this.logger = logger; }

    @Override
    public void userTypeHasChanged(int userId, UserType oldType, UserType newType) {
        logger.info("User " + userId + " changed type from " + oldType + " to " + newType);
    }
}

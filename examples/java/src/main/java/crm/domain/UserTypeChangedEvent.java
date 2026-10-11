package crm.domain;

public record UserTypeChangedEvent(int userId, UserType oldType, UserType newType)
        implements DomainEvent {}

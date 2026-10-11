package crm.domain;

public record EmailChangedEvent(int userId, String newEmail) implements DomainEvent {}

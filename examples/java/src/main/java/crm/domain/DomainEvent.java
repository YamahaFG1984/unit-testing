package crm.domain;

/** 领域事件：领域模型里记下的「发生了什么」。它们是不可变的值（第 7 章）。 */
public sealed interface DomainEvent permits EmailChangedEvent, UserTypeChangedEvent {}

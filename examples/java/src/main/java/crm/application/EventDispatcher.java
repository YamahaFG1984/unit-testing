package crm.application;

import crm.domain.DomainEvent;
import crm.domain.EmailChangedEvent;
import crm.domain.UserTypeChangedEvent;

import java.util.List;

/** 把领域事件翻译成对不受管依赖的调用。 */
public class EventDispatcher {
    private final MessageBus messageBus;
    private final IDomainLogger domainLogger;

    public EventDispatcher(MessageBus messageBus, IDomainLogger domainLogger) {
        this.messageBus = messageBus;
        this.domainLogger = domainLogger;
    }

    public void dispatch(List<DomainEvent> events) {
        for (DomainEvent ev : events) {
            switch (ev) {
                case EmailChangedEvent e ->
                    messageBus.sendEmailChangedMessage(e.userId(), e.newEmail());
                case UserTypeChangedEvent e ->
                    domainLogger.userTypeHasChanged(e.userId(), e.oldType(), e.newType());
            }
        }
    }
}

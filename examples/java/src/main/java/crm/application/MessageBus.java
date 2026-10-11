package crm.application;

/** 领域消息。它决定发到总线上的文本长什么样。 */
public class MessageBus {
    private final IBus bus;

    public MessageBus(IBus bus) { this.bus = bus; }

    public void sendEmailChangedMessage(int userId, String newEmail) {
        bus.send("Type: USER EMAIL CHANGED; "
               + "Id: " + userId + "; "
               + "NewEmail: " + newEmail);
    }
}

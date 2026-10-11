package crm.application;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/** 手写的 Mock，站在系统的最边缘（第 9 章）。消息格式在这里独立地又写了一遍。 */
class BusSpy implements IBus {
    private final List<String> sentMessages = new ArrayList<>();

    @Override
    public void send(String message) {
        sentMessages.add(message);
    }

    BusSpy shouldSendNumberOfMessages(int number) {
        assertThat(sentMessages).hasSize(number);
        return this;
    }

    BusSpy withEmailChangedMessage(int userId, String newEmail) {
        String message = "Type: USER EMAIL CHANGED; "
                       + "Id: " + userId + "; "
                       + "NewEmail: " + newEmail;
        assertThat(sentMessages).contains(message);
        return this;
    }
}

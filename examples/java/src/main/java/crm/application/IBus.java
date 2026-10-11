package crm.application;

/** 系统的最边缘：包在消息总线 SDK 外面的适配器。测试里只替换这一层（第 9 章）。 */
public interface IBus {
    void send(String message);
}

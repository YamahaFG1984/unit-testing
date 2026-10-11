package crm.domain;

/** 把数据库里的一行还原成 User。没有协作者，可以直接做单元测试。 */
public final class UserFactory {
    private UserFactory() {}

    public static User create(Object[] data) {
        Precondition.requires(data.length >= 4);

        int id = (int) data[0];
        String email = (String) data[1];
        UserType type = UserType.fromId((int) data[2]);
        boolean isEmailConfirmed = (boolean) data[3];

        return new User(id, email, type, isEmailConfirmed);
    }
}

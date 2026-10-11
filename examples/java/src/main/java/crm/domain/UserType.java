package crm.domain;

public enum UserType {
    CUSTOMER(1),
    EMPLOYEE(2);

    private final int id;

    UserType(int id) { this.id = id; }

    public int id() { return id; }

    public static UserType fromId(int id) {
        for (UserType t : values()) {
            if (t.id == id) return t;
        }
        throw new IllegalArgumentException("Unknown user type: " + id);
    }
}

package crm.domain;

public final class Precondition {
    private Precondition() {}

    public static void requires(boolean condition) {
        if (!condition) {
            throw new IllegalStateException("Precondition failed");
        }
    }
}

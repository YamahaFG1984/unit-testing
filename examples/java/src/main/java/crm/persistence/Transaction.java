package crm.persistence;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * 贯穿一次业务操作的数据库事务（第 10 章）。
 * commit() 只在成功时调用；close() 时没提交就回滚。
 */
public class Transaction implements AutoCloseable {
    private final Connection connection;
    private boolean committed;

    public Transaction(String connectionString) {
        try {
            connection = DriverManager.getConnection(connectionString);
            connection.setAutoCommit(false);
        } catch (SQLException e) {
            throw new IllegalStateException(e);
        }
    }

    Connection connection() { return connection; }

    public void commit() { committed = true; }

    @Override
    public void close() {
        try (connection) {
            if (committed) {
                connection.commit();
            } else {
                connection.rollback();
            }
        } catch (SQLException e) {
            throw new IllegalStateException(e);
        }
    }
}

package crm.persistence;

import crm.domain.User;

import java.sql.Connection;
import java.sql.SQLException;

public class UserRepository {
    private final Connection connection;

    public UserRepository(Transaction transaction) {
        this.connection = transaction.connection();
    }

    public Object[] getUserById(int userId) {
        String sql = "SELECT user_id, email, type, is_email_confirmed FROM users WHERE user_id = ?";
        try (var statement = connection.prepareStatement(sql)) {
            statement.setInt(1, userId);
            try (var rs = statement.executeQuery()) {
                if (!rs.next()) return null;
                return new Object[] {
                    rs.getInt(1), rs.getString(2), rs.getInt(3), rs.getBoolean(4)
                };
            }
        } catch (SQLException e) {
            throw new IllegalStateException(e);
        }
    }

    public void saveUser(User user) {
        try {
            if (user.getUserId() == 0) {
                String sql = "INSERT INTO users (email, type, is_email_confirmed) "
                           + "VALUES (?, ?, ?) RETURNING user_id";
                try (var statement = connection.prepareStatement(sql)) {
                    statement.setString(1, user.getEmail());
                    statement.setInt(2, user.getType().id());
                    statement.setBoolean(3, user.isEmailConfirmed());
                    try (var rs = statement.executeQuery()) {
                        rs.next();
                        user.assignId(rs.getInt(1));
                    }
                }
            } else {
                String sql = "UPDATE users SET email = ?, type = ?, is_email_confirmed = ? "
                           + "WHERE user_id = ?";
                try (var statement = connection.prepareStatement(sql)) {
                    statement.setString(1, user.getEmail());
                    statement.setInt(2, user.getType().id());
                    statement.setBoolean(3, user.isEmailConfirmed());
                    statement.setInt(4, user.getUserId());
                    statement.executeUpdate();
                }
            }
        } catch (SQLException e) {
            throw new IllegalStateException(e);
        }
    }
}

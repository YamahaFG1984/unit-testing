package crm.persistence;

import crm.domain.Company;

import java.sql.Connection;
import java.sql.SQLException;

public class CompanyRepository {
    private final Connection connection;

    public CompanyRepository(Transaction transaction) {
        this.connection = transaction.connection();
    }

    public Object[] getCompany() {
        String sql = "SELECT domain_name, number_of_employees FROM company";
        try (var statement = connection.prepareStatement(sql);
             var rs = statement.executeQuery()) {
            if (!rs.next()) return null;
            return new Object[] { rs.getString(1), rs.getInt(2) };
        } catch (SQLException e) {
            throw new IllegalStateException(e);
        }
    }

    public void saveCompany(Company company) {
        try {
            int updated;
            try (var statement = connection.prepareStatement(
                    "UPDATE company SET domain_name = ?, number_of_employees = ?")) {
                statement.setString(1, company.getDomainName());
                statement.setInt(2, company.getNumberOfEmployees());
                updated = statement.executeUpdate();
            }
            if (updated == 0) {
                try (var statement = connection.prepareStatement(
                        "INSERT INTO company (domain_name, number_of_employees) VALUES (?, ?)")) {
                    statement.setString(1, company.getDomainName());
                    statement.setInt(2, company.getNumberOfEmployees());
                    statement.executeUpdate();
                }
            }
        } catch (SQLException e) {
            throw new IllegalStateException(e);
        }
    }
}

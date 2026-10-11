package crm.domain;

public final class CompanyFactory {
    private CompanyFactory() {}

    public static Company create(Object[] data) {
        Precondition.requires(data.length >= 2);

        String domainName = (String) data[0];
        int numberOfEmployees = (int) data[1];

        return new Company(domainName, numberOfEmployees);
    }
}

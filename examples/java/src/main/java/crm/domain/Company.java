package crm.domain;

public class Company {
    private final String domainName;
    private int numberOfEmployees;

    public Company(String domainName, int numberOfEmployees) {
        this.domainName = domainName;
        this.numberOfEmployees = numberOfEmployees;
    }

    public void changeNumberOfEmployees(int delta) {
        Precondition.requires(numberOfEmployees + delta >= 0);
        numberOfEmployees += delta;
    }

    public boolean isEmailCorporate(String email) {
        String emailDomain = email.split("@")[1];
        return emailDomain.equals(domainName);
    }

    public String getDomainName() { return domainName; }
    public int getNumberOfEmployees() { return numberOfEmployees; }
}

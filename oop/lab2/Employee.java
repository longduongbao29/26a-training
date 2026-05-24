public class Employee extends Person {
    private double salary;

    public Employee(String name) {
        super(name);
        this.salary = 0;
    }

    public Employee(String name, double salary) {
        super(name);
        this.salary = salary < 0 ? 0 : salary;
    }

    public double getSalary() { return salary; }

    public void setSalary(double salary) {
        if (salary >= 0) this.salary = salary;
    }

    @Override
    public String toString() {
        return getName() + " is an employee earning a salary of " + salary;
    }
}

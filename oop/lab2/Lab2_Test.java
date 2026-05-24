public class Lab2_Test {
    public static void main(String[] args) {

        final int MAX_HEADCOUNT = 20;
        Person[] person_array = new Person[MAX_HEADCOUNT];

        person_array[0] = new Student("Peter");
        person_array[1] = new Instructor("Peter");
        person_array[2] = new Instructor("Sandy", 25000);
        person_array[3] = new Employee("Janitor Bob");
        person_array[4] = new Student("Tom", "Peter", person_array);
        person_array[5] = new Student("Maggie", "Susan", person_array);
        person_array[6] = new Instructor("Susan", 40000);

        Instructor.fillStudents(person_array);

        System.out.println("ID and name of all personnel in the array");
        for (int i = 0; i < Person.getMaxID(); i++) {
            System.out.println(person_array[i].getID() + ":" + person_array[i].toString());
        }
    }
}

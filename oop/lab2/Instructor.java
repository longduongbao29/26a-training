public class Instructor extends Employee {
    private int[] studentIDArray;
    private int studentCount;

    public Instructor(String name) {
        super(name);
        studentIDArray = new int[10];
        studentCount = 0;
    }

    public Instructor(String name, double salary) {
        super(name, salary);
        studentIDArray = new int[10];
        studentCount = 0;
    }

    public void addStudent(int studentID) {
        if (studentCount < 10) {
            studentIDArray[studentCount++] = studentID;
        }
    }

    public int[] getStudentIDArray() { return studentIDArray; }
    public int getStudentCount() { return studentCount; }

    public static void fillStudents(Person[] personArray) {
        for (Person p : personArray) {
            if (p == null) break;
            if (!(p instanceof Student)) continue;

            Student s = (Student) p;
            if (s.getTeacherID() != 0 || s.getTeacherName().isEmpty()) continue;

            for (Person q : personArray) {
                if (q == null) break;
                if (q instanceof Instructor && q.getName().equals(s.getTeacherName())) {
                    s.setTeacherID(q.getID());
                    ((Instructor) q).addStudent(s.getID());
                    break;
                }
            }
        }
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(getName())
          .append(" is an instructor earning a salary of ").append(getSalary())
          .append(" with ").append(studentCount).append(" student in his/her class");
        for (int i = 0; i < studentCount; i++) {
            sb.append("\n   Student[").append(i).append("]: ").append(studentIDArray[i]);
        }
        return sb.toString();
    }
}

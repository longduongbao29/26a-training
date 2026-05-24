public class Student extends Person {
    private int teacherID;
    private String teacherName;

    public Student(String name) {
        super(name);
        this.teacherID = 0;
        this.teacherName = "";
    }

    // Finds the first Instructor named teacherName in personArray,
    // sets TeacherID and registers this student in that instructor's array.
    public Student(String name, String teacherName, Person[] personArray) {
        super(name);
        this.teacherName = teacherName;
        this.teacherID = 0;

        for (Person p : personArray) {
            if (p == null) break;
            if (p instanceof Instructor && p.getName().equals(teacherName)) {
                this.teacherID = p.getID();
                ((Instructor) p).addStudent(this.getID());
                break;
            }
        }
    }

    public int getTeacherID() { return teacherID; }
    public void setTeacherID(int id) { this.teacherID = id; }
    public String getTeacherName() { return teacherName; }

    @Override
    public String toString() {
        if (teacherName.isEmpty()) {
            return getName() + " is a student";
        }
        return getName() + " is a student whose instructor is " + teacherName
                + ", and his/her instructor's ID is " + teacherID;
    }
}

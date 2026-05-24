public abstract class Person {
    private static int LAST_ID = 0;

    private int id;
    private String name;

    public Person(String name) {
        this.id = ++LAST_ID;
        this.name = name;
    }

    public int getID() { return id; }
    public String getName() { return name; }
    public static int getMaxID() { return LAST_ID; }

    public abstract String toString();
}

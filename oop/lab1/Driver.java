public class Driver {
    public static void main(String[] args) {

        Temperature t1 = new Temperature();
        System.out.println("Default constructor:           " + t1);

        Temperature t2 = new Temperature(100.0);
        System.out.println("Constructor(value=100.0):      " + t2);

        Temperature t3 = new Temperature('F');
        System.out.println("Constructor(scale='F'):        " + t3);

        Temperature t4 = new Temperature(37.0, 'C');
        System.out.println("Constructor(37.0, 'C'):        " + t4);

        Temperature t5 = new Temperature(212.0, 'F');
        System.out.println("212.0F in Celsius:             " + t5.getCelsius() + " C");

        Temperature t6 = new Temperature(100.0, 'C');
        System.out.println("100.0C in Fahrenheit:          " + t6.getFahrenheit() + " F");

        Temperature t7 = new Temperature(0.0, 'C');
        t7.setValue(25.0);
        System.out.println("After setValue(25.0):          " + t7);

        Temperature t8 = new Temperature(98.6, 'F');
        t8.setScale('C');
        System.out.println("After setScale('C'):           " + t8);

        Temperature t9 = new Temperature();
        t9.setBoth(-40.0, 'F');
        System.out.println("After setBoth(-40.0, 'F'):     " + t9);

        if (args.length == 2) {
            Temperature ta = parseTemperature(args[0]);
            Temperature tb = parseTemperature(args[1]);
            System.out.println(Temperature.compare(ta, tb));
        }
    }

    private static Temperature parseTemperature(String s) {
        char scale = s.charAt(s.length() - 1);
        double value = Double.parseDouble(s.substring(0, s.length() - 1));
        return new Temperature(value, scale);
    }
}

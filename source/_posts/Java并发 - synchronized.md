---
title: synchronized关键字
date: 2021-06-07 13:58:00
tags:
  - JUC并发包
comments: false
---

synchronized（悲观锁又叫独享锁） 用于保障原子性、可见性、有序性。

synchronized 属于最基本的线程通信机制，基于对象监视器实现的，Java中每个对象都与一个监视器相关联，一个线程可以锁的或解锁，一次只有一个线程可以锁定监视器，试图锁定该监视器的任何其它线程都会被阻塞，直到它们可以获得该监视器上的锁定为止。

## 方法内的变量为线程安全

非线程安全问题存在于实例变量中，如果是方法内部的私有变量，则不存在非线程安全问题，所得到的结果是线程安全的。

**原因**

（1）方法内部的变量为方法私有的变量，其生存周期随着方法的结束而终结。
（2）每个线程执行的时候会把局部变量存放在各自栈帧的工作内存中（栈帧进入虚拟机栈），虚拟机栈线程间不共享，故不存在线程安全问题。

方法内部的变量线程安全验证案例：

```java
public class HasSelfPrivateNum_1 {

    public void addI(String str) {
        try {
            int num = 0;
            if (str.equals("a")) {
                num = 100;
                System.out.println("a set over!");
                Thread.sleep(200);
            } else {
                num = 200;
                System.out.println("b set over!");
            }
            System.out.println(str + " num=" + num);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}

class ThreadA extends Thread {
    private HasSelfPrivateNum_1 numRef;

    public ThreadA(HasSelfPrivateNum_1 numRef) {
        this.numRef = numRef;
    }

    @Override
    public void run() {
        super.run();
        numRef.addI("a");
    }
}

class ThreadB extends Thread {
    private HasSelfPrivateNum_1 numRef;

    public ThreadB(HasSelfPrivateNum_1 numRef) {
        this.numRef = numRef;
    }
    @Override
    public void run() {
        super.run();
        numRef.addI("b");
    }
}

class ThreadTest0216{
    public static void main(String[] args) {
        HasSelfPrivateNum_1 privateNum = new HasSelfPrivateNum_1();
        ThreadA threadA  = new ThreadA(privateNum);
        threadA.start();

        ThreadB threadB = new ThreadB(privateNum);
        threadB.start();
    }
}
```

执行结果

```
a set over!
b set over!
b num=200
a num=100
```

## 实例变量非线程安全问题与解决方案

- 如果多个线程共同访问一个对象中的实例变量，则有可能出现非线程安全问题；
- 用多线程访问的对象中如果有多个实例变量，则运行结果有可能会出现交叉的情况。
- 如果对象仅有一个实例变量，则有可能出现覆盖的情况。

```java
public class HasSelfPrivateNum_2 {
    private int num = 0;

    public void addI(String str) {
        try {
            if (str.equals("a")) {
                num = 100;
                System.out.println("a set over!");
                Thread.sleep(200);
            } else {
                num = 200;
                System.out.println("b set over!");
            }
            System.out.println(str + " num=" + num);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}

class ThreadC extends Thread {
    private HasSelfPrivateNum_2 numRef;

    public ThreadC(HasSelfPrivateNum_2 numRef) {
        this.numRef = numRef;
    }

    @Override
    public void run() {
        super.run();
        numRef.addI("a");
    }
}

class ThreadD extends Thread {
    private HasSelfPrivateNum_2 numRef;

    public ThreadD(HasSelfPrivateNum_2 numRef) {
        this.numRef = numRef;
    }
    @Override
    public void run() {
        super.run();
        numRef.addI("b");
    }
}

class ThreadTest02162{
    public static void main(String[] args) {
        HasSelfPrivateNum_2 privateNum = new HasSelfPrivateNum_2();
        ThreadC threadC  = new ThreadC(privateNum);
        threadC.start();

        ThreadD threadD = new ThreadD(privateNum);
        threadD.start();
    }
}
```

执行结果

```
a set over!
b set over!
b num=200
a num=200
```

上面这个案例是两个线程同时访问同一个业务对象中的一个没有同步的方法，如果线程同时操作业务对象中的变量，则有可能出现非线程安全问题。

解决上面这个错误，在 public void addI(String str) 方法前加关键字 synchronized 即可。



## 同步代码块

sysnchronized(**同步监视器**){

  // 需要被同步的代码块(即为**共享数据**的代码)

}

1） 共享数据：多个线程共同操作的同一个数据（变量） 

2） 同步监视器：有一个类的对象来充当。哪个线程获取此监视器，谁就去执行大括号里被同步的代码。俗称：锁。要求所有的线程共用同一把锁。

下面提供一个用同步代码块的方式解决**数据共享的安全**问题：

**实例**

```java
class W implements Runnable{
    int ticket = 100;
    // Object obj = new Object();
    public void run(){
        while(true) {
            /*
              在继承中一定要慎用this
              严格控制：要求所有的线程共用同一把锁，
              也就是说这个this代表同一个对象的时候才能够使用。
             */
            synchronized (this) {
                if (ticket > 0) {
                    try{
                        Thread.currentThread().sleep(100);
                        System.out.println(Thread.currentThread().getName() + "售票，余票为：" + ticket--);
                    }catch (InterruptedException e){
                        e.printStackTrace();
                    }
                }
            }
        }
    }
}
public class TestThreadSecurity {
    public static void main(String[] args){
        W window = new W();
        Thread window1 = new Thread(window);
        Thread window2 = new Thread(window);
        Thread window3 = new Thread(window);

        window1.setName("窗口1");
        window2.setName("窗口2");
        window3.setName("窗口3");

        window1.start();
        window2.start();
        window3.start();
    }
}
```

##  同步方法

将操作共享数据的方法声明为sysnchronized。即此方法，能够保证其中一个线程执行此方法时，其它线程在外等待直至此线程执行完此方法。

同步方法的锁：this。

```java
class Win implements Runnable{
    int ticket = 100;
    // Object obj = new Object();
    public void run(){
        while(true){
            show();
        }
    }
    public synchronized void show(){
        if (ticket > 0 ){
            try{
                Thread.currentThread().sleep(10);
                System.out.println(Thread.currentThread().getName()+"售票，余票为："+ticket--);
            }catch (InterruptedException e){
                e.printStackTrace();
            }
        }
    }
}

public class TestThreadSecurity2 {
    public static void main(String[] args){
        Win window = new Win();
        Thread window1 = new Thread(window);
        Thread window2 = new Thread(window);
        Thread window3 = new Thread(window);

        window1.setName("窗口1");
        window2.setName("窗口2");
        window3.setName("窗口3");

        window1.start();
        window2.start();
        window3.start();
    }
}
```

 这里还涉及到一个**互斥锁**的概念。

先了解一下单例模式：https://blog.csdn.net/qq_41647999/article/details/83447936

单例模式一般用于比较大、复杂的对象，只初始化一次，应该还有一个private的构造函数，使得不能用new来实例化对象，只能调用getInstance方法来得到对象，而getInstance保证了每次调用都返回相同的对象。

这里在举一个实例，解释在代码里：

```java
class Singleton{
    private Singleton(){

    }
    /*
    这里存在一个问题， 两个线程（A、B）分别调用getInstance方法，
    首次调用的时候，instance肯定为null，A在创建Singleton之前被挂起，
    线程B进入之后也被挂起，当前的instance仍然为null。此时A继续执行
    创建一个Singleton对象，假设此时在内存中的地址为1111，线程B执行之后
    也会创建一个对象，大家肯定都知道在内存中的值一定不为1111，
    像这样返回出去的判断相等不相等的时候就有问题了。为什么呢？因为在这里的instance
    只能够new一次，这种情况却new了两次。
     */
    private static Singleton instance = null;
    /*
    这里为什么要判断一次instance为null？
    假设这里只有一家华为手机店（这里的代码块），店里面只有一台mate20，
    门口排了一大堆的人（线程）来买mate20，第一个人肯定买的到，后面的人
    就买不到了，但是没有人告诉后面的人卖完了，每个人还得进店一次。所以
    这里的instance不为null的时候，就是告诉后面的线程，说这里的mate20
    已经卖完了，不用排队了。
    */
    if (instance == null ){
    public static Singleton getInstance(){
        if (instance == null ){
            instance = new Singleton();
        }
        return instance;
    }
}
}

public class TestSingleton {
    public static void main(String[] args) {
        /*
        getInstance在单例模式(保证一个类仅有一个实例，
        并提供一个访问它的全局访问点)的类中常见，
        用来生成唯一的实例，getInstance一般是static的
         */
        Singleton s1 = Singleton.getInstance();
        Singleton s2 = Singleton.getInstance();
        System.out.println(s1 == s2);
    }
}
```

**上例BUG修复**

```java
class Singleton2{
    private Singleton2(){

    }

    private static Singleton2 instance = null;
    public static Singleton2 getInstance() {
        /*
        1、 static里面不能使用this
        2、 关于解决懒汉式的线程安全问题，需要使用同步机制
        3、 对于静态方法而言，使用当前类本身充当锁
         */
        synchronized (Singleton2.class) {
            /*
            关于这里为什么使用Singleton2.class为什么能行，涉及到反射的知识点。
             */
            if (instance == null) {
                instance = new Singleton2();
            }
            
        }
        return instance;
    }
}

public class TestSingleton2 {
    public static void main(String[] args) {
        Singleton2 s1 = Singleton2.getInstance();
        Singleton2 s2 = Singleton2.getInstance();
        System.out.println(s1 == s2);
    }
}
```

## 同步synchronized在字节码指令中的原理（浅）

​	在方法中使用synchronized关键字实现同步的原因是使用了flag标记ACC_SYNCHRONIZED.当调用方法时，调用指令会检查方法的ACC_SYNCHRONIZED访问标志是否设置，如果设置了，执行线程先持有同步锁，然后执行方法，最后在方法完成时释放锁。
```java
/**
 *  public static synchronized void testMethod();
 *     descriptor: ()V
 *     flags: ACC_PUBLIC, ACC_STATIC, ACC_SYNCHRONIZED
 *     Code:
 *       stack=0, locals=0, args_size=0
 *          0: return
 *       LineNumberTable:
 *         line 26: 0
 *
 *       在翻编译的字节码指令，对public synchronized.viod myMethod()方法使用
 *   了flag标记ACC_SYNCHRONIZED,说明此方法是同步的。
 *
 *
 *
 *  public void myMethod();
 *     descriptor: ()V
 *     flags: ACC_PUBLIC
 *     Code:
 *       stack=2, locals=4, args_size=1
 *          0: aload_0
 *          1: dup
 *          2: astore_1
 *          3: monitorenter
 *          4: bipush        100
 *          6: istore_2
 *          7: aload_1
 *          8: monitorexit
 *          9: goto          17
 *         12: astore_3
 *         13: aload_1
 *         14: monitorexit
 *         15: aload_3
 *         16: athrow
 *         17: return
 *
 *         在字节码中使用monitorenter和monitorexit指令进行同步处理
 *         同步：按顺序执行A和B这两个业务，就是同步
 *         异步：执行A业务的时候，B业务也在同时执行，这就是异步。
 */
class Test {
    synchronized public static void testMethod(){
		
    }
    public static void Test()throws InterruptedException{
        testMethod();
    }
}
public class Test2 {
	//  如果使用synchronized代码块，则使用 monitorenter 和 monitorexit 指令进行同步处理。
     public void myMethod(){
        synchronized (this){
            int age=100;
        }
    }
    public static void main(String[] args)throws InterruptedException {
     	Test2 test = new Test2();
        test.myMethod();	
    }
}
```

## 将 Synchronized 方法与对象作为锁

有一个对象 object 中有 a 和 b 两个方法，有 t1 和 t2 两个线程，t1 调用方法 a，t2调用方法b，请问以下情况两个线程的执行顺序是怎样的？

（1）如果 a 加了同步锁，b没加。执行顺序：t1 持有 object 对象的 lock 锁，t2 可以以异步的方式调用object中的非同步锁的方法，所以 t1 和 t2 是同时执行的。

（2）如果 a 加了同步锁，b也加了。执行顺序：在方法声明处添加 synchronized 并不是锁方法，而是锁当前类的对象，所以根据t1 和 t2 的调用顺序来执行的。

注意：

- 在Java 中，只有将对象作为锁这种说法，没有锁方法这种说法。
- 在Java中，锁就是对象，对象可以映射成锁，哪个线程拿到这把锁，哪个线程就可以执行这个对象中的 synchronized 同步方法。
- 如果在某对象中使用了 synchronized 关键字声明非静态方法，那么这个对象就被当成锁。

> 这里存在一个误区：synchronized修饰方法时，如果该方法没有static关键字不是静态方法，则锁的只是这个对象，也就是说在另一个线程中新创建一个这个类的对象，两个线程操作不是同一把锁是不会产生竞态条件的。如果该方法上使用了静态关键字，则当前锁锁的是这个对象的类，使用该类重新创建对象多个线程的操作该对象都会产生静态条件。

## synchronized 锁重入

> 问题导入：如果一个线程调用了一个对象的同步方法，那么他还能不能在调用这个对象的另外一个同步方法呢？

synchronized 锁拥有重入锁的功能，当一个线程得到对象锁之后，再次请求此对象锁时是可以获取到该对象锁的，也就可以在一个 synchronized 方法 / 块的内部调用本类的其它加锁的方法 / 块，是永远可以得到锁的。

```java
public class Service{
    public synchronized  void fun1(){
        System.out.println("一号同步方法");
        fun2();
    }

    public synchronized void fun2(){
        System.out.println("二号同步方法");
        fun3();
    }

    public synchronized void fun3(){
        System.out.println("三号同步方法");
    }
}
```

```java
public class MyThread extends Thread {
    private Service service;
    
    public SynThreadText(Service service){
        this.service=service;
    }
    
    @Override
    public void run(){
        service.fun1();
    }

    public static void main(String[] args) {
        Service service = new Service();
        MyThread myThread = new MyThread(service);
        myThread.start();
    }
}
```

执行结果：

```
一号同步方法
二号同步方法
三号同步方法
```

## synchronized 锁重入支持父类继承

既然 synchronized 支持对象的方法重入，那么他是否也支持子类继承父类的同步方法重入呢？

```java
public class SubClass extends SuperClass implements Runnable {
    @Override
    public void run(){
        this.subFun();
    }
	
    public synchronized  void subFun(){
        System.out.println("子类的同步方法");
        this.superSynFun();
    }
	
    public static void main(String[] args) {
        SubClass sub = new SubClass();
        Thread t = new Thread(sub);
        t.start();
    }

}

class SuperClass{
    public synchronized void superSynFun(){
        System.out.println("父类的同步方法");
    }
}
```

执行结果：

```
子类的同步方法
父类的同步方法
```

如果被重写的方法有synchronized关键字，在所重写方法如果不加 synchronized  修饰，那就是非同步方法。

## 锁的范围

类锁、对象锁、锁粗化、锁消除

锁粗化：指JIT对于高频调用的方法，将该方法中的多个锁合并成一个锁。因为锁的请求、同步以及释放都会带来性能损耗。

```java
public void test(){
    synchronized(lock){
        //do some thing
    }
    // 被JIT优化后，会直接跳过该方法。可通过JITWatch查看运行的过程
    synchronized(lock){
        //do other thing
    }
}
```

锁消除：指JIT对不需要加锁的代码却执行了加锁的操作进行锁的消除。

例如，StringBuffer类的append() 方法使用了 synchronized 关键字，是线程安全的，但是仅用在线程封闭的环境中，则锁会浪费资源，JIT就会对锁进行消除。

## 深入理解synchronized原理

synchronized关键字不仅实现同步，根据JMM规定还能保证可见性（读取最新主内存数据，结束后写入主内存）。

![image-20210423124817593](/images/synchronized关键字的原理.png)

在HotSpot中，由Mark Word、Class Metadata Address、Array Length三部份组成。

- Mark Word：在Mark Word中有一块内存空间，不同的虚拟机有不同的做法，在其中有一个对应的状态关键字State对应有锁还是无锁，是轻量级锁还是重量级锁，是否被GC了。左边bitfields中存放的是数据，不同的状态下存放对应的数据。  
- Class Metadata Address：存储对对象（Class）的描述，例如类中的某个属性对应哪一块内存地址。
- Array Length：存储数据的格式。

在JVM中，加锁会经历：偏向锁 -> 轻量级锁 -> 重量级锁这四个状态。

偏向锁：本质就是无锁，如果没有发生任何多线程争抢锁的情况，JVM认为就是单线程，无需做同步。

![image-20210429101554456](/images/JVM-从偏向锁到重量级锁的过程.png)

重量级锁 - 监视器（monitor）

![image-20210429101903740](/images/重量级锁监视器(monitor)原理.png)


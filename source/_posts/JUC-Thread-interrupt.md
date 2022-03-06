---
title: 优雅的中断线程
tags:
  - Juc并发包
abbrlink: 5f59eead
date: 2021-04-12 16:20:43
description: >-
  不推荐使用 stop、suspend、resume 这三个过期作废的方法，因为有可能会发生不可预料的结果而且出现错误后还比较难定位。大多数情况下，停止一个线程使用  Thread.interrupt() 方法，但是这个方法不会终止一个正在运行状态的线程，还需要加入一些判断才能完成停止线程。
---

不推荐使用 stop、suspend、resume 这三个过期作废的方法，因为有可能会发生不可预料的结果而且出现错误后还比较难定位。

不推荐使用 Thread.stop() 的原因。这个方法是从外面让线程**强制停止**，如果停止的线程持有一个临界锁， 把一个对象置于一个不一致的状态（包含临界、持久化、游离），说白了就是造成数据不一致的结果。大多数情况下，停止一个线程使用  Thread.interrupt() 方法，但是这个方法不会终止一个正在运行状态的线程，还需要加入一些判断才能完成停止线程。

在Java中有3种方式停止正在运行的线程：

​		1、使用退出标志，正常退出；

​		2、使用 stop()， 强行终止；

​		3、使用 interrupt() 方法，中断线程；

## interrupt() 初体验

​	一上来就按照下面这种方式运行：

``` java
public class ThreadInterrupt {
    public static void main(String[] args) throws InterruptedException {
        MyThread myThread = new MyThread();
        myThread.start();
        Thread.sleep(1000);
        myThread.interrupt();
        System.out.println("mrdjun");
    }
}

class MyThread extends Thread {
    @Override
    public void run() {
        super.run();
        for (int i = 0; i < 1000000; i++) {
            System.out.println("i=" + (i + 1));
        }
    }
}
```

发现结果输出了 **1000000** 行，而且 mrdjun 还输出在了中间，说明 interrupt 并没有让线程停下来。

## 判断线程是否为停止状态

​	下面Java提供了两个判断线程是否为停止状态的方法。

​	public static boolean interrupted() ：使用 Thread.interrupted() 测试当前线程是否已经中断，执行后清楚状态标志值为 false 的功能。

​	public boolean this.isInterrupted()： 测试 this 关键字所在类的对象是否已经中断，不清楚标志。

``` java
public class ThreadInterrupt {
    public static void main(String[] args) throws InterruptedException {
        MyThread myThread = new MyThread();
        myThread.start();
        Thread.sleep(1000);
        myThread.interrupt(); // 作用于 myThread 对象
        // isInterrupted 测试当前线程是否已经中断
        System.out.println("线程是否停止？"+myThread.isInterrupted());
        System.out.println("线程是否停止？"+myThread.isInterrupted());
    }
}
```

​		补充一点：也可以使用 Thread.interrupted() 来判断当前线程是否已经中断，因为在 Thread.java 这个类中调用静态static方法的时候，大多数是针对 currentThread() 线程进行操作的。

``` java
public class ThreadInterrupt {
    public static void main(String[] args) throws InterruptedException {
      	Thread.currentThread().interrupt(); // 作用于 Thread
        // isInterrupted 测试当前线程是否已经中断
        System.out.println("线程是否停止？"+ Thread.interrupted()); // 输出 true
        System.out.println("线程是否停止？"+ Thread.interrupted()); // 输出 false
        System.out.println("END!");
    }
}
```

出乎意料的是结果输出不一致，查看官方帮助文档中的 interrupted() 解释：

> 测试当前线程是否已经中断。线程的中断状态由该方法清除。换句话说，如果连续两次调用该方法，则第二次调用将返回false（在第一次调用已清除了其中断状态之后，且第二次调用检验完中断状态前，当前线程再次中断的情况除外）。

isInterrupted() 的方法声明如下：

``` java
public boolean isInterrupted();
```

很显然，这个方法不是一个static方法，作用于这个方法的对象，如下。

``` java
public class ThreadInterrupt {
    public static void main(String[] args) throws InterruptedException {
        MyThread myThread = new MyThread();
        myThread.start();
        Thread.sleep(1000);
	    myThread.interrupt();
        System.out.println("线程是否停止？" + myThread.isInterrupted()); // 输出 true
        System.out.println("线程是否停止？" + myThread.isInterrupted()); // 输出 true
        System.out.println("END!");
    }
}
```

综上所述，两者区别如下：

（1）Thread.interrupted() 测试线程是否已经中断，执行后具有清除状态标志值为false的功能；

（2）new Thread().isInterrupted() 测试线程Thread对象是否已经是中断状态，不清除状态标志；

## 能停止的线程——异常法

​	在main方法中两秒后调用 Thread 对象的 myThread.interrupt() 方法，在线程中的for循环中加入 if 判断后面的代码是否可以运行。

``` java
public class ThreadInterrupt {
    public static void main(String[] args) throws InterruptedException {
        MyThread myThread = new MyThread();
        myThread.start();
        Thread.sleep(500);
        myThread.interrupt();
    }
}

class MyThread extends Thread {
    @Override
    public void run() {
        super.run();
        try {
            for (int i = 0; i < 5000000; i++) {
                if (interrupted()) {
                    System.out.println("线程已经停止");
                    // 退出当前循环，如果为 return; 或 throw new InterruptedException() 则直接退出当前线程
                    throw new InterruptedException();
                }
                System.out.println("i=" + (i + 1));
            }
            System.out.println("for循环外面的语句");
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

抛出异常方式详情：

``` java
public class ThreadInterrupt {
    public static void main(String[] args) {
        try {
            MyThread myThread = new MyThread();
            myThread.start();
            Thread.sleep(1000);
            myThread.interrupt();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}

class MyThread extends Thread {
    @Override
    public void run() {
        super.run();
        try {
            for (int i = 0; i < 5000000; i++) {
                if (interrupted()) {
                    System.out.println("线程已经停止");
                    throw new InterruptedException();
                }
                System.out.println("i=" + (i + 1));
            }
            System.out.println("for循环外面的语句");
        } catch (Exception e) {
            System.out.println("抛出异常");
            e.printStackTrace();
        }
    }
}
```

通过下面的运行结果可以看出，线程终于被正确的停止了。

```java
i=312961
i=312962
线程已经停止
抛出异常
java.lang.InterruptedException
	at com.fun.async.test.class03.MyThread.run(ThreadInterrupt.java:34)
```

## 在 sleep 状态下停止线程

``` java
public class SleepThreadInterrupt {
    public static void main(String[] args) {
        try {
            MyThread thread = new MyThread();
            thread.start();
            Thread.sleep(200); // 先sleep 在调用 interrupt
            thread.interrupt();
            System.out.println("complete!");
        } catch (InterruptedException e) {
            System.out.println("main catch");
            e.printStackTrace();
        }
    }

    static class MyThread extends Thread{
        @Override
        public void run() {
            super.run();
            try {
                System.out.println("run start ...");
                Thread.sleep(200000);
                System.out.println("run end!");
            } catch (InterruptedException e) {
                System.out.println("在sleep中停止，进入catch！"+this.isInterrupted());
                e.printStackTrace();
            }
        }
    }
}
```

从下面的输出结果来看，如果线程在 sleep 状态下停止，则该线程会进入 catch 语句，并且清除停止状态值，变成false。

``` java
run start ...
complete!
在sleep中停止，进入catch！false
java.lang.InterruptedException: sleep interrupted
	at java.lang.Thread.sleep(Native Method)
	at com.fun.async.test.class03.SleepThreadInterrupt$MyThread.run(SleepThreadInterrupt.java:26)

```

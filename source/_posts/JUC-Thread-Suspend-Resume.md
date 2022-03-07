---
title: 线程Suspend & Resume
tags:
  - Juc并发包
description: suspend和resume方法已经遗弃了。suspend()用于线程挂起，被挂起的线程必须要等到调用resume()方法后才能继续执行。
abbrlink: 64fda4e0
date: 2021-06-07 21:15:16
---

| 方法名  | 用途         |
| ------- | ------------ |
| suspend | 线程暂停     |
| resume  | 恢复线程执行 |



## 一、基本应用

一个案例看懂 suspend() 与 resume() 的基本应用：

```java
public class ThreadSuspendAndResume {
    public static void main(String[] args) throws InterruptedException {
        MyThread myThread = new MyThread();
        myThread.start();
        Thread.sleep(500); // 让线程执行500毫秒

        // A段
        myThread.suspend(); // 暂停
        System.out.println("A=" + System.currentTimeMillis() + " i=" + myThread.i); // 查看暂停之后的结果
        Thread.sleep(500);
        System.out.println("A=" + System.currentTimeMillis() + " i=" + myThread.i); // 查看500毫秒后的结果

        // B段
        myThread.resume();// 暂停500毫秒之后，使用resume恢复
        Thread.sleep(500);

        myThread.suspend();
        System.out.println("B=" + System.currentTimeMillis() + " i=" + myThread.i);
        Thread.sleep(500);
        System.out.println("B=" + System.currentTimeMillis() + " i=" + myThread.i);

        myThread.stop(); // 销毁线程对象
        System.out.println("END!");
    }
}

class MyThread extends Thread {
    public long i = 0;

    @Override
    public void run() {
        while (true) {
            i++;
        }
    }
}
```

执行结果：

```
A=1613381037365 i=389072852
A=1613381037868 i=389072852
B=1613381038373 i=784162715
B=1613381038889 i=784162715
END!
```

从控制台上的时间和数值来看，线程的确是被暂停了，而且可以恢复成运行状态。

## 二、缺点——独占

这两个方法在使用不当的情况下，极易造成公共同步对象被独占，造成**死锁**（其他线程无法访问公共同步对象）的结果。

独占案例：

```java
public class SuspendResumeDealLock {

    public static void main(String[] args) {
        SuspendResumeDealLock that = new SuspendResumeDealLock();

        Thread thread1 = new Thread() {
            @Override
            public void run() {
                System.out.println("线程a启动");
                that.printString();
            }
        };

        thread1.setName("a");
        thread1.start();

        Thread thread2 = new Thread() {
            @Override
            public void run() {
                System.out.println("线程2启动");
                that.printString();
                System.out.println("线程2完成打印!!!!!");
            }
        };

        thread2.start();
    }

    synchronized public void printString() {
        System.out.println("begin");
        if (Thread.currentThread().getName().equals("a")) {
            System.out.println("线程a进入永远暂停");
            Thread.currentThread().suspend();
        }
        System.out.println("end");
    }
}
```

打印结果：

```
线程a启动
线程2启动
begin
线程a进入永远暂停

```

a线程把 printString() 方法锁定了，造成 thread2 无法进入 printString()。

## 三、缺点——数据不完整

在使用suspend()方法和resume()方法时，容易出现线程暂停进而导致数不完整的情况。下面这个案例就是一个数据不完整的实例：

```java
public class SuspendResumeDealLock_3 {
    private String username = "1";
    private String password = "11";

    public void setValue(String u, String p) {
        this.username = u;
        if (Thread.currentThread().getName().equals("a")) {
            System.out.println("暂停线程a");
            Thread.currentThread().suspend();
        }
        this.password = p;
    }

    public void printUsernamePassword() {
        System.out.println(username + " " + password);
    }

    public static void main(String[] args) throws InterruptedException {
        new Run();
    }
}

class Run {
    public Run() throws InterruptedException {
        final SuspendResumeDealLock_3 myObject = new SuspendResumeDealLock_3();

        Thread thread = new Thread() {
            @Override
            public void run() {
                myObject.setValue("a", "aa");
            }
        };

        thread.setName("a");
        thread.start();

        Thread.sleep(1000);

        Thread thread1 = new Thread() {
            @Override
            public void run() {
                myObject.printUsernamePassword();
            }
        };
        thread1.start();
    }
}
```

运行结果：

```
暂停线程a
a 11
```

线程的暂停和唤醒应当使用 wait()、notify()、notifyAll()方法。


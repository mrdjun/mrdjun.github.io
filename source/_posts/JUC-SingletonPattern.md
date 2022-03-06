---
title: 四种单例模式
date: 2021-08-22 12:12:55
tags:
 - Juc并发包
---

其实在学Spring5源码的时候，就已经罗列了各种单例模式。在此，学习过 java.util.concurrent 包后，站在多线程的角度上分析比较经典的懒汉模式的双重锁校验（又称为DCL懒汉式（Double Check Lock））。

## 逐步进阶，基础版本

```java
private static LazySingleton singleton4;

private static LazySingleton lazy() {
    if (singleton4 == null) {
        singleton4 = new LazySingleton();
    }
    return singleton4;
}
```

存在问题分析：多线程进行访问时，可能多个线程会同时进入if 的作用域中，那么就会创建多个 LazySingleton() 对象，导致这些线程返回的对象地址不一致。

## 普通加锁版本

直接方法加锁，确实能够解决问题，但是性能十分低下。

```java
private static LazySingleton singleton4;

private synchronized static LazySingleton lazy() {
    if (singleton4 == null) {
        singleton4 = new LazySingleton();
    }
    return singleton4;
}
```

## 双重校验加锁版本

​		多线程都可以进入方法和第一个 if 的作用域，锁类的目的是保证只能有一个线程进入当前类后进入第二个if作用域创建实例对象，随后解锁，让其它进入第一个if作用域的阻塞线程在判断一次是否为空。
​		虽然性能是提升了，但是真的线程安全吗？并发下的指令重排是会出问题的，分析： singleton4 = new LazySingleton() 不是原子性操作，有三个步骤： ①分配内存空间 ②执行构造方法并实例化对象 ③ 分配内存地址，把这个对象指向这个空间。CPU执行时不一定是按照123执行的，如果按照执行顺序是132，第3步先执行的话，还没有完成实例化，就指向这个空间了，此时的 singleton4 不为空，下一个线程进入方法的第一个if判断走false，直接返回这个对象，此时的这个 singleton4 并没有完成实例化！所以就会导致数据不一致的问题。

​	volatile 有三大特性：1、可见性；2、禁止指令重排；3、不保证原子性。所以使用volatile 关键字修饰即可。

```java
private volatile static LazySingleton singleton4;

private static LazySingleton lazy2() throws InterruptedException {
    if (singleton4 == null) {
        synchronized (LazySingleton.class) {
            if (singleton4 == null) {
                singleton4 = new LazySingleton();
            }
            return singleton4;
        }
    }
    return singleton4;
}
```

## 单例模式被破坏的情况

破坏单例模式的意思就是：一个单例对象存在多个。

反射、序列化、克隆都会破坏单例模式。

解决方案：枚举单例模式、容器式单例模式（ConcurrentHashMap）、线程隔离式单例模式（ThreadLocal）

尝试破坏枚举单例模式：

```java
private enum Lazy4 {
    INSTANCE;

    public static Lazy4 getInstance() {
        return INSTANCE;
    }
}

public static void main(String[] args) throws Exception {
        Lazy4 instance1 = Lazy4.INSTANCE;
        Constructor<Lazy4> declaredConstructor = Lazy4.class.getDeclaredConstructor(String.class, int.class);
        declaredConstructor.setAccessible(true);
        Lazy4 instance2 = declaredConstructor.newInstance(); 
        System.out.println(instance1); System.out.println(instance2);
    }
```


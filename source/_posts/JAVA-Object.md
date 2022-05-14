---
title: Object类
abbrlink: 7ace31b3
date: 2021-02-05 14:33:47
tags:
  - JAVA
description: >-
  Object 类是一个特殊的类，是所有类的父类。它主要提供了 11 个方法。
---

```java
// native 方法，用于返回当前运行时对象的 Class 对象，使用了final 关键字修饰，不允许子类重写。
public final native Class<?> getClass()

 // native 方法，用于返回对象的哈希码，主要使用在哈希表中，比如 JDK 中的HashMap。
public native int hashCode()

//用于比较 2 个对象的内存地址是否相等，String 类对该方法进行了重写用户比较字符串的值是否相等。
public boolean equals(Object obj)

//naitive 方法，用于创建并返回当前对象的一份拷贝。一般情况下，对于任何对象 x，表达式 x.clone() != x 为 true，x.clone().getClass()== x.getClass() 为 true。Object 本身没有实现 Cloneable 接口，所以不重写 clone 方法并且进行调用的话会发生CloneNotSupportedException 异常。
protected native Object clone() throws CloneNotSupportedException

//返回类的名字@实例的哈希码的 16 进制的字符串。建议 Object 所有的子类都重写这个方法。
public String toString()

//native 方法，并且不能重写。唤醒一个在此对象监视器上等待的线程(监视器相当于就是锁的概念)。如果有多个线程在等待只会任意唤醒一个。
public final native void notify()

//native 方法，并且不能重写。跟 notify 一样，唯一的区别就是会唤醒在此对象监视器上等待的所有线程，而不是一个线程。
public final native void notifyAll()

//native 方法，并且不能重写。暂停线程的执行。注意：sleep 方法没有释放锁，而 wait 方法释放了锁 。timeout 是等待时间。
public final native void wait(long timeout) throws InterruptedException

//多了 nanos 参数，这个参数表示额外时间（以毫微秒为单位，范围是 0-999999）。 所以超时的时间还需要加上 nanos 毫秒。
public final void wait(long timeout, int nanos) throws InterruptedException

//跟之前的 2 个 wait 方法一样，只不过该方法一直等待，没有超时时间这个概念
public final void wait() throws InterruptedException

//实例被垃圾回收器回收的时候触发的操作
protected void finalize() throws Throwable { }
```


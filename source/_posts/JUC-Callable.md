---
title: Callable
date: 2022-03-04 14:28:34
tags:
  - Juc并发包
---

Callable是一个无入参，有返回值，可抛异常的一个接口，源码如下：

```java
@FunctionalInterface
public interface Callable<V> {
    V call() throws Exception;
}

// Runnable接口既无返回值，也无入参，不能抛异常
@FunctionalInterface
public interface Runnable {
    abstract void run();
}
```

通常用于带返回值的线程，在线程执行完毕后回调一下这个接口，实现 Callable\<T\> 接口创建线程示例：

```java
public class ThreadCallable {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        // FutureTask是个适配类，适配器模式
        FutureTask<String> futureTask = new FutureTask<>(new MyThread0403());
        new Thread(futureTask,"A").start();
        String result = futureTask.get();
        System.out.println(result);
    }
}

// 实现 Callable<T> 接口
class MyThread0403 implements Callable<String> {
    @Override
    public String call() throws Exception {
        System.out.println(Thread.currentThread().getName()+"--->Call()");
        return "1024";
    }
}
```

**FutureTask**

FutureTask 实现了RunnableFuture接口，对Runnable接口和Callable接口的线程做了适配。

```java
public class FutureTask<V> implements RunnableFuture<V> {}

// RunnableFuture接口继承与Runnable，FutureTask间接的实现了Runnable接口
public interface RunnableFuture<V> extends Runnable, Future<V> {}
```

FutureTask 是可取消式的异步计算，该类提供了一个Future的基本实现，具有启动和取消计算的方法，查询计算是否完整，并检索计算结果。 结果只能在计算完成后才能检索; 如果计算尚未完成，则get方法将阻止。 一旦计算完成，则无法重新启动或取消计算（除非使用 runAndReset() 方法调用计算 ）。 


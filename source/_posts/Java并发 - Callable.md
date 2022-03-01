---
title: Callable接口
date: 2021-04-10 20:40:00
tags:
- JUC并发包
comments: false
description: 线程创建的入口接口之一，可抛异常、可带返回值。例如常用的 FutureTask 的源码中就用到了该接口。
---

多线程的第三种创建方式，可抛异常、可带返回值。

实现 Callable\<T\> 接口创建线程示例：

```java
public class ThreadCallable {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        FutureTask<String> futureTask = new FutureTask<>(new MyThread0403());
        new Thread(futureTask,"A").start();
        String result = futureTask.get();
        System.out.println(result);
    }
}
// 实现 Callable<T> 接口,T是返回值的类型
class MyThread0403 implements Callable<String> {
    @Override
    public String call() throws Exception {
        System.out.println(Thread.currentThread().getName()+"--->Call()");
        return "1024";
    }
}
```

上面使用的是 Thread 类中的 public Thread(Runnable target, String name) 这个构造函数，只能接收 Runnable 对象，点进FutureTask：

```java
// 再点进 RunnableFuture
public class FutureTask<V> implements RunnableFuture<V> {}

// RunnableFuture接口继承与Runnable，FutureTask间接的实现了Runnable接口
public interface RunnableFuture<V> extends Runnable, Future<V> {}
```

Future.get() 由于线程执行的call方法中可能会使用耗时操作，所以可能会产生阻塞，一般将该线程放在最后执行，或者使用异步同行来执行
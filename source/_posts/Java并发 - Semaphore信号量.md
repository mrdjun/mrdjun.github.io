---
title: 信号量 Semaphore
date: 2021-05-14 17:18:00
tags:
  - JUC并发包
comments: false
description: 应用场景：多个共享资源互斥、并发限流（如Hystrix）。信号量是操作系统中，实现进程间资源的互斥与同步。信号量维护了一组许可证，以约束访问被限制资源的线程数。
---

# Java并发 - 信号量 Semaphore

应用场景：多个共享资源互斥、并发限流（如Hystrix）。

信号量是操作系统中，实现进程间资源的互斥与同步。信号量维护了一组许可证，以约束访问被限制资源的线程数。

Java并发包中的 Semaphore 可以控制某个资源被同时访问的任务数，它通过acquire（）获取一个许可，release（）释放一个许可。可以通过availablePermits() 方法得到可用的许可数量。

如果被同时访问的任务数已满，则其他acquire的任务进入等待状态，直到有一个任务被release掉，它才能得到许可。

## 一、应用示例

```java
public void testSemaphore() {
    // 允许量为3，假设为3个停车位
    Semaphore semaphore = new Semaphore(3);

    for (int i = 0; i < 6; i++) {
        new Thread(() -> {
            try {
                semaphore.acquire();
                System.out.println(Thread.currentThread().getName() + "抢到车位");
                TimeUnit.SECONDS.sleep(2);
                System.out.println(Thread.currentThread().getName() + "离开车位");
            } catch (InterruptedException e) {
                e.printStackTrace();
            } finally {
                semaphore.release();
            }

        }, "" + i).start();
    }
}
```

运行结果

```
0抢到车位
1抢到车位
2抢到车位
1离开车位
2离开车位
0离开车位
4抢到车位
3抢到车位
5抢到车位
3离开车位
5离开车位
4离开车位
```

## 二、源码阅读

Semaphore使用的是AQS的机制

```java
public class Semaphore implements java.io.Serializable {
     private final Sync sync;
     abstract static class Sync extends AbstractQueuedSynchronizer {...}
    ...
}
```

Semaphore是如何获取信号量的？

```java
public final void acquireSharedInterruptibly(int arg)
    throws InterruptedException {
    if (Thread.interrupted())
        throw new InterruptedException();
    // 信号量是非独占资源，使用共享锁来获取信号量
    if (tryAcquireShared(arg) < 0)
        doAcquireSharedInterruptibly(arg);
}
```


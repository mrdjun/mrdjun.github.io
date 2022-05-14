---
title: Semaphore信号量
tags:
  - JUC并发包
description: Semaphore应用场景有多个共享资源互斥、并发限流（如Hystrix）等，核心接口是AQS，信号量是操作系统中，实现进程间资源的互斥与同步。
abbrlink: f353d57c
date: 2022-03-06 17:11:11
---

应用场景：多个共享资源互斥、并发限流（如Hystrix）。

## 什么是信号量？

信号量是操作系统中，实现进程间资源的互斥与同步。信号量维护了一组许可证，以约束访问被限制资源的线程数。

## Java中的Semaphore

Java并发包中的 Semaphore 可以控制某个资源被同时访问的任务数，其主要方法有：

- void acquire()：从此信号量获取一个许可，在提供一个许可前一直将线程阻塞，否则线程被中断。
- void release()：释放一个许可，将其返回给信号量。
- int availablePermits()：返回此信号量中当前可用的许可数。
- boolean hasQueuedThreads()：查询是否有线程正在等待获取。

如果被同时访问的任务数已满，则其他acquire的任务进入等待状态，直到有一个任务被release掉，它才能得到许可。

### 应用示例

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

```tex
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

Semaphroe底层也是用Sync类，默认是非公平的，也有公平的构造方法。

```java
public Semaphore(int permits, boolean fair) {
    sync = fair ? new FairSync(permits) : new NonfairSync(permits);
}
```

定义的许可数，实际是设置锁的状态值的

```java
abstract static class Sync extends AbstractQueuedSynchronizer {
    Sync(int permits) {
        setState(permits);
    }
}
```

### 为什么Semaphore能限制同时执行的线程数？

这就是`acquire()`的用处了

```java
public void acquire(int permits) { 
	sync.acquireSharedInterruptibly(permits);
}
```

点进Semaphore中的内部类Sync的 `acquireSharedInterruptibly`这个方法

```java
public final void acquireSharedInterruptibly(int arg)
    throws InterruptedException {
    if (Thread.interrupted())
        throw new InterruptedException();
    // 尝试获取锁，返回值小于0就是获取锁失败
    // 信号量是非独占资源，使用共享锁来获取信号量
    if (tryAcquireShared(arg) < 0)
        // 如果获取失败，则进入队列进行等待，之前已经解析过
        doAcquireSharedInterruptibly(arg);
}
```

在`doAcquireSharedInterruptibly` 方法中会死循环遍历队列中等待的线程，不断的调用 `tryAcquireShared` 方法。

```java
private void doAcquireSharedInterruptibly(int arg)
    throws InterruptedException {
    final Node node = addWaiter(Node.SHARED);
    boolean failed = true;
    try {
        for (;;) {
            final Node p = node.predecessor();
            if (p == head) {
                // 轮到的线程调用该方法获取当前的许可数
                int r = tryAcquireShared(arg);
                if (r >= 0) {
                    setHeadAndPropagate(node, r);
                    p.next = null; // help GC
                    failed = false;
                    return;
                }
            }
            if (shouldParkAfterFailedAcquire(p, node) &&
                parkAndCheckInterrupt())
                throw new InterruptedException();
        }
    } finally {
        if (failed)
            cancelAcquire(node);
    }
}
```

`tryAcquireShared` 方法有`NonfairSync` 和 `FairSync` 两个类的实现：

```java
//----------------------- NonfairSync -------------------------//
protected int tryAcquireShared(int acquires) {
    // 获取到时间片的线程，只要有许可就直接分配
    return nonfairTryAcquireShared(acquires);
}
final int nonfairTryAcquireShared(int acquires) {
    for (;;) {
        // 获取当前锁状态，锁状态值一开始是自定义的
        int available = getState();
        // 当前申请后剩余的锁状态值
        int remaining = available - acquires;
        if (remaining < 0 ||
            // CAS替换锁状态值
            compareAndSetState(available, remaining))
            return remaining;
    }
}
//----------------------- FairSync -------------------------//
protected int tryAcquireShared(int acquires) {
    for (;;) {
        // 判断当前线程在队列中的位置，是否轮到该线程了
        if (hasQueuedPredecessors())
            return -1;
        int available = getState();
        int remaining = available - acquires;
        if (remaining < 0 ||
            compareAndSetState(available, remaining))
            return remaining;
    }
}
```

### Semaphore释放锁

线程获取执行资格之后需要释放锁，当前线程不释放锁的话，会导致其它线程无法进入获取许可。释放锁调用的是AQS中的relase方法：

```java
public void release(int permits) {
    if (permits < 0) throw new IllegalArgumentException();
    sync.releaseShared(permits);
}

public final boolean releaseShared(int arg) {
    if (tryReleaseShared(arg)) {
        doReleaseShared();
        return true;
    }
    return false;
}

protected final boolean tryReleaseShared(int releases) {
    for (;;) {
        // 获取锁当前状态
        int current = getState();
        // 释放锁前先恢复许可数
        int next = current + releases;
        if (next < current) // overflow
            throw new Error("Maximum permit count exceeded");
        // 用CAS更新锁状态
        if (compareAndSetState(current, next))
            return true;
    }
}
```


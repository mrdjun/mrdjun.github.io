---
title: AQS抽象队列同步器
date: '2021‎-05‎-‎13‎ 11:54:34'
tags:
  - Juc并发包
abbrlink: 290c6541
---

AQS全称为AbstractQueuedSynchronizer，提供了对资源占用、释放，线程等待、唤醒等接口和具体实现。可以用在各种需要控制资源争用的场景，例如ReentrantLock、CountDownLatch、Semphore中。

## AQS组成部分

![image-20210513220313583](JUC-AbstractQueuedSynchronizer\AQS-接口.png)

acquire、acquireShared：定义了资源争用的逻辑，如果没拿到则等待。

tryAcquire、tryAcquireShared：实际执行占用资源的操作，如何判断一个由使用者具体去实现。

release、releaseShared：定义释放资源的逻辑，释放之后通知后续节点进行争抢。

tryRelease、tryReleaseShared：实际执行资源释放的操作，具体由使用者去实现。

## 简单应用AQS

通过这个实例加深对AQS的理解，为看懂源码打下一定的基础。

```java
public class MyAqs {
    // 占用当前资源的线程
    public volatile AtomicReference<Thread> owner = new AtomicReference<>();
    // 保存等待的线程
    public volatile LinkedBlockingQueue<Thread> waiters = new LinkedBlockingQueue<>();
    // 记录资源状态
    public volatile AtomicInteger state = new AtomicInteger(0);
    
    public void acquire() {
        boolean addQ = true;
        while (!tryAcquire()) {
            if (addQ) {
                // 没拿到锁，加入到等待集合
                waiters.offer(Thread.currentThread());
                addQ = false;
            } else {
                // 阻塞、挂起当前的线程
                LockSupport.park(); 
            }
        }
        // 当前线程拿到锁后，移除当前线程
        waiters.remove(Thread.currentThread()); 
    }
    
    /**
     * 交由使用者自己实现
     */
    public boolean tryAcquire() { 
        throw new UnsupportedOperationException();
    }
    
    public void release() {
        if (tryRelease()) {
            // 通知等待者
            Iterator<Thread> iterator = waiters.iterator();
            if (iterator.hasNext()) {
                Thread next = iterator.next();
                // 当前线程释放资源后，唤醒下一个线程
                LockSupport.unpark(next); 
            }
        }
    }
    
    public boolean tryRelease() {
        throw new UnsupportedOperationException();
    }
    
    //================== 共享资源逻辑 ==================//
    public void acquireShared() {
        boolean addQ = true;
        while (tryAcquireShared() < 0) {
            if (addQ) {
                waiters.offer(Thread.currentThread());
                addQ = false;
            } else {
                LockSupport.park(); 
            }
        }
        waiters.remove(Thread.currentThread());
    }
    
    public int tryAcquireShared() {
        throw new UnsupportedOperationException();
    }
	
    public void releaseShared() {
        if (tryReleaseShared()) {
            Iterator<Thread> iterator = waiters.iterator();
            if (iterator.hasNext()) {
                Thread next = iterator.next();
                LockSupport.unpark(next);
            }
        }
    }
    
    public boolean tryReleaseShared() {
        throw new UnsupportedOperationException();
    }
    
    // 给使用者提供状态修改方法
    public AtomicInteger getState() {
        return state;
    }

    public void setState(AtomicInteger state) {
        this.state = state;
    }
}
```

## AQS源码阅读

源码中等待队列维护的是一个链表，而不是我们上面使用的BlockingQueue。

在独占模式下忽略中断的情况获取锁。如果没有拿到锁则当前线程存入队列等待后，不断尝试获取锁，具体代码在acquireQueued() 中。

```java
public final void acquire(int arg) {
    // 判断是否拿到锁
    if (!tryAcquire(arg) && acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}

protected boolean tryAcquire(int arg) {
    throw new UnsupportedOperationException();
}
```

如果第一次执行tryAcquire() 没有拿到锁，则当前线程将进行自旋，直到成功拿到锁。

```java
final boolean acquireQueued(final Node node, int arg) {
    boolean failed = true;
    try {
        boolean interrupted = false; // 当前线程释放中断的标志位
        for (;;) {// 不断尝试
            final Node p = node.predecessor(); // 获取前一个节点
            if (p == head && tryAcquire(arg)) { // 如果前一个节点是head，尝试抢一次锁
                setHead(node); // 更换head
                p.next = null; // help GC
                failed = false;
                return interrupted;
            }
            // 检查在当前节点之前的线程节点状态，是否需要挂起线程
            if (shouldParkAfterFailedAcquire(p, node) &&
                parkAndCheckInterrupt())// 如果需要挂起，则通过Park进入停车场挂起
                interrupted = true; // 如果出现中断，则修改标记
        }
    } finally {
        if (failed)
            cancelAcquire(node);
    }
}

final Node predecessor() throws NullPointerException {
    // 当前节点前如果没有其它节点，那就肯定是head节点
    Node p = prev;
    if (p == null)
        throw new NullPointerException();
    else
        return p;
}

private static boolean shouldParkAfterFailedAcquire(Node pred, Node node) {
    int ws = pred.waitStatus; // 根据 前置节点的状态 执行不同的流程
    if (ws == Node.SIGNAL) // 前置节点释放锁之后会通知当前线程，挂起吧
        /*
         * This node has already set status asking a release
         * to signal it, so it can safely park.
         */
        return true;
    if (ws > 0) { // 前置节点处于CANCELLED状态，跳过它继续寻找正常的节点，并且甩掉中间那段不正常的节点
        /*
         * Predecessor was cancelled. Skip over predecessors and
         * indicate retry.
         */
        do { // 也可以理解为，这是一次队列检查
            node.prev = pred = pred.prev;
        } while (pred.waitStatus > 0);
        pred.next = node;
    } else {
        /*
         * waitStatus must be 0 or PROPAGATE.  Indicate that we
         * need a signal, but don't park yet.  Caller will need to
         * retry to make sure it cannot acquire before parking.
         */
        compareAndSetWaitStatus(pred, ws, Node.SIGNAL); // 修改前置的状态为SIGNAL，用意是释放锁之后会通知后续节点
    }
    return false;
}
```

释放资源。解锁成功后，单向链表中的线程节点往后移，唤醒下一个状态正常的线程。

```java
public final boolean release(int arg) {
    if (tryRelease(arg)) {
        Node h = head; // 从头开始找
        if (h != null && h.waitStatus != 0)
            unparkSuccessor(h); // 唤醒下一个线程
        return true;
    }
    return false;
}

protected boolean tryRelease(int arg) {
    throw new UnsupportedOperationException();
}

private void unparkSuccessor(Node node) {
    /*
     * If status is negative (i.e., possibly needing signal) try
     * to clear in anticipation of signalling.  It is OK if this
     * fails or if status is changed by waiting thread.
     */
    int ws = node.waitStatus; // 正在释放锁的线程节点状态
    if (ws < 0)
        compareAndSetWaitStatus(node, ws, 0); // 修改当前节点状态

    /*
     * Thread to unpark is held in successor, which is normally
     * just the next node.  But if cancelled or apparently null,
     * traverse backwards from tail to find the actual
     * non-cancelled successor.
     */
    Node s = node.next; // 找下一个节点
    if (s == null || s.waitStatus > 0) { // 如果不存在或者被取消了，继续寻找合适的下一个节点
        s = null;
        for (Node t = tail; t != null && t != node; t = t.prev)
            if (t.waitStatus <= 0)
                s = t;
    }
    if (s != null) // 如果找到了合适的节点，就唤醒它
        LockSupport.unpark(s.thread);
}
```

##  总结

资源占用的完整流程

![image-20210514131357784](JUC-AbstractQueuedSynchronizer\AQS-资源占用流程.png)


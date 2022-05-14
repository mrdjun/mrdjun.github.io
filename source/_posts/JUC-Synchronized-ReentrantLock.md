---
title: Synchronized VS Lock
tags:
  - JUC并发包
description: >-
  两者都是可重入锁，synchronized依赖JVM(Monitor)实现；ReenTrantLock依赖JDK的API实现。自JDK1.6引入偏向锁的概念后，synchronized性能与ReentrantLock相差不大，甚至官方建议使用synchronized。
abbrlink: ace4e0d0
---

[synchronized 文章阅读地址](https://mrdjun.gitee.io/p/8360cd4.html)

[ReetrantLock & ReadWriteLock 文章阅读地址](https://mrdjun.gitee.io/p/5fd8877a.html)



| 不同点   | synchronized      | lock                                                |
| -------- | ----------------- | --------------------------------------------------- |
| 实现方式 | 基于JVM对象监视器 | 实现了AQS接口，通过JDK的 API 执行底层的操作系统指令 |
| 高级特性 | 可重入、非公平    | 可重入、可中断、可选择（非）公平、可选择性通知线程  |
| 性能方面 | jdk1.6前性能较差  | jdk1.5引入，将同步Synchronized替换成显式Lock操作    |

- Lock：用于替代 synchronized
      lock 
      unlock
      newCondition()

- Condition：用于替代 Object wait notify notifyAll
      await();
      signal();
      signalAll();

在JDK1.6后，synchronized的引入了偏向锁、自适应偏向锁等手段使得性能与Lock锁相媲美，甚至JDK官方都建议使用synchronized锁。

> 两者的使用场景？

能用synchronized就用synchronized，在需要用到Lock锁的高级特性，如可中断、指定线程通知、公平锁时就选择Lock锁使用。


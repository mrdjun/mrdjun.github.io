---
title: ForkJoinPool
date: 2021-08-22 12:50:00
tags:
- Java
comments: false
---

​		ForkJoinPool 是ExecutorService 接口的实现，它专为可以递归分解成小块的工作而设计。Java 7开始引入了一种新的Fork/Join线程池，它可以执行一种特殊的任务（Runnable）：把一个大任务拆成多个小任务并行处理，最后将子任务结果合并成最后的计算结果。充分利用多线程处理器的优势，提高程序性能。

## 具有高性能低冲突的原因

- 每个Worker线程都维护一个任务队列，即ForkJoinWorkerThread中的任务队列；

- ForkJoin维护的任务队列是双端队列（DeQueue），可以同时支持LIFO（先进后出）和FIFO（先进先出）；

- 子任务会被加入到原先任务所在 Worker 线程的任务队列；

- 当任务队列为空时，线程会随机从其他的 Worker 的队列中拿走一个任务执行（工作窃取：steal work），工作窃取带来的性能提升偏理论，API的复杂性较高，实际研发中可控性来说不如其他API。

## 缺点

- 如果一个 Worker 线程遇到了 join 操作，而这时候正在处理其他任务，会等到这个任务结束。否则直接返回；

- 如果一个 Worker 线程窃取任务失败，它会调用 yield 或者 sleep 之类的方法休息一会儿，再尝试（如果所有线程都是空闲状态，即没有任务执行，那么该线程也会进入阻塞状态等待新任务的到来）；

## 适用场景

使用尽可能少的线程池，在大多数情况下，最好的决定是为每个应用程序或系统使用一个线程池；

如果不需要特定调整，请使用默认的公共线程池；

使用合理的阈值将ForkJoinTask拆分为子任务；

避免在ForkJoinTask中出现任何阻塞（例如耗时IO，大量查询数据库、网络请求等）；

适合数据处理、结果汇总、统计等场景；

java8实例：java.utilArrays类用于其 parallelSort() 方法；

## 应用示例

例如，下面将从 0 加到 10_0000_0000：

```java
public void test1() {
    long start = System.currentTimeMillis();
    long sum = 0;
    for (long i = 0; i < 10_0000_0000L; i++) {
        sum += i;
    }
    System.out.println(sum + ",耗时：" + (System.currentTimeMillis() - start) + "ms");// 耗时：361ms
}
```

使用 ForkJoinPool 执行该任务：

```java
public void test2() throws ExecutionException, InterruptedException {
    long start = System.currentTimeMillis();

    ForkJoinPool pool = new ForkJoinPool();
    ForkJoinTask<Long> task = new Task04051(0L, 10_0000_0000L);
    ForkJoinTask<Long> submit = pool.submit(task);
    Long result = submit.get();

    System.out.println(result + ",耗时：" + (System.currentTimeMillis() - start) + "ms"); // 耗时：186ms
}
```

使用  stream 并行执行任务：

```java
public void test3() {
    long start = System.currentTimeMillis();
	// 与 LongStream 类似的有DoubleStream、IntegerStream 等
    long sum = LongStream.rangeClosed(0L, num).parallel().reduce(0, Long::sum);

    System.out.println(sum + ",耗时：" + (System.currentTimeMillis() - start) + "ms");// 耗时：126ms
}
```


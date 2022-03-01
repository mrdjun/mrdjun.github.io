---
title: Queue接口及其实现类
date: 2021-06-03 8:33:00
tags:
  - JUC并发包
comments: false
---

​		队列的特点是先进先出，栈的特点是后进先出。Queue继承Collection接口，Stack继承Vector容器类，最顶层接口也是Collection。在Java中容器分为Collection和Map两大类。 Collection家族中除了常见的List、Set，现在又新增一个Queue、Stack。

```java
public interface Queue<E> extends Collection<E> {}
```

### BlockingQueue 的四组API

| 方式         | 抛出异常 | 不抛异常，有返回值 | 阻塞等待 | 超时等待                     |
| ------------ | -------- | ------------------ | -------- | ---------------------------- |
| 入队列       | add      | offer              | put      | offer(Element,Time,TimeUnit) |
| 出队列       | remove   | poll               | take     | poll(,)                      |
| 返回头部元素 | element  | peek               | -        | -                            |

BlockingQueue主要有两个实现：ArrayBlockingQueue、LinkedBlockingQueue。

BlockingQueue的其中一组核心方法（只介绍其中一组，其它三组类似）：

| 方法名                                  | 描述                                                         |
| --------------------------------------- | ------------------------------------------------------------ |
| offer(anObject)                         | 表示如果可以的话，将anObject加到BlockingQueue里，放入成功返回true，否则返回false。 |
| offer(E o, long timeout, TimeUnit unit) | 可以设定等待的时间，如果在指定的时间内，还不能往队列中加入BlockingQueue，则返回失败。 |
| put(anObject)                           | 把anObject加到BlockingQueue里,如果BlockQueue没有空间,则调用此方法的线程被阻断直到BlockingQueue里面有空间再继续。 |
| poll(time)                              | 取走BlockingQueue里排在首位的对象,若不能立即取出,则可以等time参数规定的时间,取不到时返回null。 |
| poll(long timeout, TimeUnit unit)       | 从BlockingQueue取出一个队首的对象，如果在指定时间内，队列一旦有数据可取，则立即返回队列中的数据。否则直到时间超时还没有数据可取，返回失败。 |
| take()                                  | 取走BlockingQueue里排在首位的对象,若BlockingQueue为空,阻断进入等待状态直到BlockingQueue有新的数据被加入;。 |
| drainTo()                               | 一次性从BlockingQueue获取所有可用的数据对象（还可以指定获取数据的个数），通过该方法，可以提升获取数据效率；不需要多次分批加锁或释放锁。 |

在ArrayBlockingQueue中对poll(long timeout, TimeUnit unit) 方法的具体实现：

```java
public E poll(long timeout, TimeUnit unit) throws InterruptedException {
    // 底层统一是以纳秒作为时间的计算单位的
    long nanos = unit.toNanos(timeout);
    final ReentrantLock lock = this.lock;
    lock.lockInterruptibly();
    try {
        // 轮询获取元素出队列
        while (count == 0) {
            if (nanos <= 0)
                return null;
            nanos = notEmpty.awaitNanos(nanos);
        }
        return dequeue();
    } finally {
        lock.unlock();
    }
}
```

**应用示例**

```java
BlockingQueue<String> queue = new ArrayBlockingQueue<>(3);
// 同步队列不存储元素：一个元素进出完成后，下一个元素才能进出。
BlockingQueue<String> syncQueue = new SynchronousQueue<>();
/**
 * 抛异常:
 * add()、remove()、element()
 */
public void test1() {
    // ============== add ============= //
    queue.add("1");
    queue.add("2");
    queue.add("3");
    // 再进一个元素则报错
    queue.add("4");

    // ============== element ============= //
    // 检查队首元素（该操作不会出队列）
    System.out.println(queue.element());

    // ============== remove ============= //
    System.out.println(queue.remove());
    System.out.println(queue.remove());
    System.out.println(queue.remove());
    // 再取一个
    System.out.println(queue.remove());
}
```

```java
/**
 * 不抛异常，有返回值
 * offer()、poll()、peek()
 */
public void test2() {
    // ============== offer ============= //
    queue.offer("1");
    queue.offer("2");
    queue.offer("3");
    // 再添加一个
    System.out.println(queue.offer("4"));

    // ============== poll ============= //
    // 检查队首元素（该操作不会出队列）
    System.out.println(queue.peek());

    // ============== peek ============= //
    queue.poll();
    queue.poll();
    queue.poll();
    System.out.println(queue.size());
    // 再取一个
    System.out.println(queue.poll());
}
```

```java
/**
 * 阻塞等待
 * put、take
 */
public void test3() throws InterruptedException {
    // ============== put ============= //
    queue.put("1");
    queue.put("2");
    queue.put("3");
    // 再添加一个，阻塞
    queue.put("4");

    // ============== take ============= //
    queue.take();
    queue.take();
    queue.take();
    System.out.println(queue.size());
    // 再取一个，阻塞
    queue.take();
}
```

```java
/**
 * 超时等待
 * offer、poll
 */
public void test4() throws InterruptedException {
    queue.offer("1");
    queue.offer("2");
    queue.offer("3");
    // 2s后入队列失败
    System.out.println(queue.offer("4", 2, TimeUnit.SECONDS));

    queue.poll();
    queue.poll();
    queue.poll();
    System.out.println(queue.size());
    // 2s后出队列失败
    System.out.println(queue.poll(2, TimeUnit.SECONDS));
}
```

### SynchronousQueue

同步队列，不存储元素，一个元素进出完成后，下一个元素才能进出。

```java
/**
 * 同步队列
 * 创建两个线程：线程一存取三个元素，线程二读取三个元素
 */
public void test5() {
    new Thread(() -> {
        try {
            System.out.println(Thread.currentThread().getName() + " put 1");
            syncQueue.put("1");
            System.out.println(Thread.currentThread().getName() + " put 2");
            syncQueue.put("2");
            System.out.println(Thread.currentThread().getName() + " put 3");
            syncQueue.put("3");
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }, "A").start();
	
    new Thread(() -> {
        try {
            // 等待两秒再取，确保线程1入队列成功
            TimeUnit.SECONDS.sleep(2);
            System.out.println(Thread.currentThread().getName() + "=>" + syncQueue.take());
            TimeUnit.SECONDS.sleep(2);
            System.out.println(Thread.currentThread().getName() + "=>" + syncQueue.take());
            TimeUnit.SECONDS.sleep(2);
            System.out.println(Thread.currentThread().getName() + "=>" + syncQueue.take());
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }, "B").start();
}
```

### PriorityQueue 优先级队列

PriorityQueue是一个带有优先级的队列，而不是先进先出队列，元素按优先级顺序被移除，该队列也没有上限（即 Integer.MAX_VALUE），无容量限制，自动扩容。

此队列虽然没有容量限制，但是会由于服务器资源耗尽抛OutOfMemoryError异常。

如果队列为空，那么取元素的操作take就会阻塞，所以检索操作take是受阻的。

放入PriorityQueue中的元素需要具有比较能力。

```java
public class PriorityQueueDemo {
    public static void main(String[] args) {
        // 设置比对方式
        PriorityQueue<String> priorityQueue = new PriorityQueue<>(new Comparator<String>() {
            @Override
            public int compare(String o1, String o2) {
                return 0;
            }
        });
        priorityQueue.add("c");
        priorityQueue.add("a");
        priorityQueue.add("b");

        System.out.println(priorityQueue.poll());
        System.out.println(priorityQueue.poll());
        System.out.println(priorityQueue.poll());

		// 定义MessageObject存放的优先级
        PriorityQueue<MessageObject> MessageObjectQueue = new PriorityQueue<>(new Comparator<MessageObject>() {
            @Override
            public int compare(MessageObject o1, MessageObject o2) {
                // Order比较大的MessageObject放后面
                return o1.order > o2.order ? -1 : 1;
            }
        });
    }

    static class MessageObject {
        String content;
        int order;
    }
}
```

下面探寻一下延时队列的实现原理。

```java
public class DelayQueue<E extends Delayed> extends AbstractQueue<E>
    implements BlockingQueue<E> {
    // 基于PriorityQueue来实现的延时队列
    private final PriorityQueue<E> q = new PriorityQueue<E>();
    ...
}
```

DelayQueue的泛型必须实现Delayed接口。

```java
public interface Delayed extends Comparable<Delayed> {
    /**
     * Returns the remaining delay associated with this object, in the
     * given time unit.
     * 这个元素需要在队列中待多久时间
     
     * @param unit the time unit
     * @return the remaining delay; zero or negative values indicate
     * that the delay has already elapsed
     */
    long getDelay(TimeUnit unit);
}
```

**应用示例**

线程池中的定时调度就是使用这样的方法实现的。

```java
public class DelayQueueDemo {
    public static void main(String[] args) throws InterruptedException {
        DelayQueue<Message> delayQueue = new DelayQueue<Message>();
        // 这条消息5秒后发送
        Message message = new Message("message - 00001", new Date(System.currentTimeMillis() + 5000L));
        delayQueue.add(message);

        while (true) {
            System.out.println(delayQueue.poll());
            Thread.sleep(1000L);
        }
    }

    // 实现Delayed接口的元素才能存到DelayQueue
    static class Message implements Delayed {
        String content;
        Date sendTime;

        /**
         * @param content  消息内容
         * @param sendTime 定时发送
         */
        public Message(String content, Date sendTime) {
            this.content = content;
            this.sendTime = sendTime;
        }

        /**
         * 判断当前这个元素是不是已经到了需要被拿出来的时间
         */
        @Override
        public long getDelay(TimeUnit unit) {
            long duration = sendTime.getTime() - System.currentTimeMillis();
            return TimeUnit.NANOSECONDS.convert(duration, TimeUnit.MILLISECONDS);
        }

        @Override
        public int compareTo(Delayed o) {
            return o.getDelay(TimeUnit.NANOSECONDS) > this.getDelay(TimeUnit.NANOSECONDS) ? 1 : -1;
        }
    }
}
```


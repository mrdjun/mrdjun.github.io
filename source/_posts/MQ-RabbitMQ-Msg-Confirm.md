---
title: RabbitMQ消息的发布确认(上)
tags:
  - 消息中间件
  - RabbitMQ
description: 若消息尚未写入磁盘就发生宕机，则消息会发生丢失，如何解决这个问题？
abbrlink: 607540b1
date: 2021-06-29 18:41:00
---

场景描述：消息持久化是指消息保存在磁盘上，如果消息还没来得及写入磁盘就发生宕机，那么消息一样会发生丢失。

解决方案：生产者发送消息的到了所有匹配的队列之后，队列写入磁盘成功后再回复生产者。

> **如何100%确保消息不丢失？**

做好这三步，消息才能绝对不丢失：

①队列持久化

②队列中的消息持久化

③发布确认

## 发布确认原理

​		生产者将信道设置成 confirm 模式，一旦信道进入 confirm 模式，**所有在该信道上面发布的消息都将会被指派一个唯一的 ID**(从 1 开始)，一旦消息被投递到所有匹配的队列之后，broker就会发送一个确认给生产者(包含消息的唯一 ID)，这就使得生产者知道消息已经正确到达目的队列了，如果消息和队列是可持久化的，那么确认消息会在将消息写入磁盘之后发出，broker 回传给生产者的确认消息中 delivery-tag 域包含了确认消息的序列号，此外 broker 也可以设置basic.ack 的 multiple 域，表示到这个序列号之前的所有消息都已经得到了处理。

​		confirm 模式最大的好处在于他是异步的，一旦发布一条消息，生产者应用程序就可以在等信道返回确认的同时继续发送下一条消息，当消息最终得到确认之后，生产者应用便可以通过回调方法来处理该确认消息，如果 RabbitMQ 因为自身内部错误导致消息丢失，就会发送一条 nack 消息，生产者应用程序同样可以在回调方法中处理该 nack 消息。

## 发布确认策略

发布确认默认是没有开启的，如果要开启需要调用方法 confirmSelect。

```java
channel.confirmSelect();
```

发布一条消息确认一次，还是发布一批消息确认一次呢？RabbitMQ提供了以下几种策略：

### 单个发布确认

​		发一条确认一条，确认后才能继续发送下一条。这是一种简单的确认方式，它是一种**同步确认发布**的方式。waitForConfirmsOrDie(long)这个方法只有在消息被确认的时候才返回，如果在指定时间范围内这个消息没有被确认那么它将抛出异常。

​		这种确认方式有一个最大的缺点就是：**发布速度特别慢，**因为如果没有确认发布的消息就会阻塞所有后续消息的发布，这种方式最多提供每秒不超过数百条发布消息的吞吐量。当然对于某些应用程序来说这可能已经足够了。

**代码实现**

```java
static final String QUEUE_NAME = "confirm";
public static void singleConfirm() throws Exception {
    Channel channel = getChannel();
    // 绑定队列
    channel.queueDeclare(QUEUE_NAME, false, false, false, null);
    // 开启发布确认机制
    channel.confirmSelect();
    // 用于统计发送1000条消息花费的时间
    long start = System.currentTimeMillis();

    for (int i = 1; i <= 1000; i++) {
        String msg = "message_" + i;
        channel.basicPublish("", QUEUE_NAME, null, (msg).getBytes(StandardCharsets.UTF_8));
        boolean flag = channel.waitForConfirms();
        if (flag) {
            System.out.println("消息[" + msg + "]发送完成");
        } else {
            System.err.println("消息[" + msg + "]发送失败");
        }
    }
    long end = System.currentTimeMillis();
    System.out.println("发送消息完成，耗时：" + (end - start) + "ms");
}
// 抽取方法
private static Channel getChannel() throws IOException, TimeoutException {
    ConnectionFactory connectionFactory = new ConnectionFactory();
    connectionFactory.setHost("192.168.19.128");
    connectionFactory.setPort(5672);
    connectionFactory.setUsername("admin");
    connectionFactory.setPassword("admin");
    Connection connection = connectionFactory.newConnection();
    return connection.createChannel();
}
```

执行结果

```java
发送消息完成，耗时：686ms
```

### 批量确认发布

单个发布确认的方式非常慢，批量发布与之相比，先发布一批消息然后一起确认可以极大地提高吞吐量，当然这种方式的缺点就是：当发生故障导致发布出现问题时，不知道是哪个消息出现问题了，我们必须将整个批处理保存在内存中，以记录重要的信息而后重新发布消息。当然这种方案仍然是同步的，也一样阻塞消息的发布。

```java
public static void multipleConfirm() throws Exception {
    Channel channel = getChannel();
    // 绑定队列
    channel.queueDeclare(QUEUE_NAME, false, false, false, null);
    // 开启发布确认机制
    channel.confirmSelect();
    // 用于统计发送1000条消息花费的时间
    long start = System.currentTimeMillis();
    // 批量确认消息大小
    int batchSize = 100;

    for (int i = 1; i <= 1000; i++) {
        String msg = "message_" + i;
        channel.basicPublish("", QUEUE_NAME, null, (msg).getBytes(StandardCharsets.UTF_8));
        // 每发布200条消息确认一次
        if (i % batchSize == 0) {
            channel.waitForConfirms();
        }
        System.out.println("消息[" + msg + "]发送完成");
    }
    long end = System.currentTimeMillis();
    System.out.println("发送消息完成，耗时：" + (end - start) + "ms");
}
```

执行结果

```java
发送消息完成，耗时：109ms
```

批量与单个发布确认相比，批量高效了许多，但是可靠性欠缺。还有一种发布确认的策略即高效又可靠。

### 异步确认发布

​		异步确认虽然编程逻辑比上两个要复杂，但是性价比最高，无论是可靠性还是效率都没得说，他是利用回调函数来达到消息可靠性传递的，这个中间件也是通过函数回调来保证是否投递成功，下面就让我们来详细讲解异步确认是怎么实现的。

```java
public static void asyncConfirm() throws Exception {
    Channel channel = getChannel();
    // 绑定队列
    channel.queueDeclare(QUEUE_NAME, false, false, false, null);
    // 开启发布确认机制
    channel.confirmSelect();
    // ack成功的消息回调
    ConfirmCallback ackCallback = (deliveryTag, multiple) -> {
        System.out.println("消息[" + deliveryTag + "]发送完成");
    };
    // ack失败的消息回调 - 暂不处理
    ConfirmCallback nackCallback = (deliveryTag, multiple) -> {
        System.out.println("消息[" + deliveryTag + "]发送失败");
    };
    // 设置监听器 - 异步通知
    channel.addConfirmListener(ackCallback, nackCallback);

    long start = System.currentTimeMillis();
    for (int i = 0; i < 1000; i++) {
        String msg = "message_" + i;
        channel.basicPublish("", QUEUE_NAME, null, (msg).getBytes(StandardCharsets.UTF_8));
    }

    long end = System.currentTimeMillis();
    System.out.println("发送消息完成，耗时：" + (end - start) + "ms");
}
```

执行结果

```java
发送消息完成，耗时：53ms
```

> **如何处理ack失败的消息？**

将消息放回队列继续发送即可，直到该消息发送成功。

代码实现思路：使用一个容器（Collection或Map容器）装下发送的全部消息，在ACK成功的回调方法中移除该元素，剩下的就是ACK失败的消息。

需要保存消息ID以及对应的消息内容，删除的时候需要根据ID来删，所以容器选用Map，Map中并发环境下的最好的选择是ConcurrentHashMap和ConcurrentSkipListMap，ConcurrentHashMap不能保证元素的有序性，所以使用跳表ConcurrentSkipListMap，其底层是双向链表的数据结构并且另外维护了一个多层级索引链表，特性是增删快有序（链表特性）、查询速度快（可以代替平衡树的数据结构）。

**代码实现**

```java
static ConcurrentSkipListMap<Long, String> messages = new ConcurrentSkipListMap<>();
public static void asyncConfirm() throws Exception {
    Channel channel = getChannel();
    // 绑定队列
    channel.queueDeclare(QUEUE_NAME, false, false, false, null);
    // 开启发布确认机制
    channel.confirmSelect();
    // ack成功的消息回调
    ConfirmCallback ackCallback = (deliveryTag, multiple) -> {
        if (multiple) {
            ConcurrentNavigableMap<Long, String> confirmed = messages.headMap(deliveryTag);
            confirmed.clear();
        } else {
            messages.remove(deliveryTag);
        }
        System.out.println("消息tag[" + deliveryTag + "]已确认");
    };
    // ack失败的消息回调
    ConfirmCallback nackCallback = (deliveryTag, multiple) -> {
        String message = messages.get(deliveryTag);
        // 重新发送
        channel.basicPublish("", QUEUE_NAME, null, (message).getBytes(StandardCharsets.UTF_8));
        System.out.println("消息tag[" + deliveryTag + "]消息内容[" + message + "]未确认");
    };
    // 设置监听器 - 异步通知
    channel.addConfirmListener(ackCallback, nackCallback);

    long start = System.currentTimeMillis();
    for (int i = 0; i < 1000; i++) {
        String msg = "message_" + i;
        channel.basicPublish("", QUEUE_NAME, null, (msg).getBytes(StandardCharsets.UTF_8));
        // k为消息序号，v为消息内容存入Map
        messages.put(channel.getNextPublishSeqNo(), msg);
    }

    long end = System.currentTimeMillis();
    System.out.println("发送消息完成，耗时：" + (end - start) + "ms");
}
```


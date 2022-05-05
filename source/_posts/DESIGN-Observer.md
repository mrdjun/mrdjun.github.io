---
title: 观察者模式
tags:
  - 设计模式
description: 观察者模式又称为发布订阅模式，定义对象间的一种一对多依赖关系，使得每当一一个对象状态发生改变时，其相关依赖对象皆得到通知并被自动更新。
abbrlink: 9a246216
date: 2021-04-07 23:20:36
---

观察者模式(Observer Pattern)：定义对象间的一种一对多依赖关系，使得每当一一个对象状态发生改变时，其相关依赖对象皆得到通知并被自动更新。

观察者是又称为发布订阅模式。观察者一般是指第三方，负责通知订阅者消息。



## 案例

Observer 观察者一般是一个接口，每一个实现该接口的实现类都是具体观察者

```java
public interface Observer {
    // 接收订阅号的通知，所以每个观察者都需要实现这个方法
    void update(String message);
}
```

Subject 抽象主题（抽象被观察者），抽象主题角色把所有观察者对象保存在一个集合里，每个主题都可以有任意数量的观察者，抽象主题提供一个接口，可以增加和删除观察者对象。

```java
public interface Subject {
    /**
     * 增加订阅者
     */
    void attach(Observer observer);

    /**
     * 删除订阅者
     */
    void detach(Observer observer);

    /**
     * 通知订阅者更新消息
     */
    void notify(String message);
}
```

ConcreteSubject 具体主题（具体被观察者），该角色将有关状态存入具体观察者对象，在具体主题的内部状态发生改变时，给所有注册过的观察者发送通知。

```java
public class ConcreteSubject implements Subject {
    //观察者存储
    private final List<Observer> list = new ArrayList<>();

    //增加一个观察者
    @Override
    public void attach(Observer observer) {
        list.add(observer);
    }

    //删除一个观察者
    @Override
    public void detach(Observer observer) {
        list.remove(observer);
    }

    // 通知所有观察者
    @Override
    public void notify(String message) {
        for (Observer observer : list) {
            observer.update(message);
        }
    }
}
```

User  订阅者(被观察者)

```java
public class User implements Observer {
    private String name;

    public User(String name) {
        this.name = name;
    }

    @Override
    public void update(String message) {
        System.out.println(name + " 收到消息:" + message);
    }
}
```

Test 测试类

```java
public class testObserver {
    public static void main(String[] args) {
        ConcreteSubject concreteSubject = new ConcreteSubject();
        User user1 = new User("张三");
        User user2 = new User("李四");
        concreteSubject.attach(user1);
        concreteSubject.attach(user2);

        // 发布消息
        concreteSubject.notify("快来帮我砍一刀");
    }
}
```

## 观察者模式在JDK中的应用

 在JDK中的java.awt.Event 就是观察者模式的一种，使用观察者模式和反射实现方法回调。

Event：事件实体类

```java
public class Event {

    private Object source;

    private Object target;

    private Method callback;

    private String trigger;

    private long time;

    public Event(Object target, Method callback) {
        this.target = target;
        this.callback = callback;
    }

    public Object getSource() {
        return source;
    }

    public void setSource(Object source) {
        this.source = source;
    }

    public Object getTarget() {
        return target;
    }

    public void setTarget(Object target) {
        this.target = target;
    }

    public Method getCallback() {
        return callback;
    }

    public void setCallback(Method callback) {
        this.callback = callback;
    }

    public String getTrigger() {
        return trigger;
    }

    public Event setTrigger(String trigger) {
        this.trigger = trigger;
        return this;
    }

    public long getTime() {
        return time;
    }

    public void setTime(long time) {
        this.time = time;
    }

    @Override
    public String toString() {
        return "Event{" +
                "source=" + source +
                ", target=" + target +
                ", callback=" + callback +
                ", trigger='" + trigger + '\'' +
                ", time=" + time +
                '}';
    }
}
```

EventListener：事件监听类

```java
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

public class EventListener {
    protected Map<String, Event> events = new HashMap<>();
	// 通过事件名称和一个目标对象来触发事件
    public void addListener(String eventType, Object target) {
        try {
            addListener(eventType,
                    target,
                    target.getClass().getMethod("on" + toUpperFirstCase(eventType), Event.class));
        } catch (NoSuchMethodException e) {
            e.printStackTrace();
        }
    }

    private static String toUpperFirstCase(String str) {
        char[] chars = str.toCharArray();
        chars[0] -= 32;
        return String.valueOf(chars);
    }

    public void addListener(String eventType, Object target, Method callback) {
        events.put(eventType, new Event(target, callback));
    }

    private void trigger(Event event) {
        event.setSource(this);
        event.setTime(System.currentTimeMillis());

        if (event.getCallback() != null) {
            try {
                event.getCallback().invoke(event.getTarget(), event);
            } catch (IllegalAccessException | InvocationTargetException e) {
                e.printStackTrace();
            }
        }
    }

    protected void trigger(String eventType) {
        if (!this.events.containsKey(eventType)) {
            return;
        }
        trigger(this.events.get(eventType).setTrigger(eventType));
    }
}
```

MouseEventType：鼠标事件常量

```java
public interface MouseEventType {
    String ON_CLICK = "click";

    String ON_DOUBLE_CLICK = "doubleClick";

    String ON_UP = "up";

    String ON_DOWN = "down";
}
```

Mouse：鼠标事件实现

```java
public class Mouse extends EventListener {

    public void click() {
        System.out.println("调用单击方法");
        this.trigger(MouseEventType.ON_CLICK);
    }

    public void dClick() {
        System.out.println("调用双击方法");
        this.trigger(MouseEventType.ON_DOUBLE_CLICK);
    }

    public void up() {
        System.out.println("调用弹起方法");
        this.trigger(MouseEventType.ON_UP);
    }

    public void down() {
        System.out.println("调用按下方法");
        this.trigger(MouseEventType.ON_DOWN);
    }
}
```

MouseEventCallback：鼠标事件回调

```java
public class MouseEventCallback {
    public void onClick(Event e) {
        System.out.println("============= 触发单击事件 =============\n" + e.toString());
    }

    public void onDoubleClick(Event e) {
        System.out.println("============= 触发双击事件 =============\n" + e.toString());
    }

    public void onUp(Event e) {
        System.out.println("============= 触发弹起事件 =============\n" + e.toString());
    }

    public void onDown(Event e) {
        System.out.println("============= 触发按下事件 =============\n" + e.toString());
    }
}
```

Test 测试类：

```java
public class ObserverTest {
    public static void main(String[] args) {
        MouseEventCallback callback = new MouseEventCallback();
        Mouse mouse = new Mouse();
        mouse.addListener(MouseEventType.ON_CLICK, callback);
        mouse.addListener(MouseEventType.ON_UP, callback);
        mouse.addListener(MouseEventType.ON_DOWN, callback);
        mouse.addListener(MouseEventType.ON_DOUBLE_CLICK, callback);

        mouse.click();
        mouse.down();
    }
}
```

## 观察者模式在Spring源码中的应用

Spring 中的 ContextLoaderListener 实现了 ServletContextListener 接口，ServletContextListener 接口又继承了 EventListener，在 JDK 中 EventListener 有非常广泛的应用。我们可以看一下源代码，ContextLoaderListener：

```java
public class ContextLoaderListener extends ContextLoader implements ServletContextListener {

   public ContextLoaderListener() {
   }
   public ContextLoaderListener(WebApplicationContext context) {
      super(context);
   }

   @Override
   public void contextInitialized(ServletContextEvent event) {
      initWebApplicationContext(event.getServletContext());
   }
   @Override
   public void contextDestroyed(ServletContextEvent event) {
      closeWebApplicationContext(event.getServletContext());
      ContextCleanupListener.cleanupAttributes(event.getServletContext());
   }
}
```

ServletContextListener

```java
package javax.servlet;
import java.util.EventListener;
public interface ServletContextListener extends EventListener {
    public void contextInitialized(ServletContextEvent sce);
    public void contextDestroyed(ServletContextEvent sce);
}
```

EventListener

```java
package java.util;
public interface EventListener {}
```

## 基于GuavaApi轻松实现观察者模式

Guava 是一个实现观察者模式非常好的框架。

```xml
<dependency>
    <groupId>com.google.guava</groupId>
    <artifactId>guava</artifactId>
    <version>20.0</version>
</dependency>
```

GuavaEvent ：监听事件（这是观察者模式的核心）

```java
import com.google.common.eventbus.Subscribe;

public class GuavaEvent {
    @Subscribe
    public void subscribe(String str) {
        System.out.println("执行subscribe方法，传入的参数是：" + str);
    }
}
```

测试类

```java
import com.google.common.eventbus.EventBus;
import org.springframework.web.context.ContextLoaderListener;

public class GuavaEventTest {
    public static void main(String[] args) {
        EventBus eventBus = new EventBus();
        GuavaEvent guavaEvent = new GuavaEvent();
        eventBus.register(guavaEvent);
        eventBus.post("Tom");
    }
}
```

## 优缺点

优点

（1）在观察者和被观察者之间建立了一个抽象的耦合。

（2）支持广播通信。

缺点

（1）观察者之间存在过多细节依赖、时间消耗过多，让程序更复杂了。

（2）使用不当会出现循环调用。
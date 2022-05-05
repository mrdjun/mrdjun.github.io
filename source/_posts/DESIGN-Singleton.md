---
title: 单例模式
tags:
  - 设计模式
description: 确保一个类在任何时候都绝对只有一个实例，并提供一个全局访问点。实现方式有饿汉、懒汉、注册式（枚举、容器、ThreadLocal）。
abbrlink: f1601c3e
date: 2021-04-06 22:48:36
---

确保一个类在任何时候都绝对只有一个实例，并提供一个全局访问点。分为饿汉模式和懒汉模式。

## 饿汉单例模式

饿汉模式适用于单例对象较少的情况。

写法一：直接在使用 static 关键字创建对象

```java
public class HungrySingleton {
    private static final HungrySingleton hungrySingleton = new HungrySingleton();

    private HungrySingleton() {
    }

    public static HungrySingleton getInstance() {
        return hungrySingleton;
    }
}
```

写法二：使用 static{} 的方式创建对象

```java
public class HungryStaticSingleton {
    private static final HungryStaticSingleton hungrySingleton;

    static {
        hungrySingleton = new HungryStaticSingleton();
    }
    public static HungryStaticSingleton getInstance() {
        return hungrySingleton;
    }
}
```

## 懒汉单例模式

顾名思义，被外部调用的时候内部类才会加载。

简单实现：

```java
public class LazySimpleSingleton {
    public LazySimpleSingleton() {
    }

    private static LazySimpleSingleton singleton;

    public static LazySimpleSingleton getInstance() {
        if (singleton == null) {
            singleton = new LazySimpleSingleton();
        }
        return singleton;
    }
}
```

上面这种方式存在安全隐患，下面看一个案例：

```java
public class ExecutorThread implements Runnable {
 
    @Override
    public void run() {
        LazySimpleSingleton singleton = LazySimpleSingleton.getInstance();
        System.out.println(Thread.currentThread().getName() + " -> " + singleton);
    }

    public static void main(String[] args) {
     	new Thread(new ExecutorThread()).start();
        new Thread(new ExecutorThread()).start();
        System.out.println("=============END==============");
    }
}
```

执行结果：

```
=============END==============
Thread-0 -> com.fun.DesignPatterns.singleton.LazySimpleSingleton@2ca9c4e8
Thread-1 -> com.fun.DesignPatterns.singleton.LazySimpleSingleton@4e3058f8
```

结果有的时候一致有的时候不一致，发现在线程的环境下，这个对象被实例化了两次。给SimpleSigleton 创建对象的方法加上 synchronized 修饰符：

```java
public class LazySimpleSingleton {
    public LazySimpleSingleton() {
    }

    private static LazySimpleSingleton singleton;

    public synchronized static LazySimpleSingleton getInstance() {
        if (singleton == null) {
            singleton = new LazySimpleSingleton();
        }
        return singleton;
    }
}
```

现在线程的安全问题解决了，但是如果在线程数量比较多的情况下加锁，会让CPU分配压力增大，导致大量线程阻塞，从而降低程序性能，继续改进。

```java
public class LazyDoubleCheckSingleton {
    private volatile static LazyDoubleCheckSingleton singleton = null;

    public LazyDoubleCheckSingleton() {
    }

    public static LazyDoubleCheckSingleton getInstance() {
        if (singleton == null) {
            synchronized (LazyDoubleCheckSingleton.class) {
                if (singleton == null) {
                    singleton = new LazyDoubleCheckSingleton();
                }
            }
        }
        return singleton;
    }
}
```

上面使用双重检查锁（DCL-Double Check Lock）的单例模式既能兼顾线程又能提升程序性能。但终归是需要上锁，对性能还是有一定的影响，还有下面这种更好的的方式：

```java
public class LazyInnerClassSingleton {
    public LazyInnerClassSingleton() {
    }

    // 这种形式如果当前类没有被使用内部类默认是不被加载的
    private static class LazyHolder {
        // 在返回结果以前，一定会先加载内部类
        private static final LazyInnerClassSingleton LAZY = new LazyInnerClassSingleton();
    }

    // 每一个关键字都不多余：static让单例空间共享、不被重写、重载
    public final static LazyInnerClassSingleton getInstance() {
        return LazyHolder.LAZY;
    }
}
```

这种方法的优点就很明显了：不上锁、提升性能、线程安全、懒加载。此外，面试经常被问的问题还有以下几点。

单例模式被破坏的问题：反射破坏、序列化破坏、克隆破坏（下一节，请见原型模式）。解决方法下面第三点：

## 注册式单例模式

注册式单例又称为登记式单例，就是将每一个实例都登记到某一个地方，使用唯一的标识获取实例。

### 枚举式单例模式

枚举式单例可避免序列化破坏和反射破坏。

```java
public enum EnumSingleton {
    INSTANCE;
    private Object data;
 
    public Object getData() {
        return data;
    }
 
    public void setData(Object data) {
        this.data = data;
    }
 
    public static EnumSingleton getInstance(){
        return INSTANCE;
    }
}
```

### 容器缓存单例模式

容器式单例适用于创建实例非常多的情况，便于管理。但是，是非线程安全的。

```java
public class ContainerSingleton {
    private ContainerSingleton(){}
    private static Map<String,Object> ioc=new ConcurrentHashMap<String,Object>();
    public static Object getBean(String className){
        synchronized (ioc){
            if(!ioc.containsKey(className)){
                Object obj=null;
                try {
                    obj=Class.forName(className);
                    ioc.put(className,obj);
                } catch (ClassNotFoundException e) {
                    e.printStackTrace();
                }
                return obj;
            }else{
                return ioc.get(className);
            }
        }
    }
}
```

到此注册式单例模式就完了，下面在补充一种ThreadLocal实现单例模式的案例：

###  ThreadLocal 单例模式

```java
public class ThreadLocalSingleton {
    public ThreadLocalSingleton() {}

    private static final ThreadLocal<ThreadLocalSingleton> singleton = new ThreadLocal<ThreadLocalSingleton>() {
        @Override
        protected ThreadLocalSingleton initialValue() {
            return new ThreadLocalSingleton();
        }
    };

    public static ThreadLocalSingleton getInstance() {
        return singleton.get();
    }
}
```


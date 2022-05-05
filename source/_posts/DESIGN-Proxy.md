---
title: 代理模式
tags:
  - 设计模式
description: 代理模式（Proxy Pattern）是指为其他对象提供一种代理，以控制对这个对象的访问，属于结构型模式。
abbrlink: 7b510e10
date: 2021-04-06 23:20:36
---

两种模式：**静态代理**、**动态代理**。

两个目的：**保护目标对象、增强目标对象**。

定义：代理模式（Proxy Pattern）是指为其他对象提供一种代理，以控制对这个对象的访问，属于结构型模式。在某些情况下，一个对象不适合或者不能直接引用另一个对象，而代理对象可以在客户端和目标对象之间起到中介的作用。

应用场景：生活中的租房中介、售票黄牛、婚介、经纪人、快递、事务代理、非侵入式日志监听等，都是代理模式的实际体现。当无法或不想直接引用某个对象或访问某个对象存在困难时，可以通过代理对象来间接访问。

代理模式一般由**共同接口类**、**被代理类**、**代理类**组成。

## 静态代理

这里举一个父亲帮儿子找对象的案例。人有很多行为：要谈恋爱、要工作、要买房买车，谈恋爱只是行为中的一项。父亲和儿子有个共同的行为是找对象，于是抽取成一个共同接口。

共同接口类 Person：

```java
public interface Person {
    void findLove();
}
```

被代理类 Son：

```java
public class Son implements Person{
    @Override
    public void findLove() {
        System.out.println("儿子要找对象，要求：富婆");
    }
}
```

代理类 Father:

```java
public class Father implements Person{
    private Son son;

    public Father(Son son) {
        this.son = son;
    }

    @Override
    public void findLove() {
        System.out.println("父亲帮儿子找富婆");
        this.son.findLove();
        System.out.println("儿子很强壮，富婆很喜欢，在一起了");
    }
}
```

测试类 Test：

```java
public class StaticMain {
    public static void main(String[] args) {
        // 父亲只能帮儿子找对象，不能帮表妹，帮陌生人
        Father father = new Father(new Son());
        father.findLove();
    }
}
```

## 动态代理模式

### 反射（java.lang.reflect）

- Class类：代表一个类。

  Class是一个类，class是关键字。

  Class类只有一个私有的构造函数，只有JVM能够创建Class类的实例。

  JVM中只有唯一一个和类相对应的Class对象来描述其类型信息。

- Field类：代表类的成员变量（成员变量也称为类的属性）。

- Method类：代表类的方法。

- Constructor类：代表类的构造方法。

- Array类：提供了动态创建数组，以及访问数组的元素的静态方法。



获取Class对象的三种方式：

1、通过Object.getClass() 获取

2、任何数据类型都有一个静态的class属性

3、通过 Class.forName() 的静态方法获取（常用）



这里还是找对象的案例，但现在是让媒婆帮忙物色对象了，“我”对于媒婆来说是顾客，那么关系就是媒婆帮“我”找对象。下面基于JDK实现动态代理：

被代理类 顾客 Customer：

```java
public class Customer implements Person {
    @Override
    public void findLove() {
        System.out.println("[客户] 要求1：白富美");
        System.out.println("[客户] 要求2：有车有房");
        System.out.println("[客户] 要求3：有存款");
    }
}
```

代理类 媒婆 JDKMeipo：

```java
public class JDKMeipo implements InvocationHandler {
    // 被代理的对象，将引用保存下来
    private Object target;

    public Object getProxyInstance(Object target) {
        this.target = target;
        Class<?> clazz = target.getClass();
        return Proxy.newProxyInstance(clazz.getClassLoader(), clazz.getInterfaces(), this);
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        before();
        Object o = method.invoke(target, args);
        after();
        return o;
    }

    private void before() {
        System.out.println("[媒婆] 正在查找对象...");
    }

    private void after() {
        System.out.println("[媒婆] 查找完成...");
    }
}
```

测试类 Test：

```java
public static void main(String[] args) {
    Person person = (Person) new JDKMeipo().getProxyInstance(new Customer());
    person.findLove();
}
```

实现原理: JDK动态代理采用字节重组，重新生成对象来替代原始对象，以达到动态代理的目的。

- **JDK动态代理生成对象的步骤如下**

1. 获取被代理对象的引用，并且获取它的所有接口，反射获取。
2. JDK动态代理类重新生成一个新的类，同时新的类要实现被代理类实现的所有接口。
3. 动态生成Java代码，新加的业务逻辑方法由一定的逻辑代码调用。
4. 编译新生成的Java代码.class文件。
5. 重新加载到JVM中运行。

**使用 CGLib 动态代理：**

```java
public class CGlibProxy implements MethodInterceptor {
    public Object getInstance(Class<?> clazz) throws Exception{
        // 相当于Proxy，代理的工具类
        Enhancer enhancer = new Enhancer();
        enhancer.setSuperclass(clazz);
        enhancer.setCallback(this);
        return enhancer.create();
    }

    public Object intercept(Object o, Method method, Object[] objects, MethodProxy methodProxy) throws Throwable {
        before();
        Object obj = methodProxy.invokeSuper(o,objects);
        after();
        return obj;
    }

    private void before(){
       System.out.println("called before request().");
    }

    private void after(){
        System.out.println("called after request().");
    }
}
```

- **CGLib和JDK动态代理对比**
  1.JDK 动态代理实现了被代理对象的接口，CGLib 代理继承了被代理对象。
  2.JDK 动态代理和CGLib代理都在运行期生成字节码，JDK 动态代理直接生成 Class 字节码，CGLib 代理使用ASM框架生成Class字节码，CGlib 代理实现更复杂，生成代理类比 JDK 动态代理效率低。
  3.JDK动态代理调用代理方法是通过反射机制调用的，CGLib 代理是通过 FastClass 机制直接调用方法的，CGLib 代理的执行效率更高。

## 静态代理和动态代理的区别

1.静态代理只能通过手动完成代理操作，如果被代理类增加了新的方法，代理类需要同步增加，违背开闭原则。
2.动态代理采用在运行时动态生成代码的方式，取消了对被代理类的扩展限制，遵循开闭原则。
3.若动态代理要对目标类的增强逻辑进行扩展，结合策略模式，只需要新增策略类便可完成，无须修改代理类的代码。

## 代理模式在Spring中的应用

Spring利用动态代理实现AOP时有两个非常重要的类：JdkDynamicAopProxy类和CglibAopProxy类
代理选择原则：
1.当Bean有实现接口时，Spring就会用JDK动态代理。
2.当Bean 没有实现接口时，Spring 会选择CGLib代理。
3.Spring 可以通过配置强制使用CGLib代理，只需在Spring的配置文件中加入如下代码：

```java
<aop:aspectj-autoproxy proxy-target-class="true"/>
```

## 代理模式的优缺点

**优点：**
    1.代理模式能将代理对象与真实被调用目标对象分离。
    2.在一定程度上降低了系统的耦合性，扩展性好。
    3.可以起到保护目标对象的作用。
    4.可以增强目标对象的功能。
**缺点：**
    1.代理模式会造成系统设计中类的数量增加。
    2.在客户端和目标对象中增加一个代理对象，会导致请求处理速度变慢。
    3.增加了系统的复杂度。

## 附：手写实现JDK的动态代理

​	动态代理和静态代理的基本思路是一致的，只不过动态代理的功能更加强大，随着业务的扩展适应性更强。下面是一个使用JDK动态代理实现的一个相亲找对象的案例。

### JDK实现方式

``` java
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

/**
 * JDK实现方式
 * @author MrDJun 2020/10/27
 */
public class JDKMeipo implements InvocationHandler {
    // 被代理的对象，把引用保存下来
    private Object target;

    public Object getInstance(Object target) {
        this.target = target;
        Class<?> clazz = target.getClass();
        return Proxy.newProxyInstance(clazz.getClassLoader(), clazz.getInterfaces(), this);
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        before();
        Object obj = method.invoke(this.target, args);
        after();
        return obj;
    }

    private void before() {
        System.out.println("我是媒婆，正在帮你找对象，现在已经确认了你喜欢哪种妹子了");
        System.out.println("开始物色...");
    }

    private void after() {
        System.out.println("已经帮你找到这样的妹子了，觉得合适的话，就准备办喜事吧");
    }

}

// 单身客户类
class Customer implements Person {
    @Override
    public void findLove() {
        System.out.println("富婆");
        System.out.println("身高166cm");
        System.out.println("无不良嗜好");
    }
}

interface Person {
    void findLove();
}

// 创建主类测试
class TestApplication {
    public static void main(String[] args) {
        Person obj = (Person) new JDKMeipo().getInstance(new Customer());
        obj.findLove();
    }
}
```

​		运行结果如下：

```
我是媒婆，正在帮你找对象，现在已经确认了你喜欢哪种妹子了
开始物色...
富婆
身高166cm
无不良嗜好
已经帮你找到这样的妹子了，觉得合适的话，就准备办喜事吧
```



### 手写实现JDK动态代理

​		JDK的动态代理是采用字节重组的方式实现的，重新生成对象来替代原始对象，以达到动态代理的目的。JDK动态代理生成对象的步骤如下：

（1）获取被代理对象的引用，并获取它的所有接口，反射获取；

（2）JDK动态代理类重新生成一个新的类，同时生成新的类要实现被代理类实现的所有接口；

（3）动态生成Java代码，新加的业务逻辑方法由一定的逻辑代码调用（在代码中体现）；

（4）编译新生成的Java代码为.class文件；

（5）重新加载到JVM运行；

​		以上过程称为字节重组。JDK中有一个规范，在ClassPath下只要是$开头的.class文件，一般都是自动生成的。那么我们有没有办法看到代替后的对象的“真容”呢？做一个这样的测试：将内存中的对象字节码通过文件流输出到新的.class文件，然后利用反编译工具查看源代码。

``` java
import com.fun.async.test.proxy.Person;
import java.lang.reflect.*;

public final class $proxy0 extends Proxy
    implements Person
{

    public $proxy0(InvocationHandler invocationhandler)
    {
        super(invocationhandler);
    }

    public final boolean equals(Object obj)
    {
        try
        {
            return ((Boolean)super.h.invoke(this, m1, new Object[] {
                obj
            })).booleanValue();
        }
        catch(Error _ex) { }
        catch(Throwable throwable)
        {
            throw new UndeclaredThrowableException(throwable);
        }
    }

    public final void findLove()
    {
        try
        {
            super.h.invoke(this, m3, null);
            return;
        }
        catch(Error _ex) { }
        catch(Throwable throwable)
        {
            throw new UndeclaredThrowableException(throwable);
        }
    }

    public final String toString()
    {
        try
        {
            return (String)super.h.invoke(this, m2, null);
        }
        catch(Error _ex) { }
        catch(Throwable throwable)
        {
            throw new UndeclaredThrowableException(throwable);
        }
    }

    public final int hashCode()
    {
        try
        {
            return ((Integer)super.h.invoke(this, m0, null)).intValue();
        }
        catch(Error _ex) { }
        catch(Throwable throwable)
        {
            throw new UndeclaredThrowableException(throwable);
        }
    }

    private static Method m1;
    private static Method m3;
    private static Method m2;
    private static Method m0;

    static 
    {
        try
        {
            m1 = Class.forName("java.lang.Object").getMethod("equals", new Class[] {
                Class.forName("java.lang.Object")
            });
            m3 = Class.forName("com.fun.async.test.proxy.Person").getMethod("findLove", new Class[0]);
            m2 = Class.forName("java.lang.Object").getMethod("toString", new Class[0]);
            m0 = Class.forName("java.lang.Object").getMethod("hashCode", new Class[0]);
        }
        catch(NoSuchMethodException nosuchmethodexception)
        {
            throw new NoSuchMethodError(nosuchmethodexception.getMessage());
        }
        catch(ClassNotFoundException classnotfoundexception)
        {
            throw new NoClassDefFoundError(classnotfoundexception.getMessage());
        }
    }
}
```

​		从反编译的结果来看，$Proxy0 继承了Proxy类，同时还实现了Person接口，并且还重写了findLove()方法。在静态块中用反射查找到了目标的所有方法，而且保存了所有方法引用，重写的方法用反射调用目标对象的方法。上面这些代码是哪来的？这是JDK自动生成的。现在不依赖JDK，自己实现动态生成源代码、动态完成编译，然后替代对象并执行。


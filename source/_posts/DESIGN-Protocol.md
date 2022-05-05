---
title: 原型模式
tags:
  - 设计模式
description: 用于创建重复的对象，同时又能保证性能。
abbrlink: 91ad9ce3
date: 2021-04-10 22:00:12
---

这种类型的设计模式属于创建型模式，它提供了一种创建对象的最佳方式。

主要适用于：

（1）大量的Getter和Setter 赋值的场景

（2）类初始化消耗资源较多。

（3）使用 new 生成一个对象需要非常繁琐的过程（数据准备、访问权限）。

（4）构造函数比较复杂。

（5）在循环体中产生大量对象。

在 Spring 中，原型模式应用得非常广泛，例如 scope="prototype" ，我们经常用的 JSON.parseObject() 也是一种原型模式。分为浅克隆和深克隆两种。

## 浅克隆

​	浅克隆：**完整复制值类型数据，没有复制引用对象**（也就是说所有的引用对象仍然**指向原来**对象的**地址**）。

​	一个标准的原型模式代码应该是这样设计的：先创建原型 Prototype 接口、创建需要克隆的类ConcretePrototypeA、创建克隆的客户端，通过客户端来实现克隆。

Prototype接口

```java
public interface Prototype {
    Prototype clone();
}
```

ConcretePrototypeA 需要克隆的类

```java
public class ConcretePrototypeA implements Prototype {
    private String name;
    private int age;
    private List<String> hobbies;

    public void setHobbies(List<String> hobbies) {
        this.hobbies = hobbies;
    }

    @Override
    public Prototype clone() {
        ConcretePrototypeA concretePrototype = new ConcretePrototypeA();
        concretePrototype.setAge(this.age);
        concretePrototype.setName(this.name);
        concretePrototype.setHobbies(this.hobbies);
        return concretePrototype;
    }
	// 省略Getter、Setter方法
}
```

Client 客户端类

```java
public class Client {
    private Prototype prototype;

    public Client(Prototype prototype) {
        this.prototype = prototype;
    }

    public Prototype startClone(Prototype concretePrototype) {
        return (Prototype) concretePrototype.clone();
    }
}
```

Test 测试类

```java
public class PrototypeTest {
    public static void main(String[] args) {
        ConcretePrototypeA concretePrototype = new ConcretePrototypeA();
        concretePrototype.setAge(18);
        concretePrototype.setName("prototype");
        List<String> hobbies = new ArrayList<>();
        concretePrototype.setHobbies(hobbies);

        Client client = new Client(concretePrototype);
        ConcretePrototypeA concretePrototypeClone = (ConcretePrototypeA) client.startClone(concretePrototype);

        System.out.println(concretePrototypeClone);
        // 结果为 true，说明引用地址相同
        System.out.println(concretePrototypeClone.getHobbies() == concretePrototype.getHobbies());
    }
}
```

## 深克隆

这里举一个房子和房子的主人的案例，房子有面积大小、楼层等属性、房主有姓名、电话等属性。

房子类（包含这个房子的主人、面积、楼层属性）

```java
public class House implements Serializable {
    // 楼层
    String floor;
    // 住房面积
    int area;
    // 租金
    double price;
    // 房主
    HouseOwner owner;

    public House() {
    }

    public House(String roomId, int area, double price, HouseOwner owner) {
        this.floor = roomId;
        this.area = area;
        this.price = price;
        this.owner = owner;
    }
}
```

房主类

```java
public class HouseOwner implements Serializable {
    // 电话
    int phone;
    // 姓名
    String name;

    public HouseOwner() {
    }

    public HouseOwner(int phone, String name) {
        this.phone = phone;
        this.name = name;
    }
}
```

Test测试类

```java
public class HouseCloneTest {
    public static void main(String[] args) throws IOException, ClassNotFoundException {
        HouseOwner MrDJun = new HouseOwner(1, "MrDJun");

        House h1 = new House("1302", 78, 2900, MrDJun);

        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("clone.obj"));
        oos.writeObject(h1);
        oos.close();

        ObjectInputStream ois = new ObjectInputStream(new FileInputStream("clone.obj"));
        House h2 = (House) ois.readObject();

        System.out.println(h1);
        System.out.println(h1.owner == h2.owner);
        ois.close();
    }
}
```

## 克隆破坏单例模式

​		如果我们克隆的对象是单例对象，那么就意味着深克隆会破坏单例模式。实际上防止克隆破坏单例模式的解决思路很简单：禁止克隆即可。

两种方式：

1、 不实现 Cloneable 接口；

2、重写 clone() 方法，在 clone() 方法中返回单例对象；

```java
@Override
protected Object clone() throws CloneNotSupportedException {
    return INSTANCE;
}
```

## 优缺点

**优点：** 1、性能提高。 2、逃避构造函数的约束。

**缺点：** 1、配备克隆方法需要对类的功能进行通盘考虑，这对于全新的类不是很难，但对于已有的类不一定很容易，特别当一个类引用不支持串行化的间接对象，或者引用含有循环结构的时候。 2、必须实现 Cloneable 接口。


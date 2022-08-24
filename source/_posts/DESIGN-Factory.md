---
title: 工厂模式
tags:
  - 设计模式
description: 工厂模式只关心结果，不关心过程，分为简单工厂模式、工厂方法模式、抽象工厂模式。
abbrlink: 54788f73
date: 2021-04-07 21:40:36
---

工厂模式只关心结果，不关心过程；定义一个创建对象的接口，让其子类自己决定实例化哪一个工厂类，工厂模式使其创建过程延迟到子类进行；

以生产手机为例，制造手机有一套标准，现在市面的手机品牌会找代工厂按照这个标准生产手机。

## 简单工厂模式

定义一个工厂类，根据传入的参数值的不同返回不同的实例。特点：被创建的实例具有共同的父类或接口。

使用场景：

- 需要创建的对象比较少
- 客户端不关心对象的创建过程

优缺点：

- 优点：可以对创建对象进行“加工”，对客户端隐藏相关细节
- 缺点：创建逻辑复杂或创建的对象过多造成代码臃肿
- 缺点：新增、删除子类都违反开闭原则。

![img](DESIGN-Factory/工厂模式-简单工厂结构.png)

**Phone类**：手机标准规范类(AbstractProduct)

```java
public interface Phone {
    void make();
}
```

**MiPhone类**：制造小米手机

```java
public class MiPhone implements Phone {
    public MiPhone() {
        make();
    }
    @Override
    public void make() {
        System.out.println("生产小米手机");
    }
}
```

**HuaweiPhone类**：制造华为手机

```java
public class HuaweiPhone implements Phone {
	public HuaweiPhone(){
		make();
	}
	@Override
    public void make() {
        System.out.println("生产华为手机");
    }
}
```

**PhoneFactory类**：手机代工厂（Factory）

```java
public class PhoneFactory {
    public Phone makePhone(String phoneType) {
        if(phoneType.equalsIgnoreCase("XIAOMI")){
            return new MiPhone();
        }
        else if(phoneType.equalsIgnoreCase("HUAWEI")) {
            return new HuaweiPhone();
        }
        return null;
    }
}
```

## 工厂方法模式

定义一个用于创建对象的接口，让子类决定实例化哪一个类。

优缺点：

- 优点：遵循开闭原则
- 优点：对客户端隐藏对象的创建细节
- 优点：遵循单一职责
- 缺点：增加的类比较多，增加了系统的复杂度。
- 缺点：只支持同一类产品的创建。

![img](DESIGN-Factory/工厂模式-方法工厂结构.png)

**AbstractFactory类**：生产不同产品的工厂的抽象类

```java
public interface AbstractFactory {
    Phone makePhone();
}
```

**XiaoMiFactory类**：生产小米手机的工厂

```java
public class XiaoMiFactory implements AbstractFactory{
    @Override
    public Phone makePhone() {
        return new MiPhone();
    }
}
```

**HuaweiFactory类**：生产华为手机的工厂

```java
public class HuaweiFactory implements AbstractFactory{
    @Override
    public Phone makePhone() {
        return new HuaweiPhone();
    }
}
```

## 抽象工厂模式

解决了方法工厂模式只生产一种产品的弊端：

- 新增一个产品族，只需要增加一个具体工厂，不需要修改之前的代码

抽象工厂中有两个概念：

1、产品族：一个品牌旗下的多种产品

2、产品等级结构：不同品牌下的同一种产品

每一个品牌就是每一个具体的工厂，也就是说一个品牌要生产一个产品族需要对应产品等级结构的工厂的来完成。

![img](DESIGN-Factory/工厂模式-抽象工厂结构.png)

**电脑(PC)类**：定义PC产品的接口(AbstractPC)

```java
public interface PC {
    void make();
}
```

**MiPC类**：定义小米电脑产品(MIPC)

```java
public class MiPC implements PC {
    public MiPC() {
        this.make();
    }
    @Override
    public void make() {
        System.out.println("生产小米电脑");
    }
}
```

**HuaweiPC类**：定义华为电脑产品(HuaweiPC)

```java
public class HuaweiPC implements PC {
    public HuaweiPC() {
        this.make();
    }
    @Override
    public void make() {
        System.out.println("生产华为电脑");
    }
}
```

**AbstractFactory类**：增加PC产品制造接口

```java
public interface AbstractFactory {
    Phone makePhone();
    PC makePC();
}
```

**XiaoMiFactory类**：增加小米PC的制造（ConcreteFactory1）

```java
public class XiaoMiFactory implements AbstractFactory{
    @Override
    public Phone makePhone() {
        return new MiPhone();
    }
    @Override
    public PC makePC() {
        return new MiPC();
    }
}
```

**HuaweiFactory类**：增加苹果PC的制造（ConcreteFactory2）

```java
public class HuaweiFactory implements AbstractFactory {
    @Override
    public Phone makePhone() {
        return new HuaweiPhone();
    }
    @Override
    public PC makePC() {
        return new HuaweiPC();
    }
}
```

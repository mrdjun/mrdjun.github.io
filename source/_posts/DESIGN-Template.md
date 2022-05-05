---
title: 模板模式
tags:
  - 设计模式
description: 定义了一个算法的骨架，并允许子类为一个或多个步骤提供实现。
abbrlink: 150e036b
date: 2021-04-08 20:00:36
---



## 定义

- 定义了一个算法的骨架，并允许子类为一个或多个步骤提供实现。

- 准备一个抽象类，将部分逻辑以具体方法以及具体构造函数的形式实现，然后声明一些抽象方法来迫使子类实现剩余的逻辑。

- 不同的子类可以以不同的方式实现这些抽象方法，从而对剩余的逻辑有不同的实现。这就是模板方法模式的用意。

## 适用场景

- 一次性实现一个算法不变的部分，并将可变的行为留给子类来实现。
- 提取子类重复实现的方法，放在超类中。
- 控制子类的扩展，必须遵循这一套流程规则。

## 案例

这是一个炒菜的案例，贴近生活，简单易懂。

CookTemplate：炒菜的一套模板

```java
public abstract class CookTemplate {

    // 如果不希望子类覆盖此方法，可以使用final 关键字修饰
    protected void create() {
        //第一步：倒油
        this.pourOil();
        //第二步：热油
        this.HeatOil();
        //第三步：倒蔬菜
        this.pourVegetable();
        //第四步：倒调味料
        this.pourSauce();
        //第五步：翻炒
        this.fry();
    }

    //第一步：倒油是一样的，所以直接实现
   public void pourOil() {
        System.out.println("倒油");
    }

    //第二步：热油是一样的，所以直接实现
    public  void HeatOil() {
        System.out.println("热油");
    }

    //第三步：炒什么菜让子类决定
    public abstract void pourVegetable();

    //第四步：这个菜需要加什么调料由子类决定
    public abstract void pourSauce();

    //第五步：翻炒是一样的
    public void fry() {
        System.out.println("翻炒直到炒熟");
    }
}
```

CookBaoCai：炒包菜

```java
public class CookBaoCai extends CookTemplate {

    @Override
    public void pourVegetable() {
        System.out.println("倒入包菜");
    }

    @Override
    public void pourSauce() {
        System.out.println("加入包菜的调味料");
    }
}
```

CookHuaCai：炒花菜

```java
public class CookHuaCai extends CookTemplate {
    @Override
    public void pourVegetable() {
        System.out.println("倒入花菜");
    }

    @Override
    public void pourSauce() {
        System.out.println("加入花菜的调味料");
    }
}
```

Test：测试类

```java
public class TemplateTest {
    public static void main(String[] args) {
        CookBaoCai cookBaoCai = new CookBaoCai();
        cookBaoCai.create();
        System.out.println("=====================");
        CookHuaCai cookHuaCai = new CookHuaCai();
        cookHuaCai.create();
    }
}
```

## 优缺点

优点

（1）提高代码复用性。将相同部分的代码放在抽象的超类中。

（2）提高了拓展性。将不同的代码放入不同的子类中，通过对子类的扩展增加新的行为。

（3）实现了反向控制。通过一个父类调用其子类的操作，通过对子类的扩展增加新的行为，实现了反向控制 & 符合“开闭原则”。

缺点

​	引入了抽象类，每一个不同的实现都需要一个子类来实现，导致类的个数增加，从而增加了系统实现的复杂度。


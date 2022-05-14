---
title: SpringBoot注解@Conditional
abbrlink: dc1803fb
date: 2021-01-15 15:03:48
tags:
  - SpringBoot
description: >-
  @Conditional是Spring4新提供的注解，按照一定的条件进行判断，满足条件才在容器注册bean。
---



## @Conditional

作用：按照一定的条件进行判断，满足条件才在容器注册bean。

这是Spring4新提供的注解，定义：

```java
//此注解可以标注在类和方法上
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME) 
@Documented
public @interface Conditional {
    Class<? extends Condition>[] value();
}
```

需要写一个类去继承 Condition 接口，并实现里面的 matches 方法：

```java
public interface Condition {
   /**
     * @param var1:判断条件能使用的上下文环境
     * @param var2:注解所在位置的注释信息
     * */
    boolean matches(ConditionContext var1, AnnotatedTypeMetadata var2);
}
```

获取容器的上下文环境，conditionContext提供了多种方法，方便获取各种信息：

```java
public class MyCondition implements Condition {
 
    @Override
    public boolean matches(ConditionContext conditionContext, AnnotatedTypeMetadata annotatedTypeMetadata) {
        // 获取ioc使用的 beanFactory
        ConfigurableListableBeanFactory beanFactory = conditionContext.getBeanFactory();
        //获取类加载器
        ClassLoader classLoader = conditionContext.getClassLoader();
        //获取当前环境信息
        Environment environment = conditionContext.getEnvironment();
        //获取bean定义的注册类
        BeanDefinitionRegistry registry = conditionContext.getRegistry();
        //获得当前系统名
        String property = environment.getProperty("os.name");
        // 例如：当前环境是否windows系统，返回true
        if (property.contains("Windows")){
            return true;
        }
        return false;
    }
}
```

### 单个判断条件

```java
// 放在类上，若当前条件在MyCondition中mathes的方法为true，将会向容器注入一个或多个bean
@Conditional({MyCondition.class})
public class Hello{
    @Bean
    public Object bean1(){}
    @Bean
    public Object bean2(){}
    ...
}
```

### 多个判断条件的应用

```java
// A和B都返回true,才会注入容器
@Conditional({ACondition.class,BCondition.class})
@Configuration
public class Hello{
    @Bean
    public Object bean1(){}
    @Bean
    public Object bean2(){}
    ...
}
```

继@Conditional注解后，派生出 @ConditionalOnBean、@ConditionalOnMissingBean、@ConditionalOnExpression、@ConditionalOnClass 等

```java
@ConditionalOnBean         //	当给定的在bean存在时,则实例化当前Bean
@ConditionalOnMissingBean  //	当给定的在bean不存在时,则实例化当前Bean
@ConditionalOnClass        //	当给定的类名在类路径上存在，则实例化当前Bean
@ConditionalOnMissingClass //	当给定的类名在类路径上不存在，则实例化当前Bean
```

## @ConditionalOnBean

```java
@Configuration
public class Hello{
    @Bean(name="bean1")
    public Object bean1(){}
   
    @Bean(name="bean2")
    // 如果bean1已经注入容器，则bean2也将注入
    @ConditionalOnBean(name="bean1")
    public Object bean2(){}
}
```

## @ConditionalOnMissingBean

```java
@Configuration
public class Hello{
    @Bean(name="bean1")
    public Object bean1(){}
   
    @Bean(name="bean2")
    // 如果bean1已经注入容器，则不会将bean2注入
    @ConditionalOnMissingBean(name="bean1")
    public Object bean2(){}
}
```

在 @ConditionalOnMissingBean 的声明中，使用的也是@Conditional注解，实现了一些常用的功能：

```java
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
// 判断条件为 OnBeanCondition，能够按bean名、bean类名等多种类型判断bean是否在容器
@Conditional({OnBeanCondition.class})
public @interface ConditionalOnBean {
    Class<?>[] value() default {};

    String[] type() default {};

    Class<? extends Annotation>[] annotation() default {};

    String[] name() default {};

    SearchStrategy search() default SearchStrategy.ALL;

    Class<?>[] parameterizedContainer() default {};
}
```

其它两个注解同理。

---
title: SpringBoot自动装配的原理
abbrlink: b2efd41c
date: 2021-02-25 20:56:42
tags:
  - SpringBoot
description: >-
  自动装配是我们对SpringBoot进行扩展的基础（Starter），也是整个Spring Boot的核心。
---

## Spring Boot中的自动装配

添加Starter依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

配置Redis数据源

```properties
spring.redis.host=localhost
spring.redis.port=6379
```

创建一个Controller

```java
@RestController
public class TestController {

    @Autowired
    RedisTemplate<String,String> redisTemplate;

    @GetMapping("/test")
    public String test(){
        redisTemplate.opsForValue().set("hello","Spring Boot");
        return "success";
    }
}
```

这就是一个Spring Boot的装配机制，我们没有通过XML形式或者注解的形式把RedisTemplate注入到IOC容器，但是在Controller中可以直接通过@Autowired来直接注入使用。

## 自动装配是如何实现的？

```java
@SpringBootApplication
public class TestDemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(TestDemoApplication.class, args);
    }
}
```

点进 @SpringBootApplication 这个注解去看下，@SpringBootApplication 注解主要由三个注解组成：@ComponentScan、@SpringBootConfiguration、**@EnableAutoConfiguration**。

```java
@Target({ElementType.TYPE}) //接口、类、枚举、注解
@Retention(RetentionPolicy.RUNTIME) //这种类型的Annotations将被JVM保留,所以他们能在运行时被JVM或其他使用反射机制的代码所读取和使用。
@Documented // 说明该注解将被包含在javadoc中
@Inherited // 说明子类可以继承父类中的该注解
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan(
    excludeFilters = {@Filter(
    type = FilterType.CUSTOM,
    classes = {TypeExcludeFilter.class}
), @Filter(
    type = FilterType.CUSTOM,
    classes = {AutoConfigurationExcludeFilter.class}
)}
)
public @interface SpringBootApplication {
 		...
}
```

再继续点进去 @EnableAutoConfiguration 注解：

```java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@AutoConfigurationPackage // 把使用了该注解的类所在的包及子包下所有组件扫描到Spring IOC容器中
@Import({AutoConfigurationImportSelector.class})
public @interface EnableAutoConfiguration {
    String ENABLED_OVERRIDE_PROPERTY = "spring.boot.enableautoconfiguration";

    Class<?>[] exclude() default {};

    String[] excludeName() default {};
}
```

在@EnableAutoConfiguration中最重要的是 **@Import({AutoConfigurationImportSelector.class}) **注解。@Import 将 AutoConfigurationImportSelector 这个类导入，点进这个类一看：

```java
public class AutoConfigurationImportSelector implements DeferredImportSelector,***{}

public interface DeferredImportSelector extends ImportSelector {}
```

实现了 DeferredImportSelector 接口，而 DeferredImportSelector 是继承 ImportSelector 类的。在 ImportSelector  中有个非常重要的方法：

```java
// 批量将类注入到IOC容器
String[] selectImports(AnnotationMetadata var1);
```


**如何利用 ImportSelector 装配类到IOC容器中去**
首先创建一个类TestClass

```java
public class TestClass {
}
```

创建一个ImportSelector的实现类，在实现类中把定义的Bean加入String数据中（因为ImportSelector可以实现批量装配，这里用一个来举例，多个逗号分隔就好），该Bean将会装配到IOC容器中

```java
public class TestImportSelector implements ImportSelector {

    @Override
    public String[] selectImports(AnnotationMetadata annotationMetadata) {
        return new String[]{TestClass.class.getName()};
    }
}
```

为了模拟 EnableAutoConfiguration，我们自定义一个注解，通过@Import导入

```java
@Target(ElementType.TYPE) 
@Retention(RetentionPolicy.RUNTIME) 
@Documented 
@Inherited 
@AutoConfigurationPackage //添加该注解的类所在的package 作为 自动配置package 进行管理
@Import(TestImportSelector.class)
public @interface EnableAutoImport {
}
```

然后创建一个启动类，在启动类上使用@EnableAutoImport注解，即可通过getBean从IOC容器中得到TestClass实例

```java
@SpringBootApplication
@EnableAutoImport
public class ImportSelectorMain {

    public static void main(String[] args) {
        ConfigurableApplicationContext configurableApplicationContext = SpringApplication.run(ImportSelectorMain.class,args);
        TestClass testClass = configurableApplicationContext.getBean(TestClass.class);
    }
}
```

## 总结

自动装配的原理是通过主要组成@SpringBootApplication注解的@SpringBootConfiguration、@EnableAutoConfiguration、@ComponentScan三个注解中的@EnableAutoConfiguration 中通过 @Import({AutoConfigurationImportSelector.class}) 导入的AutoConfigurationImportSelector实现的 selectImports 方法来实现批量装配的。

上面这个问题回答上了之后，有些面试官会深入问下面这个问题：

## 装配 application.properties/yml

在autoconfigure包下有个类 ServletWebServerFactoryAutoConfiguration，这个是SpringBoot 自动装配 Servlet 配置的类。

```java
package org.springframework.boot.autoconfigure.web.servlet; // 包路径
@Configuration(
    proxyBeanMethods = false
)
@AutoConfigureOrder(-2147483648)
@ConditionalOnClass({ServletRequest.class})
@ConditionalOnWebApplication(
    type = Type.SERVLET
)
@EnableConfigurationProperties({ServerProperties.class})
@Import({ServletWebServerFactoryAutoConfiguration.BeanPostProcessorsRegistrar.class, EmbeddedTomcat.class, EmbeddedJetty.class, EmbeddedUndertow.class})
public class ServletWebServerFactoryAutoConfiguration {}
```

在SpringMVC中 @EnableConfigurationProperties 是一个非常熟悉的类，上面会将ServerProperties 类中的一些配置加载到当前类中，点进 ServletProperties：

```java
@ConfigurationProperties(
    prefix = "server",
    ignoreUnknownFields = true
)
public class ServerProperties {}
```

@ConfigurationProperties 将配置文件的属性对应的值读入到 ServerProperties 这个类中，prefix=“server” 会读取 application.properties 中前缀为 server 的属性和值。

---
title: 深入学习Spring组件注册
tags:
  - Spring
description: >-
  接触过Spring的同学肯定都听过IOC。在传统的Java编程中，当需要用到某个对象的时候，我们都是主动显式创建一个对象实例（new）。使用Spring后就不需要这样做了，因为Spring会帮我们在需要用到某些对象的地方自动注入该对象，而无须我们自己去创建。
abbrlink: 4bb4364
date: 2022-12-03 16:29:51
---

接触过Spring的同学肯定都听过IOC。在传统的Java编程中，当需要用到某个对象的时候，我们都是主动显式创建一个对象实例（new）。使用Spring后就不需要这样做了，因为Spring会帮我们在需要用到某些对象的地方自动注入该对象，而无须我们自己去创建。这种模式俗称控制反转，即IOC（Inversion of Control）。那么Spring是从什么地方获取到我们所需要的对象呢？其实Spring给我们提供了一个IOC容器，里面管理着所有我们需要的对象，组件注册就是我们去告诉Spring哪些类需要交给IOC容器管理。

这里主要记录组件注册的一些细节。

## 通过@Bean注册组件

在较早版本的Spring中，我们都是通过XML的方式来往IOC容器中注册组件的，下面这段代码大家肯定不会陌生：

```java
// 返回 IOC 容器，基于 XML配置，传入配置文件的位置
ApplicationContext applicationContext = new ClassPathXmlApplicationContext("xxx.xml");
User user = (User) applicationContext.getBean("user");
```

Spring 4后推荐我们使用Java Config的方式来注册组件。

为了演示，我们通过http://start.spring.io/搭建一个简单Spring Boot应用，然后引入Lombok依赖（编辑器也需要安装Lombok插件）：

```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <scope>provided</scope>
</dependency>
```

然后创建一个User类：

```java
@ToString
@AllArgsConstructor
@Data
public class User {
    private String name;
    private Integer age;
}
```

接着创建一个配置类，在里面通过`@Bean`注解注册User类：

```java
@Configuration
public class WebConfig {
    @Bean
    public User user() {
        return new User("mrdjun", 18);
    }
}
```

通过`@Bean`注解，我们向IOC容器注册了一个名称为`user`（Bean名称默认为方法名，我们也可以通过`@Bean("myUser")`方式来将组件名称指定为`myUser`）。

组件注册完毕后，我们测试一下从IOC容器中获取这个组件。在Spring Boot入口类中编写如下代码：

```java
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
    	SpringApplication.run(DemoApplication.class, args);

        // 返回 IOC 容器，使用注解配置，传入配置类
        ApplicationContext context = new AnnotationConfigApplicationContext(WebConfig.class);
        User user = context.getBean(User.class);
        System.out.println(user);
    }
}
```

因为我们是通过注解方式来注册组件的，所以需要使用`AnnotationConfigApplicationContext`来获取相应的IOC容器，入参为配置类。

启动项目，看下控制台输出：

```
User(name=mrdjun, age=18)
```

说明组件注册成功。

我们将组件的名称改为`myUser`，然后看看IOC容器中，User类型组件是否叫`myUser`：

```java
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);

        ApplicationContext context = new AnnotationConfigApplicationContext(WebConfig.class);
        // 查看 User 这个类在 Spring 容器中叫啥玩意
        String[] beanNames = context.getBeanNamesForType(User.class);
        Arrays.stream(beanNames).forEach(System.out::println);
    }
}
```

启动项目，观察控制台输出:

```
myUser
```

## 使用@ComponentScan扫描

在使用XML配置组件扫描的时候，我们都是这样配置的：

```xml
<context:component-scan base-package=""></context:component-scan>
```

其中`base-package`指定了扫描的路径。路径下所有被`@Controller`、`@Service`、`@Repository`和`@Component`注解标注的类都会被纳入IOC容器中。

现在我们脱离XML配置后，可以使用`@ComponentScan`注解来扫描组件并注册。

在使用`@ComponentScan`扫描之前，我们先创建一个Controller，一个Service，一个Dao，并标注上相应的注解。

然后修改配置类：

```java
@Configuration
@ComponentScan("com.mrdjun.demo")
public class WebConfig {

    // @Bean("myUser")
    // public User user() {
    //     return new User("mrdjun", 18);
    // }
}
```

在配置类中，我们通过`@ComponentScan("com.mrdjun.demo")`配置了扫描路径，并且将User组件注册注释掉了，取而代之的是在User类上加上`@Component`注解：

```java
@AllArgsConstructor
@NoArgsConstructor
@Data
@Component
public class User {
    private String name;
    private Integer age;
}
```

值得注意的是，我们不能将Spring Boot的入口类纳入扫描范围中，否则项目启动将出错。

接下来我们看下在基于注解的IOC容器中是否包含了这些组件：

```java
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);

        ApplicationContext context = new AnnotationConfigApplicationContext(WebConfig.class);
        // 查看基于注解的 IOC容器中所有组件名称
        String[] beanNames = context.getBeanDefinitionNames();
        Arrays.stream(beanNames).forEach(System.out::println);
    }
}
```

启动项目，观察控制台：

![QQ截图20181207164418.png](SPRING-Bean-Regist/QQ截图20181207164418.png)

可见，组件已经成功被扫描进去了，并且名称默认为类名首字母小写。

这里，配置类WebConfig也被扫描并注册了，查看`@Configuration`源码就会发现原因：

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Component
public @interface Configuration {
    String value() default "";
}
```

### 指定扫描策略

`@ComponentScan`注解允许我们指定扫描策略，即指定哪些被扫描，哪些不被扫描，查看其源码可发现这两个属性：

```java
/**
 * Specifies which types are eligible for component scanning.
 * <p>Further narrows the set of candidate components from everything in {@link #basePackages}
 * to everything in the base packages that matches the given filter or filters.
 * <p>Note that these filters will be applied in addition to the default filters, if specified.
 * Any type under the specified base packages which matches a given filter will be included,
 * even if it does not match the default filters (i.e. is not annotated with {@code @Component}).
 * @see #resourcePattern()
 * @see #useDefaultFilters()
 */
Filter[] includeFilters() default {};

/**
 * Specifies which types are not eligible for component scanning.
 * @see #resourcePattern
 */
Filter[] excludeFilters() default {};
```

其中`Filter`也是一个注解:

```java
/**
 * Declares the type filter to be used as an {@linkplain ComponentScan#includeFilters
 * include filter} or {@linkplain ComponentScan#excludeFilters exclude filter}.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({})
@interface Filter {

    FilterType type() default FilterType.ANNOTATION;

    @AliasFor("classes")
    Class<?>[] value() default {};

    @AliasFor("value")
    Class<?>[] classes() default {};
    String[] pattern() default {};
}
```

接下来我们使用`excludeFilters`来排除一些组件的扫描：

```java
@Configuration
@ComponentScan(value = "com.mrdjun.demo",
        excludeFilters = {
                @Filter(type = FilterType.ANNOTATION,
                        classes = {Controller.class, Repository.class}),
                @Filter(type = FilterType.ASSIGNABLE_TYPE, classes = User.class)
        })
public class WebConfig {

}
```

上面我们指定了两种排除扫描的规则：

1. 根据注解来排除（`type = FilterType.ANNOTATION`）,这些注解的类型为`classes = {Controller.class, Repository.class}`。即`Controller`和`Repository`注解标注的类不再被纳入到IOC容器中。
2. 根据指定类型类排除（`type = FilterType.ASSIGNABLE_TYPE`），排除类型为`User.class`，其子类，实现类都会被排除。

启动项目，观察控制台：

![QQ截图20190129095439.png](SPRING-Bean-Regist/QQ截图20190129103606.png)

可见排除成功。

除了上面两种常用的规则外，我们还可以使用别的规则，查看`FilterType`源码：

```java
public enum FilterType {
    /**
     * Filter candidates marked with a given annotation.
     *
     * @see org.springframework.core.type.filter.AnnotationTypeFilter
     */
    ANNOTATION,

    /**
     * Filter candidates assignable to a given type.
     *
     * @see org.springframework.core.type.filter.AssignableTypeFilter
     */
    ASSIGNABLE_TYPE,

    /**
     * Filter candidates matching a given AspectJ type pattern expression.
     *
     * @see org.springframework.core.type.filter.AspectJTypeFilter
     */
    ASPECTJ,

    /**
     * Filter candidates matching a given regex pattern.
     *
     * @see org.springframework.core.type.filter.RegexPatternTypeFilter
     */
    REGEX,

    /**
     * Filter candidates using a given custom
     * {@link org.springframework.core.type.filter.TypeFilter} implementation.
     */
    CUSTOM
}
```

可看到，我们还可以通过`ASPECTJ`表达式，`REGEX`正则表达式和`CUSTOM`自定义规则（下面详细介绍）来指定扫描策略。

`includeFilters`的作用和`excludeFilters`相反，其指定的是哪些组件需要被扫描：

```java
@Configuration
@ComponentScan(value = "com.mrdjun.demo",
        includeFilters = {
                @Filter(type = FilterType.ANNOTATION, classes = Service.class)
        }, useDefaultFilters = false)
public class WebConfig {

}
```

上面配置了只将`Service`纳入IOC容器，并且需要用`useDefaultFilters = false`来关闭Spring默认的扫描策略才能让我们的配置生效（Spring Boot入口类的`@SpringBootApplication`注解包含了一些默认的扫描策略）。

启动项目，观察控制台：

![QQ截图20190129100306.png](SPRING-Bean-Regist/QQ截图20190129100306.png)

可看到，IOC容器中将不再包含dao，controller。

### 多扫描策略配置

在Java 8之前，我们可以使用`@ComponentScans`来配置多个`@ComponentScan`以实现多扫描规则配置：

![QQ截图20190129100809.png](SPRING-Bean-Regist/QQ截图20190129100809.png)

而在Java 8中，新增了`@Repeatable`注解，使用该注解修饰的注解可以重复使用，查看`@ComponentScan`源码会发现其已经被该注解标注：

![QQ截图20190129101050.png](SPRING-Bean-Regist/QQ截图20190129101050.png)

所以除了使用`@ComponentScans`来配置多扫描规则外，我们还可以通过多次使用`@ComponentScan`来指定多个不同的扫描规则。

### 自定义扫描策略

自定义扫描策略需要我们实现`org.springframework.core.type.filter.TypeFilter`接口，创建`MyTypeFilter`实现该接口：

```java
public class MyTypeFilter implements TypeFilter {
    @Override
    public boolean match(MetadataReader metadataReader, MetadataReaderFactory metadataReaderFactory) throws IOException {
        return false;
    }
}
```

该接口包含`match`方法，其两个入参`MetadataReader`和`MetadataReaderFactory`含义如下：

1. `MetadataReader`：当前正在扫描的类的信息；
2. `MetadataReaderFactory`：可以通过它来获取其他类的信息。

当`match`方法返回true时说明匹配成功，false则说明匹配失败。继续完善这个过滤规则：

```java
public class MyTypeFilter implements TypeFilter {
    @Override
    public boolean match(MetadataReader metadataReader, MetadataReaderFactory metadataReaderFactory) {
        // 获取当前正在扫描的类的注解信息
        AnnotationMetadata annotationMetadata = metadataReader.getAnnotationMetadata();
        // 获取当前正在扫描的类的类信息
        ClassMetadata classMetadata = metadataReader.getClassMetadata();
        // 获取当前正在扫描的类的路径等信息
        Resource resource = metadataReader.getResource();

        String className = classMetadata.getClassName();
        return StringUtils.hasText("er");
    }
}
```

上面指定了当被扫描的类名包含`er`时候，匹配成功，配合`excludeFilters`使用意指当被扫描的类名包含`er`时，该类不被纳入IOC容器中。

我们在`@ComponentScan`中使用这个自定义的过滤策略：

```java
@Configuration
@ComponentScan(value = "com.mrdjun.demo",
        excludeFilters = {
            @Filter(type = FilterType.CUSTOM, classes = MyTypeFilter.class)
        })
public class WebConfig {
}
```

启动项目，观察输出：

![QQ截图20190129112811.png](SPRING-Bean-Regist/QQ截图20190129112811.png)

因为`User`，`UserMapper`，`UserService`和`UserController`等类的类名都包含`er`，所以它们都没有被纳入到IOC容器中。

## 组件作用域@Scope

默认情况下，在Spring的IOC容器中每个组件都是单例的，即无论在任何地方注入多少次，这些对象都是同一个，我们来看下例子。

首先将User对象中的`@Component`注解去除，然后在配置类中配置User Bean：

```java
@Configuration
public class WebConfig {
    @Bean
    public User user() {
        return new User("mrdjun", 18);
    }
}
```

接着多次从IOC容器中获取这个组件，看看是否为同一个：

```java
// 返回 IOC 容器，使用注解配置，传入配置类
ApplicationContext context = new AnnotationConfigApplicationContext(WebConfig.class);
Object user1 = context.getBean("user");
Object user2 = context.getBean("user");
// 输出true
System.out.println(user1 == user2);
```

结果证实了上面的观点。

在Spring中我们可以使用`@Scope`注解来改变组件的作用域：

```java

/**
 * When used as a type-level annotation in conjunction with
 * {@link org.springframework.stereotype.Component @Component},
 * {@code @Scope} indicates the name of a scope to use for instances of
 * the annotated type.
 *
 * <p>When used as a method-level annotation in conjunction with
 * {@link Bean @Bean}, {@code @Scope} indicates the name of a scope to use
 * for the instance returned from the method.
 *
 * <p><b>NOTE:</b> {@code @Scope} annotations are only introspected on the
 * concrete bean class (for annotated components) or the factory method
 * (for {@code @Bean} methods). In contrast to XML bean definitions,
 * there is no notion of bean definition inheritance, and inheritance
 * hierarchies at the class level are irrelevant for metadata purposes.
 *
 * <p>In this context, <em>scope</em> means the lifecycle of an instance,
 * such as {@code singleton}, {@code prototype}, and so forth. Scopes
 * provided out of the box in Spring may be referred to using the
 * {@code SCOPE_*} constants available in the {@link ConfigurableBeanFactory}
 * and {@code WebApplicationContext} interfaces.
 *
 * <p>To register additional custom scopes, see
 * {@link org.springframework.beans.factory.config.CustomScopeConfigurer
 * CustomScopeConfigurer}.
 *
 * @author Mark Fisher
 * @author Chris Beams
 * @author Sam Brannen
 * @since 2.5
 * @see org.springframework.stereotype.Component
 * @see org.springframework.context.annotation.Bean
 */
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Scope {

	/**
	 * Alias for {@link #scopeName}.
	 * @see #scopeName
	 */
	@AliasFor("scopeName")
	String value() default "";

	/**
	 * Specifies the name of the scope to use for the annotated component/bean.
	 * <p>Defaults to an empty string ({@code ""}) which implies
	 * {@link ConfigurableBeanFactory#SCOPE_SINGLETON SCOPE_SINGLETON}.
	 * @since 4.2
	 * @see ConfigurableBeanFactory#SCOPE_PROTOTYPE
	 * @see ConfigurableBeanFactory#SCOPE_SINGLETON
	 * @see org.springframework.web.context.WebApplicationContext#SCOPE_REQUEST
	 * @see org.springframework.web.context.WebApplicationContext#SCOPE_SESSION
	 * @see #value
	 */
	@AliasFor("value")
	String scopeName() default "";

	/**
	 * Specifies whether a component should be configured as a scoped proxy
	 * and if so, whether the proxy should be interface-based or subclass-based.
	 * <p>Defaults to {@link ScopedProxyMode#DEFAULT}, which typically indicates
	 * that no scoped proxy should be created unless a different default
	 * has been configured at the component-scan instruction level.
	 * <p>Analogous to {@code <aop:scoped-proxy/>} support in Spring XML.
	 * @see ScopedProxyMode
	 */
	ScopedProxyMode proxyMode() default ScopedProxyMode.DEFAULT;

}
```

1. `singleton`：单实例（默认）,在Spring IOC容器启动的时候会调用方法创建对象然后纳入到IOC容器中，以后每次获取都是直接从IOC容器中获取（`map.get()`）；
2. `prototype`：多实例，IOC容器启动的时候并不会去创建对象，而是在每次获取的时候才会去调用方法创建对象；
3. `request`：一个请求对应一个实例；
4. `session`：同一个session对应一个实例。

## 懒加载@Lazy

懒加载是针对单例模式而言的，正如前面所说，IOC容器中的组件默认是单例的，容器启动的时候会调用方法创建对象然后纳入到IOC容器中。

在User Bean注册的地方加入一句话以观察：

```java
@Configuration
public class WebConfig {
    @Bean
    public User user() {
        System.out.println("往IOC容器中注册user bean");
        return new User("mrdjun", 18);
    }
}
```

测试：

```java
ApplicationContext context = new AnnotationConfigApplicationContext(WebConfig.class);
System.out.println("容器创建完毕");
```

启动项目观察控制台输出:

```
往IOC容器中注册user bean
容器创建完毕
```

可以看到，在IOC容器创建完毕之前，组件已经添加到容器中了。

将User Bean改为懒加载的方式：

```java
@Configuration
public class WebConfig {
    @Bean
    @Lazy
    public User user() {
        System.out.println("往IOC容器中注册user bean");
        return new User("mrdjun", 18);
    }
}
```

再次启动项目，观察输出：

```
容器创建完毕
```

可看到，容器创建完的时候，User Bean这个组件并未添加到容器中。

所以懒加载的功能是，在单例模式中，IOC容器创建的时候不会马上去调用方法创建对象并注册，只有当组件**第一次**被使用的时候才会调用方法创建对象并加入到容器中。

测试一下：

```java
ApplicationContext context = new AnnotationConfigApplicationContext(WebConfig.class);
System.out.println("容器创建完毕");
Object user1 = context.getBean("user");
Object user2 = context.getBean("user");
```

启动项目，观察输出:

```
容器创建完毕
往IOC容器中注册user bean
```

结果证实了我们的观点。

## 条件注册组件

### @Conditional

使用`@Conditional`注解我们可以指定组件注册的条件，即满足特定条件才将组件纳入到IOC容器中。

在使用该注解之前，我们需要创建一个类，实现`Condition`接口：

```java
public class MyCondition implements Condition {
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        return false;
    }
}
```

该接口包含一个`matches`方法，包含两个入参:

1. `ConditionContext`：上下文信息；
2. `AnnotatedTypeMetadata`：注解信息。

简单完善一下这个实现类:

```java
public class MyCondition implements Condition {
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        String osName = context.getEnvironment().getProperty("os.name");
        return osName != null && osName.contains("Windows");
    }
}
```

接着将这个条件添加到User Bean注册的地方：

```java
@Bean
@Conditional(MyCondition.class)
public User user() {
    return new User("mrdjun", 18);
}
```

在Windows环境下，User这个组件将被成功注册，如果是别的操作系统，这个组件将不会被注册到IOC容器中。

### @Profile

`@Profile`可以根据不同的环境变量来注册不同的组件，下面我们来学一下它的用法。

新建一个接口`CalculateService`：

```java
public interface CalculateService {
    Integer sum(Integer... value);
}
```

接着添加两个实现`Java7CalculateServiceImpl`和`Java8CalculateServiceImpl`:

```java
@Service
@Profile("java7")
public class Java7CalculateServiceImpl implements CalculateService {
    @Override
    public Integer sum(Integer... value) {
        System.out.println("Java 7环境下执行");
        int result = 0;
        for (int i = 0; i <= value.length; i++) {
            result += i;
        }
        return result;
    }
}
```

```java
@Service
@Profile("java8")
public class Java8CalculateServiceImpl implements CalculateService {
    @Override
    public Integer sum(Integer... value) {
        System.out.println("Java 8环境下执行");
        return Arrays.stream(value).reduce(0, Integer::sum);
    }
}
```

通过`@Profile`注解我们实现了：当环境变量包含`java7`的时候，`Java7CalculateServiceImpl`将会被注册到IOC容器中；当环境变量包含`java8`的时候，`Java8CalculateServiceImpl`将会被注册到IOC容器中。

测试一下：

```java
ConfigurableApplicationContext context1 = new SpringApplicationBuilder(DemoApplication.class)
                .web(WebApplicationType.NONE)
                .profiles("java8")
                .run(args);

CalculateService service = context1.getBean(CalculateService.class);
System.out.println("求合结果： " + service.sum(1, 2, 3, 4, 5, 6, 7, 8, 9, 10));
```

启动项目，控制台输出如下：

```
The following profiles are active: java8
Java 8环境下执行
求和结果：   55
```

如果将`.profiles("java8")`改为`.profiles("java7")`的话，控制台输出如下：

```
The following profiles are active: java7
Java 7环境下执行
求和结果：   55
```

## 导入组件

### @Import

到目前为止，我们可以使用包扫描和`@Bean`来实现组件注册。除此之外，我们还可以使用`@Import`来快速地往IOC容器中添加组件。

创建一个新的类`Hello`：

```java
public class Hello {}
```

然后在配置类中导入这个组件：

```java
@Configuration
@Import({Hello.class})
public class WebConfig {
	...
}
```

查看IOC容器中所有组件的名称：

```java
ApplicationContext context = new AnnotationConfigApplicationContext(WebConfig.class);
String[] beanNames = context.getBeanDefinitionNames();
Arrays.stream(beanNames).forEach(System.out::println);
```

启动项目，控制台输出:

```
...
webConfig
com.mrdjun.demo.domain.Hello
user
```

可看到，通过`@Import`我们可以快速地往IOC容器中添加组件，Id默认为全类名。

### ImportSelector

通过`@Import`我们已经实现了组件的导入，如果需要一次性导入较多组件，我们可以使用`ImportSelector`来实现。

新增三个类`Apple`，`Banana`和`Watermelon`，代码略。

查看`ImportSelector`源码：

```java
public interface ImportSelector {

    /**
     * Select and return the names of which class(es) should be imported based on
     * the {@link AnnotationMetadata} of the importing @{@link Configuration} class.
     */
     String[] selectImports(AnnotationMetadata importingClassMetadata);
}
```

`ImportSelector`是一个接口，包含一个`selectImports`方法，方法返回类的全类名数组（即需要导入到IOC容器中组件的全类名数组），包含一个`AnnotationMetadata`类型入参，通过这个参数我们可以获取到使用`ImportSelector`的类的全部注解信息。

我们新建一个`ImportSelector`实现类`MyImportSelector`：

```java
public class MyImportSelector implements ImportSelector {
    @Override
    public String[] selectImports(AnnotationMetadata importingClassMetadata) {
        return new String[]{
                "com.mrdjun.demo.domain.Apple",
                "com.mrdjun.demo.domain.Banana",
                "com.mrdjun.demo.domain.Watermelon"
        };
    }
}
```

上面方法返回了新增的三个类的全类名数组，接着我们在配置类的`@Import`注解上使用`MyImportSelector`来把这三个组件快速地导入到IOC容器中：

```java
@Import({MyImportSelector.class})
public class WebConfig {
    ...
}
```

查看容器中是否已经有这三个组件:

```java
ApplicationContext context = new AnnotationConfigApplicationContext(WebConfig.class);
String[] beanNames = context.getBeanDefinitionNames();
Arrays.stream(beanNames).forEach(System.out::println);
```

启动项目，观察控制台：

```
com.mrdjun.demo.domain.Apple
com.mrdjun.demo.domain.Banana
com.mrdjun.demo.domain.Watermelon
```

组件已经成功导入。

### ImportBeanDefinitionRegistrar

除了上面两种往IOC容器导入组件的方法外，我们还可以使用`ImportBeanDefinitionRegistrar`来手动往IOC容器导入组件。

查看其源码：

```java
public interface ImportBeanDefinitionRegistrar {
    public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry);
}
```

`ImportBeanDefinitionRegistrar`是一个接口，包含一个`registerBeanDefinitions`方法，该方法包含两个入参：

1. `AnnotationMetadata`：可以通过它获取到类的注解信息；
2. `BeanDefinitionRegistry`：Bean定义注册器，包含了一些和Bean有关的方法：

```java
 public interface BeanDefinitionRegistry extends AliasRegistry {
    void registerBeanDefinition(String var1, BeanDefinition var2) throws BeanDefinitionStoreException;

    void removeBeanDefinition(String var1) throws NoSuchBeanDefinitionException;

    BeanDefinition getBeanDefinition(String var1) throws NoSuchBeanDefinitionException;

    boolean containsBeanDefinition(String var1);

    String[] getBeanDefinitionNames();

    int getBeanDefinitionCount();

    boolean isBeanNameInUse(String var1);
}
```

这里我们需要借助`BeanDefinitionRegistry`的`registerBeanDefinition`方法来往IOC容器中注册Bean。该方法包含两个入参，第一个为需要注册的Bean名称（Id）,第二个参数为Bean的定义信息，它是一个接口，我们可以使用其实现类`RootBeanDefinition`来完成：

![QQ截图20190130094046.png](SPRING-Bean-Regist/QQ截图20190130094046.png)

为了演示`ImportBeanDefinitionRegistrar`的使用，我们先新增一个类，名称为`Strawberry`，代码略。

然后新增一个`ImportBeanDefinitionRegistrar`实现类`MyImportBeanDefinitionRegistrar`：

```java
public class MyImportBeanDefinitionRegistrar implements ImportBeanDefinitionRegistrar {
    @Override
    public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry) {
        final String beanName = "strawberry";
        boolean contain = registry.containsBeanDefinition(beanName);
        if (!contain) {
            RootBeanDefinition rootBeanDefinition = new RootBeanDefinition(Strawberry.class);
            registry.registerBeanDefinition(beanName, rootBeanDefinition);
        }
    }
}
```

在上面的实现类中，我们先通过`BeanDefinitionRegistry`的`containsBeanDefinition`方法判断IOC容器中是否包含了名称为`strawberry`的组件，如果没有，则手动通过`BeanDefinitionRegistry`的`registerBeanDefinition`方法注册一个。

定义好`MyImportBeanDefinitionRegistrar`后，我们同样地在配置类的`@Import`中使用它：

```java
@Configuration
@Import({MyImportBeanDefinitionRegistrar.class})
public class WebConfig {
    ...
}
```

查看容器中是否已经有这个组件:

```java
ApplicationContext context = new AnnotationConfigApplicationContext(WebConfig.class);
String[] beanNames = context.getBeanDefinitionNames();
Arrays.stream(beanNames).forEach(System.out::println);
```

启动项目，观察控制台：

```
strawberry
```

组件已经注册成功。

## 使用FactoryBean注册组件

Spring还提供了一个`FactoryBean`接口，我们可以通过实现该接口来注册组件，该接口包含了两个抽象方法和一个默认方法：

![QQ截图20190130103346.png](SPRING-Bean-Regist/QQ截图20190130103346.png)

为了演示`FactoryBean`的使用，我们新增一个`Cherry`类，代码略。

然后创建`FactoryBean`的实现类`CherryFactoryBean`:

```java
public class CherryFactoryBean implements FactoryBean<Cherry> {
    @Override
    public Cherry getObject() {
        return new Cherry();
    }

    @Override
    public Class<?> getObjectType() {
        return Cherry.class;
    }

    @Override
    public boolean isSingleton() {
        return false;
    }
}
```

`getObject`返回需要注册的组件对象，`getObjectType`返回需要注册的组件类型，`isSingleton`指明该组件是否为单例。如果为多例的话，每次从容器中获取该组件都会调用其`getObject`方法。

定义好`CherryFactoryBean`后，我们在配置类中注册这个类：

```java
@Bean
public CherryFactoryBean cherryFactoryBean() {
    return new CherryFactoryBean();
}
```

测试从容器中获取：

```java
ApplicationContext context = new AnnotationConfigApplicationContext(WebConfig.class);
Object cherry = context.getBean("cherryFactoryBean");
System.out.println(cherry.getClass());
```

启动项目，观察控制台输出：

```
class com.mrdjun.demo.domain.Cherry
```

可看到，虽然我们获取的是Id为`cherryFactoryBean`的组件，但其获取到的实际是`getObject`方法里返回的对象。

如果我们要获取`cherryFactoryBean`本身，则可以这样做：

```java
Object cherryFactoryBean = context.getBean("&cherryFactoryBean");
System.out.println(cherryFactoryBean.getClass());
```

启动项目，观察控制台：

```
class com.mrdjun.demo.factory.CherryFactoryBean
```

为什么加上`&`前缀就可以获取到相应的工厂类了呢，查看`BeanFactory`的源码会发现原因:

```java
public interface BeanFactory {
    String FACTORY_BEAN_PREFIX = "&";
	...
}
```

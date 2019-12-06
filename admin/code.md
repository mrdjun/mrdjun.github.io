Admin端的代码生成工具，通过SQL语句获取到当前库中的所有数据表，随后选择需要生成代码的表导入，导入后，会删除在`fun-boot.properties`中配置的 tablePrefix 表的前缀，admin端表的命名，前缀为sys_。此外，为了满足更多朋友的需求，完善了可编辑的功能。在导入表后，点击编辑，即可修改字段描述、表描述、包路径、模块名等信息。随后点击保存生成你想要的代码。

![code-generate](../ScreenShot/11.png)

**有一点请注意**

在HTML代码中，默认引入的是页面最基本的样式文件，比如需要输入框下拉选择项，还需要手动引入下拉所需要的文件。引入的文件在 `include.html`配置，其它页面通过`thymeleaf`提供的块引用的方式，从而减少HTML中的Header代码。
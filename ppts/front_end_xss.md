#				XSS攻击及防御—李臣臣

####1、什么是xss攻击

XSS 全称(Cross Site Scripting) 跨站脚本攻击，是为不和层叠样式表(Cascading Style Sheets, CSS)的缩写混淆，故将跨站脚本攻击缩写为XSS， 是Web程序中最常见的漏洞。指攻击者在网页中嵌入客户端脚本(例如JavaScript)，当用户浏览此网页时，脚本就会在用户的浏览器上执行，从而达到攻击者的目的.  比如获取用户的Cookie，导航到恶意网站，携带木马等。

#####	xss出现时机

​	网站中包含大量的动态内容以提高用户体验，比过去要复杂得多。所谓动态内容，就是根据用户环境和需要，Web应用程序能够输出相应的内容。动态站点会受到一种名为“跨站脚本攻击”的威胁，而静态站点则完全不受其影响。

#####xss的类型

XSS分三类，存储型XSS、反射型XSS、DOM-XSS。

存储型：

​	存储型XSS被服务器端接收并存储，当用户访问该网页时，这段XSS代码被读出来响应给浏览器。
反射型XSS与DOM型XSS都必须依靠用户手动去触发，而存储型XSS却不需要。

​	铅球，持久化，存储在服务器，个人信息或者发表文章等地方，存储在服务器上（经过数据库）。

​	数据流向：浏览器 -> 后端 -> 数据库 -> 后端 -> 浏览器。

​	例子：一个form表单，点击存储到数据库中，当我用到这个数据库中东西的时候就会触发。

反射型：

​	反射型XSS也被称为非持久性XSS，是现在最容易出现的一种XSS漏洞。一般是写在URL中，之后设法让被害者点击这个链接。

​	足球，非持久化，欺骗用户去点击链接。XSS的恶意网址发过去（不经过数据库）。

​	数据流向：浏览器 -> 后端 -> 浏览器。

​	例子：一个form表单，输入script弹出测试，经过后端然后反映在浏览器上。

DOM-XSS：

​	基于DOM型的XSS是不需要与服务器交互的，它只发生在客户端处理数据阶段。简单理解DOM XSS就是出现在javascript代码中的xss漏洞。DOM型XSS是前端代码中存在了漏洞，而反射型和存储型xss是服务器端代码漏洞造成的。

​	是由于浏览器解析机制导致的漏洞，服务器不参与，而存储型与反射型都需要服务器响应参与。

​	数据流向：URL-->浏览器

​	例子：页面需要从url上获取参数然后展示在页面上 

​		```a.php?name=<img src=1 onerror=alert(11)>```

​		```<input type="text" name="content" value="XSS Test"/>```

​	对于这种情况，通常会采用输入"/>XSS Test来测试。

或者可以按照两种分类方式：第一，dom型和非dom型。第二，反射型和存储型。这是两种不同的分类。

最大的区别就是是否存储在服务器上。存储型XSS也好，反射型XSS也罢。xss的本质问题就是让对方浏览器执行你插入的js ，所以本质上没太多的区别。

总结: 在易用上，存储型XSS > DOM - XSS > 反射型 XSS。

注：反射型xss和dom-xss都需要在url加入js代码才能够触发。



DOM型的XSS是一种基于网页DOM结构的攻击，该攻击特点是中招的人是少数人。存储式XSS漏洞，由于其攻击代码已经存储到服务器上或者数据库中，所以受害者是很多人。存储式XSS漏洞危害性更大，危害面更广。

**xss是如何发生的**

1、引入标签实现

假如有下面一个输入框

```<input type="text" name="address1" value="value1from">
<input type="text" name="address1" value="value1from">
```

value1from是来自用户的输入，如果用户不是输入value1from,而是输入

 ```"/><script>alert(document.cookie)</script><!-``` 

那么就会变成

```
<input type="text" name="address1" value=""/><script>alert(document.cookie)</script><!- ">
```

嵌入的JavaScript代码将会被执行。

2、利用标签里的属性

用户输入的是  

```"onfocus="alert(document.cookie)```

 那么就会变成 

```
<input type="text" name="address1" value="" onfocus="alert(document.cookie)">
```

事件被触发的时候嵌入的JavaScript代码将会被执行。攻击的威力，取决于用户输入了什么样的脚本。

除了onfocus，还有onclick点击、onmousemove鼠标移动、onload 当页面加载完成后触发……

3、过滤了解决办法

```
<img scr=1 onerror=alert('xss')>当找不到图片名为1的文件时，执行alert('xss')
<a href=javascrip:alert('xss')>s</a> 点击s时运行alert('xss')
<iframe src=javascript:alert('xss');/><iframe>利用iframe的scr来弹窗
<img src="1" onerror=eval("\x61\x6c\x65\x72\x74\x28\x27\x78\x73\x73\x27\x29")></img>过滤了alert来执行弹窗
```

4、引入一整段js代码

```
<script scr="js_url"></script>
```

或者

```
<img src=x onerror=appendChild(createElement('script')).src='js_url' />
```

引入的js可以做很多事情，最严重的就是获取用户的cookies（对http-only没用）。

#### XSS攻击的危害

- 1、盗取各类用户帐号，如机器登录帐号、用户网银帐号、各类管理员帐号
- 2、控制企业数据，包括读取、篡改、添加、删除企业敏感数据的能力
- 3、盗窃企业重要的具有商业价值的资料
- 4、非法转账
- 5、强制发送电子邮件
- 6、网站挂马
- 7、控制受害者机器向其它网站发起攻击

####防御方式

XSS的攻击已经相当成熟，丰富的攻击技巧更是令人眼花缭乱。相比之下，针对XSS的检测和防范方法显得捉襟见肘。幸运的是，尽管很难对XSS攻击做出有效检测，但是如果能依照一定的方法对XSS进行防范，XSS攻击便很难造成实质性的危害

（一）、Anti_XSS

Anti_XSS是微软开发的（.NET平台下）用于防止XSS跨站脚本攻击的类库，它提供了大量的编码函数用于处理用户的输入，可实现输入白名单机制和输出转义。

（二）、HttpOnly Cookie

Cookie都是通过document对象获取的，我们如果能让cookie在浏览器中不可见就可以了，那HttpOnly就是在设置cookie时接受这样一个参数，一旦被设置，在浏览器的document对象中就看不到cookie了。而浏览器在浏览网页的时候不受任何影响，因为Cookie会被放在浏览器头中发送出去(包括Ajax的时候)，应用程序也一般不会在JS里操作这些敏感Cookie的。

扩展：httponly是微软对cookie做的扩展。这个主要是解决用户的cookie可能被盗用的问题。当我们登陆某网站后，服务器会写一些cookie到我们的浏览器，当下次再访问其他页面时，由于浏览器会自动传递cookie，这样就实现了一次登陆就可以看到所有需要登陆后才能看到的内容。也就是说，实质上，所有的登陆状态这些都是建立在cookie上的！如果有人的程序在浏览器里运行获取cookie就会暴露信息。

（三）、WAF

除了使用以上方法地域跨站脚本攻击，还可以使用WAF抵御XSS

WAF指Web应用防护系统或Web应用防火墙，是专门为保护给予Web应用程序而设计的，主要的功能是防范注入网页木马、XSS以及CSRF等常见漏洞的攻击，在企业环境中深受欢迎。

**xss漏洞修复**

原则：不相信用户输入的数据
注意:  攻击代码不一定在script标签中

1. 将重要的cookie标记为http only,   这样的话Javascript 中的document.cookie语句就不能获取到cookie了。

2. 只允许用户输入我们期望的数据。 例如：年龄的textbox中，只允许用户输入数字。 而数字之外的字符都过滤掉。

3. 对数据进行Html Encode 处理。

4. 过滤或移除特殊的Html标签， 例如:

   ``` <script>, <iframe> ,  &lt; for <, &gt; for >, &quot for```

5. 过滤JavaScript 事件的标签。例如 ：

   ```"onclick=", "onfocus" ,"onmousemove"…```

   ​


## 3、angular与XSS防御

为了防范XSS攻击，需要阻止恶意代码进入DOM。比如，如果某个攻击者能骗我们把`<script>`标签插入到DOM，就可以在我们的网站上运行任何代码。 除了`<script>`，攻击者还可以使用很多DOM元素和属性来执行代码，比如`<img onerror="...">`、`<a href="javascript:...">`。 如果攻击者所控制的数据混进了DOM，就会导致安全漏洞。针对常见的漏洞和攻击，比如跨站脚本攻击，Angular提供了一些内置的保护措施。

1、angularJS

SCE，即strict contextual escaping，我的理解是 **严格的上下文隔离 **翻译的可能不准确，但是通过字面理解，应该是angularjs严格的控制上下文访问。

由于angular默认是开启SCE的，也就是说默认会决绝一些不安全的行为，比如你使用了某个第三方的脚本或者库、加载了一段html等等。

**这样做确实是安全了，避免一些跨站XSS，但是有时候我们自己想要加载特定的文件，这时候怎么办呢？**

此时可以通过$sce服务把一些地址变成安全的、授权的链接...简单地说，**就像告诉门卫，这个陌生人其实是我的好朋友，很值得信赖，不必拦截它！**

```
$sce.trustAs(type,name);
$sce.trustAsHtml(value);
$sce.trustAsUrl(value);
$sce.trustAsResourceUrl(value);
$sce.trustAsJs(value);
```

2、为了系统性的防范XSS问题，Angular默认把所有值都当做不可信任的。 当值从模板中以属性（Property）、DOM元素属性（Attribte)、CSS类绑定或插值表达式等途径插入到DOM中的时候， Angular将对这些值进行无害化处理（Sanitize），对不可信的值进行编码。

**Angular的模板同样是可执行的**：模板中的HTML、Attribute和绑定表达式（还没有绑定到值的时候）会被当做可信任的。 这意味着应用必须防止把可能被攻击者控制的值直接编入模板的源码中。永远不要根据用户的输入和原始模板动态生成模板源码！

Angular定义了四个安全环境 - HTML，样式，URL，和资源URL：

- **HTML**：值需要被解释为HTML时使用，比如当绑定到`innerHTML`时。
- **样式**：值需要作为CSS绑定到`style`属性时使用。
- **URL**：值需要被用作URL属性时使用，比如`<a href>`。
- **资源URL**：值需要被当做代码而加载并执行时使用，比如`<script src>`中的URL。

Angular会对前三项中不可信的值进行无害化处理。但Angular无法对第四种资源URL进行无害化，因为它们可能包含任何代码。在开发模式下， 如果Angular在进行无害化处理时需要被迫改变一个值，它就会在控制台上输出一个警告。

我们来看一下具体示例：

```
import { Component } from '@angular/core';

@Component({
  selector: 'exe-app',
  template: `<div [innerHtml]="html"></div>`
  //template: `<div>{{html}}</div>`
})
export class AppComponent {
  html: string;
  constructor() {
    this.html = "<h1>DomSanitizer</h1><script>attackerCode()</script>";    
  }
}
```

插值表达式的内容总会被编码 - 其中的HTML不会被解释，所以浏览器会在元素的文本内容中显示尖括号。

如果希望这段HTML被正常解释，就必须绑定到一个HTML属性上，比如`innerHTML`。但是如果把一个可能被攻击者控制的值绑定到`innerHTML`就会导致XSS漏洞。 比如，包含在`<script>`标签的代码就会被执行：

Angular认为这些值是不安全的，并自动进行无害化处理。它会移除`<script>`标签，但保留安全的内容，比如该片段中的文本内容。

## 信任安全值

有时候，应用程序确实需要包含可执行的代码，比如使用URL显示`<iframe>`，或者构造出有潜在危险的URL。 为了防止在这种情况下被自动无害化，你可以告诉Angular：我已经审查了这个值，检查了它是怎么生成的，并确信它总是安全的。 但是**千万要小心**！如果你信任了一个可能是恶意的值，就会在应用中引入一个安全漏洞。

注入`DomSanitizer`服务，然后调用下面的方法之一，你就可以把一个值标记为可信任的。

- `bypassSecurityTrustHtml`
- `bypassSecurityTrustScript`
- `bypassSecurityTrustStyle`
- `bypassSecurityTrustUrl`
- `bypassSecurityTrustResourceUrl`

一个值是否安全取决于它所在的环境，所以你要为这个值按预定的用法选择正确的环境。假设下面的模板需要把`javascript.alert(...)`方法绑定到URL。



这里看一个例子，如何绑定 iframe 的 src 属性值

```
import { Component } from '@angular/core';

@Component({
  selector: 'exe-app',
  template: `
    <iframe [src]="iframe"></iframe>
  `
})
export class AppComponent {
  iframe: string;
  constructor() {
    this.iframe = "https://segmentfault.com/";       
  }
}
```

会报错误unsafe value used in a resource URL context。抛出错误是因为angular对src提供的资源url是不信任的，怕用户执行某些不安全的操作，所以会拒绝执行。使用DomSanitizer的bypassSecurityTrustResourceUrl方法解决这个问题。

CSRF（Cross-site request forgery），中文名称：跨站请求伪造，也就是伪造请求。

***XSS和CSRF有什么区别么***

XSS是获取信息，不需要提前知道其他用户页面的代码和数据包。CSRF是代替用户完成指定的动作，需要知道其他用户页面的代码和数据包。






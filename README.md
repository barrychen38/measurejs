## measure.js

代码中只针对了主流的 *iPhone 5* 和 *iPhone 6* 尺寸，当然也包括其他相同尺寸手机的型号，后面会有写。

目前可以用于测量 *rem* 和 *px* 两个单位，以后会加入其他单位的测量。

### *rem* 单位长度测量

一般设计出设计稿会有 `320` 和 `375` 的尺寸，其实对应的就是 *iPhone 5* 和 *iPhone 6* 下的尺寸。

如果我们需要用 *rem* 来进行自适应的话，一般需要引用 [*rem.js*](assets/scripts/rem.js) ，写成 *rem* 单位的时候需要除以 `100`，也就是说：

> 538px => 5.38rem

所以全部以我使用的为准吧，感觉有点强盗行为。

这时候出现小数点的单位在浏览器里需要定位调试的话会比较麻烦，尽管浏览器里可以进行整数的和一位小数点的单位快捷键控制，貌似不能进行第三位小数点的单位控制，所以不断控制调整单位总比一次到位来的麻烦。

### *px* 单位长度测量

这个不具体细说了，测量和 *rem* 是一样的，只是显示的单位和数值不一样。

### 使用

#### 1. 得到设计稿尺寸

一般设计稿出的 *iPhone 5* 尺寸为 `640 * 1136`，而 *iPhone 6* 尺寸为 `750 * 1334`，真正的尺寸还需要去掉微信自带的一个导航栏刚好为 `128px`。如果你测量的不是微信的设计稿，就不需要去掉导航栏。

#### 2. 基本用法

```html
<div id="measure"></div>
<script type="text/javascript" src="dist/measure.min.js"></script>
<script type="text/javascript">
  var iPhone = new Measure({
    // Target element
    target: 'measure',

    // Image path
    // Should be relative to this html
    src: 'img/iPhone6.jpg',

    // Have WeChat navbar
    haveNavbar: true,

    // Setup iPhone's edition
    edition: '6s',

    // Specify the unit you want to measure
    // Default is `px`
    unit: 'px',

    // Enable key control
    // Default is `false`
    enableKeyControl: true,

    // Cross lines' color
    // Default is '#DD4B39'
    lineColor: '#DD4B39'
  });

  iPhone.measure();
</script>
```

####  3. 参数和事件

必需参数：

- `target: string`: 容器，接受属性 `id`

- `src: string`: 需要测量的图片，**相对 html 的相对路径**

- `haveNavbar: boolean`: 是否有微信导航栏

- `edition: string`: 手机版本的型号

> 这边提供了7种手机尺寸，分别是：5，5s，SE，6，6s，7，8，其实 640 的写 5，750 的写 6 就好了

可选参数：

- `unit: string`: 需要测量的单位，默认值 `px`，可选 `rem`

- `enableKeyControl: boolean`: 是否需要进行键盘控制，提高准确性，默认 `false`

> 控制键可以是 ⬆️ ⬇️ ⬆️ ➡️，也可以是 `w`， `a`， `s`， `d`

- `lineColor: string`: 交叉十字线的颜色，可以根据图片颜色设置突出点的颜色，便于测量，默认 `#DD4B39`

事件

- `measure: void`: 事件绑定在 events 对象上，方便管理，返回测量值的 left 和 top 值

```javascript
iPhone.events.on('measure', function(left, top) {
  console.log('left: ' + left + iPhone.unit + ';\n' + 'top: ' + top + iPhone.unit + ';');
});
```

####  4. 浏览器操作

在浏览器里打开开发者工具，并选择对应的手机型号：

![iPhone](assets/iPhone.png)

在浏览器里我们可以鼠标点击操作，也可以键盘操作，主要是增加测量的准确性。

### 写在结尾的话

具体的代码可以去参见 [demo](https://chen38.github.io/measurejs/)，需要调整成手机调试模式。

可能在工作中用 *rem* 的时候对于位置的瞄准能节省一点点时间吧。

我又在想如果设计稿有很多趴，我的步骤也多，这样做可能还是有点累的吧 😂，所以仅供参考，可以一起学习。

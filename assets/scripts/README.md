## rem.js

移动端H5页面开发自适应

### 修改方法

|     参数      | 默认    | 类型       |
| :---------: | :---- | :------- |
| deviceWidth | `320` | `Number` |

### 代码如下

```js
(function(doc, win, clientWidthNow) {
    // ...
})(document, window, 320);
```
### 说明

根据设计稿的尺寸一半去设置该参数，因为 *iPhone 5* 和 *6* 的屏幕默认 `@2x`，而 *iPhone plus* 则是 `@3x`，我们需要把屏幕的尺寸缩为一半。
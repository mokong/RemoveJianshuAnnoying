# RemoveJianshuAnnoying
移除简书登陆框、左侧点赞、底部推荐、右侧热门


## 背景

查东西的时候，有些文章在简书，然后在浏览简书的时候，未登录时会弹出登录框，很烦人，所以想屏蔽掉。也想把右边的热门故事和底部的推荐关闭掉。说实话，我对《离婚后，妈宝男前夫后悔了》之类的是真的不感兴趣啊。。。所以就想通过 js 实现过滤掉这三部分。通过暴力猴，然后自己实现一个过滤脚本，具体步骤如下：

<!--more-->

首先明确需求，要移除的共有三个部分，
- 未登录时的登陆框
- 右边的热门故事
- 底部的推荐

如下图所示：

![简书广告](https://raw.githubusercontent.com/mokong/BlogImages/main/简书广告.png)

然后一步步来看。

## 实现


### 登陆框的移除

查看网页源代码，对比登录框弹出前后，可以看出，当登陆框弹出时，`body`的`style`变为了`overflow: hidden;`；且尾部多了一个`div`。如下图：

![源代码1](https://raw.githubusercontent.com/mokong/BlogImages/main/源代码1.png)

所以如果想要去除登陆框，要做的就是在登陆框弹出时，移除尾部的`div`，并把`body`的`style`改为`none`。问题是，如何判断登陆框弹出时？

有两种方案，一种是监听滚动的位置，因为观察发现，登陆框是滚动到指定位置时才弹出的。还有一种是，换一个思路，监听 body 的 style，当`body`的`style`变为`overflow: hidden;`时，说明登陆框弹出了。

这里采用方法二，因为方法一太麻烦了，而且，如果滚动位置不对，会导致登陆框弹出时，移除尾部`div`失败。

然后问题来了，要怎么用代码实现呢？哈哈哈，我不会，但是我知道谁会，找到腾讯混元助手，如下提问`使用 js 写一个暴力猴脚本，当 body 的 style="overflow: hidden;"时，马上变为body 的 style="none"`：如下图，

![自动生成代码1](https://raw.githubusercontent.com/mokong/BlogImages/main/自动生成代码1.png)

上面的方法只是将`body`的`style`改了，并没有移除尾部`div`，所以，还需要移除尾部`div`。而移除尾部`div`，同样，我们让腾讯混元助手帮我们实现，告诉他`使用 js写一个暴力猴脚本，当 body 中有新增 maskDiv 时，且新增 maskDiv 的子 div的子 div 包含class="_23ISFX-mask"的div时，移除maskDiv`，因为通过观察发现，简书弹出登陆框，是在尾部插入了一个新的`div`，所以通过判断没弹登录之前最后的div，如果后面多出了一个`div`，就移除这个`div`。如下图：

![腾讯混元助手](https://raw.githubusercontent.com/mokong/BlogImages/main/screenshot-20240503-145716.png)

然后找到暴力猴，点击 dashboard，新增一个 script，把上面混元助手生成的代码稍微修改后添加进去，并设置匹配的网站，最终如下：

``` js

// ==UserScript==
// @name         简书登录弹窗、推荐、侧边移除
// @namespace    http://www.jianshu.com/
// @version      2024-04-24
// @description  remove jianshu login alert
// @author       morgan
// @match      	 *://*.jianshu.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=jianshu.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 移除登录弹窗
    const targetStyle = "overflow: hidden;";
    const newStyle = "none";
    const styleObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const bodyStyle = document.body.getAttribute('style');
                if (bodyStyle === targetStyle) {
                    document.body.setAttribute('style', newStyle);
                }
            }
        });
    });

    styleObserver.observe(document.body, { attributes: true });

    // 登录弹窗移除
    const targetDivClass = "_23ISFX-mask";
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.tagName.toLowerCase() === 'div') {
                        const grandchildDiv = node.querySelector(`div div.${targetDivClass}`);
                        if (grandchildDiv) {
                            node.remove();
                        }
                    }
                });
            }
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();

```

保存，然后任意打开简书一篇文章，比如：[理解iOS系统剪贴板](https://www.jianshu.com/p/daa2e9793ad4)，测试，可以看到未登录上下滑动时，登陆框不会弹出了。第一步移除登陆框搞定。

### 移除底部推荐

同样查看源代码，如下图，可以看到待移除的推荐的部分是第二个`<section class="ouvJEz">`，第一个`<section class="ouvJEz">`是正常内容部分，第三个`<section class="ouvJEz">`是内容相关的推荐。第二个和第三个`<section class="ouvJEz">`之间有两个`<div>`，`<div class="adad_container">`是广告，`<div id="note-page-comment">`是评价模块。如下图所示：

![简书广告2](https://raw.githubusercontent.com/mokong/BlogImages/main/简书广告2.png)

移除的方式有两种，一种是简单直接的，获取到`class="ouvJEz"`的`section`，然后移除第二个；另外一种是找打广告模块，然后移除广告模块和广告前面的`<section class="ouvJEz">`;

首先来看第一种方式，告诉混元助手:"使用 js 写一个暴力猴脚本，移除第二个class="ouvJEz"的 section"，如下图：

![自动生成代码3](https://raw.githubusercontent.com/mokong/BlogImages/main/自动生成代码3.png)

然后加入到暴力猴脚本中测试，发现不生效；什么原因呢？是判断条件没有满足？还是其他？

通过添加`alert`，可以看到走到了判断条件，但是页面上却没有移除？这又是怎么回事呢？判断可能是因为移除时，数据还请求返回，等数据返回时，又重新把这个`section`添加了回来；简单的说，就是删的早了。那尝试一下添加个1秒延时再去删除，测试后，发现生效了，最终代码如下：

``` js

// ==UserScript==
// @name         简书登录弹窗、推荐、侧边移除
// @namespace    http://www.jianshu.com/
// @version      2024-04-24
// @description  remove jianshu login alert
// @author       morgan
// @match      	 *://*.jianshu.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=jianshu.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 移除登录弹窗
    const targetStyle = "overflow: hidden;";
    const newStyle = "none";
    const styleObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const bodyStyle = document.body.getAttribute('style');
                if (bodyStyle === targetStyle) {
                    document.body.setAttribute('style', newStyle);
                }
            }
        });
    });

    styleObserver.observe(document.body, { attributes: true });

    // 登录弹窗移除
    const targetDivClass = "_23ISFX-mask";
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.tagName.toLowerCase() === 'div') {
                        const grandchildDiv = node.querySelector(`div div.${targetDivClass}`);
                        if (grandchildDiv) {
                            node.remove();
                        }
                    }
                });
            }
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // 移除推荐
    const recommendClass = "ouvJEz";
    const sections = document.querySelectorAll(`section.${recommendClass}`);
    if (sections.length >= 2) {
        setTimeout(() => {
            sections[1].remove();
        }, 1000);
    }
})();

```

再来看下使用第二种方式实现，即：找到广告模块，然后移除广告模块和广告前面的`<section class="ouvJEz">`；询问混元助手：`写一个暴力猴脚本，移除class="adad_container"的 div，以及 div 之前class="ouvJEz"的 section`，如下图所示：

![自动生成代码4](https://raw.githubusercontent.com/mokong/BlogImages/main/自动生成代码4.png)

调试之后发现失败了，什么原因呢？逻辑上是没有问题的，仔细排查之后，发现是因为`<div class="adad_container">` 有两个，我们预期的是，获取到第二个的`<div class="adad_container">`，但是获取到的是第一个，所以获取到`previousElementSibling`元素失败，然后就移除失败。如下图所示：

![简书广告3](https://raw.githubusercontent.com/mokong/BlogImages/main/简书广告3.png)

那么如何解决呢？其实广告模块我并不在意，因为 AdGuard 已经屏蔽了，我真正想移除的是推荐模块，广告只是作为获取推荐的标记，被顺手移除；既然广告模块不唯一不方便作为定位，那就换个唯一的模块，比如评论模块，所以逻辑就变成了，获取到评论模块，然后移除评论模块前面的广告模块和广告前面的推荐模块。询问混元助手：`写一个暴力猴脚本，获取到id="note-page-comment"的 div，移除div之前class="adad_container"的 addiv，以及 addiv 之前class="ouvJEz"的 section`，如下图所示：

![自动生成代码5](https://raw.githubusercontent.com/mokong/BlogImages/main/自动生成代码5.png)

然后测试，发现可以生效，最终代码如下：

``` js

// ==UserScript==
// @name         简书登录弹窗、推荐、侧边移除
// @namespace    http://www.jianshu.com/
// @version      2024-04-24
// @description  remove jianshu login alert
// @author       morgan
// @match      	 *://*.jianshu.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=jianshu.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 移除登录弹窗
    const targetStyle = "overflow: hidden;";
    const newStyle = "none";
    const styleObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const bodyStyle = document.body.getAttribute('style');
                if (bodyStyle === targetStyle) {
                    document.body.setAttribute('style', newStyle);
                }
            }
        });
    });

    styleObserver.observe(document.body, { attributes: true });

    // 登录弹窗移除
    const targetDivClass = "_23ISFX-mask";
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.tagName.toLowerCase() === 'div') {
                        const grandchildDiv = node.querySelector(`div div.${targetDivClass}`);
                        if (grandchildDiv) {
                            node.remove();
                        }
                    }
                });
            }
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // 移除推荐
    // const recommendClass = "ouvJEz";
    // const sections = document.querySelectorAll(`section.${recommendClass}`);
    // if (sections.length >= 2) {
    //    setTimeout(() => {
    //        sections[1].remove();
    //    }, 1000);
    // }

    setTimeout(() => {
        const targetDivId = "note-page-comment";
        const targetDivClass = "adad_container";
        const targetSectionClass = "ouvJEz";

        const targetDiv = document.getElementById(targetDivId);
        const div = targetDiv ? targetDiv.previousElementSibling : null;
        const section = div ? div.previousElementSibling : null;

        if (div && div.classList.contains(targetDivClass) && section && section.classList.contains(targetSectionClass)) {
            div.remove();
            section.remove();
        }
    }, 500);
})();

```

两种方法都能实现，方法一比较简单直接，但是依赖了index，而方法二根据评论模块来定位，如果简书有修改，其实两种方法都存在变动的可能。

### 移除右侧的热门故事

先来看图，如下图所示，真正想移除的是红框的部分，但是绿框部分整个移除更简单，也不影响，所以选择整个移除 aside。

![简书广告4](https://raw.githubusercontent.com/mokong/BlogImages/main/简书广告4.png)

告诉混元助手：`写一个暴力猴脚本，实现移除class="_2OwGUo"的 aside`，如下图所示：

![自动生成代码6](https://raw.githubusercontent.com/mokong/BlogImages/main/自动生成代码6.png)

然后测试，发现没有生效，和移除推荐同样的问题，添加一个延时就可解决，最终代码如下：

``` js

// ==UserScript==
// @name         简书登录弹窗、推荐、侧边移除
// @namespace    http://www.jianshu.com/
// @version      2024-04-24
// @description  remove jianshu login alert
// @author       morgan
// @match      	 *://*.jianshu.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=jianshu.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 移除登录弹窗
    const targetStyle = "overflow: hidden;";
    const newStyle = "none";
    const styleObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const bodyStyle = document.body.getAttribute('style');
                if (bodyStyle === targetStyle) {
                    document.body.setAttribute('style', newStyle);
                }
            }
        });
    });
    styleObserver.observe(document.body, { attributes: true });

    // 登录弹窗移除
    const targetDivClass = "_23ISFX-mask";
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.tagName.toLowerCase() === 'div') {
                        const grandchildDiv = node.querySelector(`div div.${targetDivClass}`);
                        if (grandchildDiv) {
                            node.remove();
                        }
                    }
                });
            }
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // 移除推荐
    // const recommendClass = "ouvJEz";
    // const sections = document.querySelectorAll(`section.${recommendClass}`);
    // if (sections.length >= 2) {
    //    setTimeout(() => {
    //        sections[1].remove();
    //    }, 1000);
    // }

    // 移除推荐方法二
    setTimeout(() => {
        const targetDivId = "note-page-comment";
        const targetDivClass = "adad_container";
        const targetSectionClass = "ouvJEz";

        const targetDiv = document.getElementById(targetDivId);
        const div = targetDiv ? targetDiv.previousElementSibling : null;
        const section = div ? div.previousElementSibling : null;

        if (div && div.classList.contains(targetDivClass) && section && section.classList.contains(targetSectionClass)) {
            div.remove();
            section.remove();
        }
    }, 500);

    // 移除右侧
    const asideClass = "_2OwGUo";
    const aside = document.querySelector(`aside.${asideClass}`);
    if (aside) {
       setTimeout(() => {
           aside.remove();
       }, 1000);
    }
})();

```

最后，既然右侧的热门故事移除了，左侧那个浮动的赞、推荐、手机阅读，就也显示有点`annoying`了，顺手也给移除了，如下图所示：

![简书广告5](https://raw.githubusercontent.com/mokong/BlogImages/main/screenshot-20240428-104634.png)

告诉混元助手：`使用 js 写一个暴力猴脚本，移除class="_3Pnjry"的 div`，如下图所示：

![自动生成代码7](https://raw.githubusercontent.com/mokong/BlogImages/main/自动生成代码7.png)

同样添加一个延时生效，最终完整版代码如下：

``` js

// ==UserScript==
// @name         简书登录弹窗、推荐、侧边移除
// @namespace    http://www.jianshu.com/
// @version      2024-04-24
// @description  remove jianshu login alert
// @author       morgan
// @match      	 *://*.jianshu.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=jianshu.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 移除登录弹窗
    const targetStyle = "overflow: hidden;";
    const newStyle = "none";
    const styleObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const bodyStyle = document.body.getAttribute('style');
                if (bodyStyle === targetStyle) {
                    document.body.setAttribute('style', newStyle);
                }
            }
        });
    });
    styleObserver.observe(document.body, { attributes: true });

    // 登录弹窗移除
    const targetDivClass = "_23ISFX-mask";
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.tagName.toLowerCase() === 'div') {
                        const grandchildDiv = node.querySelector(`div div.${targetDivClass}`);
                        if (grandchildDiv) {
                            node.remove();
                        }
                    }
                });
            }
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // 移除推荐
    // const recommendClass = "ouvJEz";
    // const sections = document.querySelectorAll(`section.${recommendClass}`);
    // if (sections.length >= 2) {
    //    setTimeout(() => {
    //        sections[1].remove();
    //    }, 1000);
    // }

    // 移除推荐方法二
    setTimeout(() => {
        const targetDivId = "note-page-comment";
        const targetDivClass = "adad_container";
        const targetSectionClass = "ouvJEz";

        const targetDiv = document.getElementById(targetDivId);
        const div = targetDiv ? targetDiv.previousElementSibling : null;
        const section = div ? div.previousElementSibling : null;

        if (div && div.classList.contains(targetDivClass) && section && section.classList.contains(targetSectionClass)) {
            div.remove();
            section.remove();
        }
    }, 500);

    // 移除右侧
    const asideClass = "_2OwGUo";
    const aside = document.querySelector(`aside.${asideClass}`);
    if (aside) {
       setTimeout(() => {
           aside.remove();
       }, 1000);
    }

    // 移除左侧点赞、手机查看部分
    const leftAnnoyClass = "_3Pnjry";
    const leftAnnoy = document.querySelector(`div.${leftAnnoyClass}`);
    if (leftAnnoy) {
        setTimeout(() => {
            leftAnnoy.remove();
        }, 1000);
    }
})();

```

对比效果如下：

![移除前](https://raw.githubusercontent.com/mokong/BlogImages/main/移除前.png) | ![移除后](https://raw.githubusercontent.com/mokong/BlogImages/main/移除后.png)
--|--


## 最后

最后，借助腾讯混元助手实现了屏蔽简书上不感兴趣的内容，不需要自己会 js，只需要明确自己想做的，然后借助混元助手，就能实现自己想要的效果，魅力就在于此。

Ps：最后，如果想要在 Safari 中使用，可以使用`Userscripts` 插件，参考[Safari脚本编辑使用体验](https://cloud.tencent.com/developer/article/2210173)。




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

    const rootStyle = document.createElement('style');
    rootStyle.textContent = `
        :root {
            --antd-wave-shadow-color: unset !important;
        }
    `;
    document.head.appendChild(rootStyle);
    
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

    const targetClass = "__copy-button";
    const childListObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                const copyButtonDiv = document.querySelector(`div.${targetClass}`);
                if (copyButtonDiv && copyButtonDiv.nextElementSibling) {
                    copyButtonDiv.nextElementSibling.remove();
                }
            }
        });
    });
    childListObserver.observe(document.body, { childList: true, subtree: true });
    
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
       }, 500);
    }

    // 移除左侧点赞、手机查看部分
    const leftAnnoyClass = "_3Pnjry";
    const leftAnnoy = document.querySelector(`div.${leftAnnoyClass}`);
    if (leftAnnoy) {
        setTimeout(() => {
            leftAnnoy.remove();
        }, 500);
    }
})();

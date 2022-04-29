import { render } from "./render";


// ()()标准的函数，没有赋值给任何变量，没有名字的函数，叫匿名函数,
// 匿名函数，主要是利用函数内的变量作用。避免产生全局变量，影响整体页面环境，增加代码的兼容性。
// 因为没有名字，所以在定义完成就要调用，（（）=> {} ）（），后面的（）是调用运行这个匿名函数的意思
//
const React = (function () {
    let memoizedState = [];
    let cursor = 0;

    // 本质上就是塞到数组里 ，根据数组的序号获取值
    function useState(initialValue) {
        // ?? 当 memoizedState[cursor] 为undefined、null时，state=initialValue，否则 state = memoizedState[cursor]
        let state = memoizedState[cursor] ?? initialValue;

        const _cursor = cursor;

        const setState = (newValue) => (memoizedState[_cursor] = newValue);

        cursor += 1;

        return [state, setState];
    }

    function useEffect(cb, depArray) {
        const oldDeps = memoizedState[cursor];
        let hasChange = true;
        if (oldDeps) {
            hasChange = depArray.some((dep, i) => !Object.is(dep, oldDeps[i]));
        }
        if (hasChange) cb();
        memoizedState[cursor] = depArray;
        cursor++;
    }

    function createElement(type, props, ...children) {
        return {
            type,
            props: {
                ...props,
                children: children.map((child) =>
                    typeof child === "object" ? child : createTextElement(child)
                )
            }
        };
    }

    function createTextElement(text) {
        return {
            type: "TEXT_ELEMENT",
            props: {
                nodeValue: text,
                children: []
            }
        };
    }

    function workLoop() {
        cursor = 0;
        render(memoizedState)();
        //1，直接执行任务队列，会导致#test元素的文本无法及时渲染且 定时渲染任务会出现长时间卡顿
        //
        // 2，在requestIdleCallback中执行任务队列，是在空闲时间去执行队列中的任务，#test的文本内容可以得到及时渲染并且定时任务卡顿不那么严重
        requestIdleCallback(workLoop);
    }
    //https://blog.csdn.net/qdmoment/article/details/100550129?spm=1001.2101.3001.6661.1&utm_medium=distribute.pc_relevant_t0.none-task-blog-2%7Edefault%7ECTRLIST%7ERate-1.pc_relevant_antiscanv2&depth_1-utm_source=distribute.pc_relevant_t0.none-task-blog-2%7Edefault%7ECTRLIST%7ERate-1.pc_relevant_antiscanv2&utm_relevant_index=1
    requestIdleCallback(workLoop);

    return { useState, useEffect, createElement, render: render(memoizedState) };
})();


export default React;
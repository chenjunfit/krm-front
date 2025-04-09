<template>
    <div ref="terminalEl" className="xterm-wrapper"></div>
</template>

<script setup>
import {ref, onMounted, onUnmounted} from 'vue'
import {Terminal} from 'xterm'
import {FitAddon} from 'xterm-addon-fit'


import 'xterm/css/xterm.css';
const terminalEl = ref(null)
const term = new Terminal({
    allowProposedApi: true,
    fontSize: 14,
    theme: {
        background: '#1e1e1e'
    }
})
const fitAddon = new FitAddon()

onMounted(() => {
    term.loadAddon(fitAddon)
    term.open(terminalEl.value)
    fitAddon.fit()

    // 响应式调整
    const resizeObserver = new ResizeObserver(() => fitAddon.fit())
    resizeObserver.observe(terminalEl.value)

    // 示例命令
    term.writeln('\x1b[32m已加载最新版 xterm.js\x1b[0m')

    onUnmounted(() => {
        resizeObserver.disconnect()
        term.dispose()
    })
})

// 暴露终端实例供父组件使用
defineExpose({term})
</script>

<style>
.xterm {
    padding: 8px;
}
</style>
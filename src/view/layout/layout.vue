<template>
    <div class="common-layout">
        <el-container class="el-container">
            <Aside></Aside>
            <el-container class="el-container_el-container">
                <Header></Header>
                <Main></Main>
<!--                <Footer></Footer>-->
            </el-container>
        </el-container>
    </div>
</template>


<script setup>
import Aside from './components/aside.vue'
import Footer from './components/footer.vue'
import Header from './components/header.vue'
import Main from './components/main.vue'
</script>

<style scoped>
.el-container{
    /*100%这是铺满当前的元素，受限于父元素
    vh不会受限于父元素* vh是高度，vw是宽度
    */
    height: 100vh;
    width:  100vw;
}
.el-container_el-container{
    /*把网页变成弹性布局*/
    display: flex;
    /*垂直布局*/
    flex-direction: column;
}
</style>
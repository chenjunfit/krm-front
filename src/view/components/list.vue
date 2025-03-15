<template>
    <el-card
            class="box-card"
    >
        <template #header>
            <div class="card-header" >
                <div>
                    <span>{{props.Title}}</span>
                </div>
                <div class="card-header">
                    <slot name="header-options"></slot>
                </div>
            </div>
        </template>
            <slot name="main"></slot>
            <div class="auto-space-between" style="margin-top: 10px">
                <div><slot name="footer-left"></slot></div>
                <div><slot name="footer-right"></slot></div>
            </div>

    </el-card>

</template>

<script setup>
const props=defineProps({
    Title:{
        default:"",
        type: String
    },

})
</script>

<style scoped>
.card-header{
    display: flex;
    align-items: center;
    justify-content: space-between;
}
</style>
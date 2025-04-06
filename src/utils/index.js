import yaml from 'js-yaml'
export const object2list=(obj)=>{

    let list=[]
    if(obj==null||obj==undefined){
        return list
    }

    for (let [key,value] of Object.entries(obj)){
        const o={
            key:key,
            value:value
        }
        list.push(o)
    }
    return list

}

export const deleteTableRow=(list,index)=>{
    list.splice(index,1)
}

export const list2object=(list)=>{
    let obj={}

    if (list==null||list==undefined){
        return obj
    }
    for(let i=0;i<list.length;i++){
        const item=list[i]
        if(item.key==""){
            continue
        }
        obj[item.key]=item.value
    }
    return  obj
}
export const objectToString=(obj,split)=>{
    let labelSelector=""
    if(obj!=null&&obj!=undefined){
        let labelSelectorList=[]
        for(let [key,value] of Object.entries(obj)){
            const keyValueString=`${key}=${value}`
            labelSelectorList.push(keyValueString)
        }
        labelSelector=labelSelectorList.join(split)
    }
    return labelSelector
}
export const obj2yaml=(obj)=>{
    let yamlData=null

    try {
        yamlData=yaml.dump(obj)
    }catch (err){
        yamlData="转换失败"+err
    }
    return yamlData


}

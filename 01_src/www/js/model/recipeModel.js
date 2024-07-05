/**
 * Created by jim on 2021/12/16.
 * 合成配方
 */

/* 配方 V1
配方	精华1	精华2	精华3	产出
1	M	    M	    M	    M+1
2	S	    S	    S	    S+1
3	H	    H	    H	    H+1
4	X11	    X11	    X11	    X11 x 3
5	M	    S-1	    S-1	    H => M S-1 S-1 = H  // 从小到大排序， M H S
6	S	    M-1	    M-1	    H => M M S+1 = H+1
7	H	    S-1	    S-1	    S => H S-1 S-1 = S
8	H	    M-1	    M-1	    M => M M H+1 = M+1
 */

/**
 * 配方 V2  2025.05.11
 * 类型：阴=-1阳=1和=0
 * 等级：level
 * 产出物等级判断: 默认等于最高等级的；三个等级相同的，等级+1；三个顶级的，不予合并变化
 * 产出物类型判断: Sum( level*类型(1/-1/0) ) , 大于0=阳性 小于0 阴性 =0 调和
 */
class RecipeModel{
    /** v2 版本配方 **/
    static composeV2(intItemIdArr){
        if(intItemIdArr.length !== 3) return intItemIdArr;      // 没有三个
        if((!ItemModel.isGem(intItemIdArr[0]))
            || (!ItemModel.isGem(intItemIdArr[1]))
            || (!ItemModel.isGem(intItemIdArr[2]))) return intItemIdArr;   // 不是宝石

        // intItemIdArr.sort(function(a, b){return a - b});    // 从小到大排序，注意是引用，因此改变了原数组
        let item1 = RecipeModel.diagnosticGem(intItemIdArr[0]);
        let item2 = RecipeModel.diagnosticGem(intItemIdArr[1]);
        let item3 = RecipeModel.diagnosticGem(intItemIdArr[2]);

        let newTypeValue = (item1.neiliType-1) * item1.level + (item2.neiliType-1) * item2.level + (item3.neiliType-1) * item3.level;
        let newType = Math.sign(newTypeValue) + 1;

        let newLevel = Math.max(item1.level,item2.level,item3.level);
        if((item1.level === item2.level) && (item2.level === item3.level)){
            if(item1.level >= 11){
                return intItemIdArr;    // 已经是最大等级
            }
            newLevel = item1.level + 1; // 三个等级相等，等级+1
        }

        let intGemId = RecipeModel.calcGemId({"neiliType":newType,"level":newLevel});
        return [intGemId];
    }


    /** V1 版本 配方 **/
    static compose(intItemIdArr){
        if(intItemIdArr.length !== 3) return intItemIdArr;      // 没有三个
        if((intItemIdArr[0] > 141) || (intItemIdArr[0]<109)) return intItemIdArr;   // 不是宝石
        if((intItemIdArr[1] > 141) || (intItemIdArr[1]<109)) return intItemIdArr;   // 不是宝石
        if((intItemIdArr[2] > 141) || (intItemIdArr[2]<109)) return intItemIdArr;   // 不是宝石

        intItemIdArr.sort(function(a, b){return a - b});    // 从小到大排序，注意是引用，因此改变了原数组

        if( (intItemIdArr[0] === intItemIdArr[1] ) && ( intItemIdArr[1] === intItemIdArr[2]) ){
            // 三个都相等 - 配方 1 2 3 ，注意配方4的情况
            let item = RecipeModel.diagnosticGem(intItemIdArr[0]);
            if(item.level === 11) return intItemIdArr;  // 配方4 不改变，直接返回
            return [(intItemIdArr[0]+1)]; // 配方 1 2 3
        }

        let item1 = RecipeModel.diagnosticGem(intItemIdArr[0]);
        let item2 = RecipeModel.diagnosticGem(intItemIdArr[1]);
        let item3 = RecipeModel.diagnosticGem(intItemIdArr[2]);
        if((item1.level === 0) || (item2.level === 0) || (item3.level === 0)) return intItemIdArr;

        if((item1.neiliType === 0 ) && (item2.neiliType === 2) && (item3.neiliType === 2 )){ // M S S
            // rule 5 - check level
            // M S-1 S-1 = H
            if((item1.level === item2.level+1) && (item2.level === item3.level)){
                return [(intItemIdArr[0] + 11)];
            }
        }

        if((item1.neiliType === 0 ) && (item2.neiliType === 0) && (item3.neiliType === 2 )){ // M M S
            // rule 6 - check level
            // M M S+1 = H+1
            if((item1.level === item2.level) && (item2.level +1 === item3.level)){
                return [(intItemIdArr[0] + 12)];
            }
        }

        if((item1.neiliType === 1 ) && (item2.neiliType === 2) && (item3.neiliType === 2 )){ // H S S
            // rule 7 - check level
            // H S-1 S-1 = S
            if((item1.level === item2.level+1) && (item2.level === item3.level)){
                return [(intItemIdArr[1] + 1)];
            }
        }

        if((item1.neiliType === 0 ) && (item2.neiliType === 0) && (item3.neiliType === 1 )){ // M M H
            // rule 8 - check level
            // M M H+1 = M+1
            if((item1.level === item2.level)&&(item2.level === item3.level-1)){
                return [(intItemIdArr[0]+1)];
            }
        }

        // 所有的规则都不匹配
        // return intItemIdArr;
        return [];
    }

    /**
     * 分解宝石
     * @param intItemId
     * @returns {*[]}
     */
    static decompose(intItemId){
        if(!ItemModel.isGem(intItemId)) return [];
        let gem = RecipeModel.diagnosticGem(intItemId);
        if(gem.level === 1) return [intItemId]; // 无法再分解，保持不变
        gem.level = gem.level-1;
        let intGemId = RecipeModel.calcGemId(gem);
        return [intGemId,intGemId,intGemId];
    }

    static diagnosticGem(intItemId){
        let neiliType = -1;
        if(intItemId>=109 && intItemId<=119) neiliType = 0;     // NeiLiType.Yin
        if(intItemId>=120 && intItemId<=130) neiliType = 1;     // NeiLiType.He
        if(intItemId>=131 && intItemId<=141) neiliType = 2;     // NeiLiType.Yang

        let level = intItemId - 108 - neiliType*11;
        // let level = intItemId - offset; // [109 119] [120 130] [131 141]
        if((neiliType === -1)||(level <=0)||(level >11)) return {"neiliType":neiliType,"level":0};
        return {"neiliType":neiliType,"level":level};
    }

    /**
     * 根据 精华的物品id, 计算对应的武学秘笈卷轴的 物品等级
     // lv4 以下不参与领悟
     // lv4=40%tier1 40%tier1 20%fail
     // lv5=40%tier1 40%tier2 20%fail
     // lv6=40%t2 40%t3 20%fail
     // lv7=40%t3 40%t4 20%fail
     // lv8=40%t4 40%t5 20%fail
     // lv9=40%t5 40%t6 20%fail
     // lv10=40%t6 40%t7 20%fail
     // lv11=40%t7 40%t7 20%fail
     * @param intGemId
     */
    static calcItemLevelFromGemId(intGemId){
        let gem = RecipeModel.diagnosticGem(intGemId);
        if (gem.level < 3) return -2; // 合成失败 - 等级太低，不参与领悟
        let roll = SeedRandom.getRand(0,100);   // [0,100)
        if(roll >=80) return -1;    // 合成失败，概率
        if(roll>=40) return Math.max(Math.min(gem.level-3,7),2);
        return Math.max(2,gem.level-4); // 20220813 最低2级
    }

    // 暂未使用
    static calcGemId(gemObj){
        return gemObj.neiliType * 11 + gemObj.level + 108;
    }
}


/*
109	支离的阴柔精华	4	精华1	杂物	0	300	1	1	副本	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
110	残缺的阴柔精华	4	精华2	杂物	0	900	1	1	副本	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
111	破裂的阴柔精华	4	精华3	杂物	0	2,700	1	1	副本	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
112	普通的阴柔精华	4	精华4	杂物	0	8,100	1	1	副本	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
113	明亮的阴柔精华	4	精华5	杂物	0	24,300	1	1	副本	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
114	圆润的阴柔精华	4	精华6	杂物	0	72,900	1	1	副本	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
115	完美的阴柔精华	4	精华7	杂物	0	218,700	1	1	副本	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
116	无暇的阴柔精华	4	精华8	杂物	0	656,100	1	1	副本	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
117	璀璨的阴柔精华	4	精华9	杂物	0	1,968,300	1	1	副本	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
118	辉光的阴柔精华	4	精华10	杂物	0	5,904,900	1	1	副本	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
119	永恒的阴柔精华	4	精华11	杂物	0	17,714,700	1	1	杜甫	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
120	支离的调和精华	4	精华1	杂物	0	300	1	1	副本	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
121	残缺的调和精华	4	精华2	杂物	0	900	1	1	副本	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
122	破裂的调和精华	4	精华3	杂物	0	2,700	1	1	副本	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
123	普通的调和精华	4	精华4	杂物	0	8,100	1	1	副本	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
124	明亮的调和精华	4	精华5	杂物	0	24,300	1	1	副本	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
125	圆润的调和精华	4	精华6	杂物	0	72,900	1	1	副本	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
126	完美的调和精华	4	精华7	杂物	0	218,700	1	1	副本	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
127	无暇的调和精华	4	精华8	杂物	0	656,100	1	1	副本	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
128	璀璨的调和精华	4	精华9	杂物	0	1,968,300	1	1	副本	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
129	辉光的调和精华	4	精华10	杂物	0	5,904,900	1	1	副本	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
130	永恒的调和精华	4	精华11	杂物	0	17,714,700	1	1	杜甫	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
131	支离的阳刚精华	4	精华1	杂物	0	300	1	1	副本	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
132	残缺的阳刚精华	4	精华2	杂物	0	900	1	1	副本	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
133	破裂的阳刚精华	4	精华3	杂物	0	2,700	1	1	副本	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
134	普通的阳刚精华	4	精华4	杂物	0	8,100	1	1	副本	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
135	明亮的阳刚精华	4	精华5	杂物	0	24,300	1	1	副本	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
136	圆润的阳刚精华	4	精华6	杂物	0	72,900	1	1	副本	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
137	完美的阳刚精华	4	精华7	杂物	0	218,700	1	1	副本	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
138	无暇的阳刚精华	4	精华8	杂物	0	656,100	1	1	副本	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
139	璀璨的阳刚精华	4	精华9	杂物	0	1,968,300	1	1	副本	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
140	辉光的阳刚精华	4	精华10	杂物	0	5,904,900	1	1	副本	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0
141	永恒的阳刚精华	4	精华11	杂物	0	17,714,700	1	1	杜甫	0	50	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0

 */
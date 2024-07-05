/**
 * Created by jim on 2023/10/02.
 * 药品基本资料，以及医书修炼之后的药品生成
 */

class MedicineModel{
    /**
     * 获取药物的治疗加成效果
     * @param intMedId - 药品ID [348,354]
     * @return {number} - 加成系数
     */
    static getMedEffectById(intMedId){
        switch (intMedId){
            case 348: return 1.04;
            case 349: return 1.05;
            case 350: return 1.06;
            case 351: return 1.08;
            case 352: return 1.12;
            case 353: return 1.20;
            case 354: return 1.36;
            default: return 1.0;
        }
    }

    /**
     * 医书修炼成功时，药材研制成的药物逻辑
     * @param intTier 医书Tier
     * @param intHerbCount 药材数量
     * @return {[{count: number, id: *}]} 药物物品编号-数量 数组
     */
    static levelUp(intTier,intHerbCount){
        // - 最高造出对应Tier的药品
        // - 每次对应Tier的保底10-Tier个
        // - 附带造出所有低等级药品，概率不同，数量不同
        // - 50% t-1 40% t-2 30% t-3，个数=tier
        // - 每个药品都需要消耗1个药材
        // - 药材不够，优先取消低级药品
        // - 物品栏位不够，优先存高级药品
        if(intTier < 1) return [];
        if(intTier > 7) return [];

        let mCnt = 10 - intTier;    // 保底个数
        let mId = GlobalConfig.ITEM_HERB_ID + intTier;
        // let herbCnt = CharacterModel.countItem(GlobalConfig.ITEM_HERB_ID);
        let herbCnt = intHerbCount;
        if(herbCnt <=0) return [];     // 并没有药材，直接返回
        mCnt = Math.min(herbCnt,mCnt);  // 有药材，比较药材个数与生成的保底个数
        let rea = [{'id':mId,'count':mCnt}];
        herbCnt = herbCnt - mCnt;   // 计算剩余的药材数，肯定是 >=0 的
        if(herbCnt <= 0) return rea;    // 如果 小于等于0，不需要再计算后续的生成逻辑了

        if(intTier > 1){
            let nId = mId - 1;
            // 50% Tier个 T-1
            let nCnt = MedicineModel.percentCount(0.5,intTier);
            if(nCnt > 0){       // bug-fix: 这里可能随机到0 的情况，应该跳过，继续下一个，而不是反馈 0个
                nCnt = Math.min(nCnt,herbCnt);
                rea.push({'id':nId,'count':nCnt});
                herbCnt = herbCnt - nCnt;
            }
            if(herbCnt <= 0) return rea;
        }
        if(intTier > 2){
            let oId = mId - 2;
            // 40% Tier个 T-2
            let oCnt = MedicineModel.percentCount(0.4,intTier);
            if(oCnt > 0){
                oCnt = Math.min(oCnt,herbCnt);
                rea.push({'id':oId,'count':oCnt});
                herbCnt = herbCnt - oCnt;
            }
            if(herbCnt <= 0) return rea;
        }
        if(intTier > 3){
            let qId = mId - 3;
            // 30% Tier个 T-3
            let qCnt = MedicineModel.percentCount(0.3,intTier);
            if(qCnt > 0){
                qCnt = Math.min(qCnt,herbCnt);
                rea.push({'id':qId,'count':qCnt});
            }
        }
        return rea;
    }

    /**
     * fPercent 概率 生成 iCount个药物，计算实际生成了几个
     * @param fPercent 概率 ，例如 30% 概率
     * @param iCount   生成几个，例如 生成 7 个
     * @return {number} 实际生成几个。
     */
    static percentCount(fPercent,iCount){
        let iCnt = 0;
        for(let i=0;i<iCount;i++){
            if(Math.random() < fPercent){
                iCnt++;
            }
        }
        return iCnt;
    }

}

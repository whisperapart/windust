/**
 * Created by jim on 2020/5/8.
 */
class SkillModel{
    constructor(){

    }

    static Zero(){
        let r = {};
        r.fist = 0;
        r.sword = 0;
        r.machete = 0;
        r.spear = 0;
        r.ejection = 0;
        r.heal = 0;
        r.enchant = 0;
        r.swift = 0;
        return r;
    }

    static merge(sArr){
        let r = SkillModel.Zero();
        sArr.forEach(function(s){
            //console.log(' => '+JSON.stringify(s));
            r.fist += s.fist;
            r.sword += s.sword;
            r.machete += s.machete;
            r.spear += s.spear;
            r.ejection += s.ejection;
            r.heal += s.heal;
            r.enchant += s.enchant;
            r.swift += s.swift;
        });
        // console.log('inside calc:'+JSON.stringify(r));
        return r;
    }

}

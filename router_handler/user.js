//导入数据库操作模块
const db = require('../db/index')
//导入 bcryptjs 密码加密包
const bcrypt = require('bcryptjs')
//导入生成 Token 的包
const jwt = require('jsonwebtoken')
//导入全局配置文件
const config = require('../config.js')

//用户注册处理函数
exports.reguser = (req,res) => {
    const userInfo = req.body
    console.log(userInfo);
    //对表单中的数据进行合法性的校验
    if(!userInfo.username || !userInfo.password){
        return res.send({status: 1, message: '用户名或者密码不合法'})
    }

    const sqlStr = 'select * from ev_users where username=? and nickname=?'
    db.query(sqlStr,[userInfo.username,userInfo.nickname],(err,results)=>{
        if(err){
            return res.send({status: 1,message: err.message})
        }
        //判断用户名是否被占用
        if(results.length > 0){
            return res.cc('用户名被占用，请更换其他用户名！')
        }
        //调用 bcrypt.hasjSync() 对密码进行加密 , 对用户的密码,进行 bcrype 加密，返回值是加密之后的密码字符串
        userInfo.password = bcrypt.hashSync(userInfo.password, 10)
        
        //插入新用户
        const sql = 'insert into ev_users set ?'
        db.query(sql,{username:userInfo.username,password:userInfo.password,nickname:userInfo.nickname},(err,results)=>{
            if(err) return res.send({status:1,message:err.message})
            if(results.affectedRows !== 1) return res.send({status:1,message:'用户注册失败，请稍后再试！'})
            res.send({status:0,message:'注册成功！'})
        })

    })
}

//用户登录处理函数
exports.login  = (req,res) => {
    const userInfo = req.body
    const sql = `select * from ev_users where username=?`
    db.query(sql,userInfo.username, (err,results)=>{
        if(err) return res.cc(err)
        if(results.length !== 1) return res.cc('登陆失败')

        const compareResult = bcrypt.compareSync(userInfo.password, results[0].password)
        if(!compareResult) return res.cc('密码错误，登陆失败！')

        //在服务器生成 Token 字符串
        const user = { ...results[0],password: '',user_pic: ''}
        //对用户信心进行加密，生成Token字符串
        const tokenStr = jwt.sign(user,config.jwtSecretKey,{ expiresIn: config.expiresIn})
        //调用 res.send() 将 Token相应给客户端
        res.send({
            status: 0,
            message:'登陆成功！',
            token: 'Bearer ' + tokenStr,
        })
    })
}

//用户登录处理函数
exports.backlogin  = (req,res) => {
    const userInfo = req.body
    const sql = `select * from ev_users where username=? and permissiontype in (1,2)`
    db.query(sql,userInfo.username, (err,results)=>{
        if(err) return res.cc(err)
        if(results.length !== 1) return res.cc('登陆失败，可能因为您不是管理员！')

        const compareResult = bcrypt.compareSync(userInfo.password, results[0].password)
        if(!compareResult) return res.cc('密码错误，登陆失败！')

        //在服务器生成 Token 字符串
        const user = { ...results[0],password: '',user_pic: ''}
        //对用户信心进行加密，生成Token字符串
        const tokenStr = jwt.sign(user,config.jwtSecretKey,{ expiresIn: config.expiresIn})
        //调用 res.send() 将 Token相应给客户端
        res.send({
            status: 0,
            message:'登陆成功！',
            token: 'Bearer ' + tokenStr,
        })
    })
}

//发现页面获得文章数据
exports.SearchArticlesInfo = (req,res) => {
    const articlesInfo = req.body
    let input = "%" + articlesInfo.input + "%"

    if(articlesInfo.input === ''){
        const sql = 'select * from articles where approval = 1'
        db.query(sql,articlesInfo.id,(err,results)=>{
            if(err) return res.cc(err)
            
            if(results.length >= 0){

                //深拷贝
                const list = JSON.parse(JSON.stringify(results))

                results.forEach((item,index)=>{
                    const picList  = (item.pic.split('$$'))
                    list[index].pic = picList
                    // console.log(list[index]);
                })

                res.send({
                    status: 200,
                    data: list,
                    message:'输入为空，将显示所有内容'
                })
            }else{
                res.send({
                    status: 202,
                    message: '抱歉没有搜索到相关内容！'
                })
            }
        })
    }else{
        const sql = 'select * from articles where CONCAT(`title`,`content`,`articledesc`) like ?'
        db.query(sql,input,(err,results)=>{
            if(err) return res.cc(err)
            if(results.length == 0){
                res.send({
                    status: 201,
                    message:'抱歉没有搜索到相关内容！'
                })
            }else{
                //深拷贝
                const list = JSON.parse(JSON.stringify(results))

                results.forEach((item,index)=>{
                    const picList  = (item.pic.split('$$'))
                    list[index].pic = picList
                    console.log(list[index]);
                })
                res.send({
                    status: 200,
                    message: '查询成功！',
                    data: list
                })
            }
        })
    }
}

// //发现页面文章点赞
// exports.getArticleLikeNum = (req,res)=>{
//     const articleinfo = req.body
//     // console.log(articleinfo);
//     const sqlStr = 'select usersid from likeslist where articleid = ?'
//     db.query(sqlStr,[articleinfo.articleid],(err,results)=>{
//         const list = JSON.parse(JSON.stringify(results))
//         let finalList = list[0].usersid
//         let final = finalList + ',' + articleinfo.authorid
//         console.log(final);
//         let list1 = final
//         let list2 = list1.split(',').length
//         if(err) return res.cc(err)
//         res.send({
//             status: 200,
//             data:list2
//         })
//     })
//     // const sql = 'select count(*) from likeslist where articleid = ?'
//     // db.query(sql,[articleinfo.articleid],(err,results)=>{
//     //     if(err) return res.cc(err)
//     //     res.send({
//     //         status: 200,
//     //         data:results
//     //     })
//     // })
// }

//发现页面点赞功能
exports.getArticleLikeNum = (req,res)=>{
    const articleinfo = req.body
    const sqlStr = 'select usersid from likeslist where articleid = ?'
    db.query(sqlStr,[articleinfo.articleid],(err,results)=>{
        if(err) return res.cc(err)
        res.send({
            status: 200,
            data:results
        })
    })
}

//药方页面获取药方数据
exports.SearchHerbInfo = (req,res)=>{
    const herbinfo = req.body
    let input = "%" + herbinfo.input + "%"
    // console.log(req.body);

    if(herbinfo.input === ''){
        res.send({
            status: 202,
            message: '输入不能为空！'
        })
    }else{
        const sqlStr = 'select * from herb where concat(`herbname`) like ?'
        db.query(sqlStr,input,(err,results)=>{
            if(err) return res.cc(err)
            if(results.length == 0){
                const sql = 'select * from herb where concat(`content`) like ?'
                db.query(sql,input,(err,results)=>{
                    // console.log(results);
                    if(err) return res.cc(err)
                    if(results.length == 0){
                        res.send({
                            status: 201,
                            message:'抱歉没有搜索到相关内容！'
                        })
                    }else{
                        res.send({
                            status: 200,
                            message: '查询成功！',
                            data: results
                        })
                    }
                })
            }else{
                res.send({
                    status: 200,
                    message: '用中草药名称搜索中草药成功，下方地图显示该草药产出地！',
                    data: results
                })
            }
        })

    }
}

//首页获取器官信息
exports.getOrganInfo = (req,res)=>{
    const organinfo = req.body
    // console.log(organinfo.engname);
    const sql = 'select * from organ where engname = ?'
    db.query(sql,organinfo.engname,(err,results)=>{
        if(err) return res.cc(err)
        if(results.length !== 1) return res.cc('获取器官文章失败！')
        res.send({
            status: 200,
            message: '获取器官文章成功！',
            data: results[0]
        })
    })
}

//药方页面展示不同类别的草药
exports.getTypeHerb = (req,res)=>{
    const herbinfo = req.body
    // console.log(herbinfo.herbtype);
    const sql = 'select herbname,herbtype from herb where herbtype = ?'
    db.query(sql,herbinfo.herbtype,(err,results)=>{
        if(err) return res.cc(err)
        if(results.length == 0) return res.cc('获取该类别的草药失败！')
        res.send({
            status: 200,
            message: '获取该类别的草药成功',
            data:results
        })
    })
}
//===============================================


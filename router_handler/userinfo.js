//导入数据库操作模块
const db = require('../db/index')
//导入处理密码模块
const bcrypt = require('bcryptjs')
const path = require('path');
const fs = require('fs');

//获取用户基本信息
exports.getUserInfo = (req,res)=>{
    const sql = 'select id, username, nickname, email, user_pic, mydesc, permissiontype, permission from ev_users where id =?'
    // console.log(req.user);
    db.query(sql,req.user.id,(err,results)=>{
        if(err) return res.cc(err)
        if(results.length !== 1) return res.cc('获取用户信息失败！')
        res.send({
            status: 0,
            message: '获取用户信息成功！',
            data: results[0]
        })
    })
}

//更新用户基本信息
exports.updateUserInfo = (req,res)=>{
    const sql = 'update ev_users set ? where id=?'
    db.query(sql, [req.body,req.body.id],(err, results)=>{
        if(err) return res.cc(err)
        if(results.affectedRows !== 1) return res.cc('更新用户基本信息失败！')
        res.cc('更新用户信息成功！', 0)
    })
}

//更新用户头像
exports.updateAvatar = (req,res)=>{
    const sql = 'update ev_users set user_pic =? where id = ?'
    // console.log(req.body);
    // console.log(req.user.id);
    db.query(sql,[req.body.avatar,req.user.id],(err,results)=>{
        if(err) return res.cc(err)
        if(results.affectedRows !== 1) return res.cc('更换头像失败！')
        res.cc('头像更换成功！',0)
    })
}

//修改密码
exports.updatePassword = (req,res)=>{
    const sql = 'select * from ev_users where id = ?'
    db.query(sql,req.user.id,(err,results)=>{
        if(err) return res.cc('err')
        if(results.length !== 1) return res.cc('用户不存在！')
        //判断密码是否正确
        const compareResults = bcrypt.compareSync(req.body.oldPwd, results[0].password)
        if(!compareResults) return res.cc('旧密码错误！')

        const sql = 'update ev_users set password=? where id=?'
        //新密码加密
        const newPwd = bcrypt.hashSync(req.body.newPwd,10)
        db.query(sql,[newPwd,req.user.id],(err,results)=>{
            if(err) return res.cc(err)
            if(results.affectedRows !== 1) return res.cc('更新密码失败！')
            res.cc('密码更新成功！！',0)
        })
    }) 
}

//上传文章
exports.addArticleInfo = (req,res)=>{
    const articlesinfo = req.body
    const sql = 'insert into articles set ?'
    db.query(sql,articlesinfo,(err,results)=>{
        if(err) return res.cc(err)
        if(results.affectedRows === 1){
            res.send({
                status: 0,
                message: '添加成功'
            })
        }
    })
}

//上传草药信息列表
exports.addHerbInfo = (req,res)=>{
    const herbinfo = req.body
    const sqlStr = 'select id from herb where herbname = ?'
    db.query(sqlStr, herbinfo.herbname,(err,results)=>{
        if(err) return res.cc(err)
        if(results.length > 0){
            res.send({
                status: 202,
                message: '请勿重复添加！'
            })
        }else{
            const sql = 'insert into herb set ?'
            db.query(sql,herbinfo,(err,results)=>{
                if(err) return res.cc(err)
                if(results.affectedRows === 1){
                    res.send({
                        status: 0,
                        message: '添加成功'
                    })
                }
            })
        }
    })
}

// 上传器官信息
exports.addOrganInfo = (req,res)=>{
    const organinfo = req.body
    const sql = 'insert into organ set ?'
    db.query(sql,organinfo,(err,results)=>{
        if(err) return res.cc(err)
        if(results.affectedRows === 1){
            res.send({
                status: 0,
                message: '添加成功'
            })
        }
    })
}

//文章上传图片
exports.addArticlePic = (req,res)=>{

    let articleinfo = req.query.articleinfo
    let oldPath = []
    req.files.forEach((item,index)=>{
        oldPath.push(req.files[index].path)
    })

    const time = Date.now()

    let newPath = []
    oldPath.forEach((item,index)=>{
        newPath[index] = 'uploads/articlepic/' + articleinfo.title + [index] + time + '_articlePic.jpg'
        fs.renameSync(oldPath[index],newPath[index])
    })

    let finalPath = ''
    newPath.forEach((item,index)=>{
        finalPath  = finalPath + newPath[index] + '$$'
    })

    let picUrl = []
    oldPath.forEach((item,index)=>{
        picUrl[index] = '/articlepic/' + articleinfo.title + [index] + time + '_articlePic.jpg'
    })

    let finalpicUrl = ''
    picUrl.forEach((item,index)=>{
        finalpicUrl  = finalpicUrl + picUrl[index] + '$$'
    })
    const sql = 'update articles set pic =? where title=?'

    db.query(sql,[finalpicUrl, articleinfo.title],(err,results)=>{
        if(err) return res.cc(err)
        if(results.affectedRows === 1){
            res.send({
                status: 200,
                message: '上传成功',
            })
        }else{
            res.send({
                status: 400,
                message: '上传失败',
            })
        }
    })
}

//《我的博客》页面获取文章总条数
exports.getMyBlogUserListLength = (req,res)=>{
    const userInfo = req.user
    const sqllength = 'select count(*) as id from articles where authorId = ?'
    db.query(sqllength,userInfo.id,(err,results)=>{
        // console.log(results);
        if(err) return res.cc(err)
        res.send({
            status: 200,
            data:results
        })
    })
}

//《我的博客》页面显示文章内容
exports.getMyBlogUserArticles = (req,res)=>{
    let currentPage = 1
    let pageSize = 5
    let articlesinfo = req.query
    if(articlesinfo.currentPage){
        currentPage = articlesinfo.currentPage
    }
    if(articlesinfo.pageSize){
        pageSize = articlesinfo.pageSize
    }
    //最后一页的页码
    let lastCurrentPage = currentPage-1
    if(currentPage <= 1){
        lastCurrentPage = 1
    }
    const userInfo = req.user
    currentPage = (parseInt(currentPage) - 1)*parseInt(pageSize)
    pageSize = parseInt(pageSize)
    const sql = 'select * from articles where authorId = ? limit ?,?'
    db.query(sql,[userInfo.id,currentPage,pageSize],(err,results)=>{
        if(err) return res.cc(err)
        if(results.length>=0){
            res.send({
                status: 200,
                data: results
            })
        }
    })
}

//《我的博客》页面删除文章内容
exports.deleteArticle = (req,res)=>{
    const articlesinfo = req.query
    // console.log(articlesinfo);
    const sql = 'delete from articles where id = ?'
    db.query(sql,articlesinfo.id,(err,results)=>{
        if(err) return res.cc(err)
        if(results.affectedRows === 1){
            res.send({
                status:200,
                message:'删除成功啦！！！'
            })
        }
    })
}

//《我的博客》页面更新文章
exports.updateArticleInfo = (req,res)=>{
    const articlesinfo = req.body
    // console.log(articlesinfo);
    const sql = 'update articles set? where id = ?'
    db.query(sql,[articlesinfo.currentArticleInfo,articlesinfo.id],(err,results)=>{
        if(err) return res.cc(err)
        if(results.affectedRows === 1){
            res.send({
                status: 200,
                message: '修改成功',
                data:results
            })
        }  
    })
}

//《管理员申请》页面提交申请
exports.SubmitApplication = (req,res)=>{
    const applicationinfo = req.body
    let permissiontype = 0
    // console.log(applicationinfo);
    if(applicationinfo.right === '管理员'){
        permissiontype = 1
    }else if(applicationinfo.right === '超级管理员'){
        permissiontype = 2
    }
    // console.log(permissiontype);
    const sql = 'insert into application set username=?,nickname=?, permissiontype =?, permission =?,content=?, userid =?'
    // const sql = 'update ev_users set permission =?,applicationcontent =? where id =?'
    db.query(sql,[applicationinfo.username,applicationinfo.nickname,permissiontype,applicationinfo.right,applicationinfo.content,applicationinfo.id],(err,results)=>{
        if(err) return res.cc(err)
        if(results.affectedRows === 1){
            res.send({
                status: 0,
                message:'管理员申请已提交，审核后您将获得管理员身份，请耐心等待！'
            })
        }
    })
}


//=============================================

//后台管理系统 文章页面文章总数量
exports.getUserArticlesLength = (req,res)=>{
    const sqlStr = 'select count(*) as length from articles where approval = 1'
    db.query(sqlStr,(err, results) =>{
        if(err) return res.cc(err)
        res.send({
            status: 0,
            data: results
        })
    })
}

//后台管理系统 文章页面显示文章内容
exports.getUserArticles = (req,res)=>{
    let currentPage = 1
    let pageSize = 5
    let articlesinfo = req.query
    if(articlesinfo.currentPage){
        currentPage = articlesinfo.currentPage
    }
    if(articlesinfo.pageSize){
        pageSize = articlesinfo.pageSize
    }
    //最后一页的页码
    let lastCurrentPage = currentPage-1
    if(currentPage <= 1){
        lastCurrentPage = 1
    }
    currentPage = (parseInt(currentPage) - 1)*parseInt(pageSize)
    pageSize = parseInt(pageSize)

    const sql = 'select * from articles where approval = 1 limit ?,?'
    db.query(sql,[currentPage,pageSize],(err,results)=>{
        if(err) return res.cc(err)
        if(results.length>=0){

            const list = JSON.parse(JSON.stringify(results))

            results.forEach((item,index)=>{
                const picList  = (item.pic.split('$$'))
                list[index].pic = picList
                // console.log(list[index]);
            })
            res.send({
                status: 200,
                data: list,
            })
        }
    })
}

//后台管理系统 用户页面获取用户总数量
exports.backgetUserInfoLength = (req,res)=>{
    const str = 'select count(*) as length from ev_users'
    db.query(str,(err,results)=>{
        if(err) return res.cc(err)
        res.send({
            status:200,
            data:results
        })        
    })
}

//后台管理系统 用户页面显示用户信息
exports.backgetUserInfo = (req,res)=>{
    let currentPage = 1
    let pageSize = 5
    let userinfo = req.query
    // console.log(userinfo);
    if(userinfo.currentPage){
        currentPage = userinfo.currentPage
    }
    if(userinfo.pageSize){
        pageSize = userinfo.pageSize
    }
    //最后一页的页码问题
    let lastCurrentPage = pageSize - 1
    if(currentPage <= 1){
        lastCurrentPage = 1
    }
    currentPage = (parseInt(currentPage) - 1)*parseInt(pageSize)
    pageSize = parseInt(pageSize)
    const sql = 'select id, username, nickname, email, mydesc,permissiontype,permission from ev_users limit ?,?'
    db.query(sql,[currentPage,pageSize],(err,results)=>{
        if(err) return res.cc(err)
        if(results.length >= 0){
            const list = JSON.parse(JSON.stringify(results))
            res.send({
                status: 200,
                data: list,
                message:'用户数据获取成功！'
            })
        }
    })
}

//后台管理系统 显示待审批文章
exports.getNotApprovalUserArticles = (req,res)=>{
    let currentPage = 1
    let pageSize = 5
    let articlesinfo = req.query
    if(articlesinfo.currentPage){
        currentPage = articlesinfo.currentPage
    }
    if(articlesinfo.pageSize){
        pageSize = articlesinfo.pageSize
    }
    //最后一页的页码
    let lastCurrentPage = currentPage-1
    if(currentPage <= 1){
        lastCurrentPage = 1
    }
    currentPage = (parseInt(currentPage) - 1)*parseInt(pageSize)
    pageSize = parseInt(pageSize)

    const sql = 'select * from articles where approval = 0 limit ?,?'
    db.query(sql,[currentPage,pageSize],(err,results)=>{
        if(err) return res.cc(err)
        if(results.length>=0){

            const list = JSON.parse(JSON.stringify(results))

            results.forEach((item,index)=>{
                const picList  = (item.pic.split('$$'))
                list[index].pic = picList
                // console.log(list[index]);
            })
            res.send({
                status: 200,
                data: list,
            })
        }
    })
}

//后台管理系统 待审批文章总数量
exports.getNotApprovalUserArticlesLength = (req,res)=>{
    const sql = 'select count(*) as lengt from articles where approval = 0'
    db.query(sql, (err,results)=>{
        if(err) return res.cc(err)
        res.send({
            status: 0,
            data: results
        })
    })
}

//后台管理系统 更新文章内容
exports.updateArticleInfo = (req,res)=>{
    const articlesinfo = req.body
    let picUrl = articlesinfo.currentArticleInfo.pic
    let finalpicUrl = ''
    picUrl.forEach((item,index)=>{
        finalpicUrl  = finalpicUrl + picUrl[index] + '$$'
    })
    // console.log(finalpicUrl);
    let finalInfo = articlesinfo.currentArticleInfo
    const sql = 'update articles set title=?,articledesc=?,content=?,pic=?,approval = 0,approvalstr="待审核"  where id = ?'
    db.query(sql,[finalInfo.title,finalInfo.articledesc,finalInfo.content,finalpicUrl,articlesinfo.id],(err,results)=>{
        if(err) return res.cc(err)
        if(results.affectedRows === 1){
            res.send({
                status: 200,
                message: '修改成功',
                data:results
            })
        }  
    })
}

//后台管理系统 审核通过文章内容
exports.approvalSuccessArticleInfo = (req,res)=>{
    const articlesinfo = req.body
    const sql = 'update articles set approval = 1,approvalstr="审核通过"  where id = ?'
    db.query(sql,[articlesinfo.id],(err,results)=>{
        if(err) return res.cc(err)
        if(results.affectedRows === 1){
            res.send({
                status: 200,
                message: '审核通过',
                data:results
            })
        }  
    })
}

//后台管理系统 文章页面文章总数量
exports.getHerbInfoLength = (req,res)=>{
    const sqlStr = 'select count(*) as length from herb'
    db.query(sqlStr,(err, results) =>{
        if(err) return res.cc(err)
        res.send({
            status: 200,
            data: results
        })
    })
}

//后台管理系统 草药页面显示已经通过审核的草药信息
exports.getHerbInfo = (req,res)=>{
    let currentPage = 1
    let pageSize = 5
    let herbinfo = req.query
    // console.log(herbinfo);
    if(herbinfo.currentPage){
        currentPage = herbinfo.currentPage
    }
    if(herbinfo.pageSize){
        pageSize = herbinfo.pageSize
    }
    //最后一页的页码
    let lastCurrentPage = currentPage-1
    if(currentPage <= 1){
        lastCurrentPage = 1
    }
    currentPage = (parseInt(currentPage) - 1)*parseInt(pageSize)
    pageSize = parseInt(pageSize)

    const sql = 'select * from herb where approval = 1 limit ?,?'
    db.query(sql,[currentPage,pageSize],(err,results)=>{
        if(err) return res.cc(err)
        if(results.length>=0){
            res.send({
                status: 200,
                data: results,
            })
        }
    })
}

//后台管理系统 待审批草药总数量
exports.getNotApprovalHerbLength = (req,res)=>{
    const sql = 'select count(*) as length from herb where approval = 0'
    db.query(sql, (err,results)=>{
        if(err) return res.cc(err)
        res.send({
            status: 200,
            data: results
        })
    })
}

//后台管理系统 草药页面显示未审核的草药信息
exports.getNotApprovalHerbInfo = (req,res)=>{
    let currentPage = 1
    let pageSize = 5
    let herbinfo = req.query
    // console.log(herbinfo);
    if(herbinfo.currentPage){
        currentPage = herbinfo.currentPage
    }
    if(herbinfo.pageSize){
        pageSize = herbinfo.pageSize
    }
    //最后一页的页码
    let lastCurrentPage = currentPage-1
    if(currentPage <= 1){
        lastCurrentPage = 1
    }
    currentPage = (parseInt(currentPage) - 1)*parseInt(pageSize)
    pageSize = parseInt(pageSize)

    const sql = 'select * from herb where approval = 0 limit ?,?'
    db.query(sql,[currentPage,pageSize],(err,results)=>{
        if(err) return res.cc(err)
        if(results.length>=0){
            res.send({
                status: 200,
                data: results,
            })
        }
    })
}

//后台管理系统 草药页面更改草药信息
exports.updateHerbInfo = (req,res)=>{
    const herbinfo = req.body
    // console.log(herbinfo);
    const sql = 'update herb set ? where id = ?'
    db.query(sql,[herbinfo.currentHerb,herbinfo.id],(err,results)=>{
        if(err) return res.cc(err)
        if(results.affectedRows === 1){
            res.send({
                status: 200,
                message: '修改成功',
                data:results
            })
        }  
    })
}

//后台管理系统 审核通过中草药信息
exports.approvalSuccessHerbInfo = (req,res)=>{
    const herbinfo = req.body
    const sql = 'update herb set approval = 1,approvalstr = "审核通过" where id = ?'
    db.query(sql,[herbinfo.id],(err,results)=>{
        if(err) return res.cc(err)
        if(results.affectedRows === 1){
            res.send({
                status: 200,
                message:'审核通过',
                data:results
            })
        }
    })
}

//后台管理系统 删除草药信息
exports.deleteHerb = (req,res)=>{
    const herbinfo = req.query
    const sql = 'delete from herb where id = ?'
    db.query(sql,herbinfo.id,(err,results)=>{
        if(err) return res.cc(err)
        if(results.affectedRows === 1){
            res.send({
                status:200,
                message:'删除成功啦！！！'
            })
        }
    })
}

//后台管理系统 管理员申请获取申请数
exports.getApplicationLength = (req,res)=>{
    const sql = 'select count(*) as length from application'
    db.query(sql,(err,results)=>{
        if(err) return res.cc(err)
        res.send({
            status: 200,
            data: results
        })
    })
}

//后台管理系统 管理员申请获取申请列表
exports.getapplicationList = (req,res)=>{
    const userinfo = req.user
    let currentPage = 1
    let pageSize = 5
    let applicationinfo = req.query
    if(applicationinfo.currentPage){
        currentPage = applicationinfo.currentPage
    }
    if(applicationinfo.pageSize){
        pageSize = applicationinfo.pageSize
    }
    //最后一页的页码
    let lastCurrentPage = currentPage-1
    if(currentPage <= 1){
        lastCurrentPage = 1
    }
    currentPage = (parseInt(currentPage) - 1)*parseInt(pageSize)
    pageSize = parseInt(pageSize)

    const sql = 'select * from application limit ?,?'
    db.query(sql,[currentPage,pageSize],(err,results)=>{
        if(err) return res.cc(err)
        if(results.length >= 0){
            const list = JSON.parse(JSON.stringify(results))
            res.send({
                status: 200,
                data:list,
                message:'管理员审批数据获取成功！'
            })
        }
    })
}
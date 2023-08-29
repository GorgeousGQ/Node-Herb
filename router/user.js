const express = require('express');

const router = express.Router()
const multer  = require('multer')

//导入用户路由处理函数对应的模块
const user_handler = require('../router_handler/user')

//导入验证表单的中间件
const expressJoi = require('@escook/express-joi')

//导入需要的验证规则对象
const { reg_login_schema } = require('../schema/user')
const upload = multer({dest:'uploads/articlepic'})


//注册新用户
router.post ('/reguser', expressJoi(reg_login_schema),user_handler.reguser)
// router.post ('/reguser',user_handler.reguser)

//登录
router.post ('/login', expressJoi(reg_login_schema),user_handler.login)

//后台登录
router.post ('/backlogin', expressJoi(reg_login_schema),user_handler.backlogin)


//搜索（得到）文章内容
router.post('/SearchArticlesInfo',user_handler.SearchArticlesInfo)

//发现页面获取文章获赞量getArticleLikeNum
router.get('/getArticleLikeNum',user_handler.getArticleLikeNum)

//搜索药方
router.post('/SearchHerbInfo',user_handler.SearchHerbInfo)

//首页获取器官信息
router.post('/getOrganInfo',user_handler.getOrganInfo)

//药方页面展示不同类别的草药
router.post('/getTypeHerb',user_handler.getTypeHerb) 
//================================================================




module.exports = router



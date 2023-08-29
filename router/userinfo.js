const express = require('express');
const router = express.Router();

const multer  = require('multer')

//挂载路由
const userinfo_handler = require('../router_handler/userinfo');

const expressJoi = require('@escook/express-joi')
const { update_userinfo_schema ,update_avatar_schema} = require('../schema/user')
const upload = multer({dest:'uploads/articlepic'})


//获取用户信息路由
router.get('/getUserInfo',userinfo_handler.getUserInfo)
//更新用户信息路由
router.post('/updateUserInfo',expressJoi(update_userinfo_schema),userinfo_handler.updateUserInfo)
//更换头像的路由
router.post('/updateAvatar',userinfo_handler.updateAvatar)
//修改密码的路由
router.post('/updatePassword',userinfo_handler.updatePassword)
//文章上传
router.post('/addArticleInfo',userinfo_handler.addArticleInfo)
//草药信息上传
router.post('/addHerbInfo',userinfo_handler.addHerbInfo)
//器官信息上传
router.post('/addOrganInfo',userinfo_handler.addOrganInfo)
//文章图片上传
router.post('/addArticlePic',upload.array('imgFile', 3),userinfo_handler.addArticlePic)
//《我的博客》页面获取文章总条数
router.get('/getMyBlogUserListLength',userinfo_handler.getMyBlogUserListLength)
//《我的博客》页面显示文章内容
router.get('/getMyBlogUserArticles',userinfo_handler.getMyBlogUserArticles)
//《我的博客》页面删除文章内容
router.delete('/deleteArticle',userinfo_handler.deleteArticle)
//《我的博客》页面更新文章内容
router.post('/updateArticleInfo',userinfo_handler.updateArticleInfo)
//《管理员申请》页面提交申请
router.post('/SubmitApplication',userinfo_handler.SubmitApplication)


//================================================================

// 后台管理项目 文章页面显示文章内容
router.get('/getUserArticles',userinfo_handler.getUserArticles)
//后台管理项目 文章页面文章总数量
router.get('/getUserArticlesLength',userinfo_handler.getUserArticlesLength)
//后台管理系统 显示待审批文章
router.get('/getNotApprovalUserArticles',userinfo_handler.getNotApprovalUserArticles)
//后台管理系统 待审批文章总数量
router.get('/getNotApprovalUserArticlesLength',userinfo_handler.getNotApprovalUserArticlesLength)
//后台管理系统 更新文章内容
router.post('/updateArticleInfo',userinfo_handler.updateArticleInfo)
//后台管理系统 审核通过文章内容
router.post('/approvalSuccessArticleInfo',userinfo_handler.approvalSuccessArticleInfo)
//后台管理系统 草药页面显示草药信息
router.get('/getHerbInfo',userinfo_handler.getHerbInfo)
//后台管理系统 文章页面文章总数量
router.get('/getHerbInfoLength',userinfo_handler.getHerbInfoLength)
//后台管理系统 草药页面更改草药信息
router.post('/updateHerbInfo',userinfo_handler.updateHerbInfo)
//后台管理系统 用户页面获取用户总数量
router.get('/backgetUserInfoLength',userinfo_handler.backgetUserInfoLength)
//后台管理系统 用户页面显示用户信息
router.get('/backgetUserInfo',userinfo_handler.backgetUserInfo)
//后台管理系统 待审批草药总数量
router.get('/getNotApprovalHerbLength',userinfo_handler.getNotApprovalHerbLength)
//后台管理系统 草药页面显示未审核的草药信息
router.get('/getNotApprovalHerbInfo',userinfo_handler.getNotApprovalHerbInfo)
//后台管理系统 删除草药信息
router.delete('/deleteHerb',userinfo_handler.deleteHerb)
//后台管理系统 审核通过中草药信息
router.post('/approvalSuccessHerbInfo',userinfo_handler.approvalSuccessHerbInfo)
//后台管理系统 管理员申请获取申请数
router.get('/getApplicationLength',userinfo_handler.getApplicationLength)
//后台管理系统 管理员申请获取申请列表
router.get('/getapplicationList',userinfo_handler.getapplicationList)



 


module.exports = router;
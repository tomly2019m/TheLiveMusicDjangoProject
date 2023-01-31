"""liveMusicDjangoProject URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.urls import path, re_path
from django.views.generic import TemplateView

from . import view

urlpatterns = [
    # url(r'^$', view.hello),
    url(r'^$', view.index),  # 默认页面
    path('play', view.play),  # 播放, 暂停get
    path('login', view.login),  # 登录页面
    path('search', view.search),  # 搜索get
    path('course', view.course),  # 教程页面
    path('console', view.console),  # 总控台页面
    path('register', view.register),  # 注册页面
    path('get_data', view.get_data),  # 返回json数据
    path('document', view.document),  # 文档
    path('del_music', view.del_music),  # 删除一个歌曲get
    path('unread_msg', view.unread_msg),  # 返回消息是否未读
    path('move_music', view.move_music),  # 移动歌曲
    # path('del_session', view.del_session),  # 删除session
    path('start_dan_mu', view.start_dan_mu),  # 控制弹幕获取
    path('base_setting', view.base_setting),  # 基本设置
    path('introduction', view.introduction),  # 简介页面
    path('music_display', view.music_display),  # 设置显示歌名页面
    path('login_request', view.login_request),  # 登录页面
    path('lyric_display', view.lyric_display),  # 设置显示歌词页面
    path('get_music_post', view.get_music_post),  # 歌名提交设置post
    path('get_lyric_post', view.get_lyric_post),  # 歌词提交设置post
    path('register_request', view.register_request),  # 注册请求get
    path('get_base_setting_post', view.get_base_setting),  # 基本设置post
    path('next_music', view.next_music_pretreatment),  # 查询下一首歌曲
    path('robots.txt', TemplateView.as_view(template_name='robots.txt', content_type='text/plain')),

    # b站饭贩商店
    path('for-bili', view.for_bili),  # 显示在商店的主页, 包括纯插件
    path('from-bili', view.from_bili),  # 从主页提交的设置数据
    path('for-bili-lyric', view.for_bili_lyric),  # 歌词
    path('for-bili-setting', view.for_bili_setting),  # 控制台
    path('add-global-setting', view.add_global_setting),  # 提交的全局设置(黑名单、规则之类的)
    path('reset_own_database', view.reset_own_database),  # 重置个人数据库

    path('get-qr-status', view.get_qr_status),
    path('set-qr-status', view.set_qr_status),
    path('cloud-music-qr-code', view.cloud_music_qr_code),
    path('qq-music-qr-code', view.qq_music_qr_code),
    path('get-qq-playlist', view.get_qq_playlist),
    path('get-qq-playlist-info', view.get_qq_playlist_info),
    path('load-playlist-to-database', view.load_playlist_to_database),

    path('get_dan_mu', view.get_dan_mu),  # 返回弹幕数据

    re_path(r'^lyric/([A-Za-z0-9]+)$', view.lyric),
    re_path(r'^music/([A-Za-z0-9]+)$', view.music),
    re_path(r'^message/([A-Za-z0-9]+)$', view.message),  # 消息页面

    path('test', view.test),
    path('test-search', view.test_search),

    path('lottery', view.lottery),
    path('gift-config', view.gift_config),
    path('room-gift-data', view.room_gift_data),
    path('lottery-settings', view.lottery_settings),
    path('get-lottery-setting', view.get_lottery_setting),

    path('obs-pet', view.obs_pet),
    path('upload-images', view.upload_images),
]

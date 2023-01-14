import json
import random
import threading
from typing import Tuple

from django.contrib.sessions.models import Session
from django.core.exceptions import FieldError
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.utils.datastructures import MultiValueDictKeyError
from django.views.decorators.clickjacking import xframe_options_exempt

import liveMusicDjangoProject.n.utils as utils
from TestModel.models import Urls, UsersData, UsersInfo, Message, Lottery
from liveMusicDjangoProject.n import main_class
from liveMusicDjangoProject.n.qqMusicLogin import get_qq_qrcode

with open('liveMusicDjangoProject/debug_flag.json', 'r') as f_obj:
    dev = json.load(f_obj)['debug']

bili_app_id = 1649539569084
lyric_information_failed = bytes(
    "<li class=\"item\" id=\"26.368\"><span class=\"lyric\">Lyric Setting Failed!</span><span "
    "class=\"translation\"><br/>歌词设置失败！</span></li><li class=\"item\" id=\"26.368\"><span "
    "class=\"lyric\">是不是忘了设置房间号啦？</span><span "
    "class=\"translation\"><br/>更改后记得按确定哦~</span></li>".encode('utf-8'))
lyric_information_succeed = bytes(
    "<li class=\"item\" id=\"26.368\"><span class=\"lyric\">Lyric Succeed!</span><span "
    "class=\"translation\"><br/>歌词设置成功！</span></li>".encode('utf-8'))

music_information_failed = bytes(
    "<li><span class=\"music_name\">歌名设置失败</span>"
    "<span class=\"artist\">是不是忘了设置房间号啦？</span></li>".encode('utf-8'))
music_information_succeed = bytes(
    "<li><span class=\"music_name\">歌名设置成功</span>"
    "<span class=\"artist\">Succeed!</span></li>".encode('utf-8'))

for_bili_user_set = {'music': {'div_width': '500', 'div_height': '350', 'music_color': '#ff9900',
                               'music_font': 'Microsoft YaHei', 'music_font_size': '36',
                               'artist_color': '#7a7a7a', 'artist_font': 'Microsoft YaHei',
                               'artist_font_size': '16', 'v_li_margin': '20', 'music_shadow_num': '1',
                               'music_shadow_blur': '2', 'music_shadow_color': '#000000',
                               'artist_shadow_num': '1', 'artist_shadow_blur': '1',
                               'artist_shadow_color': '#000000',
                               'theme_id': '0', 'set_flag': 0},
                     'lyric': {'div_width': '500', 'div_height': '350', 'original_text_color': '#7a7a7a',
                               'original_text_font': 'Microsoft YaHei', 'original_text_font_size': '36',
                               'translation_color': '#7a7a7a', 'translation_font': 'Microsoft YaHei',
                               'translation_font_size': '16', 'v_li_margin': '20', 'original_shadow_num': '1',
                               'original_shadow_blur': '2', 'original_shadow_color': '#000000',
                               'translation_shadow_num': '1', 'translation_shadow_blur': '1',
                               'translation_shadow_color': '#000000', 'now_shadow_num': '1', 'now_shadow_blur': '2',
                               'now_shadow_color': '#000000', 'now_color': '#ff9900',
                               'now_font': 'Microsoft YaHei', 'now_font_size': '36',
                               'theme_id': '0', 'set_flag': 0},
                     }

global_setting = {'black_user_list': [], 'black_music_list': []}

mysql_config = {'host': 'localhost',
                'user': 'live_music',
                'password': 'pZ6Bm7zm6DNDRkne',
                'database': 'live_music',
                'autocommit': True,
                'use_unicode': True}

room_killer = main_class.RoomKiller()
room_killer.daemon = True
room_killer.start()


def get_random_str(n: int):
    """
    生成随机字符串

    :param n: 生成长度
    :return: 随机字符串
    """
    str1 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    random_str = ''
    for i in range(n):
        i = random.randint(0, len(str1) - 1)
        random_str += str1[i]
    return random_str


def index(request):
    """
    网站默认首页

    :param request: request
    :return: HttpResponse
    """
    import datetime
    now = datetime.datetime.now()
    context = {'hello': 'Hello World!', 'time': now}
    return render(request, 'index.html', context)


def setting_post(request, where: str):
    """
    (废弃)设置保存music或lyric post的内容

    :param request: request
    :param where: music/lyric 字符串
    :return: HttpResponse
    """
    try:
        # 在{where}_display界面提交
        request_post = request.POST.copy()
        print(f'\n\npost:{request.session.session_key}{request_post}\n\n')
        user_name = request.session['user_name']
        # 从数据库中用用户名得到music_url
        """
        result = safe_execute_with_data_back(f"select {where}_url from users_info where username=%s", [user_name])[0][0]
        """
        if where == 'music':
            result = UsersInfo.objects.get(username=user_name).music_url
            print(result)
            # 更新以前的session
            Urls.objects.filter(music_url=result).update(session_key=request.session.session_key)
            # 更新room_id
            UsersInfo.objects.filter(username=user_name).update(room_id=request_post['room'])
        elif where == 'lyric':
            result = UsersInfo.objects.get(username=user_name).lyric_url
            print(result)
            # 更新以前的session
            Urls.objects.filter(lyric_url=result).update(session_key=request.session.session_key)
            # 更新room_id
            UsersInfo.objects.filter(username=user_name).update(room_id=request_post['room'])
        del request_post['room']
        request.session[f'user_{where}_setting'] = request_post
        print(session_key_data(request.session.session_key))
        return redirect(f'../{where}_display')
    except KeyError:
        return redirect(f'../{where}_display')


def get_music_post(request):
    """
    (废弃)在music_display界面提交

    :param request: request
    :return: HttpResponse
    """
    return setting_post(request, 'music')


def get_lyric_post(request):
    """
    (废弃)在lyric_display界面提交

    :param request: request
    :return: HttpResponse
    """
    return setting_post(request, 'lyric')


def search(request):
    """
    (废弃)接收请求数据

    :param request: request
    :return: HttpResponse
    """
    request.encoding = 'utf-8'
    if 'q' in request.GET and request.GET['q']:
        messages = '你搜索的内容为: ' + request.GET['q']
    else:
        messages = '你提交了空表单'
    context = {'r': messages + request.META['REMOTE_ADDR'] + request.META['REMOTE_HOST'], 'title': 'ex_test_search'}
    return render(request, 'music_display.html', context)


def login(request):
    """
    (废弃)登录页面

    :param request: request
    :return: HttpResponse
    """
    context = {'title': '登录', 'flag': True, 'style_name': 'login.css'}
    return render(request, 'login.html', context)


def login_request(request):
    """
    (废弃)在登录页面提交

    :param request: request
    :return: HttpResponse
    """
    request.encoding = 'utf-8'
    if ('user' in request.GET and request.GET['user']) and ('pass' in request.GET and request.GET['pass']):
        try:
            UsersInfo.objects.get(username=request.GET['user'], password=request.GET['pass'])

            request.session['user_name'] = request.GET['user']
            request.session['login'] = True
            return redirect('../music_display')
        except UsersInfo.DoesNotExist:
            return render(request, 'show_error_info.html', {'error_information': '无此用户或密码...确定名字没错嘛？'})


def register(request):
    """
    (废弃)注册页面

    :param request: request
    :return: HttpResponse
    """
    return render(request, 'login.html', {'title': '注册', 'flag': False, 'style_name': 'login.css'})


def register_request(request):
    """
    (废弃)在注册页面提交

    :param request: request
    :return: HttpResponse
    """
    request.encoding = 'utf-8'
    if not request.session.session_key:
        request.session.create()
    request.session['user_music_setting'] = {'div_width': '500', 'div_height': '350', 'music_color': '#ff9900',
                                             'music_font': 'Microsoft YaHei', 'music_font_size': '36',
                                             'artist_color': '#7a7a7a', 'artist_font': 'Microsoft YaHei',
                                             'artist_font_size': '16'}
    request.session['user_lyric_setting'] = {'div_width': '1200', 'div_height': '255', 'music_color': '#ff9900',
                                             'music_font': 'Microsoft YaHei', 'music_font_size': '36',
                                             'artist_color': '#7a7a7a', 'artist_font': 'Microsoft YaHei',
                                             'artist_font_size': '16'}
    request.session['base_setting'] = {'medal_name': '', 'medal_of_user': '', 'use_room_medal': '',
                                       'medal_level_less': 0, 'user_level_less': 0}
    if ('user' in request.GET and request.GET['user']) and \
            ('pass' in request.GET and request.GET['pass']):
        username = request.GET['user']
        password = request.GET['pass']
        try:
            UsersInfo.objects.get(username=request.GET['user'])
            return render(request, 'show_error_info.html', {'error_information': '此用户名已被使用，虽然起名很难但还是再想一个吧~'})
        except UsersInfo.DoesNotExist:
            music_url = get_random_str(10)
            lyric_url = get_random_str(10)
            new_user = UsersInfo(
                username=username,
                password=password,
                is_admin=0,
                music_url=music_url,
                lyric_url=lyric_url,
                is_running=0)
            new_url = Urls(session_key=request.session.session_key, lyric_url=lyric_url, music_url=music_url)
            new_user_data = UsersData(username=username,
                                      music_name='[]',
                                      play=1,
                                      replay=0,
                                      who_play=0,
                                      console_info='[]', )
            new_msg = Message(username=username)
            new_user_data.save()
            new_user.save()
            new_url.save()
            new_msg.save()
            return redirect('../login')


def music_display(request):
    """
    (废弃)歌名显示页面

    :param request: request
    :return: HttpResponse
    """
    try:
        user_name = request.session['user_name']
        add_data = {'user_name': user_name, 'style_name': 'sheet.css'}
        session_key = UsersInfo.objects.get(username=user_name)
        music_url = session_key.music_url
        room_id = session_key.room_id
        add_data.update({'music_link': f'https://www.live-music.xyz/music/{music_url}', 'room': room_id})
        session_key = Urls.objects.get(music_url=music_url).session_key
        try:
            user_music_setting = session_key_data(session_key)['user_music_setting']
        except KeyError:
            return render(request, 'music_display.html', add_data)
        add_data.update(user_music_setting)
        return render(request, 'music_display.html', add_data)
    except KeyError:
        return render(request, 'music_display.html', {'title': '未登录', 'style_name': 'sheet.css'})


def lyric_display(request):
    """
    (废弃)歌词显示页面

    :param request: request
    :return: HttpResponse
    """
    try:
        user_name = request.session['user_name']
        add_data = {'user_name': user_name, 'style_name': 'sheet.css'}
        session_key = UsersInfo.objects.get(username=user_name)
        lyric_url = session_key.lyric_url
        room_id = session_key.room_id
        add_data.update({'lyric_link': f'https://www.live-music.xyz/lyric/{lyric_url}', 'room': room_id})
        session_key = Urls.objects.get(lyric_url=lyric_url).session_key
        try:
            user_lyric_setting = session_key_data(session_key)['user_lyric_setting']
        except KeyError:
            return render(request, 'lyric_display.html', add_data)
        add_data.update(user_lyric_setting)
        return render(request, 'lyric_display.html', add_data)
    except KeyError:
        return render(request, 'lyric_display.html', {'title': '未登录', 'style_name': 'sheet.css'})


def del_session(request):
    """
    删除服务器上所有session数据(../del_session)

    :param request: request
    :return: HttpResponse
    """
    request.session.flush()
    return HttpResponse('ok')


def start_dan_mu(request):
    """
    开始获取弹幕(../start_dan_mu)

    :param request: data(int): 开始/停止, where(str): music/lyric, url(str): 歌名/歌词链接
    :return: 响应执行结果
    """
    # global name
    # try:
    #     result = UsersInfo.objects.get(music_url=request.GET['music'])
    #     username = result.username
    #     data_result = UsersData.objects
    #     try:
    #         base_settings = json.loads(data_result.get(username=username).user_set)['base_settings']
    #     except KeyError:
    #         user_set = json.loads(data_result.get(username=username).user_set)
    #         user_set['base_settings'] = json.dumps("{'medal_name': '', 'medal_of_user': '', "
    #                                                "'use_room_medal': '', 'medal_level_less': 0, "
    #                                                "'user_level_less': 0, 'cold_time': 0}")
    #         base_settings = {'medal_name': '', 'medal_of_user': '', 'use_room_medal': '',
    #                          'medal_level_less': 0, 'user_level_less': 0, 'cold_time': 0}
    # except KeyError:
    #     print(session_key_data(request.session.session_key))
    #     username = request.session['user_name']
    #     result = UsersInfo.objects.get(username=username)
    #     try:
    #         base_settings = request.session['base_setting']
    #     except KeyError:
    #         request.session['base_setting'] = {'medal_name': '', 'medal_of_user': '', 'use_room_medal': '',
    #                                            'medal_level_less': 0, 'user_level_less': 0, 'cold_time': 0}
    #         base_settings = request.session['base_setting']
    # try:
    #
    #     data = int(request.GET['data'])
    #     print(f'{username} {data}')
    #     is_running = result.is_running
    #     room_id = result.room_id
    #     is_admin = result.is_admin
    #     lyric_url = result.lyric_url
    #     try:
    #         int(room_id)
    #     except ValueError:
    #         return HttpResponse(json.dumps({'data': 'id'}))
    #     if data:
    #         if int(is_running):
    #             return HttpResponse(json.dumps({'data': main_class.room_workers_dict[lyric_url].is_alive()}))
    #         else:
    #             main_class.room_workers_dict[lyric_url] = main_class.RoomWorker(room_id,
    #                                                                             username,
    #                                                                             base_settings,
    #                                                                             debug_flag=bool(int(is_admin)))
    #             main_class.room_workers_dict[lyric_url].start()
    #             print('sd')
    #             write_console_info(username, '获取开始')
    #             UsersInfo.objects.filter(username=username).update(is_running=1)
    #             return HttpResponse(json.dumps({'data': main_class.room_workers_dict[lyric_url].is_alive()}))
    #     else:
    #         main_class.room_workers_dict[lyric_url].working = False
    #         UsersInfo.objects.filter(username=username).update(is_running=0)
    #         write_console_info(username, '获取已停止')
    #         return HttpResponse(json.dumps({'data': main_class.room_workers_dict[lyric_url].is_alive()}))
    # except KeyError:
    #     write_console_info(username, '操作失败, 请联系作者')
    #     return HttpResponse(json.dumps({'data': 'key'}))
    where = request.GET['where']
    url = request.GET['url']
    if where == 'music':
        result = UsersInfo.objects.get(music_url=url)
    else:
        result = UsersInfo.objects.get(lyric_url=url)
    username = result.username
    # try:
    #     result = UsersInfo.objects.get(music_url=request.GET['music'])
    #     username = result.username
    # except KeyError:
    #     result = UsersInfo.objects.get(lyric_url=request.GET['lyric'])
    #     username = result.username
    #     # print(session_key_data(request.session.session_key))
    #     # username = request.session['user_name']
    #     # result = UsersInfo.objects.get(username=username)
    try:
        data = int(request.GET['data'])
        print(f'{username} {data}')
        room_id = result.room_id
        try:
            int(room_id)
        except ValueError:
            return HttpResponse(json.dumps({'data': 'id'}))
        if data:
            UsersInfo.objects.filter(username=username).update(is_running=1)
            utils.write_console_info(username, '获取开始')
        else:
            UsersInfo.objects.filter(username=username).update(is_running=0)
            utils.write_console_info(username, '获取已停止')
        return HttpResponse(json.dumps({'data': True}))
    except KeyError:
        utils.write_console_info(username, '操作失败, 请联系作者')
        return HttpResponse(json.dumps({'data': 'key'}))


def lyric(request, pam: str):
    """
    (废弃)歌词插件链接

    :param pam: url中的随机字符串
    :param request: request
    :return: HttpResponse
    """
    print(pam)
    session_key = Urls.objects.get(lyric_url=pam).session_key
    session_data = session_key_data(session_key)
    print(f'\n\nlyric: session_data={session_data}')
    room = UsersInfo.objects.get(lyric_url=pam).room_id
    user_set = {'url': pam, 'room': room}
    try:
        user_set.update(session_data['user_lyric_setting'])
        print(user_set)
    except KeyError:
        s = render(request, 'lyric.html')
        context = s.content
        s.content = context.replace(b'<li>0123456789</li>', lyric_information_failed)
        return s
    print(f'\n\nuser_set: {user_set}\n\n')
    s = render(request, 'lyric.html', user_set)
    context = s.content
    s.content = context.replace(b'<li>0123456789</li>', lyric_information_succeed)
    return s


def music(request, pam: str):
    """
    (废弃)歌名插件链接

    :param pam: url中的随机字符串
    :param request: request
    :return: HttpResponse
    """
    print(pam)
    session_key = Urls.objects.get(music_url=pam).session_key
    session_data = session_key_data(session_key)
    room = UsersInfo.objects.get(music_url=pam).room_id
    user_set = {'url': pam, 'room': room}
    try:
        user_set.update(session_data['user_music_setting'])
    except KeyError:
        s = render(request, 'music.html')
        context = s.content
        s.content = context.replace(b'<li>0123456789</li>', music_information_failed)
        return s
    print(f'\n\nuser_set: {user_set}\n\n')
    s = render(request, 'music.html', user_set)
    context = s.content
    s.content = context.replace(b'<li>0123456789</li>', music_information_succeed)
    return s


def session_key_data(session_key: str):
    """
    (废弃)获取储存在session_key中的数据

    :param session_key:
    :return: HttpResponse
    """
    se = Session.objects.get(session_key=session_key)
    return se.get_decoded()


def get_music_info(request):
    """
    (废弃)从数据库获取音乐信息

    :param request: request
    :return: json
    """
    request.encoding = 'utf-8'
    if 'where' in request.GET and 'url' in request.GET:
        try:
            where = request.GET['where']
            url = request.GET['url']
            # print(request.request.session['user_name'])
            print(f'{where} {url}')
            if where == 'music':
                result = UsersInfo.objects.get(music_url=url)
            else:
                result = UsersInfo.objects.get(lyric_url=url)
            username = result.username
            is_running = result.is_running
            result = UsersData.objects.get(username=username)
            try:
                music_name_list = json.loads(result.music_name)
            except AttributeError:
                music_name_list = []
            try:
                lyric_name = json.loads(result.lyric_name)
                now_music_url = result.now_music_url
            except (TypeError, json.decoder.JSONDecodeError):
                lyric_name = ''
                now_music_url = ''
            who_play = result.who_play
            play_ = result.play
            replay = result.replay
            console_info = result.console_info
            global_settings = json.loads(result.global_setting)
            user_set = json.loads(result.user_set)[where]
            r = {'data': {'music_name_list': music_name_list, 'lyric_name': lyric_name, 'now_music_url': now_music_url,
                          'who_play': who_play, 'play_': play_, 'replay': replay, 'is_running': bool(int(is_running)),
                          'console_info': json.loads(console_info), 'global_setting': global_settings,
                          'user_set': user_set},
                 'username': username}
            return json.dumps(r)
        except AttributeError as e:
            print(e)
            return json.dumps({'data': 'error'})
    else:
        return json.dumps({'data': 'error'})


def get_request_data(url: str, where: str, which_data_list: list) -> dict:
    """
    通过解析好的信息从数据库获取需要的字段

    :param url: 歌名/歌词链接
    :param where: 歌名/歌词 (music / lyric)
    :param which_data_list: 要数据库里哪些字段的数据
    :return: 请求的字段字典
    """
    if where == 'music':
        user_info_table = UsersInfo.objects.get(music_url=url)
    else:
        user_info_table = UsersInfo.objects.get(lyric_url=url)
    username = user_info_table.username
    user_data_tabel = UsersData.objects.get(username=username)
    return_data = {'username': username}
    for which_data in which_data_list:
        if which_data == 'replay':
            return_data['replay'] = user_data_tabel.replay
        if which_data == 'who_play':
            return_data['who_play'] = user_data_tabel.who_play
        if which_data == 'play_status':
            return_data['play_status'] = user_data_tabel.play
        if which_data == 'now_music_url':
            return_data['now_music_url'] = user_data_tabel.now_music_url

        if which_data == 'user_set':
            return_data['user_set'] = json.loads(user_data_tabel.user_set)
        if which_data == 'lyric_name':
            return_data['lyric_name'] = json.loads(user_data_tabel.lyric_name)
        if which_data == 'console_info':
            return_data['console_info'] = json.loads(user_data_tabel.console_info)
        if which_data == 'music_name_list':
            return_data['music_name_list'] = json.loads(user_data_tabel.music_name)
        if which_data == 'global_setting':
            return_data['global_setting'] = json.loads(user_data_tabel.global_setting)

        if which_data == 'is_running':
            return_data['is_running'] = bool(int(user_info_table.is_running))
    return return_data


def get_data(request) -> HttpResponse:
    """
    从数据库获取需要的字段（../get_data）

    :param request: url(str): 歌名/歌词链接 where(str): 歌名/歌词 (music / lyric), which_data_list(json_str): 要数据库里哪些字段的数据
    :return: 响应请求的字段字典
    """
    # result = get_music_info(request)
    # result = get_data_form_database(request)
    request.encoding = 'utf-8'
    try:
        url = request.GET['url']
        where = request.GET['where']
        try:
            which_data_list = json.loads(request.GET['which_data'])
        except KeyError:
            which_data_list = []
    except json.decoder.JSONDecodeError:
        return HttpResponse('{}')
    return_data = get_request_data(url, where, which_data_list)
    return HttpResponse(json.dumps(return_data))


def next_music_pretreatment(request) -> HttpResponse:
    """
    开始下一首歌曲预处理(../next_music)

    :param request: url(str): 歌名/歌词链接, where(str): 歌名/歌词 (music / lyric)
    :return: 响应执行信息 {data: true} / {data: error}
    """
    request.encoding = 'utf-8'
    try:
        # result = get_music_info(request)
        # result = json.loads(result)
        url = request.GET['url']
        where = request.GET['where']
        result = get_request_data(url, where, ['music_name_list'])
        data = result
        username = result['username']
    except KeyError:
        data = 'error'
        username = 'None'
    return next_music(data, username)


def next_music(data: [str, dict], username: str) -> HttpResponse:
    """
    下一首歌

    :param data: 歌曲信息列表
    :param username: 用户名
    :return: 响应执行信息 {data: true} / {data: error}
    """
    if data != 'error':
        try:
            music_info_list = data['music_name_list']
            del music_info_list[0]
            try:
                # th = threading.Thread(target=utils.sava_music_in, args=[music_info_list[0], username, True])
                # th.start()
                # a = music_info_list[0]
                # th = threading.Thread(target=utils.load_music, args=[0, username])
                # th.start()
                th = threading.Thread(target=utils.save_music_info_in_database(music_info_list[0], username, True, music_info_list))
                th.start()
            except IndexError:
                """
                # 随机歌单
                th = threading.Thread(target=utils.save_random_music_in, args=[username, True])
                th.start()
                """
                UsersData.objects.filter(username=username).update(music_name=json.dumps([]), now_music_url='',
                                                                   lyric_name='[{}]')
                ...

            return HttpResponse(json.dumps({'data': 'True'}))
        except IndexError:
            return HttpResponse(json.dumps({'data': 'error'}))

    else:
        return HttpResponse(json.dumps({'data': 'error'}))


def play(request) -> HttpResponse:
    """
    播放, 重播, 谁播(../play)

    :param request: data(int): 1/0, where(str): play/replay/who_play, url(str): 歌名/歌词链接, where_url(str): 歌名/歌词 (music / lyric)
    :return: 响应执行信息
    """
    try:
        try:
            data = request.GET['data']
            where = request.GET['where']
            username = use_url_get_user(request)
            update_play_data(username, where, data)
            return HttpResponse(json.dumps({'data': 'executed'}))
        except AttributeError:
            return HttpResponse(json.dumps({'data': 'error'}))
    except KeyError:
        username = request.session['user_name']
        data = request.GET['data']
        where = request.GET['where']
        update_play_data(username, where, data)
        return HttpResponse(json.dumps({'data': 'executed'}))


def update_play_data(username: str, where: str, data: int) -> None:
    """
    更改播放信息(播放, 重播, 谁播)

    :param username: 用户名
    :param where: 改哪里 (play/replay/who_play)
    :param data: 改成啥 (1/0)
    :return: None
    """
    if where == 'play':
        UsersData.objects.filter(username=username).update(play=data)
    elif where == 'replay':
        UsersData.objects.filter(username=username).update(replay=data)
    elif where == 'who_play':
        UsersData.objects.filter(username=username).update(who_play=data)


def del_music(request) -> HttpResponse:
    """
    删除指定歌曲(../del_music)

    :param request: music_name(str): 歌曲名, artist(str): 歌手名, url(str): 歌名/歌词链接, where_url(str): 歌名/歌词 (music / lyric)
    :return: 响应执行信息
    """
    username, select_obj, music_name_list = pretreatment(request)
    if username == '' and music_name_list == []:
        return HttpResponse(json.dumps({'data': 'error'}))
    else:
        UsersData.objects.filter(username=username).update(music_name=json.dumps(music_name_list))
        return HttpResponse(json.dumps({'data': 'executed'}))


@xframe_options_exempt
def move_music(request) -> HttpResponse:
    """
    移动歌曲(../move_music)

    :param request: index(int): 操作索引, music_name(str): 歌曲名, artist(str): 歌手名, url(str): 歌名/歌词链接, where_url(str): 歌名/歌词 (music / lyric)
    :return: 响应执行结果
    """
    try:

        music_name_index = int(request.GET['index'])
        username, select_obj, music_name_list = pretreatment(request)
        if music_name_index == -1:
            # th = threading.Thread(target=utils.sava_music_in, args=[select_obj, username])
            # th.start()
            th = threading.Thread(target=utils.save_music_info, args=[select_obj, username])
            th.start()
            # try:
            #     return redirect('../for-bili-setting?music=' + request.GET['url'])
            # except KeyError:
            #     # username = request.session['user_name']
            #     return redirect('../console')
        else:
            if music_name_index == 1:
                music_name_list.insert(1, select_obj)
                return next_music({'music_name_list': music_name_list}, username)
            else:
                music_name_list.insert(1, select_obj)
                UsersData.objects.filter(username=username).update(music_name=json.dumps(music_name_list))

        return HttpResponse(json.dumps({'data': 'executed'}))
    except (KeyError, ValueError):
        return HttpResponse(json.dumps({'data': 'error'}))


def use_url_get_user(request) -> str:
    """
    通过歌词/歌名url获取用户名

    :param request: url(str): 歌名/歌词链接, where_url(str): 歌名/歌词 (music_url / lyric_url)
    :return: 用户名
    """
    url = request.GET['url']
    where_url = request.GET['where_url']
    if where_url == 'lyric_url':
        username = UsersInfo.objects.get(lyric_url=url).username
    elif where_url == 'music_url':
        username = UsersInfo.objects.get(music_url=url).username
    else:
        username = ''
    return username


def pretreatment(request) -> Tuple[str, dict, list]:
    """
    对歌曲操作的预处理

    :param request: music_name(str): 歌曲名, artist(str): 歌手名
    :return: (用户名, 歌曲信息(歌名, 歌手), 移除此歌曲的歌曲列表)
    """
    try:
        try:
            username = use_url_get_user(request)
        except KeyError:
            username = request.session['user_name']
        music_name = request.GET['music_name']
        artist = request.GET['artist']
        file_name = [music_name, artist]
        music_name_list = json.loads(UsersData.objects.get(username=username).music_name)
        i = 0
        flag = False
        for i, music_info in enumerate(music_name_list):
            if i == 0:
                continue
            if music_info['file_name'] == file_name:
                flag = True
                break
        # if flag and request.GET['index']:
        if flag:
            select_obj = music_name_list.pop(i)
        else:
            select_obj = {'file_name': [music_name, artist]}
        return username, select_obj, music_name_list
    except KeyError:
        return '', {}, []


def console(request) -> HttpResponse:
    """
    控制台页面

    :param request: request
    :return: HttpResponse
    """
    try:
        user_name = request.session['user_name']
        try:
            request.session['base_setting']
        except KeyError:
            request.session['base_setting'] = {'medal_name': '', 'medal_of_user': '', 'use_room_medal': '',
                                               'medal_level_less': '0', 'user_level_less': '0'}
        try:
            result = UsersInfo.objects.get(username=user_name).lyric_url
        except AttributeError:
            return render(request, 'console.html', {'title': '请刷新页面'})
        add_data = {'title': 'Live Music 控制台', 'user_name': user_name,
                    'style_name': 'sheet.css', 'style_name1': 'console''.css', 'url': result}
        return render(request, 'console.html', add_data)
    except KeyError:
        add_data = {'title': 'Live Music 控制台',
                    'style_name': 'sheet.css', 'style_name1': 'console.css'}
        return render(request, 'console.html', add_data)


def course(request) -> HttpResponse:
    """
    教程页面

    :param request: request
    :return: HttpResponse
    """
    try:
        user_name = request.session['user_name']
        add_data = {'title': 'Live Music 教程', 'user_name': user_name, 'style_name': 'course.css', }
        return render(request, 'course.html', add_data)
    except KeyError:
        # add_data = {'title': 'Live Music 教程', 'style_name': 'course.css', }
        add_data = {'dev': dev}
        return render(request, 'document.html', add_data)


def document(request):
    add_data = {'dev': dev}
    return render(request, 'document.html', add_data)


def introduction(request):
    """
    (废弃)介绍页面

    :param request: request
    :return: HttpResponse
    """
    try:
        user_name = request.session['user_name']
        add_data = {'title': 'Live Music 介绍', 'user_name': user_name, 'style_name': 'sheet.css'}
        return render(request, 'introduction.html', add_data)
    except KeyError:
        add_data = {'title': 'Live Music 介绍', 'style_name': 'sheet.css'}
        return render(request, 'introduction.html', add_data)


def base_setting(request):
    """
    (废弃)基本设置页面

    :param request: request
    :return: HttpResponse
    """
    try:

        user_name = request.session['user_name']
        add_data = {'title': 'Live Music 基本设置', 'user_name': user_name, 'style_name': 'sheet.css',
                    'style_name1': 'base_setting.css'}
        add_data.update(session_key_data(request.session.session_key)['base_setting'])
        return render(request, 'base_setting.html', add_data)
    except KeyError:
        add_data = {'title': 'Live Music 基本设置', 'style_name': 'sheet.css', 'style_name1': 'base_setting.css'}
        return render(request, 'base_setting.html', add_data)


def get_base_setting(request):
    """(废弃)"""
    try:
        username = UsersInfo.objects.get(password=request.GET['secret']).username
        user_set = json.loads(UsersData.objects.get(username=username).user_set)
        user_base_set = {}
        for obj in dict(request.GET).items():
            if obj[0] == 'secret':
                continue
            user_base_set[obj[0]] = obj[1][0]
        print(user_base_set)
        user_set['base_setting'] = user_base_set
    except KeyError:
        try:
            request.session['base_setting'] = request.GET
            print(session_key_data(request.session.session_key))
            return redirect('../base_setting')
        except (KeyError, MultiValueDictKeyError):
            return base_setting(request)


def message(request, pam: str):
    """(废弃)"""
    try:
        username = request.session['user_name']
        Message.objects.filter(username=username).update(read=0)
        add_data = {'title': '消息', 'user_name': username, 'style_name': 'sheet.css', 'style_name1': 'message.css'}
        if pam == 'global':
            msg_content = Message.objects.get(username='global').msg
            add_data['global'] = 'click_i'
        elif pam == 'my':
            msg_content = Message.objects.get(username=username).msg
            add_data['my'] = 'click_i'
        else:
            msg_content = None
        msg_content = '' if msg_content is None else msg_content
        s = render(request, 'message.html', add_data)
        context = s.content
        s.content = context.replace(b'<div>1234567</div>', bytes(msg_content.encode('utf-8')))
        return s
    except (KeyError, MultiValueDictKeyError):
        render(request, 'show_error_info.html', {'error_information': '查找无结果...真的有这个人嘛？'})


def unread_msg(request):
    """(废弃)"""
    try:
        username = request.session['user_name']
        msg_read = Message.objects.get(username=username).read
        msg_read = 'error' if msg_read is None else msg_read
        return HttpResponse(json.dumps({'data': msg_read}))
    except (KeyError, MultiValueDictKeyError):
        return HttpResponse(json.dumps({'data': 'error'}))


@xframe_options_exempt
def for_bili(request) -> HttpResponse:
    return for_bili_prepare(request, 'music')


@xframe_options_exempt
def for_bili_lyric(request) -> HttpResponse:
    return for_bili_prepare(request, 'lyric')


@xframe_options_exempt
def for_bili_setting(request) -> HttpResponse:
    request.encoding = 'utf-8'
    # username = UsersInfo.objects.get(music_url=request.GET['music']).username
    try:
        request_get, sign, plug_env = get_sign_params(request)
    except (KeyError, MultiValueDictKeyError):
        # 传值错误，非法访问
        print('key_error')
        return render(request, 'show_error_info.html', {'error_information': '传错值啦！笨笨~'})
    request_get['CodeSign'] = sign
    request_get['plug_env'] = str(plug_env)
    get_keys = request_get.keys()
    get_values = request_get.values()
    for_bili_lyric_url_par = zip(get_keys, get_values)
    temp = []
    for i in list(for_bili_lyric_url_par):
        temp.append('='.join(i))
    try:
        return render(request, 'for_bili_setting.html',
                      {'url': request.GET['music'], 'where': 'music', 'dev': dev, 'params': '&'.join(temp)})
    except KeyError:
        return render(request, 'for_bili_setting.html',
                      {'url': request.GET['lyric'], 'where': 'lyric', 'dev': dev, 'params': '&'.join(temp)})


def get_sign_params(request):
    """
    整理返回鉴权要用的参数

    :param request: request
    :return: request_get, sign, plug_env
    """
    try:
        # v2接口参数
        request_get = {'Caller': request.GET['Caller'],  # 从哪来
                       'Code': request.GET['Code'],  # 身份码
                       'Mid': request.GET['Mid'],  # 用户id
                       'Timestamp': request.GET['Timestamp']  # 时间戳
                       }
        sign = request.GET['CodeSign']  # 基于参数生成的sha256
    except (KeyError, MultiValueDictKeyError):
        # caller, timestamp, roomId, mid, plug_env
        # v1接口参数适配
        request_get = {'Caller': request.GET['Caller'],
                       'Mid': request.GET['Mid'],
                       'RoomId': request.GET['RoomId'],
                       'Timestamp': request.GET['Timestamp']
                       }
        sign = request.GET['Sign']
    try:
        plug_env = int(request.GET['plug_env'])  # 1-设置 0-运行插件
    except (KeyError, MultiValueDictKeyError):
        plug_env = 1
    return request_get, sign, plug_env


def for_bili_prepare(request, where) -> HttpResponse:
    """
    返回歌词或歌曲页面

    :param request: request
    :param where: 'lyric' 或 'music'
    :return: HttpResponse
    """
    request.encoding = 'utf-8'
    try:
        request_get, sign, plug_env = get_sign_params(request)
        if utils.check_sign(request_get, sign):
            # 设置页
            secret = get_random_str(6)  # 动态密码
            username = request_get['Mid']  # 用户名uid
            user_code = request_get['Code']  # 用户身份码
            # bili_auth.testPostRequest('v1/app/pluginStart', {'room_id': request_get['RoomId'], 'app_id': bili_app_id})
            try:
                global_settings = get_global_settings(username)
                user_settings = get_user_settings(username, where)
                users_info_database = UsersInfo.objects.get(username=username)  # 用户信息数据库(user_info)
                last_secret = users_info_database.password
                if where == 'music':
                    music_url = users_info_database.music_url
                else:
                    music_url = users_info_database.lyric_url
                real_status = {}  # 音乐平台真实登录状态
                if not plug_env:
                    try:
                        auth_body, room_id = get_websocket_auth_body_and_room_id(user_code, bili_app_id)
                    except TypeError:
                        return render(
                            request, 'show_error_info.html', {'error_information': '阿伟又在刷新哦  休息60s好不好(过于频繁)'}
                        )
                    real_status = get_real_status(username)
                    user_settings.update({
                        'secret': last_secret, 'set_flag': plug_env, 'url': music_url, 'zh': '歌名设置成功！',
                        'en': 'Succeed!', 'auth': auth_body,
                        'global_setting': global_settings, 'dev': dev, 'real_status': json.dumps(real_status)
                    })
                else:
                    if where == 'music':
                        UsersInfo.objects.filter(username=username).update(password=secret)
                request_get['CodeSign'] = sign
                get_keys = request_get.keys()
                get_values = request_get.values()
                for_bili_lyric_url_par = zip(get_keys, get_values)
                temp = []
                for i in list(for_bili_lyric_url_par):
                    temp.append('='.join(i))
                print(user_settings)
                if where == 'music':
                    template = 'for_bilibili.html'
                    user_settings.update(
                        {'secret': secret if plug_env else last_secret, 'set_flag': plug_env, 'url': music_url,
                         'params': '&'.join(temp), 'global_setting': global_settings, 'dev': dev,
                         'real_status': json.dumps(real_status)})
                else:
                    template = 'for_bilibili_lyric.html'
                    user_settings.update({'secret': last_secret, 'set_flag': plug_env, 'url': music_url,
                                          'params': '&'.join(temp), 'global_setting': global_settings, 'dev': dev,
                                          'real_status': json.dumps(real_status)})
                return render(request, template, user_settings)
            except UsersData.DoesNotExist:
                print('new')
                try:
                    auth_body, room_id = get_websocket_auth_body_and_room_id(user_code, bili_app_id)
                except TypeError:
                    return render(
                        request, 'show_error_info.html', {'error_information': '阿伟又在刷新哦  休息60s好不好(过于频繁)'}
                    )
                music_url = get_random_str(10)
                lyric_url = get_random_str(10)
                user_set = for_bili_user_set.copy()
                global_settings = json.dumps(global_setting)
                user_set[where].update({'url': music_url, 'global_setting': global_setting})
                # user_set.update(for_bili_user_set)
                new_user = UsersInfo(
                    username=username,
                    password=secret,
                    is_admin=0,
                    music_url=music_url,
                    lyric_url=lyric_url,
                    is_running=1,
                    room_id=room_id
                )
                new_user_data = UsersData(
                    username=username,
                    music_name='[]',
                    play=1,
                    replay=0,
                    who_play=0,
                    console_info='[]',
                    user_set=json.dumps(user_set),
                    global_setting=global_settings,
                    login_status='{"qq": false, "cloud": false, "ku_wo": false}'
                )
                new_user.save()
                new_user_data.save()
                if where == 'music':
                    template = 'for_bilibili.html'
                else:
                    template = 'for_bilibili_lyric.html'
                user_set[where].update({'dev': dev, 'real_status': json.dumps({})})
                return render(request, template, user_set[where])
        else:
            # 非法访问
            print('ill')
            return render(request, 'show_error_info.html', {'error_information': '签名不对嗷  请从商店获取链接！'})
    except (KeyError, MultiValueDictKeyError):
        # 传值错误，非法访问
        print('key_error')
        return render(request, 'show_error_info.html', {'error_information': '传错值啦！笨笨~'})


def get_global_settings(username: str) -> dict:
    """
    获取数据库全局设置字段

    :param username: 用户名
    :return: 全局设置字典
    """
    try:
        global_settings = json.loads(
            UsersData.objects.filter(username=username).get().global_setting)
    except (TypeError, json.decoder.JSONDecodeError):
        global_settings = {'black_user_list': [], 'black_music_list': []}
        UsersData.objects.filter(username=username).update(global_setting=json.dumps(global_settings))
    return global_settings


def get_user_settings(username: str, where: str) -> dict:
    """
    获取歌名/歌词设置字典

    :param username: 用户名
    :param where: 歌名/歌词 (music/lyric)
    :return: 歌名/歌词设置字典
    """
    user_set = json.loads(UsersData.objects.filter(username=username).get().user_set)
    try:
        user_music_set = user_set[where]  # 歌词或歌曲的设置
    except KeyError:
        temp = for_bili_user_set.copy()
        if user_set:
            temp[where] = user_set
        UsersData.objects.filter(username=username).update(user_set=json.dumps(temp))
        user_music_set = user_set
    print(user_music_set)
    return user_music_set


def get_websocket_auth_body_and_room_id(user_code: str, app_id):
    """
    获取建立长链的验证字符串和房间号

    :param user_code: 用户身份码
    :param app_id: 项目id
    :return: 建立长链的验证字符串, 房间号
    """
    data = utils.get_websocket_info(code=user_code, app_id=app_id)['content']['data']
    room_id = data['anchor_info']['room_id']
    auth_body = data['websocket_info']['auth_body']
    return auth_body, room_id


def get_real_status(username: str) -> dict:
    """
    获取音乐平台真实登录状态

    :param username: 用户名
    :return: 登录状态字典
    """
    real_status = {}
    login_status = json.loads(UsersData.objects.get(username=username).login_status)
    if login_status['cloud']:
        try:
            t = utils.get_cloud_music_real_status(username)['profile']
        except KeyError:
            real_status['cloud'] = login_status['cloud'] = False
    if login_status['qq']:
        try:
            if not utils.get_qq_music_real_status(username):
                real_status['qq'] = False
        except json.decoder.JSONDecodeError:
            real_status['qq'] = login_status['qq'] = False
    UsersData.objects.filter(username=username).update(login_status=json.dumps(login_status))
    return real_status


def reset_own_database(request) -> HttpResponse:
    request.encoding = 'utf-8'
    try:
        username = use_url_get_user(request)
        UsersInfo.objects.filter(username=username).update(is_running=0)
        UsersData.objects.filter(username=username).update(music_name='[]', now_music_url='', lyric_name='[{}]',
                                                           console_info=[], user_set=json.dumps(for_bili_user_set),
                                                           global_setting=json.dumps(global_setting))
        return HttpResponse(json.dumps({'info': True}))
    except:
        return HttpResponse(json.dumps({'info': False}))


def from_bili(request) -> HttpResponse:
    """
    接收用户设置

    :param request: request
    :return: HttpResponse
    """
    request.encoding = 'utf-8'
    username = UsersInfo.objects.get(password=request.GET['secret']).username
    user_set = json.loads(UsersData.objects.get(username=username).user_set)
    for obj in dict(request.GET).items():
        if obj[0] == 'secret':
            continue
        user_set[request.GET['where']][obj[0]] = obj[1][0]
    print(user_set)
    UsersData.objects.filter(username=username).update(user_set=json.dumps(user_set))
    return HttpResponse('')


def add_global_setting(request) -> HttpResponse:
    request.encoding = 'utf-8'
    username = UsersInfo.objects.get(password=request.GET['secret']).username
    global_settings = json.loads(UsersData.objects.get(username=username).global_setting)
    global_settings[request.GET['where']] = json.loads(request.GET['data'])
    print(global_settings)
    UsersData.objects.filter(username=username).update(global_setting=json.dumps(global_settings))
    return HttpResponse('')


@xframe_options_exempt
def get_dan_mu(request) -> HttpResponse:
    request.encoding = 'utf-8'
    try:
        room_id = request.GET['room_id']
        return HttpResponse(json.dumps(utils.return_history(room_id)))
    except KeyError:
        return HttpResponse('')


def test(request):
    """
    (废弃)登录测试

    :param request:
    :return:
    """
    request.encoding = 'utf-8'
    username = request.GET['username']
    b64 = utils.login_cloud_music(username)
    return render(request, 'test.html', {'b64': b64, 'dev': dev, 'username': username})


def test_search(request):
    """(废弃)"""
    request.encoding = 'utf-8'
    return HttpResponse(json.dumps(utils.new_search_cloud_music(request.GET['key_word'], '', request.GET['username'])))


def cloud_music_qr_code(request):
    """
    返回网易云登录二维码图片base64

    :param request: request
    :return: HttpResponse(json) {"base64": '/9j/4AAQSkZJRg...'}
    """
    request.encoding = 'utf-8'
    username = UsersInfo.objects.get(password=request.GET['secret']).username
    b64 = utils.login_cloud_music(username)
    return HttpResponse(json.dumps({'base64': b64}))


def qq_music_qr_code(request) -> HttpResponse:
    request.encoding = 'utf-8'
    username = UsersInfo.objects.get(password=request.GET['secret']).username
    b64 = get_qq_qrcode(username)
    return HttpResponse(json.dumps({'base64': b64}))
    # b64 = get_qq_qrcode(request.GET['username'])
    # return render(request, 'test.html', {'b64': b64})


def check_qr_status(request):
    """
    从数据库取出登录状态

    :param request: request
    :return: json {"qq": false, "cloud": true, "ku_wo": false}
    """
    request.encoding = 'utf-8'
    username = UsersInfo.objects.get(password=request.GET['secret']).username
    login_status = utils.get_all_login_status(username)
    return username, login_status


def set_qr_status(request) -> HttpResponse:
    """
    设置登录状态

    :param request: request
    :return: HttpResponse(json) {"qq": false, "cloud": true, "ku_wo": false}
    """
    username, login_status = check_qr_status(request)
    login_status = login_status
    login_status[request.GET['platform']] = False if request.GET['value'] == 'false' else True
    UsersData.objects.filter(username=username).update(login_status=json.dumps(login_status))
    return HttpResponse(json.dumps({'data': True}))


def get_qr_status(request) -> HttpResponse:
    """
    返回登录状态

    :param request: request
    :return: HttpResponse(json) {"qq": false, "cloud": true, "ku_wo": false}
    """
    login_status = check_qr_status(request)[-1]
    return HttpResponse(json.dumps(login_status))


def get_qq_playlist(request) -> HttpResponse:
    request.encoding = 'utf-8'
    # username = UsersInfo.objects.get(password=request.GET['secret']).username
    username = use_url_get_user(request)
    try:
        return HttpResponse(json.dumps(utils.get_qq_music_playlist(username)))
    except TypeError:
        return HttpResponse('{}')


def get_qq_playlist_info(request) -> HttpResponse:
    request.encoding = 'utf-8'
    playlist_id = request.GET['playlist_id']
    return HttpResponse(json.dumps(utils.get_qq_music_playlist_info(playlist_id)))


def load_playlist_to_database(request) -> HttpResponse:
    request.encoding = 'utf-8'
    username = use_url_get_user(request)
    platform = request.GET['platform']
    overwrite = int(request.GET['overwrite'])
    playlist_id = request.GET['playlist_id']
    # username = UsersInfo.objects.get(password=request.GET['secret']).username
    utils.save_playlist_in(platform, playlist_id, overwrite, username)
    return HttpResponse('')


def lottery(request) -> HttpResponse:
    request.encoding = 'utf-8'
    try:
        try:
            plug_env = int(request.GET['plug_env'])  # 设置界面参数，1设置0使用
        except KeyError:
            plug_env = 1
        try:
            auth_code = request.GET['code']
        except KeyError:
            return render(request, 'auth_code.html')
        try:
            temp = Lottery.objects.get(auth_code=auth_code)
            room_id = temp.room_id
            settings = json.loads(temp.settings)
            content = utils.get_websocket_info(code=auth_code, app_id=bili_app_id)['content']
        except (Lottery.DoesNotExist, FieldError):
            content = utils.get_websocket_info(code=auth_code, app_id=bili_app_id)['content']
            uid = content['data']['anchor_info']['uid']
            room_id = content['data']['anchor_info']['room_id']
            settings = {
                'start_getting': 0,
                'plug_in_width': 650,
                'plug_in_height': 520,
                'send_msg_flag': 1,
                'send_gift_flag': 0,
                'has_condition_flag': 1,
                'guard_flag': 0,
                'medal_flag': 1,

                'guard_level': 0,
                'medal_level': 1,
                'what_prize': '立牌',
                'how_many_people': 1,

                'id': 1,
                'gif': 'https://i0.hdslb.com/bfs/live/d40ff17d533047cbb9b2bed4feb927cb0e71901c.gif',
                'name': '辣条',
                'desc': '辣条是流行于哔哩哔哩的坊间美食，可以直接食用，也能用来打赌。',
                'price': 100,
                'coin_type': 'silver',

                'gift_number': 2,
                'specific_condition': '生日快乐',

                'cheat_flag': 0,
                'cheating_uid': '',
                'random_list': [],
                'people_info': [],
                'participation_info': [],
            }
            new_user = Lottery(uid=uid, room_id=room_id, auth_code=auth_code, settings=json.dumps(settings))
            new_user.save()
        if plug_env:
            try:
                print(room_id)
                settings.update({'plug_env': plug_env, 'auth': content['data']['websocket_info']['auth_body'],
                                 'auth_code': auth_code, 'room_id': room_id})
                return render(request, 'lottery.html', settings)
            except TypeError:
                return render(
                    request,
                    'show_error_info.html',
                    {'error_information': '阿伟又在刷新哦  休息60s好不好(过于频繁)'}
                )
        settings.update({'plug_env': plug_env, 'auth': content['data']['websocket_info']['auth_body'],
                         'auth_code': auth_code, 'room_id': room_id})
        return render(request, 'lottery.html', settings)
    except KeyError:
        return render(request, 'show_error_info.html', {'error_information': '传错值啦！笨笨w'})


def lottery_settings(request) -> HttpResponse:
    request.encoding = 'utf-8'
    try:
        auth_code = request.POST['auth_code']
    except KeyError:
        return render(request, 'show_error_info.html', {'error_information': '传错值啦！笨笨w'})
    settings = json.loads(Lottery.objects.get(auth_code=auth_code).settings)
    for obj in dict(request.POST).items():
        if obj[0] == 'auth_code':
            continue
        settings[obj[0]] = obj[1][0]
    print(settings)
    Lottery.objects.filter(auth_code=auth_code).update(settings=json.dumps(settings))
    return HttpResponse('')


def get_lottery_setting(request) -> HttpResponse:
    try:
        auth_code = request.GET['code']
        return HttpResponse(Lottery.objects.get(auth_code=auth_code).settings)
    except KeyError:
        return HttpResponse('')


def room_gift_data(request) -> HttpResponse:
    import requests
    request.encoding = 'utf-8'
    params = {}
    for obj in dict(request.GET).items():
        params[obj[0]] = obj[1][0]
    print(params)
    return HttpResponse(
        requests.get('https://api.live.bilibili.com/xlive/web-room/v1/giftPanel/giftData', params=params).content)


def gift_config(request) -> HttpResponse:
    import requests
    request.encoding = 'utf-8'
    params = {}
    for obj in dict(request.GET).items():
        params[obj[0]] = obj[1][0]
    print(params)
    return HttpResponse(
        requests.get('https://api.live.bilibili.com/xlive/web-room/v1/giftPanel/giftConfig', params=params).content)

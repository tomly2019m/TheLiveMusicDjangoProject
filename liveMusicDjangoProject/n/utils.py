# import atexit
import datetime
import hashlib
import hmac
import json
import random
import re
from typing import Tuple, Union, List, Any
import time
import pymysql
import pytz
import requests

import bili_auth
import cloudMusicApi
import cloudMusicLogin
import kuWoApi
import qqMusicApi
from django.utils import timezone
from liveMusicDjangoProject.n import pyncm
from liveMusicDjangoProject.n.pyncm.apis import cloudsearch, WeapiCryptoRequest
from liveMusicDjangoProject.n.pyncm.apis import user as cloud_user
from liveMusicDjangoProject.n.pyncm.apis import playlist as cloud_playlist
from liveMusicDjangoProject.n.pyncm.apis import track as cloud_track

try:
    import django

    try:
        from TestModel.models import UsersData, UsersInfo
        from liveMusicDjangoProject.n import main_class
    except django.core.exceptions.ImproperlyConfigured:
        print('数据库配置文件有误')
except (AttributeError, ModuleNotFoundError):
    print('模块缺失，未导入数据库')

online_user = []

# test_dan = [{'text': '点歌 百变奶精&Hanser', 'dm_type': 0, 'uid': 29418115, 'nickname': '虫草小王子', 'uname_color': '#00D1F1',
#              'timeline': '2022-02-09 22:58:41', 'isadmin': 0, 'vip': 0, 'svip': 0,
#              'medal': [11, '秋林喵', '秋林音食Akibaya', 630141, 6126494, '', 0, 6126494, 6126494, 6126494, 0, 1, 8100585],
#              'title': ['', ''], 'user_level': [10, 0, 6406234, '>50000'], 'rank': 10000, 'teamid': 0,
#              'rnd': '1322379141', 'user_title': '', 'guard_level': 3, 'bubble': 5,
#              'bubble_color': '#1453BAFF,#4C2263A2,#3353BAFF', 'lpl': 0,
#              'check_info': {'ts': 1634301097, 'ct': '61C98065'},
#              'voice_dm_info': {'voice_url': '', 'file_format': '', 'text': '', 'file_duration': 0, 'file_id': ''},
#              'emoticon': {'id': 0, 'emoticon_unique': '', 'text': '', 'perm': 0, 'url': '', 'in_player_area': 0,
#                           'bulge_display': 0, 'is_dynamic': 0, 'height': 0, 'width': 0}},
#             {'text': '点歌 フリージア&Uru', 'dm_type': 0, 'uid': 8100585, 'nickname': '秋林音食Akibaya', 'uname_color': '',
#              'timeline': '2022-03-15 22:05:39', 'isadmin': 0, 'vip': 0, 'svip': 0, 'medal': [], 'title': ['', ''],
#              'user_level': [13, 0, 6406234, '>50000'], 'rank': 10000, 'teamid': 0, 'rnd': '2090858909',
#              'user_title': '', 'guard_level': 0, 'bubble': 0, 'bubble_color': '', 'lpl': 0, 'yeah_space_url': '',
#              'jump_to_url': '', 'check_info': {'ts': 1647353139, 'ct': 'E9E42F9B'},
#              'voice_dm_info': {'voice_url': '', 'file_format': '', 'text': '', 'file_duration': 0, 'file_id': ''},
#              'emoticon': {'id': 0, 'emoticon_unique': '', 'text': '', 'perm': 0, 'url': '', 'in_player_area': 0,
#                           'bulge_display': 0, 'is_dynamic': 0, 'height': 0, 'width': 0}},
#             {'text': '点歌 的&url', 'dm_type': 0, 'uid': 29418115, 'nickname': '虫草小王子', 'uname_color': '#00D1F1',
#              'timeline': '2022-02-09 22:58:41', 'isadmin': 0, 'vip': 0, 'svip': 0,
#              'medal': [11, '秋林喵', '秋林音食Akibaya', 630141, 6126494, '', 0, 6126494, 6126494, 6126494, 0, 1, 8100585],
#              'title': ['', ''], 'user_level': [10, 0, 6406234, '>50000'], 'rank': 10000, 'teamid': 0,
#              'rnd': '1322379141', 'user_title': '', 'guard_level': 3, 'bubble': 5,
#              'bubble_color': '#1453BAFF,#4C2263A2,#3353BAFF', 'lpl': 0,
#              'check_info': {'ts': 1634301097, 'ct': '61C98065'},
#              'voice_dm_info': {'voice_url': '', 'file_format': '', 'text': '', 'file_duration': 0, 'file_id': ''},
#              'emoticon': {'id': 0, 'emoticon_unique': '', 'text': '', 'perm': 0, 'url': '', 'in_player_area': 0,
#                           'bulge_display': 0, 'is_dynamic': 0, 'height': 0, 'width': 0}},
#             {'text': '点歌 群青', 'dm_type': 0, 'uid': 29418115, 'nickname': '虫草小王子', 'uname_color': '#00D1F1',
#              'timeline': '2022-02-09 22:58:41', 'isadmin': 0, 'vip': 0, 'svip': 0,
#              'medal': [11, '秋林喵', '秋林音食Akibaya', 630141, 6126494, '', 0, 6126494, 6126494, 6126494, 0, 1, 8100585],
#              'title': ['', ''], 'user_level': [10, 0, 6406234, '>50000'], 'rank': 10000, 'teamid': 0,
#              'rnd': '1322379141', 'user_title': '', 'guard_level': 3, 'bubble': 5,
#              'bubble_color': '#1453BAFF,#4C2263A2,#3353BAFF', 'lpl': 0,
#              'check_info': {'ts': 1634301097, 'ct': '61C98065'},
#              'voice_dm_info': {'voice_url': '', 'file_format': '', 'text': '', 'file_duration': 0, 'file_id': ''},
#              'emoticon': {'id': 0, 'emoticon_unique': '', 'text': '', 'perm': 0, 'url': '', 'in_player_area': 0,
#                           'bulge_display': 0, 'is_dynamic': 0, 'height': 0, 'width': 0}},
#             {'text': '点歌 恋&星野源', 'dm_type': 0, 'uid': 29418115, 'nickname': '虫草小王子', 'uname_color': '#00D1F1',
#              'timeline': '2022-02-09 22:58:41', 'isadmin': 0, 'vip': 0, 'svip': 0,
#              'medal': [11, '秋林喵', '秋林音食Akibaya', 630141, 6126494, '', 0, 6126494, 6126494, 6126494, 0, 1, 8100585],
#              'title': ['', ''], 'user_level': [10, 0, 6406234, '>50000'], 'rank': 10000, 'teamid': 0,
#              'rnd': '1322379141', 'user_title': '', 'guard_level': 3, 'bubble': 5,
#              'bubble_color': '#1453BAFF,#4C2263A2,#3353BAFF', 'lpl': 0,
#              'check_info': {'ts': 1634301097, 'ct': '61C98065'},
#              'voice_dm_info': {'voice_url': '', 'file_format': '', 'text': '', 'file_duration': 0, 'file_id': ''},
#              'emoticon': {'id': 0, 'emoticon_unique': '', 'text': '', 'perm': 0, 'url': '', 'in_player_area': 0,
#                           'bulge_display': 0, 'is_dynamic': 0, 'height': 0, 'width': 0}},
#             {'text': '点歌 尘世闲游', 'dm_type': 0, 'uid': 534699750, 'nickname': '白曲白曲', 'uname_color': '#00D1F1',
#              'timeline': '2022-03-23 20:30:31', 'isadmin': 0, 'vip': 0, 'svip': 0, 'medal': [], 'title': ['', ''],
#              'user_level': [3, 0, 9868950, '>50000'], 'rank': 10000, 'teamid': 0, 'rnd': '160039541', 'user_title': '',
#              'guard_level': 3, 'bubble': 5, 'bubble_color': '#1453BAFF,#4C2263A2,#3353BAFF', 'lpl': 0,
#              'yeah_space_url': '', 'jump_to_url': '', 'check_info': {'ts': 1648038631, 'ct': 'B6CEF63F'},
#              'voice_dm_info': {'voice_url': '', 'file_format': '', 'text': '', 'file_duration': 0, 'file_id': ''},
#              'emoticon': {'id': 0, 'emoticon_unique': '', 'text': '', 'perm': 0, 'url': '', 'in_player_area': 0,
#                           'bulge_display': 0, 'is_dynamic': 0, 'height': 0, 'width': 0}},
#             {'text': '点歌 好运来', 'dm_type': 0, 'uid': 11372346, 'nickname': '子时不是姿势', 'uname_color': '',
#              'timeline': '2022-04-10 16:46:14', 'isadmin': 0, 'vip': 0, 'svip': 0, 'medal': [], 'title': ['', ''],
#              'user_level': [17, 0, 6406234, '>50000'], 'rank': 10000, 'teamid': 0, 'rnd': '1649579825',
#              'user_title': '', 'guard_level': 0, 'bubble': 0, 'bubble_color': '', 'lpl': 0, 'yeah_space_url': '',
#              'jump_to_url': '', 'check_info': {'ts': 1649580374, 'ct': '4791C6B5'},
#              'voice_dm_info': {'voice_url': '', 'file_format': '', 'text': '', 'file_duration': 0, 'file_id': ''},
#              'emoticon': {'id': 0, 'emoticon_unique': '', 'text': '', 'perm': 0, 'url': '', 'in_player_area': 0,
#                           'bulge_display': 0, 'is_dynamic': 0, 'height': 0, 'width': 0}}
#             ]  # 模拟弹幕消息
num = 0  # 与pass_key配合
sql_num = 3  # sql语句尝试执行次数
pass_key = 'flzxsqc'
g_time = None  # 全局弹幕最新时间
user_count_down = []  # 用户点歌缓冲区，一段时间内不能点歌，计时结束后移出列表


# @atexit.register
# def exit_todo():
#     # 退出时执行
#     # global mysql_pool
#     # mysql_config = {'host': 'localhost',
#     #                 'user': 'live_music',
#     #                 'password': 'pZ6Bm7zm6DNDRkne',
#     #                 'database': 'live_music',
#     #                 'autocommit': True,
#     #                 'use_unicode': True}
#     #
#     # mysql_pool = pymysqlpool.ConnectionPool(size=1, **mysql_config)
#     # safe_execute('UPDATE users_info SET is_running=%s', ['0'], '')
#     # safe_execute('UPDATE users_data SET music_name=%s, now_music_url=%s, lyric_name=%s', ['[]', '', ''], '')
#     try:
#         # UsersInfo.objects.all().update(is_running=0)
#         UsersData.objects.all().update(music_name='[]', now_music_url='', lyric_name='[{}]')
#     except NameError:
#         print('NameError')
#     except:
#         pass


def connect_db():
    """打开数据库连接(已废弃)"""
    data_base = pymysql.connect(host='localhost',
                                user='live_music',
                                password='pZ6Bm7zm6DNDRkne',
                                database='live_music',
                                autocommit=True,
                                use_unicode=True)
    return data_base.cursor(), data_base


"""
# 使用 cursor() 方法创建一个游标对象 cursor
cursor, db = connect_db()"""


def return_history(room_id: str):
    header = {
        'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) "
                      "Chrome/108.0.0.0 Safari/537.36 ",
        'cookie': "buvid3=C07A94C4-4C67-52F8-FFA3-468774BFC52406133infoc; b_nut=1671340507; buvid4=AED560DA-A2A9-A65C-C3B7-DF94FF9B2BFC06133-022121813-cWZGbE4cldpLYTlsiAxObg%3D%3D; CURRENT_FNVAL=4048; _uuid=B4A2414A-105DB-FE7E-B589-E9E8105F26ABA42231infoc; rpdid=|(k|k)k~)Y)J0J'uY~uJR|lRu; buvid_fp_plain=undefined; DedeUserID=29418115; DedeUserID__ckMd5=c1b4143bc7318e8d; i-wanna-go-back=-1; b_ut=5; hit-new-style-dyn=0; hit-dyn-v2=1; LIVE_BUVID=AUTO1216713678843815; nostalgia_conf=-1; fingerprint=0d389ee6bb9106122990ad6077fa38fa; buvid_fp=0d389ee6bb9106122990ad6077fa38fa; blackside_state=1; CURRENT_QUALITY=80; Hm_lvt_8a6e55dbd2870f0f5bc9194cddf32a02=1671633079,1672752804; bp_t_offset_29418115=747215354979156021; innersign=0; b_lsid=EFE8F487_1858533BBC6; SESSDATA=fc67bf23%2C1688529040%2C2291a%2A11; bili_jct=77178b7c7a44daabbb89592eddd0d5a8; _dfcaptcha=4428c444c2d31af019e28a5d336c3c66; sid=qjolwlk8; PVID=1; PEA_AU=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJiaWQiOjI5NDE4MTE1LCJwaWQiOjgzOTA2LCJleHAiOjE3MDQ1MTQ5NDQsImlzcyI6InRlc3QifQ.1Ku4xhTCKw_tQ53yyvuRsFuvvmonehqzUSRFHCb_sV4"
    }
    dan_mu_api = f'https://api.live.bilibili.com/xlive/web-room/v1/dM/gethistory?roomid={room_id}'
    r = requests.get(url=dan_mu_api, headers=header, verify=False)
    print(r)
    return r.json()['data']['room']  # 历史弹幕信息


def write_console_info(username, msg):
    """
    向数据库写入错误信息
    :param username:
    :param msg:
    :return:
    """
    info = json.loads(str(UsersData.objects.get(username=username).console_info))
    if len(info) > 100:
        info = info[-1:-99]
    # info.append({'info': msg, 'time': time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())})
    info.append(
        {
            'info': msg,
            'time': datetime.datetime.now(pytz.timezone('Asia/Shanghai')).strftime("%Y-%m-%d %H:%M:%S")
        }
    )
    # info.append({'info': msg, 'time': timezone.localtime().strftime("%Y-%m-%d %H:%M:%S")})
    UsersData.objects.filter(username=username).update(console_info=json.dumps(info))
    # try:
    #     info = json.loads(str(UsersData.objects.get(username=username).console_info))
    #     info.append({'info': msg, 'time': time.strftime("%Y-%m-%d-%H-%M-%ss", time.localtime())})
    #     UsersData.objects.filter(username=username).update(
    #         console_info=json.dumps(info))
    # except:
    #     # 无数据库等异常
    #     print("数据库操作失败")


def save_playlist_in(platform: str, playlist_id: Union[str, int], overwrite: Union[bool, int],
                     username: Union[str, int]) -> None:
    """
    将歌单内容保存到数据库

    :param platform: 哪个音乐平台 qq / cloud / ku_wo
    :param playlist_id: 歌单id
    :param overwrite: 是否覆盖原有的歌单 False: 追加
    :param username: 用户名
    :return: None
    """
    try:
        data = json.loads(UsersData.objects.get(username=username).user_playlist)
    except (TypeError, json.decoder.JSONDecodeError):
        data = {'statue': False, 'playlist': []}
    if overwrite:
        data['playlist'] = []
    if platform == 'qq':
        result = qqMusicApi.playlist_info(int(playlist_id))['req_0']['data']['songlist']
        for music_dict in result:
            artist = []
            for artist_dict in music_dict['singer']:
                artist.append(artist_dict['name'].split(' (')[0])
            data['playlist'].append({
                'file_name': [music_dict['name'], '/'.join(artist)],
                'id': music_dict['mid'],
                'platform': 'qq'
            })
    elif platform == 'cloud':
        result = get_cloud_music_playlist_info(username, playlist_id)
        music_ids = [music_info['id'] for music_info in result['privileges']]
        music_info_list = cloud_music_use_id_get_music_info(music_ids)
        for music_dict in music_info_list:
            artist = []  # 所有统计歌手
            for now_artist in music_dict['ar']:
                artist.append(now_artist['name'])
            data['playlist'].append({
                'file_name': [music_dict['name'], '/'.join(artist)],
                'id': music_dict['id'],
                'platform': 'cloud'
            })
        # print(result)
        ...
    elif platform == 'ku_wo':
        music_info_list = kuWoApi.get_playlist_info(playlist_id)
        for music_dict in music_info_list:
            data['playlist'].append({
                'file_name': [music_dict['name'], music_dict['artist']],
                'id': music_dict['rid'],
                'platform': 'ku_wo'
            })
        ...
    UsersData.objects.filter(username=username).update(user_playlist=json.dumps(data))


def random_get_playlist_music(username):
    try:
        data = json.loads(UsersData.objects.get(username=username).user_playlist)['playlist']
    except (TypeError, json.decoder.JSONDecodeError):
        return {}, ['', ''], '', '', False
    playlist_len = len(data)
    if playlist_len:
        index = random.randint(0, playlist_len - 1)
        music_info = data[index]
        file_name, music_url, lyric = analyze_music_information(music_info, username)
        return music_info, file_name, music_url, lyric, True
    else:
        return {}, ['', ''], '', '', False


def analyze_music_information(music_info: dict, username: Union[str, int], used=False) -> Tuple[list, str, dict]:
    """
    解析详细的歌曲信息

    :param music_info: { id: 歌曲id, platform: 歌曲在哪个平台, file_name: [歌名, 歌手] }
    :param username: 用户名
    :param used: 上次是不是自己调用
    :return: [歌名, 歌手], 歌曲url, 歌词
    """
    music_url = lyric = ''
    music_id = music_info['id']
    platform = music_info['platform']
    file_name = music_info['file_name']
    platform_name = {'cloud': '网易云', 'qq': 'QQ音乐', 'ku_wo': '酷我'}
    if platform == 'qq':
        music_url = qqMusicApi.get_music_url_with_cookie(username, music_id)
        if music_url != 'https://dl.stream.qqmusic.qq.com/':
            try:
                lyric = qqMusicApi.search_lyric(music_id)
            except KeyError:
                lyric = []
        else:
            music_url = ''
        ...
    elif platform == 'cloud':
        try:
            music_url = cloudMusicApi.get_song_url(music_id, cloudMusicApi.get_random_str(16))['data'][0]['url']
        except KeyError:
            music_url = ''
        if music_url == '' or music_url is None:
            try:
                cloudsearch.load_cookies(username)
                music_url = new_cloud_music_get_url(music_id)['data'][0]['url']
                lyric = lyric_filter(new_cloud_music_lyric_download(music_id))
            except (TypeError, KeyError):
                pass
        else:
            lyric = lyric_filter(cloudMusicApi.get_song_lyric(music_id, cloudMusicApi.get_random_str(16)))
        if not used and music_url == '':
            file_name, music_url, lyric = analyze_music_information(music_info, username, True)
    elif platform == 'ku_wo':
        try:
            music_url = kuWoApi.get_music_url(music_id)
            lyric = kuWoApi.get_lyric(music_id)
        except json.decoder.JSONDecodeError:
            print('地址获取失败')
            if not username == '':
                write_console_info(username, '地址获取失败')
        except KeyError:
            if not username == '':
                write_console_info(username, f'{file_name[0]}-{file_name[1]}: {platform_name[platform]}获取失败')
    if music_url:
        write_console_info(username, f'{file_name[0]}-{file_name[1]}: {platform_name[platform]}播放url获取成功')
    else:
        write_console_info(username, f'{file_name[0]}-{file_name[1]}: {platform_name[platform]}播放url获取失败')
    if lyric:
        write_console_info(username, f'{file_name[0]}-{file_name[1]}: {platform_name[platform]}歌词获取成功')
    else:
        write_console_info(username, f'{file_name[0]}-{file_name[1]}: {platform_name[platform]}歌词获取失败')
    return file_name, music_url, lyric


def load_music(index: int, username: Union[str, int]) -> None:
    """
    加载数据库字段 music_name 内指定位置的歌曲url歌词等信息到数据库

    :param index: 索引
    :param username: 用户名
    :return: None
    """
    music_name_list = json.loads(UsersData.objects.get(username=username).music_name)
    music_info = music_name_list[index]
    # file_name, music_url, lyric = analyze_music_information(music_info, username)
    # save_music_in_database(file_name, music_url, lyric, False, username)
    save_music_info_in_database(music_info, username, True)


def save_music_info(music_name, username) -> Tuple[List[Any], str, dict]:
    """

    :param music_name:
    :param username:
    :return: music_info_list, music_url, lyric
    """
    file_name = ['', '']
    music_info = {}
    music_name, artist = pre_music_set(music_name)
    try:
        order_list = smart_choose_load(username)
        # order_list = ['ku_wo']
        for who in order_list:
            music_info = get_platform_music_info(who, music_name, artist)
            if music_info != {}:
                file_name, music_url, lyric = analyze_music_information(music_info, username)
                if file_name != ['', ''] and (music_url != '' and music_url is not None):
                    break
    except KeyError:
        write_result(file_name, music_name, artist, username)
        return [], '', {}
    if file_name != ['', ''] and music_info:
        # save_music_in_database(file_name)
        return save_music_info_in_database(music_info, username)
    return [], '', {}


def get_platform_music_info(platform, music_name, artist):
    music_info = {}
    try:
        if platform == 'cloud':
            music_dict = cloudMusicApi.get_music_dict(music_name, artist)
            file_name, song_mid = cloudMusicApi.get_music_info(music_dict)
            music_info = {
                'id': song_mid,
                'platform': 'cloud',
                'file_name': file_name,
            }
        elif platform == 'qq':
            music_dict = qqMusicApi.get_music_dict(music_name, artist)
            file_name, song_mid = qqMusicApi.get_music_info(music_dict)
            music_info = {
                'id': song_mid,
                'platform': 'qq',
                'file_name': file_name,
            }
        elif platform == 'ku_wo':
            music_dict = kuWoApi.get_music_dict(music_name, artist)
            file_name, song_mid = kuWoApi.get_music_info(music_dict)
            music_info = {
                'id': song_mid,
                'platform': 'ku_wo',
                'file_name': file_name,
            }
            ...
    except (KeyError, TypeError):
        return {}
    return music_info


def save_music_info_in_database(music_info: dict, username: Union[str, int], is_play_now=False, music_info_list=None) -> \
        Tuple[List[Any], str, dict]:
    """
    将歌曲详细信息存到数据库

    :param music_info: 歌曲详细信息 {id, file_name, platform}
    :param username: 用户名
    :param is_play_now: 忽略判断直接加载歌曲 url 等
    :param music_info_list: 已经操作过的列表
    :return: music_info_list, music_url, lyric
    """
    if music_info_list is None:
        music_info_list = []
        result = UsersData.objects.get(username=username).music_name
        file_name, music_url, lyric = analyze_music_information(music_info, username)
        if result == '[]' or is_play_now:
            # file_name, music_url, lyric = analyze_music_information(music_info, username)
            if music_url:
                data = json.loads(result)
                try:
                    del data[0]
                    music_info_list = data
                    UsersData.objects.filter(username=username).update(
                        music_name=json.dumps(data),
                        now_music_url=music_url,
                        lyric_name=json.dumps(lyric)
                    )
                except IndexError:
                    music_info_list = [music_info]
                    UsersData.objects.filter(username=username).update(
                        music_name=json.dumps(music_info_list),
                        now_music_url=music_url,
                        lyric_name=json.dumps(lyric)
                    )
        else:
            if music_url:
                data = json.loads(result)
                data.append(music_info)
                music_info_list = data
                UsersData.objects.filter(username=username).update(music_name=json.dumps(data))
                write_console_info(username, f'{music_info["file_name"][0]}-{music_info["file_name"][1]}: 点歌成功')
        return music_info_list, music_url, lyric
    else:
        file_name, music_url, lyric = analyze_music_information(music_info, username)
        if music_url:
            UsersData.objects.filter(username=username).update(
                music_name=json.dumps(music_info_list),
                now_music_url=music_url,
                lyric_name=json.dumps(lyric)
            )
        return music_info_list, music_url, lyric


def sava_music_in(music_info, username: str, flag=False) -> None:
    """(废弃)搜索歌曲并将结果保存到MySQL"""
    # file_name, music_url, lyric = load_music(music_info, username)
    # file_name, music_url, lyric = smart_choose_load(music_info, username)
    file_name = ['', '']
    music_url = lyric = ''
    order_list = smart_choose_load(username)
    music_name, artist = pre_music_set(music_info['file_name'])
    for who in order_list:
        file_name, music_url, lyric = use_search(who, music_name, artist, username)
        if file_name != ['', '']:
            break
    write_result(file_name, music_name, artist, username)
    save_music_in_database(file_name, music_url, lyric, flag, username)


def save_random_music_in(username: str, flag=False) -> Tuple[List[Any], str, str]:
    """
    随机歌单中能播放的一首歌保存详细信息到数据库（直接播放）

    :param username: 用户名
    :param flag: （占位无用）
    :return: music_info, music_url, lyric
    """
    music_info, file_name, music_url, lyric, status = random_get_playlist_music(username)
    if music_url == '' and status:
        return save_random_music_in(username, flag)
    elif not status:
        write_console_info(username, '空闲歌单出错或没有歌曲')
        return [], '', ''
    else:
        # save_music_in_database(file_name, music_url, lyric, flag, username)
        UsersData.objects.filter(username=username).update(
            music_name=json.dumps([music_info]),
            now_music_url=music_url,
            lyric_name=json.dumps(lyric)
        )
        write_console_info(username, f'{file_name[0]}-{file_name[1]}: 播放url获取成功')
        if lyric:
            write_console_info(username, f'{file_name[0]}-{file_name[1]}: 歌词获取成功')
        else:
            write_console_info(username, f'{file_name[0]}-{file_name[1]}: 歌词获取失败')
        return music_info, music_url, lyric


def save_music_in_database(file_name, music_url, lyric, flag, username):
    result = UsersData.objects.get(username=username).music_name
    data = json.loads(result)
    if result == '[]' or flag:
        try:
            del data[0]
            data[0] = file_name
        except IndexError:
            data = [file_name]
        print(f"第一个data：{data}")
        data = json.dumps(data)
        UsersData.objects.filter(username=username).update(
            music_name=data, now_music_url=music_url,
            lyric_name=json.dumps(lyric)
        )
    else:
        if file_name != ['', '']:
            data.append(file_name)
            print(f"第二个data：{data}")
            data = json.dumps(data)
            UsersData.objects.filter(username=username).update(music_name=data)
        else:
            pass


def pre_music_set(music_info):
    file_name = music_info['file_name']
    try:
        music_name = file_name[0]
        artist = file_name[1] if file_name[1] != '' else '未指定'
    except IndexError:
        try:
            music_name = file_name[0]
        except IndexError:
            music_name = ''
        artist = '未指定'

    if artist == '' or artist == '未指定':
        if music_name in ['hop', 'HOP', 'Hop']:
            music_name = 'Hop'
            artist = 'Azis'
        elif music_name in ['希望之花', 'フリージア']:
            music_name = 'フリージア'
            artist = 'Uru'
    return music_name, artist


def smart_choose_load(username: str) -> list:
    """
    根据登录情况选择搜索顺序

    :param username: 用户名
    :return: 按顺序排列的关键字
    """
    kuWoApi.username = username
    qqMusicApi.username = username
    cloudMusicApi.username = username
    login_status = get_all_login_status(username)
    keys = login_status.keys()
    values = login_status.values()
    par = zip(keys, values)
    order_list = []
    for obj in par:
        if obj[1]:
            order_list.append(obj[0])
    order_list = order_list + ['cloud', 'qq', 'ku_wo']
    order_list = {}.fromkeys(order_list).keys()
    return list(order_list)


def use_search(who: str, music_name: str, artist: str, username: Union[str, int]) -> Tuple[list, str, dict]:
    if who == 'qq':
        file_name, music_url, lyric = qqMusicApi.search(music_name, artist)
    elif who == 'cloud':
        file_name, music_url, lyric = new_search_cloud_music(music_name, artist, username)
        if file_name == ['', '']:
            file_name, music_url, lyric = cloudMusicApi.search(music_name, artist)
    else:
        file_name, music_url, lyric = kuWoApi.search(music_name, artist)

    return file_name, music_url, lyric


def write_result(file_name, music_name, artist, username):
    if file_name == ['', '']:
        write_console_info(username, f'{music_name}-{artist}: ' + '歌曲获取失败')
    else:
        try:
            write_console_info(username, f'点歌成功：{file_name[0]}-{file_name[1]}')
        except IndexError:
            print('总结: 歌曲获取失败')
            write_console_info(username, f'{music_name}-{artist}: ' + '歌曲获取失败')
    # file_name[0] = re.sub(r"[%&',;=?()♂+$\x22]+", ' ', file_name[0])


def fuzzy_finder(user_input: str, collection: list):
    """模糊匹配"""
    suggestions = []
    pattern = '.*?'.join(re.sub(r"[%&',;=*?()♂+$\x22]+", ' ', user_input))  # Converts 'djm' to 'd.*?j.*?m'
    regex = re.compile(pattern)  # Compiles a regex.
    for item in collection:
        match = regex.search(item)  # Checks if the current item matches the regex.
        if match:
            suggestions.append((len(match.group()), match.start(), item))
    return [x for _, _, x in sorted(suggestions)]


def get_all_login_status(username):
    try:
        login_status = UsersData.objects.get(username=username).login_status
        if login_status is None or login_status == '':
            raise TypeError
        else:
            login_status = json.loads(login_status)
    except (TypeError, json.decoder.JSONDecodeError):
        login_status = {"qq": False, "cloud": False, "ku_wo": False}
        UsersData.objects.filter(username=username).update(login_status=json.dumps(login_status))
    return login_status


def create_zh_lyric_list(lyric: list):
    lyric_time_list = []
    for _ in lyric:
        if _ == '':
            continue
        lyric_time = create_time(_, '')
        if lyric_time:
            lyric_time_list.append(lyric_time)
    # return '\n'.join(lyric_time_list)
    lyric_time_list.sort(key=lambda x: x['id'])
    print(lyric_time_list)
    return lyric_time_list


def create_time(original: str, translation: str):
    try:
        zh_t = original.split(']')[-1]
        ls = original.split(']', 1)
        original = ls[0].split('[')[-1].split(':')
        mm = original[0]
        original = original[-1].split('.')
        ss = original[0]
        ms = original[-1]
        final_time = int(mm) * 60 + int(ss) + float('0.' + ms)
        # lyric_time_list.append(
        #     f'<li class="item" id="{final_time}"><span class="lyric">{zh_t}'
        #     '</span><span class="translation"><br/></span></li>')
        return {'id': final_time, 'original': zh_t, 'translation': translation}
    except ValueError:
        return False


def else_set(msg_json: dict, base_setting: dict, username):
    """判断是否满足其他设置的限制(已废弃)"""
    # medal_name = False
    # medal_of_user = False
    # use_room_medal = False
    # user_level_less = False
    medal_level_less = False
    setting = base_setting
    #  0牌子等级 1牌子名      2所属主播    3所属主播房间号
    # 牌子 [5, '秋林喵', '秋林音食Akibaya', 21914650, 6126494, '', 0, 6126494, 6126494, 6126494, 0, 1, 8100585]
    print(msg_json)
    medal = msg_json['medal']
    user_level = msg_json['user_level']  # 用户等级 [20, 0, 6406234, '>50000']
    try:
        # 设置的牌子名是否符合
        if setting['medal_name'] == '':
            medal_name = True
        else:
            medal_name = medal[1] == setting['medal_name']
        # 此牌子是否属于设置的主播
        if setting['medal_of_user'] == '':
            medal_of_user = True
        else:
            medal_of_user = medal[2] == setting['medal_of_user']
        # 使用此房间的勋章
        """if setting['use_room_medal']:
            if setting['room'] == str(medal[3]):
                use_room_medal = True
        else:
            use_room_medal = True"""
        # 直播牌子等级是否大于设置值
        try:
            try:
                medal_level_less = medal[0] >= int(setting['medal_level_less'])
            except ValueError:
                medal_level_less = True
        except IndexError:
            if medal == [] and (setting['medal_level_less'] == '0' or setting['medal_level_less'] == 0):
                medal_level_less = True
    except IndexError:
        medal_name = True
        medal_of_user = True
        use_room_medal = True
        user_level_less = True
        medal_level_less = True
    # 直播用户等级是否大于设置值
    try:
        user_level_less = user_level[0] >= int(setting['user_level_less'])
    except [ValueError, IndexError]:
        user_level_less = True
    f = medal_name and medal_of_user and medal_level_less and user_level_less
    print(f)
    if not f:
        name = msg_json['nickname']
        write_console_info(username, f'用户 {name} 的歌曲将被排除')
    return f
    # return True


def hmac_sha256_encrypt(key: str, data: str):
    key = key.encode('utf-8')
    data = data.encode('utf-8')
    encrypt_data = hmac.new(key, data, digestmod=hashlib.sha256).hexdigest()
    return encrypt_data


def check_sign(raw_get: dict, sign: str):
    """old: Caller, Mid, RoomId, Timestamp
       new: Caller, Code, Mid, Timestamp"""
    add_str = ''
    # secret = 'NPRZADNURSKNGYDFMDKJOOTLQMGDHL'
    secret = 'MITKtf7BboK08hiaqCB2POOf9pZ4nZ'
    for i, obj in enumerate(raw_get.items()):
        if i:
            add_str += '\n'
        add_str += f'{obj[0]}:{obj[1]}'
    print(add_str)
    encrypt_data = hmac_sha256_encrypt(secret, add_str)
    print(encrypt_data)
    return encrypt_data == sign


def cloud_music_filter(raw, artist, username):
    song_list = raw['result']['songs']
    for music_dict in song_list:  # 遍历所有歌曲信息字典列表
        if artist != '未指定' and artist != '':  # 指定了歌手
            for now_artist in music_dict['ar']:  # 遍历当前歌曲字典里的所有歌手
                if (artist in now_artist['name']) or (artist.upper() in now_artist['name'].upper()):
                    return new_cloud_music_download(music_dict, username)
        else:  # 未指定歌手
            return new_cloud_music_download(music_dict, username)
    return ['', ''], '', ''


def new_cloud_music_download(music_dict, username):
    music_id = music_dict['id']
    url = new_cloud_music_get_url(music_id)['data'][0]['url']
    if url is None:  # 地址为空
        write_console_info(username, '地址获取失败，可能为vip歌曲')
        file_name = ['', '']
        url = ''
        lyric = ''
    else:
        music_name = music_dict['name']
        artist = []  # 所有统计歌手
        for now_artist in music_dict['ar']:
            artist.append(now_artist['name'])
        artist = ', '.join(artist)  # 合成歌手字符串
        music_name = music_name.replace('/', '-').replace('\\', '-')
        artist = artist.replace('/', '-').replace('\\', '-').replace('♂', '')
        file_name = [music_name, artist]
        try:
            lyric = lyric_filter(new_cloud_music_lyric_download(music_id))
        except KeyError:
            lyric = ''
    return file_name, url, lyric


def lyric_filter(raw):
    try:
        r_lyric = raw['lrc']['lyric']  # 歌词字符串原文
    except KeyError:
        return []
    r_lyric = r_lyric.split('\n')
    try:
        zh = raw['tlyric']['lyric']  # 中文
        if zh == '':
            return create_zh_lyric_list(r_lyric)
        if zh[0] == ' ':
            return create_zh_lyric_list(r_lyric)
        zh = zh.split('\n')
        lyric_time_list = []
        for i, _ in enumerate(zh):
            if _ and not _ == ' ':
                ls = _.split(']', 1)
                for _ in r_lyric:
                    if ls[0] in _:
                        lyric_time_list.append(create_time(_, ls[1]))
        return lyric_time_list
    except KeyError:
        return create_zh_lyric_list(r_lyric)


def get_websocket_info(app_id, code: str) -> dict:
    """
    获取长链接信息

    :param app_id: 项目id
    :param code: 用户身份码
    :return: 长连信息、场次信息和主播信息字典
    """
    return bili_auth.post_request('v2/app/start', params={'code': code, 'app_id': app_id}, timeout=10)


def send_batch_heartbeat(game_ids: list):
    bili_auth.post_request('v2/app/batchHeartbeat', params={'game_ids': game_ids})
    ...


def send_heartbeat(game_id: str):
    bili_auth.post_request('', params={'game_id': game_id})


def close_websocket(app_id: int, game_id: str):
    bili_auth.post_request('/v2/app/end', params={'app_id': app_id, 'game_id': game_id})
    ...


def login_cloud_music(username):
    return cloudMusicLogin.get_qrcode(username)


def new_search_cloud_music(music_name, artist, username):
    # get_global_session_manager_from_database(username)
    try:
        result = cloudsearch.get_search_result(keyword=music_name, username=username)
    except (KeyError, TypeError):
        return ['', ''], '', ''
    return cloud_music_filter(result, artist, username)


def get_cloud_music_real_status(username):
    return cloudMusicLogin.get_current_login_status(username)


def get_qq_music_real_status(username):
    return qqMusicApi.get_music_url_with_cookie(username, '000NqZLy2lfXjT')


def get_qq_music_playlist(username):
    return qqMusicApi.my_playlist(username)


def get_qq_music_playlist_info(playlist_id):
    return qqMusicApi.playlist_info(playlist_id)


def get_cloud_music_playlist(username):
    cloudsearch.load_cookies(username)
    return cloud_user.GetUserPlaylists(pyncm.GetCurrentSession().uid)


def get_cloud_music_playlist_info(username, playlist_id):
    cloudsearch.load_cookies(username)
    return cloud_playlist.GetPlaylistInfo(playlist_id)


def cloud_music_use_id_get_music_info(music_ids):
    # cloudsearch.load_cookies(username)
    # id_list_len = len(music_ids)
    # last_index = 0
    # new_id_list = []
    # for i in range(20, id_list_len, 20):
    #     new_id_list.append(music_ids[last_index:i])
    # if id_list_len > 20:
    #     times = id_list_len // 20
    #     mod_times = id_list_len % 20
    #
    #     ...
    music_detail = cloud_track.GetTrackDetail(music_ids)
    return music_detail['songs']


@WeapiCryptoRequest
def new_cloud_music_get_url(music_id):
    return 'https://music.163.com/weapi/song/enhance/player/url', {'ids': [music_id], 'br': 128000}


@WeapiCryptoRequest
def new_cloud_music_lyric_download(music_id):
    return 'https://music.163.com/weapi/song/lyric', {'id': music_id, 'lv': -1, 'tv': -1}


if __name__ == '__main__':
    login_cloud_music('')

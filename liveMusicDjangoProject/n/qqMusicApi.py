import json
import math
import random
import hashlib
import requests

import utils
from liveMusicDjangoProject.n.qqMusicLoggedApi import QQ_Music
from pyncm import load_response

try:
    import django

    try:
        from TestModel.models import UsersData, UsersInfo
        from liveMusicDjangoProject.n import main_class
    except django.core.exceptions.ImproperlyConfigured:
        print('数据库配置文件有误')
except (AttributeError, ModuleNotFoundError):
    print('模块缺失，未导入数据库')

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/84.0.4147.135 Safari/537.36 Edg/84.0.522.63",
}

lyric_headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) '
                  'Chrome/84.0.4147.135 Safari/537.36 Edg/84.0.522.63',
    'referer': 'https://y.qq.com/',
    'cookie': 'RK=b9nw4IyFcN; ptcz=453a9af684fd144148a3bd146d14b786da8c0e2bf16b83d9826f58b54ca743d6; '
              'pgv_pvid=5287766404; fqm_pvqid=774f2c77-02a3-4581-a59c-c739dac1a67c; ts_uid=8193348720; '
              'fqm_sessionid=ed1651ca-6183-4fc5-9572-0a2512d4954e; pgv_info=ssid=s7503829760; '
              'ts_refer=www.baidu.com/link; _qpsvr_localtk=0.733734194870088; login_type=1; '
              'qm_keyst=Q_H_L_5iYLuFB8rvzVlgewRals6_tLegLxVfA9Rw2AnQX-pG6eAhZFx2poRRg; '
              'qm_keyst=Q_H_L_5iYLuFB8rvzVlgewRals6_tLegLxVfA9Rw2AnQX-pG6eAhZFx2poRRg; '
              'psrf_qqrefresh_token=556F969B2944F720F9F45B18D25C594D; psrf_access_token_expiresAt=1654743767; '
              'tmeLoginType=2; wxunionid=; psrf_qqopenid=BDB834E8F25C2F2AD2267E6E987D1B21; '
              'psrf_musickey_createtime=1646967767; euin=oKCkowEP7Kvsoc**; '
              'psrf_qqaccess_token=A5161E046FC0472BBDD0D1D5A3714F34; psrf_qqunionid=16BBC0D8F12EB1FD7419CD2224284C82; '
              'uin=1652945462; qqmusic_key=Q_H_L_5iYLuFB8rvzVlgewRals6_tLegLxVfA9Rw2AnQX-pG6eAhZFx2poRRg; '
              'wxrefresh_token=; wxopenid=; ts_last=y.qq.com/n/ryqq/player '
}

load_lyric_url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'

search_url = 'https://c.y.qq.com/splcloud/fcgi-bin/smartbox_new.fcg'

login_session = requests.session()

username = ''


def search(music_name: str, artist: str, model=False):
    """通过歌曲名搜索歌曲、歌词下载"""
    if artist == '未指定':
        search_content = music_name
    else:
        search_content = f'{music_name} {artist}'
    search_params = {
        '_': 1646977050167,
        'cv': 4747474,
        'ct': 24,
        'format': 'json',
        'inCharset': 'utf-8',
        'outCharset': 'utf-8',
        'notice': 0,
        'platform': 'yqq.json',
        'needNewCode': 1,
        'uin': 1652945462,
        'g_tk_new_20200303': 680048994,
        'g_tk': 680048994,
        'hostUin': 0,
        'is_xml': 0,
        'key': search_content
    }
    try:
        music_dict = json.loads(login_session.get(url=search_url, headers=headers, params=search_params).text)
        music_dict = music_dict['data']['song']['itemlist'][0]
        file_name, song_mid = get_music_info(music_dict)
        sip = 'https://dl.stream.qqmusic.qq.com/'
        music_url = get_music_url(song_mid)
        if music_url != sip:
            lyric = search_lyric(song_mid)
        else:
            music_url = get_music_url_with_cookie(username, song_mid)
            if music_url != sip:
                lyric = search_lyric(song_mid)
            else:
                file_name = ['', '']
                music_url = ''
                lyric = ''
    except (KeyError, IndexError):
        if not model:
            file_name, music_url, lyric = search(music_name, '未指定', True)
        else:
            file_name = ['', '']
            music_url = ''
            lyric = ''
    if not model:
        print(file_name)
        print(music_url)
    return file_name, music_url, lyric


def get_music_dict(music_name, artist, model=False) -> dict:
    if artist == '未指定':
        search_content = music_name
    else:
        search_content = f'{music_name} {artist}'
    search_params = {
        '_': 1646977050167,
        'cv': 4747474,
        'ct': 24,
        'format': 'json',
        'inCharset': 'utf-8',
        'outCharset': 'utf-8',
        'notice': 0,
        'platform': 'yqq.json',
        'needNewCode': 1,
        'uin': 1652945462,
        'g_tk_new_20200303': 680048994,
        'g_tk': 680048994,
        'hostUin': 0,
        'is_xml': 0,
        'key': search_content
    }
    try:
        raw_music_dict = json.loads(login_session.get(url=search_url, headers=headers, params=search_params).text)
        # music_dict = raw_music_dict['data']['song']['itemlist'][0]
        for music_dict in raw_music_dict['data']['song']['itemlist']:
            if artist != '未指定':
                if artist in music_dict['singer']:
                    return music_dict
            else:
                return music_dict
            ...
    except (KeyError, IndexError):
        if not model:
            music_dict = get_music_dict(music_name, artist, True)
        else:
            music_dict = {}
        return music_dict


def get_music_info(music_dict):
    song_mid = music_dict['mid']
    music_name = music_dict['name']
    # artist = '/'.join(music_dict['singer'])
    artist = music_dict['singer']
    file_name = [music_name, artist]
    return file_name, song_mid


def get_music_url(song_mid):
    load_music_url = f'https://u.y.qq.com/cgi-bin/musicu.fcg?format=json&data=%7B%22req_0%22:%7B%22module%22:%22vkey' \
                     f'.GetVkeyServer%22,%22method%22:%22CgiGetVkey%22,%22param%22:%7B%22guid%22:%22358840384%22,' \
                     f'%22songmid%22:%5B%22{song_mid}%22%5D,%22songtype%22:%5B0%5D,%22uin%22:%221443481947%22,' \
                     f'%22loginflag%22:1,%22platform%22:%2220%22%7D%7D,%22comm%22:%7B%22uin%22:%2218585073516%22,' \
                     f'%22format%22:%22json%22,%22ct%22:24,%22cv%22:0%7D%7D'
    music_dict = json.loads(login_session.get(url=load_music_url, headers=headers).text)
    purl = music_dict['req_0']['data']['midurlinfo'][0]['purl']
    return f'https://dl.stream.qqmusic.qq.com/{purl}'


def get_music_url_with_cookie(str_username, song_mid):
    qq = QQ_Music()
    qq._cookies = load_response(str_username)['qq']['cookie']
    music_url = qq.get_music_url(song_mid)
    return music_url


def my_playlist(str_username):
    qq = QQ_Music()
    qq._cookies = load_response(str_username)['qq']['cookie']
    result = qq.get_play_list()
    # playlist_info = qq.get_playlist_info(result['data']['disslist'][4]['tid'])
    return result


def playlist_info(playlist_id):
    qq = QQ_Music()
    return qq.get_playlist_info(playlist_id)


def search_lyric(song_mid: str):
    lyric_params = {
        '_': 1646977050167,
        'cv': 4747474,
        'ct': 24,
        'format': 'json',
        'inCharset': 'utf-8',
        'outCharset': 'utf-8',
        'notice': 0,
        'platform': 'yqq.json',
        'needNewCode': 1,
        'uin': 1652945462,
        'g_tk_new_20200303': 680048994,
        'g_tk': 680048994,
        'hostUin': 0,
        'is_xml': 0,
        'songmid': song_mid,
        'nobase64': 1,
    }
    lyric_dict = json.loads(login_session.get(url=load_lyric_url, headers=lyric_headers, params=lyric_params).text)
    lyric = lyric_dict['lyric']
    translate = lyric_dict['trans']
    if translate == '':
        return utils.create_zh_lyric_list(lyric.split('\n'))
    else:
        lyric_time_list = []
        lyric = lyric.split('\n')
        translate = translate.split('\n')
        for i, _ in enumerate(translate):
            if _ and not _ == ' ':
                ls = _.split(']', 1)
                for _ in lyric:
                    if ls[0] in _:
                        zh_t = _.split(']')[-1]
                        _ = ls[0].split('[')[-1].split(':')
                        mm = _[0]
                        _ = _[-1].split('.')
                        ss = _[0]
                        ms = _[-1]
                        try:
                            SS = int(mm) * 60 + int(ss) + float('0.' + ms)
                        except ValueError:
                            continue
                        # lyric_time_list.append(
                        #     f'<li class=\"item\" id=\"{SS}\"><span class=\"lyric\">{zh_t}'
                        #     f'</span><span class=\"translation\"><br/>{ls[1]}</span></li>')
                        lyric_time_list.append({'id': SS, 'original': zh_t, 'translation': ls[1]})
        # return ''.join(lyric_time_list)
        return lyric_time_list


if __name__ == '__main__':
    search('恋', '星野源')

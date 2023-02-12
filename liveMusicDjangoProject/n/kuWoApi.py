import json
import time

import requests

import utils

"""
try:
    from django.db.models.functions import Concat
    from TestModel.models import UsersData, UsersInfo
    from liveMusicDjangoProject.n import main_class
except django.core.exceptions.ImproperlyConfigured:
    pass"""

username = ''

headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) "
                      "Chrome/84.0.4147.135 Safari/537.36 Edg/84.0.522.63",
        "Cookie": "_ga=GA1.2.1083049585.1590317697; _gid=GA1.2.2053211683.1598526974; _gat=1; "
                  "Hm_lvt_cdb524f42f0ce19b169a8071123a4797=1597491567,1598094297,1598096480,1598526974; "
                  "Hm_lpvt_cdb524f42f0ce19b169a8071123a4797=1598526974; kw_token=HYZQI4KPK3P",
        "Referer": "http://www.kuwo.cn/search/list?key=%E5%91%A8%E6%9D%B0%E4%BC%A6",
        "csrf": "HYZQI4KPK3P",
    }


def ku_wo_api(music_name: str):
    # 请求头

    # 参数列表
    params = {
        "key": music_name,
        # 页数
        "pn": "1",
        # 音乐数
        "rn": "40",
        "httpsStatus": "1",
        "reqId": "cc337fa0-e856-11ea-8e2d-ab61b365fb50",
    }
    # 创建列表,后面下载需要
    music_list = []
    url = "http://www.kuwo.cn/api/www/search/searchMusicBykeyWord?"
    res = requests.get(url=url, headers=headers, params=params)
    res.encoding = "utf-8"
    text = res.text
    # 转成json数据
    try:
        json_list = json.loads(text)
    except:
        return music_list
    try:
        data_pack = json_list["data"]["list"]
    except KeyError:
        print(u'kuWoApi.ku_wo_api.dataPack: 数据获取失败')
        if not username == '':
            utils.write_console_info(username, '数据获取失败')
        data_pack = []
    except Exception as e:
        print(u'搜索时发生错误')
        if not username == '':
            utils.write_console_info(username, '搜索时发生错误')
        print(u'\nkuWoApi.ku_wo_api.dataPack: ' + str(e))
        data_pack = []
    # 遍历拿到所需要的数据，音乐名称，歌手，id...
    for i in data_pack:
        # 音乐名
        music_name = i["name"]
        # 歌手
        music_singer = i["artist"]
        # 待会需要的id先拿到
        rid = i["rid"]
        # 把数据存到字典方便下载时查找
        music_dict = {
            "name": music_name.replace('!', '！').replace('?', '？').replace('(', '（').replace(')', '）').replace('♂', ''),
            "singer": music_singer,
            "mid": rid}
        music_list.append(music_dict)
    # 看看真实数据数量
    return music_list


def get_playlist_info(playlist_id):
    # 参数列表
    music_list = []
    r = get_playlist_music_info("1", playlist_id)
    print(r)
    total = r['total']
    # music_list += r['musicList']
    for music_dict in r['musicList']:
        music_list.append(music_dict)
    times = total // 100 + 1
    mod_time = total % 100
    for i in range(2, times):
        time.sleep(0.5)
        r = get_playlist_music_info(i, playlist_id)
        # music_list += r['musicList']
        for music_dict in r['musicList']:
            music_list.append(music_dict)
        time.sleep(0.5)
    if mod_time != total:
        r = get_playlist_music_info(times, playlist_id)
        # music_list += r['musicList']
        for music_dict in r['musicList']:
            music_list.append(music_dict)
    print(music_list)
    return music_list


def get_playlist_music_info(i, playlist_id):
    params = {
        "pid": playlist_id,
        # 页数
        "pn": i,
        # 音乐数
        "rn": "100",
        "httpsStatus": "1",
        "reqId": "cc337fa0-e856-11ea-8e2d-ab61b365fb50",
    }
    r = requests.get('http://www.kuwo.cn/api/www/playlist/playListInfo', params=params, headers=headers)
    if r.status_code == 504:
        time.sleep(5)
        r = requests.get('http://www.kuwo.cn/api/www/playlist/playListInfo', params=params, headers=headers)
    r = r.json()['data']
    return r


def search(music_name: str, artist: str):
    music_list = []
    music_name = music_name.replace('!', '！').replace('?', '？').replace('(', '（').replace(')', '）').replace('♂', '')
    file_name, url, lyric = ['', ''], '', ''
    # 使用酷我音乐
    try:
        music_list = ku_wo_api(music_name)
    except json.decoder.JSONDecodeError:
        print(u'网页解析错误，正在重试')
        if not username == '':
            utils.write_console_info(username, '网页解析错误，正在重试')
        time.sleep(1)
        music_list = ku_wo_api(music_name)
        pass
    except KeyError:
        print(u'键错误，正在重试')
        if not username == '':
            utils.write_console_info(username, '键错误，正在重试')
        time.sleep(1)
        music_list = ku_wo_api(music_name)
    except Exception as e:
        print(u'搜索时发生错误', 2)
        if not username == '':
            utils.write_console_info(username, '搜索时发生错误')
        print(u'\nkuWoApi.search.music_list: ' + str(e))
    collection = []
    for info in music_list:
        music = info['name'].replace('!', '！').replace('?', '？').replace('(', '（').replace(')', '）').replace('♂', '')
        # artist = music_dict['ar'][0]['name']
        collection.append(music.upper())
    sug = utils.fuzzy_finder(music_name.upper(), collection)
    if sug:
        for info in music_list:
            if sug[0] == info['name'].upper():
                if artist != '未指定':
                    if (artist in info['singer']) or (artist.upper() in info['singer'].upper()):
                        file_name, url, lyric = down(info['name'], info['singer'], info)
                        break
                else:
                    artist = info['singer']
                    file_name, url, lyric = down(info['name'], artist, info)
                    break
    return file_name, url, lyric


def get_music_dict(music_name: str, artist: str):
    music_list = []
    music_name = music_name.replace('!', '！').replace('?', '？').replace('(', '（').replace(')', '）').replace('♂', '')
    file_name, url, lyric = ['', ''], '', ''
    # 使用酷我音乐
    try:
        music_list = ku_wo_api(music_name)
    except json.decoder.JSONDecodeError:
        print(u'网页解析错误，正在重试')
        if not username == '':
            utils.write_console_info(username, '网页解析错误，正在重试')
        time.sleep(1)
        music_list = ku_wo_api(music_name)
        pass
    except KeyError:
        print(u'键错误，正在重试')
        if not username == '':
            utils.write_console_info(username, '键错误，正在重试')
        time.sleep(1)
        music_list = ku_wo_api(music_name)
    except Exception as e:
        print(u'搜索时发生错误', 2)
        if not username == '':
            utils.write_console_info(username, '搜索时发生错误')
        print(u'\nkuWoApi.search.music_list: ' + str(e))
    collection = []
    for info in music_list:
        music = info['name'].replace('!', '！').replace('?', '？').replace('(', '（').replace(')', '）').replace('♂', '')
        # artist = music_dict['ar'][0]['name']
        collection.append(music.upper())
    sug = utils.fuzzy_finder(music_name.upper(), collection)
    info = {}
    flag = False
    if sug:
        for info in music_list:
            if sug[0] == info['name'].upper():
                if artist != '未指定':
                    if (artist in info['singer']) or (artist.upper() in info['singer'].upper()):
                        # file_name, url, lyric = down(info['name'], info['singer'], info)
                        flag = True
                        break
                else:
                    # artist = info['singer']
                    # file_name, url, lyric = down(info['name'], artist, info)
                    flag = True
                    break
    else:
        return music_list[0]
    if flag:
        return info
    else:
        return {}


def get_music_info(music_dict):
    file_name = [music_dict['name'], music_dict['singer']]
    mid = music_dict['mid']
    return file_name, mid


def down(music_name, artist, info):
    music_name = music_name.replace('/', '-').replace('\\', '-')
    artist = artist.replace('/', '-').replace('\\', '-')
    file_name = [music_name, artist]
    mid = info['mid']
    api_music = f"http://www.kuwo.cn/api/v1/www/music/playUrl?mid={mid}&type=music&" \
                "httpsStatus=1&reqId=ef5637b1-3be4-11ec-a82d-9dc83a3a5b8d "
    api_res = requests.get(url=api_music)
    # print(api_res.text)
    try:
        music_url = json.loads(api_res.text)["data"]["url"]
    except json.decoder.JSONDecodeError:
        print('地址获取失败')
        if not username == '':
            utils.write_console_info(username, '地址获取失败')
        return '', '', ''
    except KeyError:
        print('错误信息: ' + json.loads(api_res.text)["msg"])
        if not username == '':
            utils.write_console_info(username,
                                     f'{music_name}-{artist}: ' + json.loads(api_res.text)["msg"].split('，')[0])
        return '', '', ''
    lyric = get_lyric(info['mid'])
    return file_name, music_url, lyric


def get_music_url(mid):
    api_music = f"http://www.kuwo.cn/api/v1/www/music/playUrl?mid={mid}&type=music&" \
                f"httpsStatus=1&reqId=ef5637b1-3be4-11ec-a82d-9dc83a3a5b8d "
    api_res = requests.get(url=api_music)
    # print(api_res.text)
    music_url = json.loads(api_res.text)["data"]["url"]
    return music_url


def get_lyric(mid):
    url = 'http://m.kuwo.cn/newh5/singles/songinfoandlrc?' \
          f'musicId={mid}&httpsStatus=1&reqId=4959aa60-3be7-11ec-b3ca-7b5d4924aa6e'
    r = requests.get(url).json()
    try:
        lyric = r['data']['lrclist']
    except KeyError:
        return ''
    n = 0
    lyric_list = []
    lrc_time = [-1]
    try:
        for _ in lyric:
            if float(_['time']) == lrc_time[-1]:
                try:
                    lyric_list.append({'str_lyric': _['lineLyric'].replace('\u3000', ''),
                                       'str_time': float(_['time'])})
                except IndexError:
                    continue
                l1 = lyric_list[-2]
                l2 = lyric_list[-3]
                lyric_list.remove(l1)
                lyric_list.remove(l2)
                l = {'str_lyric': '\n'.join([l2['str_lyric'], l1['str_lyric']]),
                     'str_time': l2['str_time']}
                lyric_list.insert(-1, l)
                lrc_time.append(float(_['time']))
                n = 1
            else:
                lyric_list.append({'str_lyric': _['lineLyric'].replace('\u3000', ''),
                                   'str_time': float(_['time'])})
                lrc_time.append(float(_['time']))
        if n:
            l1 = lyric_list[-1]
            l2 = lyric_list[-2]
            lyric_list.remove(l1)
            lyric_list.remove(l2)
            l = {'str_lyric': '\n'.join([l2['str_lyric'], l1['str_lyric']]),
                 'str_time': l2['str_time']}
            lyric_list.insert(-1, l)
    except TypeError:
        if not username == '':
            utils.write_console_info(username, '歌词解析错误')
        return ''
    lyrics = []
    for lyric_dict in lyric_list:

        str_lyric = lyric_dict['str_lyric'].split('\n')
        str_time = lyric_dict['str_time']
        lyric = str_lyric[0]
        try:
            translation = str_lyric[1]
            # lyrics.append(f'<li class="item" id="{str_time}"><span class="lyric">{lyric}'
            #               f'</span><span class="translation"><br/>{translation}</span></li>')
            lyrics.append({'id': str_time, 'original': lyric, 'translation': translation})
        except IndexError:
            # lyrics.append(f'<li class="item" id="{str_time}"><span class="lyric">{lyric}'
            #               '</span><span class="translation"><br/></span></li>')
            lyrics.append({'id': str_time, 'original': lyric, 'translation': ''})
    # return ''.join(lyrics)
    return lyrics


if __name__ == '__main__':
    get_playlist_info(3356722926)

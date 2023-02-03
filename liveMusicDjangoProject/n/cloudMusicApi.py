import re
import json
import utils
import base64
import random
import requests
from binascii import hexlify
"""
use pip install Crypto
on Windows:
    pip install pycryptodome
on Linux:
    pip install pycrypto
"""
from Crypto.Cipher import AES
try:
    import django
    try:
        from TestModel.models import UsersData, UsersInfo
        from liveMusicDjangoProject.n import main_class
    except django.core.exceptions.ImproperlyConfigured:
        print('数据库配置文件有误')
except (AttributeError, ModuleNotFoundError):
    print('模块缺失，未导入数据库')


username = ''


headers = {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip,deflate,sdch',
    'Accept-Language': 'zh-CN,zh;q=0.8,gl;q=0.6,zh-TW;q=0.4',
    'Connection': 'keep-alive',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Host': 'music.163.com',
    'Referer': 'https://music.163.com/#/search/m/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.71'
                  ' Safari/537.36 Edg/94.0.992.38',
    'Cookie': '_iuqxldmzr_=32;_ntes_nnid=6a2d3b7278f578d71b1233125b23c3a0,'
              '1632216503600;_ntes_nuid=6a2d3b7278f578d71b1233125b23c3a0 ;NMTID=00OsaDLkGLz5FOad0B9mnHWx9q1X'
              '-IAAAF8B69Yvw;WNMCID=ovbpoc.1632216504414.01.0;WEVNSM=1.0.0;WM_TID=6LJBRxlzfpRFQBUFFBc%2Bc2qzRAMHmOQC'
              ';JSESSIONID-WYYY=6lvskTjAg5Yu7vf0ktNb6pgoJJTD6hIMctnQKE35RhcCEtFen3DYWnmBAGlos3K7c6enUWxlHJkSdD'
              '%5CY1gnhZ09HX%2F6VU4s0tM5%5CuPCMbERIwwS9yCjdIBk%2BCy6EByPxc1dsAuJTZFrzrEfsmeIQJ3%2B9H1'
              '%2BfqsJZggUHiwIKjWAK4WZh%3A1633706640182;WM_NI=82hf1R6EzpwpeB1F6h2X59YyGlUvu1qStTh0IT5'
              '%2F2kHd0D3sTtKRgxpUexJ3uUItGtZzzBUe%2FhormjsOqfzQSS%2BGt2tG0BUDYdk6u4maLaMq63Hy5xOpCGQzrUIe%2FlEPTUs'
              '%3D;WM_NIKE=9ca17ae2e6ffcda170e2e6ee96ed4aba8a87d9ce4ff1ac8ea7c55b829f8abab5348cb98e82c748989196aaf12'
              'af0fea7c3b92afceea887b45af69bb691f67ca79effa7b564f288fbdadc7385b49b97f83bb38dbcb5eb3c8b8cfbd0b1618cbc'
              '00a5b27998ac85b3e674b48bab99c939b78b8795c6809aa6b6a3d86fedb8a193f062b191bf87f95b918de5a8f73ab89900a3d'
              '8509bbca5d7f840afbf8482d07bf6ed889ab8748db08da8d472b28b8786ae6887909cb6f237e2a3 '
}


def get_random_str(n):
    str1 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    random_str = ''
    for i in range(n):
        index = random.randint(0, len(str1) - 1)
        random_str += str1[index]
    return random_str


def aes_encrypt(text: str, key: str):  # text是要加密的密文，key是密钥
    iv = b'0102030405060708'
    pad = 16 - len(text) % 16
    text = text + chr(2) * pad
    encryptor = AES.new(key.encode(), AES.MODE_CBC, iv)
    encryptor_str = encryptor.encrypt(text.encode())
    result_str = base64.b64encode(encryptor_str).decode()
    return result_str


def rsa_encrypt(text: str):  # text是16位的随机字符串
    pub_key = '010001'  # js中的e
    # js中的f
    modulus = '00e0b509f6259df8642dbc35662901477df22677ec152b' \
              '5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e41762' \
              '9ec4ee341f56135fccf695280104e0312ecbda92557c93870114a' \
              'f6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe487' \
              '5d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7 '
    text = text[::-1]
    result = pow(int(hexlify(text.encode()), 16), int(pub_key, 16), int(modulus, 16))
    return format(result, 'x').zfill(131)


# b函数，两次AES加密
def get_aes(text: str, random_str: str):
    first_aes = aes_encrypt(text, key='0CoJUm6Qyw8W8jud')  # key是固定的，相当于g
    second_aes = aes_encrypt(first_aes, random_str)
    return second_aes


# 获取加密的参数
def get_post_data(text: str, random_str: str):
    params = get_aes(text, random_str)
    encSecKey = rsa_encrypt(random_str)
    return {'params': params, 'encSecKey': encSecKey}


def get_song_list(song_name, random_str: str):
    # 要加密的字符串
    text = {"hlpretag": "<span class=\"s-fc7\">", "hlposttag": "</span>", "s": song_name, "type": "1", "offset": "0",
            "total": "true", "limit": "30", "csrf_token": ""}
    text = json.dumps(text)
    data = get_post_data(text, random_str)
    url = 'https://music.163.com/weapi/cloudsearch/get/web?csrf_token='
    # url = 'https://music.163.com/weapi/search/suggest/web?csrf_token='
    return post_requests(url, data)


def post_requests(url: str, data: dict):
    session = requests.Session()
    session.headers.update(headers)
    req = session.post(url, data=data)
    try:
        req = req.json()
    except json.decoder.JSONDecodeError:
        print(req.text)
        req = {}
    except Exception as e:
        print('发生未知错误')
        if not username == '':
            utils.write_console_info(username, '请求发生错误')
        print('\ncloudMusicApi.post_request: ' + str(e))
    return req


def get_song_url(song_id: int, random_str: str):
    # 'MD 128k': 128000, 'HD 320k': 320000
    text = {'ids': [song_id], 'br': 128000, 'csrf_token': ''}
    text = json.dumps(text)
    data = get_post_data(text, random_str)
    url = 'https://music.163.com/weapi/song/enhance/player/url?csrf_token='
    return post_requests(url, data)


def get_song_lyric(song_id: int, random_str: str):
    """获取歌词"""
    text = {'id': song_id, 'lv': -1, 'tv': -1, 'csrf_token': ''}
    text = json.dumps(text)
    data = get_post_data(text, random_str)
    url = 'https://music.163.com/weapi/song/lyric?csrf_token='
    return post_requests(url, data)


def search(music_name: str, artist: str, model=False):
    """通过歌曲名搜索歌曲、歌词下载"""
    try:
        # 如果是搜索的是歌名id
        s_name = int(music_name)
        print(f'直接搜索id：{s_name}')
        random_str = get_random_str(16)  # 随机字符串
        music_list = get_song_list(s_name, random_str)  # 获取到的原始歌曲字典
        music_list = music_list['result']['songs']
        file_name, url, lyric = down(music_list[0], random_str)
        return file_name, url, lyric
    except KeyError:
        if not model:
            file_name, url, lyric = search(music_name, artist, True)
            return file_name, url, lyric
    except ValueError:
        music_name = music_name.replace('!', '！').replace('?', '？').replace('(', '（').replace(')', '）').replace('♂', '')
        if model:
            # 第二次搜索尝试
            music_name = music_name.replace(' ', '%20')  # 音乐名里的空格转成url格式
        file_name = ['', '']
        url = ''  # 获取到的 歌曲名 赋初值
        lyric = ''  # 获取到的 歌词 赋初值
        random_str = get_random_str(16)  # 随机字符串
        music_list = get_song_list(music_name, random_str)  # 获取到的原始歌曲字典
        if music_list != {}:
            # 返回不为空
            try:
                music_list = music_list['result']['songs']  # 所有歌曲信息字典列表
            except KeyError:
                print(f"cloudMusicApi无返回{model}")
                if not model:
                    file_name, url, lyric = search(music_name, artist, True)  # 使用模式二再搜一次
                return file_name, url, lyric
            try:
                # 如果是搜索的是歌名id
                s_name = int(music_name)
                print(f'直接搜索id：{s_name}')
                file_name, url, lyric = down(music_list[0], random_str)
            except ValueError:
                # 普通歌名
                collection = []  # 待选歌名列表(大写)
                for music_dict in music_list:
                    music = re.sub(r"[%&',;*=*?()♂+$\x22]+", ' ', music_dict['name'])
                    # artist = music_dict['ar'][0]['name']
                    collection.append(music)
                music_name = music_name.replace('%20', ' ')  # 把空格转回来
                # sug = utils.fuzzy_finder(re.sub(r"[%&',;=?()♂+$\x22]+", ' ', music_name), collection)
                sug = utils.fuzzy_finder(music_name, collection)  # 模糊搜索，返回递减的推荐列表
                if sug:  # 不为空
                    for music_dict in music_list:  # 遍历所有歌曲信息字典列表
                        if music_dict['name'] in sug:  # 为了尽可能能播放出歌曲，只要在推荐列表里的都算
                            if artist != '未指定':  # 指定了歌手
                                for now_artist in music_dict['ar']:  # 遍历当前歌曲字典里的所有歌手
                                    if (artist in now_artist['name']) or \
                                            (artist.upper() in now_artist['name'].upper()):  # 只要有指定的歌手就算
                                        file_name, url, lyric = down(music_dict, random_str)  # 下载歌曲并返回歌名和歌词
                                        return file_name, url, lyric  # 返回歌名和歌词
                            else:
                                # 未指定歌手
                                file_name, url, lyric = down(music_dict, random_str)
                                break

        else:
            # 返回为空
            print(f"cloudMusicApi无返回{model}")
            if not model:  # 如果这次不是用模式二搜索
                file_name, url, lyric = search(music_name, artist, True)  # 用模式二搜索
                return file_name, url, lyric  # 返回歌名和歌词
        return file_name, url, lyric  # 返回歌名和歌词


def get_music_dict(music_name, artist, model=False):
    music_dict = {}
    flag = False
    try:
        # 如果是搜索的是歌名id
        s_name = int(music_name)
        print(f'直接搜索id：{s_name}')
        random_str = get_random_str(16)  # 随机字符串
        music_list = get_song_list(s_name, random_str)  # 获取到的原始歌曲字典
        music_list = music_list['result']['songs']
        return music_list[0]
    except KeyError:
        if not model:
            return get_music_dict(music_name, artist, True)
    except ValueError:
        music_name = music_name.replace('!', '！').replace('?', '？').replace('(', '（').replace(')', '）').replace('♂', '')
        if model:
            # 第二次搜索尝试
            music_name = music_name.replace(' ', '%20')  # 音乐名里的空格转成url格式
        file_name = ['', '']
        url = ''  # 获取到的 歌曲名 赋初值
        lyric = ''  # 获取到的 歌词 赋初值
        random_str = get_random_str(16)  # 随机字符串
        music_list = get_song_list(music_name, random_str)  # 获取到的原始歌曲字典
        if music_list != {}:
            # 返回不为空
            try:
                music_list = music_list['result']['songs']  # 所有歌曲信息字典列表
            except KeyError:
                print(f"cloudMusicApi无返回{model}")
                if not model:
                    return get_music_dict(music_name, artist, True)  # 使用模式二再搜一次
            try:
                # 如果是搜索的是歌名id
                s_name = int(music_name)
                print(f'直接搜索id：{s_name}')
                return music_list[0]
            except ValueError:
                # 普通歌名
                collection = []  # 待选歌名列表(大写)
                for music_dict in music_list:
                    music = re.sub(r"[%&',;=?*()♂+$\x22]+", ' ', music_dict['name'])
                    # artist = music_dict['ar'][0]['name']
                    collection.append(music)
                music_name = music_name.replace('%20', ' ')  # 把空格转回来
                # sug = utils.fuzzy_finder(re.sub(r"[%&',;=?()♂+$\x22]+", ' ', music_name), collection)
                sug = utils.fuzzy_finder(music_name, collection)  # 模糊搜索，返回递减的推荐列表
                if sug:  # 不为空
                    for music_dict in music_list:  # 遍历所有歌曲信息字典列表
                        if re.sub(r"[%&',;=?*()♂+$\x22]+", ' ', music_dict['name']) in sug:  # 为了尽可能能播放出歌曲，只要在推荐列表里的都算
                            if artist != '未指定':  # 指定了歌手
                                for now_artist in music_dict['ar']:  # 遍历当前歌曲字典里的所有歌手
                                    if (artist in now_artist['name']) or \
                                            (artist.upper() in now_artist['name'].upper()):  # 只要有指定的歌手就算
                                        return music_dict
                            else:
                                # 未指定歌手
                                return music_dict
        else:
            # 返回为空
            print(f"cloudMusicApi无返回{model}")
            if not model:  # 如果这次不是用模式二搜索
                return get_music_dict(music_name, artist, True)  # 用模式二搜索
    if flag:
        return music_dict
    else:
        return {}


def down(music_dict: dict, random_str: str):
    music_id = music_dict['id']
    music_name = music_dict['name']
    artist = []  # 所有统计歌手
    for now_artist in music_dict['ar']:
        artist.append(now_artist['name'])
    artist = ', '.join(artist)  # 合成歌手字符串
    music_url = get_song_url(music_id, random_str)['data'][0]['url']
    if music_url is None:  # 地址为空
        utils.write_console_info(username, '地址获取失败，可能为vip歌曲')
        file_name = ['', '']
        music_url = ''
        lyric = ''
    else:
        music_name = music_name.replace('/', '-').replace('\\', '-')
        artist = artist.replace('/', '-').replace('\\', '-').replace('♂', '')
        file_name = [music_name, artist]

        try:
            lyric = search_lyric(music_id)
        except KeyError:
            lyric = ''
    return file_name, music_url, lyric


def get_music_info(music_dict):
    music_id = music_dict['id']
    music_name = music_dict['name']
    artist = []  # 所有统计歌手
    for now_artist in music_dict['ar']:
        artist.append(now_artist['name'])
    artist = ', '.join(artist)  # 合成歌手字符串
    return [music_name, artist], music_id


def search_lyric(song_id: int):
    """搜索歌词"""
    random_str = get_random_str(16)
    """
    {
    'sgc': False, 
    'sfy': False, 
    'qfy': False, 
    'transUser': {
        'id': 4608684, 
        'status': 99, 
        'demand': 1, 
        'userid': 264865011, 'nickname': 'IvanTeacup', 'uptime': 1548319117235
        }, 

    'lrc': {
        'version': 9, 
        'lyric': '[00:00.000] 作词 : 新田目翔\n
                  [00:00.473] 作曲 : 新田目翔\n
                  [00:00.946]\n
                  [00:26.368] きらり空に響く星の声\n
                  [00:34.967]\n
                  [00:45.625] ああ海を照らす 光を辿れたら\n
                  [00:49.977] 流れた星はどこへ行く？\n'
        }, 

    'tlyric': {
        'version': 5, 
        'lyric': '[by:IvanTeacup]\n
                  [00:26.368]晶莹闪烁在夜空 星星的声音\n
                  [00:45.625]啊 徇着照亮海面的那道光芒探寻\n'
        }, 
    'code': 200
    } """
    lrc = get_song_lyric(song_id, random_str)
    return utils.lyric_filter(lrc)
    # r_lyric = lrc['lrc']['lyric']  # 歌词字符串原文
    # r_lyric = r_lyric.split('\n')
    # try:
    #     zh = lrc['tlyric']['lyric']  # 中文
    #     if zh == '':
    #         return utils.create_zh_lyric_list(r_lyric)
    #     if zh[0] == ' ':
    #         return utils.create_zh_lyric_list(r_lyric)
    #     zh = zh.split('\n')
    #     lyric_time_list = []
    #     for i, _ in enumerate(zh):
    #         if _ and not _ == ' ':
    #             ls = _.split(']', 1)
    #             for _ in r_lyric:
    #                 if ls[0] in _:
    #                     # zh_t = _.split(']')[-1]
    #                     # _ = ls[0].split('[')[-1].split(':')
    #                     # mm = _[0]
    #                     # _ = _[-1].split('.')
    #                     # ss = _[0]
    #                     # ms = _[-1]
    #                     # SS = int(mm) * 60 + int(ss) + float('0.' + ms)
    #                     # lyric_time_list.append(
    #                     #     f'<li class=\"item\" id=\"{SS}\"><span class=\"lyric\">{zh_t}'
    #                     #     f'</span><span class=\"translation\"><br/>{ls[1]}</span></li>')
    #                     lyric_time_list.append(utils.create_time(_, ls[1]))
    #     # return ''.join(lyric_time_list)
    #     return lyric_time_list
    # except KeyError:
    #     return utils.create_zh_lyric_list(r_lyric)

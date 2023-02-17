import base64
import hashlib
import json
import math
import random
import re
import time

import requests


class QQ_Music:
    def __init__(self):
        self._headers = {
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
            'Referer': 'https://y.qq.com/',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X; zh-CN) AppleWebKit/537.51.1 ('
                          'KHTML, like Gecko) Mobile/17D50 UCBrowser/12.8.2.1268 Mobile AliApp(TUnionSDK/0.1.20.3) '
        }
        self._cookies = {}

    def set_cookie(self, cookie):  # 网页Cookie转换到Python字典格式
        list_ret = {}
        cookie_list = cookie.split('; ')  # 分隔符
        for i in range(len(cookie_list)):
            list_1 = cookie_list[i].split('=')  # 分割等于后面的值
            list_ret[list_1[0]] = list_1[1]  # 加入字典
            if len(list_1) == 3:
                list_ret[list_1[0]] = list_1[1] + '=' + list_1[2]
        return list_ret

    def get_sign(self, data):  # QQMusic_Sign算法
        st = 'abcdefghijklmnopqrstuvwxyz0123456789'
        count = (math.floor(random.randint(10, 16)))
        sign = 'zzb'
        for i in range(count):
            sign += st[math.floor(random.randint(0, 35))]
        s = 'CJBPACrRuNy7' + data
        s_md5 = hashlib.md5(s.encode('utf-8')).hexdigest()
        sign += s_md5
        return sign

    def get_music_url(self, music_mid):  # 通过Mid获取音乐播放URL
        uin = ''.join(random.sample('1234567890', 10))  # UIN基本不校验,长度10就行,如果请求正常这是你的QQ号
        data = {
            "req": {
                "module": "CDN.SrfCdnDispatchServer",
                "method": "GetCdnDispatch",
                "param": {
                    "guid": "1535153710",
                    "calltype": 0,
                    "userip": ""
                }
            },
            "req_0": {
                "module": "vkey.GetVkeyServer",
                "method": "CgiGetVkey",
                "param": {
                    "guid": "1535153710",
                    "songmid": [music_mid],
                    "songtype": [0],
                    "uin": uin,
                    "loginflag": 1,
                    "platform": "20",
                }
            },
            "comm": {
                "uin": uin,
                "format": "json",
                "ct": 24,
                "cv": 0
            }
        }
        t = requests.get('https://u.y.qq.com/cgi-bin/musicu.fcg?data={}'.format(json.dumps(data)),
                         headers=self._headers, cookies=self._cookies)
        ret = json.loads(t.text)
        if ret['code'] == 500001:  # 如果返回500001表示提交的数据有问题或Cookie过期之类的(解析绿钻歌曲你不是绿钻也有可能给你这个)
            return 'Error'
        return 'https://dl.stream.qqmusic.qq.com/{}'.format(ret['req_0']['data']['midurlinfo'][0]['purl'])

    def get_play_list(self):
        uin = self._cookies.get('uin')
        print(uin)
        params = {
            'size': 11,
            'hostuin': uin,
            'inCharset': 'utf-8',
            'outCharset': 'utf-8',
            'r': int(time.time() * 1000),
        }
        result = requests.get('https://c.y.qq.com/rsc/fcgi-bin/fcg_user_created_diss', params=params,
                              headers=self._headers, cookies=self._cookies)
        result.encoding = 'utf-8'
        return result.json()

    def get_music_info(self, music_id):  # 通过音乐的ID获取歌曲信息
        uin = ''.join(random.sample('1234567890', 10))
        data = {"comm": {"cv": 4747474, "ct": 24, "format": "json", "inCharset": "utf-8", "outCharset": "utf-8",
                         "notice": 0, "platform": "yqq.json", "needNewCode": 1, "uin": uin,
                         "g_tk_new_20200303": 708550273, "g_tk": 708550273},
                "req_1": {"module": "music.trackInfo.UniformRuleCtrl", "method": "CgiGetTrackInfo",
                          "param": {"ids": [music_id], "types": [0]}}}
        ret = json.loads(requests.get(url='https://u.y.qq.com/cgi-bin/musicu.fcg?data={}'.format(json.dumps(data)),
                                      headers=self._headers, cookies=self._cookies).text)
        if ret['code'] == 500001:  # 如果返回 500001 代表提交的数据有问题
            return 'Error'
        return ret['req_1']['data']['tracks']  # 直接返回QQ音乐服务器返回的结果,和搜索返回的感觉差不多,直接返回tracks数组\

    def get_album_info(self, album_mid):  # 获取专辑信息
        uin = ''.join(random.sample('1234567890', 10))  # 和音乐的那个一样,uin随机10个数字就行
        data = {"comm": {"cv": 4747474, "ct": 24, "format": "json", "inCharset": "utf-8", "outCharset": "utf-8",
                         "notice": 0, "platform": "yqq.json", "needNewCode": 1, "uin": uin,
                         "g_tk_new_20200303": 708550273, "g_tk": 708550273},
                "req_1": {"module": "music.musichallAlbum.AlbumInfoServer", "method": "GetAlbumDetail",
                          "param": {"albumMid": album_mid}}}
        resp = json.loads(requests.get(url='https://u.y.qq.com/cgi-bin/musicu.fcg?data={}'.format(json.dumps(data)),
                                       headers=self._headers, cookies=self._cookies).text)
        if resp['code'] == 500001:  # 如果返回 500001 代表提交的数据有问题
            return 'Error'
        return resp

    def search_music(self, name, limit=20):  # 搜索歌曲,name歌曲名,limit返回数量
        return requests.get(url='https://shc.y.qq.com/soso/fcgi-bin/search_for_qq_cp?_=1657641526460&g_tk'
                                '=1037878909&uin=1804681355&format=json&inCharset=utf-8&outCharset=utf-8&notice=0'
                                '&platform=h5&needNewCode=1&w={}&zhidaqu=1&catZhida=1&t=0&flag=1&ie=utf-8&sem=1'
                                '&aggr=0&perpage={}&n={}&p=1&remoteplace=txt.mqq.all'.format(name, limit, limit),
                            headers=self._headers).json()['data']['song']['list']

    def get_playlist_info(self, playlist_id):  # 通过歌单ID获取歌单信息,songList返回的内容和搜索返回的差不多
        return json.loads(str(re.findall('window.__INITIAL_DATA__ =(.*?)</script>',
                                         requests.get(url='https://y.qq.com/n/ryqq/playlist/{}'.format(playlist_id),
                                                      headers=self._headers,
                                                      cookies=self._cookies).text)[0]).replace('undefined',
                                                                                               '"undefined"'))

    def get_playlist_info_num(self, playlist_id, song_num):  # 逐个获取歌单ID内容
        data = {
            "req_0": {
                "module": "srf_diss_info.DissInfoServer",
                "method": "CgiGetDiss",
                "param": {
                    "disstid": playlist_id,
                    "onlysonglist": 1,
                    "song_begin": song_num,
                    "song_num": 1000
                }
            },
            "comm": {
                "g_tk": 865217452,
                "uin": ''.join(random.sample('1234567890', 10)),
                "format": "json",
                "platform": "h5"
            }
        }
        resp = json.loads(requests.get(url='https://u.y.qq.com/cgi-bin/musicu.fcg?data={}'.format(json.dumps(data)),
                                       headers=self._headers, cookies=self._cookies).text)
        if resp['code'] == 500001:  # 如果返回500001, 代表提交的数据有问题
            return 'Error'
        return resp

    def get_recommended_playlist(self):  # 获取QQ音乐推荐歌单,获取内容应该和Cookie有关
        return json.loads(str(re.findall('window.__INITIAL_DATA__ =(.*?)</script>',
                                         requests.get(url='https://y.qq.com/n/ryqq/category',
                                                      headers=self._headers,
                                                      cookies=self._cookies).text)[0]).replace('undefined',
                                                                                               '"undefined"'))

    def get_lyrics(self, mid):  # 获取歌曲歌词信息
        return base64.b64decode(
            requests.get(url='https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?_={}'
                             '&format=json&loginUin={}&songmid={}'.format(time.time(),
                                                                          ''.join(random.sample('1234567890', 10)),
                                                                          mid),
                         headers=self._headers, cookies=self._cookies).json()['lyric']).decode('utf-8')

    def get_radio_info(self):  # 获取个性电台信息
        return json.loads(str(re.findall('window.__INITIAL_DATA__ =(.*?)</script>',
                                         requests.get(url='https://y.qq.com/n/ryqq/radio',
                                                      headers=self._headers,
                                                      cookies=self._cookies).text)[0]).replace('undefined',
                                                                                               '"undefined"'))

    def get_toplist_music(self):
        return json.loads(re.compile('firstPageData\\s=(.*?)\n').findall(
            requests.get(url='https://i.y.qq.com/n2/m/share/details/toplist.html?ADTAG=ryqq.toplist&type=0&id=4',
                         headers=self.headers).text)[0])

    def get_mv_url(self, vid):  # 获取MV信息,下载地址
        data = {"comm": {"ct": 6, "cv": 0, "g_tk": 1366999994, "uin": ''.join(random.sample('1234567890', 10)),
                         "format": "json", "platform": "yqq"},
                "mvInfo": {"module": "video.VideoDataServer", "method": "get_video_info_batch",
                           "param": {"vidlist": [vid],
                                     "required": ["vid", "type", "sid", "cover_pic", "duration", "singers",
                                                  "new_switch_str", "video_pay", "hint", "code", "msg", "name", "desc",
                                                  "playcnt", "pubdate", "isfav", "fileid", "filesize", "pay",
                                                  "pay_info", "uploader_headurl", "uploader_nick", "uploader_uin",
                                                  "uploader_encuin"]}},
                "mvUrl": {"module": "music.stream.MvUrlProxy", "method": "GetMvUrls",
                          "param": {"vids": [vid], "request_type": 10003, "addrtype": 3, "format": 264}}}
        print(json.dumps(data))
        return requests.post(url='https://u.y.qq.com/cgi-bin/musicu.fcg', data=json.dumps(data), timeout=1,
                             headers=self._headers).json()

    def get_singer_album_info(self, mid):
        uin = ''.join(random.sample('1234567890', 10))  # 和音乐的那个一样,uin随机10个数字就行
        data = {"req_0": {"module": "music.homepage.HomepageSrv", "method": "GetHomepageTabDetail",
                          "param": {"uin": uin, "singerMid": mid, "tabId": "album", "page": 0,
                                    "pageSize": 10, "order": 0}},
                "comm": {"g_tk": 1666686892, "uin": int(uin), "format": "json", "platform": "h5", "ct": 23}}
        resp = requests.get(url='https://u.y.qq.com/cgi-bin/musicu.fcg?data={}'.format(json.dumps(data)),
                            headers=self._headers, cookies=self._cookies).json()
        if resp['code'] == 500001:  # 如果返回500001代表提交的数据有问题
            return 'Error'
        return resp['req_0']['data']['list']

    @property
    def headers(self):
        return self._headers


if __name__ == '__main__':
    # import js2py
    #
    # with open('E:\PycharmProject\liveMusicDjangoProject_ACNTAA\liveMusicDjangoProject\static\js\others\qq_cookie.js',
    #           'r') as f:
    #     cou = f.read()
    # context = js2py.EvalJs()
    # context.execute(cou)
    # print(context.pgv_pvid())
    # print(context.fqm_pvqid())
    # print(context.fqm_sessionid())
    # # js = execjs.compile(cou)
    # # pgv_pvid = js.call('pgv_pvid')
    # # print(pgv_pvid)
    # response = json.loads(
    #     '{"qq": {"response": {"uin": "1652945462"}, "cookie": {"p_skey": "tv5Pr2Vv*wXjDvSf-41BexoVkz83aW9fCwnV6F3uzNI_", "p_uin": "o1652945462", "pt4_token": "XUSTiK*eG7ErG7fHO2iI72U653b8BQKUxPZM7jjVm5g_", "pt_login_type": "3", "pt_oauth_token": "X3s3*THf*QVk0qcv8pzZmeVKqqy1vGVn08ch1tyqcAqH3RWLtmzPnZdFiFoTCj7n6WDQzn6xZ3M_", "ETK": "", "pt2gguin": "o1652945462", "pt_clientip": "eab87855678376a1", "pt_guid_sig": "6cc104679194516a6abbe1946448797ffdbb1c3b6ce93e81dce6a999121c44e8", "pt_local_token": "-855032701", "pt_login_sig": "yjBH9PmEItY47Kr7Vv10yXxLPvmLyNIFUBNx7mgrgk9-6zqVBrOfJJhTELd6yEfW", "pt_recent_uins": "c036e5fd3dfdbc46cfdbc443f24c9051fe6e6eab274fc82eccad4adc1e374002fee9900fb145d7a1bf7e37b8782eb628beb19ccc7e0c8da0", "pt_serverip": "ca8509958274ef36", "ptnick_1652945462": "e899abe88d89e5b08fe78e8be5ad90", "qrsig": "dd8b165fab44026c2a6cd606ba2441ce631f22ea7af7108c3f1b58f1ef5d2435a47a264b877653b7abc6da9b02675d4be41be4596f8cf77ca5fcbc48313d3596", "superkey": "EckOVSoOP5h8uvrRc8ImGJ9HFE8C3ELCgCaEe2n7t1c_", "supertoken": "389109728", "superuin": "o1652945462", "uikey": "3785719a921edf88ea114b978f73623e034be180e18ef73253311f7ccb441953", "RK": "u8nwoqylPN", "ptcz": "2f9a423743bee6971dbd661f634ca01f330078d4117b29a8ab35ba2e1f2e5f8c"}}, "cloud": {"response": {"code": 200, "account": {"id": 448565825, "userName": "1_********201", "type": 1, "status": 0, "whitelistAuthority": 0, "createTime": 1490977660938, "tokenVersion": 0, "ban": 0, "baoyueVersion": -2, "donateVersion": 0, "vipType": 0, "anonimousUser": false, "paidFee": false}, "profile": {"userId": 448565825, "userType": 0, "nickname": "\u4e09_sheng", "avatarImgId": 18684001092650366, "avatarUrl": "http://p1.music.126.net/R3huoKtikhw1hYr4anXoHg==/18684001092650366.jpg", "backgroundImgId": 109951164362461565, "backgroundUrl": "http://p1.music.126.net/E0oBHrT-B7Dg6wB3ukN4oQ==/109951164362461565.jpg", "signature": "", "createTime": 1490977701123, "userName": "1_********201", "accountType": 1, "shortUserName": "********201", "birthday": -2209017600000, "authority": 0, "gender": 1, "accountStatus": 0, "province": 440000, "city": 440300, "authStatus": 0, "description": null, "detailDescription": null, "defaultAvatar": false, "expertTags": null, "experts": null, "djStatus": 0, "locationStatus": 10, "vipType": 0, "followed": false, "mutual": false, "authenticated": false, "lastLoginTime": 1665745071905, "lastLoginIP": "120.85.102.41", "remarkName": null, "viptypeVersion": 1592151753178, "authenticationTypes": 0, "avatarDetail": null, "anchor": false}}, "cookie": {"MUSIC_U": "10303084dc196a1655532d798ebc5b68b571ba4d2f33fb30f932898bbe8aa8bc993166e004087dd39c896227a8f0fd28594017a1031ad57c06f7ef33d3fbf57ea49fd53fbed1e5cea0d2166338885bd7", "NMTID": "00OmNrvmbZl8zBRsEZztV2V1BlZQjoAAAGD1iRTKg", "__csrf": "636cb30d9cb27ad80c4a7e5c628e2d58", "MUSIC_A_T": "1490977660938", "MUSIC_R_T": "1490977701123"}}, "ku_wo": {}}')
    # cookie = response['qq']['cookie']
    # uin = response['qq']['response']['uin']
    # qq = QQ_Music()
    # qq._cookies = qq.set_cookie(
    #     'qm_keyst=Q_H_L_5vDl0Adaj3anC9PqUrOmH1B6sdGtIkQjkWkPbSapuvwRuuiGug7jP7Q; uin=1652945462;')
    # print(qq.get_music_url('000NqZLy2lfXjT'))
    qq = QQ_Music()
    a = qq.get_playlist_info_num(8804199036, 0)
    print(a)

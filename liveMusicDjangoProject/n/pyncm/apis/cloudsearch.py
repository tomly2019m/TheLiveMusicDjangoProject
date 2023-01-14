# -*- coding: utf-8 -*-
"""网易云搜索 - Cloudsearch APIs"""
from .login import WriteLoginInfo
from . import WeapiCryptoRequest, load_response

SONG = 1
"""歌曲"""
ALBUM = 10
"""专辑"""
ARTIST = 100
"""艺术家"""
PLAYLIST = 1000
"""歌单®"""
USER = 1002
"""用户"""
MV = 1004
"""MV"""
LYRICS = 1006
"""歌词"""
DJ = 1009
"""电台"""
VIDEO = 1014
"""视频"""


@WeapiCryptoRequest
def get_search_result(keyword: str, stype: int = SONG, limit: int = 30, offset: int = 0, username: str = '') -> object:
    """网页端 - 搜索某类型关键字

    Args:
        keyword (str): 搜索关键字
        stype ([int, optional): 搜索类型 (cloudsearch.SONG/...). Defaults to SONG
        limit (int, optional): 单次获取量. Defaults to 30.
        offset (int, optional): 获取偏移数. Defaults to 0.
        username(str): 用户
    Returns:
        dict
    """
    load_cookies(username)
    return "/weapi/cloudsearch/get/web", {
        "s": str(keyword),
        "type": str(stype),
        "limit": str(limit),
        "offset": str(offset),
    }


def load_cookies(username):
    temp = load_response(username)
    response = temp['cloud']['response']
    cookie = temp['cloud']['cookie']
    WriteLoginInfo(response, cookie)

import copy
import math

import requests
import cv2
import itertools


def return_history(room_id: str):
    header = {
        'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) "
                      "Chrome/108.0.0.0 Safari/537.36 "
    }
    dan_mu_api = f'https://api.live.bilibili.com/xlive/web-room/v1/dM/gethistory?roomid={room_id}'
    return requests.get(url=dan_mu_api, headers=header, verify=False).json()['data']['room']  # 历史弹幕信息


def tes():
    print(cv2.INTER_AREA)


def rate(origin, user_input):
    right = 0
    for i, n in enumerate(user_input):
        try:
            right += 1 if origin[i] == n else 0
        except IndexError:
            break
    return right / len(origin)


def number_off(people: list, k: int) -> int:
    t_people = people
    while len(t_people) > 1:
        c = itertools.cycle(t_people)
        for i in range(k):
            t = next(c)
        index = t_people.index(t)
        t_people = t_people[index+1:] + t_people[:index]
    return t_people[0]


if __name__ == '__main__':
    # tes()
    # print(return_history('24701480'))
    print(rate('raidfd', 'raidfd'))
    print(*range(3))
    print(number_off([1, 2, 3, 4, 5, 6], 3))
    n = int(input())
    q = int(math.sqrt(n)) + 1
    break_flag = True
    for a in range(q):
        if break_flag:
            for b in range(q):
                a_b = math.pow(a, 2) + math.pow(b, 2)
                if a_b > n:
                    break
                if break_flag:
                    for c in range(q):
                        a_b_c = a_b + math.pow(c, 2)
                        if a_b_c > n:
                            break
                        p = math.sqrt(n - a_b_c)
                        if p == int(p):
                            print(a, b, c, int(p))
                            break_flag = False
                            break

# -*- coding: utf-8 -*-
import hashlib
import hmac
import json
import random
import time
from hashlib import sha256

import requests


def post_request(url: str, params: dict, timeout=None):
    """
    使用B站官方接口获取数据

    :params: url: 域名之后的链接
    :params: params: 要post的数据, 需包含app_id
    :return: 包含请求状态和内容的字典(status_code, content)
    """
    post_url = f"https://live-open.biliapi.com/{url}"
    # params = '{' + f'"room_id":{room_id}, "app_id":{app_id}' + '}'
    params = json.dumps(params)
    print(params)
    key = "LXQqjVjZRs2hcGHpMjR2bDuA"
    secret = "MITKtf7BboK08hiaqCB2POOf9pZ4nZ"

    md5 = hashlib.md5()
    md5.update(params.encode())
    ts = time.time()
    nonce = random.randint(1, 100000) + time.time()
    md5data = md5.hexdigest()
    header_map = {
        "x-bili-timestamp": str(int(ts)),
        "x-bili-signature-method": "HMAC-SHA256",
        "x-bili-signature-nonce": str(nonce),
        "x-bili-accesskeyid": key,
        "x-bili-signature-version": "1.0",
        "x-bili-content-md5": md5data,
    }

    header_list = sorted(header_map)
    header_str = ''

    for key in header_list:
        header_str = "{0}{1}:{2}\n".format(header_str, key, str(header_map[key]))
    header_str = header_str.rstrip("\n")

    app_secret = secret.encode()
    data = header_str.encode()
    signature = hmac.new(app_secret, data, digestmod=sha256).hexdigest()
    header_map["Authorization"] = signature
    header_map["Content-Type"] = "application/json"
    header_map["Accept"] = "application/json"

    r = requests.post(url=post_url, headers=header_map, data=params, verify=False, timeout=timeout)
    status_code = r.status_code
    content = json.loads(r.content.decode())
    print(content)
    print(status_code)
    return {'status_code': status_code, 'content': content}


if __name__ == '__main__':
    post_request('24032356', {'app_id': '1649539569084'})

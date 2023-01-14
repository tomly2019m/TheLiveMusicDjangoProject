import base64
import json
import threading
import time
from io import BytesIO

import qrcode

from pyncm import load_response
from pyncm.apis.login import LoginQrcodeUnikey, \
    LoginQrcodeCheck, GetCurrentLoginStatus, write_login_info_and_dump_to_database, WriteLoginInfo


def check_qr_status(uuid, username):
    break_time = 180
    while break_time:
        rsp = LoginQrcodeCheck(uuid)  # 检测扫描状态
        if rsp["code"] == 803:
            # 登录成功
            print(f"{rsp['code']} -- {rsp['message']}", "...")
            write_login_info_and_dump_to_database(GetCurrentLoginStatus(), username)
            # WriteLoginInfo(GetCurrentLoginStatus(), username)
            break
        elif rsp["code"] == 800:
            print('timeout')
            break
        time.sleep(1)
        break_time -= 1
    print('scan exited')


def get_qrcode(username):
    uuid = LoginQrcodeUnikey()["unikey"]  # 获取 UUID
    print("UUID", uuid)
    url = f"https://music.163.com/login?codekey={uuid}"  # 二维码内容即这样的 URL
    img = qrcode.make(url)
    bytesIO = BytesIO()
    img.save(bytesIO, format='JPEG')
    th = threading.Thread(target=check_qr_status, args=[uuid, username])
    th.start()
    return str(base64.b64encode(bytesIO.getvalue()), 'utf-8')


def get_current_login_status(username):
    try:
        temp = load_response(username)
        response = temp['cloud']['response']
        cookie = temp['cloud']['cookie']
        WriteLoginInfo(response, cookie)
        return GetCurrentLoginStatus()
    except json.decoder.JSONDecodeError:
        return {}


if __name__ == '__main__':
    get_qrcode('')

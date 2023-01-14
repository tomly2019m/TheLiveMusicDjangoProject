import base64
import random
import threading
import time
from urllib import parse

from requests.cookies import RequestsCookieJar

from liveMusicDjangoProject.n.qq_muisc_spider_master import util
from pyncm import dump_response
from qq_muisc_spider_master.qq_music import SpiderSession


def get_qq_qrcode(username):
    qq = Login()
    b64 = qq.get_qr_login_pic()
    th = threading.Thread(target=save_cookies, args=[qq, username])
    th.start()
    return b64


def save_cookies(qq, username):
    sessions = qq.login()
    if sessions:
        cookies = sessions.cookies.get_dict()
    else:
        cookies = {}
    if cookies != {}:
        dump_response('qq', {}, cookies, username)
    ...


class Login:
    """二维码扫码登陆"""

    def __init__(self, spider_session=SpiderSession):
        self.spider_session = spider_session()
        self.session = self.spider_session.get_session()
        self.pt = self.spider_session.get_pt()

    # 获取跳转链接
    def _get_polling_url(self, str_p):
        c = self.pt
        t = 'https://ssl.' if c['ptui']['isHttps'] else 'http://'
        t = t + 'ptlogin2.' + c['ptui']['domain'] + '/' + str_p + '?'
        t += 'appid=' + c['ptui']['appid'] + '&e=2&l=M&s=3&d=72&v=4&t=' + str(random.random())
        if c['ptui']['daid']:
            t += '&daid=' + c['ptui']['daid']
            # if s.isTim:
            # t += '&tim=1'
        if c['ptui']['pt_3rd_aid']:
            t += '&pt_3rd_aid=' + c['ptui']['pt_3rd_aid']
        return t

    # 获取pt_login2的地址
    def pt_login2(self):
        client_id = '100497308'
        s_url = 'https://graph.qq.com/oauth2.0/login_jump'
        s_url = 'https://xui.ptlogin2.qq.com/cgi-bin/xlogin?appid=716027609&daid=383&style=33&theme=2&login_text=%E6' \
                '%8E%88%E6%9D%83%E5%B9%B6%E7%99%BB%E5%BD%95&hide_title_bar=1&hide_border=1&target=self&s_url=' + \
                parse.quote(
                    s_url, safe='')
        s_url += '&pt_3rd_aid=' + parse.quote(client_id, safe='')
        dm_host = ''

        feed_back_link = 'https://support.qq.com/products/77942?customInfo=' \
                         f'{parse.quote(dm_host, safe="")}.appid{client_id}'
        s_url += ('&pt_feedback_link=' + parse.quote(feed_back_link, safe=''))
        return self.session.get(s_url)

    # 获取二维码登陆图片地址
    def get_qr_login_pic(self):
        url = self._get_polling_url('ptqrshow')
        response = self.session.get(url)
        return str(base64.b64encode(response.content), 'utf-8')

    def check(self):
        pt_login_sig = self.session.cookies.get('pt_login_sig')
        if pt_login_sig is None:
            pt_login_sig = self.pt['ptui']['login_sig']
        qrsig = self.session.cookies.get('qrsig')
        login_url = 'https://ssl.' if self.pt['ptui']['isHttps'] else 'http://'
        login_url += 'ptlogin2.' + self.pt['ptui']['domain'] + '/'
        t = 'ptqrlogin'
        login_url += t + '?'
        login_url += 'u1=' + parse.quote(self.pt['ptui']['s_url'], safe='')
        login_url += '&ptqrtoken=' + str(util.get_ptqrtoken(qrsig))
        login_url += '&ptredirect=' + str(self.pt['ptui']['target'])
        login_url += '&h=1&t=1&g=1&from_ui=1'
        login_url += '&ptlang=' + self.pt['ptui']['lang']
        login_url += '&action=0-0-' + str(int(time.time()))
        login_url += '&js_ver=' + self.pt['ptui']['ptui_version']
        login_url += '&js_type=1'
        login_url += '&login_sig=' + pt_login_sig
        login_url += '&pt_uistyle=' + self.pt['ptui']['style']
        login_url += '&aid=' + self.pt['ptui']['appid']
        login_url += '&daid=' + self.pt['ptui']['daid']
        login_url += '&pt_3rd_aid=' + self.pt['ptui']['pt_3rd_aid']
        resp = self.session.get(login_url)
        return resp

    def authorize(self):
        c = RequestsCookieJar()
        ui = util.guid()
        c.set('ui', ui, path='/', domain='graph.qq.co')
        self.session.cookies.update(c)

        cgi_url = 'https://graph.qq.com/oauth2.0/authorize'

        authorize_headers = {
            'User-Agent': util.get_user_agents(),
            'Referer': 'https://graph.qq.com/oauth2.0/show?which=Login&display=pc&response_type=code&client_id'
                       '=100497308&redirect_uri=https%3A%2F%2Fy.qq.com%2Fportal%2Fwx_redirect.html%3Flogin_type%3D1'
                       '%26surl%3Dhttps%253A%252F%252Fy.qq.com%252Fportal%252Fprofile.html%2523stat%253Dy_new.top'
                       '.user_pic%2526stat%253Dy_new.top.pop.logout%26use_customer_cb%3D0&state=state&display=pc',
            'Content-Type': 'application/x-www-form-urlencoded',
        }

        payload = {
            'response_type': 'code',
            'client_id': '100497308',
            'redirect_uri': 'https://y.qq.com/portal/wx_redirect.html?login_type=1&surl=https%3A%2F%2Fy.qq.com%2F%23'
                            '&use_customer_cb=0',
            'scope': '',
            'state': 'state',
            'switch': '',
            'from_ptlogin': '1',
            'src': '1',
            'update_auth': '1',
            'openapi': '80901010',
            'g_tk': util.get_g_tk(self.session.cookies.get('p_skey')),
            'auth_time': str(int(time.time())),
            'ui': ui
        }
        url_encode = parse.urlencode(payload)
        post = self.session.post(cgi_url, headers=authorize_headers, data=url_encode)
        return post

    # 获取认证的cookie
    def get_login_cookie(self, code):
        login_headers = {
            'User-Agent': util.get_user_agents(),
            'Referer': 'https://y.qq.com/',
            'Content-Type': 'application/x-www-form-urlencoded',
        }
        g_tk = util.get_g_tk(self.session.cookies.get('p_skey'))
        param = {
            "comm": {"g_tk": g_tk, "platform": "yqq", "ct": 24, "cv": 0},
            "token": {"module": "QQConnectLogin.LoginServer", "method": "QQLogin", "param": {"code": code}}
        }
        response = self.session.post('https://u.y.qq.com/cgi-bin/musicu.fcg', headers=login_headers,
                                     data=util.dumps_without_space(param))
        return response

    # 登陆
    def login(self):
        # 检测登陆
        break_time = 60
        while break_time:
            check = self.check()
            values = check.cookies.values()
            if len(values) > 0:
                # 字节转化为字符串
                s = str(check.content)
                split = s.split(',')
                # 跳转返回的url(获取响应头的cookies)
                self.session.get(split[2].replace('\'', ''))
                break
            time.sleep(3)
            break_time -= 1
        # 登陆认证获取cookie
        authorize = self.authorize()
        code = util.get_code(authorize.url)
        if not code:
            return False
        return self.get_login_cookie(code)


if __name__ == '__main__':
    ...

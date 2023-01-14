import time
import utils
import threading
from TestModel.models import UsersInfo

room_workers_dict = {}  # 房间的进程字典


class RoomWorker(threading.Thread):

    def __init__(self, room_id: str, username: str, base_setting: dict, debug_flag=False, parent=None):
        super(RoomWorker, self).__init__(parent)
        # 设置工作状态与初始num数值
        self.working = True
        self.room_id = room_id
        self.debug_flag = debug_flag
        self.username = username
        # self.base_setting = {}
        self.base_setting = base_setting

    def run(self) -> None:
        while self.working:
            utils.get_history(self.room_id, self.username, self.base_setting, self.debug_flag)
            time.sleep(3)
        """try:
            while self.working:
                utils.get_history(self.room_id, self.username, self.base_setting, self.debug_flag)
                time.sleep(3)
        except:
            print('\n\nmain_class.py.RoomWorker:请检测网络连接后重启！\n\n')
            UsersInfo.objects.filter(username=self.username).update(is_running=0)"""


class RoomKiller(threading.Thread):

    def __init__(self, parent=None):
        super(RoomKiller, self).__init__(parent)
        self.working = True

    def run(self) -> None:
        while self.working:
            time.sleep(21600)  # 6h
            result = UsersInfo.objects.all()
            for is_running_lyric_url in result:
                try:
                    room_workers_dict[is_running_lyric_url.lyric_url].working = is_running_lyric_url.is_running
                    print(f'set {is_running_lyric_url}')
                except KeyError:
                    pass
            pass


class UserTimer(threading.Thread):

    def __init__(self, username: str, base_setting: dict, parent=None):
        super(UserTimer, self).__init__(parent)
        self.working = True
        self.username = username
        self.base_setting = base_setting

    def run(self):
        if self.username not in utils.user_count_down:
            utils.user_count_down.append(self.username)
            try:
                times = float(self.base_setting['cold_time'])
            except (ValueError, KeyError):
                times = 0
            time.sleep(times*60)
            utils.user_count_down.remove(self.username)

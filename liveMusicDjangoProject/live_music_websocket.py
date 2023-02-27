#  Copyright (c) TLittlePrince 2023.
import asyncio
import json

from asgiref.sync import sync_to_async
from channels.exceptions import StopConsumer
from channels.generic.websocket import AsyncWebsocketConsumer
from TestModel.models import UsersData, UsersInfo, WebsocketClients
from liveMusicDjangoProject.n import utils
from liveMusicDjangoProject.view import update_play_data
from channels.db import database_sync_to_async

timer_dict = {}
flag = 1


@sync_to_async
def check_auth(raw_content: dict):
    """
    检查用户合法性
    :param raw_content: where
    :return:
    """
    url = raw_content['url'].split('_')[0]
    who = ''

    try:
        if raw_content['where'] in ['music', 'music_url']:
            who = 'music'
            result = UsersInfo.objects.get(music_url=url)
        elif raw_content['where'] in ['lyric', 'lyric_url']:
            who = 'lyric'
            result = UsersInfo.objects.get(lyric_url=url)
        elif raw_content['where_url'] in ['music', 'music_url']:
            who = 'music'
            result = UsersInfo.objects.get(music_url=url)
        elif raw_content['where_url'] in ['lyric', 'lyric_url']:
            who = 'lyric'
            result = UsersInfo.objects.get(lyric_url=url)
        else:
            return None, None, None, False, ''
    except KeyError:
        if raw_content['where_url'] in ['music', 'music_url']:
            who = 'music'
            result = UsersInfo.objects.get(music_url=url)
        elif raw_content['where_url'] in ['lyric', 'lyric_url']:
            who = 'lyric'
            result = UsersInfo.objects.get(lyric_url=url)
        else:
            return None, None, None, False, ''

    username = result.username
    music_url = result.music_url
    lyric_url = result.lyric_url
    return username, music_url, lyric_url, True, who


@sync_to_async
def get_channel_name(key_names):
    channel_names = []
    for key_name in key_names:
        try:
            channel_name = WebsocketClients.objects.get(key_name=key_name).channel_name
        except WebsocketClients.DoesNotExist:
            channel_name = None
        channel_names.append(channel_name)
    return channel_names


@sync_to_async
def save_database(key_name, channel_name):
    try:
        print('qqqqqq')
        WebsocketClients.objects.get(key_name=key_name)
        WebsocketClients.objects.filter(key_name=key_name).update(channel_name=channel_name)
    except WebsocketClients.DoesNotExist:
        print('aaaaaa')
        print(key_name)
        new_channel = WebsocketClients(key_name=key_name, channel_name=channel_name)
        new_channel.save()


class Timer:

    def __init__(self, timeout: int, callback):
        """
        异步定时器

        :param timeout: 时间s
        :param callback: 回调函数
        """
        self._timeout = timeout
        self._callback = callback
        self._task = None

    def start(self):
        self._task = asyncio.ensure_future(self._job())

    async def _job(self):
        await asyncio.sleep(self._timeout)
        await self._callback()

    def cancel(self):
        self._task.cancel()


class LiveMusicWebsocket(AsyncWebsocketConsumer):

    async def connect(self):
        key_name = self.get_key_name()
        # await self.channel_layer.group_add(key_name, self.channel_name)
        print(f'key_name:[{self.get_key_name()}],channel_name:[{self.channel_name}]8888888888')
        await save_database(key_name, self.channel_name)
        await self.accept()
        print(f'key_name:[{self.get_key_name()}],channel_name:[{self.channel_name}] connected')
        # timer = Timer(90, self.close)
        # timer_dict[key_name] = timer
        # timer.start()
        # print(timer_dict)
        # print(f'当前全部组:{self.channel_layer}')

    async def disconnect(self, code):
        print(code)
        for group in self.groups:
            await self.channel_layer.group_discard(group, self.channel_name)
        raise StopConsumer()
        # await self.discard_group()

    async def receive(self, text_data=None, bytes_data=None):
        try:
            receive_data = json.loads(text_data)
            key_name = self.get_key_name()
            print(receive_data['type'], key_name, receive_data)
            await self.channel_layer.send(self.channel_name, receive_data)
            # await self.channel_layer.group_send(key_name, receive_data)
        except (json.decoder.JSONDecodeError, KeyError):
            await self.send('{"status": false}')
            await self.close()

    def get_key_name(self):
        """获取组(会话)的id, 要保证唯一"""
        try:
            return self.scope['url_route']['kwargs']['key_name']
        except KeyError:
            self.close()

    async def discard_group(self):
        group_id = self.get_key_name()
        print('MY DISCONNECT', group_id)
        await self.channel_layer.group_discard(group_id, self.channel_name)
        await self.close()
        try:
            timer_dict[group_id].cancel()
            del timer_dict[group_id]
        except KeyError:
            pass

    async def heartbeat(self, event):
        group_id = self.get_key_name()
        print('now_heart', len(timer_dict))
        # try:
        #     timer = timer_dict[group_id]
        #     timer.cancel()
        #     timer.start()
        #     await self.send('{"status": true}')
        # except KeyError:
        #     timer = Timer(90, self.close)
        #     timer_dict[group_id] = timer
        #     timer.start()

    async def send_content_to_group(self, group_ids, data):
        for group_id in group_ids:
            if group_id in timer_dict:
                print('send', group_id)
                # await self.channel_layer.group_send(group_id, {'type': 'send_content', 'content': json.dumps(data)})

    async def send_content_to(self, channel_names, data):
        for channel_name in channel_names:
            if channel_name:
                info = {'type': 'send_content', 'content': data}
                await self.channel_layer.send(channel_name, info)

    async def send_content(self, event):
        raw_content = event['content']
        await self.send(json.dumps(raw_content))

    async def connectivity_test_send(self, event):
        """
        连通性测试控制台: 发送， 歌名/歌词:接收
        :param event:
        :return:
        """
        raw_content = event['content']
        username, music_url, lyric_url, check_status, who = await check_auth(raw_content)
        info = {'type': 'connectivity_test_send', 'content': {}}
        send_ids = []
        music_channel, lyric_channel = await get_channel_name([music_url, lyric_url])
        if check_status:
            # if music_url in timer_dict:
            #     send_ids.append(music_url)
            # if lyric_url in timer_dict:
            #     send_ids.append(lyric_url)
            # if len(send_ids):
            #     # 至少有一个在心跳
            #     info['content']['random_num'] = raw_content['random_num']
            #     await self.send_content_to(send_ids, info)
            # else:
            #     info['type'] = 'connectivity_test_receive'
            #     info['content']['music'], info['content']['lyric'] = -1, -1
            #     await self.send(json.dumps(info))
            info['content']['random_num'] = raw_content['random_num']
            # await self.send_content_to_group(send_ids, info)
            await self.send_content_to([music_channel, lyric_channel], info)
        else:
            # 发回给控制台说不合法
            info['type'] = 'connectivity_test_receive'
            info['content']['music'], info['content']['lyric'] = 'illegal', 'illegal'
            await self.send(json.dumps(info))

    async def connectivity_test_receive(self, event):
        """
        连通性测试控制台: 接收， 歌名/歌词: 发送
        :param event:
        :return:
        """
        raw_content = event['content']
        username, music_url, lyric_url, check_status, who = await check_auth(raw_content)
        info = {'type': 'connectivity_test_receive', 'content': {}}
        if check_status:
            info['content'][who] = raw_content['random_num']
            console_channel_names = await get_channel_name([f'{music_url}_x1', f'{lyric_url}_x1'])
            await self.send_content_to(console_channel_names, info)
            # await self.send_content_to_group([f'{music_url}_x1', f'{lyric_url}_x1'], info)
        else:
            await self.send('{"type": "connectivity_test_receive", "content": "illegal"}')

    async def start_getting(self, event):
        raw_content = event['content']
        username, music_url, lyric_url, check_status, who = await check_auth(raw_content)
        info = ''
        if check_status:
            data = int(raw_content['data'])
            if data:
                await database_sync_to_async(UsersInfo.objects.filter(username=username).update)(is_running=1)
                info = '获取开始'
                await sync_to_async(utils.write_console_info)(username, '获取开始')

            else:
                await database_sync_to_async(UsersInfo.objects.filter(username=username).update)(is_running=0)
                info = '获取已停止'
                await sync_to_async(utils.write_console_info)(username, '获取已停止')
            channels_names = await get_channel_name([music_url, lyric_url, f'{music_url}_x1', f'{lyric_url}_x1'])
            await self.send_content_to(channels_names, {'type': 'start_getting', 'content': {'is_running': data}})
            # await self.send_content_to_group([music_url, lyric_url, f'{music_url}_x1', f'{lyric_url}_x1'],
            #                                  {'type': 'start_getting', 'content': {'is_running': data}})
        await self.send(json.dumps({'status': check_status, 'info': info}))
        await self.send_console_info(username, music_url, lyric_url)

    async def next_music(self, event):
        raw_content = event['content']
        username, music_url, lyric_url, check_status, who = await check_auth(raw_content)
        if check_status:
            try:
                music_info_list = raw_content['music_name_list']
            except KeyError:
                result = await database_sync_to_async(UsersData.objects.get)(username=username)
                music_info_list = json.loads(result.music_name)
            try:
                del music_info_list[0]
                music_info_list, url, lyric = await sync_to_async(utils.save_music_info_in_database)(
                    music_info_list[0], username, True, music_info_list
                )
            except IndexError:
                music_info_list, url, lyric = await self.random_next_music(username)
            channels_names = await get_channel_name([music_url, lyric_url, f'{music_url}_x1', f'{lyric_url}_x1'])
            await self.send_content_to(channels_names, {'type': 'next_music',
                                                        'content': {'music_info_list': music_info_list,
                                                                    'now_music_url': url,
                                                                    'lyric': lyric}})
            # await self.send_content_to_group([music_url, lyric_url, f'{music_url}_x1', f'{lyric_url}_x1'],
            #                                  {'type': 'next_music',
            #                                   'content': {'music_info_list': music_info_list, 'now_music_url': url,
            #                                               'lyric': lyric}})
            await self.send_console_info(username, music_url, lyric_url)

    @staticmethod
    async def random_next_music(username):
        try:
            result = await database_sync_to_async(UsersData.objects.get)(username=username)
            user_playlist = json.loads(result.user_playlist)
        except (json.decoder.JSONDecodeError, KeyError):
            user_playlist = {'status': False}
        if user_playlist['status']:
            music_info_list, url, lyric = await sync_to_async(utils.save_random_music_in)(username, True)
            return [music_info_list], url, lyric
        else:
            await database_sync_to_async(UsersData.objects.filter(username=username).update)(music_name='[]',
                                                                                             now_music_url='',
                                                                                             lyric_name='[{}]')
            return [], '', ''

    async def play(self, event):
        raw_content = event['content']
        where = raw_content['where']
        data = int(raw_content['data'])
        send_content = {'type': where, 'content': {}}
        username, music_url, lyric_url, check_status, who = await check_auth(raw_content)
        send_content['content'][where] = data
        if where != 'replay':
            await sync_to_async(update_play_data)(username, where, data)
        channels_names = await get_channel_name([music_url, lyric_url, f'{music_url}_x1', f'{lyric_url}_x1'])
        await self.send_content_to(channels_names, send_content)
        # await self.send_content_to_group([music_url, lyric_url, f'{music_url}_x1', f'{lyric_url}_x1'], send_content)

    @staticmethod
    async def pretreatment(username, raw_content):
        try:
            music_name, artist = raw_content['music_name'], raw_content['artist']
            result = await database_sync_to_async(UsersData.objects.get)(username=username)
            music_name_list = json.loads(result.music_name)
            file_name = [music_name, artist]
            i = 0
            flag = False
            for i, music_info in enumerate(music_name_list):
                if i == 0:
                    continue
                if music_info['file_name'] == file_name:
                    flag = True
                    break
            # if flag and request.GET['index']:
            if flag:
                select_obj = music_name_list.pop(i)
            else:
                select_obj = {'file_name': [music_name, artist]}
            return username, select_obj, music_name_list
        except KeyError:
            return '', {}, []

    async def del_music(self, event):
        raw_content = event['content']
        send_content = {'type': 'base_status', 'content': {}}
        username, music_url, lyric_url, check_status, who = await check_auth(raw_content)
        username, select_obj, music_name_list = await self.pretreatment(username, raw_content)
        if username == '' and music_name_list == []:
            send_content['content']['status'] = False
        else:
            send_content['content']['status'] = True
            info = {'type': 'del_music',
                    'content': {'music_info_list': music_name_list}}
            await database_sync_to_async(UsersData.objects.filter(username=username).update)(
                music_name=json.dumps(music_name_list)
            )
            channels_names = await get_channel_name([music_url, f'{music_url}_x1', f'{lyric_url}_x1'])
            await self.send_content_to(channels_names, info)
            # await self.send_content_to_group([music_url, lyric_url, f'{music_url}_x1', f'{lyric_url}_x1'], info)
        # await self.send_content_to_group([music_url, lyric_url, f'{music_url}_x1', f'{lyric_url}_x1'], send_content)
        channels_names = await get_channel_name([music_url, lyric_url, f'{music_url}_x1', f'{lyric_url}_x1'])
        await self.send_content_to(channels_names, send_content)
        await self.send_console_info(username, music_url, lyric_url)

    async def move_music(self, event):
        raw_content = event['content']
        send_content = {'type': 'base_status', 'content': {}}
        username, music_url, lyric_url, check_status, who = await check_auth(raw_content)
        if check_status:
            music_name_index = int(raw_content['index'])
            username, select_obj, music_name_list = await self.pretreatment(username, raw_content)
            if music_name_index == -1:
                music_info_list, url, lyric = await sync_to_async(utils.save_music_info)(select_obj, username)
                info = {'type': 'add_music',
                        'content': {'music_info_list': music_info_list, 'now_music_url': url, 'lyric': lyric}}
                if len(music_info_list) == 1:
                    info['type'] = 'next_music'
                    channels_names = await get_channel_name(
                        [music_url, lyric_url, f'{music_url}_x1', f'{lyric_url}_x1'])
                    # await self.send_content_to_group([music_url, lyric_url, f'{music_url}_x1', f'{lyric_url}_x1'], \
                    # info)
                    await self.send_content_to(channels_names, info)
                else:
                    # await self.send_content_to_group([music_url, f'{music_url}_x1', f'{lyric_url}_x1'], info)
                    channels_names = await get_channel_name([music_url, f'{music_url}_x1', f'{lyric_url}_x1'])
                    await self.send_content_to(channels_names, info)
            else:
                if music_name_index == 1:
                    music_name_list.insert(1, select_obj)
                    await self.next_music(
                        {'content': {'music_name_list': music_name_list, 'url': music_url, 'where': 'music'}}
                    )
                else:
                    music_name_list.insert(1, select_obj)
                    await database_sync_to_async(UsersData.objects.filter(username=username).update)(
                        music_name=json.dumps(music_name_list)
                    )
                    info = {'type': 'add_music',
                            'content': {'music_info_list': music_name_list}}
                    channels_names = await get_channel_name([music_url, f'{music_url}_x1', f'{lyric_url}_x1'])
                    await self.send_content_to(channels_names, info)
            send_content['content']['status'] = True
        else:
            send_content['content']['status'] = False
        # await self.send_content_to_group([music_url, f'{music_url}_x1', f'{lyric_url}_x1'], send_content)
        channels_names = await get_channel_name([music_url, f'{music_url}_x1', f'{lyric_url}_x1'])
        await self.send_content_to(channels_names, send_content)
        await self.send_console_info(username, music_url, lyric_url)

    async def send_console_info(self, username, music_url, lyric_url):
        result = await database_sync_to_async(UsersData.objects.get)(username=username)
        info = json.loads(result.console_info)
        # await self.send_content_to_group([f'{music_url}_x1', f'{lyric_url}_x1'],
        #                                  {'type': 'console_info', 'content': {'console_info': info}})
        channels_names = await get_channel_name([f'{music_url}_x1', f'{lyric_url}_x1'])
        await self.send_content_to(channels_names, {'type': 'console_info', 'content': {'console_info': info}})

    async def send_message_to(self, event):
        ...

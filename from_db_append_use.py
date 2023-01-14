import json
import time
import random
from liveMusicDjangoProject.n.bili_auth import post_request

with open('users_info.json', 'r+', encoding='utf-8') as f_obj:
    data = json.load(f_obj)
data.reverse()
a = []
while len(a) < len(data) - 1000:
    num = random.randint(0, len(data) - 1)
    if num not in a:
        a.append(num)
for i, d in enumerate(a):
    print(f'\n\n{i}: user{d}')
    room_id = data[d]['room_id']
    post_request('v1/app/pluginStart', {'room_id': room_id, 'app_id': 1649539569084})
    num = random.randint(0, 6)
    time.sleep(num)

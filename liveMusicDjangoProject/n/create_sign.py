import hashlib
import hmac


def hmac_sha256_encrypt(key: str, data: str):
    key = key.encode('utf-8')
    data = data.encode('utf-8')
    encrypt_data = hmac.new(key, data, digestmod=hashlib.sha256).hexdigest()
    return encrypt_data


# https://www.live-music.xyz/for-bili?Caller=bilibili&Mid=16956692&RoomId=2047387&Timestamp=1650769899&Sign=e16595caa5c545eef722fe5513d354f35712f94bfb09b98aee040b98efa72b36&plug_env=0
# https://play-live.bilibili.com/plugins-full/1649539569084?Timestamp=1654520332&RoomId=24701480&Mid=29418115&Caller=bilibili&Sign=dbecf3e0a71e5168445a20736724b370c717d425bc0d22339b9e1f8bda6c01ee&Code=BLMNUWXVJWU85&CodeSign=53d1cab7906e5ffc1281fe926b23ace4d70258a3abc648d2365339b4d6a4f74d&plug_env=0
mid = input('mid: ')
code = input('code: ')
v2_data = f'Caller:bilibili\nCode:{code}\nMid:{mid}\nTimestamp:1650769899'
sign = hmac_sha256_encrypt('MITKtf7BboK08hiaqCB2POOf9pZ4nZ', v2_data)
print(sign)
a = 'https://www.live-music.xyz/for-bili?' \
    'Caller=bilibili&' \
    f'Mid={mid}&' \
    f'Code={code}&' \
    'Timestamp=1650769899&' \
    f'CodeSign={sign}&' \
    'plug_env=0'
b = 'https://live-music.the-little-princes.com/for-bili?' \
    'Caller=bilibili&' \
    f'Mid={mid}&' \
    f'Code={code}&' \
    'Timestamp=1650769899&' \
    f'Sign={sign}&' \
    'plug_env=0'

print(a)
s = 'djfie＆dcfg'
print(s.split('&'))

"""https://live-music.the-little-princes.com/for-bili?Timestamp=1658392573&RoomId=2047387&Mid=16956692&Caller=bilibili&Sign=b63feb1b05741c88f7a9a1f8cfa6a6c51754d6dc91fd79b6eab2603458ad90ed&Code=BQS69F2MERCW2&CodeSign=ce07c883c8e6225edeb1b9929fadf1f1e5de673dac0ada55a5a78b1005b395e0&plug_env=1 """

#  Copyright (c) TLittlePrince 2023.
from django.urls import path
from liveMusicDjangoProject.live_music_websocket import LiveMusicWebsocket

websocket_urlpatterns = [
    path('ws/<slug:key_name>', LiveMusicWebsocket.as_asgi()),
]

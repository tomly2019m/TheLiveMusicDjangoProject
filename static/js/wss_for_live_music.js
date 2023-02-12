/*
 * Copyright (c) TLittlePrince 2023.
 */
class LiveMusicWebsocket {
    constructor(vm, extend, group_id) {
        this.vm = vm;
        this.extend = extend;
        this.group_id = group_id;
        this.ws = new WebSocket(`${window.location.protocol === 'http:' ? 'ws:' : 'wss:'}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}/ws/${group_id}`);
        this.on_open();
        this.on_close();
        this.on_error();
        this.on_message();
    }

    on_open() {
        this.ws.onopen = () => {
            console.log('已连接');
            this.heartbeat_id = setInterval(() => {
                this.send_heartbeat();
                // 定时发送循环延迟，单位毫秒【20000=20秒】
            }, 20000);
        }
    }

    on_close() {
        this.ws.onclose = () => {
            clearInterval(this.heartbeat_id);
            console.log('连接断开');

            // this.vm.$data.information = '连接断开，尝试重连'
            console.log('连接断开，尝试重连');
            setTimeout(() => {
                this.ws = new WebSocket(`${window.location.protocol === 'http:' ? 'ws:' : 'wss:'}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}/ws/${this.group_id}`);
                this.on_open();
                this.on_error();
                this.on_message();
                this.try_flag = false;
            }, 2000);
        }
    }

    on_error() {
        this.ws.onerror = () => {
            this.vm.$data.information = '发生错误, 请刷新浏览器源';
            console.log('发生错误');
        }
    }

    on_message() {
        this.ws.onmessage = (event) => {
            const json_data = JSON.parse(event.data);
            const content = json_data.content;
            console.log(json_data);
            switch (json_data.type) {
                case 'start_getting':
                    this.extend.is_running_control(this.vm, this.extend, content);
                    break;
                case 'next_music':
                    this.extend.music_info_list_control(this.vm, this.extend, content)
                    this.extend.music_url_control(this.vm, this.extend, content)
                    try {
                        this.extend.lyric_control(this.vm, this.extend, content);
                    } catch (e) {
                    }
                    setTimeout(() => {
                        this.extend.base_control(this.vm, this.extend, content);
                    }, 2000);
                    break;
                case 'play':
                    this.extend.base_control(this.vm, this.extend, content);
                    break;
                case 'who_play':
                    this.extend.base_control(this.vm, this.extend, content);
                    break;
                case 'replay':
                    this.extend.base_control(this.vm, this.extend, content);
                    break;
                case 'add_music':
                    this.extend.music_info_list_control(this.vm, this.extend, content);
                    break;
                case 'console_info':
                    this.extend.console_info_control(this.vm, this.extend, content);
                    break;
                case 'del_music':
                    break;
                case 'move_music':
                    break;
            }
        }
    }

    /**
     * 发送心跳
     */
    send_heartbeat() {
        try {
            this.ws.send(`{"type": "heartbeat", "content": {"group_id": "${this.group_id}"}}`);
        } catch (e) {
            this.on_close();
        }
    }

    /**
     * 开始统计
     */
    start_getting() {
        let params = {
            url: this.vm.$data.url,
            data: Number(!Boolean(vm.$data.start_flag)),
            where: this.vm.$data.where,
        };
        this.ws.send(JSON.stringify({'type': 'start_getting', 'content': params}));
    }

    /**
     * 下一首
     */
    next_music() {
        const params = {
            url: this.vm.$data.url
        }
        if (this.vm.$data.where) {
            params.where = this.vm.$data.where;
        } else {
            params.where = this.vm.$data.who_i_am ? 'lyric' : 'music'
        }
        this.ws.send(JSON.stringify({'type': 'next_music', 'content': params}));
    }

    /**
     * 基本控制(播放状态, 谁来播放, 重播状态)
     * @param where
     * @param data
     */
    base_status(where, data) {
        const params = {
            url: this.vm.$data.url,
            'data': data,
            'where': where,
            where_url: this.vm.$data.who_i_am ? 'lyric' : 'music'
        }
        this.ws.send(JSON.stringify({'type': 'play', 'content': params}));
    }

    play_pause() {
        this.vm.$data.play_icon_flag = this.vm.$data.play_icon_flag ? 0 : 1;
        this.base_status('play', this.vm.$data.play_icon_flag);
    }

    replay_music() {
        this.base_status('replay', 1);
    }

    change_who_play() {
        const who = $("[name='switch']:eq(0)").prop("checked");
        this.base_status('who_play', !who);
    }

    /**
     * 删除指定歌曲
     * @param {string} url key
     * @param {'music'|'lyric'} where url是哪里的
     * @param {string} music 歌曲名
     * @param {string} artist 歌手
     */
    del_music(url, where, music, artist) {
        this.ws.send(JSON.stringify({
            'type': 'del_music', 'content': {'url': url, 'where': where, 'music_name': music, 'artist': artist}
        }));
    }

    move_music(music, artist, index) {
        let params = {
            url: this.vm.$data.url,
            'music_name': music,
            'artist': artist,
            'index': index,
        };
        if (this.vm.$data.where) {
            params.where = this.vm.$data.where;
        } else {
            params.where = this.vm.$data.who_i_am ? 'lyric' : 'music'
        }
        this.ws.send(JSON.stringify({'type': 'move_music', 'content': params}));
    }
}


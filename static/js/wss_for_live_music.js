/*
 * Copyright (c) TLittlePrince 2023.
 */
class LiveMusicWebsocket {
    constructor(vm, extend, group_id) {
        this.vm = vm;
        this.extend = extend;
        this.group_id = group_id;
        this.random_num = Math.random();
        this.ws_url = `${window.location.protocol === 'http:' ? 'ws:' : 'wss:'}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}/ws/${group_id}`;
        this.create_connection(this.ws_url);
    }

    create_connection(ws_url) {
        this.ws = new WebSocket(ws_url);
        this.on_open();
        this.on_close();
        this.on_error();
        this.on_message();
    }

    on_open() {
        this.ws.onopen = () => {
            console.log('已连接');
            this.vm.$data.information = '已连接';
            setTimeout(() => {
                this.vm.$data.information_mask = false;
                this.vm.$data.now_view = this.vm.$data.who_i_am === 0 ? 'music_name' : 'music_lyric';
            }, 1000);
            setTimeout(() => {
                this.connectivity_test_console_send();
            }, 5000);
            this.heartbeat_id = setInterval(() => {
                this.send_heartbeat();
                this.connectivity_test_console_send();
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
                this.create_connection(this.ws_url);
            }, 2000);
        }
    }

    on_error() {
        this.ws.onerror = () => {
            this.vm.$data.information = '发生错误, 请刷新当前页面';
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
                    // this.extend.who_play_control(this.vm, this.extend, content);
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
                case 'connectivity_test_send':
                    // this.connectivity_test_console_send();
                    this.connectivity_test_panel_send(content);
                    break;
                case 'connectivity_test_receive':
                    this.connectivity_test_receive(content);
                    break;
                case 'del_music':
                    let temp = [];
                    content.music_info_list.forEach(element => {
                        temp.push(element.file_name);
                    });
                    vm.$data.music_info = temp;
            }
        }
    }

    send_formatted_ws(type, content) {
        try {
            console.log(this.ws.readyState);
            if (this.ws.readyState) {
                this.ws.send(JSON.stringify({type: type, content: content}));
            } else {
                this.vm.$data.information = '已断开连接，, 请刷新当前页面';
            }
        } catch (e) {
            this.on_close();
            this.connectivity_test_panel_send(-1);
        }
    }

    /**
     * 发送心跳
     */
    send_heartbeat() {
        // this.ws.send(`{"type": "heartbeat", "content": {"group_id": "${this.group_id}"}}`);
        this.send_formatted_ws('heartbeat', {group_id: this.group_id});
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
        // this.ws.send(JSON.stringify({'type': 'start_getting', 'content': params}));
        this.send_formatted_ws('start_getting', params);
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
        // this.ws.send(JSON.stringify({'type': 'next_music', 'content': params}));
        this.send_formatted_ws('next_music', params);
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
        // this.ws.send(JSON.stringify({'type': 'play', 'content': params}));
        this.send_formatted_ws('play', params);
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
        const params = {'url': url, 'where': where, 'music_name': music, 'artist': artist}
        this.send_formatted_ws('del_music', params);
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
        // this.ws.send(JSON.stringify({'type': 'move_music', 'content': params}));
        this.send_formatted_ws('move_music', params)
    }

    connectivity_test_console_send() {

        let a = this.vm.idle_playlist_mask;
        if (a !== undefined) {
            const params = {
                url: this.vm.$data.url,
                random_num: this.random_num,
                where_url: this.vm.$data.who_i_am ? 'lyric' : 'music'
            }
            // this.ws.send(JSON.stringify({'type': 'connectivity_test_send', 'content': params}));
            this.send_formatted_ws('connectivity_test_send', params);
        }

    }

    connectivity_test_panel_send(content) {
        const params = {
            url: this.vm.$data.url,
            random_num: content.random_num,
            where_url: this.vm.$data.who_i_am ? 'lyric' : 'music'
        }
        // this.ws.send(JSON.stringify({'type': 'connectivity_test_receive', 'content': params}));
        this.send_formatted_ws('connectivity_test_receive', params);
    }

    connectivity_test_receive(content) {
        const who = $("[name='switch']:eq(0)").prop("checked");
        try {
            if (content.music !== undefined) {
                if (content.music === this.random_num) {
                    //
                    document.getElementById('music_status').setAttribute('class', 'light status-connect');
                } else {
                    this.vm.$data.information = '请注意歌名界面已断开连接';
                    document.getElementById('music_status').setAttribute('class', 'light status-disconnect');
                }
            }
        } catch (e) {
        }
        try {
            if (content.lyric !== undefined) {
                if (content.lyric === this.random_num) {
                    //
                    document.getElementById('lyric_status').setAttribute('class', 'light status-connect');
                } else {
                    if (!who) {
                        this.vm.$data.information = '请注意歌词界面已断开连接';
                    }
                    document.getElementById('lyric_status').setAttribute('class', 'light status-disconnect');
                }
            }
        } catch (e) {
        }
    }
}


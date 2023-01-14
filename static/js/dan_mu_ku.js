/*
 * Copyright (c) TLittlePrince 2022.
 */

class Dan_mu_ku {
    constructor(vm, room_id, url, where) {
        this.vm = vm;
        this.url = url;
        this.where = where;
        this.room_id = room_id;
        this.time_list = [];
        this.first_flag = true;
    }

    get_dan_mu() {
        $.getJSON('/get_dan_mu', {room_id: this.room_id}, data => {
            for (const datum of data) {
                let timeLine = datum['timeline']
                if (this.first_flag) {
                    for (const datum of data) {
                        let timeLine = datum['timeline']
                        this.time_list.push(timeLine)
                    }
                    this.first_flag = false
                } else {
                    if (this.time_list.indexOf(timeLine) === -1) {
                        this.on_dan_mu(datum)
                        if (this.time_list.length >= 10) {
                            this.time_list.shift()
                        }
                        this.time_list.push(timeLine)
                    }
                }
            }
            console.log(this.time_list)
        }).fail(() => {
            this.vm.$data.information = '服务器连接已断开, 请刷新浏览器源'
        })
    }

    on_dan_mu(msg_json) {
        let user = msg_json['nickname']  // 用户名
        let comment = msg_json['text']  // 弹幕内容
        // let te_com = com.split('#')[-1]
        if (this.vm.$data.start_flag) {
            this.send_to_server(user, comment)
        } else {
            console.log('stop');
        }
    }

    send_to_server(username, comment) {
        console.log(username + ': ' + comment)
        comment = comment.split('#')[0]
        comment = comment.split(' ')
        let fir = comment.shift()
        console.log(fir)
        console.log(comment)
        if (fir === '点歌' || fir === '.') {
            console.log(true)
            comment = comment.join(' ')
            comment = comment.split('&')
            if (comment[1] === undefined) {
                comment = comment[0].split('＆')
            }
            console.log(comment)
            let music_name = $.trim(comment[0])
            let artist = $.trim(comment[1])
            console.log(music_name)
            console.log(artist)
            $.get('move_music', {
                index: -1,
                url: this.url,
                artist: artist,
                where_url: this.where,
                music_name: music_name
            });
        }
    }
}
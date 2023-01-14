let time_list = []
let stop_flag = false
let first_flag = true

function get_dan_mu(room_id, url, where) {
    $.getJSON('/get_dan_mu?room_id=' + room_id, function (data) {

        for (const datum of data) {
            let timeLine = datum['timeline']
            if (first_flag) {
                for (const datum of data) {
                    let timeLine = datum['timeline']
                    time_list.push(timeLine)
                }
                first_flag = false
            } else {
                if (time_list.indexOf(timeLine) === -1) {
                    on_dan_mu(datum, url, where)
                    if (time_list.length >= 10) {
                        time_list.shift()
                    }
                    time_list.push(timeLine)
                }
            }

        }
        console.log(time_list)
    })
}

function on_dan_mu(msg_json, url, where) {
    let user = msg_json['nickname']  // 用户名
    let comment = msg_json['text']  // 弹幕内容
    // let te_com = com.split('#')[-1]
    send_to_server(user, comment, url, where)
}

function on_wss(msg_json, url, where) {
    let user = msg_json.data.uname  // 用户名
    let com = msg_json.data.msg  // 弹幕内容
    if (stop_flag) {
        send_to_server(user, com, url, where)
    } else {
        console.log('stop\n' + user + ': ' + com)
    }
}

function send_to_server(username, comment, url, where) {
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
        $.get('/move_music?where_url=' + where + '&url=' + url + '&index=-1&music_name=' + music_name + '&artist=' + artist)
    }
}


let last = [];
let last_list = [];
let start_flag = 0;
let scroll_flag = 1;

function change_bili_scroll_flag(val) {
    scroll_flag = val
}

/*function sql_delete_bili(select_obj_text, music, artist, url, where) {
    $.get('/del_music?where_url=' + where + '_url&url=' + url + '&music_name=' + music + '&artist=' + artist);
    $(select_obj_text).remove();
}

function sql_move_bili_music(select_obj_text, music, artist, index, url, where) {
    $.get('/move_music?where_url=' + where + '_url&url=' + url + '&music_name=' + music + '&artist=' + artist + '&index=' + index);
}*/

function load_for_bili_setting_vue(url, where) {

    return new Vue({
        el: '#app',
        data: {
            music_info: [''],
            console_info: [''],
            c_num: 0,
            m_num: 0,
            url: url,
            where: where,

            music_mask: false,
            mask1: false,
            mask1_1: false,
            mask2: false,
            mask2_1: false,
            mask2_2: false,

            play_icon_flag: 1,
            music_list: [],
            play_icon: ['icon-list_play', 'icon-list_stop'],
        },
        methods: {
            start_dan_mu() {
                if (start_flag) {
                    $.get('/start_dan_mu?data=0&' + this.where + '=' + this.url + '');
                    $('#start_dan_mu').text('开始统计');
                    start_flag = 0;
                } else {
                    $.getJSON('/start_dan_mu?data=1&' + this.where + '=' + this.url + '', function (data) {
                        if (data['data'] == 'id') {
                            alert('你的房间地址设置有误！\n请在歌词设置或歌名设置中设置正确的房间名并提交');
                        } else if (data['data'] == 'key') {
                            alert('请检查设置并重新提交\n(无论是否改变设置都应该点击提交按钮)')
                        } else {
                            $('#start_dan_mu').text('停止统计');
                            start_flag = 1;
                        }
                    });
                }
            },

            sql_who_play() {
                const who = $("[name='switch']:eq(0)").prop("checked");
                console.log(who)
                if (who) {
                    $.get('/play?where_url=' + this.where + '_url&url=' + this.url + '&where=who_play&data=0');
                } else {
                    $.get('/play?where_url=' + this.where + '_url&url=' + this.url + '&where=who_play&data=1');
                }
            },

            sql_play() {
                if (this.play_icon_flag) {
                    this.play_icon_flag = 0;
                } else {
                    this.play_icon_flag = 1;
                }
                $.get('/play?where_url=' + this.where + '_url&url=' + this.url + '&where=play&data=' + this.play_icon_flag);
                // this.play_icon_flag = play_data
                // this.change_image(!(play_data))
            },

            sql_replay() {
                $.get('/play?where_url=' + this.where + '_url&url=' + this.url + '&where=replay&data=1');
            },

            sql_next() {
                $.get('/next_music?url=' + this.url + '&where=' + this.where);
            },

            get_music_info(th) {
                $.getJSON('/get_data?url=' + this.url + '&where=' + this.where, function (data) {
                    console.log(data)
                    let now_music_name;
                    let html_music_name;
                    const music_list = data['data']['music_name_list'];  // 歌曲列表
                    const who_play = data['data']['who_play']
                    const is_running = data['data']['is_running']
                    th.console_info = data['data']['console_info']
                    th.play_icon_flag = data['data']['play_']
                    try {
                        now_music_name = [music_list.shift()];
                    } catch (e) {
                        now_music_name = [];
                    }
                    if (now_music_name.equals([undefined])) {
                        now_music_name = [];
                    }
                    if (who_play) {
                        $("[name='switch']:eq(0)").prop("checked", false);
                    } else {
                        $("[name='switch']:eq(0)").prop("checked", true);
                    }
                    if (is_running) {
                        $('#start_dan_mu').text('停止统计');
                        start_flag = 1;
                    } else {
                        $('#start_dan_mu').text('开始统计');
                        start_flag = 0;
                    }
                    if (!(music_list.equals(last_list))) {
                        // let html_list = [];
                        last_list = music_list;
                        /*for (let j = 0; j < music_list.length; j++) {
                            html_list[j] = " <span class=\"music-name\">" + music_list[j][0] + "</span><span class=\"artist\">" + music_list[j][1] + "</span><div class=\"operation\">" +
                                "<button class=\"delete conform\" onclick=\"sql_delete_bili(\'#li" + j + "\', \'" + music_list[j][0] + "\', \'" + music_list[j][1] + "\', \'" + th.url + "\', where)\">删除</button>" +
                                "<button class=\"delete conform\" onclick=\"sql_move_bili_music(\'#li" + j + "\', \'" + music_list[j][0] + "\', \'" + music_list[j][1] + "\', 1, \'" + th.url + "\', where)\">播放</button>" +
                                "<button class=\"delete conform\" onclick=\"sql_move_bili_music(\'#li" + j + "\', \'" + music_list[j][0] + "\', \'" + music_list[j][1] + "\', 2, \'" + th.url + "\', where)\">下一首播放</button></div>"
                        }
                        // f.innerHTML = html_list.join('');
                        th.music_info = html_list*/
                        th.music_list = music_list
                    }
                    if (!(now_music_name.equals(last))) {
                        last = now_music_name;
                        if (last.equals([]) || last.equals([['', '']])) {
                            html_music_name = "<li><span class=\"music-name\">暂无歌曲</span>" +
                                "<span class=\"artist\">暂无</span></li>";
                        } else {
                            html_music_name = "<li><span class=\"music-name\">" + now_music_name[0][0] + "</span>" +
                                "<span class=\"artist\">" + now_music_name[0][1] + "</span></li>";
                        }
                        const f = document.getElementById('u');
                        const childs = f.childNodes;
                        for (let i = childs.length - 1; i >= 0; i--) {
                            f.removeChild(childs[i]);
                        }
                        f.innerHTML = html_music_name;
                    }
                });
                // setInterval(get_music_info, 5000);
            },

            // change_image(boolean) {
            //     if (boolean) {
            //         $('#play_pause').attr('src', "static/images/playing.png");
            //     } else {
            //         $('#play_pause').attr('src', "static/images/play.png");
            //     }
            // },

            display_operation(select_obj_text) {
                $(select_obj_text).css('display', 'flex')
            },

            hidden_operation(select_obj_text) {
                $(select_obj_text).css('display', 'none')
            },

            sql_delete_bili(select_obj_text, music, artist, url, where) {
                $.get('/del_music?where_url=' + where + '_url&url=' + url + '&music_name=' + music + '&artist=' + artist);
                $(select_obj_text).remove();
            },

            sql_move_bili_music(select_obj_text, music, artist, index, url, where) {
                $.get('/move_music?where_url=' + where + '_url&url=' + url + '&music_name=' + music + '&artist=' + artist + '&index=' + index);
            },

        },
        computed: {
            console_info_change() {
                const {
                    console_info
                } = this
                console.log(
                    console_info
                )
                return {}
            },
            music_info_change() {
                const {
                    music_info
                } = this
                console.log(
                    music_info
                )
                return {}
            }
        },
        watch: {
            console_info_change() {  // 列表内容改变
                this.c_num++
                if (scroll_flag) {
                    let ul = $('#console-info')  // 填id
                    ul.animate({scrollTop: ul.get(0).scrollHeight}, 1000)
                }
            },
            music_info_change() {
                this.m_num++
            }
        },
        created() {
            const th = this
            $.getJSON('/get_data?url=' + this.url + '&where=' + this.where, function (data) {
                // const play_ = data['data']['play_'];  // 播放还是暂停
                // th.change_image(play_);
                th.play_icon_flag = data['data']['play_'];  // 播放还是暂停
            });
            th.get_music_info(th)
            setInterval(() => {
                th.get_music_info(th)
            }, 5000);
        }
    })
}

function change_scroll_flag(val) {
    scroll_flag = val
}

function sql_delete(select_obj_text, music, artist) {
    $.get('/del_music?music_name=' + music + '&artist=' + artist);
    $(select_obj_text).remove();
}

function sql_move_music(select_obj_text, music, artist, index) {
    $.get('/move_music?music_name=' + music + '&artist=' + artist + '&index=' + index);
}

function sql_replay() {

}

function load_console(url) {
    new Vue({
        el: '.panel',
        data: {
            music_info: [''],
            console_info: [''],
            c_num: 0,
            m_num: 0
        },
        methods: {
            start_dan_mu() {
                if (start_flag) {
                    $.get('/start_dan_mu?data=0');
                    $('#start_dan_mu').text('开始统计');
                    start_flag = 0;
                } else {
                    $.getJSON('/start_dan_mu?data=1', function (data) {
                        if (data['data'] == 'id') {
                            alert('你的房间地址设置有误！\n请在歌词设置或歌名设置中设置正确的房间名并提交');
                        } else if (data['data'] == 'key') {
                            alert('请检查设置并重新提交\n(无论是否改变设置都应该点击提交按钮)')
                        } else {
                            $('#start_dan_mu').text('停止统计');
                            start_flag = 1;
                        }
                    });
                }
            },

            sql_who_play() {
                const who = $("[name='switch']:eq(0)").prop("checked");
                console.log(who)
                if (who) {
                    $.get('/play?where=who_play&data=0');
                } else {
                    $.get('/play?where=who_play&data=1');
                }
            },

            sql_play() {
                $.get('/play?where=play&data=' + this.play_icon_flag);
                if (this.play_icon_flag) {
                    this.play_icon_flag = 0;
                } else {
                    this.play_icon_flag = 1;
                }
                // this.change_image(!(play_data))

            },

            sql_replay() {
                $.get('/play?where=replay&data=1');
            },

            sql_next() {
                $.get('/next_music?url=' + url + '&where=lyric');
            },


            get_music_info(th) {
                $.getJSON('/get_data?url=' + url + '&where=lyric', function (data) {
                    let now_music_name;
                    let html_music_name;
                    const music_list = data['data']['music_name_list'];  // 歌曲列表
                    const who_play = data['data']['who_play']
                    const is_running = data['data']['is_running']
                    th.console_info = data['data']['console_info']
                    th.play_icon_flag = data['data']['play_']
                    try {
                        now_music_name = [music_list.shift()];
                    } catch (e) {
                        now_music_name = [];
                    }
                    if (now_music_name.equals([undefined])) {
                        now_music_name = [];
                    }
                    if (who_play) {
                        $("[name='switch']:eq(0)").prop("checked", false);
                    } else {
                        $("[name='switch']:eq(0)").prop("checked", true);
                    }
                    if (is_running) {
                        $('#start_dan_mu').text('停止统计');
                        start_flag = 1;
                    } else {
                        $('#start_dan_mu').text('开始统计');
                        start_flag = 0;
                    }
                    if (!(music_list.equals(last_list))) {
                        let html_list = [];
                        last_list = music_list;
                        for (let j = 0; j < music_list.length; j++) {
                            html_list[j] = " <span class=\"music-name\">" + music_list[j][0] + "</span><span class=\"artist\">" + music_list[j][1] + "</span>" +
                                "<button class=\"delete conform\" onclick=\"sql_delete(\'#li" + j + "\', \'" + music_list[j][0] + "\', \'" + music_list[j][1] + "\')\">删除</button>" +
                                "<button class=\"delete conform\" onclick=\"sql_move_music(\'#li" + j + "\', \'" + music_list[j][0] + "\', \'" + music_list[j][1] + "\', 1)\">播放</button>" +
                                "<button class=\"delete conform\" onclick=\"sql_move_music(\'#li" + j + "\', \'" + music_list[j][0] + "\', \'" + music_list[j][1] + "\', 2)\">下一首播放</button>"
                        }
                        // f.innerHTML = html_list.join('');
                        th.music_info = html_list
                    }
                    if (!(now_music_name.equals(last))) {
                        last = now_music_name;
                        if (last.equals([]) || last.equals([['', '']])) {
                            html_music_name = "<li><span class=\"music-name\">暂无歌曲</span>" +
                                "<span class=\"artist\">暂无</span></li>";
                        } else {
                            html_music_name = "<li><span class=\"music-name\">" + now_music_name[0][0] + "</span>" +
                                "<span class=\"artist\">" + now_music_name[0][1] + "</span></li>";
                        }
                        const f = document.getElementById('u');
                        const childs = f.childNodes;
                        for (let i = childs.length - 1; i >= 0; i--) {
                            f.removeChild(childs[i]);
                        }
                        f.innerHTML = html_music_name;
                    }
                });
                // setInterval(get_music_info, 5000);
            },

            // change_image(boolean) {
            //     if (boolean) {
            //         $('#play_pause').attr('src', "static/images/playing.png");
            //     } else {
            //         $('#play_pause').attr('src', "static/images/play.png");
            //     }
            // },


        },
        computed: {
            console_info_change() {
                const {
                    console_info
                } = this
                console.log(
                    console_info
                )
                return {}
            },
            music_info_change() {
                const {
                    music_info
                } = this
                console.log(
                    music_info
                )
                return {}
            }
        },
        watch: {
            console_info_change() {
                this.c_num++
                if (scroll_flag) {
                    let ul = $('#console-info')  // 填id
                    ul.animate({scrollTop: ul.get(0).scrollHeight}, 1000)
                }
            },
            music_info_change() {
                this.m_num++
            }
        },
        created() {
            const th = this
            $.getJSON('/get_data?url=' + url + '&where=lyric', function (data) {
                // const play_ = data['data']['play_'];  // 播放还是暂停
                // th.change_image(play_);
                th.play_icon_flag = data['data']['play_'];  // 播放还是暂停
            });
            th.get_music_info(th)
            setInterval(() => {
                th.get_music_info(th)
            }, 5000);
        }
    })
}

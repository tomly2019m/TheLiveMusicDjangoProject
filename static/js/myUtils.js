class MyUtils {

    // 已经滚动的数值
    n = 0

    // 上次的值
    last = ''

    // 当前是否在播放
    is_play = 0

    who_play

    // 全局时间
    global_time = 0

    // 全局时间flag, 未修改true，已修改false
    global_time_flag = true

    global_time_break_flag = false

    // 歌曲实例
    htmlAudioElement = new Audio('')

    constructor() {

    }

    /**
     * 加载登录二维码
     * @param {Vue} vm Vue实例
     */
    load_QRCode_b64(vm) {
        let key = vm.$data.QRCode_key
        let apis = {
            qq: 'qq-music-qr-code', ku_wo: 'ku-wo-music-qr-code', cloud: 'cloud-music-qr-code',
        }
        vm.$data.QRCode_b64_style = ''
        vm.$data.QRCode_load_flag = true
        if (!vm.$data.QRCode_login_status[key]) {
            $.getJSON(apis[key], {secret: vm.$data.secret}, async (data) => {
                vm.$data.QRCode_b64_style = 'background-image: url(data:image/jpg;base64,' + data['base64'] + ');'
                vm.$data.QRCode_load_flag = false
                for (let i = 0; i < 20; i++) {
                    await this.delayTime(5000)
                    this.get_login_status(vm)
                    if (vm.$data.QRCode_login_status[key] || !vm.$data.login_mask) {
                        vm.$data.login_mask = false
                        vm.$data.QRCode_key = ''
                        vm.$data.QRCCode_selected_style[key] = ''
                        break
                    }
                }
            })
        } else {
            vm.$data.QRCode_load_flag = false
            vm.$data.QRCode_b64_style = ''
        }
    }

    /**
     * 获取登录状态
     * @param {Vue} vm Vue实例
     */
    get_login_status(vm) {
        let key = vm.$data.QRCode_key
        $.getJSON('get-qr-status', {secret: vm.$data.secret}, (data) => {
            console.log(data)
            vm.$data.QRCode_login_status = data
            if (vm.$data.QRCode_login_status[key]) {
                vm.$data.QRCode_b64_style = ''
            }
        })
    }

    /**
     * 写入登录状态
     * @param {Vue} vm Vue实例
     */
    set_login_status(vm) {
        $.getJSON('set-qr-status', {secret: vm.$data.secret, platform: vm.$data.QRCode_key, value: false}, (data) => {
            console.log(data)
            if (data.data) {
                vm.$data.QRCode_login_status[vm.$data.QRCode_key] = false
                this.load_QRCode_b64(vm)
            }
        })
    }

    /**
     * 切换登录二维码
     * @param {Vue} vm Vue实例
     @param {String} key 要请求的平台 qq, ku_wo, cloud
     */
    change_QRCode(vm, key) {
        const name = {'qq': 'QQ音乐', 'cloud': '网易云音乐', 'ku_wo': '酷我音乐'}
        vm.$data.QRCode_key = key
        vm.$data.QRCCode_selected_style = {'qq': '', 'cloud': '', 'ku_wo': ''}
        vm.$data.QRCCode_selected_style[key] = 'background-color: #b5b5b5;'
        vm.$data.QRCode_where = name[key]
        this.load_QRCode_b64(vm)
    }


    show_logged(vm) {

    }


    // /**
    //  * 展开/收起
    //  * @param {Vue} vm Vue实例
    //  * @param {string} select_obj_text css选择器
    //  */
    // dh_item(vm, select_obj_text) {
    //     let i = parseInt(select_obj_text.split('').reverse()[0])
    //     console.log(select_obj_text)
    //     $(select_obj_text).toggle(500);
    //     vm.$data.toggle_statue[i] = Number(!vm.$data.toggle_statue[i])
    // }

    /**
     * 改变主显示样式 display_style 的值
     * @param {Vue} vm Vue实例
     */
    change_display_css(vm) {
        console.log('主题 ' + vm.$data.theme_id)
        if (!vm.$data.set_flag) {
            vm.$data.display_style = 'border: none;box-shadow: none;'
        }
        vm.$data.display_style += 'width: ' + vm.$data.v_div_width + 'px; height: ' + vm.$data.v_div_height + 'px; border-image: url(\"' + vm.$data.theme_url[vm.$data.theme_id] + '\") stretch; border-image-slice: ' + vm.$data.border_image_slice[vm.$data.theme_id] + ' fill; border-image-width: ' + vm.$data.border_image_width[vm.$data.theme_id] + 'px; border-image-outset: ' + vm.$data.border_image_outset[vm.$data.theme_id] + 'px;'
    }

    /**
     * 改变主显示样式 歌名 或 歌词原文 的相关值
     * @param {Vue} vm Vue实例
     */
    change_first_css(vm) {
        vm.$data.first_style = 'font-family: ' + vm.$data.v_first_font + '; font-size: ' + vm.$data.v_first_font_size + 'px; color: ' + vm.$data.v_first_color + '; text-shadow: ' + this.generate_text_shadow(vm.$data.first_shadow_blur, vm.$data.first_shadow_color, vm.$data.first_shadow_num)
    }

    /**
     * 改变主显示样式 歌手 或 歌词译文 的相关值
     * @param {Vue} vm Vue实例
     */
    change_second_css(vm) {
        vm.$data.second_style = 'font-family: ' + vm.$data.v_second_font + '; font-size: ' + vm.$data.v_second_font_size + 'px; color: ' + vm.$data.v_second_color + '; text-shadow: ' + this.generate_text_shadow(vm.$data.second_shadow_blur, vm.$data.second_shadow_color, vm.$data.second_shadow_num)
    }

    /**
     * 改变主显示样式 当前句 的相关值
     * @param {Vue} vm Vue实例
     */
    change_now_css(vm) {
        vm.$data.now_style = 'font-family: ' + vm.$data.v_now_font + '; font-size: ' + vm.$data.v_now_font_size + 'px; color: ' + vm.$data.v_now_color + '; text-shadow: ' + this.generate_text_shadow(vm.$data.now_shadow_blur, vm.$data.now_shadow_color, vm.$data.now_shadow_num)
    }

    /**
     * 生成多重阴影
     * @param {Number, string} shadow_blur 模糊度(px)
     * @param {string} shadow_color 颜色
     * @param {Number, string} num
     * @returns {string} 行内style字符串
     */
    generate_text_shadow(shadow_blur, shadow_color, num) {
        num = parseInt(num)
        shadow_blur = parseInt(shadow_blur)
        if (num === 0) {
            return ''
        }
        let shadow = []
        for (let x = -num; x <= num; x += Math.ceil(num / 4)) {
            for (let y = -num; y <= num; y += Math.ceil(num / 4)) {
                shadow.push(x + 'px ' + y + 'px ' + shadow_blur + 'px ' + shadow_color)
            }
        }
        return shadow.join(',') + ';'
    }

    /**
     * 改变列表的间距
     * @param {Vue} vm Vue实例
     */
    change_li_css(vm) {
        vm.$data.li_style = 'margin: 0 0 ' + vm.$data.v_li_margin + 'px 0;'
        console.log(this.global_time_break_flag)
        if (!this.global_time_break_flag) {
            this.test_lyric(vm)
        }
        this.global_time_break_flag = true
    }

    change_theme(vm, theme_id) {
        vm.$data.theme_id = parseInt(theme_id);
    }

    /**
     * 使用get方法提交所有设置
     * @param {Vue} vm Vue实例
     * @param {string} who 歌名 或 歌词
     */
    use_get(vm, who) {

        let final_params
        let do_get_params
        let public_params = {
            where: who,

            secret: vm.$data.secret, theme_id: vm.$data.theme_id,

            black_user_list: JSON.stringify(vm.$data.black_user_list),

            div_width: vm.$data.v_div_width, div_height: vm.$data.v_div_height,

            v_li_margin: vm.$data.v_li_margin,
        }
        switch (who) {
            case 'music':
                do_get_params = {
                    music_color: vm.$data.v_first_color,
                    music_font: vm.$data.v_first_font,
                    music_font_size: vm.$data.v_first_font_size,

                    artist_color: vm.$data.v_second_color,
                    artist_font: vm.$data.v_second_font,
                    artist_font_size: vm.$data.v_second_font_size,

                    music_shadow_num: vm.$data.first_shadow_num,
                    music_shadow_blur: vm.$data.first_shadow_blur,
                    music_shadow_color: vm.$data.first_shadow_color,

                    artist_shadow_num: vm.$data.second_shadow_num,
                    artist_shadow_blur: vm.$data.second_shadow_blur,
                    artist_shadow_color: vm.$data.second_shadow_color,
                }
                break
            case 'lyric':
                do_get_params = {
                    original_text_color: vm.$data.v_first_color,
                    original_text_font: vm.$data.v_first_font,
                    original_text_font_size: vm.$data.v_first_font_size,

                    translation_color: vm.$data.v_second_color,
                    translation_font: vm.$data.v_second_font,
                    translation_font_size: vm.$data.v_second_font_size,

                    now_color: vm.$data.v_now_color,
                    now_font: vm.$data.v_now_font,
                    now_font_size: vm.$data.v_now_font_size,

                    original_shadow_num: vm.$data.first_shadow_num,
                    original_shadow_blur: vm.$data.first_shadow_blur,
                    original_shadow_color: vm.$data.first_shadow_color,

                    translation_shadow_num: vm.$data.second_shadow_num,
                    translation_shadow_blur: vm.$data.second_shadow_blur,
                    translation_shadow_color: vm.$data.second_shadow_color,

                    now_shadow_num: vm.$data.now_shadow_num,
                    now_shadow_blur: vm.$data.now_shadow_blur,
                    now_shadow_color: vm.$data.now_shadow_color,
                }
        }
        final_params = {...public_params, ...do_get_params}
        console.log(final_params)
        $.ajaxSettings.timeout = '3000'
        $.get('/from-bili?', final_params, (data, status) => {
            switch (status) {
                case 'success':
                    this.change_load_info(vm, true, 'sus')
                    break
                default:
                    this.change_load_info(vm, true, 'fail', status)
            }
        })
    }

    /**
     * 使用get方法提交全局设置中的一部分
     * @param {Vue} vm Vue实例
     * @param {string} where 哪一部分
     */
    use_get_global(vm, where) {
        $.get('/add-global-setting', {
            secret: vm.$data.secret,
            where: where,
            data: JSON.stringify(where === 'black_user_list' ? vm.$data.black_user_list : vm.$data.black_music_list)
        })
    }

    /**
     * 添加黑名单用户或歌曲
     * @param vm
     * @param {'music', 'user'} where
     */
    push_black(vm, where) {
        const where_params = {
            music: {
                music_name: vm.$data.black_music.music_name, artist: vm.$data.black_music.artist
            }, user: {
                nick: vm.$data.black_user.nick, uid: vm.$data.black_user.uid
            }
        }
        const each_params = {
            music: ['music_name', 'artist'], user: ['nick', 'uid']
        }
        if (where_params[where][each_params[where][0]] == null && where_params[where][each_params[where][1]] == null) {
            console.log('无内容')
        } else {
            vm.$data['black_' + where + '_list'].push(where_params[where])
            vm.$data['black_' + where] = {}
            vm.$data.mask1_1 = false
            vm.$data.mask2_1 = false
        }
    }

    /**
     * 求并集
     * @param {Array} a
     * @param {Array} b
     * @returns {*[]}
     */
    sumV2(a, b) {
        return [...new Set([...a, ...b])]
    }

    /**
     * 生成时间列表
     * @param {string} who 歌名 或 歌词
     * @returns {{lis_len: number, time_list: *[]}}
     */
    create_time_list(who) {
        let i = 0
        let time_list = []
        let small_time_list = []
        const lis = document.getElementsByClassName('item')
        const lis_len = lis.length
        // 填入歌词时间到 li
        // if (who === 'lyric') {
        //     while (i < lis_len) {
        //         console.log(i)
        //         try {
        //             let small_time_list = []
        //             small_time_list[0] = lis[i].id
        //             small_time_list[1] = lis[i + 1].id
        //             time_list[i] = small_time_list
        //             i++
        //         } catch (e) {
        //             let small_time_list = []
        //             small_time_list[0] = lis[i].id
        //             small_time_list[1] = '86400'
        //             time_list[i] = small_time_list
        //             break
        //         }
        //     }
        //     small_time_list[0] = lis[i].id
        //     small_time_list[1] = '86400'
        //     time_list[i] = small_time_list
        //     console.log(time_list)
        // }
        for (const lyric_obj of lis) {
            time_list.push(lyric_obj.id)
        }
        return {lis_len, time_list}
    }

    /**
     * 根据时间滚动歌词并设置当前句样式
     * @param i
     * @param list_len
     * @param time_list
     * @param now_music_time
     */
    show_now_lyric(i, list_len, time_list, now_music_time) {
        if (i < list_len) {
            if (parseFloat(time_list[i][0]) <= now_music_time && now_music_time <= parseFloat(time_list[i][1]) + 1) {
                // console.log(time_list[i]);
                const others = document.getElementsByClassName('item');
                for (let other of others) {
                    other.getElementsByClassName('original')[0].style.cssText = vm.$data.first_style
                }
                document.getElementById(time_list[i][0]).getElementsByClassName('original')[0].style.cssText = vm.$data.now_style
                this.change(vm)
                i++
            }
        }
        return i
    }

    /*    /!**
         *
         * @param {Vue} vm Vue实例
         * @param {string} music_url 音乐链接
         * @param {string} who 歌名 或 歌词
         *!/
        music_play(vm, music_url, who) {
            let i = 0
            const _this = this
            const {lis_len, time_list} = who === 'lyric' && this.create_time_list(who)
            if (who === 'lyric') {
                this.n = (parseInt(vm.$data.v_li_margin) + parseInt(vm.$data.li_height)) * 3;
                this.change(vm)
            }
            this.htmlAudioElement = new Audio(music_url)
            this.htmlAudioElement.play().then(() => {
                this.is_play = 1
                console.log(this)
                console.log(this.is_play)
            })
            this.htmlAudioElement.addEventListener('timeupdate', function () {
                if (who === 'lyric') {
                    i = _this.show_now_lyric(i, lis_len, time_list, this.currentTime)
                    // for (let j = 0; j < time_list.length; j++) {
                    //     if (this.currentTime >= time_list[j]) {
                    //         time_list.splice(j);
                    //         const others = document.getElementsByClassName('item');
                    //         for (let other of others) {
                    //             other.getElementsByClassName('original')[0].style.cssText = vm.$data.first_style
                    //         }
                    //         document.getElementById(time_list[i][0]).getElementsByClassName('original')[0].style.cssText = vm.$data.now_style
                    //         _this.change(vm)
                    //     }
                    // }
                }
            });
            this.htmlAudioElement.addEventListener('ended', () => {
                $.get('/next_music', {url: vm.$data.url, where: who})
            })
            this.update_play_data(vm, 'replay', 0);
        }*/

    /**
     * 播放歌曲
     * @param {Vue} vm Vue实例
     * @param {string} who 歌名 或 歌词
     */
    music_play(vm, who) {
        let {lis_len, time_list} = who === 'lyric' && this.create_time_list(who)
        const music_src = this.htmlAudioElement.src
        if (who === 'lyric') {
            this.n = (parseInt(vm.$data.v_li_margin) + parseInt(vm.$data.li_height)) * 3;
            this.change(vm)
        }
        try {
            const localCurrentTime = parseInt(localStorage.getItem(music_src));
            if (localCurrentTime !== 0 && !isNaN(localCurrentTime)) {
                this.htmlAudioElement.currentTime = localCurrentTime;
                this.htmlAudioElement.play().then(() => {
                    this.is_play = 1
                    console.log(this)
                    console.log(this.is_play)
                })
            } else {
                this.htmlAudioElement.play().then(() => {
                    this.is_play = 1
                    console.log(this)
                    console.log(this.is_play)
                })
            }
        } catch (e) {
            this.htmlAudioElement.play().then(() => {
                this.is_play = 1
                console.log(this)
                console.log(this.is_play)
            })
        }
        // this.htmlAudioElement = new Audio(music_url)

        // this.htmlAudioElement.addEventListener('timeupdate', function () {
        //     if (who === 'lyric') {
        //         i = _this.show_now_lyric(i, lis_len, time_list, this.currentTime)
        //     }
        // });
        this.htmlAudioElement.ontimeupdate = () => {
            const musicCurrentTime = this.htmlAudioElement.currentTime;
            localStorage.setItem(music_src, musicCurrentTime.toString());
            if (who === 'lyric') {
                // i = this.show_now_lyric(i, lis_len, time_list, this.htmlAudioElement.currentTime)
                for (let j = 0; j < time_list.length; j++) {
                    const now_time = time_list[j];
                    if (this.htmlAudioElement.currentTime >= now_time) {
                        console.log(now_time);
                        time_list = time_list.slice(j + 1, time_list.length)
                        const others = document.getElementsByClassName('item');
                        for (let other of others) {
                            other.getElementsByClassName('original')[0].style.cssText = vm.$data.first_style
                        }
                        document.getElementById(now_time).getElementsByClassName('original')[0].style.cssText = vm.$data.now_style
                        for (let i = 0; i <= j; i++) {
                            this.change(vm);
                        }
                    }
                }
            }
        }
        // this.htmlAudioElement.addEventListener('ended', () => {
        //     this.is_play = 0
        //     $.get('/next_music', {url: vm.$data.url, where: who})
        // })
        this.htmlAudioElement.onended = () => {
            localStorage.setItem(music_src, '0');
            this.is_play = 0
            // $.get('/next_music', {url: vm.$data.url, where: who})
            vm.$data.wss.next_music();
        }
        this.update_play_data(vm, 'replay', 0);
    }

    /**
     * 歌词向下滚动
     */
    change(vm) {
        this.n -= 90 + parseInt(vm.$data.v_li_margin);
        document.getElementById('uls').style.transform = 'translateY(' + this.n + 'px)'
    }

    /**
     * 获取基本控制数据: 重播, 暂停/播放, 谁来播放
     * @param {Vue} vm Vue实例
     * @param {Object} extend 父类
     * @return {{which_data_list: string[], callback_list: MyUtils.base_control[]}}
     */
    get_base_control(vm, extend) {
        return {
            which_data_list: ['replay', 'who_play', 'play_status',], callback_list: [extend.base_control,]
        }
    }

    /**
     * 获取当前数据库歌词
     * @param {Vue} vm Vue实例
     * @param {Object} extend 父类
     * @return {{which_data_list: string[], callback_list: MyUtils.music_info_list_control[]}}
     */
    get_music_info_list(vm, extend) {
        return {
            which_data_list: ['music_name_list',], callback_list: [extend.music_info_list_control,]
        }
    }

    /**
     *
     * @param vm
     * @param extend
     * @returns {{which_data_list: string[], callback_list: MyUtils.music_url_control[]}}
     */
    get_music_url(vm, extend) {
        return {
            which_data_list: ['now_music_url',], callback_list: [extend.music_url_control,]
        }
    }

    /**
     * 获取当前数据库歌词
     * @param {Vue} vm Vue实例
     * @param {Object} extend 父类
     * @return {{which_data_list: string[], callback_list: MyUtils.lyric_control[]}}
     */
    get_lyric(vm, extend) {
        // this.get_data(vm, who, ['lyric_name'], [this.lyric_control]);
        return {
            which_data_list: ['lyric_name',], callback_list: [extend.lyric_control,]
        }
    }

    /**
     * 获取当前数据库是否开始统计
     * @param {Vue} vm Vue实例
     * @param {Object} extend 父类
     * @return {{which_data_list: string[], callback_list: MyUtils.is_running_control[]}}
     */
    get_is_running(vm, extend) {
        return {
            which_data_list: ['is_running',], callback_list: [extend.is_running_control,]
        }
    }

    /**
     * 获取当前数据库控制台信息
     * @param {Vue} vm Vue实例
     * @param {Object} extend 父类
     * @return {{which_data_list: string[], callback_list: MyUtils.console_info_control[]}}
     */
    get_console_info(vm, extend) {
        return {
            which_data_list: ['console_info',], callback_list: [extend.console_info_control,]
        }
    }

    /**
     * 获取当前数据库控制台信息
     * @param {Vue} vm Vue实例
     * @param {Object} extend 父类
     * @return {{which_data_list: string[], callback_list: MyUtils.who_play_control[]}}
     */
    get_who_play(vm, extend) {
        return {
            which_data_list: ['who_play',], callback_list: [extend.who_play_control,]
        }
    }


    /**
     * 获取数据库空闲歌单
     * @param {Vue} vm Vue实例
     * @param {Object} extend 父类
     */
    get_user_playlist(vm, extend) {
        return {which_data_list: ['user_playlist'], callback_list: [extend.set_idle_playlist]}
    }

    /**
     * 基本控制(播放状态, 谁来播放, 重播状态)
     * @param {Vue} vm Vue实例
     * @param {Object} extend 父类
     * @param {{replay, who_play, play_status, play}} data 服务器返回数据
     */
    base_control(vm, extend, data) {
        console.log(data);
        // let who_play_flag = (data.who_play === 'music' ? 0 : 1) === vm.$data.who_play;
        let who_play_flag, replay;
        if (data.who_play !== undefined) {
            vm.$data.who_play = data.who_play;
        }
        if (data.play_status !== undefined) {
            vm.$data.play_icon_flag = data.play_status;
        } else if (data.play !== undefined) {
            vm.$data.play_icon_flag = data.play;
        } else {
            vm.$data.play_icon_flag = 1;
        }
        if (data.who_play !== undefined) {
            who_play_flag = data.who_play === vm.$data.who_i_am;
        } else {
            who_play_flag = vm.$data.who_play === vm.$data.who_i_am;
        }
        if (data.replay !== undefined) {
            replay = data.replay;
        } else {
            replay = 0;
        }
        // 谁来播放
        console.log(`is_play: ${extend.is_play}`);
        const who = vm.$data.who_play === 0 ? 'music' : 'lyric';
        if (vm.$data.play_icon_flag && !extend.is_play && who_play_flag) {
            // extend.htmlAudioElement.play().then(() => {
            //     extend.is_play = 1;
            // })
            extend.music_play(vm, who)
        } else if (!vm.$data.play_icon_flag && extend.is_play && who_play_flag) {
            extend.htmlAudioElement.pause();
            extend.is_play = 0;
        } else if (vm.$data.play_icon_flag && extend.is_play && !who_play_flag) {
            extend.htmlAudioElement.pause();
            extend.is_play = 0;
        }
        if (replay && who_play_flag) {
            extend.htmlAudioElement.load();
            localStorage.setItem(this.htmlAudioElement.src, '1');
            // extend.htmlAudioElement.play().then(() => {
            //     extend.is_play = 1;
            //     if (data.who_play === 'lyric') {
            //         extend.n = (parseInt(vm.$data.v_li_margin) + parseInt(vm.$data.li_height)) * 2
            //         extend.change(vm);
            //     }
            // })
            extend.music_play(vm, who)
            // extend.update_play_data(vm, 'replay', 0);
        }
    }

    /**
     * 歌名控制
     * @param { Vue } vm Vue实例
     * @param { Object } extend 父类
     * @param {{ music_name_list: [{file_name}], music_info_list: [{file_name}] }} data 服务器返回数据
     */
    music_info_list_control(vm, extend, data) {
        console.log(data)
        let music_info
        let music_info_list;
        try {
            music_info_list = data.music_name_list;
            music_info = music_info_list[0];
        } catch (e) {
            music_info_list = data.music_info_list;
            music_info = music_info_list[0];
        }
        // const temp = [];
        // music_info_list.forEach(element => {
        //     temp.push(element.file_name);
        // })
        // vm.$data.music_info = temp;
        vm.$data.music_info = music_info_list;
        if (music_info !== undefined && music_info.file_name !== undefined) {
            if (!extend.is_empty(music_info.file_name[0])) {
                vm.$data.now_music_name = music_info.file_name.join(', ');
                // extend.get_union_data(vm, extend, [extend.get_music_url]);
            } else {
                vm.$data.wss.next_music();
                // $.get('/next_music', {url: vm.$data.url, where: vm.$data.who_i_am ? 'lyric' : 'music'});
            }
        } else {
            vm.$data.music_info = [{
                file_name: ['暂无歌曲', '无'],
                uid: 0
            }];
            vm.$data.now_music_name = '';
            extend.htmlAudioElement.src = '';
            extend.is_play = 0;
        }
    }

    /**
     * 歌词控制
     * @param {Vue} vm Vue实例
     * @param {Object} extend 父类
     * @param {{ lyric_name: Object }} data 服务器返回数据
     */
    lyric_control(vm, extend, data) {
        console.log(data);
        let lyric = data.lyric_name;
        let lyric_id;
        try {
            lyric_id = lyric[0].id;
        } catch (e) {
            lyric_id = null;
        }
        if (!extend.is_empty(lyric_id)) {
            extend.is_has_field({"A": {'a': 'b'}}, 'a');
            vm.$data.lyric_info = data.lyric_name;
        } else {
            vm.$data.lyric_info = [{"id": 0, "original": "暂无歌词", "translation": "no find lyric"}];
        }
    }

    /**
     * 歌曲播放url控制
     * @param {Vue} vm Vue实例
     * @param {Object} extend 父类
     * @param {{ now_music_url: string, who_play: number }} data 服务器返回数据
     */
    music_url_control(vm, extend, data) {
        console.log(data);
        extend.htmlAudioElement.pause();
        extend.htmlAudioElement.src = data.now_music_url;
        /*if (data.now_music_url === '') {
            const who = data.who_play === 0 ? 'music' : 'lyric';
            // $.get('/next_music', {url: vm.$data.url, where: who})
            vm.$data.wss.next_music();
        }*/
        // extend.htmlAudioElement = new Audio();
        extend.is_play = 0;
        // extend.update_play_data(vm, 'replay', 0);
    }

    /**
     * 歌曲播放控制
     * @param {Vue} vm Vue实例
     * @param {Object} extend 父类
     * @param {{ is_running: number }} data 服务器返回数据
     */
    is_running_control(vm, extend, data) {
        const is_running = data.is_running;
        console.log(is_running)
        if (is_running) {
            vm.$data.start_flag = true;
            vm.$data.start_getting_text = '停止统计';
        } else {
            vm.$data.start_flag = false;
            vm.$data.start_getting_text = '开始统计';
        }
    }

    /**
     * 由谁播放控制
     * @param {Vue} vm Vue实例
     * @param {Object} extend 父类
     * @param {{ who_play: number }} data 服务器返回数据 (0:歌名, 1:歌词)
     */
    who_play_control(vm, extend, data) {
        const who_play = data.who_play;
        vm.$data.who_play = who_play;
        console.log(who_play);
        $("[name='switch']:eq(0)").prop("checked", !who_play);
    }

    /**
     * 控制台信息控制
     * @param {Vue} vm Vue实例
     * @param {Object} extend 父类
     * @param {{ console_info: number }} data 服务器返回数据
     */
    console_info_control(vm, extend, data) {
        const console_info = data.console_info;
        console.log(console_info);
        vm.$data.console_info = console_info;
    }

    /**
     * 获取当前数据库数据
     * @param {Vue} vm Vue实例
     * @param {Object} extend 父类
     * @param {string[]} which_data_list 请求哪些数据 列表
     * @param callback_func_list 回调函数列表
     */
    get_data(vm, extend, which_data_list, callback_func_list) {
        const who = vm.$data.who_i_am ? 'lyric' : 'music';
        $.getJSON('get_data', {
            url: vm.$data.url, where: who, which_data: JSON.stringify(which_data_list)
        }, data => {
            callback_func_list.forEach(func => {
                func(vm, extend, data);
            });
            // callback_func_list(vm, data);
        })
    }

    /**
     * 一次获取多项数据
     * @param {Vue} vm Vue实例
     * @param {Object} extend 父类
     * @param func_list 获取数据及对应的回调函数的函数
     */
    get_union_data(vm, extend, func_list) {
        let callback_list = [];
        let which_data_list = [];
        func_list.forEach(element => {
            const temp = element(vm, extend);
            callback_list = [...callback_list, ...temp.callback_list];
            which_data_list = [...which_data_list, ...temp.which_data_list]
        })
        this.get_data(vm, extend, which_data_list, callback_list);
    }

    /**
     * 字符串是否为空
     * @param {string|Object} obj
     * @returns {boolean}
     */
    is_empty(obj) {
        try {
            return obj.trim() === '';
        } catch (e) {
            return obj === null || obj === undefined;
        }
    }

    /**
     * 在对象的 key 和 value 里搜索传入的值
     * @param {Object} obj
     * @param {number | string} search_item
     * @returns {boolean}
     */
    is_has_field(obj, search_item) {
        let status = false;
        if (typeof obj === 'object') {
            for (const objKey in obj) {
                if (objKey === search_item) {
                    status = true;
                    break;
                }
                if (obj[objKey] === search_item) {
                    status = true;
                    break;
                }
                status = this.is_has_field(obj[objKey], search_item);
            }
        }
        return status;
    }

    /*
        /!**
         *
         * @param {Vue} vm Vue实例
         * @param {string} who 歌名 或 歌词
         *!/
        from_sever_get_data(vm, who) {
            $.getJSON('/get_data', {url: vm.$data.url, where: who}, data => {
                console.log(this.is_play)
                this.do_some_command(vm, data, who)
            })
        }

        /!**
         * 根据获取的数据操作歌名或歌词
         * @param {Vue} vm Vue实例
         * @param {JSON} data 服务器返回的json数据
         * @param {string} who 歌名 或 歌词
         *!/
        do_some_command(vm, data, who) {
            console.log(data)
            console.log(this.last)

            // 当前歌曲名
            let now_music_name
            // 播放/暂停
            const play_ = data['data']['play_']
            // 从头开始
            const replay = data['data']['replay']
            // 歌词
            const lyric = data['data']['lyric_name']
            // 是否开始统计
            const is_running = data['data']['is_running']
            // 播放地址
            const music_url = data['data']['now_music_url']
            // 歌曲列表
            const music_list = data['data']['music_name_list']
            // 全局设置
            const global_setting = data['data']['global_setting']
            //
            const user_set = data['data']['user_set']

            switch (who) {
                case 'lyric':
                    vm.$data.theme_id = parseInt(user_set['theme_id'])
                    vm.$data.v_div_width = parseInt(user_set['div_width'])
                    vm.$data.v_div_height = parseInt(user_set['div_height'])
                    vm.$data.v_first_color = user_set['original_text_color']
                    vm.$data.v_first_font = user_set['original_text_font']
                    vm.$data.v_first_font_size = parseInt(user_set['original_text_font_size'])
                    vm.$data.v_second_color = user_set['translation_color']
                    vm.$data.v_second_font = user_set['translation_font']
                    vm.$data.v_second_font_size = parseInt(user_set['translation_font_size'])
                    vm.$data.v_now_color = user_set['now_color']
                    vm.$data.v_now_font = user_set['now_font']
                    vm.$data.v_now_font_size = parseInt(user_set['now_font_size'])
                    vm.$data.v_li_margin = user_set['v_li_margin']
                    vm.$data.now_shadow_num = parseInt(user_set['now_shadow_num'])
                    vm.$data.now_shadow_blur = parseInt(user_set['now_shadow_blur'])
                    vm.$data.now_shadow_color = user_set['now_shadow_color']
                    vm.$data.first_shadow_num = parseInt(user_set['original_shadow_num'])
                    vm.$data.first_shadow_blur = parseInt(user_set['original_shadow_blur'])
                    vm.$data.first_shadow_color = user_set['original_shadow_color']
                    vm.$data.second_shadow_num = parseInt(user_set['translation_shadow_num'])
                    vm.$data.second_shadow_blur = parseInt(user_set['translation_shadow_blur'])
                    vm.$data.second_shadow_color = user_set['translation_shadow_color']
                    break
                case 'music':
                    vm.$data.theme_id = parseInt(user_set['theme_id'])
                    vm.$data.v_div_width = parseInt(user_set['div_width'])
                    vm.$data.v_div_height = parseInt(user_set['div_height'])
                    vm.$data.v_first_color = user_set['music_color']
                    vm.$data.v_first_font = user_set['music_font']
                    vm.$data.v_first_font_size = parseInt(user_set['music_font_size'])
                    vm.$data.v_second_color = user_set['artist_color']
                    vm.$data.v_second_font = user_set['artist_font']
                    vm.$data.v_second_font_size = parseInt(user_set['artist_font_size'])
                    // vm.$data.now_color = user_set['now_color']
                    // vm.$data.now_font = user_set['now_font']
                    // vm.$data.now_font_size = user_set['now_font_size']
                    vm.$data.v_li_margin = parseInt(user_set['v_li_margin'])
                    // vm.$data.now_shadow_num = user_set['now_shadow_num']
                    // vm.$data.now_shadow_blur = user_set['now_shadow_blur']
                    // vm.$data.now_shadow_color = user_set['now_shadow_color']
                    vm.$data.first_shadow_num = parseInt(user_set['music_shadow_num'])
                    vm.$data.first_shadow_blur = parseInt(user_set['music_shadow_blur'])
                    vm.$data.first_shadow_color = user_set['music_shadow_color']
                    vm.$data.second_shadow_num = parseInt(user_set['artist_shadow_num'])
                    vm.$data.second_shadow_blur = parseInt(user_set['artist_shadow_blur'])
                    vm.$data.second_shadow_color = user_set['artist_shadow_color']
                    break
            }

            // 由谁播放 0:music 1:lyric
            vm.$data.who_play = data['data']['who_play']
            // vm.$data.play_icon_flag = play_
            vm.$data.black_user_list = global_setting['black_user_list']
            vm.$data.black_music_list = global_setting['black_music_list']
            let temp = [{"id": 0, "original": "暂无歌词", "translation": "no find lyric"}]

            try {
                if (lyric[0].id != null) {
                    vm.$data.lyric_info = lyric
                } else {
                    vm.$data.lyric_info = temp
                }
                vm.$data.music_url = music_url
                vm.$data.stop_flag = is_running
            } catch (e) {
                vm.$data.lyric_info = temp
                vm.$data.music_url = music_url
                vm.$data.stop_flag = is_running
            }

            console.log(music_list)

            try {
                now_music_name = JSON.parse(JSON.stringify([music_list[0]]))
            } catch (e) {
                now_music_name = []
            }
            if ((now_music_name.equals([undefined]) || now_music_name.equals([['', '']])) && !music_list.equals([])) {
                now_music_name = []
                $.get('/next_music', {url: vm.$data.url, where: who})
            }
            console.log('vm.now_music_name: ' + vm.$data.now_music_name)
            console.log('now_music_name: ' + now_music_name)

            // 谁来播放
            if (play_ && !this.is_play && (who === 'music' ? vm.$data.who_play === 0 : vm.$data.who_play === 1)) {
                this.htmlAudioElement.play().then(() => {
                    this.is_play = 1
                })
            }

            // 谁需要暂停
            switch (who) {
                case 'music':
                    // 是否需要暂停
                    if (vm.$data.who_play && this.is_play) {
                        this.htmlAudioElement.pause()
                        this.is_play = 0
                    }
                    if (music_list.equals([])) {
                        console.log('暂无歌曲')
                        vm.$data.music_info = [['暂无歌曲', '无']]
                        console.log(vm.$data.music_info)
                    }
                    break
                case 'lyric':
                    // 是否需要暂停
                    if (!vm.$data.who_play && this.is_play) {
                        this.htmlAudioElement.pause()
                        this.is_play = 0
                    }
                    break
            }
            // 自己要不要从头播放
            if (replay && this.is_play) {
                $.get('/play', {url: vm.$data.url, data: 0, where: 'replay', where_url: who + '_url'})
                this.htmlAudioElement.load()
                this.htmlAudioElement.play().then(() => {
                    // 重置歌词与歌名到最初状态
                    this.is_play = 1
                })
                this.n = (parseInt(vm.$data.v_li_margin) + parseInt(vm.$data.li_height)) * 2
                this.change(vm)
                this.update_play_data(vm, 'replay', 0);
            }

            // 我自己要不要暂停
            if (!play_) {
                this.htmlAudioElement.pause()
                this.is_play = 0
            }
            vm.$data.now_music_name = now_music_name.join(',')
            if (music_list.equals([])) {
                vm.$data.music_info = [['暂无歌曲', '无']]
            } else {
                vm.$data.music_info = music_list
            }
        }

        /!**
         * 当now_music_name为新的时候，根据内容执行下一首还是播放music_url
         * @param {Vue} vm Vue实例
         * @param {string} music_url
         * @param {string} who
         *!/
        prepare_to_music_play(vm, music_url, who) {

            let now_music_name = vm.$data.now_music_name
            this.htmlAudioElement.pause()
            // if (now_music_name.equals([]) || now_music_name.equals(['']) || now_music_name.equals(['', ''])) {
            //     $.get('/next_music', {url: vm.$data.v_url, where: who})
            //     this.n = 220
            //     this.change()
            if (now_music_name === '') {
                $.get('/next_music', {url: vm.$data.url, where: who})
                if (who === 'lyric') {
                    this.n = (parseInt(vm.$data.v_li_margin) + parseInt(vm.$data.li_height)) * 2
                    this.change(vm)
                }
            } else {
                try {
                    this.htmlAudioElement.pause()
                    this.is_play = 0
                } catch (e) {
                    console.log()
                }
                switch (who) {
                    case 'music':
                        setTimeout(() => {
                            if (who === 'music' ? vm.$data.who_play === 0 : vm.$data.who_play === 1) {
                                this.music_play(vm, music_url, 'music')
                            }
                        }, 2000)
                        break
                    case 'lyric':
                        setTimeout(() => {
                            if (who === 'music' ? vm.$data.who_play === 0 : vm.$data.who_play === 1) {
                                this.music_play(vm, music_url, 'lyric')
                            }
                        }, 2000)
                        const class_names = {
                            'link-navbar': 'background-color: #333 !important',
                            'title': 'color: #fff',
                            're-title': 'color: #fff'
                        }
                }
            }
        }
    */

    /**
     * 阻塞器
     * @param {Number} num 阻塞时间 (毫秒)
     * @returns {Promise}
     */
    async delayTime(num) {
        return new Promise((resolve, reject) => { // return / await 等待执行完
            setTimeout(() => {
                resolve('延迟')
                // console.log('延迟')
            }, num)
        })
    }

    /**
     * 设置页面的歌名预览定时加入歌名
     * @param {Vue} vm Vue实例
     */
    test_music(vm) {
        if (vm.$data.test_flag < vm.$data.music_info_test.length - 1) {
            vm.$data.music_info[vm.$data.test_flag] = vm.$data.music_info_test[vm.$data.test_flag];
            console.log(vm.$data.test_flag);
            console.log(vm.$data.music_info);
            vm.$data.test_flag++;
        } else {
            clearInterval();
        }
    }

    /**
     * 设置界面的歌词预览定时滚动
     * @param {Vue} vm Vue实例
     * @returns {Promise<void>}
     */
    async test_lyric(vm) {
        let c = 0
        let last = 0
        this.n = (parseInt(vm.$data.v_li_margin) + parseInt(vm.$data.li_height)) * 2
        const time_list = [[2, 6], [6, 8], [8, 11], [11, 14], [14, 15], [15, 20], [20, 25], [25, 30], [30, 35], [35, 40], [40, 45], [45, 50], [50, 55], [55, 60], [60, 65], [65, 70], [70, 75], [75, 80], [80, 85], [85, 90], [90, 95], [95, 100], [100, 105], [105, 110], [110, 115], [115, 120], [120, 125], [125, 130], [130, 135], [135, 140], [140, 145], [145, 150]]
        for (let i = 0; i < 155; i++) {
            await this.delayTime(1000)
            if (this.global_time_break_flag) {
                break
            }
            console.log(i)
            // await new MyTimer().delayTime(1000)
            c = this.show_now_lyric(c, time_list.length, time_list, last)
            last++
        }
        if (!this.global_time_break_flag) {
            await this.test_lyric(vm)
        }
        this.global_time_break_flag = false
    }

    /**
     * 延迟提交的阻塞器
     * @param {Vue} vm Vue实例
     * @param {Number} num 阻塞时间 (秒)
     * @param {string} where 歌名 或 歌词
     * @returns {Promise<void>}
     */
    async delay_timer(vm, num, where) {
        for (let i = num; i > 0; i--) {
            i = this.global_time--
            console.log(i)
            await this.delayTime(1000)
        }
        this.use_get(vm, where)
        this.global_time_flag = true
    }

    /**
     * 延迟提交设置 (减少提交次数)
     * @param {Vue} vm Vue实例
     * @param {Number} num 阻塞时间 (秒)
     * @param {string} where 歌名 或 歌词
     */
    delay_post_setting(vm, num, where) {
        this.global_time = num
        if (this.global_time_flag) {
            this.change_load_info(vm, true, 'load')
            this.delay_timer(vm, num, where).then(() => {
            })
        }
        this.global_time_flag = false
    }

    /**
     * 重置个人数据库
     * @param {Vue} vm Vue实例
     * @param {string} where 歌名 或 歌词
     */
    reset_own_database(vm, where) {
        $.getJSON('/reset_own_database', {where_url: where, url: vm.$data.url}, data => {
            if (data) {
                vm.$data.mask2_1 = true
            } else {
                vm.$data.mask2_2 = true
            }
        })
    }

    /**
     * 将内容复制到剪切板
     * @param {Vue} vm Vue实例
     * @param {string} css_selector css选择器文本, 用来获取指向的内容
     * @param {string} content 内容
     */
    copy_content(vm, css_selector, content) {
        navigator.clipboard.writeText(content).then(r => {
            console.log(r)
            console.log('复制成功')
            // throw Error;
            this.change_load_info(vm, true, 'copy_sus')
        }).catch(err => {
            console.log(err)
            $(css_selector).select();
            try {
                document.execCommand('copy');
                this.change_load_info(vm, true, 'copy_sus')
            } catch (e) {
                this.change_load_info(vm, true, 'copy_fail')
            }
        })
    }

    /**
     * 显示右上角的提示
     * @param {Vue} vm Vue实例
     * @param {Number, boolean} show_flag
     * @param {string} command 指令
     * @param {string} detail 详细内容
     */
    change_load_info(vm, show_flag, command, detail = '') {
        vm.$data.load_info_flag = show_flag
        switch (command) {
            case 'sus':
                vm.$data.load_info_icon = 'check'
                vm.$data.load_info = '设置已保存'
                break
            case 'fail':
                vm.$data.load_info_icon = 'close'
                vm.$data.load_info = '提交失败 原因: ' + detail
                break
            case 'load':
                vm.$data.load_info_icon = 'loading'
                vm.$data.load_info = '正在提交设置，请勿切换页面'
                break
            case 'copy_sus':
                vm.$data.load_info_icon = 'check'
                vm.$data.load_info = '已复制到剪切板'
                break
            case 'copy_fail':
                vm.$data.load_info_icon = 'close'
                vm.$data.load_info = '复制失败'
                break
        }
        if (command) {
            this.delayTime(3000).then(() => {
                this.change_load_info(vm, false, '')
            })
        }
    }

    /**
     * 获取qq登录账户里的歌单
     * @param {Vue} vm Vue实例
     */
    get_qq_playlist(vm) {
        $.getJSON('get-qq-playlist', {
            url: vm.$data.url,
            where_url: vm.$data.who_i_am ? 'lyric_url' : 'music_url'
        }, (data) => {
            console.log(data)
            const playlists = data.data.disslist
            for (let i = 1; i < playlists.length; i++) {
                const playlist = playlists[i]
                console.log('list_name: %s, id: %s', playlist.diss_name, playlist.tid)
                // console.log(playlist.diss_cover)
                vm.$data.playlist_name.push({
                    tid: playlist.tid,
                    name: playlist.diss_name,
                    song_count: playlist.song_cnt,
                    platform_text: 'QQ音乐',
                    platform: 'qq',
                    cover: playlist.diss_cover === '?n=1' ? '' : playlist.diss_cover,
                })
            }
        })
    }

    /**
     * 获取qq音乐指定歌单内歌曲
     * @param {Vue} vm Vue实例
     */
    get_qq_playlist_info(vm) {
        $.getJSON('get-qq-playlist-info', {playlist_id: vm.$data.playlist_id}, (data) => {
            console.log(data)
        })
    }

    /**
     * 获取网易云登录账户里的歌单
     * @param {Vue} vm Vue实例
     */
    get_cloud_playlist(vm) {
        $.getJSON('get-cloud-playlist', {
            url: vm.$data.url,
            where_url: vm.$data.who_i_am ? 'lyric_url' : 'music_url'
        }, (data) => {
            console.log(data);
            const playlist = data.playlist;
            for (const playlistElement of playlist) {
                const items = {
                    tid: playlistElement.id,
                    name: playlistElement.name,
                    song_count: playlistElement.trackCount,
                    platform_text: '网易云',
                    platform: 'cloud',
                    cover: playlistElement.coverImgUrl === '?n=1' ? '' : playlistElement.coverImgUrl,
                };
                vm.$data.playlist_name.push(items)
            }
        })
    }

    /**
     * 获取所有登录账户里的歌单
     * @param {Vue} vm Vue实例
     */
    get_all_playlist(vm) {
        this.get_qq_playlist(vm);
        this.get_cloud_playlist(vm);
    }

    /**
     * 将指定歌单内容传到数据库
     * @param {Vue} vm Vue实例
     */
    load_playlist_to_database(vm) {
        setTimeout(() => {
            $.getJSON('load-playlist-to-database', {
                url: vm.$data.url,
                where_url: `${vm.$data.where}_url`,
                platform: vm.$data.playlist_platform,
                overwrite: vm.$data.playlist_overwrite,
                playlist_id: vm.$data.playlist_id
            });
        }, 1000);
    }

    /**
     * 设置显示空闲歌单
     * @param {Vue} vm Vue实例
     * @param {Object} extend 父类
     * @param {{username: number, user_playlist: {status: boolean, playlist: [{id, file_name: [string, string], platform}]}}} data 空闲歌单
     */
    set_idle_playlist(vm, extend, data) {
        vm.$data.idle_playlist = [];
        $("[name='use_playlist']:eq(0)").prop("checked", data.user_playlist.status);
        for (const music_info of data.user_playlist.playlist) {
            let plat = '';
            const [a, b] = music_info.file_name;
            switch (music_info.platform) {
                case 'qq':
                    plat = 'QQ音乐';
                    break;
                case 'cloud':
                    plat = '网易云';
                    break;
                case 'ku_wo':
                    plat = '酷我';
                    break;
                default:
                    plat = '未定义';
            }
            vm.$data.idle_playlist.push({name: a, artist: b, platform_text: plat});
        }
    }

    /**
     * 开始统计
     * @param {Vue} vm Vue实例
     */
    start_getting(vm) {
        let params = {
            url: vm.$data.url,
            where: vm.$data.where
        };
        if (vm.$data.start_flag) {
            params.data = 0;
            $.get('start_dan_mu', params, data => {
                if (data['data'] !== 'id' && data['data'] !== 'key') {
                    vm.$data.start_getting_text = '开始统计'
                    vm.$data.start_flag = false
                }
            })
        } else {
            params.data = 1;
            $.getJSON('start_dan_mu', params, data => {
                if (data['data'] !== 'id' && data['data'] !== 'key') {
                    vm.$data.start_getting_text = '停止统计'
                    vm.$data.start_flag = true
                }
            })
        }
    }

    /**
     * 谁来播放, 原sql_who_play
     * @param {Vue} vm Vue实例
     */
    change_who_play(vm) {
        const who = $("[name='switch']:eq(0)").prop("checked");
        this.update_play_data(vm, 'who_play', Number(!who));
    }

    use_playlist(vm) {
        const who = $("[name='use_playlist']:eq(0)").prop("checked");
        this.update_play_data(vm, 'use_playlist', Number(who));
    }

    /**
     * 播放/暂停, 原sql_play
     * @param {Vue} vm Vue实例
     */
    play_pause(vm) {
        vm.$data.play_icon_flag = vm.$data.play_icon_flag ? 0 : 1
        this.update_play_data(vm, 'play', vm.$data.play_icon_flag);
    }

    /**
     * 重播, 原sql_replay
     * @param {Vue} vm Vue实例
     */
    replay_music(vm) {
        this.update_play_data(vm, 'replay', 1);
    }

    /**
     *
     * @param {Vue} vm Vue实例
     * @param {'play', 'replay', 'who_play', 'use_playlist'} change_where 改哪里
     * @param {number} new_data 改成什么
     */
    update_play_data(vm, change_where, new_data) {
        const params = {
            url: vm.$data.url,
            data: new_data,
            where: change_where,
            where_url: `${vm.$data.who_i_am ? 'lyric' : 'music'}_url`
        }
        $.get('play', params);
    }

    /**
     * 重播, 原sql_next
     * @param {Vue} vm Vue实例
     */
    next_music(vm) {
        const params = {
            url: vm.$data.url, where: vm.$data.where
        }
        $.get('next_music', params)
    }

    /**
     * 删除音乐, 原sql_delete_bili
     * @param {Vue} vm Vue实例
     * @param {string} select_obj_text css选择器
     * @param {string} music 歌曲名
     * @param {string} artist 歌手
     */
    delete_music(vm, select_obj_text, music, artist) {
        const params = {
            url: vm["$vm"]["url"],
            data: vm["$vm"]["play_icon_flag"],
            artist: artist,
            where_url: `${vm["$vm"]["where"]}_url`,
            music_name: music,
        }
        $.get('del_music', params)
        // $(select_obj_text).remove();
    }

    /**
     * 移动音乐, 原sql_move_bili_music
     * @param {Vue} vm Vue实例
     * @param {string} select_obj_text css选择器
     * @param {string} music 歌曲名
     * @param {string} artist 歌手
     * @param {Number} index 移动位置
     */
    move_music(vm, select_obj_text, music, artist, index) {
        const params = {
            url: vm["$vm"]["url"],
            data: vm["$vm"]["play_icon_flag"],
            index: index,
            artist: artist,
            where_url: `${vm["$vm"]["where"]}_url`,
            music_name: music,
        }
        $.get('move_music', params)
    }


    display_operation(select_obj_text) {
        $(select_obj_text).css('display', 'flex')
    }

    hidden_operation(select_obj_text) {
        $(select_obj_text).css('display', 'none')
    }

    change_bili_scroll_flag(vm, data) {
        vm.$data.scroll_flag = data
    }

    get_music_info(vm) {
        $.getJSON('/get_data', {url: vm.$data.url, where: vm.$data.where}, data => {
            console.log(data)
            let now_music_name;
            let html_music_name;
            const music_list = data['data']['music_name_list'];  // 歌曲列表
            const who_play = data['data']['who_play']
            const is_running = data['data']['is_running']
            vm.$data.console_info = data['data']['console_info']
            vm.$data.play_icon_flag = data['data']['play_']
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
                vm.$data.start_flag = true;
            } else {
                $('#start_dan_mu').text('开始统计');
                vm.$data.start_flag = false;
            }
            if (!(music_list.equals(vm.$data.last_list))) {
                // let html_list = [];
                vm.$data.last_list = music_list;
                /*for (let j = 0; j < music_list.length; j++) {
                    html_list[j] = " <span class=\"music-name\">" + music_list[j][0] + "</span><span class=\"artist\">" + music_list[j][1] + "</span><div class=\"operation\">" +
                        "<button class=\"delete conform\" onclick=\"sql_delete_bili(\'#li" + j + "\', \'" + music_list[j][0] + "\', \'" + music_list[j][1] + "\', \'" + th.url + "\', where)\">删除</button>" +
                        "<button class=\"delete conform\" onclick=\"sql_move_bili_music(\'#li" + j + "\', \'" + music_list[j][0] + "\', \'" + music_list[j][1] + "\', 1, \'" + th.url + "\', where)\">播放</button>" +
                        "<button class=\"delete conform\" onclick=\"sql_move_bili_music(\'#li" + j + "\', \'" + music_list[j][0] + "\', \'" + music_list[j][1] + "\', 2, \'" + th.url + "\', where)\">下一首播放</button></div>"
                }
                // f.innerHTML = html_list.join('');
                th.music_info = html_list*/
                vm.$data.music_list = music_list
            }
            if (!(now_music_name.equals(vm.$data.last))) {
                vm.$data.last = now_music_name;
                if (vm.$data.last.equals([]) || vm.$data.last.equals([['', '']])) {
                    html_music_name = "<li><span class=\"music-name\">暂无歌曲</span>" + "<span class=\"artist\">暂无</span></li>";
                } else {
                    html_music_name = "<li><span class=\"music-name\">" + now_music_name[0][0] + "</span>" + "<span class=\"artist\">" + now_music_name[0][1] + "</span></li>";
                }
                const f = document.getElementById('u');
                const children = f.childNodes;
                for (let i = children.length - 1; i >= 0; i--) {
                    f.removeChild(children[i]);
                }
                f.innerHTML = html_music_name;
            }
        })
    }

    on_wss(msg_json, extend, params) {
        // let user = msg_json.data.uname  // 用户名
        // let com = msg_json.data.msg  // 弹幕内容
        if (msg_json.cmd === 'LIVE_OPEN_PLATFORM_DM') {
            const vm = params[0]
            const url = params[1];
            const who = params[2];
            const {
                uid,
                uname,
                guard_level,
                fans_medal_name,
                fans_medal_level,
                fans_medal_wearing_status,
                command,
                comment
            } = extend.unpack_dan_mu(msg_json);
            console.log('comment: ' + comment + '\ncommand: ' + command)
            if (command === '点歌' || command === '.') {
                let {music_name, artist, status} = extend.dan_mu_msg_filter(vm, extend, uid, uname, comment, command)

                if ((vm.$data.start_flag !== undefined ? vm.$data.start_flag : true) && status && vm.$data.who_play === vm.$data.who_i_am) {
                    extend.send_music_info_to_server(vm, music_name, artist, uid, uname)
                } else {
                    console.log('stop\n' + music_name + ': ' + artist)
                }

            } else if ((command === '切歌' || command === '>') && vm.$data.music_info[0].uid !== undefined ?  vm.$data.music_info[0].uid === 0 ? true : vm.$data.music_info[0].uid === uid : true) {
                if (!extend.is_black_user(vm, uid, uname)) {
                    // $.get('/next_music', {url: url, where: who})
                    vm.$data.wss.next_music();
                }
            }
        }
    }

    /**
     * 按用户设置的条件过滤信息
     * @param vm
     * @param extend
     * @param uid
     * @param uname
     * @param comment
     * @param command
     * @return {{artist: (string|string|jQuery), music_name: (string|string|jQuery), status: boolean}}
     */
    dan_mu_msg_filter(vm, extend, uid, uname, comment, command) {
        // 判断状态
        let status
        // 歌曲名
        let music_name
        // 歌手
        let artist
        console.log('comment: ' + comment + '\ncommand: ' + command)
        if (command === '点歌' || command === '.') {
            status = true
            comment = comment.join(' ')
            comment = comment.split('&')
            if (comment[1] === undefined) {
                comment = comment[0].split('＆')
            }
            console.log(comment)
            music_name = $.trim(comment[0])
            artist = $.trim(comment[1])
            console.log('music_name: ' + music_name + '\nartist: ' + artist)
            status = !extend.is_black_user(vm, uid, uname);
            status = !extend.is_black_music(vm, music_name, artist);
        } else {
            status = false
        }
        return {music_name, artist, status}
    }

    /**
     * 歌曲是否在黑名单中
     * @param {Vue} vm
     * @param {string} music_name
     * @param {string} artist
     * @returns {boolean}
     */
    is_black_music(vm, music_name, artist) {
        let status = false;
        // 歌曲黑名单
        for (const blackMusicListElement of vm.$data.black_music_list) {
            try {
                switch (music_name.toUpperCase()) {
                    case blackMusicListElement.music_name.toUpperCase():
                        status = true;
                        break;
                }
            } catch (e) {
            }
            try {
                switch (artist.toUpperCase()) {
                    case blackMusicListElement.artist.toUpperCase():
                        status = true;
                        break;
                }
            } catch (e) {
            }
        }
        return status;
    }

    /**
     * 用户是否在黑名单中
     * @param {Vue} vm
     * @param {number} uid
     * @param {string} uname
     * @returns {boolean}
     */
    is_black_user(vm, uid, uname) {
        let status = false;
        // 用户黑名单
        for (const blackUserListElement of vm.$data.black_user_list) {
            try {
                switch (uid) {
                    case parseInt(blackUserListElement.uid):
                        status = true;
                        break;
                }
            } catch (e) {
                console.log('no uid')
            }
            try {
                switch (uname.toUpperCase()) {
                    case blackUserListElement.nick:
                        status = true;
                        break;
                }
            } catch (e) {
                console.log('no uname')
            }
        }
        return status;
    }

    /**
     * 解弹幕包
     * @param msg_json
     * @returns {{uid: (*|number), fans_medal_level: (*|number), uname: (*|string), comment: string[], fans_medal_name: (*|string), fans_medal_wearing_status: (*|boolean), command: string, guard_level: (*|number|undefined)}}
     */
    unpack_dan_mu(msg_json) {
        // 用户UID
        let uid = msg_json.data.uid
        // 弹幕内容
        let msg = msg_json.data.msg
        // 用户名
        let uname = msg_json.data.uname
        // 对应房间大航海 1：总督 2：提督 3：舰长
        let guard_level = msg_json.data.guard_level
        // 粉丝勋章名
        let fans_medal_name = msg_json.data.fans_medal_name
        // 粉丝勋章等级
        let fans_medal_level = msg_json.data.fans_medal_level
        // 该房间粉丝勋章佩戴情况 true佩戴 false未佩戴
        let fans_medal_wearing_status = msg_json.data.fans_medal_wearing_status

        // 主要内容
        let comment = msg.split('#')[0].split(' ')
        // 具体指令
        let command = comment.shift()
        return {
            uid,
            uname,
            guard_level,
            fans_medal_name,
            fans_medal_level,
            fans_medal_wearing_status,
            command,
            comment
        };
    }

    send_music_info_to_server(vm, music_name, artist, user_id, username) {
        // $.get('move_music', {
        //     index: -1,
        //     url: url,
        //     artist: artist,
        //     where_url: where,
        //     music_name: music_name
        // });
        vm.$data.wss.move_music(music_name, artist, user_id, username, -1);
    }
}
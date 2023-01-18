/**
 *
 * @param {{url, where}} user_params 用户设置字典
 * @param {Object} utils 工具类对象
 * @returns {Vue} Vue实例
 */
function load_for_bili_setting(user_params, utils = {}) {
    return new Vue({
        el: '#app',
        data: {

            vm: this,

            music_info: [],
            console_info: [''],

            c_num: 0,
            m_num: 0,

            url: user_params.url,
            where: user_params.where,
            who_i_am: user_params.where === 'lyric',

            // 添加歌单或歌曲
            music_mask: false,
            playlist: [],
            playlist_name: [
                // {
                //     tid: 8666904267,
                //     name: '测试单',
                //     song_count: 9,
                //     platform: 'QQ音乐',
                //     cover: 'http://y.gtimg.cn/music/photo_new/T002R300x300M000001uaniI0VY17D.jpg?n=1'
                // }
            ],
            playlist_mask: false,
            playlist_id: '',   //
            playlist_raw: '',  //
            playlist_platform: 'default',
            playlist_overwrite: 1,

            // 空闲歌单
            idle_playlist: [
                {
                    name: '',
                    artist: '',
                    platform_text: '',
                }
            ],
            idle_playlist_mask: false,

            // 添加歌曲
            mask1: false,

            // 遇到问题？
            mask2: false,
            mask2_1: false,
            mask2_2: false,

            add_music: false,
            add_playlist: true,
            choose_overwrite: false,

            last: '',
            utils: utils,

            now_play: ['暂无歌曲', '暂无'],
            wait_to_play: [],

            last_list: [],
            music_list: [],
            start_flag: false,
            scroll_flag: true,
            play_icon_flag: 1,
            start_getting_text: '开始统计',
            play_icon: ['icon-list_play', 'icon-list_stop'],
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
            },
        },
        watch: {
            console_info_change() {  // 列表内容改变
                this.c_num++
                if (this.scroll_flag) {
                    let ul = $('#console-info')  // 填id
                    ul.animate({scrollTop: ul.get(0).scrollHeight}, 1000)
                }
            },
            music_info_change() {
                this.now_play = this.music_info[0];
                let wait_to_play = [...this.music_info];
                wait_to_play.shift();
                this.wait_to_play = wait_to_play;
                this.m_num++
            },
            playlist_raw() {
                const keywords = {'ku_wo': 'www.kuwo.cn', 'cloud': 'music.163.com', 'qq': 'y.qq.com'}
                for (let keywordsKey in keywords) {
                    console.log(keywordsKey)
                    if (this.playlist_raw.indexOf(keywords[keywordsKey]) !== -1) {
                        this.playlist_platform = keywordsKey
                        break
                    }
                }

                this.playlist_id = this.playlist_raw.split('/').reverse()[0].split('=').reverse()[0]
            }
        },
        methods: {
            /**
             * 删除音乐, 原sql_delete_bili
             * @param {string} select_obj_text css选择器
             * @param {string} music 歌曲名
             * @param {string} artist 歌手
             */
            delete_music(select_obj_text, music, artist) {
                const params = {
                    url: this.url,
                    data: this.play_icon_flag,
                    artist: artist,
                    where_url: `${this.where}_url`,
                    music_name: music,
                }
                $.get('del_music', params)
                // $(select_obj_text).remove();
            },

            /**
             * 移动音乐, 原sql_move_bili_music
             * @param {string} select_obj_text css选择器
             * @param {string} music 歌曲名
             * @param {string} artist 歌手
             * @param {Number} index 移动位置
             */
            move_music(select_obj_text, music, artist, index) {
                const params = {
                    url: this.url,
                    data: this.play_icon_flag,
                    index: index,
                    artist: artist,
                    where_url: `${this.where}_url`,
                    music_name: music,
                }
                $.get('move_music', params)
            },
        },
        created() {
            // $.getJSON('/get_data?url=' + this.url + '&where=' + this.where, function (data) {
            //     // const play_ = data['data']['play_'];  // 播放还是暂停
            //     // th.change_image(play_);
            //     this.play_icon_flag = data['data']['play_'];  // 播放还是暂停
            // });
            // this.utils.get_music_info(this)
            // setInterval(() => {
            //     this.utils.get_music_info(this)
            // }, 5000);
        }
    })
}

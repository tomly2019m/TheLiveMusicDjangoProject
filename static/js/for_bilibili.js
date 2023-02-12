/**
 *
 * @param {{
 *           set_flag,
 *           secret,
 *           real_status,
 *           black_user_list,
 *           black_music_list,
 *           div_width,
 *           div_height,
 *           music_color,
 *           music_font,
 *           music_font_size,
 *           artist_color,
 *           artist_font,
 *           artist_font_size,
 *           v_li_margin,
 *           room_id,
 *           music_shadow_num,
 *           music_shadow_blur,
 *           music_shadow_color,
 *           artist_shadow_num,
 *           artist_shadow_blur,
 *           artist_shadow_color,
 *           theme_id,
 *           zh,
 *           en,
 *           url
 *           }} user_params 用户设置字典
 * @param {MyUtils} utils 工具类对象
 * @param {LiveMusicWebsocket} wss
 * @returns {Vue} Vue实例
 */
function load_for_bili_vue(
    // set_flag,
    // secret,
    // music_color,
    // div_width,
    // div_height,
    // music_font,
    // music_font_size,
    // artist_color,
    // artist_font,
    // artist_font_size,
    // v_li_margin,
    // music_shadow_num,
    // music_shadow_blur,
    // music_shadow_color,
    // artist_shadow_num,
    // artist_shadow_blur,
    // artist_shadow_color,
    // theme_id,
    // zh,
    // en,
    // url,
    // room_id
    user_params,
    utils,
    wss
) {
    return new Vue({
        el: '.app',
        data: {
            wss: wss,

            QRCode_key: '',
            QRCode_where: '...',
            QRCode_b64_style: '',
            QRCode_load_flag: true,
            QRCode_login_status: {},
            QRCCode_selected_qq: '',
            QRCCode_selected_cloud: '',
            QRCCode_selected_ku_wo: '',
            QRCCode_selected_style: {'qq': '', 'cloud': '', 'ku_wo': ''},

            real_status: user_params.real_status,

            who_play: 0,
            who_i_am: 0,

            mask1: false,
            mask1_1: false,
            mask2: false,
            mask2_1: false,
            login_mask: false,
            login_fail: false,
            login_fail_info: '',

            load_info: '正在提交设置，请勿切换页面',
            load_info_flag: false,
            load_info_icon: 'loading',

            black_user: {},
            black_music: {},
            black_user_list: user_params.black_user_list,
            black_music_list: user_params.black_music_list,

            url: user_params.url,
            test_flag: 0,
            set_style: user_params.set_flag ? '' : 'none',
            secret: user_params.secret,
            room_id: user_params.room_id,
            stop_flag: false,
            set_flag: user_params.set_flag,
            information: 'test',
            now_view: 'music_name',
            // 基本设置
            li_style: '',

            v_div_width: user_params.div_width, //default:"500"
            v_div_height: user_params.div_height,//default:"500"

            v_first_color: user_params.music_color,//default:"#ff9900"
            v_first_font: user_params.music_font,//default:"Microsoft YaHei"
            v_first_font_size: user_params.music_font_size,//default:"36"
            v_second_color: user_params.artist_color,//default:"#7a7a7a"
            v_second_font: user_params.artist_font,//default:"Microsoft YaHei"
            v_second_font_size: user_params.artist_font_size,//default:"16"
            v_li_margin: user_params.v_li_margin,  // '20',
            // 歌名阴影
            first_shadow_num: user_params.music_shadow_num,  // '1',
            first_shadow_blur: user_params.music_shadow_blur,  // '2',
            first_shadow_color: user_params.music_shadow_color,  // '#000000',
            first_style: '',
            // 歌手阴影
            second_shadow_num: user_params.artist_shadow_num, //'1',
            second_shadow_blur: user_params.artist_shadow_blur,  //'1',
            second_shadow_color: user_params.artist_shadow_color, //'#000000',
            second_style: '',
            theme_id: user_params.theme_id,  // 0
            theme_url: ['static/images/brown_cat_1.png', 'static/images/blue_window_1.png', 'static/images/new.png'],
            border_image_slice: [180, 181, 160],
            border_image_width: [169, 170, 162],
            border_image_outset: [74, 75, 111],
            display_style: '',

            music_url: '',
            music_info: [[user_params.zh, user_params.en]],
            music_info_test: [
                ['Wonder Caravan', '水瀬いのり'],
                ['可愛くなりたい', '鎖那'],
                ['沈园外', '阿YueYue, 戾格, 小田音乐社'],
                ['Wasabi', 'Little Mix'],
                ['麻雀学校', '群星'],
                ['群青', 'YOASOBI'],
            ],
            now_music_name: '',
            utils: utils,
        },
        computed: {
            music_set_change() {
                const {
                    v_first_font,
                    v_first_color,
                    v_first_font_size,
                    first_shadow_num,
                    first_shadow_blur,
                    first_shadow_color,
                } = this;
                console.log(
                    v_first_font,
                    v_first_color,
                    v_first_font_size,
                    first_shadow_num,
                    first_shadow_blur,
                    first_shadow_color,
                )
                return {};
            },
            artist_set_change() {
                const {
                    v_second_font,
                    v_second_color,
                    v_second_font_size,
                    second_shadow_num,
                    second_shadow_blur,
                    second_shadow_color,
                } = this;
                console.log(
                    v_second_font,
                    v_second_color,
                    v_second_font_size,
                    second_shadow_num,
                    second_shadow_blur,
                    second_shadow_color,
                )
                return {};
            },
            li_set_change() {
                const {
                    v_li_margin,
                } = this;
                console.log(
                    v_li_margin,
                )
                return {};
            },
            display_set_change() {
                const {
                    theme_id,
                    theme_url,
                    v_div_width,
                    v_div_height,
                    border_image_slice,
                    border_image_width,
                    border_image_outset,
                } = this;
                console.log(
                    theme_id,
                    theme_url,
                    v_div_width,
                    v_div_height,
                    border_image_slice,
                    border_image_width,
                    border_image_outset,
                )
                return {};
            },
            information_change() {
                const {
                    information,
                } = this
                console.log(
                    information,
                )
                return {}
            },
        },
        watch: {
            music_set_change() {
                this.utils.change_first_css(this)
                if (this.set_flag) {
                    this.utils.delay_post_setting(this, 2, 'music')
                }
            },
            artist_set_change() {
                this.utils.change_second_css(this)
                if (this.set_flag) {
                    this.utils.delay_post_setting(this, 2, 'music')
                }
            },
            li_set_change() {
                this.utils.change_li_css(this)
                if (this.set_flag) {
                    this.utils.delay_post_setting(this, 2, 'music')
                }
            },
            display_set_change() {
                this.utils.change_display_css(this)
                if (this.set_flag) {
                    this.utils.delay_post_setting(this, 2, 'music')
                }
            },
            information_change() {
                this.now_view = 'msg'
            },
            now_music_name() {
                // this.utils.prepare_to_music_play(this, this.music_url, 'music')
                // this.utils.delay_post_setting(this, 2, 'music')
                // this.utils.get_union_data(vm, this.utils, [this.utils.get_music_url]);
            },
            black_user_list() {
                if (this.set_flag) {
                    this.utils.use_get_global(this, 'black_user_list')
                }
            },
            black_music_list() {
                if (this.set_flag) {
                    this.utils.use_get_global(this, 'black_music_list')
                }
            },
        },
        created() {
            // console.log(this.sumV2(['12', '34', '22'], ['22', '33']))
            // console.log(this.sumV2(['12', '34', '22'], ['22', '33']))
            this.utils.change_li_css(this);
            // this.utils.change_set_css(this);
            this.utils.get_login_status(this);
            this.utils.change_first_css(this);
            this.utils.change_second_css(this);
            this.utils.change_display_css(this);
            const params = {
                url: this.url, data: 0, where: 'replay', where_url: `${this.who_i_am ? 'lyric' : 'music'}_url`
            }
            $.get('play', params)
        }
    })
}
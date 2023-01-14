/**
 *
 * @param {{
 *           url,
 *           secret,
 *           set_flag,
 *           theme_id,
 *           black_user_list,
 *           black_music_list,
 *           div_width,
 *           div_height,
 *           original_text_color,
 *           original_text_font,
 *           original_text_font_size,
 *           translation_color,
 *           translation_font,
 *           translation_font_size,
 *           now_color,
 *           now_font,
 *           room_id,
 *           now_font_size,
 *           v_li_margin,
 *           now_shadow_num,
 *           now_shadow_blur,
 *           now_shadow_color,
 *           original_shadow_num,
 *           original_shadow_blur,
 *           original_shadow_color,
 *           translation_shadow_num,
 *           translation_shadow_blur,
 *           translation_shadow_color,
 *          }} user_params 用户设置字典
 * @param {Object} utils 工具类对象
 * @returns {Vue} Vue实例
 */
function load_for_bili_lyric_vue(user_params, utils) {
    return new Vue({
        el: '.app',
        data: {

            vm: this,

            QRCode_key: '',
            QRCode_where: '...',
            QRCode_b64_style: '',
            QRCode_load_flag: true,
            QRCode_login_status: {},
            QRCCode_selected_qq: '',
            QRCCode_selected_cloud: '',
            QRCCode_selected_ku_wo: '',
            QRCCode_selected_style: {'qq': '', 'cloud': '', 'ku_wo': ''},

            who_play: 0,
            who_i_am: 1,

            mask1: false,
            mask1_1: false,
            mask2: false,
            mask2_1: false,
            login_mask: false,

            load_info: '正在提交设置，请勿切换页面',
            load_info_flag: false,
            load_info_icon: 'loading',

            upper_flag: 1,

            black_user: {},
            black_music: {},
            black_user_list: user_params.black_user_list,
            black_music_list: user_params.black_music_list,

            information: 'test',
            now_view: 'music_lyric',

            set_flag: user_params.set_flag,

            set_style: user_params.set_flag ? '' : 'none',

            secret: user_params.secret,
            room_id: user_params.room_id,

            // {string} url
            url: user_params.url,
            //default:"500"
            v_div_width: user_params.div_width,
            //default:"500"
            v_div_height: user_params.div_height,

            //default:"#ff9900"
            v_first_color: user_params.original_text_color,
            //default:"Microsoft YaHei"
            v_first_font: user_params.original_text_font,
            //default:"36"
            v_first_font_size: user_params.original_text_font_size,
            //default:"#7a7a7a"
            v_second_color: user_params.translation_color,
            //default:"Microsoft YaHei"
            v_second_font: user_params.translation_font,
            //default:"16"
            v_second_font_size: user_params.translation_font_size,
            //
            v_now_color: user_params.now_color,
            v_now_font: user_params.now_font,
            v_now_font_size: user_params.now_font_size,

            v_nothing: '1:暂无歌曲 2:无',

            li_style: '',
            // '20'
            v_li_margin: user_params.v_li_margin,
            li_height: 90,

            /** 阴影 */
            now_shadow_num: user_params.now_shadow_num,
            now_shadow_blur: user_params.now_shadow_blur,
            now_shadow_color: user_params.now_shadow_color,
            // '1'
            first_shadow_num: user_params.original_shadow_num,
            // '2',
            first_shadow_blur: user_params.original_shadow_blur,
            // '#000000',
            first_shadow_color: user_params.original_shadow_color,
            //'1',
            second_shadow_num: user_params.translation_shadow_num,
            //'1',
            second_shadow_blur: user_params.translation_shadow_blur,
            //'#000000',
            second_shadow_color: user_params.translation_shadow_color,

            // 第一样式
            first_style: '',
            // 第二样式
            second_style: '',
            // 当前句样式
            now_style: '',
            // 0
            theme_id: user_params.theme_id,
            //
            theme_url: ['static/images/brown_cat_1.png', 'static/images/blue_window_1.png', 'static/images/new.png'],
            //
            border_image_slice: [180, 181, 160],
            //
            border_image_width: [154, 170, 162],
            //
            border_image_outset: [74, 75, 111],
            //
            display_style: '',

            now_music_name: '',

            utils: utils,

            music_url: '',

            lyric_info: [
                {
                    "id": 2,
                    "original": " \u304d\u3089\u308a\u7a7a\u306b\u97ff\u304f\u661f\u306e\u58f0",
                    "translation": "\u6676\u83b9\u95ea\u70c1\u5728\u591c\u7a7a \u661f\u661f\u7684\u58f0\u97f3"
                }, {
                    "id": 6,
                    "original": " \u3042\u3042\u6d77\u3092\u7167\u3089\u3059 \u5149\u3092\u8fbf\u308c\u305f\u3089",
                    "translation": "\u554a \u5f87\u7740\u7167\u4eae\u6d77\u9762\u7684\u90a3\u9053\u5149\u8292\u63a2\u5bfb"
                }, {
                    "id": 8,
                    "original": " \u6d41\u308c\u305f\u661f\u306f\u3069\u3053\u3078\u884c\u304f\uff1f",
                    "translation": "\u5212\u8fc7\u591c\u7a7a\u7684\u6d41\u661f\u5c06\u53bb\u5f80\u54ea\u91cc\uff1f"
                }, {
                    "id": 11,
                    "original": " \u304d\u3063\u3068\u4f55\u304b\u304c\u305d\u3053\u3067\u5f85\u3063\u3066\u308b",
                    "translation": "\u90a3\u91cc\u4e00\u5b9a\u6709\u4ec0\u4e48\u5728\u7b49\u5f85\u7740"
                }, {
                    "id": 14,
                    "original": " \u65d7\u3092\u63b2\u3052\u9032\u3082\u3046",
                    "translation": "\u626c\u8d77\u65d7\u5e1c\u51fa\u53d1\u5427"
                }, {
                    "id": 15,
                    "original": " \u3044\u3064\u3067\u3082\u6708\u306f\u6b4c\u3044 \u65c5\u4eba\u3092\u5c0e\u3044\u3066",
                    "translation": "\u6708\u4eae\u8f7b\u5531\u7740\u6b4c\u8c23 \u4e3a\u65c5\u4eba\u6307\u5f15\u65b9\u5411"
                }, {
                    "id": 20,
                    "original": " \u300c\u3082\u3046\u8ff7\u308f\u306a\u304f\u3066\u3044\u3044\u304b\u3089\u300d",
                    "translation": "\u300c\u518d\u4e5f\u4e0d\u5fc5\u72b9\u8c6b\u8ff7\u832b\u300d"
                }, {
                    "id": 25,
                    "original": " \u50d5\u3089\u304c\u76ee\u6307\u3057\u305f\u4e16\u754c\u306a\u3093\u3060",
                    "translation": "\u90a3\u662f\u6211\u4eec\u6240\u8ffd\u5bfb\u7684\u4e16\u754c"
                }, {
                    "id": 30,
                    "original": " \u8ab0\u306e\u5730\u56f3\u306b\u3082\u306a\u3044\u5834\u6240\u3078\u884c\u3053\u3046",
                    "translation": "\u542f\u7a0b\u524d\u5f80\u5730\u56fe\u4e0a\u6ca1\u6709\u7684\u5730\u65b9"
                }, {
                    "id": 35,
                    "original": " \u8e0f\u307f\u51fa\u305b\u305f\u306a\u3089\u305d\u306e\u77ac\u9593\u304c",
                    "translation": "\u53ea\u8981\u8e0f\u4e0a\u65c5\u9014 \u90a3\u4e2a\u77ac\u95f4"
                }, {
                    "id": 40,
                    "original": " \u5192\u967a\u306e\u30c9\u30a2\u3092\u958b\u3051\u308b\u3088",
                    "translation": "\u5192\u9669\u4e4b\u95e8\u5c06\u4e3a\u4f60\u655e\u5f00"
                }, {
                    "id": 45,
                    "original": " \u3044\u3064\u304b\u5c4a\u304f\u307e\u3067 \u305a\u3063\u3068\u305d\u3070\u306b",
                    "translation": "\u76f4\u5230\u62b5\u8fbe\u4e3a\u6b62 \u90fd\u4f1a\u966a\u4f34\u5728\u8eab\u65c1"
                }, {
                    "id": 50,
                    "original": " \u3042\u3042\u7a7a\u3092\u96a0\u3059 \u96f2\u306e\u6d99\u304c\u964d\u308b",
                    "translation": "\u554a \u906e\u76d6\u4f4f\u5929\u7a7a\u7684\u4e4c\u4e91\u6f78\u6f78\u54ed\u6ce3"
                }, {
                    "id": 55,
                    "original": " \u305d\u308c\u3067\u3082\u8ca0\u3051\u305a\u821f\u3092\u6f15\u3050",
                    "translation": "\u7528\u529b\u5212\u7740\u5c0f\u8239 \u6211\u4eec\u7edd\u4e0d\u8ba4\u8f93"
                }, {
                    "id": 60,
                    "original": " \u3053\u3093\u306a\u5d50\u306e\u6b62\u307e\u306a\u3044\u591c\u3067\u3082",
                    "translation": "\u5373\u4f7f\u5728\u8fd9\u6837\u98ce\u96e8\u547c\u5578\u7684\u591c\u665a"
                }, {
                    "id": 65,
                    "original": " \u80a9\u3092\u4e26\u3079\u9032\u3082\u3046",
                    "translation": "\u4e5f\u8981\u80a9\u5e76\u80a9\u524d\u884c"
                }, {
                    "id": 70,
                    "original": " \u591c\u660e\u3051\u306e\u8679\u304c\u304b\u304b\u308a \u65c5\u4eba\u306e\u624b\u3092\u5f15\u3044\u3066",
                    "translation": "\u591c\u5c3d\u5929\u660e\u67b6\u8d77\u5f69\u8679 \u7275\u8d77\u65c5\u4eba\u7684\u624b"
                }, {
                    "id": 75,
                    "original": " \u300c\u3082\u3046\u5927\u4e08\u592b\u3001\u76ee\u3092\u958b\u3051\u3066\u300d",
                    "translation": "\u300c\u5929\u5df2\u6674\u6717 \u8bf7\u7741\u5f00\u773c\u775b\u300d"
                }, {
                    "id": 80,
                    "original": " \u50d5\u3089\u304c\u51fa\u4f1a\u3048\u305f\u5947\u8de1\u306a\u3093\u3060",
                    "translation": "\u90a3\u662f\u6211\u4eec\u9047\u89c1\u7684\u5947\u8ff9"
                }, {
                    "id": 85,
                    "original": " \u305f\u3063\u305f\u4e00\u5ea6\u3060\u3051\u91cd\u306a\u308b\u5834\u6240\u3067",
                    "translation": "\u5728\u7b2c\u4e00\u6b21\u8e0f\u4e0a\u7684\u8fd9\u7247\u571f\u5730"
                }, {
                    "id": 90,
                    "original": " \u8e0f\u307f\u51fa\u305b\u305f\u304b\u3089 \u4eca\u65e5\u3082\u304d\u3063\u3068",
                    "translation": "\u53ea\u8981\u8fc8\u51fa\u4e00\u6b65 \u4eca\u5929\u4e5f\u4e00\u5b9a\u4f1a"
                }, {
                    "id": 95,
                    "original": " \u65b0\u3057\u3044\u5730\u56f3\u3092\u63cf\u304f\u3093\u3060",
                    "translation": "\u753b\u51fa\u5d2d\u65b0\u7684\u5730\u56fe"
                }, {
                    "id": 100,
                    "original": " \u51cd\u3048\u308b\u65e5\u306f\u624b\u3092\u3064\u306a\u3054\u3046",
                    "translation": "\u5929\u51b7\u7684\u65f6\u5019\u5c31\u624b\u7275\u7740\u624b"
                }, {
                    "id": 105,
                    "original": " \u5b09\u3057\u3044\u3068\u304d\u306f\u7b11\u3044\u3042\u304a\u3046",
                    "translation": "\u5f00\u5fc3\u7684\u65f6\u5019\u5c31\u76f8\u89c6\u800c\u7b11"
                }, {
                    "id": 110,
                    "original": " \u5fd8\u308c\u306a\u3044\u3067 \u50d5\u3089\u306f\u4e00\u4eba\u3058\u3083\u306a\u3044\u304b\u3089",
                    "translation": "\u522b\u5fd8\u8bb0 \u6211\u4eec\u4e0d\u662f\u5b64\u5355\u4e00\u4eba"
                }, {
                    "id": 115,
                    "original": " \u50d5\u3089\u304c\u76ee\u6307\u3057\u305f\u4e16\u754c\u306a\u3093\u3060",
                    "translation": "\u90a3\u662f\u6211\u4eec\u6240\u8ffd\u5bfb\u7684\u4e16\u754c"
                }, {
                    "id": 120,
                    "original": " \u8ab0\u306e\u5730\u56f3\u306b\u3082\u306a\u3044\u5834\u6240\u3078\u884c\u3053\u3046",
                    "translation": "\u542f\u7a0b\u524d\u5f80\u5730\u56fe\u4e0a\u6ca1\u6709\u7684\u5730\u65b9"
                }, {
                    "id": 125,
                    "original": " \u8e0f\u307f\u51fa\u305b\u305f\u306a\u3089\u305d\u306e\u77ac\u9593\u304c",
                    "translation": "\u53ea\u8981\u8e0f\u4e0a\u65c5\u9014 \u90a3\u4e2a\u77ac\u95f4"
                }, {
                    "id": 130,
                    "original": " \u3044\u3064\u3067\u3082",
                    "translation": "\u65e0\u8bba\u4f55\u65f6"
                }, {
                    "id": 135,
                    "original": " \u3042\u3042\u6d77\u3092\u8d8a\u3048\u3066 \u8fbf\u308a\u7740\u304f\u672a\u6765\u306f",
                    "translation": "\u554a \u8d8a\u8fc7\u5927\u6d77 \u7ec8\u4e8e\u62b5\u8fbe\u7684\u672a\u6765"
                }, {
                    "id": 140,
                    "original": " \u305d\u306e\u624b\u306b\u89e6\u308c\u3066 \u8f1d\u304d\u3060\u305b\u308b\u3093\u3060",
                    "translation": "\u8f7b\u8f7b\u78b0\u89e6\u5979\u7684\u53cc\u624b \u7efd\u653e\u51fa\u5149\u8292"
                }, {
                    "id": 145,
                    "original": " \u8ab0\u3067\u3082\u306a\u3044 \u50d5\u3089\u3060\u3051\u306e\u5149",
                    "translation": "\u53ea\u5c5e\u4e8e\u6211\u4eec\u7684 \u72ec\u4e00\u65e0\u4e8c\u7684\u5149\u8292"
                }, {
                    "id": 150,
                    "original": " \u3075\u308f\u308a\u7a7a\u306b\u6d88\u3048\u308b\u661f\u306e\u58f0",
                    "translation": "\u6084\u6084\u6d88\u901d\u5728\u591c\u7a7a \u661f\u661f\u7684\u58f0\u97f3"
                }],

            multi_lyric_li: 'list-style: none;overflow: hidden;word-break: keep-all;transition: 700ms;padding: 9px; margin: 0;text-align: center'
        },
        computed: {
            first_set_change() {
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
            second_set_change() {
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
            now_set_change() {
                const {
                    v_now_font,
                    v_now_color,
                    v_now_font_size,
                    now_shadow_num,
                    now_shadow_blur,
                    now_shadow_color,
                } = this;
                console.log(
                    v_now_font,
                    v_now_color,
                    v_now_font_size,
                    now_shadow_num,
                    now_shadow_blur,
                    now_shadow_color,
                )
                return {};
            },
            li_set_change() {
                const {
                    v_li_margin,
                } = this;
                console.log(v_li_margin)
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
        },
        watch: {
            now_set_change() {
                this.utils.change_now_css(this)
                if (this.set_flag) {
                    this.utils.delay_post_setting(this, 2, 'lyric')
                }
            },
            first_set_change() {
                this.utils.change_first_css(this)
                if (this.set_flag) {
                    this.utils.delay_post_setting(this, 2, 'lyric')
                }
            },
            second_set_change() {
                this.utils.change_second_css(this)
                if (this.set_flag) {
                    this.utils.delay_post_setting(this, 2, 'lyric')
                }
            },
            li_set_change() {
                this.utils.change_li_css(this)
                if (this.set_flag) {
                    this.utils.delay_post_setting(this, 2, 'lyric')
                }
            },
            display_set_change() {
                this.utils.change_display_css(this)
                if (this.set_flag) {
                    this.utils.delay_post_setting(this, 2, 'lyric')
                }
            },
            information() {
                this.now_view = 'msg'
            },
            now_music_name() {
                // this.utils.prepare_to_music_play(this, this.music_url, 'lyric')
                // this.utils.delay_post_setting(this, 2, 'lyric')
                this.utils.get_union_data(this, this.utils, [this.utils.get_music_url, this.utils.get_lyric])
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
            upper_flag() {
                // this.utils.use_get_global(this, 'upper_flag')
            },
        },
        created() {
            this.utils.change_now_css(this)
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
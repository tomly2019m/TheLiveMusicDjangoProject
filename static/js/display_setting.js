const png_url = ['background_op.png', 'background_black.png', 'background_gray.png'];
const png_i = png_url.length;
let n = png_i;

function set_color_input_change(obj_id1, obj_id2, obj_class, method) {
    /*
    颜色选择器改变

    obj_id1:起始元素id,

    obj_id2:目标元素id,

    obj_class:要设置的目标元素class,

    method:true/false 从按钮到文本框/从文本框到按钮*/
    const color_object = $('#' + obj_id1);
    let hex_color;
    if (method) {
        hex_color = color_object.val();
        $('#' + obj_id2).val(hex2Rgb(hex_color));
    } else {
        hex_color = rgb2Hex(color_object.val());
        $('#' + obj_id2).val(hex_color);
    }
    $('.' + obj_class).css('color', hex_color)
}

//十六进制转为RGB
function hex2Rgb(hex) {
    const rgb = []; // 定义rgb数组
    if (/^#[0-9A-F]{3}$/i.test(hex)) { //判断传入是否为#三位十六进制数
        let sixHex = '#';
        hex.replace(/[0-9A-F]/ig, function (kw) {
            sixHex += kw + kw; //把三位16进制数转化为六位
        });
        hex = sixHex; //保存回hex
    }
    if (/^#[0-9A-F]{6}$/i.test(hex)) { //判断传入是否为#六位十六进制数
        hex.replace(/[0-9A-F]{2}/ig, function (kw) {
            rgb.push(eval('0x' + kw)); //十六进制转化为十进制并存如数组
        });
        return `rgb(${rgb.join(',')})`; //输出RGB格式颜色
    } else {
        console.log(`Input ${hex} is wrong!`);
        return hex;
    }
}

//RGB转为十六进制
function rgb2Hex(rgb) {
    if (/^rgb\((\d{1,3},){2}\d{1,3}\)$/i.test(rgb)) { //test RGB
        let hex = '#'; //定义十六进制颜色变量
        rgb.replace(/\d{1,3}/g, function (kw) { //提取rgb数字
            kw = parseInt(kw).toString(16); //转为十六进制
            kw = kw.length < 2 ? 0 + kw : kw; //判断位数，保证两位
            hex += kw; //拼接
        });
        return hex; //返回十六进制
    } else {
        console.log(`Input ${rgb} is wrong!`);
        return rgb; //输入格式错误,返回#000
    }
}

//判断是否为非零的正整数
function check_num(num) {
    return !(/^[1-9]\d*$/i.test(num));
}

function get_value(obj_id) {
    const content = $('#' + obj_id);
    const size = content.val();
    if (check_num(size)) {
        alert('此处应为非零的正整数')
        content.val('');
    }
}

// 更改字体大小
function set_font_size(obj_id, obj_class) {
    const content = $('#' + obj_id);
    const size = content.val();
    if (check_num(size)) {
        alert('字体大小应为非零的正整数');
        content.val('');
    } else {
        $('.' + obj_class).css('font-size', size + 'px');
    }
}

//显示元素
function display_item(select_obj_text) {
    const button = $(select_obj_text);
    button.css('display', 'block')
}

//隐藏元素
function hidden_item(select_obj_text) {
    const button = $(select_obj_text);
    button.css('display', 'none')
}

//切换预览背景
function change_background() {
    const obj = $('#display-css');
    obj.css('background-image', 'url("/static/images/' + png_url[n - 1] + '\")');
    n--;
    if (n <= 0) {
        n = png_i;
    }
}

function set_font_family(obj_id, obj_class) {
    /*
    字体选择器改变

    obj_id1:起始元素id,

    obj_class:要设置的目标元素class,

    method:true/false 从按钮到文本框/从文本框到按钮*/
    const font_family = $('#' + obj_id).val();
    $('.' + obj_class).css('font-family', font_family);
}

// 复制
function copy_url() {
    document.getElementById('copy-input').select();
    document.execCommand('copy');
}

// 提取网址中的房间号
function get_room_number() {
    const obj = $('#room_url');
    let val = obj.val().split('/');
    val = val[val.length - 1];
    val = val.split('?')[0];
    obj.val(val);
}

// 设置显示宽度
function set_width(times=1) {
    const obj = $('#width');
    const div = $('#display-css');
    if (check_num(obj.val())) {
        obj.val('');
    } else {
        div.css('width', parseInt(obj.val())*times + 'px');
    }

}

// 设置显示高度
function set_height(times=1) {
    const obj = $('#height');
    const div = $('#display-css');
    if (check_num(obj.val())) {
        obj.val('');
    } else {
        div.css('height', parseInt(obj.val())*times + 'px');
    }
}

function show_page_mask(select_obj_text) {
    const mask = $(select_obj_text);
    mask.css('display', 'block');
    setTimeout(play_animate, 80);
}

function play_animate() {
    const mask = $('.page-mask');
    const panel = $('.add-music-panel');
    panel.css('top', '50%');
    panel.css('background-color', 'white');
    mask.css('background-color', 'rgba(0, 0, 0, 0.3)');
}

function close_music_panel() {
    const mask = $('.page-mask');
    const panel = $('.add-music-panel');
    panel.css('top', '59%')
    panel.css('background-color', 'rgba(0, 0, 0, 0)');
    mask.css('background-color', 'rgba(0, 0, 0, 0)');
    mask.css('display', 'none');
}

$(document).ready(function () {
    $.getJSON('/unread_msg', function (data) {
        if (data['data'] == 1) {
            $('#unread_msg').addClass('msg_op');
        }
    })
})


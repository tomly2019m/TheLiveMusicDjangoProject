/**
 * @preserve Modify from: https://gitee.com/XL8Z/BiliBili_PlayWithMe_JS/blob/master/PlayWithMe.js
 */
class BiliBili_WEBSocket extends WebSocket {
    Reader = null;

    /**
     *
     * @param {Vue} vm Vue实例
     * @param {string} login_auth_str 登录验证字符串
     * @param {Object} extend 父类
     * @param {function} callback 回调函数
     * @param {Object} params 回调函数参数
     */
    constructor(vm, login_auth_str, extend, callback, params) {
        super("wss://broadcastlv.chat.bilibili.com:443/sub")
        this.vm = vm;
        this.params = params;
        this.callback = callback;
        this.extend = extend;
        this.time_flag = true;
        this.onopen = () => {
            this.login(login_auth_str);
            // 握手完毕后，先丢一个心跳包过去
            // 【你懂什么，这也是握手的一部分.gif】
            this.heartbeat();
            // 设置自动定时发送心跳包
            this.heartbeat_id = setInterval(() => {
                this.heartbeat();
                // 定时发送循环延迟，单位毫秒【20000=20秒】
            }, 20000);
        }


        // 收到消息回调
        this.onmessage = (evt) => {
            // 通过FileReader读出数据
            this.Reader = new FileReader();
            // 预先设定好，当数据读出后，送往NewMessage方法进行处理
            this.Reader.onloadend = (evt) => this.new_message(evt.currentTarget.result);
            // 命令FileReader开始读出
            this.Reader.readAsArrayBuffer(evt.data);
        };

        this.onclose = () => {
            this.vm.$data.information = '连接断开'
        }
    }

    /**
     *
     * @param {*} LoginAuthStr
     */
    login(LoginAuthStr) {
        let data
        let body = UtilTools.str_2_uint8Array(LoginAuthStr)
        let pack_len = body.length + 16;
        let raw_data = new Array(0);
        console.log("预计的包长度：" + pack_len);
        // 放入包头
        raw_data.push.apply(raw_data, [
            // 【Packet Length】包长字节数(Byte)【每隔字节8个位(Bit)，即数组里的一个UInt8】
            // 【注意是包头(Header)+包身(Body)的整个数据长度】
            0, 0, (pack_len > 255 ? 1 : 0), (pack_len % 256),
            // 【Header Length】数据包包头长度16字节(Byte)【16个8位(Bit)】
            0, 16,
            // 【Version】协议版本0，无加密
            0, 0,
            // 【Operation】操作类型，7为OP_AUTH，登录握手包
            0, 0, 0, 7,
            // 【Sequence ID】保留字段，很多人都写1，我就跟着瞎写了
            0, 0, 0, 0
        ]);
        // 放入包身
        raw_data.push.apply(raw_data, body);
        // 统一转换为Uint8Array
        data = new Uint8Array(raw_data);

        console.log("握手包\n" + UtilTools.uint8Array_2_hex_str(data));
        // 调用原WEBSocket的发送方法发送握手包
        super.send(data);
    }


    /**
     * 发送一个心跳包
     * - 必须每隔30秒发送一个，不然会被服务器认为客户端已经故障或关闭，切断连接
     */
    heartbeat() {
        // 固定写死的心跳包
        let heartbeat_data = new Uint8Array([
            // 【Packet Length】包长18字节(Byte)【18个8位(Bit)】
            0, 0, 0, 18,
            // 【Header Length】数据包包头长度16字节(Byte)【16个8位(Bit)】
            0, 16,
            // 【Version】协议版本1，无加密【虽然文档里要求写0，但是正常是写1】
            0, 1,
            // 【Operation】操作类型，2为OP_HEARTBEAT，客户端心跳，KeepAlive包
            0, 0, 0, 2,
            // 【Sequence ID】保留字段，很多人都写1，我就跟着瞎写了
            0, 0, 0, 1,
            // 【Body】实际内容，其实是“{}”，无意义
            0x7b, 0x7d
        ]);
        console.log("发送心跳包");
        // 调用原WEBSocket的发送方法发送心跳包
        if (this.isOnlineCurrUser()) {
            super.send(heartbeat_data);
        } else {
            this.vm.$data.information = '服务器连接已断开, 请刷新浏览器源'
        }
    }

    /**
     * 判断当前用户是否 还在线
     */
    isOnlineCurrUser() {
        return super.readyState === WebSocket.OPEN;
    }

    /**
     *
     * @param {*} data
     */
    new_message(data) {

        let uint8Array = new Uint8Array(data);
        console.log("服务器的消息\n" + UtilTools.uint8Array_2_hex_str(uint8Array));
        let json_str = UtilTools.decodeUtf8(data.slice(16)).trim();
        // console.log("[开放平台长链接]解析到服务器的新消息\n" + JSONStr);
        // let json_obj = JSON.parse(json_str);
        console.log(json_str)
        if (data[7] === 2) {
            // TODO 需要Zlib解压的大包，还没做
        } else switch (uint8Array[11]) {
            case 3:
                // console.log("[开放平台长链接]解析到服务器回复的心跳包");
                break;
            case 5:
                // 删掉头部后UTF8解码二进制内容

                /*switch (json_obj.cmd) {

                    case "LIVE_OPEN_PLATFORM_DM":

                        // JSONObj.data 内容
                        // {
                        //     "fans_medal_level": 21,
                        //     "fans_medal_name": "黑喵姐",
                        //     "fans_medal_wearing_status": false,
                        //     "guard_level": 0,
                        //     "msg": "你们谁扔个小心心呗",
                        //     "timestamp": 1650717881,
                        //     "uid": 3102384,
                        //     "uname": "猫裙少年泽远喵",
                        //     "uface": "http://i0.hdslb.com/bfs/face/7ced8612a3f3ef10e7238ee22b4c6948d3f53139.jpg",
                        //     "room_id": 4639581}
                        // console.log(JSONObj.data)
                        this.callback(json_obj, this.params)
                        break;

                    case "LIVE_OPEN_PLATFORM_SEND_GIFT":
                        // Bilibili_PlayWithMe.NewGifts(JSONObj.data);
                        break;
                }*/
                let json_obj = JSON.parse(json_str);
                if (json_obj.cmd === 'STOP_LIVE_ROOM_LIST') {
                    this.close()
                    clearInterval(this.heartbeat_id);
                    const danmuku = new Dan_mu_ku(this.vm, this.vm.$data.room_id, this.vm.$data.url, this.vm.$data.who_i_am === 0 ? 'music_url' : 'lyric_url')
                    setInterval(() => {
                        if (this.vm.$data.who_i_am === this.vm.$data.who_play) {
                            try {
                                danmuku.get_dan_mu();
                            } catch (e) {
                                this.vm.$data.information = '服务器连接已断开, 请刷新浏览器源'
                            }
                        }
                        if (this.time_flag) {
                            this.vm.$data.information = '备用弹幕服务已连接'
                            setTimeout(() => {
                                this.vm.$data.now_view = this.vm.$data.who_i_am === 0 ? 'music_name' : 'music_lyric';
                            }, 1000);
                            this.time_flag = false;
                        }
                    }, 3000);
                } else {
                    this.callback(json_obj, this.extend, this.params);
                }
                break;
            case 8:
                // console.log("[开放平台长链接]解析到服务器的登陆回复");
                break;
            default:
                break;
        }
    }

}

/**
 * 静态工具类
 */
class UtilTools {


    /**
     * 转换Uint8Array为HEX字符串
     * @param {Uint8Array} Uint8Array 二进制数组
     * @returns string 十六进制小写字符串
     */
    static uint8Array_2_hex_str(Uint8Array) {
        return Array.prototype.map.call(Uint8Array, (x) => ('00' + x.toString()).slice(-2)).join(' ');
    }

    /**
     *
     * @param {String} Str 字符串
     * @returns UTF-8编码下的原始数据Uint8Array2Str
     */
    static str_2_uint8Array(Str) {
        const arr = [];
        let i = 0, j = Str.length;
        for (; i < j; ++i)
            arr.push(Str.charCodeAt(i));
        return new Uint8Array(arr);
    }

    static decodeUtf8(input) {
        const data = this.toUint8Array(input)
        const size = data.length

        let result = ''

        for (let index = 0; index < size; index++) {
            let byte1 = data[index]

            // US-ASCII
            if (byte1 < 0x80) {
                result += String.fromCodePoint(byte1)
                continue
            }

            // 2-byte UTF-8
            if ((byte1 & 0xE0) === 0xC0) {
                let byte2 = (data[++index] & 0x3F)
                result += String.fromCodePoint(((byte1 & 0x1F) << 6) | byte2)
                continue
            }

            if ((byte1 & 0xF0) === 0xE0) {
                let byte2 = (data[++index] & 0x3F)
                let byte3 = (data[++index] & 0x3F)
                result += String.fromCodePoint(((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3)
                continue
            }

            if ((byte1 & 0xF8) === 0xF0) {
                let byte2 = (data[++index] & 0x3F)
                let byte3 = (data[++index] & 0x3F)
                let byte4 = (data[++index] & 0x3F)
                result += String.fromCodePoint(((byte1 & 0x07) << 0x12) | (byte2 << 0x0C) | (byte3 << 0x06) | byte4)

            }
        }

        return result
    }

    static toUint8Array(input) {
        if (input instanceof Uint8Array) return input
        if (input instanceof ArrayBuffer) return new Uint8Array(input)

        throw new TypeError('Expected "input" to be an ArrayBuffer or Uint8Array')
    }
}

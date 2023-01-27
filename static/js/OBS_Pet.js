class OBS_Pet {
    constructor(css_select_text) {
        this.is_playing_function = false;  // 是否在播放动作函数
        this.is_playing_animation = false;  // 是否在播放动画
        this.is_reverse = false;  // 颠倒播放顺序
        this.vue_object = new Vue({
            el: css_select_text,
            data: {
                debug_flag: false,
                debug_font_size: 25,
                is_playing_function: false,
                is_playing_animation: false,  // 是否在播放
                is_reverse: false,  // 颠倒播放顺序
                now_called: '',  // 哪个函数被调用
                now_image: 'statics/images/shime1.png',
                speed: 0,
                x_pos: 300,
                y_pos: 0,
                win_width: window.innerWidth,
                win_height: window.innerHeight,
                final_y: 0,
                status: 'stand',
                flip: '',
                timer_id: 0,
                motions: {
                    stand: [1],
                    walk: [1, 2, 1, 3],
                    fall: [4],
                    lean_on_right: [5],
                    lean_on_left: [6],
                    drag2right: [7],
                    drag2left: [8],
                    strong_drag2right: [9],
                    strong_drag2left: [10],
                    sit: [11],
                    climb: [12],
                    climb_first: [13],
                    climb_left_stop: [14, 14, 12, 13],
                    climb_left: [13, 13, 12, 14],
                    sing: [15, 16, 17],
                    fall_down: [18],
                    prostrate: [20, 21],  // 趴着
                    climb_right2left: [23, 24, 25],
                    celebrate: [26],
                    cry_stand: [34],
                    cry_walk: [35, 36],
                },
            },
        });
    }


    /**
     *  播放动画
     * @param {string} animation 动画名
     * @param {number} times 播放次数
     * @param {boolean} forever 一直播放？
     * @return {Promise<void>}
     */
    async play_animation(animation, times = 1, forever = false) {
        let now_times = 0;
        while (!this.break_playing && ((now_times < times || forever) && !this.break_playing)) {
            this.vue_object.$data.status = animation;
            for (const elem of this.vue_object.$data.motions[animation]) {
                if (!this.break_playing) {
                    await this.delayTime(300).then(() => {
                        this.vue_object.$data.now_image = `statics/images/shime${elem}.png`;
                        console.log(`statics/images/shime${elem}.png`);
                        now_times++;
                    });
                }
            }
        }
        this.break_playing = false;
    }

    /**
     *  播放动画
     * @param {string} animation 动画名
     * @param {number} times 播放次数
     * @param {boolean} forever 一直播放？
     * @param {boolean} reverse 颠倒播放顺序
     * @return {Promise<void>}
     */
    play_animation_new(animation, times = 1, forever = false, reverse = false) {
        let now_times = 0;  // 播了几次
        const animation_list = this.vue_object.$data.motions[animation];
        const animation_len = animation_list.length;
        const image_tag = document.getElementById('role_image');
        let point = reverse ? animation_len - 1 : 0;  // 动画索引
        this.vue_object.$data.status = animation;
        this.vue_object.$data.timer_id = setInterval(() => {
            this.is_playing_animation = this.vue_object.$data.is_playing_animation = true;
            image_tag.setAttribute('src', `statics/images/shime${animation_list[point]}.png`);
            // this.vue_object.$data.now_image = `statics/images/shime${elem}.png`;
            // console.log(`statics/images/shime${elem}.png`);
            // reverse ? --point : ++point;
            if (reverse) {
                point--;
                if (point <= 0) {
                    point = animation_list.length - 1;
                    now_times++;
                }
            } else {
                point++;
                if (point === animation_list.length) {
                    point = 0;
                    now_times++;
                }
            }
            if (!(now_times < times || forever)) {
                clearInterval(this.vue_object.$data.timer_id);
                this.is_playing_animation = this.vue_object.$data.is_playing_animation = false;
            }
        }, 250);
        this.break_playing = false;
    }

    /**
     * 停止播放之前的动画并开始播放传入的动画
     * @param {string} animation 动画名
     * @param {number} times 播放次数
     * @param {number} time 播放时间(ms)
     * @param {boolean} forever 一直播放？
     */
    break_now_and_play(animation, times = 1, time = 0, forever = false) {
        clearInterval(this.vue_object.$data.timer_id);
        this.play_animation_new(animation, times, forever, this.is_reverse)
        if (time !== 0) {
            setTimeout(() => {
                clearInterval(this.vue_object.$data.timer_id);
                this.is_playing_animation = this.vue_object.$data.is_playing_animation = false;
            }, time);
        }
    }

    /**
     * 阻塞器
     * @param {number} num 阻塞时间 (毫秒)
     * @returns {Promise}
     */
    async delayTime(num) {
        return new Promise((resolve, reject) => { // return / await 等待执行完
            setTimeout(() => {
                resolve('延迟');
            }, num);
        })
    }

    /**
     * 随机指定坐标轴的值并设置对应移动速度
     * @param {'x', 'y'} xy x方向/y方向
     */
    random_pos(xy) {
        let random_num;
        switch (xy) {
            case 'x':
                random_num = Math.random() * window.innerWidth;
                break;
            case 'y':
                random_num = Math.random() * window.innerHeight;
                break;
        }
        this.set_pos(xy, random_num);
    }

    /**
     * 设置指定坐标轴的值
     * @param {'x', 'y'} xy x方向/y方向
     * @param {number} value 值
     * @param {boolean} check 是否检查值有没有超出边界
     */
    set_pos(xy, value, check = true) {
        let pos, distance;
        switch (xy) {
            case 'x':
                distance = this.vue_object.$data.x_pos - value;
                this.flip_role(distance < 0 ? 'right' : 'left');
                pos = check ? value > window.innerWidth - 128 ? window.innerWidth - 128 : value : value;
                this.vue_object.$data.x_pos = pos;
                break;
            case 'y':
                distance = this.vue_object.$data.y_pos - value;
                this.is_reverse = this.vue_object.$data.is_reverse = distance > 0;
                pos = check ? value > window.innerHeight - 128 ? window.innerHeight - 128 : value : value;
                this.vue_object.$data.y_pos = pos;
                break;
        }
        this.vue_object.$data.speed = Math.abs(distance) / 20;
        console.log(`random_${xy}: ${value}, speed: ${this.vue_object.$data.speed}, ${xy}_pos: ${this.vue_object.$data[`${xy}_pos`]}, ${this.vue_object.$data.speed * 1000}ms`);

    }

    /**
     * 翻转角色朝向
     * @param {'climb-left', 'climb-right', 'climb-top-right', 'climb-top-left', 'left', 'right'} forward 朝哪边
     * (
     * climb-left: 左边攀爬,
     * climb-right: 右边攀爬,
     * climb-top-right: 顶上向右攀爬,
     * climb-top-left: 顶上向左攀爬,
     * left,
     * right
     * )
     */
    flip_role(forward) {
        switch (forward) {
            case 'climb-left':
                this.vue_object.$data.flip = 'transform: rotate(90deg)';
                break;
            case 'climb-right':
                this.vue_object.$data.flip = 'transform: rotate(-90deg)';
                break;
            case 'climb-top-right':
                this.vue_object.$data.flip = 'transform: rotate(270deg)';
                break;
            case 'climb-top-left':
                this.vue_object.$data.flip = 'transform: rotate(270deg) rotateY(180deg)';
                break;
            case 'left':
                this.vue_object.$data.flip = '';
                break;
            case 'right':
                this.vue_object.$data.flip = 'transform: rotateY(180deg)';
                break;
        }
    }

    /**
     * 到左边屏幕随机位置攀爬
     */
    random_climb_left() {
        this.vue_object.$data.now_called = 'random_climb_left';
        this.random_climb('left');
    }

    random_climb(forward) {
        this.vue_object.$data.is_playing_function = this.is_playing_function = true;
        if (this.vue_object.y_pos === 0) {
            this.break_now_and_play('walk', 1, 0, true);
        } else {
            this.vue_object.$data.speed = 0;
        }
        setTimeout(() => {
            this.set_pos('x', forward === 'left' ? -64 : window.innerWidth - 64, false);
            setTimeout(() => {
                let a = forward === 'left' ? forward : this.flip_role('right');
                this.break_now_and_play('climb');
                setTimeout(() => {
                    let num = Math.random() * window.innerHeight;
                    num = num > window.innerHeight - 128 ? window.innerHeight - 128 : num;
                    console.log(num);
                    let distance = this.vue_object.$data.y_pos - num;
                    this.vue_object.$data.final_y = Math.abs(distance);
                    this.is_reverse = this.vue_object.$data.is_reverse = distance > 0;
                    let times = ~~(Math.abs(distance) / 20);  // 爬多少次(每次爬20px)
                    a = false;
                    let temp = setInterval(() => {
                        a ? this.break_now_and_play('climb_left_stop') : '';
                        setTimeout(() => {
                            this.break_now_and_play('climb_left');
                            setTimeout(() => {
                                this.vue_object.$data.speed = .5;
                                if (distance < 0) {
                                    this.vue_object.$data.y_pos += 20;
                                } else {
                                    this.vue_object.$data.y_pos -= 20;
                                }
                                times--;
                                a = true;
                            }, 600);
                            if (times <= 0) {
                                clearInterval(temp);
                                this.break_now_and_play('climb');
                                this.vue_object.$data.is_playing_function = this.is_playing_function = false;
                                this.vue_object.$data.now_called = '';
                            }
                        }, 2000);
                    }, 3000);

                    // this.vue_object.$data.y_pos = pos;
                    // this.break_now_and_play('climb_left_stop', 1)
                    // setTimeout(() => {
                    //
                    // }, 1000);
                    // this.random_pos('y');
                    // this.break_now_and_play('climb_left', 1, this.vue_object.$data.speed * 1000 - 1020, true);
                    // setTimeout(() => {
                    //     document.getElementById('role_image').setAttribute('src', 'statics/images/shime12.png');
                    // }, this.vue_object.$data.speed * 1000);
                }, 500);
            }, this.vue_object.$data.speed * 1000);
        }, 520);
    }

    /**
     * 到右边屏幕随机位置攀爬
     */
    random_climb_right() {
        this.vue_object.$data.now_called = 'random_climb_right';
        // this.flip_role('right');
        this.random_climb('right');
        // this.break_now_and_play('walk', 1, 0, true);
        // this.set_pos('x', window.innerWidth - 64);
        // setTimeout(() => {
        //     this.flip_role('right');
        //     this.break_now_and_play('climb_left');
        //     setTimeout(() => {
        //         this.random_pos('y');
        //         this.break_now_and_play('climb_left', 1, this.vue_object.$data.speed * 1000, true);
        //         setTimeout(() => {
        //             document.getElementById('role_image').setAttribute('src', 'statics/images/shime12.png');
        //         }, this.vue_object.$data.speed * 1000);
        //     }, 2000);
        // }, this.vue_object.$data.speed * 1000);
    }

    /**
     * 在地面的角色随机移动
     * @returns {Promise<void>}
     */
    random_walk() {
        this.vue_object.$data.now_called = 'random_walk';
        this.vue_object.$data.is_playing_function = this.is_playing_function = true;
        if (this.vue_object.y_pos !== 0) {
            this.break_now_and_play('climb_left', 1, 0, true);
            this.set_pos('y', 0);
        } else {
            this.vue_object.$data.speed = 0;
        }
        setTimeout(() => {
            this.break_now_and_play('walk', 1, 0, true);
            this.random_pos('x');
            setTimeout(() => {
                this.break_now_and_play('stand');
                this.vue_object.$data.is_playing_function = this.is_playing_function = false;
                this.vue_object.$data.now_called = '';
            }, this.vue_object.$data.speed * 1000);
        }, this.vue_object.$data.speed * 1000);
    }

    random_sit() {
        this.vue_object.$data.now_called = 'random_sit';
        this.vue_object.$data.is_playing_function = this.is_playing_function = true;
        if (this.vue_object.y_pos !== 0) {
            this.break_now_and_play('climb_left', 1, 0, true);
            this.set_pos('y', 0);
        } else {
            this.vue_object.$data.speed = 0;
        }
        setTimeout(() => {
            this.break_now_and_play('walk', 1, 0, true);
            this.random_pos('x');
            setTimeout(() => {
                this.break_now_and_play('sit');
                this.vue_object.$data.is_playing_function = this.is_playing_function = false;
                this.vue_object.$data.now_called = '';
            }, this.vue_object.$data.speed * 1000);
        }, this.vue_object.$data.speed * 1000);
    }

    random_sing() {
        this.vue_object.$data.now_called = 'random_sing';
        this.vue_object.$data.is_playing_function = this.is_playing_function = true;
        if (this.vue_object.y_pos !== 0) {
            this.break_now_and_play('climb_left', 1, 0, true);
            this.set_pos('y', 0);
        } else {
            this.vue_object.$data.speed = 0;
        }
        setTimeout(() => {
            this.break_now_and_play('walk', 1, 0, true);
            this.random_pos('x');
            setTimeout(() => {
                this.break_now_and_play('sing', 10);
                setTimeout(() => {
                    this.break_now_and_play('stand');
                    this.vue_object.$data.is_playing_function = this.is_playing_function = false;
                    this.vue_object.$data.now_called = '';
                }, 7000);
            }, this.vue_object.$data.speed * 1000);
        }, this.vue_object.$data.speed * 1000);
    }

    random_prostrate() {
        this.vue_object.$data.now_called = 'random_prostrate';
        this.vue_object.$data.is_playing_function = this.is_playing_function = true;
        if (this.vue_object.y_pos !== 0) {
            this.break_now_and_play('climb_left', 1, 0, true);
            this.set_pos('y', 0);
        } else {
            this.vue_object.$data.speed = 0;
        }
        setTimeout(() => {
            this.is_reverse = false;
            this.break_now_and_play('prostrate', 1, 0, true);
            this.random_pos('x');
            setTimeout(() => {
                this.break_now_and_play('prostrate');
                this.vue_object.$data.is_playing_function = this.is_playing_function = false;
                this.vue_object.$data.now_called = '';
            }, this.vue_object.$data.speed * 1000);
        }, this.vue_object.$data.speed * 1000);
    }


}
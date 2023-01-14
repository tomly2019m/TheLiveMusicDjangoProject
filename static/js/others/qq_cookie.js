function ae(e, t) {
    if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
}

function ue(e, t) {
    for (var n = 0; n < t.length; n++) {
        var r = t[n];
        r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
    }
}

function le(e, t, n) {
    return t && ue(e.prototype, t), n && ue(e, n), e
}

function ce(e, t, n) {
    return t in e ? Object.defineProperty(e, t, {
        value: n, enumerable: !0, configurable: !0, writable: !0
    }) : e[t] = n, e
}

function se(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t && (r = r.filter((function (t) {
            return Object.getOwnPropertyDescriptor(e, t).enumerable
        }))), n.push.apply(n, r)
    }
    return n
}

function fe(e) {
    for (var t = 1; t < arguments.length; t++) {
        var n = null != arguments[t] ? arguments[t] : {};
        t % 2 ? se(Object(n), !0).forEach((function (t) {
            ce(e, t, n[t])
        })) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : se(Object(n)).forEach((function (t) {
            Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t))
        }))
    }
    return e
}

function pe(e, t) {
    return function (e) {
        if (Array.isArray(e)) return e
    }(e) || function (e, t) {
        if ("undefined" === typeof Symbol || !(Symbol.iterator in Object(e))) return;
        var n = [], r = !0, i = !1, o = void 0;
        try {
            for (var a, u = e[Symbol.iterator](); !(r = (a = u.next()).done) && (n.push(a.value), !t || n.length !== t); r = !0) ;
        } catch (l) {
            i = !0, o = l
        } finally {
            try {
                r || null == u.return || u.return()
            } finally {
                if (i) throw o
            }
        }
        return n
    }(e, t) || he(e, t) || function () {
        throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
    }()
}

function de(e) {
    return function (e) {
        if (Array.isArray(e)) return ve(e)
    }(e) || function (e) {
        if ("undefined" !== typeof Symbol && Symbol.iterator in Object(e)) return Array.from(e)
    }(e) || he(e) || function () {
        throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
    }()
}

function he(e, t) {
    if (e) {
        if ("string" === typeof e) return ve(e, t);
        var n = Object.prototype.toString.call(e).slice(8, -1);
        return "Object" === n && e.constructor && (n = e.constructor.name), "Map" === n || "Set" === n ? Array.from(e) : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ve(e, t) : void 0
    }
}

function ve(e, t) {
    (null == t || t > e.length) && (t = e.length);
    for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
    return r
}

var me = function () {
    function e() {
        ae(this, e), ce(this, "i", void 0), ce(this, "j", void 0), ce(this, "S", void 0), this.i = 0, this.j = 0, this.S = []
    }

    return le(e, [{
        key: "init", value: function (e) {
            var t, n, r;
            for (t = 0; t < 256; ++t) this.S[t] = t;
            for (n = 0, t = 0; t < 256; ++t) n = n + this.S[t] + e[t % e.length] & 255, r = this.S[t], this.S[t] = this.S[n], this.S[n] = r;
            this.i = 0, this.j = 0
        }
    }, {
        key: "next", value: function () {
            this.i = this.i + 1 & 255, this.j = this.j + this.S[this.i] & 255;
            var e = this.S[this.i];
            return this.S[this.i] = this.S[this.j], this.S[this.j] = e, this.S[e + this.S[this.i] & 255]
        }
    }]), e
}();
var ge, ye, be = [], we = 0;
if (null !== (ge = window.crypto) && void 0 !== ge && ge.getRandomValues) {
    var xe, Ee = new Uint32Array(256);
    for (window.crypto.getRandomValues(Ee), xe = 0; xe < Ee.length; ++xe) be[we++] = 255 & Ee[xe]
}

function Se() {
    if (null === ye || void 0 === ye) {
        for (ye = new me; we < 256;) {
            var e = Math.floor(65536 * Math.random());
            be[we++] = 255 & e
        }
        for (ye.init(be), we = 0; we < be.length; ++we) be[we] = 0;
        we = 0
    }
    return ye.next()
}

var ke = function () {
        function e() {
            ae(this, e)
        }

        return le(e, [{
            key: "nextBytes", value: function (e) {
                for (var t = 0; t < e.length; ++t) e[t] = Se()
            }
        }]), e
    }(),
    _e = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

function Te(e) {
    return "string" === typeof e && _e.test(e)
}

for (var Oe = [], Ae = 0; Ae < 256; ++Ae) Oe.push((Ae + 256).toString(16).substr(1));

function Pe() {
    var e = new ke, t = new Array(16);
    return e.nextBytes(t), t[6] = 15 & t[6] | 64, t[8] = 63 & t[8] | 128, function (e) {
        var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0,
            n = "".concat(Oe[e[t + 0]] + Oe[e[t + 1]] + Oe[e[t + 2]] + Oe[e[t + 3]], "-").concat(Oe[e[t + 4]]).concat(Oe[e[t + 5]], "-").concat(Oe[e[t + 6]]).concat(Oe[e[t + 7]], "-").concat(Oe[e[t + 8]]).concat(Oe[e[t + 9]], "-").concat(Oe[e[t + 10]]).concat(Oe[e[t + 11]]).concat(Oe[e[t + 12]]).concat(Oe[e[t + 13]]).concat(Oe[e[t + 14]]).concat(Oe[e[t + 15]]).toLowerCase();
        if (!Te(n)) throw TypeError("Stringified UUID is invalid");
        return n
    }(t)
}

var ht, vt, mt, gt = function (e, t, n) {
    var r = pt(e) || "";
    return r || (r += t(),
        ft({
            name: e,
            date: n,
            value: r,
            domain: 'dt(Re.hostname)'
        })),
        r
}, yt = function () {
    var e = (new Date).getUTCMilliseconds()
        , t = Math.round(2147483647 * Math.abs(Math.random() - 1)) * e % 1e10;
    return "".concat(t)
}, pgv_pvid = function () {
    return gt("pgv_pvid", yt, "Mon, 18 Jan 2038 00:00:00 GMT")
}, fqm_pvqid = function () {
    return gt("fqm_pvqid", Pe, "Mon, 18 Jan 2038 00:00:00 GMT")
}, fqm_sessionid = function () {
    return gt("fqm_sessionid", Pe)
}
var pt = function (e) {
    if ("undefined" === typeof document)
        return "";
    var t = document.cookie.match(RegExp("(^|;\\s*)".concat(e, "=([^;]*)(;|$)")));
    return function (e) {
        var t = e;
        if (!t)
            return t;
        t !== decodeURIComponent(t) && (t = decodeURIComponent(t));
        for (var n = ["<", ">", "'", '"', "%3c", "%3e", "%27", "%22", "%253c", "%253e", "%2527", "%2522"], r = ["&#x3c;", "&#x3e;", "&#x27;", "&#x22;", "%26%23x3c%3B", "%26%23x3e%3B", "%26%23x27%3B", "%26%23x22%3B", "%2526%2523x3c%253B", "%2526%2523x3e%253B", "%2526%2523x27%253B", "%2526%2523x22%253B"], i = 0; i < n.length; i += 1)
            t = t.replace(new RegExp(n[i], "gi"), r[i]);
        return t
    }(t ? decodeURIComponent(t[2]) : "")
}
var ft = function (e) {
    var t = e.name
        , n = e.value
        , r = e.domain
        , i = e.path
        , o = void 0 === i ? "/" : i
        , a = e.hour
        , u = e.date;
    // if ("undefined" !== typeof document) {
    //     var l;
    //     (a || u) && (l = "string" === typeof u ? new Date(u) : new Date,
    //     a && l.setTime(l.getTime() + 36e5 * a));
    //     var c = "";
    //     l && (c = "expires=".concat(l.toUTCString(), ";")),
    //         document.cookie = "".concat(t, "=").concat(n, ";").concat(c, "domain=").concat(st(r) ? Re.host : r, ";path=").concat(o, ";")
    // }
}

console.log('fqm_sessionid: %s \nfqm_pvqid: %s \npgv_pvid: %s' , fqm_sessionid(), fqm_pvqid(), pgv_pvid())
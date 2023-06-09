!function (e, t) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : (e = e || self).trianglify = t()
}(this, (function () {
    "use strict";
    const e = Math.pow(2, -52), t = new Uint32Array(512);

    class r {
        static from(e, t = u, n = s) {
            const a = e.length, f = new Float64Array(2 * a);
            for (let r = 0; r < a; r++) {
                const a = e[r];
                f[2 * r] = t(a), f[2 * r + 1] = n(a)
            }
            return new r(f)
        }

        constructor(e) {
            const t = e.length >> 1;
            if (t > 0 && "number" != typeof e[0]) throw new Error("Expected coords to contain numbers.");
            this.coords = e;
            const r = Math.max(2 * t - 5, 0);
            this._triangles = new Uint32Array(3 * r), this._halfedges = new Int32Array(3 * r), this._hashSize = Math.ceil(Math.sqrt(t)), this._hullPrev = new Uint32Array(t), this._hullNext = new Uint32Array(t), this._hullTri = new Uint32Array(t), this._hullHash = new Int32Array(this._hashSize).fill(-1), this._ids = new Uint32Array(t), this._dists = new Float64Array(t), this.update()
        }

        update() {
            const {coords: t, _hullPrev: r, _hullNext: a, _hullTri: o, _hullHash: l} = this, u = t.length >> 1;
            let s = 1 / 0, d = 1 / 0, h = -1 / 0, b = -1 / 0;
            for (let e = 0; e < u; e++) {
                const r = t[2 * e], n = t[2 * e + 1];
                r < s && (s = r), n < d && (d = n), r > h && (h = r), n > b && (b = n), this._ids[e] = e
            }
            const p = (s + h) / 2, g = (d + b) / 2;
            let v, y, m, w = 1 / 0;
            for (let e = 0; e < u; e++) {
                const r = n(p, g, t[2 * e], t[2 * e + 1]);
                r < w && (v = e, w = r)
            }
            const k = t[2 * v], _ = t[2 * v + 1];
            w = 1 / 0;
            for (let e = 0; e < u; e++) {
                if (e === v) continue;
                const r = n(k, _, t[2 * e], t[2 * e + 1]);
                r < w && r > 0 && (y = e, w = r)
            }
            let M = t[2 * y], x = t[2 * y + 1], N = 1 / 0;
            for (let e = 0; e < u; e++) {
                if (e === v || e === y) continue;
                const r = i(k, _, M, x, t[2 * e], t[2 * e + 1]);
                r < N && (m = e, N = r)
            }
            let S = t[2 * m], P = t[2 * m + 1];
            if (N === 1 / 0) {
                for (let e = 0; e < u; e++) this._dists[e] = t[2 * e] - t[0] || t[2 * e + 1] - t[1];
                c(this._ids, this._dists, 0, u - 1);
                const e = new Uint32Array(u);
                let r = 0;
                for (let t = 0, n = -1 / 0; t < u; t++) {
                    const a = this._ids[t];
                    this._dists[a] > n && (e[r++] = a, n = this._dists[a])
                }
                return this.hull = e.subarray(0, r), this.triangles = new Uint32Array(0), void (this.halfedges = new Uint32Array(0))
            }
            if (f(k, _, M, x, S, P)) {
                const e = y, t = M, r = x;
                y = m, M = S, x = P, m = e, S = t, P = r
            }
            const A = function (e, t, r, n, a, f) {
                const o = r - e, i = n - t, c = a - e, l = f - t, u = o * o + i * i, s = c * c + l * l,
                    d = .5 / (o * l - i * c);
                return {x: e + (l * u - i * s) * d, y: t + (o * s - c * u) * d}
            }(k, _, M, x, S, P);
            this._cx = A.x, this._cy = A.y;
            for (let e = 0; e < u; e++) this._dists[e] = n(t[2 * e], t[2 * e + 1], A.x, A.y);
            c(this._ids, this._dists, 0, u - 1), this._hullStart = v;
            let E = 3;
            a[v] = r[m] = y, a[y] = r[v] = m, a[m] = r[y] = v, o[v] = 0, o[y] = 1, o[m] = 2, l.fill(-1), l[this._hashKey(k, _)] = v, l[this._hashKey(M, x)] = y, l[this._hashKey(S, P)] = m, this.trianglesLen = 0, this._addTriangle(v, y, m, -1, -1, -1);
            for (let n, i, c = 0; c < this._ids.length; c++) {
                const u = this._ids[c], s = t[2 * u], d = t[2 * u + 1];
                if (c > 0 && Math.abs(s - n) <= e && Math.abs(d - i) <= e) continue;
                if (n = s, i = d, u === v || u === y || u === m) continue;
                let h = 0;
                for (let e = 0, t = this._hashKey(s, d); e < this._hashSize && (h = l[(t + e) % this._hashSize], -1 === h || h === a[h]); e++) ;
                h = r[h];
                let b, p = h;
                for (; b = a[p], !f(s, d, t[2 * p], t[2 * p + 1], t[2 * b], t[2 * b + 1]);) if (p = b, p === h) {
                    p = -1;
                    break
                }
                if (-1 === p) continue;
                let g = this._addTriangle(p, u, a[p], -1, -1, o[p]);
                o[u] = this._legalize(g + 2), o[p] = g, E++;
                let w = a[p];
                for (; b = a[w], f(s, d, t[2 * w], t[2 * w + 1], t[2 * b], t[2 * b + 1]);) g = this._addTriangle(w, u, b, o[u], -1, o[w]), o[u] = this._legalize(g + 2), a[w] = w, E--, w = b;
                if (p === h) for (; b = r[p], f(s, d, t[2 * b], t[2 * b + 1], t[2 * p], t[2 * p + 1]);) g = this._addTriangle(b, u, p, -1, o[p], o[b]), this._legalize(g + 2), o[b] = g, a[p] = p, E--, p = b;
                this._hullStart = r[u] = p, a[p] = r[w] = u, a[u] = w, l[this._hashKey(s, d)] = u, l[this._hashKey(t[2 * p], t[2 * p + 1])] = p
            }
            this.hull = new Uint32Array(E);
            for (let e = 0, t = this._hullStart; e < E; e++) this.hull[e] = t, t = a[t];
            this.triangles = this._triangles.subarray(0, this.trianglesLen), this.halfedges = this._halfedges.subarray(0, this.trianglesLen)
        }

        _hashKey(e, t) {
            return Math.floor(function (e, t) {
                const r = e / (Math.abs(e) + Math.abs(t));
                return (t > 0 ? 3 - r : 1 + r) / 4
            }(e - this._cx, t - this._cy) * this._hashSize) % this._hashSize
        }

        _legalize(e) {
            const {_triangles: r, _halfedges: n, coords: a} = this;
            let f = 0, i = 0;
            for (; ;) {
                const c = n[e], l = e - e % 3;
                if (i = l + (e + 2) % 3, -1 === c) {
                    if (0 === f) break;
                    e = t[--f];
                    continue
                }
                const u = c - c % 3, s = l + (e + 1) % 3, d = u + (c + 2) % 3, h = r[i], b = r[e], p = r[s], g = r[d];
                if (o(a[2 * h], a[2 * h + 1], a[2 * b], a[2 * b + 1], a[2 * p], a[2 * p + 1], a[2 * g], a[2 * g + 1])) {
                    r[e] = g, r[c] = h;
                    const a = n[d];
                    if (-1 === a) {
                        let t = this._hullStart;
                        do {
                            if (this._hullTri[t] === d) {
                                this._hullTri[t] = e;
                                break
                            }
                            t = this._hullPrev[t]
                        } while (t !== this._hullStart)
                    }
                    this._link(e, a), this._link(c, n[i]), this._link(i, d);
                    const o = u + (c + 1) % 3;
                    f < t.length && (t[f++] = o)
                } else {
                    if (0 === f) break;
                    e = t[--f]
                }
            }
            return i
        }

        _link(e, t) {
            this._halfedges[e] = t, -1 !== t && (this._halfedges[t] = e)
        }

        _addTriangle(e, t, r, n, a, f) {
            const o = this.trianglesLen;
            return this._triangles[o] = e, this._triangles[o + 1] = t, this._triangles[o + 2] = r, this._link(o, n), this._link(o + 1, a), this._link(o + 2, f), this.trianglesLen += 3, o
        }
    }

    function n(e, t, r, n) {
        const a = e - r, f = t - n;
        return a * a + f * f
    }

    function a(e, t, r, n, a, f) {
        const o = (n - t) * (a - e), i = (r - e) * (f - t);
        return Math.abs(o - i) >= 33306690738754716e-32 * Math.abs(o + i) ? o - i : 0
    }

    function f(e, t, r, n, f, o) {
        return (a(f, o, e, t, r, n) || a(e, t, r, n, f, o) || a(r, n, f, o, e, t)) < 0
    }

    function o(e, t, r, n, a, f, o, i) {
        const c = e - o, l = t - i, u = r - o, s = n - i, d = a - o, h = f - i, b = u * u + s * s, p = d * d + h * h;
        return c * (s * p - b * h) - l * (u * p - b * d) + (c * c + l * l) * (u * h - s * d) < 0
    }

    function i(e, t, r, n, a, f) {
        const o = r - e, i = n - t, c = a - e, l = f - t, u = o * o + i * i, s = c * c + l * l,
            d = .5 / (o * l - i * c), h = (l * u - i * s) * d, b = (o * s - c * u) * d;
        return h * h + b * b
    }

    function c(e, t, r, n) {
        if (n - r <= 20) for (let a = r + 1; a <= n; a++) {
            const n = e[a], f = t[n];
            let o = a - 1;
            for (; o >= r && t[e[o]] > f;) e[o + 1] = e[o--];
            e[o + 1] = n
        } else {
            let a = r + 1, f = n;
            l(e, r + n >> 1, a), t[e[r]] > t[e[n]] && l(e, r, n), t[e[a]] > t[e[n]] && l(e, a, n), t[e[r]] > t[e[a]] && l(e, r, a);
            const o = e[a], i = t[o];
            for (; ;) {
                do {
                    a++
                } while (t[e[a]] < i);
                do {
                    f--
                } while (t[e[f]] > i);
                if (f < a) break;
                l(e, a, f)
            }
            e[r + 1] = e[f], e[f] = o, n - a + 1 >= f - r ? (c(e, t, a, n), c(e, t, r, f - 1)) : (c(e, t, r, f - 1), c(e, t, a, n))
        }
    }

    function l(e, t, r) {
        const n = e[t];
        e[t] = e[r], e[r] = n
    }

    function u(e) {
        return e[0]
    }

    function s(e) {
        return e[1]
    }

    "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self && self;
    var d = function (e, t) {
        return e(t = {exports: {}}, t.exports), t.exports
    }((function (e, t) {
        e.exports = function () {
            for (var e = function (e, t, r) {
                return void 0 === t && (t = 0), void 0 === r && (r = 1), e < t ? t : e > r ? r : e
            }, t = {}, r = 0, n = ["Boolean", "Number", "String", "Function", "Array", "Date", "RegExp", "Undefined", "Null"]; r < n.length; r += 1) {
                var a = n[r];
                t["[object " + a + "]"] = a.toLowerCase()
            }
            var f = function (e) {
                return t[Object.prototype.toString.call(e)] || "object"
            }, o = Math.PI, i = {
                clip_rgb: function (t) {
                    t._clipped = !1, t._unclipped = t.slice(0);
                    for (var r = 0; r <= 3; r++) r < 3 ? ((t[r] < 0 || t[r] > 255) && (t._clipped = !0), t[r] = e(t[r], 0, 255)) : 3 === r && (t[r] = e(t[r], 0, 1));
                    return t
                }, limit: e, type: f, unpack: function (e, t) {
                    return void 0 === t && (t = null), e.length >= 3 ? Array.prototype.slice.call(e) : "object" == f(e[0]) && t ? t.split("").filter((function (t) {
                        return void 0 !== e[0][t]
                    })).map((function (t) {
                        return e[0][t]
                    })) : e[0]
                }, last: function (e) {
                    if (e.length < 2) return null;
                    var t = e.length - 1;
                    return "string" == f(e[t]) ? e[t].toLowerCase() : null
                }, PI: o, TWOPI: 2 * o, PITHIRD: o / 3, DEG2RAD: o / 180, RAD2DEG: 180 / o
            }, c = {format: {}, autodetect: []}, l = i.last, u = i.clip_rgb, s = i.type, d = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                var r = this;
                if ("object" === s(e[0]) && e[0].constructor && e[0].constructor === this.constructor) return e[0];
                var n = l(e), a = !1;
                if (!n) {
                    a = !0, c.sorted || (c.autodetect = c.autodetect.sort((function (e, t) {
                        return t.p - e.p
                    })), c.sorted = !0);
                    for (var f = 0, o = c.autodetect; f < o.length; f += 1) {
                        var i = o[f];
                        if (n = i.test.apply(i, e)) break
                    }
                }
                if (!c.format[n]) throw new Error("unknown format: " + e);
                var d = c.format[n].apply(null, a ? e : e.slice(0, -1));
                r._rgb = u(d), 3 === r._rgb.length && r._rgb.push(1)
            };
            d.prototype.toString = function () {
                return "function" == s(this.hex) ? this.hex() : "[" + this._rgb.join(",") + "]"
            };
            var h = d, b = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                return new (Function.prototype.bind.apply(b.Color, [null].concat(e)))
            };
            b.Color = h, b.version = "2.1.0";
            var p = b, g = i.unpack, v = Math.max, y = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                var r = g(e, "rgb"), n = r[0], a = r[1], f = r[2], o = 1 - v(n /= 255, v(a /= 255, f /= 255)),
                    i = o < 1 ? 1 / (1 - o) : 0, c = (1 - n - o) * i, l = (1 - a - o) * i, u = (1 - f - o) * i;
                return [c, l, u, o]
            }, m = i.unpack, w = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                var r = (e = m(e, "cmyk"))[0], n = e[1], a = e[2], f = e[3], o = e.length > 4 ? e[4] : 1;
                return 1 === f ? [0, 0, 0, o] : [r >= 1 ? 0 : 255 * (1 - r) * (1 - f), n >= 1 ? 0 : 255 * (1 - n) * (1 - f), a >= 1 ? 0 : 255 * (1 - a) * (1 - f), o]
            }, k = i.unpack, _ = i.type;
            h.prototype.cmyk = function () {
                return y(this._rgb)
            }, p.cmyk = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                return new (Function.prototype.bind.apply(h, [null].concat(e, ["cmyk"])))
            }, c.format.cmyk = w, c.autodetect.push({
                p: 2, test: function () {
                    for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                    if (e = k(e, "cmyk"), "array" === _(e) && 4 === e.length) return "cmyk"
                }
            });
            var M = i.unpack, x = i.last, N = function (e) {
                    return Math.round(100 * e) / 100
                }, S = function () {
                    for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                    var r = M(e, "hsla"), n = x(e) || "lsa";
                    return r[0] = N(r[0] || 0), r[1] = N(100 * r[1]) + "%", r[2] = N(100 * r[2]) + "%", "hsla" === n || r.length > 3 && r[3] < 1 ? (r[3] = r.length > 3 ? r[3] : 1, n = "hsla") : r.length = 3, n + "(" + r.join(",") + ")"
                }, P = i.unpack, A = function () {
                    for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                    var r = (e = P(e, "rgba"))[0], n = e[1], a = e[2];
                    r /= 255, n /= 255, a /= 255;
                    var f, o, i = Math.min(r, n, a), c = Math.max(r, n, a), l = (c + i) / 2;
                    return c === i ? (f = 0, o = Number.NaN) : f = l < .5 ? (c - i) / (c + i) : (c - i) / (2 - c - i), r == c ? o = (n - a) / (c - i) : n == c ? o = 2 + (a - r) / (c - i) : a == c && (o = 4 + (r - n) / (c - i)), (o *= 60) < 0 && (o += 360), e.length > 3 && void 0 !== e[3] ? [o, f, l, e[3]] : [o, f, l]
                }, E = i.unpack, G = i.last, O = Math.round, R = function () {
                    for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                    var r = E(e, "rgba"), n = G(e) || "rgb";
                    return "hsl" == n.substr(0, 3) ? S(A(r), n) : (r[0] = O(r[0]), r[1] = O(r[1]), r[2] = O(r[2]), ("rgba" === n || r.length > 3 && r[3] < 1) && (r[3] = r.length > 3 ? r[3] : 1, n = "rgba"), n + "(" + r.slice(0, "rgb" === n ? 3 : 4).join(",") + ")")
                }, j = i.unpack, B = Math.round, F = function () {
                    for (var e, t = [], r = arguments.length; r--;) t[r] = arguments[r];
                    var n, a, f, o = (t = j(t, "hsl"))[0], i = t[1], c = t[2];
                    if (0 === i) n = a = f = 255 * c; else {
                        var l = [0, 0, 0], u = [0, 0, 0], s = c < .5 ? c * (1 + i) : c + i - c * i, d = 2 * c - s,
                            h = o / 360;
                        l[0] = h + 1 / 3, l[1] = h, l[2] = h - 1 / 3;
                        for (var b = 0; b < 3; b++) l[b] < 0 && (l[b] += 1), l[b] > 1 && (l[b] -= 1), 6 * l[b] < 1 ? u[b] = d + 6 * (s - d) * l[b] : 2 * l[b] < 1 ? u[b] = s : 3 * l[b] < 2 ? u[b] = d + (s - d) * (2 / 3 - l[b]) * 6 : u[b] = d;
                        n = (e = [B(255 * u[0]), B(255 * u[1]), B(255 * u[2])])[0], a = e[1], f = e[2]
                    }
                    return t.length > 3 ? [n, a, f, t[3]] : [n, a, f, 1]
                }, T = /^rgb\(\s*(-?\d+),\s*(-?\d+)\s*,\s*(-?\d+)\s*\)$/,
                C = /^rgba\(\s*(-?\d+),\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*([01]|[01]?\.\d+)\)$/,
                L = /^rgb\(\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/,
                z = /^rgba\(\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/,
                I = /^hsl\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/,
                q = /^hsla\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/,
                U = Math.round, $ = function (e) {
                    var t;
                    if (e = e.toLowerCase().trim(), c.format.named) try {
                        return c.format.named(e)
                    } catch (e) {
                    }
                    if (t = e.match(T)) {
                        for (var r = t.slice(1, 4), n = 0; n < 3; n++) r[n] = +r[n];
                        return r[3] = 1, r
                    }
                    if (t = e.match(C)) {
                        for (var a = t.slice(1, 5), f = 0; f < 4; f++) a[f] = +a[f];
                        return a
                    }
                    if (t = e.match(L)) {
                        for (var o = t.slice(1, 4), i = 0; i < 3; i++) o[i] = U(2.55 * o[i]);
                        return o[3] = 1, o
                    }
                    if (t = e.match(z)) {
                        for (var l = t.slice(1, 5), u = 0; u < 3; u++) l[u] = U(2.55 * l[u]);
                        return l[3] = +l[3], l
                    }
                    if (t = e.match(I)) {
                        var s = t.slice(1, 4);
                        s[1] *= .01, s[2] *= .01;
                        var d = F(s);
                        return d[3] = 1, d
                    }
                    if (t = e.match(q)) {
                        var h = t.slice(1, 4);
                        h[1] *= .01, h[2] *= .01;
                        var b = F(h);
                        return b[3] = +t[4], b
                    }
                };
            $.test = function (e) {
                return T.test(e) || C.test(e) || L.test(e) || z.test(e) || I.test(e) || q.test(e)
            };
            var D = $, Y = i.type;
            h.prototype.css = function (e) {
                return R(this._rgb, e)
            }, p.css = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                return new (Function.prototype.bind.apply(h, [null].concat(e, ["css"])))
            }, c.format.css = D, c.autodetect.push({
                p: 5, test: function (e) {
                    for (var t = [], r = arguments.length - 1; r-- > 0;) t[r] = arguments[r + 1];
                    if (!t.length && "string" === Y(e) && D.test(e)) return "css"
                }
            });
            var W = i.unpack;
            c.format.gl = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                var r = W(e, "rgba");
                return r[0] *= 255, r[1] *= 255, r[2] *= 255, r
            }, p.gl = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                return new (Function.prototype.bind.apply(h, [null].concat(e, ["gl"])))
            }, h.prototype.gl = function () {
                var e = this._rgb;
                return [e[0] / 255, e[1] / 255, e[2] / 255, e[3]]
            };
            var V = i.unpack, K = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                var r, n = V(e, "rgb"), a = n[0], f = n[1], o = n[2], i = Math.min(a, f, o), c = Math.max(a, f, o),
                    l = c - i, u = 100 * l / 255, s = i / (255 - l) * 100;
                return 0 === l ? r = Number.NaN : (a === c && (r = (f - o) / l), f === c && (r = 2 + (o - a) / l), o === c && (r = 4 + (a - f) / l), (r *= 60) < 0 && (r += 360)), [r, u, s]
            }, H = i.unpack, X = Math.floor, J = function () {
                for (var e, t, r, n, a, f, o = [], i = arguments.length; i--;) o[i] = arguments[i];
                var c, l, u, s = (o = H(o, "hcg"))[0], d = o[1], h = o[2];
                h *= 255;
                var b = 255 * d;
                if (0 === d) c = l = u = h; else {
                    360 === s && (s = 0), s > 360 && (s -= 360), s < 0 && (s += 360);
                    var p = X(s /= 60), g = s - p, v = h * (1 - d), y = v + b * (1 - g), m = v + b * g, w = v + b;
                    switch (p) {
                        case 0:
                            c = (e = [w, m, v])[0], l = e[1], u = e[2];
                            break;
                        case 1:
                            c = (t = [y, w, v])[0], l = t[1], u = t[2];
                            break;
                        case 2:
                            c = (r = [v, w, m])[0], l = r[1], u = r[2];
                            break;
                        case 3:
                            c = (n = [v, y, w])[0], l = n[1], u = n[2];
                            break;
                        case 4:
                            c = (a = [m, v, w])[0], l = a[1], u = a[2];
                            break;
                        case 5:
                            c = (f = [w, v, y])[0], l = f[1], u = f[2]
                    }
                }
                return [c, l, u, o.length > 3 ? o[3] : 1]
            }, Z = i.unpack, Q = i.type;
            h.prototype.hcg = function () {
                return K(this._rgb)
            }, p.hcg = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                return new (Function.prototype.bind.apply(h, [null].concat(e, ["hcg"])))
            }, c.format.hcg = J, c.autodetect.push({
                p: 1, test: function () {
                    for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                    if (e = Z(e, "hcg"), "array" === Q(e) && 3 === e.length) return "hcg"
                }
            });
            var ee = i.unpack, te = i.last, re = Math.round, ne = function () {
                    for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                    var r = ee(e, "rgba"), n = r[0], a = r[1], f = r[2], o = r[3], i = te(e) || "auto";
                    void 0 === o && (o = 1), "auto" === i && (i = o < 1 ? "rgba" : "rgb");
                    var c = (n = re(n)) << 16 | (a = re(a)) << 8 | (f = re(f)), l = "000000" + c.toString(16);
                    l = l.substr(l.length - 6);
                    var u = "0" + re(255 * o).toString(16);
                    switch (u = u.substr(u.length - 2), i.toLowerCase()) {
                        case"rgba":
                            return "#" + l + u;
                        case"argb":
                            return "#" + u + l;
                        default:
                            return "#" + l
                    }
                }, ae = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, fe = /^#?([A-Fa-f0-9]{8}|[A-Fa-f0-9]{4})$/,
                oe = function (e) {
                    if (e.match(ae)) {
                        4 !== e.length && 7 !== e.length || (e = e.substr(1)), 3 === e.length && (e = (e = e.split(""))[0] + e[0] + e[1] + e[1] + e[2] + e[2]);
                        var t = parseInt(e, 16);
                        return [t >> 16, t >> 8 & 255, 255 & t, 1]
                    }
                    if (e.match(fe)) {
                        5 !== e.length && 9 !== e.length || (e = e.substr(1)), 4 === e.length && (e = (e = e.split(""))[0] + e[0] + e[1] + e[1] + e[2] + e[2] + e[3] + e[3]);
                        var r = parseInt(e, 16);
                        return [r >> 24 & 255, r >> 16 & 255, r >> 8 & 255, Math.round((255 & r) / 255 * 100) / 100]
                    }
                    throw new Error("unknown hex color: " + e)
                }, ie = i.type;
            h.prototype.hex = function (e) {
                return ne(this._rgb, e)
            }, p.hex = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                return new (Function.prototype.bind.apply(h, [null].concat(e, ["hex"])))
            }, c.format.hex = oe, c.autodetect.push({
                p: 4, test: function (e) {
                    for (var t = [], r = arguments.length - 1; r-- > 0;) t[r] = arguments[r + 1];
                    if (!t.length && "string" === ie(e) && [3, 4, 5, 6, 7, 8, 9].indexOf(e.length) >= 0) return "hex"
                }
            });
            var ce = i.unpack, le = i.TWOPI, ue = Math.min, se = Math.sqrt, de = Math.acos, he = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                var r, n = ce(e, "rgb"), a = n[0], f = n[1], o = n[2], i = ue(a /= 255, f /= 255, o /= 255),
                    c = (a + f + o) / 3, l = c > 0 ? 1 - i / c : 0;
                return 0 === l ? r = NaN : (r = (a - f + (a - o)) / 2, r /= se((a - f) * (a - f) + (a - o) * (f - o)), r = de(r), o > f && (r = le - r), r /= le), [360 * r, l, c]
            }, be = i.unpack, pe = i.limit, ge = i.TWOPI, ve = i.PITHIRD, ye = Math.cos, me = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                var r, n, a, f = (e = be(e, "hsi"))[0], o = e[1], i = e[2];
                return isNaN(f) && (f = 0), isNaN(o) && (o = 0), f > 360 && (f -= 360), f < 0 && (f += 360), (f /= 360) < 1 / 3 ? n = 1 - ((a = (1 - o) / 3) + (r = (1 + o * ye(ge * f) / ye(ve - ge * f)) / 3)) : f < 2 / 3 ? a = 1 - ((r = (1 - o) / 3) + (n = (1 + o * ye(ge * (f -= 1 / 3)) / ye(ve - ge * f)) / 3)) : r = 1 - ((n = (1 - o) / 3) + (a = (1 + o * ye(ge * (f -= 2 / 3)) / ye(ve - ge * f)) / 3)), [255 * (r = pe(i * r * 3)), 255 * (n = pe(i * n * 3)), 255 * (a = pe(i * a * 3)), e.length > 3 ? e[3] : 1]
            }, we = i.unpack, ke = i.type;
            h.prototype.hsi = function () {
                return he(this._rgb)
            }, p.hsi = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                return new (Function.prototype.bind.apply(h, [null].concat(e, ["hsi"])))
            }, c.format.hsi = me, c.autodetect.push({
                p: 2, test: function () {
                    for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                    if (e = we(e, "hsi"), "array" === ke(e) && 3 === e.length) return "hsi"
                }
            });
            var _e = i.unpack, Me = i.type;
            h.prototype.hsl = function () {
                return A(this._rgb)
            }, p.hsl = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                return new (Function.prototype.bind.apply(h, [null].concat(e, ["hsl"])))
            }, c.format.hsl = F, c.autodetect.push({
                p: 2, test: function () {
                    for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                    if (e = _e(e, "hsl"), "array" === Me(e) && 3 === e.length) return "hsl"
                }
            });
            var xe = i.unpack, Ne = Math.min, Se = Math.max, Pe = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                var r, n, a, f = (e = xe(e, "rgb"))[0], o = e[1], i = e[2], c = Ne(f, o, i), l = Se(f, o, i), u = l - c;
                return a = l / 255, 0 === l ? (r = Number.NaN, n = 0) : (n = u / l, f === l && (r = (o - i) / u), o === l && (r = 2 + (i - f) / u), i === l && (r = 4 + (f - o) / u), (r *= 60) < 0 && (r += 360)), [r, n, a]
            }, Ae = i.unpack, Ee = Math.floor, Ge = function () {
                for (var e, t, r, n, a, f, o = [], i = arguments.length; i--;) o[i] = arguments[i];
                var c, l, u, s = (o = Ae(o, "hsv"))[0], d = o[1], h = o[2];
                if (h *= 255, 0 === d) c = l = u = h; else {
                    360 === s && (s = 0), s > 360 && (s -= 360), s < 0 && (s += 360);
                    var b = Ee(s /= 60), p = s - b, g = h * (1 - d), v = h * (1 - d * p), y = h * (1 - d * (1 - p));
                    switch (b) {
                        case 0:
                            c = (e = [h, y, g])[0], l = e[1], u = e[2];
                            break;
                        case 1:
                            c = (t = [v, h, g])[0], l = t[1], u = t[2];
                            break;
                        case 2:
                            c = (r = [g, h, y])[0], l = r[1], u = r[2];
                            break;
                        case 3:
                            c = (n = [g, v, h])[0], l = n[1], u = n[2];
                            break;
                        case 4:
                            c = (a = [y, g, h])[0], l = a[1], u = a[2];
                            break;
                        case 5:
                            c = (f = [h, g, v])[0], l = f[1], u = f[2]
                    }
                }
                return [c, l, u, o.length > 3 ? o[3] : 1]
            }, Oe = i.unpack, Re = i.type;
            h.prototype.hsv = function () {
                return Pe(this._rgb)
            }, p.hsv = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                return new (Function.prototype.bind.apply(h, [null].concat(e, ["hsv"])))
            }, c.format.hsv = Ge, c.autodetect.push({
                p: 2, test: function () {
                    for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                    if (e = Oe(e, "hsv"), "array" === Re(e) && 3 === e.length) return "hsv"
                }
            });
            var je = 18, Be = .95047, Fe = 1, Te = 1.08883, Ce = .137931034, Le = .206896552, ze = .12841855,
                Ie = .008856452, qe = i.unpack, Ue = Math.pow, $e = function (e) {
                    return (e /= 255) <= .04045 ? e / 12.92 : Ue((e + .055) / 1.055, 2.4)
                }, De = function (e) {
                    return e > Ie ? Ue(e, 1 / 3) : e / ze + Ce
                }, Ye = function (e, t, r) {
                    return e = $e(e), t = $e(t), r = $e(r), [De((.4124564 * e + .3575761 * t + .1804375 * r) / Be), De((.2126729 * e + .7151522 * t + .072175 * r) / Fe), De((.0193339 * e + .119192 * t + .9503041 * r) / Te)]
                }, We = function () {
                    for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                    var r = qe(e, "rgb"), n = r[0], a = r[1], f = r[2], o = Ye(n, a, f), i = o[0], c = o[1], l = o[2],
                        u = 116 * c - 16;
                    return [u < 0 ? 0 : u, 500 * (i - c), 200 * (c - l)]
                }, Ve = i.unpack, Ke = Math.pow, He = function (e) {
                    return 255 * (e <= .00304 ? 12.92 * e : 1.055 * Ke(e, 1 / 2.4) - .055)
                }, Xe = function (e) {
                    return e > Le ? e * e * e : ze * (e - Ce)
                }, Je = function () {
                    for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                    var r, n, a, f = (e = Ve(e, "lab"))[0], o = e[1], i = e[2];
                    return n = (f + 16) / 116, r = isNaN(o) ? n : n + o / 500, a = isNaN(i) ? n : n - i / 200, n = Fe * Xe(n), r = Be * Xe(r), a = Te * Xe(a), [He(3.2404542 * r - 1.5371385 * n - .4985314 * a), He(-.969266 * r + 1.8760108 * n + .041556 * a), He(.0556434 * r - .2040259 * n + 1.0572252 * a), e.length > 3 ? e[3] : 1]
                }, Ze = i.unpack, Qe = i.type;
            h.prototype.lab = function () {
                return We(this._rgb)
            }, p.lab = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                return new (Function.prototype.bind.apply(h, [null].concat(e, ["lab"])))
            }, c.format.lab = Je, c.autodetect.push({
                p: 2, test: function () {
                    for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                    if (e = Ze(e, "lab"), "array" === Qe(e) && 3 === e.length) return "lab"
                }
            });
            var et = i.unpack, tt = i.RAD2DEG, rt = Math.sqrt, nt = Math.atan2, at = Math.round, ft = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                var r = et(e, "lab"), n = r[0], a = r[1], f = r[2], o = rt(a * a + f * f),
                    i = (nt(f, a) * tt + 360) % 360;
                return 0 === at(1e4 * o) && (i = Number.NaN), [n, o, i]
            }, ot = i.unpack, it = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                var r = ot(e, "rgb"), n = r[0], a = r[1], f = r[2], o = We(n, a, f), i = o[0], c = o[1], l = o[2];
                return ft(i, c, l)
            }, ct = i.unpack, lt = i.DEG2RAD, ut = Math.sin, st = Math.cos, dt = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                var r = ct(e, "lch"), n = r[0], a = r[1], f = r[2];
                return isNaN(f) && (f = 0), [n, st(f *= lt) * a, ut(f) * a]
            }, ht = i.unpack, bt = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                var r = (e = ht(e, "lch"))[0], n = e[1], a = e[2], f = dt(r, n, a), o = f[0], i = f[1], c = f[2],
                    l = Je(o, i, c), u = l[0], s = l[1], d = l[2];
                return [u, s, d, e.length > 3 ? e[3] : 1]
            }, pt = i.unpack, gt = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                var r = pt(e, "hcl").reverse();
                return bt.apply(void 0, r)
            }, vt = i.unpack, yt = i.type;
            h.prototype.lch = function () {
                return it(this._rgb)
            }, h.prototype.hcl = function () {
                return it(this._rgb).reverse()
            }, p.lch = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                return new (Function.prototype.bind.apply(h, [null].concat(e, ["lch"])))
            }, p.hcl = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                return new (Function.prototype.bind.apply(h, [null].concat(e, ["hcl"])))
            }, c.format.lch = bt, c.format.hcl = gt, ["lch", "hcl"].forEach((function (e) {
                return c.autodetect.push({
                    p: 2, test: function () {
                        for (var t = [], r = arguments.length; r--;) t[r] = arguments[r];
                        if (t = vt(t, e), "array" === yt(t) && 3 === t.length) return e
                    }
                })
            }));
            var mt = {
                aliceblue: "#f0f8ff",
                antiquewhite: "#faebd7",
                aqua: "#00ffff",
                aquamarine: "#7fffd4",
                azure: "#f0ffff",
                beige: "#f5f5dc",
                bisque: "#ffe4c4",
                black: "#000000",
                blanchedalmond: "#ffebcd",
                blue: "#0000ff",
                blueviolet: "#8a2be2",
                brown: "#a52a2a",
                burlywood: "#deb887",
                cadetblue: "#5f9ea0",
                chartreuse: "#7fff00",
                chocolate: "#d2691e",
                coral: "#ff7f50",
                cornflower: "#6495ed",
                cornflowerblue: "#6495ed",
                cornsilk: "#fff8dc",
                crimson: "#dc143c",
                cyan: "#00ffff",
                darkblue: "#00008b",
                darkcyan: "#008b8b",
                darkgoldenrod: "#b8860b",
                darkgray: "#a9a9a9",
                darkgreen: "#006400",
                darkgrey: "#a9a9a9",
                darkkhaki: "#bdb76b",
                darkmagenta: "#8b008b",
                darkolivegreen: "#556b2f",
                darkorange: "#ff8c00",
                darkorchid: "#9932cc",
                darkred: "#8b0000",
                darksalmon: "#e9967a",
                darkseagreen: "#8fbc8f",
                darkslateblue: "#483d8b",
                darkslategray: "#2f4f4f",
                darkslategrey: "#2f4f4f",
                darkturquoise: "#00ced1",
                darkviolet: "#9400d3",
                deeppink: "#ff1493",
                deepskyblue: "#00bfff",
                dimgray: "#696969",
                dimgrey: "#696969",
                dodgerblue: "#1e90ff",
                firebrick: "#b22222",
                floralwhite: "#fffaf0",
                forestgreen: "#228b22",
                fuchsia: "#ff00ff",
                gainsboro: "#dcdcdc",
                ghostwhite: "#f8f8ff",
                gold: "#ffd700",
                goldenrod: "#daa520",
                gray: "#808080",
                green: "#008000",
                greenyellow: "#adff2f",
                grey: "#808080",
                honeydew: "#f0fff0",
                hotpink: "#ff69b4",
                indianred: "#cd5c5c",
                indigo: "#4b0082",
                ivory: "#fffff0",
                khaki: "#f0e68c",
                laserlemon: "#ffff54",
                lavender: "#e6e6fa",
                lavenderblush: "#fff0f5",
                lawngreen: "#7cfc00",
                lemonchiffon: "#fffacd",
                lightblue: "#add8e6",
                lightcoral: "#f08080",
                lightcyan: "#e0ffff",
                lightgoldenrod: "#fafad2",
                lightgoldenrodyellow: "#fafad2",
                lightgray: "#d3d3d3",
                lightgreen: "#90ee90",
                lightgrey: "#d3d3d3",
                lightpink: "#ffb6c1",
                lightsalmon: "#ffa07a",
                lightseagreen: "#20b2aa",
                lightskyblue: "#87cefa",
                lightslategray: "#778899",
                lightslategrey: "#778899",
                lightsteelblue: "#b0c4de",
                lightyellow: "#ffffe0",
                lime: "#00ff00",
                limegreen: "#32cd32",
                linen: "#faf0e6",
                magenta: "#ff00ff",
                maroon: "#800000",
                maroon2: "#7f0000",
                maroon3: "#b03060",
                mediumaquamarine: "#66cdaa",
                mediumblue: "#0000cd",
                mediumorchid: "#ba55d3",
                mediumpurple: "#9370db",
                mediumseagreen: "#3cb371",
                mediumslateblue: "#7b68ee",
                mediumspringgreen: "#00fa9a",
                mediumturquoise: "#48d1cc",
                mediumvioletred: "#c71585",
                midnightblue: "#191970",
                mintcream: "#f5fffa",
                mistyrose: "#ffe4e1",
                moccasin: "#ffe4b5",
                navajowhite: "#ffdead",
                navy: "#000080",
                oldlace: "#fdf5e6",
                olive: "#808000",
                olivedrab: "#6b8e23",
                orange: "#ffa500",
                orangered: "#ff4500",
                orchid: "#da70d6",
                palegoldenrod: "#eee8aa",
                palegreen: "#98fb98",
                paleturquoise: "#afeeee",
                palevioletred: "#db7093",
                papayawhip: "#ffefd5",
                peachpuff: "#ffdab9",
                peru: "#cd853f",
                pink: "#ffc0cb",
                plum: "#dda0dd",
                powderblue: "#b0e0e6",
                purple: "#800080",
                purple2: "#7f007f",
                purple3: "#a020f0",
                rebeccapurple: "#663399",
                red: "#ff0000",
                rosybrown: "#bc8f8f",
                royalblue: "#4169e1",
                saddlebrown: "#8b4513",
                salmon: "#fa8072",
                sandybrown: "#f4a460",
                seagreen: "#2e8b57",
                seashell: "#fff5ee",
                sienna: "#a0522d",
                silver: "#c0c0c0",
                skyblue: "#87ceeb",
                slateblue: "#6a5acd",
                slategray: "#708090",
                slategrey: "#708090",
                snow: "#fffafa",
                springgreen: "#00ff7f",
                steelblue: "#4682b4",
                tan: "#d2b48c",
                teal: "#008080",
                thistle: "#d8bfd8",
                tomato: "#ff6347",
                turquoise: "#40e0d0",
                violet: "#ee82ee",
                wheat: "#f5deb3",
                white: "#ffffff",
                whitesmoke: "#f5f5f5",
                yellow: "#ffff00",
                yellowgreen: "#9acd32"
            }, wt = i.type;
            h.prototype.name = function () {
                for (var e = ne(this._rgb, "rgb"), t = 0, r = Object.keys(mt); t < r.length; t += 1) {
                    var n = r[t];
                    if (mt[n] === e) return n.toLowerCase()
                }
                return e
            }, c.format.named = function (e) {
                if (e = e.toLowerCase(), mt[e]) return oe(mt[e]);
                throw new Error("unknown color name: " + e)
            }, c.autodetect.push({
                p: 5, test: function (e) {
                    for (var t = [], r = arguments.length - 1; r-- > 0;) t[r] = arguments[r + 1];
                    if (!t.length && "string" === wt(e) && mt[e.toLowerCase()]) return "named"
                }
            });
            var kt = i.unpack, _t = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                var r = kt(e, "rgb"), n = r[0], a = r[1], f = r[2];
                return (n << 16) + (a << 8) + f
            }, Mt = i.type, xt = function (e) {
                if ("number" == Mt(e) && e >= 0 && e <= 16777215) return [e >> 16, e >> 8 & 255, 255 & e, 1];
                throw new Error("unknown num color: " + e)
            }, Nt = i.type;
            h.prototype.num = function () {
                return _t(this._rgb)
            }, p.num = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                return new (Function.prototype.bind.apply(h, [null].concat(e, ["num"])))
            }, c.format.num = xt, c.autodetect.push({
                p: 5, test: function () {
                    for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                    if (1 === e.length && "number" === Nt(e[0]) && e[0] >= 0 && e[0] <= 16777215) return "num"
                }
            });
            var St = i.unpack, Pt = i.type, At = Math.round;
            h.prototype.rgb = function (e) {
                return void 0 === e && (e = !0), !1 === e ? this._rgb.slice(0, 3) : this._rgb.slice(0, 3).map(At)
            }, h.prototype.rgba = function (e) {
                return void 0 === e && (e = !0), this._rgb.slice(0, 4).map((function (t, r) {
                    return r < 3 ? !1 === e ? t : At(t) : t
                }))
            }, p.rgb = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                return new (Function.prototype.bind.apply(h, [null].concat(e, ["rgb"])))
            }, c.format.rgb = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                var r = St(e, "rgba");
                return void 0 === r[3] && (r[3] = 1), r
            }, c.autodetect.push({
                p: 3, test: function () {
                    for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                    if (e = St(e, "rgba"), "array" === Pt(e) && (3 === e.length || 4 === e.length && "number" == Pt(e[3]) && e[3] >= 0 && e[3] <= 1)) return "rgb"
                }
            });
            var Et = Math.log, Gt = function (e) {
                var t, r, n, a = e / 100;
                return a < 66 ? (t = 255, r = -155.25485562709179 - .44596950469579133 * (r = a - 2) + 104.49216199393888 * Et(r), n = a < 20 ? 0 : .8274096064007395 * (n = a - 10) - 254.76935184120902 + 115.67994401066147 * Et(n)) : (t = 351.97690566805693 + .114206453784165 * (t = a - 55) - 40.25366309332127 * Et(t), r = 325.4494125711974 + .07943456536662342 * (r = a - 50) - 28.0852963507957 * Et(r), n = 255), [t, r, n, 1]
            }, Ot = i.unpack, Rt = Math.round, jt = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                for (var r, n = Ot(e, "rgb"), a = n[0], f = n[2], o = 1e3, i = 4e4, c = .4; i - o > c;) {
                    var l = Gt(r = .5 * (i + o));
                    l[2] / l[0] >= f / a ? i = r : o = r
                }
                return Rt(r)
            };
            h.prototype.temp = h.prototype.kelvin = h.prototype.temperature = function () {
                return jt(this._rgb)
            }, p.temp = p.kelvin = p.temperature = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                return new (Function.prototype.bind.apply(h, [null].concat(e, ["temp"])))
            }, c.format.temp = c.format.kelvin = c.format.temperature = Gt;
            var Bt = i.type;
            h.prototype.alpha = function (e, t) {
                return void 0 === t && (t = !1), void 0 !== e && "number" === Bt(e) ? t ? (this._rgb[3] = e, this) : new h([this._rgb[0], this._rgb[1], this._rgb[2], e], "rgb") : this._rgb[3]
            }, h.prototype.clipped = function () {
                return this._rgb._clipped || !1
            }, h.prototype.darken = function (e) {
                void 0 === e && (e = 1);
                var t = this.lab();
                return t[0] -= je * e, new h(t, "lab").alpha(this.alpha(), !0)
            }, h.prototype.brighten = function (e) {
                return void 0 === e && (e = 1), this.darken(-e)
            }, h.prototype.darker = h.prototype.darken, h.prototype.brighter = h.prototype.brighten, h.prototype.get = function (e) {
                var t = e.split("."), r = t[0], n = t[1], a = this[r]();
                if (n) {
                    var f = r.indexOf(n);
                    if (f > -1) return a[f];
                    throw new Error("unknown channel " + n + " in mode " + r)
                }
                return a
            };
            var Ft = i.type, Tt = Math.pow;
            h.prototype.luminance = function (e) {
                if (void 0 !== e && "number" === Ft(e)) {
                    if (0 === e) return new h([0, 0, 0, this._rgb[3]], "rgb");
                    if (1 === e) return new h([255, 255, 255, this._rgb[3]], "rgb");
                    var t = this.luminance(), r = 20, n = function (t, a) {
                        var f = t.interpolate(a, .5, "rgb"), o = f.luminance();
                        return Math.abs(e - o) < 1e-7 || !r-- ? f : o > e ? n(t, f) : n(f, a)
                    }, a = (t > e ? n(new h([0, 0, 0]), this) : n(this, new h([255, 255, 255]))).rgb();
                    return new h(a.concat([this._rgb[3]]))
                }
                return Ct.apply(void 0, this._rgb.slice(0, 3))
            };
            var Ct = function (e, t, r) {
                return .2126 * (e = Lt(e)) + .7152 * (t = Lt(t)) + .0722 * (r = Lt(r))
            }, Lt = function (e) {
                return (e /= 255) <= .03928 ? e / 12.92 : Tt((e + .055) / 1.055, 2.4)
            }, zt = {}, It = i.type, qt = function (e, t, r) {
                void 0 === r && (r = .5);
                for (var n = [], a = arguments.length - 3; a-- > 0;) n[a] = arguments[a + 3];
                var f = n[0] || "lrgb";
                if (zt[f] || n.length || (f = Object.keys(zt)[0]), !zt[f]) throw new Error("interpolation mode " + f + " is not defined");
                return "object" !== It(e) && (e = new h(e)), "object" !== It(t) && (t = new h(t)), zt[f](e, t, r).alpha(e.alpha() + r * (t.alpha() - e.alpha()))
            };
            h.prototype.mix = h.prototype.interpolate = function (e, t) {
                void 0 === t && (t = .5);
                for (var r = [], n = arguments.length - 2; n-- > 0;) r[n] = arguments[n + 2];
                return qt.apply(void 0, [this, e, t].concat(r))
            }, h.prototype.premultiply = function (e) {
                void 0 === e && (e = !1);
                var t = this._rgb, r = t[3];
                return e ? (this._rgb = [t[0] * r, t[1] * r, t[2] * r, r], this) : new h([t[0] * r, t[1] * r, t[2] * r, r], "rgb")
            }, h.prototype.saturate = function (e) {
                void 0 === e && (e = 1);
                var t = this.lch();
                return t[1] += je * e, t[1] < 0 && (t[1] = 0), new h(t, "lch").alpha(this.alpha(), !0)
            }, h.prototype.desaturate = function (e) {
                return void 0 === e && (e = 1), this.saturate(-e)
            };
            var Ut = i.type;
            h.prototype.set = function (e, t, r) {
                void 0 === r && (r = !1);
                var n = e.split("."), a = n[0], f = n[1], o = this[a]();
                if (f) {
                    var i = a.indexOf(f);
                    if (i > -1) {
                        if ("string" == Ut(t)) switch (t.charAt(0)) {
                            case"+":
                            case"-":
                                o[i] += +t;
                                break;
                            case"*":
                                o[i] *= +t.substr(1);
                                break;
                            case"/":
                                o[i] /= +t.substr(1);
                                break;
                            default:
                                o[i] = +t
                        } else {
                            if ("number" !== Ut(t)) throw new Error("unsupported value for Color.set");
                            o[i] = t
                        }
                        var c = new h(o, a);
                        return r ? (this._rgb = c._rgb, this) : c
                    }
                    throw new Error("unknown channel " + f + " in mode " + a)
                }
                return o
            }, zt.rgb = function (e, t, r) {
                var n = e._rgb, a = t._rgb;
                return new h(n[0] + r * (a[0] - n[0]), n[1] + r * (a[1] - n[1]), n[2] + r * (a[2] - n[2]), "rgb")
            };
            var $t = Math.sqrt, Dt = Math.pow;
            zt.lrgb = function (e, t, r) {
                var n = e._rgb, a = n[0], f = n[1], o = n[2], i = t._rgb, c = i[0], l = i[1], u = i[2];
                return new h($t(Dt(a, 2) * (1 - r) + Dt(c, 2) * r), $t(Dt(f, 2) * (1 - r) + Dt(l, 2) * r), $t(Dt(o, 2) * (1 - r) + Dt(u, 2) * r), "rgb")
            }, zt.lab = function (e, t, r) {
                var n = e.lab(), a = t.lab();
                return new h(n[0] + r * (a[0] - n[0]), n[1] + r * (a[1] - n[1]), n[2] + r * (a[2] - n[2]), "lab")
            };
            var Yt = function (e, t, r, n) {
                var a, f, o, i, c, l, u, s, d, b, p, g;
                return "hsl" === n ? (o = e.hsl(), i = t.hsl()) : "hsv" === n ? (o = e.hsv(), i = t.hsv()) : "hcg" === n ? (o = e.hcg(), i = t.hcg()) : "hsi" === n ? (o = e.hsi(), i = t.hsi()) : "lch" !== n && "hcl" !== n || (n = "hcl", o = e.hcl(), i = t.hcl()), "h" === n.substr(0, 1) && (c = (a = o)[0], u = a[1], d = a[2], l = (f = i)[0], s = f[1], b = f[2]), isNaN(c) || isNaN(l) ? isNaN(c) ? isNaN(l) ? g = Number.NaN : (g = l, 1 != d && 0 != d || "hsv" == n || (p = s)) : (g = c, 1 != b && 0 != b || "hsv" == n || (p = u)) : g = c + r * (l > c && l - c > 180 ? l - (c + 360) : l < c && c - l > 180 ? l + 360 - c : l - c), void 0 === p && (p = u + r * (s - u)), new h([g, p, d + r * (b - d)], n)
            }, Wt = function (e, t, r) {
                return Yt(e, t, r, "lch")
            };
            zt.lch = Wt, zt.hcl = Wt, zt.num = function (e, t, r) {
                var n = e.num(), a = t.num();
                return new h(n + r * (a - n), "num")
            }, zt.hcg = function (e, t, r) {
                return Yt(e, t, r, "hcg")
            }, zt.hsi = function (e, t, r) {
                return Yt(e, t, r, "hsi")
            }, zt.hsl = function (e, t, r) {
                return Yt(e, t, r, "hsl")
            }, zt.hsv = function (e, t, r) {
                return Yt(e, t, r, "hsv")
            };
            var Vt = i.clip_rgb, Kt = Math.pow, Ht = Math.sqrt, Xt = Math.PI, Jt = Math.cos, Zt = Math.sin,
                Qt = Math.atan2, er = function (e, t) {
                    for (var r = e.length, n = [0, 0, 0, 0], a = 0; a < e.length; a++) {
                        var f = e[a], o = t[a] / r, i = f._rgb;
                        n[0] += Kt(i[0], 2) * o, n[1] += Kt(i[1], 2) * o, n[2] += Kt(i[2], 2) * o, n[3] += i[3] * o
                    }
                    return n[0] = Ht(n[0]), n[1] = Ht(n[1]), n[2] = Ht(n[2]), n[3] > .9999999 && (n[3] = 1), new h(Vt(n))
                }, tr = i.type, rr = Math.pow, nr = function (e) {
                    var t = "rgb", r = p("#ccc"), n = 0, a = [0, 1], f = [], o = [0, 0], i = !1, c = [], l = !1, u = 0,
                        s = 1, d = !1, h = {}, b = !0, g = 1, v = function (e) {
                            if ((e = e || ["#fff", "#000"]) && "string" === tr(e) && p.brewer && p.brewer[e.toLowerCase()] && (e = p.brewer[e.toLowerCase()]), "array" === tr(e)) {
                                1 === e.length && (e = [e[0], e[0]]), e = e.slice(0);
                                for (var t = 0; t < e.length; t++) e[t] = p(e[t]);
                                f.length = 0;
                                for (var r = 0; r < e.length; r++) f.push(r / (e.length - 1))
                            }
                            return k(), c = e
                        }, y = function (e) {
                            return e
                        }, m = function (e) {
                            return e
                        }, w = function (e, n) {
                            var a, l;
                            if (null == n && (n = !1), isNaN(e) || null === e) return r;
                            l = n ? e : i && i.length > 2 ? function (e) {
                                if (null != i) {
                                    for (var t = i.length - 1, r = 0; r < t && e >= i[r];) r++;
                                    return r - 1
                                }
                                return 0
                            }(e) / (i.length - 2) : s !== u ? (e - u) / (s - u) : 1, l = m(l), n || (l = y(l)), 1 !== g && (l = rr(l, g)), l = o[0] + l * (1 - o[0] - o[1]), l = Math.min(1, Math.max(0, l));
                            var d = Math.floor(1e4 * l);
                            if (b && h[d]) a = h[d]; else {
                                if ("array" === tr(c)) for (var v = 0; v < f.length; v++) {
                                    var w = f[v];
                                    if (l <= w) {
                                        a = c[v];
                                        break
                                    }
                                    if (l >= w && v === f.length - 1) {
                                        a = c[v];
                                        break
                                    }
                                    if (l > w && l < f[v + 1]) {
                                        l = (l - w) / (f[v + 1] - w), a = p.interpolate(c[v], c[v + 1], l, t);
                                        break
                                    }
                                } else "function" === tr(c) && (a = c(l));
                                b && (h[d] = a)
                            }
                            return a
                        }, k = function () {
                            return h = {}
                        };
                    v(e);
                    var _ = function (e) {
                        var t = p(w(e));
                        return l && t[l] ? t[l]() : t
                    };
                    return _.classes = function (e) {
                        if (null != e) {
                            if ("array" === tr(e)) i = e, a = [e[0], e[e.length - 1]]; else {
                                var t = p.analyze(a);
                                i = 0 === e ? [t.min, t.max] : p.limits(t, "e", e)
                            }
                            return _
                        }
                        return i
                    }, _.domain = function (e) {
                        if (!arguments.length) return a;
                        u = e[0], s = e[e.length - 1], f = [];
                        var t = c.length;
                        if (e.length === t && u !== s) for (var r = 0, n = Array.from(e); r < n.length; r += 1) {
                            var o = n[r];
                            f.push((o - u) / (s - u))
                        } else {
                            for (var i = 0; i < t; i++) f.push(i / (t - 1));
                            if (e.length > 2) {
                                var l = e.map((function (t, r) {
                                    return r / (e.length - 1)
                                })), d = e.map((function (e) {
                                    return (e - u) / (s - u)
                                }));
                                d.every((function (e, t) {
                                    return l[t] === e
                                })) || (m = function (e) {
                                    if (e <= 0 || e >= 1) return e;
                                    for (var t = 0; e >= d[t + 1];) t++;
                                    var r = (e - d[t]) / (d[t + 1] - d[t]);
                                    return l[t] + r * (l[t + 1] - l[t])
                                })
                            }
                        }
                        return a = [u, s], _
                    }, _.mode = function (e) {
                        return arguments.length ? (t = e, k(), _) : t
                    }, _.range = function (e, t) {
                        return v(e), _
                    }, _.out = function (e) {
                        return l = e, _
                    }, _.spread = function (e) {
                        return arguments.length ? (n = e, _) : n
                    }, _.correctLightness = function (e) {
                        return null == e && (e = !0), d = e, k(), y = d ? function (e) {
                            for (var t = w(0, !0).lab()[0], r = w(1, !0).lab()[0], n = t > r, a = w(e, !0).lab()[0], f = t + (r - t) * e, o = a - f, i = 0, c = 1, l = 20; Math.abs(o) > .01 && l-- > 0;) n && (o *= -1), o < 0 ? (i = e, e += .5 * (c - e)) : (c = e, e += .5 * (i - e)), a = w(e, !0).lab()[0], o = a - f;
                            return e
                        } : function (e) {
                            return e
                        }, _
                    }, _.padding = function (e) {
                        return null != e ? ("number" === tr(e) && (e = [e, e]), o = e, _) : o
                    }, _.colors = function (t, r) {
                        arguments.length < 2 && (r = "hex");
                        var n = [];
                        if (0 === arguments.length) n = c.slice(0); else if (1 === t) n = [_(.5)]; else if (t > 1) {
                            var f = a[0], o = a[1] - f;
                            n = ar(0, t, !1).map((function (e) {
                                return _(f + e / (t - 1) * o)
                            }))
                        } else {
                            e = [];
                            var l = [];
                            if (i && i.length > 2) for (var u = 1, s = i.length, d = 1 <= s; d ? u < s : u > s; d ? u++ : u--) l.push(.5 * (i[u - 1] + i[u])); else l = a;
                            n = l.map((function (e) {
                                return _(e)
                            }))
                        }
                        return p[r] && (n = n.map((function (e) {
                            return e[r]()
                        }))), n
                    }, _.cache = function (e) {
                        return null != e ? (b = e, _) : b
                    }, _.gamma = function (e) {
                        return null != e ? (g = e, _) : g
                    }, _.nodata = function (e) {
                        return null != e ? (r = p(e), _) : r
                    }, _
                };

            function ar(e, t, r) {
                for (var n = [], a = e < t, f = r ? a ? t + 1 : t - 1 : t, o = e; a ? o < f : o > f; a ? o++ : o--) n.push(o);
                return n
            }

            var fr = function (e) {
                var t, r, n, a, f, o, i;
                if (2 === (e = e.map((function (e) {
                    return new h(e)
                }))).length) t = e.map((function (e) {
                    return e.lab()
                })), f = t[0], o = t[1], a = function (e) {
                    var t = [0, 1, 2].map((function (t) {
                        return f[t] + e * (o[t] - f[t])
                    }));
                    return new h(t, "lab")
                }; else if (3 === e.length) r = e.map((function (e) {
                    return e.lab()
                })), f = r[0], o = r[1], i = r[2], a = function (e) {
                    var t = [0, 1, 2].map((function (t) {
                        return (1 - e) * (1 - e) * f[t] + 2 * (1 - e) * e * o[t] + e * e * i[t]
                    }));
                    return new h(t, "lab")
                }; else if (4 === e.length) {
                    var c;
                    n = e.map((function (e) {
                        return e.lab()
                    })), f = n[0], o = n[1], i = n[2], c = n[3], a = function (e) {
                        var t = [0, 1, 2].map((function (t) {
                            return (1 - e) * (1 - e) * (1 - e) * f[t] + 3 * (1 - e) * (1 - e) * e * o[t] + 3 * (1 - e) * e * e * i[t] + e * e * e * c[t]
                        }));
                        return new h(t, "lab")
                    }
                } else if (5 === e.length) {
                    var l = fr(e.slice(0, 3)), u = fr(e.slice(2, 5));
                    a = function (e) {
                        return e < .5 ? l(2 * e) : u(2 * (e - .5))
                    }
                }
                return a
            }, or = function (e, t, r) {
                if (!or[r]) throw new Error("unknown blend mode " + r);
                return or[r](e, t)
            }, ir = function (e) {
                return function (t, r) {
                    var n = p(r).rgb(), a = p(t).rgb();
                    return p.rgb(e(n, a))
                }
            }, cr = function (e) {
                return function (t, r) {
                    var n = [];
                    return n[0] = e(t[0], r[0]), n[1] = e(t[1], r[1]), n[2] = e(t[2], r[2]), n
                }
            };
            or.normal = ir(cr((function (e) {
                return e
            }))), or.multiply = ir(cr((function (e, t) {
                return e * t / 255
            }))), or.screen = ir(cr((function (e, t) {
                return 255 * (1 - (1 - e / 255) * (1 - t / 255))
            }))), or.overlay = ir(cr((function (e, t) {
                return t < 128 ? 2 * e * t / 255 : 255 * (1 - 2 * (1 - e / 255) * (1 - t / 255))
            }))), or.darken = ir(cr((function (e, t) {
                return e > t ? t : e
            }))), or.lighten = ir(cr((function (e, t) {
                return e > t ? e : t
            }))), or.dodge = ir(cr((function (e, t) {
                return 255 === e || (e = t / 255 * 255 / (1 - e / 255)) > 255 ? 255 : e
            }))), or.burn = ir(cr((function (e, t) {
                return 255 * (1 - (1 - t / 255) / (e / 255))
            })));
            for (var lr = or, ur = i.type, sr = i.clip_rgb, dr = i.TWOPI, hr = Math.pow, br = Math.sin, pr = Math.cos, gr = Math.floor, vr = Math.random, yr = Math.log, mr = Math.pow, wr = Math.floor, kr = Math.abs, _r = function (e, t) {
                void 0 === t && (t = null);
                var r = {min: Number.MAX_VALUE, max: -1 * Number.MAX_VALUE, sum: 0, values: [], count: 0};
                return "object" === f(e) && (e = Object.values(e)), e.forEach((function (e) {
                    t && "object" === f(e) && (e = e[t]), null == e || isNaN(e) || (r.values.push(e), r.sum += e, e < r.min && (r.min = e), e > r.max && (r.max = e), r.count += 1)
                })), r.domain = [r.min, r.max], r.limits = function (e, t) {
                    return Mr(r, e, t)
                }, r
            }, Mr = function (e, t, r) {
                void 0 === t && (t = "equal"), void 0 === r && (r = 7), "array" == f(e) && (e = _r(e));
                var n = e.min, a = e.max, o = e.values.sort((function (e, t) {
                    return e - t
                }));
                if (1 === r) return [n, a];
                var i = [];
                if ("c" === t.substr(0, 1) && (i.push(n), i.push(a)), "e" === t.substr(0, 1)) {
                    i.push(n);
                    for (var c = 1; c < r; c++) i.push(n + c / r * (a - n));
                    i.push(a)
                } else if ("l" === t.substr(0, 1)) {
                    if (n <= 0) throw new Error("Logarithmic scales are only possible for values > 0");
                    var l = Math.LOG10E * yr(n), u = Math.LOG10E * yr(a);
                    i.push(n);
                    for (var s = 1; s < r; s++) i.push(mr(10, l + s / r * (u - l)));
                    i.push(a)
                } else if ("q" === t.substr(0, 1)) {
                    i.push(n);
                    for (var d = 1; d < r; d++) {
                        var h = (o.length - 1) * d / r, b = wr(h);
                        if (b === h) i.push(o[b]); else {
                            var p = h - b;
                            i.push(o[b] * (1 - p) + o[b + 1] * p)
                        }
                    }
                    i.push(a)
                } else if ("k" === t.substr(0, 1)) {
                    var g, v = o.length, y = new Array(v), m = new Array(r), w = !0, k = 0, _ = null;
                    (_ = []).push(n);
                    for (var M = 1; M < r; M++) _.push(n + M / r * (a - n));
                    for (_.push(a); w;) {
                        for (var x = 0; x < r; x++) m[x] = 0;
                        for (var N = 0; N < v; N++) for (var S = o[N], P = Number.MAX_VALUE, A = void 0, E = 0; E < r; E++) {
                            var G = kr(_[E] - S);
                            G < P && (P = G, A = E), m[A]++, y[N] = A
                        }
                        for (var O = new Array(r), R = 0; R < r; R++) O[R] = null;
                        for (var j = 0; j < v; j++) null === O[g = y[j]] ? O[g] = o[j] : O[g] += o[j];
                        for (var B = 0; B < r; B++) O[B] *= 1 / m[B];
                        w = !1;
                        for (var F = 0; F < r; F++) if (O[F] !== _[F]) {
                            w = !0;
                            break
                        }
                        _ = O, ++k > 200 && (w = !1)
                    }
                    for (var T = {}, C = 0; C < r; C++) T[C] = [];
                    for (var L = 0; L < v; L++) T[g = y[L]].push(o[L]);
                    for (var z = [], I = 0; I < r; I++) z.push(T[I][0]), z.push(T[I][T[I].length - 1]);
                    z = z.sort((function (e, t) {
                        return e - t
                    })), i.push(z[0]);
                    for (var q = 1; q < z.length; q += 2) {
                        var U = z[q];
                        isNaN(U) || -1 !== i.indexOf(U) || i.push(U)
                    }
                }
                return i
            }, xr = {
                analyze: _r,
                limits: Mr
            }, Nr = Math.sqrt, Sr = Math.atan2, Pr = Math.abs, Ar = Math.cos, Er = Math.PI, Gr = {
                cool: function () {
                    return nr([p.hsl(180, 1, .9), p.hsl(250, .7, .4)])
                }, hot: function () {
                    return nr(["#000", "#f00", "#ff0", "#fff"]).mode("rgb")
                }
            }, Or = {
                OrRd: ["#fff7ec", "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"],
                PuBu: ["#fff7fb", "#ece7f2", "#d0d1e6", "#a6bddb", "#74a9cf", "#3690c0", "#0570b0", "#045a8d", "#023858"],
                BuPu: ["#f7fcfd", "#e0ecf4", "#bfd3e6", "#9ebcda", "#8c96c6", "#8c6bb1", "#88419d", "#810f7c", "#4d004b"],
                Oranges: ["#fff5eb", "#fee6ce", "#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#a63603", "#7f2704"],
                BuGn: ["#f7fcfd", "#e5f5f9", "#ccece6", "#99d8c9", "#66c2a4", "#41ae76", "#238b45", "#006d2c", "#00441b"],
                YlOrBr: ["#ffffe5", "#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#993404", "#662506"],
                YlGn: ["#ffffe5", "#f7fcb9", "#d9f0a3", "#addd8e", "#78c679", "#41ab5d", "#238443", "#006837", "#004529"],
                Reds: ["#fff5f0", "#fee0d2", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15", "#67000d"],
                RdPu: ["#fff7f3", "#fde0dd", "#fcc5c0", "#fa9fb5", "#f768a1", "#dd3497", "#ae017e", "#7a0177", "#49006a"],
                Greens: ["#f7fcf5", "#e5f5e0", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#006d2c", "#00441b"],
                YlGnBu: ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"],
                Purples: ["#fcfbfd", "#efedf5", "#dadaeb", "#bcbddc", "#9e9ac8", "#807dba", "#6a51a3", "#54278f", "#3f007d"],
                GnBu: ["#f7fcf0", "#e0f3db", "#ccebc5", "#a8ddb5", "#7bccc4", "#4eb3d3", "#2b8cbe", "#0868ac", "#084081"],
                Greys: ["#ffffff", "#f0f0f0", "#d9d9d9", "#bdbdbd", "#969696", "#737373", "#525252", "#252525", "#000000"],
                YlOrRd: ["#ffffcc", "#ffeda0", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#bd0026", "#800026"],
                PuRd: ["#f7f4f9", "#e7e1ef", "#d4b9da", "#c994c7", "#df65b0", "#e7298a", "#ce1256", "#980043", "#67001f"],
                Blues: ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"],
                PuBuGn: ["#fff7fb", "#ece2f0", "#d0d1e6", "#a6bddb", "#67a9cf", "#3690c0", "#02818a", "#016c59", "#014636"],
                Viridis: ["#440154", "#482777", "#3f4a8a", "#31678e", "#26838f", "#1f9d8a", "#6cce5a", "#b6de2b", "#fee825"],
                Spectral: ["#9e0142", "#d53e4f", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#e6f598", "#abdda4", "#66c2a5", "#3288bd", "#5e4fa2"],
                RdYlGn: ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850", "#006837"],
                RdBu: ["#67001f", "#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#f7f7f7", "#d1e5f0", "#92c5de", "#4393c3", "#2166ac", "#053061"],
                PiYG: ["#8e0152", "#c51b7d", "#de77ae", "#f1b6da", "#fde0ef", "#f7f7f7", "#e6f5d0", "#b8e186", "#7fbc41", "#4d9221", "#276419"],
                PRGn: ["#40004b", "#762a83", "#9970ab", "#c2a5cf", "#e7d4e8", "#f7f7f7", "#d9f0d3", "#a6dba0", "#5aae61", "#1b7837", "#00441b"],
                RdYlBu: ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee090", "#ffffbf", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4", "#313695"],
                BrBG: ["#543005", "#8c510a", "#bf812d", "#dfc27d", "#f6e8c3", "#f5f5f5", "#c7eae5", "#80cdc1", "#35978f", "#01665e", "#003c30"],
                RdGy: ["#67001f", "#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#ffffff", "#e0e0e0", "#bababa", "#878787", "#4d4d4d", "#1a1a1a"],
                PuOr: ["#7f3b08", "#b35806", "#e08214", "#fdb863", "#fee0b6", "#f7f7f7", "#d8daeb", "#b2abd2", "#8073ac", "#542788", "#2d004b"],
                Set2: ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f", "#e5c494", "#b3b3b3"],
                Accent: ["#7fc97f", "#beaed4", "#fdc086", "#ffff99", "#386cb0", "#f0027f", "#bf5b17", "#666666"],
                Set1: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33", "#a65628", "#f781bf", "#999999"],
                Set3: ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f"],
                Dark2: ["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02", "#a6761d", "#666666"],
                Paired: ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a", "#ffff99", "#b15928"],
                Pastel2: ["#b3e2cd", "#fdcdac", "#cbd5e8", "#f4cae4", "#e6f5c9", "#fff2ae", "#f1e2cc", "#cccccc"],
                Pastel1: ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6", "#ffffcc", "#e5d8bd", "#fddaec", "#f2f2f2"]
            }, Rr = 0, jr = Object.keys(Or); Rr < jr.length; Rr += 1) {
                var Br = jr[Rr];
                Or[Br.toLowerCase()] = Or[Br]
            }
            var Fr = Or;
            return p.average = function (e, t, r) {
                void 0 === t && (t = "lrgb"), void 0 === r && (r = null);
                var n = e.length;
                r || (r = Array.from(new Array(n)).map((function () {
                    return 1
                })));
                var a = n / r.reduce((function (e, t) {
                    return e + t
                }));
                if (r.forEach((function (e, t) {
                    r[t] *= a
                })), e = e.map((function (e) {
                    return new h(e)
                })), "lrgb" === t) return er(e, r);
                for (var f = e.shift(), o = f.get(t), i = [], c = 0, l = 0, u = 0; u < o.length; u++) if (o[u] = (o[u] || 0) * r[0], i.push(isNaN(o[u]) ? 0 : r[0]), "h" === t.charAt(u) && !isNaN(o[u])) {
                    var s = o[u] / 180 * Xt;
                    c += Jt(s) * r[0], l += Zt(s) * r[0]
                }
                var d = f.alpha() * r[0];
                e.forEach((function (e, n) {
                    var a = e.get(t);
                    d += e.alpha() * r[n + 1];
                    for (var f = 0; f < o.length; f++) if (!isNaN(a[f])) if (i[f] += r[n + 1], "h" === t.charAt(f)) {
                        var u = a[f] / 180 * Xt;
                        c += Jt(u) * r[n + 1], l += Zt(u) * r[n + 1]
                    } else o[f] += a[f] * r[n + 1]
                }));
                for (var b = 0; b < o.length; b++) if ("h" === t.charAt(b)) {
                    for (var p = Qt(l / i[b], c / i[b]) / Xt * 180; p < 0;) p += 360;
                    for (; p >= 360;) p -= 360;
                    o[b] = p
                } else o[b] = o[b] / i[b];
                return d /= n, new h(o, t).alpha(d > .99999 ? 1 : d, !0)
            }, p.bezier = function (e) {
                var t = fr(e);
                return t.scale = function () {
                    return nr(t)
                }, t
            }, p.blend = lr, p.cubehelix = function (e, t, r, n, a) {
                void 0 === e && (e = 300), void 0 === t && (t = -1.5), void 0 === r && (r = 1), void 0 === n && (n = 1), void 0 === a && (a = [0, 1]);
                var f, o = 0;
                "array" === ur(a) ? f = a[1] - a[0] : (f = 0, a = [a, a]);
                var i = function (i) {
                    var c = dr * ((e + 120) / 360 + t * i), l = hr(a[0] + f * i, n),
                        u = (0 !== o ? r[0] + i * o : r) * l * (1 - l) / 2, s = pr(c), d = br(c);
                    return p(sr([255 * (l + u * (-.14861 * s + 1.78277 * d)), 255 * (l + u * (-.29227 * s - .90649 * d)), 255 * (l + u * (1.97294 * s)), 1]))
                };
                return i.start = function (t) {
                    return null == t ? e : (e = t, i)
                }, i.rotations = function (e) {
                    return null == e ? t : (t = e, i)
                }, i.gamma = function (e) {
                    return null == e ? n : (n = e, i)
                }, i.hue = function (e) {
                    return null == e ? r : ("array" === ur(r = e) ? 0 == (o = r[1] - r[0]) && (r = r[1]) : o = 0, i)
                }, i.lightness = function (e) {
                    return null == e ? a : ("array" === ur(e) ? (a = e, f = e[1] - e[0]) : (a = [e, e], f = 0), i)
                }, i.scale = function () {
                    return p.scale(i)
                }, i.hue(r), i
            }, p.mix = p.interpolate = qt, p.random = function () {
                for (var e = "#", t = 0; t < 6; t++) e += "0123456789abcdef".charAt(gr(16 * vr()));
                return new h(e, "hex")
            }, p.scale = nr, p.analyze = xr.analyze, p.contrast = function (e, t) {
                e = new h(e), t = new h(t);
                var r = e.luminance(), n = t.luminance();
                return r > n ? (r + .05) / (n + .05) : (n + .05) / (r + .05)
            }, p.deltaE = function (e, t, r, n) {
                void 0 === r && (r = 1), void 0 === n && (n = 1), e = new h(e), t = new h(t);
                for (var a = Array.from(e.lab()), f = a[0], o = a[1], i = a[2], c = Array.from(t.lab()), l = c[0], u = c[1], s = c[2], d = Nr(o * o + i * i), b = Nr(u * u + s * s), p = f < 16 ? .511 : .040975 * f / (1 + .01765 * f), g = .0638 * d / (1 + .0131 * d) + .638, v = d < 1e-6 ? 0 : 180 * Sr(i, o) / Er; v < 0;) v += 360;
                for (; v >= 360;) v -= 360;
                var y = v >= 164 && v <= 345 ? .56 + Pr(.2 * Ar(Er * (v + 168) / 180)) : .36 + Pr(.4 * Ar(Er * (v + 35) / 180)),
                    m = d * d * d * d, w = Nr(m / (m + 1900)), k = g * (w * y + 1 - w), _ = d - b, M = o - u, x = i - s,
                    N = (f - l) / (r * p), S = _ / (n * g);
                return Nr(N * N + S * S + (M * M + x * x - _ * _) / (k * k))
            }, p.distance = function (e, t, r) {
                void 0 === r && (r = "lab"), e = new h(e), t = new h(t);
                var n = e.get(r), a = t.get(r), f = 0;
                for (var o in n) {
                    var i = (n[o] || 0) - (a[o] || 0);
                    f += i * i
                }
                return Math.sqrt(f)
            }, p.limits = xr.limits, p.valid = function () {
                for (var e = [], t = arguments.length; t--;) e[t] = arguments[t];
                try {
                    return new (Function.prototype.bind.apply(h, [null].concat(e))), !0
                } catch (e) {
                    return !1
                }
            }, p.scales = Gr, p.colors = mt, p.brewer = Fr, p
        }()
    })), h = {
        YlGn: ["#ffffe5", "#f7fcb9", "#d9f0a3", "#addd8e", "#78c679", "#41ab5d", "#238443", "#006837", "#004529"],
        YlGnBu: ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"],
        GnBu: ["#f7fcf0", "#e0f3db", "#ccebc5", "#a8ddb5", "#7bccc4", "#4eb3d3", "#2b8cbe", "#0868ac", "#084081"],
        BuGn: ["#f7fcfd", "#e5f5f9", "#ccece6", "#99d8c9", "#66c2a4", "#41ae76", "#238b45", "#006d2c", "#00441b"],
        PuBuGn: ["#fff7fb", "#ece2f0", "#d0d1e6", "#a6bddb", "#67a9cf", "#3690c0", "#02818a", "#016c59", "#014636"],
        PuBu: ["#fff7fb", "#ece7f2", "#d0d1e6", "#a6bddb", "#74a9cf", "#3690c0", "#0570b0", "#045a8d", "#023858"],
        BuPu: ["#f7fcfd", "#e0ecf4", "#bfd3e6", "#9ebcda", "#8c96c6", "#8c6bb1", "#88419d", "#810f7c", "#4d004b"],
        RdPu: ["#fff7f3", "#fde0dd", "#fcc5c0", "#fa9fb5", "#f768a1", "#dd3497", "#ae017e", "#7a0177", "#49006a"],
        PuRd: ["#f7f4f9", "#e7e1ef", "#d4b9da", "#c994c7", "#df65b0", "#e7298a", "#ce1256", "#980043", "#67001f"],
        OrRd: ["#fff7ec", "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"],
        YlOrRd: ["#ffffcc", "#ffeda0", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#bd0026", "#800026"],
        YlOrBr: ["#ffffe5", "#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#993404", "#662506"],
        Purples: ["#fcfbfd", "#efedf5", "#dadaeb", "#bcbddc", "#9e9ac8", "#807dba", "#6a51a3", "#54278f", "#3f007d"],
        Blues: ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"],
        Greens: ["#f7fcf5", "#e5f5e0", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#006d2c", "#00441b"],
        Oranges: ["#fff5eb", "#fee6ce", "#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#a63603", "#7f2704"],
        Reds: ["#fff5f0", "#fee0d2", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15", "#67000d"],
        Greys: ["#ffffff", "#f0f0f0", "#d9d9d9", "#bdbdbd", "#969696", "#737373", "#525252", "#252525", "#000000"],
        PuOr: ["#7f3b08", "#b35806", "#e08214", "#fdb863", "#fee0b6", "#f7f7f7", "#d8daeb", "#b2abd2", "#8073ac", "#542788", "#2d004b"],
        BrBG: ["#543005", "#8c510a", "#bf812d", "#dfc27d", "#f6e8c3", "#f5f5f5", "#c7eae5", "#80cdc1", "#35978f", "#01665e", "#003c30"],
        PRGn: ["#40004b", "#762a83", "#9970ab", "#c2a5cf", "#e7d4e8", "#f7f7f7", "#d9f0d3", "#a6dba0", "#5aae61", "#1b7837", "#00441b"],
        PiYG: ["#8e0152", "#c51b7d", "#de77ae", "#f1b6da", "#fde0ef", "#f7f7f7", "#e6f5d0", "#b8e186", "#7fbc41", "#4d9221", "#276419"],
        RdBu: ["#67001f", "#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#f7f7f7", "#d1e5f0", "#92c5de", "#4393c3", "#2166ac", "#053061"],
        RdGy: ["#67001f", "#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#ffffff", "#e0e0e0", "#bababa", "#878787", "#4d4d4d", "#1a1a1a"],
        RdYlBu: ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee090", "#ffffbf", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4", "#313695"],
        Spectral: ["#9e0142", "#d53e4f", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#e6f598", "#abdda4", "#66c2a5", "#3288bd", "#5e4fa2"],
        RdYlGn: ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850", "#006837"]
    };

    function b(e, t, r) {
        return t in e ? Object.defineProperty(e, t, {
            value: r,
            enumerable: !0,
            configurable: !0,
            writable: !0
        }) : e[t] = r, e
    }

    const p = "undefined" != typeof window && "undefined" != typeof document, g = p && document,
        v = (e, t = {}, r, n) => {
            const a = n || g.createElementNS("http://www.w3.org/2000/svg", e);
            return Object.keys(t).forEach(e => void 0 !== t[e] && a.setAttribute(e, t[e])), r && r.forEach(e => a.appendChild(e)), a
        }, y = (e, t = {}, r) => ({
            tagName: e,
            attrs: t,
            children: r,
            toString: () => `<${e} ${(e => Object.entries(e).filter(([e, t]) => void 0 !== t).map(([e, t]) => `${e}='${t}'`).join(" "))(t)}>${r ? r.join("") : ""}</${e}>`
        });

    class m {
        constructor(e, t, r) {
            b(this, "_toSVG", (e, t, r = {}) => {
                const n = e, a = {includeNamespace: !0, coordinateDecimals: 1, ...r}, {
                        points: f,
                        opts: o,
                        polys: i
                    } = this, {width: c, height: l} = o,
                    u = a.coordinateDecimals < 0 ? f : f.map(e => e.map(e => +e.toFixed(a.coordinateDecimals))),
                    s = i.map(e => {
                        const t = "M" + e.vertexIndices.map(e => `${u[e][0]},${u[e][1]}`).join("L") + "Z",
                            r = o.strokeWidth > 0;
                        return n("path", {
                            d: t,
                            fill: o.fill ? e.color.css() : void 0,
                            stroke: r ? e.color.css() : void 0,
                            "stroke-width": r ? o.strokeWidth : void 0,
                            "stroke-linejoin": r ? "round" : void 0,
                            "shape-rendering": o.fill ? "crispEdges" : void 0
                        })
                    });
                return n("svg", {
                    xmlns: a.includeNamespace ? "http://www.w3.org/2000/svg" : void 0,
                    width: c,
                    height: l
                }, s, t)
            }), b(this, "toSVGTree", e => this._toSVG(y, null, e)), b(this, "toSVG", p ? (e, t) => this._toSVG(v, e, t) : (e, t) => this.toSVGTree(t)), b(this, "toCanvas", (e, t = {}) => {
                const r = {...{scaling: !!p && "auto", applyCssScaling: !!p}, ...t}, {
                    points: n,
                    polys: a,
                    opts: f
                } = this, o = e || (i = f.width, c = f.height, Object.assign(document.createElement("canvas"), {
                    width: i,
                    height: c
                }));
                var i, c;
                const l = o.getContext("2d");
                if (r.scaling) {
                    const e = "auto" === r.scaling ? function (e) {
                        const t = e.webkitBackingStorePixelRatio || e.mozBackingStorePixelRatio || e.msBackingStorePixelRatio || e.oBackingStorePixelRatio || e.backingStorePixelRatio || 1;
                        return ("undefined" != typeof window && window.devicePixelRatio || 1) / t
                    }(l) : r.scaling;
                    1 !== e ? (o.width = f.width * e, o.height = f.height * e, r.applyCssScaling && (o.style.width = f.width + "px", o.style.height = f.height + "px")) : (o.width = f.width, o.height = f.height, r.applyCssScaling && (o.style.width = "", o.style.height = "")), l.scale(e, e)
                }
                const u = (e, t, r) => {
                    const a = e.vertexIndices;
                    l.lineJoin = "round", l.beginPath(), l.moveTo(n[a[0]][0], n[a[0]][1]), l.lineTo(n[a[1]][0], n[a[1]][1]), l.lineTo(n[a[2]][0], n[a[2]][1]), l.closePath(), t && (l.fillStyle = t.color.css(), l.fill()), r && (l.strokeStyle = r.color.css(), l.lineWidth = r.width, l.stroke())
                };
                return f.fill && f.strokeWidth < 1 && a.forEach(e => u(e, null, {
                    color: e.color,
                    width: 2
                })), a.forEach(e => u(e, f.fill && {color: e.color}, f.strokeWidth > 0 && {
                    color: e.color,
                    width: f.strokeWidth
                })), o
            }), this.points = e, this.polys = t, this.opts = r
        }
    }

    function w(e) {
        e || (e = Math.random().toString(36));
        var t = function (e) {
            for (var t = 0, r = 1779033703 ^ e.length; t < e.length; t++) r = (r = Math.imul(r ^ e.charCodeAt(t), 3432918353)) << 13 | r >>> 19;
            return function () {
                return r = Math.imul(r ^ r >>> 16, 2246822507), r = Math.imul(r ^ r >>> 13, 3266489909), (r ^= r >>> 16) >>> 0
            }
        }(e)();
        return function () {
            t = (t |= 0) + 1831565813 | 0;
            var e = Math.imul(t ^ t >>> 15, 1 | t);
            return (((e = e + Math.imul(e ^ e >>> 7, 61 | e) ^ e) ^ e >>> 14) >>> 0) / 4294967296
        }
    }

    const k = (e = .5) => ({
                               xPercent: t,
                               yPercent: r,
                               xScale: n,
                               yScale: a,
                               opts: f
                           }) => d.mix(n(t), a(r), e, f.colorSpace);
    var _ = Object.freeze({
        __proto__: null,
        interpolateLinear: k,
        sparkle: (e = .15) => ({xPercent: t, yPercent: r, xScale: n, yScale: a, opts: f, random: o}) => {
            const i = () => (o() - .5) * e, c = n(t + i()), l = a(r + i());
            return d.mix(c, l, .5, f.colorSpace)
        },
        shadows: (e = .8) => ({xPercent: t, yPercent: r, xScale: n, yScale: a, opts: f, random: o}) => {
            const i = n(t), c = a(r);
            return d.mix(i, c, .5, f.colorSpace).darken(e * o())
        }
    });
    const M = {
        width: 600,
        height: 400,
        cellSize: 75,
        variance: .75,
        seed: null,
        xColors: "random",
        yColors: "match",
        palette: h,
        colorSpace: "lab",
        colorFunction: k(.5),
        fill: !0,
        strokeWidth: 0,
        points: null
    };

    function x(e = {}) {
        Object.keys(e).forEach(e => {
            if (void 0 === M[e]) throw TypeError("Unrecognized option: " + e)
        });
        const t = {...M, ...e};
        if (!(t.height > 0)) throw TypeError("invalid height: " + t.height);
        if (!(t.width > 0)) throw TypeError("invalid width: " + t.width);
        const n = w(t.seed), a = e => {
                switch (!0) {
                    case Array.isArray(e):
                        return e;
                    case!!t.palette[e]:
                        return t.palette[e];
                    case"random" === e:
                        return (() => {
                            if (t.palette instanceof Array) return t.palette[Math.floor(n() * t.palette.length)];
                            const e = Object.keys(t.palette);
                            return t.palette[e[Math.floor(n() * e.length)]]
                        })();
                    default:
                        throw TypeError("Unrecognized color option: " + e)
                }
            }, f = a(t.xColors), o = "match" === t.yColors ? f : a(t.yColors), i = d.scale(f).mode(t.colorSpace),
            c = d.scale(o).mode(t.colorSpace), l = t.points || N(t, n);
        var u = r.from(l).triangles;
        const s = w(t.seed ? t.seed + 42 : null), h = [];
        for (let e = 0; e < u.length; e += 3) {
            const r = [u[e], u[e + 1], u[e + 2]], n = r.map(e => l[e]), {width: a, height: f} = t,
                o = e => Math.max(0, Math.min(1, e)),
                d = {x: ((b = n)[0][0] + b[1][0] + b[2][0]) / 3, y: (b[0][1] + b[1][1] + b[2][1]) / 3}, p = o(d.x / a),
                g = o(d.y / f), v = t.colorFunction({
                    centroid: d,
                    xPercent: p,
                    yPercent: g,
                    vertexIndices: r,
                    vertices: n,
                    xScale: i,
                    yScale: c,
                    points: l,
                    opts: t,
                    random: s
                });
            h.push({vertexIndices: r, centroid: d, color: v})
        }
        var b;
        return new m(l, h, t)
    }

    const N = (e, t) => {
        const {width: r, height: n, cellSize: a, variance: f} = e, o = Math.floor(r / a) + 4, i = Math.floor(n / a) + 4,
            c = (o * a - r) / 2, l = (i * a - n) / 2, u = a * f, s = () => (t() - .5) * u, d = a / 2;
        return Array(o * i).fill(null).map((e, t) => {
            const r = t % o, n = Math.floor(t / o);
            return [r * a - c + d + s(), n * a - l + d + s()]
        })
    };
    return x.utils = {mix: d.mix, colorbrewer: h}, x.colorFunctions = _, x.Pattern = m, x.defaultOptions = M, x
}));
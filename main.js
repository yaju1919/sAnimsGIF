(function() {
    'use strict';
    var h = $("<div>").appendTo($("body")).css({
        "text-align": "center",
        padding: "1em"
    });
    $("<h1>").appendTo(h).text("RPGENのsAnimsをアニメーションGIF化します。");
    $("<h2>").appendTo(h).text("まず画像を取り寄せ、保存してください。");
    var h_pic = $("<div>");
    var input_n = yaju1919.addInputNumber(h,{
        id: "input_n",
        title: "RPGENのsAnims画像を取り寄せる",
        int: true,
        value: "1234",
        min: 1,
        change: function(n){
            var img = new Image();
            img.onerror = function(){
                img.src = 'http://rpgen.us/dq/sAnims/img/404.png';
            };
            img.src = "http://rpgen.pw/dq/sAnims/res/" + n + ".png";
            $(img).appendTo(h_pic.empty());
        }
    });
    h_pic.appendTo(h);
    $("<h2>").appendTo(h).text("保存した画像を読み込んでください。");
    $("<button>").appendTo(h).text("画像選択").click(function(){
        input.click();
    });
    var msg_e = $("<div>").appendTo(h);
    var msg = function(str){
        msg_e.text(str+` (${yaju1919.getTime()})`);
    };
    h.append("<br>");
    var show_rated_size = $("<div>");
    var input_rate = yaju1919.addInputNumber(h,{
        title: "拡大倍率",
        min: 1,
        save: "rate",
        max: 26,
        value: 3,
        change: function(v){
            var size = v * 16;
            show_rated_size.text("拡大後のサイズ:" + size);
            if(option_flag){
                if(!option_flag()){
                    $("#w").add("#h").val(size);
                }
                $("#w").add("#h").trigger("change");
            }
        }
    });
    h.append(show_rated_size).append("<br>");
    var select_mode = yaju1919.addSelect(h,{
        title: "gifの動き方",
        save:  "mode",
        list: {
            "前": 0,
            "後": 1,
            "左": 2,
            "右": 3,
            "時計回り": 4,
            "反時計回り": 5,
        }
    });
    var input_quality = yaju1919.addInputNumber(h,{
        title: "処理速度(1~20)",
        placeholder: "速くなるほど低品質",
        int: true,
        min: 1,
        save: "quality",
        max: 20,
        value: 10,
    });
    var input_color = $("<input>",{type:"color"}).appendTo($("<div>",{text:"透明色の設定:"}).appendTo(h));
    h.append("<br>");
    var option_flag = yaju1919.addHideArea(h,{
        title: "オプション機能",
        id2: "opt",
        save: "opt"
    });
    $("#opt").append("<br>");
    $("<div>").text("透明背景のサイズ").appendTo("#opt");
    var input_w = yaju1919.addInputNumber("#opt",{
        title: "幅",
        save: "w",
        min: 16,
        value: 16,
        id: "w",
        change: function(v){
            var min = input_rate() * 16;
            if(v < min) return min;
            $("#x").trigger("change");
        }
    });
    var input_h = yaju1919.addInputNumber("#opt",{
        title: "高さ",
        save: "h",
        min: 16,
        value: 16,
        id: "h",
        change: function(v){
            var min = input_rate() * 16;
            if(v < min) return min;
            $("#y").trigger("change");
        }
    });
    $("<div>").text("スプライトの座標").appendTo("#opt");
    var input_x = yaju1919.addInputNumber("#opt",{
        title: "x座標",
        save: "x",
        min: 0,
        value: 0,
        id: "x",
        change: function(v){
            var max = input_w() - input_rate() * 16;
            if(v > max) return max;
        }
    });
    var input_y = yaju1919.addInputNumber("#opt",{
        title: "y座標",
        save: "y",
        min: 0,
        value: 0,
        id: "y",
        change: function(v){
            var max = input_h() - input_rate() * 16;
            if(v > max) return max;
        }
    });
    h.append("<br><br>");
    $("<button>").appendTo(h).text("gif画像化処理を開始").click(makeGIF).css({
        color: "yellow",
        backgroundColor: "red",
    });
    var g_img, g_fileName;
    var h_result = $("<div>").appendTo(h);
    var input = $("<input>").attr({
        type: "file"
    }).change(loadImg);
    function loadImg(e){
        var file = e.target.files[0];
        if(!file) return;
        g_fileName = file.name;
        var blobUrl = window.URL.createObjectURL(file);
        var img = new Image();
        img.onload = function(){
            g_img = img;
            msg("画像の読み込みが完了");
        };
        img.src = blobUrl;
    }
    function makeGIF(){
        var encoder = new GIFEncoder();
        encoder.setRepeat(0); //繰り返し回数 0=無限ループ
        encoder.setDelay(600); //1コマあたりの待機秒数（ミリ秒）
        encoder.setQuality(input_quality()); // 色量子化の品質を設定
        encoder.setTransparent(parseInt(input_color.val().slice(1),16)); // 最後に追加されたフレームと後続のフレームの透明色を設定
        encoder.start()
        var rate = input_rate();
        var cv = $("<canvas>").attr({
            width: input_w(),
            height: input_h()
        });
        var ctx = cv.get(0).getContext('2d');
        // ドットを滑らかにしないおまじない
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;
        //全ての画像をcanvasへ描画
        var sy = 0;
        var mode = select_mode();
        function draw(x, y){
            ctx.clearRect(0, 0, 16 * rate, 16 * rate);
            ctx.fillStyle = input_color.val();
            ctx.fillRect(0, 0, cv.get(0).width, cv.get(0).height);
            ctx.drawImage(g_img, x * 16, y * 16, 16, 16, input_x(), input_y(), 16 * rate, 16 * rate);
            encoder.addFrame(ctx);
        }
        switch(mode){
            case '0': // 前
                draw(0,2);
                draw(1,2);
                break;
            case '1': // 後
                draw(0,0);
                draw(1,0);
                break;
            case '2': // 左
                draw(0,3);
                draw(1,3);
                break;
            case '3': // 右
                draw(0,1);
                draw(1,1);
                break;
            case '4': // 時計回り
                [2,3,0,1].forEach(function(y,i){
                    [1,0,1,0,1].forEach(function(x){
                        draw((x+i)%2,y);
                    });
                });
                break
            case '5': // 反時計回り
                [2,1,0,3].forEach(function(y,i){
                    [1,0,1,0,1].forEach(function(x){
                        draw((x+i)%2,y);
                    });
                });
                break
        }
        encoder.finish();
        h_result.append("<br><br>");
        $("<button>",{text:"ダウンロード"}).click(function(){
            encoder.download(g_fileName.replace(/\..*$/,'') + ".gif");
        }).appendTo(h_result.empty());
        h_result.append("<br>");
        var url = 'data:image/gif;base64,' + encode64(encoder.stream().getData());
        $("<img>",{src:url}).appendTo(h_result);
    }
})();

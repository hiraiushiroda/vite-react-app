//配列　Array(1/19完了)
//1.[]を使って、三人分の名前を１つの箱に入れる
const members = ["後田", "田中", "佐藤","ちいかわ","シーサー"];

//2.0番目を取り出す
console.log(members[4]);

//3.全員の人数を数える
console.log(members.length);
//==========================================
//オブジェクトと配列の組み合わせ(1/19 完了)
const users = [
    { name: "ハチワレ", age: 22 },
    {name: "モモンガ", age: 10 },
    {name: "シーサー", age: 18 }
];

//3番目の人の名前を出す
console.log(users[2].name);
//=========================================
//連想配列の練習(1/19完了)
//データの作成　配列の中に連想配列・プロフィール入れる
const chiikawaFamily = [
    { name: "ちいかわ", type:"くま", level:5 },
    { name: "ハチワレ", type:"ねこ", level:7 },
    { name: "うさき", tyoe:"うさぎ", level:10 },
];
//特定のデータを取り出す
//ハチワレのtypeを出したい
console.log(chiikawaFamily[1].type);

//うさぎのレベルをテンプレートリテラルで出す
console.log(`${chiikawaFamily[2].name}のレベルは${chiikawaFamily[2].level}です`);

//データの追加
//新しいメンバー(連想配列)を配列の最後に追加
chiikawaFamily.push({ name: "ラッコ", type: "ラッコ", level: 20 });

//追加されたか確認する
console.log(chiikawaFamily.length);

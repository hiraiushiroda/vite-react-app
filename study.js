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
//================================================
//配列　復習
//配列の基本
let fruits = ['apple','banana','cherry'];
console.log(fruits[0]);//'apple'
//連想配列の基本
let person = {
    name: 'Baapro',
    age: 60,
    isStudent: false
};
console.log(person.name);//'Baapro'
//===================================
//要素へのアクセス(Baapro参照)1/19
//配列で作成
const arr = [1,2,3,4,5];
//最初の要素(インデックス0)にアクセス
const firstElement = arr[0];
console.log(firstElement);//1
//わざと存在しない要素を指定
const outOfRangeElement = arr[10];
console.log(outOfRangeElement);//undefined
//=========================================
//配列の要素の追加・削除
//pushメソッド
const arr1 = [1,2,3];
arr1.push(4);
console.log(arr1);//[1,2,3,4]

//unshiftメソッド
const arr2 = [1,2,3];
arr2.unshift(0);
console.log(arr2);//[0,1,2,3]

//popメソッド
const arr3 = [1,2,3,4];
arr3.pop();
console.log(arr3);//[1,2,3]

//shiftメソッド
const arr4 = [1,2,3,4]
arr4.shift();
console.log(arr4);//[2,3,4]

//spliceメソッド
const arr5 = [1,2,4,5];
arr5.splice(2,0,3); //インデックス2の位置に要素3を追加
console.log(arr5); //[1,2,3,4,5]

arr5.splice(1,2,6,7); //インデックス1から2要素を削除し、要素6,7を追加
console.log(arr5); //[1、6、7、4、5]
//============================================
//配列の反転、並び替え、結合(1/19)
//配列の反転　reverse
const arr6 = [1,2,3,4,5];
arr6.reverse();
console.log(arr6);//[5,4,3,2,1]

//配列の並び替え(昇順)　sort
const arr7 = [5,3,1,4,2];
arr7.sort();
console.log(arr7);//[1,2,3,4,5]

//配列の並び替え(降順)　sort((a,b) => b - a)
const arr8 = [5,3,1,4,2];
arr8.sort((a,b) => b - a);
console.log(arr8); //[5,4,3,2,1]

//配列の統合　concat
const a = [1, 2];
const b = [3, 4];
const c = a.concat(b); //aとbをくっつけて、新しい箱（c）に入れる
console.log(c); // [1, 2, 3, 4]

//=====================================================
//配列の繰り返し処理(1/19)
//forループ
const items = [1,2,3,4,5];

for(let i = 0;i < items.length;i++){
    console.log(items[i]); //配列の各要素を順番に出力　要素に順番にアクセスする
}
//1/19終了

//1/20 開始
//for...ofループ　インデックスなしで直接的に要素を取る
const items2 = [1,2,3,4,5];
items2.forEach((value,index,array)=> {
    console.log(value); //各要素を順番に出力
});

//forEachメソッド
const items3 = [1,2,3,4,5];
items3.forEach((value, index, array) => {
    console.log(index); //配列の各要素の順番を出力
    console.log(value); //配列の各要素を順番に出力
});
//value:データそのもの　index:部屋番号（0から始まる）　array: 元の配列全体

//map,filter,reduceメソッド
const items4 = [1,2,3,4,5];

const doubled = items4.map(value => value*2);
console.log(doubled); //[2,4,6,8,10]
//mapメソッドは、配列の全要素を加工して新しい配列を作る　
//value => value*2は入った数字を2倍にして返すという意味
//boubled:2倍の（mapメソッドで、元の数字をすべて2倍にした結果を入れる）

const even = items4.filter(value => value % 2 === 0);
console.log(even); //[2,4]
//filterメソッドは条件に合う要素だけを残し、新しい配列を作る　濾過の意味
//value % 2 === 0 は、「2で割った余りが完全に0かどうか」とチェックする
//even:偶数（奇数はodd) 
//filterメソッドで、偶数だけを抜き出した結果を入れる

const sum = items.reduce((accumulator,value) => accumulator + value,0);
console.log(sum); //15
//全員を合わせて一つにする（まとめるという意味）
//accumulator: 合計を入れる箱
//0:初期値　accumulatorに最初に入れる数字

//===========================================================
//配列の検索とフィルタリング(1/20)

//indexOf()メソッド　指定した要素が何番目にあるかを探す
//見つからない場合は-1 ←その項目がリストにあるかチェックできる
//オブジェクトが入った複雑な配列を探すのには不向き
const arr_indexOf = [1,2,3,4,5]
const index = arr_indexOf.indexOf(3);
console.log(index); //2

//findメソッド　条件に合う最初の値を一つだけ取り出す
//Reactでの用途：詳細画面を表示する時（沢山のリストの中からデータを1つ）
//一致する要素がない時はundefined
const arr_find = [1,2,3,4,5];
const found = arr_find.find(value => value > 3);
console.log(found); //4

//findIndexメソッド　条件に合う最初のインデックス(番号)を１つだけ取り出す
//Reactでの用途：配列の中の特定のデータを書き換える時使う(一つのデータが何番目か探す)
const arr_findIndex = [1,2,3,4,5];
const foundIndex = arr_findIndex.findIndex(value => value > 3);
console.log(foundIndex); //3

//filterメソッド　条件に合うものを全て集めて、新しい配列を作る
//Reactでの用途：削除や絞り込みをする
//削除：「削除ボタンが押されたID以外」をfilterで残せば、削除機能
//検索：検索欄に入力した文字が含まれるデータのみfiterで抽出して表示
const arr_filter = [1,2,3,4,5]
const filterd = arr_filter.filter(value => value > 3);
console.log(filterd); //[4,5]

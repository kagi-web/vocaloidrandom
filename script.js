const baseUrl = "https://vocadb.net/api/songs";

document.getElementById("searchBtn").addEventListener("click", search);

async function search() {

  const tag1 = document.getElementById("tag1").value;
  const tag2 = document.getElementById("tag2").value;

  // =====================
  // タグ条件
  // =====================
  let tagQuery = "";
  if (tag1) tagQuery += `tagId[]=${tag1}&`;
  if (tag2 && tag2 !== tag1) tagQuery += `tagId[]=${tag2}&`;

  try {

   
    // totalCount取得
    
  
   
      const countUrl =
      `${baseUrl}?${tagQuery}songTypes=Original&maxResults=1&getTotalCount=true`;

    const countRes = await fetch(countUrl);
    const countData = await countRes.json();
    const totalCount = countData.totalCount;

    /*
    document.getElementById("count").innerText =
      `検索結果: ${totalCount}件`;
    */

    if (totalCount === 0) return; 
    
  
  

    //  最大20件取得
    const limit = totalCount < 20 ? totalCount : 20;

    //  offset（ランダム）
    let offset = 0;
    if (totalCount > 20) {
      offset = Math.floor(Math.random() * (totalCount - 20));
    }


    // データ取得

    const url =
  `${baseUrl}?${tagQuery}songTypes=Original` +
  `&sort=RatingScore` +
  `&start=${offset}&maxResults=${limit}&fields=Artists,PVs,MainPicture`;

    console.log(url);

    const res = await fetch(url);
    const data = await res.json();

    const songs = data.items;

    const targetTypes = [
      "Vocaloid",
      "UTAU",
      "CeVIO",
      "SynthesizerV",
      "VoiSona",
      "Voiceroid",
      "Voicevox"
    ];

    const filteredSongs = songs.filter(song =>
      song.artists?.some(a =>
        a.categories === "Vocalist" &&
        targetTypes.includes(a.artist?.artistType)
      )
    );

    const selected = filteredSongs
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 10);

    // 表示
    const container = document.getElementById("results");
    container.innerHTML = "";

    selected.forEach(song => {

      const title = song.name;

      const artist =
      song.artists?.map(a => a.artist?.name).join(", ") || "不明";

      let youtube = "";
      let nico = "";

      song.pvs?.forEach(pv => {
        if (pv.service === "Youtube" && !youtube) {
          youtube = `https://www.youtube.com/watch?v=${pv.pvId}`;
        }
        if (pv.service === "NicoNicoDouga" && !nico) {
          nico = `https://www.nicovideo.jp/watch/${pv.pvId}`;
        }
      });

      const thumb = song.mainPicture
            ? song.mainPicture.urlOriginal
            : "";

      // リンク生成
      let linksHtml = "";

      if (youtube) {
        linksHtml += `<a href="${youtube}" target="_blank">YouTube</a><br>`;
      }

      if (nico) {
        linksHtml += `<a href="${nico}" target="_blank">ニコニコ</a><br>`;
      }

      if (!youtube && !nico) {
        linksHtml = `<span>URLが見つかりませんでした</span>`;
      }

      const div = document.createElement("div");
      div.className = "card";

      // 曲名リスト作る
      const titles = selected.map(song => song.name);

      // シェア用テキスト
      const shareText = `ボカロランダムメーカーで楽曲をシェアしました\n\n${titles.join("\n")}\nhttps://kagi-web.github.io/vocaloidrandom/?s\n#ボカロランダム10曲 #ボカロ`; 


  div.innerHTML = `
  <div class="row">

    <div class="thumb">
      <img src="${thumb}" onerror="this.src='images/noimage.png'">
    </div>

    <div class="info">
      <div class="title">${title}</div>
      <div class="artist">${artist}</div>
    </div>

    <div class="links">
      ${youtube ? `<a href="${youtube}" target="_blank" class="yt">YouTube</a>` : ""}
      ${nico ? `<a href="${nico}" target="_blank" class="nico">ニコニコ</a>` : ""}
      ${!youtube && !nico ? `<span class="no-link">なし</span>` : ""}
    </div>

  </div>
`;

    const shareArea = document.getElementById("shareArea");
    const shareBtn = document.getElementById("shareBtn");

    // 表示
    shareArea.style.display = "block";

    // クリック時
    shareBtn.onclick = () => {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
      window.open(url, "_blank");
    };

      container.appendChild(div);
    });

  } catch (e) {
    console.error(e);
    alert("エラーが発生しました");
  }
}
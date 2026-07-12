// やまやま牧場：街（ショップ）画面ロジック（枠のみ実装。指示書_ショップ枠実装.md対応）
// 各店舗の実際の購入ロジックは別フェーズ。ここではシート表示と「準備中」ボタンのみ。

const SHOPS = {
  shop_nandemo: {
    nameKey: 'shop_nandemo_name',
    descKey: 'shop_nandemo_desc',
    products: [
      { nameKey: 'product_yukagae_daiko' },
    ],
  },
  shop_juui: {
    nameKey: 'shop_juui_name',
    descKey: 'shop_juui_desc',
    products: [
      { nameKey: 'product_tanetsuke_koukyu' },
      { nameKey: 'product_tanetsuke_futsuu' },
      { nameKey: 'product_tanetsuke_yasui' },
      { nameKey: 'product_byouki_chiryo' },
    ],
  },
  shop_contractor: {
    nameKey: 'shop_contractor_name',
    descKey: 'shop_contractor_desc',
    products: [
      { nameKey: 'product_wrap_wara_6' },
      { nameKey: 'product_wrap_wara_12' },
      { nameKey: 'product_wrap_wara_24' },
    ],
  },
  shop_kensetsu: {
    nameKey: 'shop_kensetsu_name',
    descKey: 'shop_kensetsu_desc',
    products: [
      { nameKey: 'product_mahou_taihisha' },
      { nameKey: 'product_gyusha_kakuchou' },
      { nameKey: 'product_it_catalog', noteKey: 'product_it_catalog_note' },
    ],
  },
  shop_seri: {
    nameKey: 'shop_seri_name',
    descKey: 'shop_seri_desc',
    products: [
      { nameKey: 'product_seri_shuppin' },
      { nameKey: 'product_bogyuu_kounyuu' },
    ],
  },
};

function openShopSheet(shopId) {
  const shop = SHOPS[shopId];
  if (!shop) return;
  document.getElementById('shopName').textContent = t(shop.nameKey);
  document.getElementById('shopDesc').textContent = t(shop.descKey);

  const list = document.getElementById('shopProducts');
  list.innerHTML = '';
  shop.products.forEach(p => {
    const row = document.createElement('div');
    row.className = 'product-row';
    row.innerHTML = `
      <span class="product-name">${t(p.nameKey)}</span>
      <button class="btn-coming-soon" disabled>${t('btn_coming_soon')}</button>
    `;
    list.appendChild(row);
    if (p.noteKey) {
      const note = document.createElement('div');
      note.className = 'product-note';
      note.textContent = t(p.noteKey);
      list.appendChild(note);
    }
  });

  document.getElementById('shopSheetOverlay').classList.add('open');
}

function closeShopSheet() {
  document.getElementById('shopSheetOverlay').classList.remove('open');
}

document.querySelectorAll('.shop-zone').forEach(el => {
  el.addEventListener('click', () => openShopSheet(el.dataset.shop));
});

(async function () {
  await loadDict();
  renderHeader('gameHeader');
  document.getElementById('btn-back').textContent = '← ' + t('btn_go_home');
  document.getElementById('btn-back').addEventListener('click', () => { location.href = 'home.html'; });
  document.getElementById('shopCloseBtn').textContent = t('barn_close_btn');
})();

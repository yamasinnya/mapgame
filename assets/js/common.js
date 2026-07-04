// やまやま牧場：ループ全体の共有セーブ・共通ロジック
const LOOP_SAVE_KEY = 'yamayama_loop_v1';

const LOOP_DEFAULT_STATE = {
  version: 1,
  day: 1,
  cows: [
    {
      id: 'cow_001',
      name: 'ふうか',
      age: 48,          // ゲーム内日数（2歳=48日、1年=24日換算）
      seed: 1234,       // ブチ模様の乱数シード（4桁）
      condition: 6,     // 体調（内部値 1-10）。初期値6＝普通
      quality: 2,       // 品質（1-4）。初期値2＝可。今回は変動ロジックなし
      skill: 'herdboys_eye',
    },
  ],
  money: 0,
  grassStock: 0,  // 探索で集めた草の合計ポイント（翌日の体調変動に使い、アップキープ時に0へリセット）
};

function loadLoopState() {
  try {
    const raw = localStorage.getItem(LOOP_SAVE_KEY);
    if (!raw) return { ...LOOP_DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== LOOP_DEFAULT_STATE.version) return { ...LOOP_DEFAULT_STATE };
    return { ...LOOP_DEFAULT_STATE, ...parsed };
  } catch (e) {
    return { ...LOOP_DEFAULT_STATE };
  }
}

function saveLoopState(state) {
  localStorage.setItem(LOOP_SAVE_KEY, JSON.stringify(state));
}

// 体調（1-10）→ 1日あたりの魔力（探索回数）
// 設計まとめ.md「リソース設計」の表に対応
function conditionToMagic(condition) {
  if (condition >= 9) return 8;
  if (condition >= 7) return 7;
  if (condition >= 5) return 6;
  if (condition >= 3) return 5;
  return 4;
}

function conditionToLabel(condition) {
  if (condition >= 9) return '絶好調';
  if (condition >= 7) return '良好';
  if (condition >= 5) return '普通';
  if (condition >= 3) return '不調';
  return '危険';
}

// 全頭の体調から算出した魔力の合計（現状は1頭のみだが将来の複数頭に備える）
function calcTotalMagic(cows) {
  return cows.reduce((sum, cow) => sum + conditionToMagic(cow.condition), 0);
}

// 通算day(1始まり) → { year, month, half, season }
// 1年=24日、1ヶ月=2日（上旬/下旬）、季節：春3-5月 夏6-8月 秋9-11月 冬12-2月
function formatDate(day) {
  const dayInYear = (day - 1) % 24;
  const year = Math.floor((day - 1) / 24) + 1;
  const month = Math.floor(dayInYear / 2) + 1;
  const half = dayInYear % 2 === 0 ? '上旬' : '下旬';
  let season;
  if (month >= 3 && month <= 5) season = '春';
  else if (month >= 6 && month <= 8) season = '夏';
  else if (month >= 9 && month <= 11) season = '秋';
  else season = '冬';
  return { year, month, half, season, text: `${year}年目　${season}　${month}月${half}` };
}

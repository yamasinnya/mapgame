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
      skill: 'zenno',
      poopCount: 0,      // 💩の数（0〜4）。フェーズ2で増加ロジックを実装予定
      diseaseAlert: false, // 😷アイコン表示フラグ。フェーズ2で発動ロジックを実装予定
    },
  ],
  money: 0,
  grassStock: 0,  // 探索で集めた草の合計ポイント（翌日の体調変動に使い、アップキープ時に0へリセット）
  qualityPoint: 0,  // 薬草（レア）獲得から貯まる品質ポイント（閾値到達でfeeding.htmlにて品質を1段階上げ、0へリセット）
};

// 牛ごとのマージ：skillは常にcommon.js側（開発時のデバッグ差し替え）を優先し、
// それ以外（体調・品質など進行中の値）はセーブ側を優先する。
// これにより「ふうかに持たせるスキルを変える」だけの調整で、既存の進捗（体調・品質・所持金等）を消さずに反映できる。
function mergeCowWithDefault(savedCow, defaultCow) {
  if (!defaultCow) return savedCow; // デフォルトに居ない牛（将来のガチャ牛など）はそのまま
  return { ...defaultCow, ...savedCow, skill: defaultCow.skill };
}

function loadLoopState() {
  try {
    const raw = localStorage.getItem(LOOP_SAVE_KEY);
    if (!raw) return { ...LOOP_DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== LOOP_DEFAULT_STATE.version) return { ...LOOP_DEFAULT_STATE };
    const defaultCowsById = {};
    LOOP_DEFAULT_STATE.cows.forEach(c => { defaultCowsById[c.id] = c; });
    const mergedCows = (parsed.cows || []).map(saved => mergeCowWithDefault(saved, defaultCowsById[saved.id]));
    return { ...LOOP_DEFAULT_STATE, ...parsed, cows: mergedCows };
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

// 品質ポイント→品質変動の閾値（薬草獲得→品質ポイントの経路のみ実装。体調差分経路はスコープ外）
// 将来個別に変える予定のため定数を分けている（現状は全て10）
const QUALITY_THRESHOLD_TO_KA  = 10; // 劣→可
const QUALITY_THRESHOLD_TO_RYO = 10; // 可→良
const QUALITY_THRESHOLD_TO_YU  = 10; // 良→優
function qualityThresholdFor(quality) {
  if (quality === 1) return QUALITY_THRESHOLD_TO_KA;
  if (quality === 2) return QUALITY_THRESHOLD_TO_RYO;
  return QUALITY_THRESHOLD_TO_YU;
}

// 品質（1-4）→ 表示ラベルのt()キー（実際の文字列はja.json経由で取得する）
function qualityToLabelKey(quality) {
  if (quality >= 4) return 'quality_label_yu';
  if (quality === 3) return 'quality_label_ryo';
  if (quality === 2) return 'quality_label_ka';
  return 'quality_label_retsu';
}

// スキルキー→ 絵文字とt()キーの対応（cow.skillの値と一致させること）
const SKILL_DISPLAY = {
  herdboys_eye: { emoji: '👦', nameKey: 'skill_name_herdboys_eye' },
  trace:        { emoji: '🐾', nameKey: 'skill_name_trace' },
  roku:         { emoji: '🔮', nameKey: 'skill_name_roku' },
  zenno:        { emoji: '⛩️', nameKey: 'skill_name_zenno' },
};

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

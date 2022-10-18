import dayjs from "dayjs";

// const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
// const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
// const SIGNS = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'];
export const NUMBERS_ZH = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十','十一','十二'];
export const MONTHS_ZH = ['', '正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
const MILLISECONDS_A_DAY = 86400000;   //  24 * 3600 * 1000

const START_YEAR = 1800;
const START_TIME = +new Date(START_YEAR, 0, 25);  //  1800/1/25 為農曆新年

/**
 * 1800~2100年的陰曆編碼資料，陣列中的每一個元素代表一年
 *
 * 要保存一年的資料，需要兩個資料:
 *
 * 1) 這一年陰曆每個月的大小;
 * 2) 這一年是否有閏月，閏幾月以及閏月的大小。
 *
 * 用一個整數來保存這些資料即可，具體的方法是:
 * 用一個位元來表示一個月的大小，大月記為 1，小月記為 0，
 * 這樣就用掉 12 位元 (無閏月) 或 13 位元 (有閏月)，
 * 再用高四位來表示閏月的月份，沒有閏月為0。
 *
 *  19 18 17 16 15 14 13 12 11 10  9  8  7  6  5  4  3  2  1  0
 * +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
 * |  |  |  |  |--|--|--|  |  |  |  |  |  |  |  |  |  |  |  |  |
 * +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
 *  \         /          \                                    /
 *      閏月                      大月記為 1，小月記為 0
 *    0: 無閏月              1  2  3 ....                    12 月
 * 1~12: 閏幾月           1  2  3 ....                       12 月
 *
 * 例如:
 * - 2000年的 1、2、5、8、10、11月大，其餘月份小
 *   其編碼資料二進位是 1100 1001 0110，以十六進位表示為 0xc96
 * - 2001年的 1、2、4、5、8、10、12月大，其餘月份小，閏 4 月小
 *   其編碼資料二進位是 1 1010 1001 0101 (因為閏月，所以有13位)
 *   以十六進位表示為 0x1a95
 *   加上閏幾月資料，得結果為: 0x40000 + 0x1a95 = 0x41a95
 *
 * @type {Array}
 */
const LUNAR_CODE = [
    267946,1717,698,135862,2359,395822,3350,3659,331090,3497,1461,197997,686,2606,137773,3221,400021,2898,2921,264922,1373,605,201819,2603,464171,2709,2890,333482,2773,1371,263351,599,592471,1323,1685,396693,1450,2741,264813,1198,2647,199253,3370,466218,3413,1450,333146,2397,1198,267435,2637,531050,2857,2901,461525,730,2397,330071,1179,2635,202315,1705,529833,1717,694,332470,2359,1175,265366,3658,662858,3497,1453,394605,686,2350,334125,3221,3402,203594,2921,461530,1371,605,332379,2347,2709,268949,2890,2901,133813,1371,394423,599,1323,333098,3733,1706,202154,2741,526701,1198,2647,330317,3366,3477,265557,1386,2477,133469,1198,398491,2637,3365,334501,2900,3434,135898,2395,461111,1175,2635,333387,1701,1748,267701,694,2391,133423,1175,396438,3402,3749,331177,1453,694,201326,2350,465197,3221,3402,400202,2901,1386,267611,605,2349,137515,2709,464533,1738,2901,330421,1242,2651,199255,1323,529706,3733,1706,398762,2741,1206,267438,2647,1318,204070,3477,461653,1386,2413,330077,1197,2637,268877,3365,531109,2900,2922,398042,2395,1179,267415,2635,661067,1701,1748,398772,2742,2391,330031,1175,1611,200010,3749,527717,1452,2742,332397,2350,3222,268949,3402,3493,133973,1386,464219,605,2349,334123,2709,2890,267946,2773,592565,1210,2651,395863,1323,2707,265877,1706,2773,133557,1206,398510,2638,3366,335142,3411,1450,200042,2413,723293,1197,2637,399947,3365,3410,334676,2906,1389,133467,1179,464023,2635,2725,333477,1746,2778,199350,2359,526639,1175,1611,396618,3749,1706,267628,2734,2350,203054,3222,465557,3402,3493,330581,1386,2669,264797,1325,529707,2709,2890,399018,2773,1370,267450,2651,1323,202023,1683,462419,1706,2773,330165,1206,2647,264782,3350,531750,3410,3498,396650,1389,1198,267421,2605,3349,138021,3410
];

type NMonthData = {
    daysOfMonths:number[],
    leapMonth:number,
    totalDays:number,
    newYear?:number
}
/**
 * 解碼陰曆資料
 * @param  {number} code LUNAR_CODE中的任一個編碼元素
 * @return {Object}      陰曆資料
 */
function decode(code:number):NMonthData{
    const leapMonth = code >> 16;
    const totalMonths = leapMonth ? 13 : 12;
    const daysOfMonths:number[] = [];
    let  totalDays = 0;
    let daysOfMonth;

    for (let i = 0; i < totalMonths; i++) {
        daysOfMonth = code % 2 === 1 ? 30 : 29;
        daysOfMonths.unshift(daysOfMonth);
        totalDays += daysOfMonth;
        code >>= 1;
    }

    return {
        daysOfMonths: daysOfMonths,   // e.g. [30, 29, 30, 30, 29, ..., 30]
        leapMonth: leapMonth,         // 0: 無閏月 1~12 閏一 ~ 閏十二月
        totalDays: totalDays          // 這年的總天數
    };
}

/**
 * 陰曆資料
 * @type {Object}
 */
const LUNAR_DATA = (function () {
    let newYear = START_TIME;
    const lunarData:Record<any, NMonthData> = {};

    LUNAR_CODE.forEach((code,index)=>{
        const data = decode(code);
        data.newYear = newYear;
        newYear += data.totalDays * MILLISECONDS_A_DAY;
        lunarData[START_YEAR + index] = data;
    })

    return lunarData;
}());

const LUNAR_DATE_ZH = (function ():string[] {
    const texts:string[] = [];
    for(let i=1;i<=30;i++){
        const text = i < 11 ? '初' :
            i < 20 ? '十' :
                i < 30 ? '廿' : '三十';

        texts[i-1] = i === 30 ? text : text + NUMBERS_ZH[(i-1) % 10];
    }
    return texts;
}());
/**
 * 转农历数据
 */
export function toNDate(year:number,month:number,date:number) {
    const cdate = dayjs().year(year).month(month).date(date);

    let lyear = year;
    let lmonth = 0;
    let ldate = 0;
    let isLeapMonth = false;

    const data = LUNAR_DATA[lyear];
    //
    // 已過了陽曆年，但尚未過陰曆年
    if (data.newYear && cdate.toDate().getTime() < data.newYear) {
        lyear -= 1;
    }

    const lunarData = LUNAR_DATA[lyear];

    if(lunarData.newYear){
        ldate = Math.floor((cdate.toDate().getTime() -lunarData.newYear) / MILLISECONDS_A_DAY) + 1;
    }

    const {daysOfMonths, leapMonth} = lunarData;

    while (ldate - daysOfMonths[lmonth] > 0) {
        ldate -= daysOfMonths[lmonth];
        lmonth++;
    }

    if (leapMonth) {
        if (lmonth === leapMonth) isLeapMonth = true;
        if (lmonth < leapMonth)   lmonth++;
    } else {
        lmonth++;
    }

    const ldate_zh = LUNAR_DATE_ZH[ldate-1];

    return {
        lyear,
        lmonth,
        lmonth_zh:MONTHS_ZH[lmonth],
        ldate,
        ldate_zh,
        isLeapMonth
    }
}

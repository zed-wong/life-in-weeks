// 20 carefully curated reflections on time, life, and meaning.
// Mixed Western & Eastern voices to match the bilingual audience.

export interface Quote {
    text: string;
    author: string;
    /** Optional — work the quote is from */
    source?: string;
    /** Language hint for typography (Chinese gets a slightly different treatment) */
    lang: 'en' | 'zh' | 'la';
}

export const quotes: Quote[] = [
    {
        text: 'The unexamined life is not worth living.',
        author: 'Socrates',
        lang: 'en'
    },
    {
        text: 'How we spend our days is, of course, how we spend our lives.',
        author: 'Annie Dillard',
        source: 'The Writing Life',
        lang: 'en'
    },
    {
        text: 'Tell me, what is it you plan to do with your one wild and precious life?',
        author: 'Mary Oliver',
        source: 'The Summer Day',
        lang: 'en'
    },
    {
        text: 'All we have to decide is what to do with the time that is given us.',
        author: 'J.R.R. Tolkien',
        source: 'The Fellowship of the Ring',
        lang: 'en'
    },
    {
        text: 'Time is the stuff life is made of.',
        author: 'Benjamin Franklin',
        lang: 'en'
    },
    {
        text: 'Life can only be understood backwards; but it must be lived forwards.',
        author: 'Søren Kierkegaard',
        lang: 'en'
    },
    {
        text: 'We do not remember days, we remember moments.',
        author: 'Cesare Pavese',
        lang: 'en'
    },
    {
        text: 'The two most powerful warriors are patience and time.',
        author: 'Leo Tolstoy',
        source: 'War and Peace',
        lang: 'en'
    },
    {
        text: 'Vita brevis, ars longa. (Life is short, the art long.)',
        author: 'Hippocrates',
        lang: 'la'
    },
    {
        text: 'Waste no more time arguing what a good man should be. Be one.',
        author: 'Marcus Aurelius',
        source: 'Meditations',
        lang: 'en'
    },
    {
        text: 'Each man\u2019s life represents a road toward himself.',
        author: 'Hermann Hesse',
        source: 'Demian',
        lang: 'en'
    },
    {
        text: 'The fear of death follows from the fear of life. A man who lives fully is prepared to die at any time.',
        author: 'Mark Twain',
        lang: 'en'
    },
    {
        text: '逝者如斯夫,不舍昼夜。',
        author: '孔子',
        source: '《论语》',
        lang: 'zh'
    },
    {
        text: '人生天地之间,若白驹之过隙,忽然而已。',
        author: '庄子',
        source: '《知北游》',
        lang: 'zh'
    },
    {
        text: '盛年不重来,一日难再晨。及时当勉励,岁月不待人。',
        author: '陶渊明',
        source: '《杂诗》',
        lang: 'zh'
    },
    {
        text: '千里之行,始于足下。',
        author: '老子',
        source: '《道德经》',
        lang: 'zh'
    },
    {
        text: '少壮不努力,老大徒伤悲。',
        author: '佚名',
        source: '《长歌行》·汉乐府',
        lang: 'zh'
    },
    {
        text: '君不见高堂明镜悲白发,朝如青丝暮成雪。',
        author: '李白',
        source: '《将进酒》',
        lang: 'zh'
    },
    {
        text: '人生代代无穷已,江月年年只相似。',
        author: '张若虚',
        source: '《春江花月夜》',
        lang: 'zh'
    },
    {
        text: '前不见古人,后不见来者。念天地之悠悠,独怆然而涕下。',
        author: '陈子昂',
        source: '《登幽州台歌》',
        lang: 'zh'
    },
    {
        text: 'Forever is composed of nows.',
        author: 'Emily Dickinson',
        lang: 'en'
    },
    {
        text: 'In the depth of winter, I finally learned that within me there lay an invincible summer.',
        author: 'Albert Camus',
        source: 'Return to Tipasa',
        lang: 'en'
    },
    {
        text: 'Twenty years from now you will be more disappointed by the things that you didn\u2019t do than by the ones you did do.',
        author: 'Mark Twain',
        lang: 'en'
    },
    {
        text: 'What is essential is invisible to the eye.',
        author: 'Antoine de Saint-Exup\u00E9ry',
        source: 'The Little Prince',
        lang: 'en'
    },
    {
        text: 'Live as if you were to die tomorrow. Learn as if you were to live forever.',
        author: 'Mahatma Gandhi',
        lang: 'en'
    },
    {
        text: 'Do not go gentle into that good night. Rage, rage against the dying of the light.',
        author: 'Dylan Thomas',
        lang: 'en'
    },
    {
        text: 'We are such stuff as dreams are made on, and our little life is rounded with a sleep.',
        author: 'William Shakespeare',
        source: 'The Tempest',
        lang: 'en'
    },
    {
        text: 'Yesterday is gone. Tomorrow has not yet come. We have only today. Let us begin.',
        author: 'Mother Teresa',
        lang: 'en'
    },
    {
        text: 'Every moment is a fresh beginning.',
        author: 'T.S. Eliot',
        lang: 'en'
    },
    {
        text: 'I am not what happened to me, I am what I choose to become.',
        author: 'Carl Jung',
        lang: 'en'
    },
    {
        text: 'Wherever you go, there you are.',
        author: 'Jon Kabat-Zinn',
        lang: 'en'
    },
    {
        text: 'Carpe diem, quam minimum credula postero. (Seize the day, trust as little as possible in tomorrow.)',
        author: 'Horace',
        source: 'Odes I.11',
        lang: 'la'
    },
    {
        text: '天行健,君子以自强不息。',
        author: '佚名',
        source: '《周易·乾卦》',
        lang: 'zh'
    },
    {
        text: '穷则独善其身,达则兼济天下。',
        author: '孟子',
        source: '《孟子·尽心上》',
        lang: 'zh'
    },
    {
        text: '纸上得来终觉浅,绝知此事要躬行。',
        author: '陆游',
        source: '《冬夜读书示子聿》',
        lang: 'zh'
    },
    {
        text: '回首向来萧瑟处,归去,也无风雨也无晴。',
        author: '苏轼',
        source: '《定风波》',
        lang: 'zh'
    },
    {
        text: '寄蜉蝣于天地,渺沧海之一粟。',
        author: '苏轼',
        source: '《前赤壁赋》',
        lang: 'zh'
    }
];

/** Fisher-Yates shuffle returning a fresh array of indices [0..n-1]. */
export function shuffleIndices(n: number): number[] {
    const a = Array.from({ length: n }, (_, i) => i);
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/**
 * Build a fresh shuffled queue, optionally guaranteeing the first index
 * differs from `avoidFirst` so consecutive cycles don't repeat the same quote.
 */
export function newQueue(avoidFirst: number = -1): number[] {
    if (quotes.length <= 1) return [0];
    let q = shuffleIndices(quotes.length);
    let safety = 8;
    while (q[0] === avoidFirst && safety-- > 0) {
        q = shuffleIndices(quotes.length);
    }
    return q;
}
